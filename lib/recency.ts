import type { NewsItem } from "./news-pipeline";

/**
 * True when the item was published within `hours` before `now`.
 * Lives apart from news-pipeline.ts so client components can import it without pulling in node:crypto.
 */
export function isRecent(item: Pick<NewsItem, "publishedAt">, now: Date, hours = 48): boolean {
  const age = now.getTime() - new Date(item.publishedAt).getTime();
  return age >= 0 && age <= hours * 60 * 60 * 1000;
}
