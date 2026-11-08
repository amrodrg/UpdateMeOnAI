export interface GuideLink {
  label: string;
  href: string;
}

export interface GuideChapter {
  id: string;
  number: string;
  title: string;
  intro: string;
  points: string[];
  links: GuideLink[];
}

export interface ConfigFile {
  kind: string;
  path: string;
  purpose: string;
}

export interface RecommendedSkill {
  name: string;
  source: string;
  install: string;
  useFor: string;
}

// Hand-written teaching content. Every claim links to an official source.
// Extracted news (data/news.json) is shown separately and is never generated.
export const CHAPTERS: GuideChapter[] = [
  {
    id: "start",
    number: "01",
    title: "Pick the right mode",
    intro:
      "Copilot has four working modes. Start with the smallest one that solves the task, then move up when the work gets bigger.",
    points: [
      "Inline suggestions: accept or reject as you type. Best for small, local edits.",
      "Chat: ask questions about selected code, files, or errors. Use #file and #selection to pin context.",
      "Agent mode: Copilot plans and edits several files, runs commands, and reads the results. Review each step.",
      "Cloud coding agent and Copilot CLI: run a task in the background or from the terminal, then review the pull request it opens.",
    ],
    links: [
      { label: "Copilot overview (GitHub Docs)", href: "https://docs.github.com/en/copilot" },
      { label: "Use Copilot CLI", href: "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli" },
      { label: "VS Code Copilot overview", href: "https://code.visualstudio.com/docs/copilot/overview" },
    ],
  },
  {
    id: "connectors",
    number: "02",
    title: "Connect tools with MCP",
    intro:
      "Model Context Protocol (MCP) servers are connectors. Each one gives Copilot a set of tools, such as reading issues, querying a database, or searching docs.",
    points: [
      "In VS Code, add servers to .vscode/mcp.json or use the MCP menu in Chat. Each tool asks for approval before it runs.",
      "Start with read-only servers, such as docs or issue search. Add write access only when you need it.",
      "Use separate servers for separate accounts, and keep tokens in the environment, not in the repository.",
      "For the cloud coding agent, MCP servers are configured in repository settings so the agent can use them in its own environment.",
    ],
    links: [
      { label: "Use MCP in Copilot (GitHub Docs)", href: "https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp" },
      { label: "MCP servers in VS Code", href: "https://code.visualstudio.com/docs/copilot/chat/mcp-servers" },
      { label: "Model Context Protocol", href: "https://modelcontextprotocol.io" },
    ],
  },
  {
    id: "customize",
    number: "03",
    title: "Teach Copilot your rules, agents and skills",
    intro:
      "Four customization files do most of the work. Keep each one short and specific. Copilot loads them only when they apply.",
    points: [
      "Instructions are always-on rules for the whole repository (coding style, test commands, what not to touch).",
      "Custom agents are personas with their own tools and instructions, for example a reviewer that never edits code.",
      "Skills are folders with a SKILL.md file and optional scripts. Copilot loads a skill only when the task matches its description.",
      "Prompt files are reusable tasks you start with a slash command. Use them for repeated work, such as writing a changelog entry.",
    ],
    links: [
      { label: "Add repository instructions", href: "https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions" },
      { label: "VS Code customization overview", href: "https://code.visualstudio.com/docs/copilot/customization/overview" },
      { label: "Custom agents in VS Code", href: "https://code.visualstudio.com/docs/copilot/customization/custom-agents" },
      { label: "Agent skills in VS Code", href: "https://code.visualstudio.com/docs/copilot/customization/agent-skills" },
      { label: "Agent Skills standard", href: "https://agentskills.io" },
    ],
  },
  {
    id: "practice",
    number: "04",
    title: "Work with Copilot, not just prompt it",
    intro:
      "The best results come from a clear goal, the right context, and a check at the end. These habits matter more than clever wording.",
    points: [
      "Give the goal, the constraints, and the done condition in one message. Name the files that matter.",
      "Ask for a plan first on anything that touches several files. Approve the plan, then let Copilot edit.",
      "Make each task small enough to review in one sitting. Large tasks hide mistakes.",
      "Ask for tests or a command that proves the change works, and run it yourself before you merge.",
      "When Copilot repeats a mistake, add the rule to your instructions file instead of correcting it again.",
    ],
    links: [
      { label: "Prompt engineering for Copilot", href: "https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering" },
      { label: "Prompt files in VS Code", href: "https://code.visualstudio.com/docs/copilot/customization/prompt-files" },
    ],
  },
];

export const CONFIG_FILES: ConfigFile[] = [
  {
    kind: "Instructions",
    path: ".github/copilot-instructions.md",
    purpose: "Repository-wide rules. Loaded on every request.",
  },
  {
    kind: "Custom agent",
    path: ".github/agents/<name>.agent.md",
    purpose: "A named persona with its own tools and instructions.",
  },
  {
    kind: "Skill",
    path: ".github/skills/<name>/SKILL.md",
    purpose: "Task know-how plus optional scripts. Loaded when the task matches.",
  },
  {
    kind: "Prompt file",
    path: ".github/prompts/<name>.prompt.md",
    purpose: "A reusable task started with a slash command.",
  },
  {
    kind: "MCP connector",
    path: ".vscode/mcp.json",
    purpose: "Declares the MCP servers this workspace can use.",
  },
];

export const RECOMMENDED_SKILLS: RecommendedSkill[] = [
  {
    name: "frontend-design",
    source: "Anthropic skills repository",
    install: "npx skills add https://github.com/anthropics/skills --skill frontend-design",
    useFor: "Distinctive, non-generic UI: typography, palette, layout, and motion that respect reduced-motion settings.",
  },
  {
    name: "Repository instructions",
    source: "Your own repository",
    install: "Create .github/copilot-instructions.md",
    useFor: "Test commands, folder layout, and rules such as \"never edit generated files\".",
  },
  {
    name: "Reviewer agent",
    source: "Your own repository",
    install: "Create .github/agents/reviewer.agent.md with read-only tools",
    useFor: "A second pair of eyes on a pull request that cannot change the code.",
  },
];
