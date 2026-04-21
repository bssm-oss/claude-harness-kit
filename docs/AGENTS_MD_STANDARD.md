# AGENTS.md Standard Format

Every team directory must contain an `AGENTS.md` file following this specification.

## Template

```markdown
<!-- Parent: ../../AGENTS.md -->
<!-- Generated: YYYY-MM-DD -->

# <team-name>

## Purpose

One paragraph explaining why this team exists and what problem it solves.
Be specific about the domain and the kind of tasks it handles.

## Pattern

The orchestration pattern this team implements.
See [docs/PATTERNS.md](../../docs/PATTERNS.md) for full pattern descriptions.

**Pattern name** — one sentence on why this pattern fits this team.

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| agent-name | sonnet/opus | Short role description | "Use when..." |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| skill-name | /skill-name | One-line description |

## Dependencies

- **Required:** none — or list teams/tools this team requires
- **Optional:** list of optional integrations (e.g., Figma MCP for design-team)

## Routing Rules

### Use this team when:
- Bullet list of specific trigger conditions

### Do NOT use when:
- Single-agent tasks are sufficient
- The task is a one-liner or a simple question
- Another more specialized team handles the exact task

## For AI Agents

### Entry Point
Which agent receives the task first and what input it expects.

### Data Flow
How agents pass artifacts between each other (direct message, file, TaskUpdate, etc.).

### Exit Criteria
When the team considers the task complete and what the final output looks like.
```

## Rules

1. **Every team must have AGENTS.md** at the plugin root (`plugins/<team>/AGENTS.md`)
2. **Keep it current** — update when agents or skills change
3. **The Agents table must use the description formula** from docs/DESCRIPTION_FORMULA.md
4. **For AI Agents section is mandatory** — this is what orchestrators read to route tasks
5. **Do not duplicate** the full agent markdown here — link to the agent files instead
