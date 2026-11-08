# Design: UpdateMeOnAI

## Goal
A creative, interactive page showing the newest AI tools, models, and updates. Each item has a short summary, a date, a category, and a link to the original report.

## Visual direction
- Dark slate background with a soft gradient. Accents are cyan and violet.
- Typography: Newsreader (serif, via `next/font/google`) for the masthead and card headlines, IBM Plex Sans for body and UI text. Exposed as `--font-display` and `--font-body` and mapped in `tailwind.config.ts`.
- No gradient headlines, all-caps eyebrows, arrow glyphs in link text, or stat pills. The design follows the Anthropic `frontend-design` guidance in `.agents/skills/frontend-design/SKILL.md`.
- Cards are rounded and glass-like, with a hover lift and a violet glow. Each card has a 2px top rule in its category color (cyan Copilot, violet Models).
- The active tab is solid stone-100 with dark text, not a gradient.
- When the list is unfiltered, the newest story is a full-width lead with a larger serif headline. It spans the grid on sm and up.
- Motion comes from Framer Motion: cards animate in and out as filters change. `MotionConfig reducedMotion="user"` in `components/NewsFeed.tsx` turns off JS animations for reduced-motion users, in addition to the CSS rule in `app/globals.css`.
- Keyboard focus is shown with a visible cyan ring on tabs and controls.
- The masthead has a double rule above it, like a printed newspaper.

## Theme system
- Colors come from CSS variables: `--white`, `--stone-100`, `--slate-50` to `--slate-950`, the cyan, violet, pink, emerald, and amber shades, and `--aurora-a/b/c` for the background glow. `tailwind.config.ts` maps each Tailwind name to its variable with `rgb(var(--name) / <alpha-value>)`, so `bg-white/5` and similar still work. Components do not change.
- Light is the default (warm paper, `--slate-950` is paper; `--stone-100` and `--white` are ink). Dark is the midnight glass palette. Defaults are in `app/globals.css`.
- With no saved choice, the OS `prefers-color-scheme` decides. `data-theme="light"` or `"dark"` on `<html>` overrides it.
- `app/layout.tsx` runs an inline script before paint that reads `localStorage.theme` and sets `data-theme`, so the page does not flash.
- `components/ThemeToggle.tsx` is a fixed glass segmented control (top right) with `aria-pressed` buttons. Its choice is stored in `localStorage` under `theme`.
- Light-mode text colors are chosen to meet WCAG 1.4.3 contrast (4.5:1 for body text) on the paper background.

## Layout
1. Left-aligned serif masthead with a tagline, and one meta line: "Updated … UTC · N stories from M sources".
2. Toolbar with category tabs (All, Models, Copilot, each with a count) and a search box. Pressing `/` focuses search.
3. Responsive card grid: 1 column on mobile, 2 on tablet, 3 on desktop. The unfiltered lead story spans the full row. Items published within 48 hours of the last refresh get a "New" badge.
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
| `category` | Models or Copilot (keyword match in `sources.json`; other items are dropped) |
| `sourceName` | Feed name, for example "OpenAI" |
| `sourceUrl` | Link to the original report, opened in a new tab with `rel="noopener noreferrer"` |

## Learn page (`/learn`)
- Static route at `app/learn/page.tsx`. The map is a client component in `components/learn/LearnMap.tsx`.
- Lesson content is data in `lib/learn-map.ts`: four levels, prerequisites, steps, an example snippet, a check question, 2–3 "Check your understanding" multiple-choice questions (one correct answer and a one-sentence explanation each), and official sources per node.
- The map draws prerequisites as SVG curves between absolutely positioned nodes. Keyboard users move with arrow keys. Progress is stored in `localStorage` under `updatemeonai.learn.progress`. Quiz answers are stored separately under `updatemeonai.learn.quiz` as `{"<nodeId>:<questionIndex>": choiceIndex}`; each question locks after one answer.
- The teaching method is in `docs/learning-method.md`.

## Copilot guide (`/copilot`)
- Static route at `app/copilot/page.tsx`. Chapter text, config-file table, and recommended skills are hand-written data in `lib/copilot-guide.ts`. Every link there points to official GitHub or VS Code docs.
- "Make things with Copilot and a connector" shows Higgsfield MCP ideas (`CONNECTOR_IDEAS` in `lib/copilot-guide.ts`). Each idea has a prompt, a result, and an example image hotlinked from Higgsfield's own pages, credited with a link. Images are never generated.
- The "Newest Copilot updates" list is extracted from `data/news.json` (category `Copilot`, filtered to items that mention Copilot). Summaries are never generated.
- Layout reuses card styling from the home page: `rounded-3xl`, `bg-white/5`, `backdrop-blur`, and theme-aware text. Anchor pills jump to each chapter, and all focus states use `focus-visible:ring-cyan-300`.
