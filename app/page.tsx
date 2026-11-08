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
        <p className="mt-6">
          <Link
            href="/learn"
            className="inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 px-4 py-1.5 text-sm font-semibold text-slate-950 shadow-lg shadow-violet-500/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            Learn to build agents →
          </Link>
        </p>
        <dl className="mt-6 flex justify-center gap-3 text-sm">
          {[
            { label: "Stories", value: news.items.length },
            { label: "Sources", value: new Set(news.items.map((i) => i.sourceName)).size },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline gap-2 rounded-full bg-white/5 px-4 py-1.5 ring-1 ring-white/10"
            >
              <dt className="text-slate-400">{stat.label}</dt>
              <dd className="font-bold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
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
