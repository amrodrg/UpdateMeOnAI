import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
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
      <header className="mb-12 max-w-3xl">
        <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-7xl">
          UpdateMeOnAI
        </h1>
        <p className="mt-5 max-w-xl font-display text-xl italic leading-snug text-slate-300 sm:text-2xl">
          What shipped in AI today, summarized, with a link to every original report.
        </p>
        <p className="mt-6 text-sm text-slate-400">
          <time dateTime={news.generatedAt}>
            Updated{" "}
            {new Date(news.generatedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "UTC",
            })}{" "}
            UTC
          </time>
          <span aria-hidden="true"> · </span>
          {news.items.length} stories from {new Set(news.items.map((i) => i.sourceName)).size}{" "}
          sources
        </p>
        <p className="mt-6">
          <Link
            href="/learn"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:border-cyan-300/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            Learn to build agents
          </Link>
        </p>
      </header>

      <NewsFeed items={news.items} generatedAt={news.generatedAt} />

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
