# Contributing to claude-harness-kit

Thank you for your interest in contributing! This guide explains how to add new teams, agents, and skills to the kit.

## Ways to Contribute

- **Bug reports** — Open an issue with the `bug` label. Include your Node.js version, OS, and the exact command that failed.
- **Feature requests** — Open an issue with the `enhancement` label. Describe the use case before proposing an implementation.
- **Pull requests** — Fork the repo, create a branch from `master`, and open a PR when your work is ready for review.

---

## Adding a New Team

Teams live under `plugins/<name>-team/`. The minimum required layout is:

```
plugins/<name>-team/
├── .claude-plugin/
│   └── plugin.json          # plugin manifest (see below)
├── agents/                  # one .md file per agent
│   └── <name>-<role>.md
├── skills/                  # one directory per skill
│   └── <skill-name>/
│       └── SKILL.md
├── AGENTS.md                # human-readable agent catalog for this team
└── <name>.md                # harness entry-point (orchestration instructions)
```

### `plugin.json` manifest

```json
{
  "name": "<name>-team",
  "version": "1.0.0",
  "description": "One-sentence description of what the team does.",
  "agents": ["agents/<name>-<role>.md"],
  "skills": ["skills/<skill-name>/SKILL.md"]
}
```

### `AGENTS.md`

Document every agent: its role, inputs, outputs, and how it hands off to the next agent. Keep it concise — one paragraph per agent is enough.

### `<name>.md` (harness entry-point)

This file is the system-level instruction Claude Code receives when routing to the team. It should describe:

1. Team mission and orchestration pattern (Pipeline / Fan-out / Expert Pool / …)
2. Agent roster and call order
3. Handoff artifact format (e.g., `.claude/specs/<name>-<slug>.md`)

---

## Adding a New Agent

Create `plugins/<team>-team/agents/<team>-<role>.md`. The file must start with a YAML frontmatter block:

```markdown
---
name: <team>-<role>
description: "Concise description shown to Claude Code when selecting this agent."
model: sonnet          # sonnet (default) | opus (heavy orchestrators only)
---

# <team>-<role> — Short Title

Rest of the system prompt…
```

**Frontmatter fields:**

| Field | Required | Description |
|---|---|---|
| `name` | yes | Unique identifier, kebab-case. Must match the filename (without `.md`). |
| `description` | yes | One sentence. Used by the router to pick the right agent. |
| `model` | no | Defaults to `sonnet`. Use `opus` only for top-level orchestrators. |

Keep system prompts action-oriented. State what the agent **does**, what it **receives** (inputs), and what it **produces** (outputs/handoffs).

---

## Adding a New Skill

Create a directory under `plugins/<team>-team/skills/<skill-name>/` and add a `SKILL.md` file:

```markdown
---
name: <skill-name>
description: "One sentence describing when to invoke this skill."
user_invocable: true          # false if only called by agents
trigger_keywords: ["keyword1", "keyword2"]
---

# <skill-name>

Body: what the skill does, step by step.
```

**Frontmatter fields:**

| Field | Required | Description |
|---|---|---|
| `name` | yes | Kebab-case, matches directory name. |
| `description` | yes | Shown in the skill selector. Be specific about trigger conditions. |
| `user_invocable` | no | `true` means users can invoke via `/skill-name`. |
| `trigger_keywords` | no | Array of strings that help the router match the skill. |

---

## Local Development

```bash
# 1. Clone and install dependencies
git clone https://github.com/bssm-oss/claude-harness-kit.git
cd claude-harness-kit
npm install

# 2. Install the CLI globally (links to your local copy)
npm install -g .

# 3. After editing agents/skills, reinstall to pick up changes
npm install -g .

# 4. Verify the install
claude-harness-kit --help
```

The installer copies `plugins/` into `~/.claude/`. After reinstalling, changes are live in any new Claude Code session.

---

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | New team, agent, skill, or CLI flag |
| `fix:` | Bug fix in installer, hook, or existing agent logic |
| `docs:` | README, CONTRIBUTING, CHANGELOG, inline comments |
| `chore:` | Dependency updates, CI config, tooling |
| `refactor:` | Internal restructuring with no user-facing change |
| `test:` | New or updated tests |

Examples:
```
feat: add debate-team with advocate and judge agents
fix: resolve path traversal in install.mjs on Windows
docs: add be-team harness entry-point example
```

---

## PR Checklist

Before opening a pull request, confirm:

- [ ] `npm install -g . && claude-harness-kit --help` exits without error
- [ ] New agents have required frontmatter (`name`, `description`)
- [ ] New skills have required frontmatter (`name`, `description`)
- [ ] `plugin.json` lists all new agents and skills
- [ ] `AGENTS.md` is updated if agents were added or removed
- [ ] No secrets, `.env` files, or personal tokens are committed
- [ ] Commit message follows the convention above
- [ ] PR description explains the use case the contribution addresses

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE) that covers this project.
