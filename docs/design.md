# Design: UpdateMeOnAI

## Goal
A creative, interactive page showing the newest AI tools, models, and updates. Each item has a short summary, a date, a category, and a link to the original report.

## Visual direction
- Dark slate background with a soft gradient. Accents are cyan and violet, with pink for Updates.
- Cards are rounded and glass-like, with a hover lift and a violet glow.
- Motion comes from Framer Motion: cards animate in and out as filters change. Reduced-motion users get the static layout (see `app/globals.css`).

## Layout
1. Header with title, tagline, and "Last updated" (UTC).
2. Toolbar with category tabs (All, Tools, Models, Updates) and a search box.
3. Responsive card grid: 1 column on mobile, 2 on tablet, 3 on desktop.
4. Footer with the data source note.

## Item fields
| Field | Description |
| --- | --- |
| `title` | Headline from the feed, HTML stripped |
| `summary` | First 2-3 sentences of the feed excerpt, max 300 characters |
| `publishedAt` | ISO timestamp from the feed |
| `category` | Tools, Models, or Updates (keyword match in `sources.json`) |
| `sourceName` | Feed name, for example "OpenAI" |
| `sourceUrl` | Link to the original report, opened in a new tab with `rel="noopener noreferrer"` |
