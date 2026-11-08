import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";
import {
  finalizeItems,
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
      console.log(`[ok] ${source.name}: ${count} items`);
    } catch (err) {
      // One failing source must not stop the whole run.
      console.warn(`[skip] ${source.name}: ${(err as Error).message}`);
    }
  }

  const finalItems = finalizeItems(items, {
    maxAgeDays: config.maxAgeDays,
    maxItems: config.maxItems,
  });

  await mkdir(path.join(root, "data"), { recursive: true });
  await writeFile(
    path.join(root, "data", "news.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), items: finalItems }, null, 2) + "\n",
  );
  console.log(`Wrote ${finalItems.length} items to data/news.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
