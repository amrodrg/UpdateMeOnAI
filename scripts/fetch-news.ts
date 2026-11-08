import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";
import {
  finalizeItems,
  applyTopicFilter,
  mergeItems,
  toNewsItem,
  type CategoryKeywords,
  type NewsItem,
} from "../lib/news-pipeline";

interface SourcesConfig {
  sources: { name: string; feedUrl: string }[];
  categoryKeywords: CategoryKeywords;
  maxAgeDays: number;
  maxItems: number;
}

const root = path.resolve(__dirname, "..");

async function main() {
  const config = JSON.parse(
    await readFile(path.join(root, "sources.json"), "utf8"),
  ) as SourcesConfig;
  const parser = new Parser({ timeout: 15000 });
  const items: NewsItem[] = [];
  let okSources = 0;

  for (const source of config.sources) {
    try {
      const feed = await parser.parseURL(source.feedUrl);
      let count = 0;
      for (const raw of feed.items) {
        const item = toNewsItem(raw, source.name, config.categoryKeywords);
        if (item) {
          items.push(item);
          count++;
        }
      }
      okSources++;
      console.log(`[ok] ${source.name}: ${count} items`);
    } catch (err) {
      // One failing source must not stop the whole run.
      console.warn(`[skip] ${source.name}: ${(err as Error).message}`);
    }
  }

  // If every feed failed, keep the existing data rather than publishing an empty page.
  if (okSources === 0) {
    throw new Error("No feeds could be fetched; data/news.json was left unchanged.");
  }

  const newsPath = path.join(root, "data", "news.json");
  const previous = await readPrevious(newsPath);
  // Re-apply the topic rule to saved items too, so older off-topic entries are removed.
  const kept = applyTopicFilter(mergeItems(previous, items), config.categoryKeywords);
  const finalItems = finalizeItems(kept, {
    maxAgeDays: config.maxAgeDays,
    maxItems: config.maxItems,
  });

  await mkdir(path.join(root, "data"), { recursive: true });
  await writeFile(
    newsPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), items: finalItems }, null, 2) + "\n",
  );
  console.log(
    `Wrote ${finalItems.length} items to data/news.json (${okSources}/${config.sources.length} sources ok)`,
  );
}

async function readPrevious(file: string): Promise<NewsItem[]> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as { items?: NewsItem[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
