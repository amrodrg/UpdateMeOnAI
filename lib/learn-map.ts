export interface SourceLink {
  label: string;
  url: string;
}

export interface QuizChoice {
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  question: string;
  /** Exactly one choice must have correct: true. */
  choices: QuizChoice[];
  /** One sentence shown after the learner answers. */
  explanation: string;
}

export interface LearnNode {
  id: string;
  title: string;
  /** Short description shown on the map node. */
  blurb: string;
  /** 1 = foundations … 4 = teams and autonomy. Sets the map column. */
  level: 1 | 2 | 3 | 4;
  /** Vertical slot within the column. Used only for layout. */
  row: number;
  /** Ids of nodes that should be learned first. */
  prerequisites: string[];
  /** What the learner should be able to do after this lesson. */
  goal: string;
  /** Concrete steps to try. */
  steps: string[];
  /** A small file or snippet to read. */
  example: { file: string; code: string };
  /** A question to check understanding. */
  checkQuestion: string;
  /** Multiple-choice questions answered client-side. Two or three per node. */
  quiz: QuizQuestion[];
  sources: SourceLink[];
}

export const LEVEL_LABELS: Record<LearnNode["level"], string> = {
  1: "Foundations",
  2: "Building blocks",
  3: "Orchestration",
  4: "Teams & autonomy",
};

export const LEARN_NODES: LearnNode[] = [
  {
    id: "prompts",
    title: "Prompts & context",
    blurb: "Say what you want, what good looks like, and what the model already knows.",
    level: 1,
    row: 0,
    prerequisites: [],
    goal: "Write a prompt with a goal, inputs, constraints, and an output format, and know which files to attach as context.",
    steps: [
      "Pick one repeated task you do each week.",
      "Write the prompt as: goal, context, constraints, output format.",
      "Run it twice. Change one line each time and note what changed.",
    ],
    example: {
      file: "prompt.md",
      code: `Goal: summarize today's AI news for a developer.
Context: @data/news.json
Constraints: max 5 bullets, each with a source link.
Output: markdown list.`,
    },
    checkQuestion: "Why does a prompt that names an output format usually give more consistent results?",
    quiz: [
      {
        question: "Which part of a prompt most directly makes the output shape consistent from run to run?",
        choices: [
          { text: "A longer prompt with more adjectives", correct: false },
          { text: "An explicit output format", correct: true },
          { text: "Writing the prompt in capital letters", correct: false },
        ],
        explanation: "A stated format removes guessing about structure, so each run returns the same shape of answer.",
      },
      {
        question: "Why attach a file as context instead of pasting its contents into the prompt?",
        choices: [
          { text: "Attached files are always more accurate than the model's answers", correct: false },
          { text: "It gives the model specific facts it does not already have, without retyping them", correct: true },
        ],
        explanation: "Context files supply the material the model needs for this task, and they stay with the prompt for reuse.",
      },
    ],
    sources: [
      {
        label: "Prompt files in Copilot",
        url: "https://docs.github.com/en/copilot/concepts/prompting-and-context/prompt-files",
      },
    ],
  },
  {
    id: "instructions",
    title: "Always-on instructions",
    blurb: "Rules that apply to every chat in a repository, written once.",
    level: 1,
    row: 2,
    prerequisites: [],
    goal: "Add repository instructions that set the project's conventions so you stop repeating them.",
    steps: [
      "List three rules you repeat in almost every prompt.",
      "Put them in .github/copilot-instructions.md (or AGENTS.md for other agents).",
      "Ask the agent a question and check that it follows the rules.",
    ],
    example: {
      file: ".github/copilot-instructions.md",
      code: `# Project conventions
- Use TypeScript strict mode.
- Put tests next to the code they cover.
- Keep components in components/, data helpers in lib/.`,
    },
    checkQuestion: "What belongs in always-on instructions, and what belongs in a skill?",
    quiz: [
      {
        question: "Where does this lesson say repository-wide, always-on instructions go?",
        choices: [
          { text: "In a file in a single chat session that you delete afterwards", correct: false },
          { text: ".github/copilot-instructions.md", correct: true },
          { text: "In the package.json scripts field", correct: false },
        ],
        explanation: "Repository instructions are read for chats in that repository, so you write the rules once.",
      },
      {
        question: "Which kind of content suits a skill better than always-on instructions?",
        choices: [
          { text: "A short rule that applies to every task, such as using strict TypeScript", correct: false },
          { text: "A repeatable procedure that is only needed when a matching task comes up", correct: true },
        ],
        explanation: "Skills load only when the task matches, so long procedures do not clutter every chat.",
      },
    ],
    sources: [
      {
        label: "Custom instructions",
        url: "https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions",
      },
    ],
  },
  {
    id: "tools",
    title: "Tools & MCP",
    blurb: "Let the agent read live data and take actions through connected services.",
    level: 2,
    row: 0,
    prerequisites: ["prompts"],
    goal: "Explain what a tool is, connect one MCP server, and say when the agent should use it.",
    steps: [
      "Name one task that needs live data (issues, docs, a database).",
      "Find an MCP server for it and read its tool list before connecting.",
      "Ask the agent a question that needs the tool. Check the tool call in the log.",
    ],
    example: {
      file: ".mcp.json",
      code: `{
  "mcpServers": {
    "docs": {
      "command": "npx",
      "args": ["-y", "some-docs-mcp-server"]
    }
  }
}`,
    },
    checkQuestion: "What is the difference between a model answering from memory and an agent calling a tool?",
    quiz: [
      {
        question: "What does a tool let an agent do that a model answering from memory cannot?",
        choices: [
          { text: "Make the answer longer and more detailed", correct: false },
          { text: "Read live data or act through a connected service while it works", correct: true },
          { text: "Skip the prompt entirely", correct: false },
        ],
        explanation: "A tool call fetches current data or performs an action, instead of relying only on what the model learned earlier.",
      },
      {
        question: "What does the mcpServers block in .mcp.json define?",
        choices: [
          { text: "The servers the agent can connect to for its tools", correct: true },
          { text: "The steps of a skill", correct: false },
        ],
        explanation: "Each entry names a server, and the agent can then call the tools that server provides.",
      },
    ],
    sources: [
      { label: "Model Context Protocol", url: "https://modelcontextprotocol.io" },
      {
        label: "Copilot customization cheat sheet",
        url: "https://docs.github.com/en/copilot/reference/customization-cheat-sheet",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    blurb: "A folder with a SKILL.md that teaches one repeatable procedure.",
    level: 2,
    row: 1,
    prerequisites: ["instructions"],
    goal: "Write a SKILL.md with a clear name and description, and know that the agent loads it only when the task matches.",
    steps: [
      "Pick a procedure you explain often, such as writing release notes.",
      "Create .github/skills/<name>/SKILL.md with name and description in the frontmatter.",
      "Put the steps in the body. Move long reference material into extra files in the same folder.",
      "Test with a prompt whose wording matches the description.",
    ],
    example: {
      file: ".github/skills/release-notes/SKILL.md",
      code: `---
name: release-notes
description: Write release notes from merged pull requests. Use when the user asks for a changelog or release notes.
---
1. List merged PRs since the last tag.
2. Group them into Features, Fixes, and Chores.
3. Write one line per PR with its number.`,
    },
    checkQuestion: "Why is the description in the frontmatter the most important line of a skill?",
    quiz: [
      {
        question: "What does the agent use to decide whether to load a skill?",
        choices: [
          { text: "The name and description in the SKILL.md frontmatter", correct: true },
          { text: "The file size of the skill folder", correct: false },
          { text: "Whether the skill is listed in package.json", correct: false },
        ],
        explanation: "The agent matches the task against the description, so a vague description means the skill is missed.",
      },
      {
        question: "Where can a project skill be stored in the repository?",
        choices: [
          { text: "In .github/skills/<name>/SKILL.md", correct: true },
          { text: "Only in a file named README.md at the repository root", correct: false },
        ],
        explanation: "Project skills live under .github/skills (or .claude/skills or .agents/skills), one folder per skill.",
      },
    ],
    sources: [
      {
        label: "Agent skills for Copilot",
        url: "https://docs.github.com/en/copilot/concepts/customizations/agent-skills",
      },
      { label: "Extend Claude with skills", url: "https://code.claude.com/docs/en/skills" },
      { label: "Agent Skills open standard", url: "https://agentskills.io" },
    ],
  },
  {
    id: "agents",
    title: "Custom agents",
    blurb: "A specialist persona with its own instructions and a limited set of tools.",
    level: 2,
    row: 2,
    prerequisites: ["instructions"],
    goal: "Create a custom agent for one job and restrict the tools it can use.",
    steps: [
      "Choose a role with a narrow job, such as a reviewer that only reads code.",
      "Create .github/agents/<name>.md with a name, a description, and its instructions.",
      "Restrict tools with the tools property in the frontmatter. A reviewer does not need to edit files.",
      "Run it on a small change and check that it stays in its role.",
    ],
    example: {
      file: ".github/agents/reviewer.md",
      code: `---
name: reviewer
description: Reviews a diff for bugs and missing tests. Read-only.
tools: ["read", "search"]
---
You review changes. Report findings with file and line. Do not edit files.`,
    },
    checkQuestion: "What does a custom agent add that a single prompt does not?",
    quiz: [
      {
        question: "Which frontmatter property is required for a custom agent?",
        choices: [
          { text: "tools", correct: false },
          { text: "model", correct: false },
          { text: "description", correct: true },
        ],
        explanation: "The description is the only required property; name, tools, and model are optional.",
      },
      {
        question: "What happens when an agent has tools: [] in its frontmatter?",
        choices: [
          { text: "All tools are enabled", correct: false },
          { text: "All tools are disabled for the agent", correct: true },
        ],
        explanation: "An empty list turns every tool off, while omitting the tools property enables all of them.",
      },
    ],
    sources: [
      {
        label: "Custom agents",
        url: "https://docs.github.com/en/copilot/concepts/customizations/custom-agents",
      },
      {
        label: "Custom agents configuration (frontmatter reference)",
        url: "https://docs.github.com/en/copilot/reference/custom-agents-configuration",
      },
    ],
  },
  {
    id: "subagents",
    title: "Subagents",
    blurb: "A main agent hands a piece of work to a helper with its own clean context.",
    level: 3,
    row: 2,
    prerequisites: ["agents"],
    goal: "Split one large task into parts that run in separate contexts and merge their results.",
    steps: [
      "Take a task that reads many files, such as auditing a codebase.",
      "Describe the sub-task with its inputs, the stop condition, and the output format.",
      "Ask for a short report back, not the full reading history.",
    ],
    example: {
      file: "delegation.txt",
      code: `Task: check every page in app/ for missing alt text.
Stop when every file is checked.
Return: a list of file:line, one per line. Nothing else.`,
    },
    checkQuestion: "Why does a subagent return a short report instead of its whole working history?",
    quiz: [
      {
        question: "What is the main benefit of giving a subagent its own context?",
        choices: [
          { text: "Its reading history does not fill up the main conversation", correct: true },
          { text: "It can edit files without any permission", correct: false },
          { text: "It always finishes faster than the main agent", correct: false },
        ],
        explanation: "A separate context keeps the bulk of the reading out of the main conversation, which only needs the result.",
      },
      {
        question: "Which part belongs in the brief you give a subagent?",
        choices: [
          { text: "The inputs, a stop condition, and the output format", correct: true },
          { text: "Your entire chat history with the model", correct: false },
        ],
        explanation: "A clear brief lets the subagent work without guessing when to stop or what to return.",
      },
    ],
    sources: [
      {
        label: "Use subagents in Copilot",
        url: "https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-subagents",
      },
    ],
  },
  {
    id: "workflows",
    title: "Workflows",
    blurb: "Fixed steps run in order, with checks between them, so the outcome is repeatable.",
    level: 3,
    row: 1,
    prerequisites: ["skills", "tools"],
    goal: "Chain a skill and a tool into one workflow with a check at the end.",
    steps: [
      "Write the steps of a task as a numbered list before automating it.",
      "Mark which step needs a tool and which needs a human decision.",
      "Add a verification step (tests, lint, or a diff review) at the end.",
    ],
    example: {
      file: "workflow.md",
      code: `1. Fetch new items (tool: news feed).
2. Summarize each item (skill: summarize-news).
3. Run tests (check: npm test).
4. Open a pull request only if the tests pass.`,
    },
    checkQuestion: "Where should a workflow stop and wait for a person?",
    quiz: [
      {
        question: "Why end a workflow with a verification step?",
        choices: [
          { text: "So a bad result is caught before it is used or merged", correct: true },
          { text: "So the workflow runs more slowly and costs less", correct: false },
        ],
        explanation: "A check such as tests or a diff review is what makes the outcome repeatable and safe to act on.",
      },
      {
        question: "Which step should stop and wait for a person?",
        choices: [
          { text: "A step that needs a human decision", correct: true },
          { text: "A step that fetches a list of news items", correct: false },
        ],
        explanation: "The lesson marks steps that need a human decision so the workflow pauses there instead of guessing.",
      },
    ],
    sources: [
      {
        label: "Dynamic workflows in Claude Code",
        url: "https://code.claude.com/docs/en/workflows.md",
      },
    ],
  },
  {
    id: "teams",
    title: "Teams of agents",
    blurb: "Several specialist agents, each with one job, coordinated by a lead.",
    level: 4,
    row: 1,
    prerequisites: ["subagents", "workflows"],
    goal: "Design a team of three or four agents with clear handoffs and one owner who decides.",
    steps: [
      "Draw the team: a lead, then one agent per job (research, write, review).",
      "Define what each handoff contains, so no agent has to guess.",
      "Give the reviewer the final say on whether a result is accepted.",
    ],
    example: {
      file: "team.md",
      code: `Lead: plans the work and merges results.
Researcher: finds sources. Output: list of links with notes.
Writer: drafts the change. Output: a diff.
Reviewer: checks the diff. Output: approve or list of fixes.`,
    },
    checkQuestion: "Why should a team have one agent that decides, not several that all can?",
    quiz: [
      {
        question: "Why should exactly one agent in a team have the final say?",
        choices: [
          { text: "So there is one clear owner for accepting results, with no conflicting decisions", correct: true },
          { text: "So the other agents never have to write any output", correct: false },
        ],
        explanation: "One owner prevents two agents from accepting or rejecting the same result in different ways.",
      },
      {
        question: "What should each handoff between agents contain?",
        choices: [
          { text: "Nothing, because agents can guess what the next one needs", correct: false },
          { text: "The output format and the information the next agent needs", correct: true },
        ],
        explanation: "A defined handoff means no agent has to guess what the previous one produced.",
      },
    ],
    sources: [
      {
        label: "Use subagents in Copilot",
        url: "https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-subagents",
      },
    ],
  },
  {
    id: "autonomy",
    title: "Autonomy & guardrails",
    blurb: "Let agents run on their own, with limits, logs, and a human approval gate.",
    level: 4,
    row: 3,
    prerequisites: ["teams"],
    goal: "Set up an autonomous run with limits on scope, permissions, and a required human review before merge.",
    steps: [
      "Write the stop conditions: maximum steps, allowed files, and what counts as done.",
      "Give the agent the smallest permissions it needs.",
      "Require a pull request review before anything merges.",
      "Read the log after each run and adjust the limits.",
    ],
    example: {
      file: "guardrails.md",
      code: `Allowed paths: app/, components/, lib/, tests/
Max steps: 30
Done when: npm test and npm run lint pass.
Never: push to main, change secrets, delete data.
Output: a pull request for human review.`,
    },
    checkQuestion: "Which single guardrail would have prevented the most damage if an agent went wrong?",
    quiz: [
      {
        question: "Why require a pull request review before anything merges?",
        choices: [
          { text: "A person checks the change before it reaches the main branch", correct: true },
          { text: "It makes the agent run faster", correct: false },
        ],
        explanation: "A human review is the approval gate that stops an unchecked autonomous change from landing.",
      },
      {
        question: "Which is a good done condition for an autonomous run?",
        choices: [
          { text: "The agent says it feels finished", correct: false },
          { text: "A check you can run passes, such as npm test", correct: true },
        ],
        explanation: "A runnable check gives a clear, verifiable stop point instead of relying on the agent's own opinion.",
      },
    ],
    sources: [
      {
        label: "GitHub Copilot in the cloud",
        url: "https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github",
      },
    ],
  },
];

export const LEARN_NODES_BY_ID: Record<string, LearnNode> = Object.fromEntries(
  LEARN_NODES.map((node) => [node.id, node]),
);

/** Returns the first node that is not learned yet and whose prerequisites are all learned. */
export function nextSuggestedNode(learned: ReadonlySet<string>): LearnNode | undefined {
  return LEARN_NODES.find(
    (node) =>
      !learned.has(node.id) && node.prerequisites.every((prereq) => learned.has(prereq)),
  );
}
