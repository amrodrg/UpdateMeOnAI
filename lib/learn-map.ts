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

/** Hands-on practice with an answer key the learner can reveal. */
export type Exercise = RewriteExercise | SpotMistakeExercise | OrderExercise;

interface ExerciseBase {
  id: string;
  title: string;
  /** What the learner is asked to do. */
  prompt: string;
}

/** Rewrite a weak prompt or instruction into a strong one. */
export interface RewriteExercise extends ExerciseBase {
  kind: "rewrite";
  weakText: string;
  /** One strong example rewrite. Several answers may be valid. */
  answerKey: string;
}

/** Pick the one line or statement that is wrong in a snippet. */
export interface SpotMistakeExercise extends ExerciseBase {
  kind: "spot-mistake";
  file: string;
  code: string;
  /** Exactly one choice must have correct: true. */
  choices: QuizChoice[];
  /** One sentence shown after the answer is revealed. */
  explanation: string;
}

/** Put scrambled workflow steps into the correct order. */
export interface OrderExercise extends ExerciseBase {
  kind: "order";
  /** Steps shown to the learner in scrambled order. */
  items: string[];
  /** The same steps in the correct order. */
  answerKey: string[];
}

/** A short situation with one best action. Each choice explains itself. */
export interface ScenarioQuestion {
  scenario: string;
  question: string;
  /** Exactly one choice must have correct: true. */
  choices: ScenarioChoice[];
  /** Official page that supports the correct answer. */
  source: SourceLink;
}

export interface ScenarioChoice {
  text: string;
  correct: boolean;
  /** Shown after the learner picks this choice. */
  feedback: string;
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
  /** Hands-on exercises with answer keys. Three to five per node. */
  exercises: Exercise[];
  /** Scenario-based questions with per-choice feedback and a source. */
  scenarios: ScenarioQuestion[];
  /** Date the sources were last checked against the official docs, YYYY-MM-DD. */
  lastChecked: string;
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "prompts-rewrite",
        kind: "rewrite",
        title: "Make a vague request specific",
        prompt: "Rewrite the weak request so it has a goal, context, constraints, and an output format.",
        weakText: "Make the code better.",
        answerKey:
          "Refactor src/utils/date.ts to remove the duplicated timezone logic. Keep the public function names. Add one unit test for a UTC input. Output a short summary of the changes.",
      },
      {
        id: "prompts-spot",
        kind: "spot-mistake",
        title: "Find the vague line",
        prompt: "Which line makes the result hard to check?",
        file: "prompt.md",
        code: `Goal: write a test for the parser.
Context: src/parser.ts
Output: whatever you think is best`,
        choices: [
          { text: "Output: whatever you think is best", correct: true },
          { text: "Goal: write a test for the parser.", correct: false },
          { text: "Context: src/parser.ts", correct: false },
        ],
        explanation: "An open output format gives you nothing to check the answer against.",
      },
      {
        id: "prompts-order",
        kind: "order",
        title: "Order a good prompt",
        prompt: "Put these prompt parts in a sensible order.",
        items: ["Attach the relevant file", "Ask for a format", "State the goal", "Write the constraints"],
        answerKey: ["State the goal", "Attach the relevant file", "Write the constraints", "Ask for a format"],
      },
    ],
    scenarios: [
      {
        scenario: "Copilot's first fix ignores your failing test.",
        question: "What should you add to the next prompt?",
        choices: [
          { text: "The failing test output and the expected behavior", correct: true, feedback: "Yes. Concrete evidence lets the model target the real failure." },
          { text: "The same words, asked again", correct: false, feedback: "Repeating the same prompt usually gives the same miss." },
          { text: "More adjectives like 'very robust'", correct: false, feedback: "Adjectives do not add information the model can act on." },
        ],
        source: { label: "Prompt files", url: "https://docs.github.com/en/copilot/concepts/prompting-and-context/prompt-files" },
      },
    ],
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "instructions-rewrite",
        kind: "rewrite",
        title: "Turn a wish into a rule",
        prompt: "Rewrite the weak rule so Copilot can follow it and you can check it.",
        weakText: "Be nice and follow good practices.",
        answerKey:
          "Use TypeScript strict mode. Put tests next to the code they test. Run npm test before finishing. Do not edit generated files in dist/.",
      },
      {
        id: "instructions-spot",
        kind: "spot-mistake",
        title: "Find the conflicting rule",
        prompt: "Which line conflicts with the scope above it?",
        file: ".github/instructions/typescript.instructions.md",
        code: `applyTo: "**/*.ts"
Always write Python instead.`,
        choices: [
          { text: "Always write Python instead conflicts with a TypeScript-only scope", correct: true },
          { text: "applyTo is not a real field", correct: false },
        ],
        explanation: "The scope targets TypeScript files, so a rule that says to write Python contradicts it.",
      },
      {
        id: "instructions-order",
        kind: "order",
        title: "Order the instruction setup",
        prompt: "Put these steps in the order you would do them.",
        items: ["Check a response follows it", "Save in the instructions file", "Write the rule", "Choose where it applies"],
        answerKey: ["Write the rule", "Choose where it applies", "Save in the instructions file", "Check a response follows it"],
      },
    ],
    scenarios: [
      {
        scenario: "Your team wants one rule that applies only to TypeScript files.",
        question: "Which setup fits best?",
        choices: [
          { text: "A path-scoped instructions file that uses applyTo", correct: true, feedback: "Yes. The scope keeps the rule off unrelated files." },
          { text: "One global rule that mentions TypeScript", correct: false, feedback: "A global rule applies everywhere, which is more than you asked for." },
          { text: "Pasting the rule into every prompt", correct: false, feedback: "That works once, but people forget it and it is not shared." },
        ],
        source: { label: "Custom instructions", url: "https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions" },
      },
    ],
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "tools-rewrite",
        kind: "rewrite",
        title: "Scope a tool request",
        prompt: "Rewrite the request so it names the tool, the scope, and what must not change.",
        weakText: "Check the database.",
        answerKey:
          "Use the read-only database tool to list tables in the staging schema and summarize row counts. Do not write or delete anything.",
      },
      {
        id: "tools-spot",
        kind: "spot-mistake",
        title: "Find the over-broad grant",
        prompt: "Which line gives the agent more power than the task needs?",
        file: "agent-task.md",
        code: `Task: list stale branch names
Tools: all`,
        choices: [
          { text: "Tools: all, for a read-only listing task", correct: true },
          { text: "Task: list stale branch names", correct: false },
        ],
        explanation: "A listing task only needs read access, so granting every tool is more than it needs.",
      },
      {
        id: "tools-order",
        kind: "order",
        title: "Order the tool setup",
        prompt: "Put the steps in a safe order.",
        items: ["Run and review the tool calls", "Limit permissions", "Name the task", "List the tools it needs"],
        answerKey: ["Name the task", "List the tools it needs", "Limit permissions", "Run and review the tool calls"],
      },
    ],
    scenarios: [
      {
        scenario: "An agent needs to read issues, but its token can also close them.",
        question: "What is the safest change?",
        choices: [
          { text: "Limit the agent to read access for issues", correct: true, feedback: "Yes. It can still do the reading without the power to change anything." },
          { text: "Leave it, since it probably will not close issues", correct: false, feedback: "Hoping an agent will not misuse a permission is not a control." },
          { text: "Give it admin access to be safe", correct: false, feedback: "Admin access is the opposite of least privilege." },
        ],
        source: { label: "Customization cheat sheet", url: "https://docs.github.com/en/copilot/reference/customization-cheat-sheet" },
      },
    ],
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "skills-rewrite",
        kind: "rewrite",
        title: "Write a skill description",
        prompt: "Rewrite the description so it says when the skill should run.",
        weakText: "Helps with PRs.",
        answerKey:
          "Use when the user asks to review a pull request. Reads the diff, checks tests, and lists findings by severity.",
      },
      {
        id: "skills-spot",
        kind: "spot-mistake",
        title: "Find the bad skill name",
        prompt: "Which frontmatter line breaks the naming format?",
        file: "SKILL.md",
        code: `---
name: Review PR
description: Use when the user asks to review a pull request.
---`,
        choices: [
          { text: "name: Review PR has capitals and a space", correct: true },
          { text: "description: Use when the user asks to review a pull request.", correct: false },
        ],
        explanation: "Skill names use lowercase letters, numbers, and hyphens, so 'Review PR' does not match.",
      },
      {
        id: "skills-order",
        kind: "order",
        title: "Order the skill build",
        prompt: "Put the steps in the order you would build a skill.",
        items: ["Test by asking for the task", "Write the description", "Add the steps in the body", "Create the folder and SKILL.md"],
        answerKey: ["Create the folder and SKILL.md", "Write the description", "Add the steps in the body", "Test by asking for the task"],
      },
    ],
    scenarios: [
      {
        scenario: "Your skill never runs, even when you ask for the task.",
        question: "What should you check first?",
        choices: [
          { text: "Whether the description says when the skill applies", correct: true, feedback: "Yes. The description is what the agent uses to decide when to load a skill." },
          { text: "Whether the skill body is long", correct: false, feedback: "Length does not stop a skill from being chosen." },
          { text: "Whether the file is named in capitals", correct: false, feedback: "The file is named SKILL.md by convention, and the description is the trigger." },
        ],
        source: { label: "Agent skills", url: "https://docs.github.com/en/copilot/concepts/customizations/agent-skills" },
      },
    ],
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "agents-rewrite",
        kind: "rewrite",
        title: "Narrow an agent's job",
        prompt: "Rewrite the request for a single focused agent with clear limits.",
        weakText: "Make an agent that does everything.",
        answerKey:
          "Create a read-only reviewer agent. Its description says it reviews a diff for bugs and missing tests. Tools: read and search only. Output: findings with file and line.",
      },
      {
        id: "agents-spot",
        kind: "spot-mistake",
        title: "Find the unsafe agent setting",
        prompt: "Which line is the risky part of this agent setup?",
        file: ".github/agents/reviewer.agent.md",
        code: `---
name: reviewer
tools: [all]
---
Review the change, then fix anything you find.`,
        choices: [
          { text: "tools: [all] with an instruction to fix, not just review", correct: true },
          { text: "name: reviewer", correct: false },
        ],
        explanation: "A reviewer that can edit everything is no longer a read-only check, so the tools should be narrowed.",
      },
      {
        id: "agents-order",
        kind: "order",
        title: "Order the agent build",
        prompt: "Put these steps in order for a new custom agent.",
        items: ["Invoke it on a real task", "Write the description and tools", "Save as an agent file", "Give it a focused job"],
        answerKey: ["Give it a focused job", "Write the description and tools", "Save as an agent file", "Invoke it on a real task"],
      },
    ],
    scenarios: [
      {
        scenario: "A custom agent meant only for review keeps editing files.",
        question: "What is the right fix?",
        choices: [
          { text: "Remove the write tools and keep only read and search", correct: true, feedback: "Yes. The tool list is what limits what the agent can do." },
          { text: "Tell it in the prompt not to edit", correct: false, feedback: "A prompt request is weaker than removing the permission." },
          { text: "Add more write tools so it has more to do", correct: false, feedback: "That widens the problem instead of fixing it." },
        ],
        source: { label: "Custom agents configuration", url: "https://docs.github.com/en/copilot/reference/custom-agents-configuration" },
      },
    ],
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "subagents-rewrite",
        kind: "rewrite",
        title: "Give a subagent a bounded job",
        prompt: "Rewrite the task so the subagent has one question and a read-only scope.",
        weakText: "Use subagents for stuff.",
        answerKey:
          "Use a subagent to find every caller of formatDate and return file paths and line numbers. Do not edit any files.",
      },
      {
        id: "subagents-spot",
        kind: "spot-mistake",
        title: "Find the conflict risk",
        prompt: "Which line risks two agents overwriting each other?",
        file: "plan.md",
        code: `Task: refactor all modules
Subagents: 2, both edit src/index.ts`,
        choices: [
          { text: "Both subagents edit src/index.ts at the same time", correct: true },
          { text: "Task: refactor all modules", correct: false },
        ],
        explanation: "Two agents editing one file at once can conflict, so give each one a separate file or run them in sequence.",
      },
      {
        id: "subagents-order",
        kind: "order",
        title: "Order the delegation",
        prompt: "Put the delegation steps in order.",
        items: ["Check the combined result", "Summarize the results", "Assign each part to a subagent", "Split work into separate parts"],
        answerKey: ["Split work into separate parts", "Assign each part to a subagent", "Summarize the results", "Check the combined result"],
      },
    ],
    scenarios: [
      {
        scenario: "Two subagents both need to change the same file.",
        question: "What should you do?",
        choices: [
          { text: "Run them one after the other, or give the file to only one of them", correct: true, feedback: "Yes. One writer per file avoids conflicting edits." },
          { text: "Run both at once and merge the file by hand later", correct: false, feedback: "Parallel edits to one file are the conflict you want to avoid." },
          { text: "Let each agent keep its own copy of the same file", correct: false, feedback: "Copies diverge and make the merge harder." },
        ],
        source: { label: "Use subagents", url: "https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-subagents" },
      },
    ],
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "workflows-rewrite",
        kind: "rewrite",
        title: "Define workflow steps",
        prompt: "Rewrite the request as ordered steps with a stop rule.",
        weakText: "Make a workflow.",
        answerKey:
          "Three steps: lint, test, build. Stop at the first failure. Save a summary of failures to a file.",
      },
      {
        id: "workflows-spot",
        kind: "spot-mistake",
        title: "Find the unsafe order",
        prompt: "Which step order is unsafe?",
        file: "workflow.md",
        code: `Step 1: deploy to production
Step 2: run the tests`,
        choices: [
          { text: "Deploying before the tests run can ship broken code", correct: true },
          { text: "Step 2 comes after step 1", correct: false },
        ],
        explanation: "Tests should gate the deploy, so running them after deploying lets broken code reach users.",
      },
      {
        id: "workflows-order",
        kind: "order",
        title: "Order a release workflow",
        prompt: "Put the release steps in a safe order.",
        items: ["Deploy to production", "Write the change summary", "Build the site", "Run the tests"],
        answerKey: ["Run the tests", "Build the site", "Deploy to production", "Write the change summary"],
      },
    ],
    scenarios: [
      {
        scenario: "A workflow step fails halfway through.",
        question: "What should the workflow do?",
        choices: [
          { text: "Stop and report the failing step with its logs", correct: true, feedback: "Yes. Stopping keeps later steps from running on a broken state." },
          { text: "Skip the failed step and continue", correct: false, feedback: "Skipping can hide the failure and ship a broken result." },
          { text: "Restart the whole workflow forever", correct: false, feedback: "Retrying without a limit never ends and hides the cause." },
        ],
        source: { label: "Extend Claude with workflows", url: "https://code.claude.com/docs/en/workflows.md" },
      },
    ],
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "teams-rewrite",
        kind: "rewrite",
        title: "Define team roles",
        prompt: "Rewrite the request as roles with a fixed hand-off between them.",
        weakText: "A team of agents to build everything.",
        answerKey:
          "Three roles: a planner writes a short plan, an implementer edits code on one branch, and a reviewer checks tests and lists issues. Each role writes a fixed output the next role reads.",
      },
      {
        id: "teams-spot",
        kind: "spot-mistake",
        title: "Find the wrong hand-off",
        prompt: "Which line breaks the team's hand-off order?",
        file: "team.md",
        code: `reviewer runs first
planner runs last`,
        choices: [
          { text: "The reviewer runs before the plan exists", correct: true },
          { text: "The team has a reviewer at all", correct: false },
        ],
        explanation: "The reviewer needs the plan and the change to check, so the hand-off order is backwards.",
      },
      {
        id: "teams-order",
        kind: "order",
        title: "Order the team hand-off",
        prompt: "Put the team steps in order.",
        items: ["Merge after human approval", "Review the change", "Implement the plan", "Plan the work"],
        answerKey: ["Plan the work", "Implement the plan", "Review the change", "Merge after human approval"],
      },
    ],
    scenarios: [
      {
        scenario: "A team of agents keeps passing work back and forth without finishing.",
        question: "What fixes it most directly?",
        choices: [
          { text: "A clear stop condition and a fixed output format for each role", correct: true, feedback: "Yes. A stop rule and fixed outputs end the loop." },
          { text: "More agents in the team", correct: false, feedback: "More agents usually adds more back-and-forth." },
          { text: "Longer prompts for each agent", correct: false, feedback: "Length does not define when work is done." },
        ],
        source: { label: "Use subagents", url: "https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-subagents" },
      },
    ],
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
    lastChecked: "2026-11-08",
    exercises: [
      {
        id: "autonomy-rewrite",
        kind: "rewrite",
        title: "Set autonomy limits",
        prompt: "Rewrite the request with a step limit, allowed paths, a done check, and a review gate.",
        weakText: "Let the agent run forever.",
        answerKey:
          "Max 30 steps. Edit only app/ and tests/. Done when npm test passes. Open a pull request for human review. Never push to main.",
      },
      {
        id: "autonomy-spot",
        kind: "spot-mistake",
        title: "Find the missing gate",
        prompt: "Which line removes the human review gate?",
        file: "guardrails.md",
        code: `Max steps: none
Merge: automatic on success`,
        choices: [
          { text: "Merge: automatic on success, with no review", correct: true },
          { text: "Max steps: none", correct: false },
        ],
        explanation: "Automatic merge with no review removes the human approval gate, which is the most important limit.",
      },
      {
        id: "autonomy-order",
        kind: "order",
        title: "Order an autonomous run",
        prompt: "Put the autonomous-run steps in order.",
        items: ["Read the log and adjust limits", "Require review before merge", "Run the agent", "Set stop conditions"],
        answerKey: ["Set stop conditions", "Run the agent", "Read the log and adjust limits", "Require review before merge"],
      },
    ],
    scenarios: [
      {
        scenario: "During an autonomous run, the agent decides it should delete old data to free space.",
        question: "What should the setup do?",
        choices: [
          { text: "Block the action and require a human to approve it", correct: true, feedback: "Yes. Destructive steps should stay behind a human gate." },
          { text: "Let it run, since it chose the step", correct: false, feedback: "The agent's own choice is not an approval." },
          { text: "Delete and ask forgiveness later", correct: false, feedback: "Destructive actions need approval before they happen." },
        ],
        source: { label: "GitHub Copilot in the cloud", url: "https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github" },
      },
    ],
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
  {
    id: "cheat-sheet",
    lastChecked: "2026-11-08",
    title: "Copilot cheat sheet",
    blurb: "Shortcuts, slash commands, mentions, and modes in one place.",
    level: 1,
    row: 1,
    prerequisites: [],
    goal: "Use the common slash commands, @ mentions, and chat modes without looking them up.",
    steps: [
      "Type / in the chat box to see the commands your editor offers.",
      "Use @ to attach files, issues, or pull requests as context.",
      "Use /new to start a fresh conversation and /clear to empty the current one.",
      "Pick a mode before a big task: agent mode can edit several files and run commands.",
    ],
    example: {
      file: "chat-prompt.md",
      code: `/new
@src/parser.ts Fix the off-by-one error in parseLine.
Keep the public API the same and run npm test.`,
    },
    checkQuestion: "Which command starts a fresh conversation?",
    quiz: [
      {
        question: "Which prefix attaches a file or issue as context?",
        choices: [
          { text: "@", correct: true },
          { text: "/", correct: false },
        ],
        explanation: "@ mentions attach context, while / runs slash commands.",
      },
      {
        question: "Which slash command starts a new conversation?",
        choices: [
          { text: "/new", correct: true },
          { text: "/delete", correct: false },
        ],
        explanation: "/new starts a new conversation, while /delete removes one.",
      },
    ],
    exercises: [
      {
        id: "cheat-rewrite",
        kind: "rewrite",
        title: "Use the right prefix",
        prompt: "Rewrite the request using the right command and mention syntax.",
        weakText: "Use the chat thing and attach the parser file somehow.",
        answerKey: "Start with /new, then type @src/parser.ts to attach the file, and describe the task.",
      },
      {
        id: "cheat-spot",
        kind: "spot-mistake",
        title: "Find the wrong prefix",
        prompt: "Which line uses the wrong prefix?",
        file: "chat-prompt.md",
        code: `@new
Fix the failing test in parser.test.ts`,
        choices: [
          { text: "@new should be /new, because it is a slash command", correct: true },
          { text: "Fix the failing test in parser.test.ts", correct: false },
        ],
        explanation: "New conversations start with a slash command, while @ attaches context.",
      },
      {
        id: "cheat-order",
        kind: "order",
        title: "Order a chat task",
        prompt: "Put these steps in a sensible order for a multi-file change.",
        items: ["Check the result", "Send the prompt", "Attach context with @", "Pick agent mode"],
        answerKey: ["Pick agent mode", "Attach context with @", "Send the prompt", "Check the result"],
      },
    ],
    scenarios: [
      {
        scenario: "You want a fresh conversation without the old context.",
        question: "Which command should you type?",
        choices: [
          { text: "/new", correct: true, feedback: "Yes. /new starts a new conversation." },
          { text: "@new", correct: false, feedback: "@ attaches context, so it is the wrong prefix here." },
          { text: "/rename", correct: false, feedback: "/rename renames the conversation, it does not start one." },
        ],
        source: { label: "Copilot Chat cheat sheet", url: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet" },
      },
    ],
    sources: [
      { label: "Copilot Chat cheat sheet", url: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet" },
      { label: "Using agent mode in your IDE", url: "https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-agent-mode" },
    ],
  },
  {
    id: "models",
    lastChecked: "2026-11-08",
    title: "Auto model selection",
    blurb: "Let Copilot pick the model, or choose the cost and quality tier yourself.",
    level: 3,
    row: 0,
    prerequisites: ["tools"],
    goal: "Choose Auto in the model picker and pick the tier that matches the task.",
    steps: [
      "Open the model picker and choose Auto for everyday tasks.",
      "Pick Efficiency for quick, simple work and Intelligence for hard reasoning.",
      "Check which model handled a task when cost or quality matters.",
    ],
    example: {
      file: "model-choice.md",
      code: `Task: rename a helper across 3 files
Model: Auto, tier Efficiency
Task: design a migration plan with rollback
Model: Auto, tier Intelligence`,
    },
    checkQuestion: "Which tier suits a hard reasoning task?",
    quiz: [
      {
        question: "What does choosing Auto in the model picker do?",
        choices: [
          { text: "Copilot routes each task to a suitable model", correct: true },
          { text: "Copilot always uses the largest model", correct: false },
        ],
        explanation: "Auto selection picks a model per task based on complexity and availability.",
      },
      {
        question: "Which tier favors quality for hard tasks?",
        choices: [
          { text: "Intelligence", correct: true },
          { text: "Efficiency", correct: false },
        ],
        explanation: "Intelligence prioritizes quality, while Efficiency prioritizes cost and speed.",
      },
    ],
    exercises: [
      {
        id: "models-rewrite",
        kind: "rewrite",
        title: "Choose a tier with a reason",
        prompt: "Rewrite the request so the tier choice matches the task.",
        weakText: "Use the best model for everything.",
        answerKey: "Use Auto with the Efficiency tier for the simple rename, and Intelligence for the migration plan.",
      },
      {
        id: "models-spot",
        kind: "spot-mistake",
        title: "Find the wasteful choice",
        prompt: "Which line wastes cost on a simple task?",
        file: "model-choice.md",
        code: `Task: rename a variable
Tier: Intelligence`,
        choices: [
          { text: "Tier: Intelligence on a simple rename", correct: true },
          { text: "Task: rename a variable", correct: false },
        ],
        explanation: "A simple rename does not need the highest-quality tier, and Efficiency is the better fit.",
      },
      {
        id: "models-order",
        kind: "order",
        title: "Order the model choice",
        prompt: "Put the steps in order for choosing a model.",
        items: ["Check which model handled it", "Pick the tier", "Open the model picker", "Choose Auto"],
        answerKey: ["Open the model picker", "Choose Auto", "Pick the tier", "Check which model handled it"],
      },
    ],
    scenarios: [
      {
        scenario: "A quick formatting fix is taking a long time on the highest-quality tier.",
        question: "What should you do?",
        choices: [
          { text: "Switch to the Efficiency tier for simple work", correct: true, feedback: "Yes. A simple task fits the cost and speed tier." },
          { text: "Keep the top tier, since it is always better", correct: false, feedback: "Top quality is not needed for simple tasks." },
          { text: "Disable Copilot", correct: false, feedback: "The model tier is the lever here, not the whole tool." },
        ],
        source: { label: "About auto model selection", url: "https://docs.github.com/en/copilot/concepts/models/auto-model-selection" },
      },
    ],
    sources: [
      { label: "About auto model selection", url: "https://docs.github.com/en/copilot/concepts/models/auto-model-selection" },
    ],
  },
  {
    id: "agent-mode",
    lastChecked: "2026-11-08",
    title: "Agent mode",
    blurb: "Give Copilot a task and let it edit files and run commands until it is done.",
    level: 3,
    row: 3,
    prerequisites: ["tools"],
    goal: "Run a multi-step task in agent mode and review each change and command before accepting it.",
    steps: [
      "Describe the task and the files it touches.",
      "Turn on agent mode in your editor's chat.",
      "Read each proposed edit and command before you approve it.",
      "Undo or reject any change you do not want.",
    ],
    example: {
      file: "agent-task.md",
      code: `Task: add a loading state to the Save button.
Files: components/SaveButton.tsx, tests/SaveButton.test.tsx
Done when: npm test passes.
Ask before running any command that changes files outside components/ and tests/.`,
    },
    checkQuestion: "What should you do before approving a command in agent mode?",
    quiz: [
      {
        question: "What does agent mode do that a normal chat reply does not?",
        choices: [
          { text: "It edits files and runs commands until the task is done", correct: true },
          { text: "It only explains code without changing anything", correct: false },
        ],
        explanation: "Agent mode works autonomously across files and commands, with you reviewing each step.",
      },
      {
        question: "Who stays in control of the changes in agent mode?",
        choices: [
          { text: "You, by reviewing and approving or rejecting them", correct: true },
          { text: "Copilot, with no review", correct: false },
        ],
        explanation: "You review the changes, and by default you approve commands before they run.",
      },
    ],
    exercises: [
      {
        id: "agent-rewrite",
        kind: "rewrite",
        title: "Scope an agent task",
        prompt: "Rewrite the request with the files and a done check.",
        weakText: "Fix the save button.",
        answerKey:
          "Add a loading state to the Save button in components/SaveButton.tsx and its test. Done when npm test passes. Ask before changing files outside those two.",
      },
      {
        id: "agent-spot",
        kind: "spot-mistake",
        title: "Find the missing limit",
        prompt: "Which line gives the agent too much room?",
        file: "agent-task.md",
        code: `Task: fix the save button
Permission: run any command without asking`,
        choices: [
          { text: "Permission: run any command without asking", correct: true },
          { text: "Task: fix the save button", correct: false },
        ],
        explanation: "Running any command without asking removes your review step, which is the main safety check.",
      },
      {
        id: "agent-order",
        kind: "order",
        title: "Order an agent session",
        prompt: "Put these steps in the order you would run an agent session.",
        items: ["Undo what you do not want", "Approve each reviewed change", "Describe the task", "Turn on agent mode"],
        answerKey: ["Describe the task", "Turn on agent mode", "Approve each reviewed change", "Undo what you do not want"],
      },
    ],
    scenarios: [
      {
        scenario: "Agent mode proposes a command that deletes a folder you did not mention.",
        question: "What should you do?",
        choices: [
          { text: "Reject the command and ask why it is needed", correct: true, feedback: "Yes. You keep the approval gate, and the agent has to justify the step." },
          { text: "Approve it to keep the task moving", correct: false, feedback: "Approving unrequested deletions skips your review." },
          { text: "Turn off review for the rest of the session", correct: false, feedback: "Removing review removes the safety check." },
        ],
        source: { label: "Using agent mode in your IDE", url: "https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-agent-mode" },
      },
    ],
    sources: [
      { label: "Using agent mode in your IDE", url: "https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-agent-mode" },
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
