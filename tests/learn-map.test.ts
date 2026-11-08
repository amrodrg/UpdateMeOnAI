import { describe, expect, it } from "vitest";
import { LEARN_NODES, LEARN_NODES_BY_ID, nextSuggestedNode } from "../lib/learn-map";

describe("learn map data", () => {
  it("has unique node ids", () => {
    const ids = LEARN_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only references prerequisites that exist and comes before the node's level", () => {
    for (const node of LEARN_NODES) {
      for (const prereq of node.prerequisites) {
        const from = LEARN_NODES_BY_ID[prereq];
        expect(from, `${node.id} -> ${prereq}`).toBeDefined();
        expect(from.level, `${node.id} must not come before ${prereq}`).toBeLessThanOrEqual(node.level);
      }
    }
  });

  it("has no prerequisite cycles", () => {
    const state = new Map<string, "visiting" | "done">();
    const visit = (id: string): void => {
      const s = state.get(id);
      if (s === "done") return;
      if (s === "visiting") throw new Error(`cycle at ${id}`);
      state.set(id, "visiting");
      for (const p of LEARN_NODES_BY_ID[id].prerequisites) visit(p);
      state.set(id, "done");
    };
    LEARN_NODES.forEach((n) => visit(n.id));
  });

  it("gives every node 2 or 3 quiz questions, each with exactly one correct choice and an explanation", () => {
    for (const node of LEARN_NODES) {
      expect([2, 3], node.id).toContain(node.quiz.length);
      for (const q of node.quiz) {
        expect(q.question.endsWith("?"), `${node.id}: ${q.question}`).toBe(true);
        expect(q.explanation.length, `${node.id}: ${q.question}`).toBeGreaterThan(0);
        expect(q.choices.filter((c) => c.correct), `${node.id}: ${q.question}`).toHaveLength(1);
      }
    }
  });

  it("gives every node a goal, steps, an example, a check question, and https sources", () => {
    for (const node of LEARN_NODES) {
      expect(node.goal.length, node.id).toBeGreaterThan(0);
      expect(node.steps.length, node.id).toBeGreaterThan(0);
      expect(node.example.code.length, node.id).toBeGreaterThan(0);
      expect(node.checkQuestion.endsWith("?"), node.id).toBe(true);
      expect(node.sources.length, node.id).toBeGreaterThan(0);
      for (const s of node.sources) {
        expect(s.url, `${node.id}: ${s.label}`).toMatch(/^https:\/\//);
      }
    }
  });

  it("gives every node a lastChecked date in YYYY-MM-DD format and at least one https source", () => {
    for (const node of LEARN_NODES) {
      expect(node.lastChecked, node.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(node.lastChecked)), node.id).toBe(false);
      expect(node.sources.length, node.id).toBeGreaterThan(0);
      expect(node.sources.some((s) => s.url.startsWith("https://")), node.id).toBe(true);
    }
  });

  it("suggests the first unlearned node whose prerequisites are learned", () => {
    expect(nextSuggestedNode(new Set())?.id).toBe(LEARN_NODES.find((n) => n.prerequisites.length === 0)?.id);
    const all = new Set(LEARN_NODES.map((n) => n.id));
    expect(nextSuggestedNode(all)).toBeUndefined();
  });
});
