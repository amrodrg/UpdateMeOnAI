# Design: UpdateMeOnAI

## Goal
A creative, interactive page showing the newest AI tools, models, and updates. Each item has a short summary, a date, a category, and a link to the original report.

## Visual direction
- Dark slate background with a soft gradient. Accents are cyan and violet, with pink for Updates.
- Typography: Newsreader (serif, via `next/font/google`) for the masthead and card headlines, IBM Plex Sans for body and UI text. Exposed as `--font-display` and `--font-body` and mapped in `tailwind.config.ts`.
- No gradient headlines, all-caps eyebrows, arrow glyphs in link text, or stat pills. The design follows the Anthropic `frontend-design` guidance in `.agents/skills/frontend-design/SKILL.md`.
- Cards are rounded and glass-like, with a hover lift and a violet glow.
- Motion comes from Framer Motion: cards animate in and out as filters change. `MotionConfig reducedMotion="user"` in `components/NewsFeed.tsx` turns off JS animations for reduced-motion users, in addition to the CSS rule in `app/globals.css`.
- Keyboard focus is shown with a visible cyan ring on tabs and controls.

## Layout
1. Left-aligned serif masthead with a tagline, and one meta line: "Updated … UTC · N stories from M sources".
2. Toolbar with category tabs (All, Tools, Models, Updates, each with a count) and a search box. Pressing `/` focuses search.
3. Responsive card grid: 1 column on mobile, 2 on tablet, 3 on desktop. Items published within 48 hours of the last refresh get a "New" badge.
4. Empty state with a "Clear filters" button.
5. Footer with the data source note.

## Data freshness
- `scripts/fetch-news.ts` merges the new fetch with the previous `data/news.json`, so a feed that is down keeps its last items.
- If every feed fails, the script exits with an error and leaves `data/news.json` unchanged.
- Known gaps: Anthropic and Meta AI do not currently publish a working RSS feed (both URLs return 404). Add them when a working feed exists.

## Item fields
| Field | Description |
| --- | --- |
| `title` | Headline from the feed, HTML stripped |
| `summary` | First 2-3 sentences of the feed excerpt, max 300 characters |
| `publishedAt` | ISO timestamp from the feed |
| `category` | Tools, Models, or Updates (keyword match in `sources.json`) |
| `sourceName` | Feed name, for example "OpenAI" |
| `sourceUrl` | Link to the original report, opened in a new tab with `rel="noopener noreferrer"` |
