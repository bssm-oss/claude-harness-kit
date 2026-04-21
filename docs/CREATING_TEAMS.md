# Creating Your Own Team

claude-harness-kit is designed to be extended. This guide walks you through creating a custom team plugin.

## Directory Structure

```
plugins/<your-team>/
├── .claude-plugin/
│   └── plugin.json          ← Plugin metadata
├── AGENTS.md                ← Team documentation (required)
├── agents/
│   └── <agent-name>.md      ← One file per agent
└── skills/
    └── <skill-name>/
        └── SKILL.md         ← One folder per skill
```

## Step 1: Choose a Pattern

| Your task looks like... | Use pattern |
|------------------------|-------------|
| Sequential stages, each builds on the last | Pipeline |
| Same input, multiple independent reviews | Fan-out/Fan-in |
| Different tasks need different specialists | Expert Pool |
| Unknown scope, need to scout first | Hierarchical Delegation |
| Long-running, agents share state | Blackboard |
| Contested decision, need structured debate | Adversarial Debate |

See [docs/PATTERNS.md](./PATTERNS.md) for full descriptions.

## Step 2: Create plugin.json

```json
{
  "name": "your-team",
  "version": "1.0.0",
  "description": "One-line description of what this team does",
  "keywords": ["keyword1", "keyword2"],
  "category": "development|quality|frontend|backend|analysis|research|reasoning|operations"
}
```

## Step 3: Create Agent Files

Each agent is a Markdown file with YAML frontmatter:

```yaml
---
name: your-agent-name
description: "Use when [TRIGGER]; handles [ACTION]. [OPTIONAL CONTEXT]"
model: sonnet
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - SendMessage
  - TaskUpdate
reflect: false
escalate_to: ""
---

# your-agent-name

[Agent instructions here]
```

### Tool sets by role

| Role | Tools |
|------|-------|
| Architect / Planner (read-only) | Read, Glob, Grep, Agent, SendMessage, TaskCreate, TaskUpdate, TaskGet, TaskList |
| Implementer (read + write) | Read, Write, Edit, Glob, Grep, Bash, SendMessage, TaskUpdate |
| Reviewer (read-only) | Read, Glob, Grep, Bash, SendMessage, TaskUpdate |
| Researcher (web access) | Read, Write, Edit, Glob, Grep, Bash, SendMessage, TaskUpdate, WebFetch, WebSearch |

### Description formula

All descriptions must follow: `"Use when [TRIGGER]; handles [ACTION]."`

See [docs/DESCRIPTION_FORMULA.md](./DESCRIPTION_FORMULA.md) for examples.

## Step 4: Create Skill Files

```yaml
---
name: your-skill-name
description: "Use when [TRIGGER]; handles [ACTION]."
trigger: /your-skill-name
---

# your-skill-name

[Skill instructions here]
```

## Step 5: Write AGENTS.md

Follow the template in [docs/AGENTS_MD_STANDARD.md](./AGENTS_MD_STANDARD.md).

## Step 6: Add to marketplace.json

Add your team to `.claude-plugin/marketplace.json`:

```json
{
  "name": "your-team",
  "source": "./plugins/your-team",
  "description": "...",
  "version": "1.0.0",
  "keywords": ["..."],
  "category": "..."
}
```

## Step 7: Test

```bash
npx claude-harness-kit your-team --dry-run
npx claude-harness-kit your-team --force
```

## Contributing

If your team is generally useful, consider submitting a PR. See `.github/ISSUE_TEMPLATE/new_team_proposal.md` for the proposal format.
