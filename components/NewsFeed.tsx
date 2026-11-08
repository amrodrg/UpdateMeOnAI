"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category, NewsItem } from "@/lib/news-pipeline";

const CATEGORIES: ("All" | Category)[] = ["All", "Tools", "Models", "Updates"];

const BADGE_STYLES: Record<Category, string> = {
  Tools: "bg-cyan-400/15 text-cyan-300 ring-cyan-400/40",
  Models: "bg-violet-400/15 text-violet-300 ring-violet-400/40",
  Updates: "bg-pink-400/15 text-pink-300 ring-pink-400/40",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function NewsFeed({ items }: { items: NewsItem[] }) {
  const [category, setCategory] = useState<"All" | Category>("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (category === "All" || item.category === category) &&
        (q === "" || `${item.title} ${item.summary}`.toLowerCase().includes(q)),
    );
  }, [items, category, query]);

  return (
    <section aria-label="AI news">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === c
                  ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-slate-950 shadow-lg shadow-violet-500/20"
                  : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="relative sm:w-72">
          <span className="sr-only">Search news</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles and summaries…"
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-400">
          No news matches your filters yet.
        </p>
      ) : (
        <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${BADGE_STYLES[item.category]}`}
                  >
                    {item.category}
                  </span>
                  <time dateTime={item.publishedAt} className="text-xs text-slate-500">
                    {formatDate(item.publishedAt)}
                  </time>
                </div>
                <h2 className="text-lg font-bold leading-snug text-white">{item.title}</h2>
                {item.summary && (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">{item.summary}</p>
                )}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                  <span className="text-slate-400">{item.sourceName}</span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-cyan-300 transition group-hover:text-violet-300"
                  >
                    Read original →
                    <span className="sr-only"> (opens {item.sourceName} in a new tab)</span>
                  </a>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
