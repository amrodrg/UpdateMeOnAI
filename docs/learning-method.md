# Learning method

This page explains how the `/learn` map teaches, and why it is built that way.

## Who it is for
A developer who already uses AI tools, wants to build reliable skills, custom agents, workflows, and teams of agents, and learns best by changing real files.

## Method
1. **Ladder of ideas.** The map has four levels: foundations, building blocks, orchestration, and teams with autonomy. Each level depends on the one before it, so no lesson assumes an idea that has not been introduced.
2. **Learn by doing.** Every lesson has short steps to run in your own repository. Reading alone does not count as learned.
3. **Check for understanding.** Each lesson ends with one question that needs an explanation, not a yes or no answer.
4. **Ground every claim in official docs.** Each lesson links to GitHub Copilot or Claude documentation. Facts that change often are pointed to, not copied.
5. **Make a visible sequence.** Prerequisites are drawn as lines. The "next" node is the first unlearned node whose prerequisites are done, which gives a clear next step without a fixed course order.
6. **Keep the reader in control.** Progress is saved only in the browser's local storage. There is no account and no tracking.

## Sources
- GitHub Copilot agent skills: https://docs.github.com/en/copilot/concepts/customizations/agent-skills
- GitHub Copilot custom agents: https://docs.github.com/en/copilot/concepts/customizations/custom-agents
- GitHub Copilot customization cheat sheet: https://docs.github.com/en/copilot/reference/customization-cheat-sheet
- Claude Code skills: https://code.claude.com/docs/en/skills
- Claude Code dynamic workflows: https://code.claude.com/docs/en/workflows.md
- Agent Skills open standard: https://agentskills.io

## Maintenance
When a source changes, update the matching lesson in `lib/learn-map.ts`. `tests/learn-map.test.ts` checks that the prerequisite graph has no cycles and that every lesson has https sources.
