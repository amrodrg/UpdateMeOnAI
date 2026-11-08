"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  LEARN_NODES,
  LEARN_NODES_BY_ID,
  LEVEL_LABELS,
  nextSuggestedNode,
  type LearnNode,
} from "@/lib/learn-map";

const STORAGE_KEY = "updatemeonai.learn.progress";

const NODE_W = 200;
const NODE_H = 78;
const COL_GAP = 60;
const ROW_GAP = 40;
const PAD = 24;

const x = (node: LearnNode) => PAD + (node.level - 1) * (NODE_W + COL_GAP);
const y = (node: LearnNode) => PAD + node.row * (NODE_H + ROW_GAP);
const WIDTH = PAD * 2 + 4 * NODE_W + 3 * COL_GAP;
const HEIGHT = PAD * 2 + 4 * NODE_H + 3 * ROW_GAP;

export default function LearnMap() {
  const [selectedId, setSelectedId] = useState<string>(LEARN_NODES[0].id);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Read saved progress after mount so server and client markup match.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) {
        setLearned(new Set(saved.filter((id): id is string => typeof id === "string" && id in LEARN_NODES_BY_ID)));
      }
    } catch {
      // Corrupt or unavailable storage: start with empty progress.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...learned]));
    } catch {
      // Storage may be full or disabled; progress is then session-only.
    }
  }, [learned, loaded]);

  const selected = LEARN_NODES_BY_ID[selectedId];
  const suggested = useMemo(() => nextSuggestedNode(learned), [learned]);
  const isLocked = (node: LearnNode) => node.prerequisites.some((p) => !learned.has(p));

  const toggleLearned = (id: string) =>
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onNodeKey = (e: React.KeyboardEvent, id: string) => {
    const index = LEARN_NODES.findIndex((n) => n.id === id);
    const move = (delta: number) => {
      e.preventDefault();
      const next = LEARN_NODES[(index + delta + LEARN_NODES.length) % LEARN_NODES.length];
      document.getElementById(`learn-node-${next.id}`)?.focus();
      setSelectedId(next.id);
    };
    if (e.key === "ArrowRight" || e.key === "ArrowDown") move(1);
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") move(-1);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="learn-map-heading" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="learn-map-heading" className="text-lg font-bold text-white">
              Learning map
            </h2>
            <p className="text-sm text-slate-400" aria-live="polite">
              {learned.size} of {LEARN_NODES.length} learned
              {suggested && (
                <>
                  {" · Next: "}
                  <button
                    type="button"
                    onClick={() => setSelectedId(suggested.id)}
                    className="font-semibold text-cyan-300 underline-offset-4 hover:underline"
                  >
                    {suggested.title}
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2">
            <div className="relative" style={{ width: WIDTH, height: HEIGHT }}>
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="absolute top-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                  style={{ left: PAD + (level - 1) * (NODE_W + COL_GAP), width: NODE_W }}
                >
                  {LEVEL_LABELS[level as 1 | 2 | 3 | 4]}
                </div>
              ))}

              <svg
                className="pointer-events-none absolute inset-0"
                width={WIDTH}
                height={HEIGHT}
                aria-hidden="true"
              >
                {LEARN_NODES.flatMap((node) =>
                  node.prerequisites.map((prereqId) => {
                    const from = LEARN_NODES_BY_ID[prereqId];
                    const x1 = x(from) + NODE_W;
                    const y1 = y(from) + NODE_H / 2;
                    const x2 = x(node);
                    const y2 = y(node) + NODE_H / 2;
                    const mid = (x1 + x2) / 2;
                    const done = learned.has(prereqId);
                    return (
                      <path
                        key={`${prereqId}->${node.id}`}
                        d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={done ? "#22d3ee" : "rgba(148,163,184,0.35)"}
                        strokeOpacity={done ? 0.7 : 1}
                        strokeWidth={done ? 2.5 : 1.5}
                        strokeDasharray={done ? undefined : "6 6"}
                      />
                    );
                  }),
                )}
              </svg>

              {LEARN_NODES.map((node) => {
                const isSelected = node.id === selectedId;
                const isDone = learned.has(node.id);
                const locked = isLocked(node);
                return (
                  <button
                    key={node.id}
                    id={`learn-node-${node.id}`}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${node.title}${isDone ? ", learned" : locked ? ", prerequisites not learned yet" : ""}`}
                    onClick={() => setSelectedId(node.id)}
                    onKeyDown={(e) => onNodeKey(e, node.id)}
                    className={`absolute flex flex-col justify-between rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                      isSelected
                        ? "border-violet-400 bg-violet-400/15 shadow-lg shadow-violet-500/20"
                        : "border-white/10 bg-white/[0.05] hover:-translate-y-0.5 hover:border-cyan-400/40"
                    } ${locked ? "opacity-60" : ""}`}
                    style={{ left: x(node), top: y(node), width: NODE_W, height: NODE_H }}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold leading-snug text-white">{node.title}</span>
                      {isDone && (
                        <span aria-hidden="true" className="text-emerald-300">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="line-clamp-2 text-xs leading-snug text-slate-400">{node.blurb}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Solid lines show what you have learned. Dashed lines are still ahead. Use arrow keys to move between
            nodes.
          </p>
        </section>

        <AnimatePresence mode="wait">
          <motion.aside
            key={selected.id}
            aria-label="Lesson"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                Level {selected.level} · {LEVEL_LABELS[selected.level]}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">{selected.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{selected.goal}</p>
              {selected.prerequisites.length > 0 && (
                <p className="mt-3 text-xs text-slate-400">
                  Start with:{" "}
                  {selected.prerequisites.map((p, i) => (
                    <span key={p}>
                      {i > 0 && ", "}
                      <button
                        type="button"
                        onClick={() => setSelectedId(p)}
                        className="font-semibold text-violet-300 underline-offset-4 hover:underline"
                      >
                        {LEARN_NODES_BY_ID[p].title}
                      </button>
                    </span>
                  ))}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Try it</h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-300">
                {selected.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">
                Example: <code className="font-mono text-cyan-300">{selected.example.file}</code>
              </h3>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/70 p-4 text-xs leading-relaxed text-slate-200 ring-1 ring-white/10">
                <code>{selected.example.code}</code>
              </pre>
            </div>

            <div className="rounded-xl bg-violet-400/10 p-4 ring-1 ring-violet-400/30">
              <h3 className="text-sm font-semibold text-violet-200">Check yourself</h3>
              <p className="mt-1 text-sm text-slate-200">{selected.checkQuestion}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Official sources</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {selected.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline-offset-4 hover:underline"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => toggleLearned(selected.id)}
              aria-pressed={learned.has(selected.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                learned.has(selected.id)
                  ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40 hover:bg-emerald-400/20"
                  : "bg-gradient-to-r from-cyan-400 to-violet-400 text-slate-950 shadow-lg shadow-violet-500/20"
              }`}
            >
              {learned.has(selected.id) ? "Learned ✓ (click to undo)" : "Mark as learned"}
            </button>
          </motion.aside>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
