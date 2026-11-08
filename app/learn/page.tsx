import type { Metadata } from "next";
import Link from "next/link";
import LearnMap from "@/components/learn/LearnMap";

export const metadata: Metadata = {
  title: "Learn AI agents · UpdateMeOnAI",
  description:
    "An interactive map for learning how to build skills, custom agents, workflows, and teams of agents that finish tasks on their own.",
};

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6">
      <header className="mb-10">
        <Link href="/" className="text-sm text-cyan-300 underline-offset-4 hover:underline">
          ← Back to the AI radar
        </Link>
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">Learn</p>
        <h1 className="mt-3 bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
          From prompt to autonomous team
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Work through the map from left to right. Each node is one idea and one small thing to try. Read the
          official source, do the steps in your own repository, answer the check question, then mark the node as
          learned.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          Teaching method: learn by doing, in small steps. Each lesson builds on the one before it. Progress is saved
          in this browser only. The reasoning is in docs/learning-method.md.
        </p>
      </header>

      <LearnMap />

      <footer className="mt-16 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        Lessons are based on official GitHub Copilot and Claude documentation. Check the linked sources for the latest
        behavior, because these tools change often.
      </footer>
    </main>
  );
}
