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
import { activeStreak, bumpStreak, EMPTY_STREAK, localDay, parseStreak, quizScore, type StreakState } from "@/lib/learn-progress";
import Confetti from "@/components/learn/Confetti";

const STORAGE_KEY = "updatemeonai.learn.progress";
const QUIZ_STORAGE_KEY = "updatemeonai.learn.quiz";
const STREAK_STORAGE_KEY = "updatemeonai.learn.streak";

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
  /** Chosen choice index per quiz question, keyed as `${nodeId}:${questionIndex}`. */
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [streak, setStreak] = useState<StreakState>(EMPTY_STREAK);
  /** Node id and count of perfect-score bursts, so confetti replays on each perfect score. */
  const [burst, setBurst] = useState<{ nodeId: string; n: number } | null>(null);

  // Read saved progress after mount so server and client markup match.
  useEffect(() => {
    try {
      setStreak(parseStreak(JSON.parse(window.localStorage.getItem(STREAK_STORAGE_KEY) ?? "null")));
    } catch {
      // Corrupt or unavailable storage: start with no streak.
    }
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) {
        setLearned(new Set(saved.filter((id): id is string => typeof id === "string" && id in LEARN_NODES_BY_ID)));
      }
    } catch {
      // Corrupt or unavailable storage: start with empty progress.
    }
    try {
      const saved = JSON.parse(window.localStorage.getItem(QUIZ_STORAGE_KEY) ?? "{}");
      if (saved && typeof saved === "object") {
        const valid: Record<string, number> = {};
        for (const [key, choice] of Object.entries(saved)) {
          const [nodeId, index] = key.split(":");
          const question = LEARN_NODES_BY_ID[nodeId]?.quiz[Number(index)];
          if (question && typeof choice === "number" && Number.isInteger(choice) && question.choices[choice]) {
            valid[key] = choice;
          }
        }
        setQuizAnswers(valid);
      }
    } catch {
      // Corrupt or unavailable storage: start with no quiz answers.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...learned]));
      window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizAnswers));
      window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
    } catch {
      // Storage may be full or disabled; progress is then session-only.
    }
  }, [learned, quizAnswers, streak, loaded]);

  const selected = LEARN_NODES_BY_ID[selectedId];
  const suggested = useMemo(() => nextSuggestedNode(learned), [learned]);
  const isLocked = (node: LearnNode) => node.prerequisites.some((p) => !learned.has(p));
  const currentStreak = activeStreak(streak, localDay());
  const progressPct = Math.round((learned.size / LEARN_NODES.length) * 100);
  const quizSummary = selected
    ? quizScore(
        selected.quiz,
        Object.fromEntries(selected.quiz.map((_, i) => [i, quizAnswers[`${selected.id}:${i}`]]).filter(([, v]) => v !== undefined)),
      )
    : { correct: 0, total: 0, answered: 0 };

  const toggleLearned = (id: string) => {
    if (!learned.has(id)) setStreak((prev) => bumpStreak(prev, localDay()));
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const answerQuestion = (node: LearnNode, index: number, choiceIndex: number) => {
    const key = `${node.id}:${index}`;
    const nextAnswers = { ...quizAnswers, [key]: choiceIndex };
    setQuizAnswers(nextAnswers);
    setStreak((prev) => bumpStreak(prev, localDay()));
    const perfect = quizScore(
      node.quiz,
      Object.fromEntries(node.quiz.map((_, i) => [i, nextAnswers[`${node.id}:${i}`]])),
    );
    if (perfect.answered === perfect.total && perfect.correct === perfect.total) {
      setBurst((prev) => ({ nodeId: node.id, n: (prev?.n ?? 0) + 1 }));
    }
  };

  const retryQuiz = (node: LearnNode) => {
    setQuizAnswers((prev) => {
      const next = { ...prev };
      node.quiz.forEach((_, i) => delete next[`${node.id}:${i}`]);
      return next;
    });
  };

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
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="learn-map-heading" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="learn-map-heading" className="text-lg font-bold text-white">
              Learning map
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {currentStreak > 0 && (
                <span
                  className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/40"
                  aria-label={`Streak: ${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}
                >
                  🔥 {currentStreak}-day streak
                </span>
              )}
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
          </div>

          <div
            role="progressbar"
            aria-label="Lessons learned"
            aria-valuemin={0}
            aria-valuemax={LEARN_NODES.length}
            aria-valuenow={learned.size}
            aria-valuetext={`${learned.size} of ${LEARN_NODES.length} lessons learned`}
            className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
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
                  <motion.button
                    key={node.id}
                    id={`learn-node-${node.id}`}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${node.title}${isDone ? ", learned" : locked ? ", locked until prerequisites are learned" : ""}`}
                    onClick={() => setSelectedId(node.id)}
                    onKeyDown={(e) => onNodeKey(e, node.id)}
                    initial={false}
                    animate={{ opacity: locked ? 0.55 : 1, scale: isDone ? 1.02 : 1 }}
                    whileHover={locked ? undefined : { y: -2 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`absolute flex flex-col justify-between rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                      isSelected
                        ? "border-violet-400 bg-violet-400/15 shadow-lg shadow-violet-500/20"
                        : isDone
                          ? "border-emerald-400/40 bg-emerald-400/10"
                          : "border-white/10 bg-white/[0.05] hover:border-cyan-400/40"
                    }`}
                    style={{ left: x(node), top: y(node), width: NODE_W, height: NODE_H }}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold leading-snug text-white">{node.title}</span>
                      {isDone ? (
                        <span aria-hidden="true" className="text-emerald-300">
                          ✓
                        </span>
                      ) : locked ? (
                        <span aria-hidden="true" className="text-xs text-slate-500">
                          🔒
                        </span>
                      ) : null}
                    </span>
                    <span className="line-clamp-2 text-xs leading-snug text-slate-400">{node.blurb}</span>
                  </motion.button>
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

            <div className="relative">
              {burst?.nodeId === selected.id && <Confetti burstKey={String(burst.n)} />}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Check your understanding</h3>
                {quizSummary.answered > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-300" aria-live="polite">
                      Score: {quizSummary.correct} / {quizSummary.total}
                    </span>
                    {quizSummary.answered === quizSummary.total && (
                      <button
                        type="button"
                        onClick={() => retryQuiz(selected)}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-white/15 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                      >
                        Retry quiz
                      </button>
                    )}
                  </div>
                )}
              </div>
              <ol className="mt-3 space-y-5">
                {selected.quiz.map((q, index) => {
                  const key = `${selected.id}:${index}`;
                  const picked = quizAnswers[key];
                  const answered = picked !== undefined;
                  const correct = answered && q.choices[picked].correct;
                  return (
                    <li key={key}>
                      <fieldset disabled={answered} className="space-y-2">
                        <legend className="text-sm font-medium text-slate-200">{q.question}</legend>
                        {q.choices.map((choice, choiceIndex) => (
                          <label
                            key={choice.text}
                            className="flex cursor-pointer items-start gap-2 text-sm text-slate-300 has-[:disabled]:cursor-default"
                          >
                            <input
                              type="radio"
                              name={`quiz-${key}`}
                              checked={picked === choiceIndex}
                              onChange={() => answerQuestion(selected, index, choiceIndex)}
                              className="mt-1 accent-cyan-400"
                            />
                            <span>{choice.text}</span>
                          </label>
                        ))}
                      </fieldset>
                      {answered && (
                        <p role="status" className={`mt-2 text-sm ${correct ? "text-emerald-300" : "text-amber-300"}`}>
                          <span className="font-semibold">{correct ? "Correct." : "Not quite."}</span> {q.explanation}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
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

            <footer className="border-t border-white/10 pt-4 text-xs text-slate-400">
              <p>
                Last checked: <time dateTime={selected.lastChecked}>{selected.lastChecked}</time>
              </p>
              <h3 className="mt-2 font-semibold text-slate-300">Sources</h3>
              <ul className="mt-1 space-y-1">
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
            </footer>
          </motion.aside>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
