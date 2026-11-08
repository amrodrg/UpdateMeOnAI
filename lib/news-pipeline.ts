import { createHash } from "node:crypto";

export type Category = "Models" | "Copilot";

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
  Copilot: string[];
  /** Phrases removed before matching, so unrelated products (e.g. Microsoft Copilot) don't match. */
  exclude?: string[];
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

/**
 * Allow-list topic filter. Returns Models or Copilot when the text matches, otherwise null
 * so the item is dropped. Models is checked first.
 */
export function categorize(
  title: string,
  summary: string,
  keywords: CategoryKeywords,
): Category | null {
  let haystack = `${title} ${summary}`.toLowerCase();
  for (const phrase of keywords.exclude ?? []) {
    haystack = haystack.split(phrase.toLowerCase()).join(" ");
  }
  const hit = (words: string[]) =>
    words.some((w) => new RegExp(`\\b${escapeRegex(w.toLowerCase())}`).test(haystack));
  if (hit(keywords.Models)) return "Models";
  if (hit(keywords.Copilot)) return "Copilot";
  return null;
}

/** Re-applies the topic rule to saved items, so a rule change also cleans up old data. */
export function applyTopicFilter(items: NewsItem[], keywords: CategoryKeywords): NewsItem[] {
  const result: NewsItem[] = [];
  for (const item of items) {
    const category = categorize(item.title, item.summary, keywords);
    if (category) result.push({ ...item, category });
  }
  return result;
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
  const category = categorize(title, summary, keywords);
  if (!category) return null;
  return {
    id: itemId(raw.link),
    title,
    summary,
    publishedAt: publishedAt.toISOString(),
    category,
    sourceName,
    sourceUrl: raw.link,
  };
}

/**
 * Combines freshly fetched items with previously saved ones. Keeps saved items when a
 * feed is temporarily down, so a single failed fetch never empties the page.
 * Incoming items win on duplicate ids because they carry the latest feed text.
 */
export function mergeItems(existing: NewsItem[], incoming: NewsItem[]): NewsItem[] {
  const byId = new Map<string, NewsItem>();
  for (const item of existing) byId.set(item.id, item);
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()];
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
