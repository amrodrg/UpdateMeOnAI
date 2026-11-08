# Design: UpdateMeOnAI

## Goal
A creative, interactive page showing the newest AI tools, models, and updates. Each item has a short summary, a date, a category, and a link to the original report.

## Visual direction
- Dark slate background with a soft gradient. Accents are cyan and violet, with pink for Updates.
- Cards are rounded and glass-like, with a hover lift and a violet glow.
- Motion comes from Framer Motion: cards animate in and out as filters change. `MotionConfig reducedMotion="user"` in `components/NewsFeed.tsx` turns off JS animations for reduced-motion users, in addition to the CSS rule in `app/globals.css`.
- Keyboard focus is shown with a visible cyan ring on tabs and controls.

## Layout
1. Header with title, tagline, "Last updated" (UTC), and a stats strip (story count, source count).
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

## Learn page (`/learn`)
- Static route at `app/learn/page.tsx`. The map is a client component in `components/learn/LearnMap.tsx`.
- Lesson content is data in `lib/learn-map.ts`: four levels, prerequisites, steps, an example snippet, a check question, and official sources per node.
- The map draws prerequisites as SVG curves between absolutely positioned nodes. Keyboard users move with arrow keys. Progress is stored in `localStorage` under `updatemeonai.learn.progress`.
- The teaching method is in `docs/learning-method.md`.
