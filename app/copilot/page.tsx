import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import type { NewsItem } from "@/lib/news-pipeline";
import { CHAPTERS, CONFIG_FILES, RECOMMENDED_SKILLS } from "@/lib/copilot-guide";

export const metadata: Metadata = {
  title: "GitHub Copilot guide · UpdateMeOnAI",
  description:
    "How to use GitHub Copilot: modes, MCP connectors, instructions, agents, and skills, plus the newest Copilot updates.",
};

interface NewsFile {
  generatedAt: string;
  items: NewsItem[];
}

async function loadCopilotNews(): Promise<NewsItem[]> {
  const raw = await readFile(path.join(process.cwd(), "data", "news.json"), "utf8");
  const file = JSON.parse(raw) as NewsFile;
  return file.items
    .filter((item) => item.category === "Copilot" && /copilot/i.test(`${item.title} ${item.summary}`))
    .slice(0, 8);
}

const pillClass =
  "inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-slate-200 transition-colors hover:border-cyan-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300";
const linkClass =
  "text-cyan-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300";
const cardClass = "scroll-mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8";

export default async function CopilotPage() {
  const news = await loadCopilotNews();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-4 text-sm">
        <Link href="/" className={linkClass}>
          ← The AI radar
        </Link>
        <Link href="/learn" className={linkClass}>
          Learn to build agents
        </Link>
      </nav>

      <header className="mb-12 mt-8 max-w-3xl border-t-4 border-double border-white/25 pt-8">
        <p className="text-sm text-slate-400">Guide</p>
        <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl">
          GitHub Copilot, end to end
        </h1>
        <p className="mt-5 max-w-2xl font-display text-xl italic leading-snug text-slate-300 sm:text-2xl">
          Choose the right mode, connect your tools, teach it your rules, and keep up with what changed.
        </p>
        <ol className="mt-8 flex flex-wrap gap-2 text-sm" aria-label="On this page">
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className={pillClass}>
                {c.number} {c.title}
              </a>
            </li>
          ))}
          <li>
            <a href="#updates" className={pillClass}>
              Newest updates
            </a>
          </li>
        </ol>
      </header>

      <div className="space-y-6">
        {CHAPTERS.map((chapter) => (
          <section
            key={chapter.id}
            id={chapter.id}
            aria-labelledby={`${chapter.id}-title`}
            className={cardClass}
          >
            <p className="font-display text-3xl italic text-cyan-300">{chapter.number}</p>
            <h2 id={`${chapter.id}-title`} className="mt-2 font-display text-3xl font-medium text-white">
              {chapter.title}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-300">{chapter.intro}</p>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {chapter.points.map((point) => (
                <li
                  key={point}
                  className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm leading-relaxed text-slate-200"
                >
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {chapter.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </p>
          </section>
        ))}

        <section id="files" aria-labelledby="files-title" className={cardClass}>
          <h2 id="files-title" className="font-display text-3xl font-medium text-white">
            Where each piece lives in your repository
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Commit these files so the whole team gets the same agents, skills, and connectors.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <caption className="sr-only">Copilot customization files and what each one does</caption>
              <thead>
                <tr className="border-b border-white/15 text-slate-400">
                  <th scope="col" className="py-2 pr-4 font-medium">Kind</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Path</th>
                  <th scope="col" className="py-2 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {CONFIG_FILES.map((f) => (
                  <tr key={f.path} className="border-b border-white/10 align-top">
                    <td className="py-3 pr-4 text-slate-200">{f.kind}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-cyan-300">{f.path}</td>
                    <td className="py-3 text-slate-300">{f.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="skills" aria-labelledby="skills-title" className={cardClass}>
          <h2 id="skills-title" className="font-display text-3xl font-medium text-white">
            Recommended skills and agents
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Start with these. Install only what matches the work, and keep installed skill folders out of pull requests.
          </p>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {RECOMMENDED_SKILLS.map((skill) => (
              <li key={skill.name} className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-400">{skill.source}</p>
                <h3 className="mt-2 font-display text-xl text-white">{skill.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{skill.useFor}</p>
                <code className="mt-4 block break-all rounded-lg bg-slate-950/60 p-3 font-mono text-xs text-cyan-300">
                  {skill.install}
                </code>
              </li>
            ))}
          </ul>
        </section>

        <section id="updates" aria-labelledby="updates-title" className={cardClass}>
          <h2 id="updates-title" className="font-display text-3xl font-medium text-white">
            Newest Copilot updates
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Headlines and extractive summaries from the feeds, newest first. Each links to the original report. For the
            full list, see the{" "}
            <a
              href="https://github.blog/changelog/label/copilot/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              GitHub Copilot changelog
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
          {news.length === 0 ? (
            <p className="mt-5 text-slate-400">No Copilot updates in the latest feed run. Check the changelog above.</p>
          ) : (
            <ol className="mt-5 space-y-3">
              {news.map((item) => (
                <li key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-400">
                    <time dateTime={item.publishedAt}>
                      {new Date(item.publishedAt).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
                    </time>
                    {" · "}
                    {item.sourceName}
                  </p>
                  <h3 className="mt-1 font-display text-lg leading-snug text-white">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    >
                      {item.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <footer className="mt-16 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        Guide text is written by hand and links to official GitHub and VS Code documentation. Tools change often, so
        check the linked pages for current behavior. Updates are extracted from the feeds, not generated.
      </footer>
    </main>
  );
}
