import { readFile } from "node:fs/promises";
import path from "node:path";
import NewsFeed from "@/components/NewsFeed";
import type { NewsItem } from "@/lib/news-pipeline";

interface NewsFile {
  generatedAt: string;
  items: NewsItem[];
}

async function loadNews(): Promise<NewsFile> {
  const raw = await readFile(path.join(process.cwd(), "data", "news.json"), "utf8");
  return JSON.parse(raw) as NewsFile;
}

export default async function Home() {
  const news = await loadNews();
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
          Live AI radar
        </p>
        <h1 className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl">
          UpdateMeOnAI
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          The newest AI tools, models, and updates, summarized. Every card links to the original
          report.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Last updated{" "}
          <time dateTime={news.generatedAt}>
            {new Date(news.generatedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "UTC",
            })}{" "}
            UTC
          </time>
        </p>
      </header>

      <NewsFeed items={news.items} />

      <footer className="mt-16 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        Summaries are excerpts from the original sources. Read the full report via the link on
        each card.{" "}
        <a
          className="text-cyan-300 underline-offset-4 hover:underline"
          href="https://github.com/amrodrg/UpdateMeOnAI"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source on GitHub
        </a>
      </footer>
    </main>
  );
}
