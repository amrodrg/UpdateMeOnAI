# UpdateMeOnAI

An interactive feed of new AI model releases and GitHub Copilot news. Each item shows a short extractive summary, its date, a category (Models or Copilot), and a link to the original report. Other AI news (industry, funding, unrelated tools) is excluded.

## How it works

- `sources.json` lists the RSS/Atom feeds and the topic keywords. An item is kept only if it matches a `Models` or `Copilot` keyword. Phrases in `exclude` (e.g. "Microsoft 365 Copilot") are removed before matching.
- `scripts/fetch-news.ts` (`npm run fetch-news`) reads the feeds, builds summaries from the feed text (no LLM or API keys), applies the topic rule to new and saved items, drops items older than 30 days, and writes `data/news.json`.
- The Next.js site is statically exported (`out/`) and reads `data/news.json` at build time.
- `.github/workflows/update-news.yml` runs every 6 hours, refreshes the data, rebases on `main`, and deploys to GitHub Pages.
- Feeds that fail keep their previously saved items. Anthropic and Meta AI have no working RSS feed yet, so they are not included.
- Keyboard: press `/` to focus search. Reduced-motion preferences are respected.

## Development

```bash
npm install
npm run fetch-news   # refresh data/news.json
npm run dev          # http://localhost:3000
npm test             # unit tests (Vitest)
npm run build        # static export to out/
```

To build for GitHub Pages, set `GITHUB_PAGES=true`. This sets the `/UpdateMeOnAI` base path.

## Adding a source

Add an entry to `sources.json` with `name` and `feedUrl`, then run `npm run fetch-news`. Feeds that fail are skipped and logged.
