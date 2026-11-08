# UpdateMeOnAI

An interactive feed of the newest AI tools, models, and updates. Each item shows a short extractive summary, its date, a category (Tools, Models, or Updates), and a link to the original report.

## How it works

- `sources.json` lists the RSS/Atom feeds and the keywords used for categories.
- `scripts/fetch-news.ts` (`npm run fetch-news`) reads the feeds, builds summaries from the feed text (no LLM or API keys), drops items older than 30 days, and writes `data/news.json`.
- The Next.js site is statically exported (`out/`) and reads `data/news.json` at build time.
- `.github/workflows/update-news.yml` runs every 6 hours, refreshes the data, and deploys to GitHub Pages.

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

Add an entry to `sources.json` with `name` and `url`, then run `npm run fetch-news`. Feeds that fail are skipped and logged.
