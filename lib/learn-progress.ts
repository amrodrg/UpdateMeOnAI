export interface StreakState {
  /** Last calendar day (YYYY-MM-DD, local) on which the learner made progress. */
  lastDay: string | null;
  /** Consecutive days with progress, counting the last day. */
  count: number;
}

export const EMPTY_STREAK: StreakState = { lastDay: null, count: 0 };

function dayDifference(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Returns the streak after the learner makes progress on `today`. Same-day activity does not add a day. */
export function bumpStreak(prev: StreakState, today: string): StreakState {
  if (prev.lastDay === today) return prev;
  if (prev.lastDay && dayDifference(prev.lastDay, today) === 1) {
    return { lastDay: today, count: prev.count + 1 };
  }
  return { lastDay: today, count: 1 };
}

/** The streak still counts if the learner was active today or yesterday. */
export function activeStreak(state: StreakState, today: string): number {
  if (!state.lastDay) return 0;
  const gap = dayDifference(state.lastDay, today);
  return gap === 0 || gap === 1 ? state.count : 0;
}

export function parseStreak(raw: unknown): StreakState {
  if (!raw || typeof raw !== "object") return EMPTY_STREAK;
  const { lastDay, count } = raw as Partial<StreakState>;
  const validDay = typeof lastDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(lastDay);
  const validCount = typeof count === "number" && Number.isInteger(count) && count >= 0;
  return validDay && validCount ? { lastDay, count } : EMPTY_STREAK;
}

export function localDay(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Score for one node's quiz, from the chosen answer index per question. */
export function quizScore(
  questions: { choices: { correct: boolean }[] }[],
  answers: Record<number, number>,
): { correct: number; total: number; answered: number } {
  let correct = 0;
  let answered = 0;
  questions.forEach((q, index) => {
    const picked = answers[index];
    if (picked === undefined) return;
    answered += 1;
    if (q.choices[picked]?.correct) correct += 1;
  });
  return { correct, total: questions.length, answered };
}
