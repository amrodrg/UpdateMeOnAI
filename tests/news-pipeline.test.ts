import { describe, expect, it } from "vitest";
import {
  canonicalUrl,
  categorize,
  extractiveSummary,
  finalizeItems,
  itemId,
  stripHtml,
  toNewsItem,
  type NewsItem,
} from "../lib/news-pipeline";

const keywords = { Models: ["model", "gpt"], Tools: ["tool", "agent"] };

const makeItem = (overrides: Partial<NewsItem> = {}): NewsItem => ({
  id: "id-1",
  title: "Title",
  summary: "Summary",
  publishedAt: "2025-01-01T00:00:00.000Z",
  category: "Updates",
  sourceName: "Src",
  sourceUrl: "https://example.com/a",
  ...overrides,
});

describe("canonicalUrl and itemId", () => {
  it("strips hash, query and trailing slash", () => {
    expect(canonicalUrl("https://example.com/post/?utm=1#top")).toBe("https://example.com/post");
  });

  it("gives the same id for equivalent URLs", () => {
    expect(itemId("https://example.com/post/?x=1")).toBe(itemId("https://example.com/post"));
    expect(itemId("https://example.com/post")).toHaveLength(16);
  });
});

describe("stripHtml", () => {
  it("removes tags and decodes common entities", () => {
    expect(stripHtml("<p>Tom &amp; Jerry&#39;s&nbsp;<b>news</b></p>")).toBe("Tom & Jerry's news");
  });
});

describe("extractiveSummary", () => {
  it("returns empty string for missing text", () => {
    expect(extractiveSummary(undefined)).toBe("");
  });

  it("keeps at most three sentences", () => {
    const text = "One. Two. Three. Four. Five.";
    expect(extractiveSummary(text)).toBe("One. Two. Three.");
  });

  it("caps long summaries with an ellipsis", () => {
    const long = "word ".repeat(200) + ".";
    const summary = extractiveSummary(long);
    expect(summary.length).toBeLessThanOrEqual(300);
    expect(summary.endsWith("…")).toBe(true);
  });
});

describe("categorize", () => {
  it("prefers Models over Tools", () => {
    expect(categorize("New model tool", "", keywords)).toBe("Models");
  });

  it("falls back to Tools then Updates", () => {
    expect(categorize("Agent launch", "", keywords)).toBe("Tools");
    expect(categorize("Company news", "", keywords)).toBe("Updates");
  });

  it("matches word prefixes only", () => {
    expect(categorize("Models are great", "", keywords)).toBe("Models");
    expect(categorize("Hotels booking", "", keywords)).toBe("Updates");
  });
});

describe("toNewsItem", () => {
  it("maps a valid feed entry", () => {
    const item = toNewsItem(
      {
        title: "<b>New GPT</b> released",
        link: "https://example.com/gpt",
        contentSnippet: "A new model. It is fast.",
        isoDate: "2025-02-01T10:00:00.000Z",
      },
      "Example",
      keywords,
    );
    expect(item).toMatchObject({
      title: "New GPT released",
      category: "Models",
      sourceName: "Example",
      sourceUrl: "https://example.com/gpt",
      publishedAt: "2025-02-01T10:00:00.000Z",
    });
  });

  it("rejects entries missing a title, link, or valid date", () => {
    expect(toNewsItem({ link: "https://e.com", isoDate: "2025-01-01" }, "S", keywords)).toBeNull();
    expect(toNewsItem({ title: "t", isoDate: "2025-01-01" }, "S", keywords)).toBeNull();
    expect(toNewsItem({ title: "t", link: "https://e.com" }, "S", keywords)).toBeNull();
    expect(
      toNewsItem({ title: "t", link: "https://e.com", isoDate: "not a date" }, "S", keywords),
    ).toBeNull();
  });
});

describe("finalizeItems", () => {
  const now = new Date("2025-03-01T00:00:00.000Z");

  it("dedupes by id, keeping the first occurrence", () => {
    const result = finalizeItems(
      [
        makeItem({ id: "a", title: "first", publishedAt: "2025-02-27T00:00:00.000Z" }),
        makeItem({ id: "a", title: "second", publishedAt: "2025-02-27T00:00:00.000Z" }),
      ],
      { maxAgeDays: 30, maxItems: 10, now },
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("first");
  });

  it("drops items older than maxAgeDays", () => {
    const result = finalizeItems(
      [
        makeItem({ id: "old", publishedAt: "2025-01-01T00:00:00.000Z" }),
        makeItem({ id: "new", publishedAt: "2025-02-25T00:00:00.000Z" }),
      ],
      { maxAgeDays: 30, maxItems: 10, now },
    );
    expect(result.map((i) => i.id)).toEqual(["new"]);
  });

  it("sorts newest first and caps the count", () => {
    const result = finalizeItems(
      [
        makeItem({ id: "a", publishedAt: "2025-02-20T00:00:00.000Z" }),
        makeItem({ id: "b", publishedAt: "2025-02-27T00:00:00.000Z" }),
        makeItem({ id: "c", publishedAt: "2025-02-24T00:00:00.000Z" }),
      ],
      { maxAgeDays: 30, maxItems: 2, now },
    );
    expect(result.map((i) => i.id)).toEqual(["b", "c"]);
  });
});
