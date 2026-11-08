import { describe, expect, it } from "vitest";
import {
  applyTopicFilter,
  canonicalUrl,
  categorize,
  extractiveSummary,
  finalizeItems,
  itemId,
  mergeItems,
  stripHtml,
  toNewsItem,
  type NewsItem,
} from "../lib/news-pipeline";
import { isRecent } from "../lib/recency";

const keywords = {
  Models: ["model", "gpt"],
  Copilot: ["copilot"],
  exclude: ["microsoft 365 copilot"],
};

const makeItem = (overrides: Partial<NewsItem> = {}): NewsItem => ({
  id: "id-1",
  title: "Title",
  summary: "Summary",
  publishedAt: "2025-01-01T00:00:00.000Z",
  category: "Models",
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
  it("prefers Models over Copilot", () => {
    expect(categorize("New model for Copilot", "", keywords)).toBe("Models");
  });

  it("returns Copilot for GitHub Copilot news", () => {
    expect(categorize("Copilot gets agent mode", "", keywords)).toBe("Copilot");
  });

  it("drops items that are neither model nor Copilot news", () => {
    expect(categorize("Company raises funding", "", keywords)).toBeNull();
    expect(categorize("Hotels booking", "", keywords)).toBeNull();
  });

  it("ignores excluded phrases such as Microsoft 365 Copilot", () => {
    expect(categorize("Microsoft 365 Copilot adds Excel features", "", keywords)).toBeNull();
  });

  it("matches word prefixes only", () => {
    expect(categorize("Models are great", "", keywords)).toBe("Models");
  });
});

describe("applyTopicFilter", () => {
  it("removes off-topic saved items and re-categorizes the rest", () => {
    const items = [
      makeItem({ id: "a", title: "New model launch", category: "Models" }),
      makeItem({ id: "b", title: "Funding round", category: "Models" }),
      makeItem({ id: "c", title: "Copilot update", category: "Copilot" }),
    ];
    const result = applyTopicFilter(items, keywords);
    expect(result.map((i) => [i.id, i.category])).toEqual([
      ["a", "Models"],
      ["c", "Copilot"],
    ]);
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

  it("returns null for off-topic entries", () => {
    expect(
      toNewsItem(
        { title: "Startup raises $50M", link: "https://e.com/x", isoDate: "2025-01-01" },
        "S",
        keywords,
      ),
    ).toBeNull();
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

describe("mergeItems", () => {
  it("keeps existing items that are missing from the new fetch", () => {
    const result = mergeItems([makeItem({ id: "old" })], [makeItem({ id: "new" })]);
    expect(result.map((i) => i.id).sort()).toEqual(["new", "old"]);
  });

  it("prefers incoming items on duplicate ids", () => {
    const result = mergeItems(
      [makeItem({ id: "x", title: "stale" })],
      [makeItem({ id: "x", title: "fresh" })],
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("fresh");
  });
});

describe("isRecent", () => {
  const now = new Date("2025-03-01T12:00:00.000Z");

  it("is true within the window and false outside it", () => {
    expect(isRecent(makeItem({ publishedAt: "2025-02-20T00:00:00.000Z" }), now, 48)).toBe(false);
    expect(isRecent(makeItem({ publishedAt: "2025-02-28T13:00:00.000Z" }), now, 48)).toBe(true);
  });

  it("ignores items published in the future", () => {
    expect(isRecent(makeItem({ publishedAt: "2025-03-02T00:00:00.000Z" }), now, 48)).toBe(false);
  });
});
