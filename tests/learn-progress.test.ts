import { describe, expect, it } from "vitest";
import { activeStreak, bumpStreak, EMPTY_STREAK, parseStreak, quizScore } from "../lib/learn-progress";

describe("learn streak", () => {
  it("starts at one day on first progress", () => {
    expect(bumpStreak(EMPTY_STREAK, "2026-11-08")).toEqual({ lastDay: "2026-11-08", count: 1 });
  });

  it("does not double count the same day", () => {
    const first = bumpStreak(EMPTY_STREAK, "2026-11-08");
    expect(bumpStreak(first, "2026-11-08")).toBe(first);
  });

  it("extends across consecutive days, including month boundaries", () => {
    let state = bumpStreak(EMPTY_STREAK, "2026-10-31");
    state = bumpStreak(state, "2026-11-01");
    state = bumpStreak(state, "2026-11-02");
    expect(state.count).toBe(3);
  });

  it("resets after a missed day", () => {
    const state = bumpStreak({ lastDay: "2026-11-01", count: 4 }, "2026-11-03");
    expect(state).toEqual({ lastDay: "2026-11-03", count: 1 });
  });

  it("stays active for yesterday but drops after two missed days", () => {
    const state = { lastDay: "2026-11-08", count: 5 };
    expect(activeStreak(state, "2026-11-08")).toBe(5);
    expect(activeStreak(state, "2026-11-09")).toBe(5);
    expect(activeStreak(state, "2026-11-10")).toBe(0);
  });

  it("parses only valid stored values", () => {
    expect(parseStreak({ lastDay: "2026-11-08", count: 2 })).toEqual({ lastDay: "2026-11-08", count: 2 });
    expect(parseStreak({ lastDay: "yesterday", count: 2 })).toEqual(EMPTY_STREAK);
    expect(parseStreak({ lastDay: "2026-11-08", count: -1 })).toEqual(EMPTY_STREAK);
    expect(parseStreak(null)).toEqual(EMPTY_STREAK);
  });
});

describe("quiz score", () => {
  const questions = [
    { choices: [{ correct: true }, { correct: false }] },
    { choices: [{ correct: false }, { correct: true }] },
  ];

  it("counts correct and answered questions", () => {
    expect(quizScore(questions, { 0: 0, 1: 0 })).toEqual({ correct: 1, total: 2, answered: 2 });
  });

  it("ignores unanswered questions", () => {
    expect(quizScore(questions, { 1: 1 })).toEqual({ correct: 1, total: 2, answered: 1 });
  });
});
