import { createHash } from "node:crypto";

export type Category = "Tools" | "Models" | "Updates";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: Category;
  sourceName: string;
  sourceUrl: string;
}

export interface RawFeedItem {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  isoDate?: string;
  pubDate?: string;
}

export interface CategoryKeywords {
  Models: string[];
  Tools: string[];
}

export function canonicalUrl(url: string): string {
  const u = new URL(url);
  u.hash = "";
  u.search = "";
  return u.toString().replace(/\/$/, "");
}

export function itemId(url: string): string {
  return createHash("sha256").update(canonicalUrl(url)).digest("hex").slice(0, 16);
}

export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const MAX_SUMMARY_CHARS = 300;

/** Keeps the first 2-3 sentences of the feed excerpt, capped in length. */
export function extractiveSummary(text: string | undefined): string {
  const clean = stripHtml(text ?? "");
  if (!clean) return "";
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [clean];
  let summary = sentences.slice(0, 3).join("").trim();
  if (summary.length > MAX_SUMMARY_CHARS) {
    summary = summary.slice(0, MAX_SUMMARY_CHARS - 1).replace(/\s+\S*$/, "") + "…";
  }
  return summary;
}

/** Keyword-based category: Models, then Tools, otherwise Updates. */
export function categorize(title: string, summary: string, keywords: CategoryKeywords): Category {
  const haystack = `${title} ${summary}`.toLowerCase();
  const hit = (words: string[]) =>
    words.some((w) => new RegExp(`\\b${w.toLowerCase()}`).test(haystack));
  if (hit(keywords.Models)) return "Models";
  if (hit(keywords.Tools)) return "Tools";
  return "Updates";
}

export function toNewsItem(
  raw: RawFeedItem,
  sourceName: string,
  keywords: CategoryKeywords,
): NewsItem | null {
  if (!raw.title || !raw.link || !(raw.isoDate ?? raw.pubDate)) return null;
  const publishedAt = new Date(raw.isoDate ?? raw.pubDate ?? "");
  if (Number.isNaN(publishedAt.getTime())) return null;
  const summary = extractiveSummary(raw.contentSnippet ?? raw.content);
  const title = stripHtml(raw.title);
  return {
    id: itemId(raw.link),
    title,
    summary,
    publishedAt: publishedAt.toISOString(),
    category: categorize(title, summary, keywords),
    sourceName,
    sourceUrl: raw.link,
  };
}

/** Drops items older than maxAgeDays, dedupes by id, sorts newest first, caps the count. */
export function finalizeItems(
  items: NewsItem[],
  options: { maxAgeDays: number; maxItems: number; now?: Date },
): NewsItem[] {
  const now = options.now ?? new Date();
  const cutoff = now.getTime() - options.maxAgeDays * 24 * 60 * 60 * 1000;
  const seen = new Set<string>();
  const result: NewsItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    if (new Date(item.publishedAt).getTime() < cutoff) continue;
    seen.add(item.id);
    result.push(item);
  }
  result.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return result.slice(0, options.maxItems);
}
