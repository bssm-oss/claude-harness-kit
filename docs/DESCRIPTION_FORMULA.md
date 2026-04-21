# Description Formula

All agent and skill `description` fields must follow this format:

## Formula

```
"Use when [TRIGGER CONDITION]; handles [ACTION]. [OPTIONAL CONTEXT]"
```

### Components

| Part | Required | Purpose |
|------|----------|---------|
| `Use when [TRIGGER]` | Yes | Tells Claude Code WHEN to route to this agent |
| `handles [ACTION]` | Yes | Tells Claude Code WHAT this agent does |
| `[OPTIONAL CONTEXT]` | No | Extra routing hints (e.g., "Delegates to X", "Writes to Y") |

## Examples

### Good descriptions

```yaml
# Precise trigger + clear action + context
description: "Use when designing backend API routes, resource models, middleware strategy, or error handling for Hono/Express; handles API design and delegates to be-implementer and be-validator."

# Multiple triggers covered
description: "Use when building React components, Next.js pages, or refactoring frontend architecture; handles component design, routing decisions, and state management strategy."

# Clear state dependency in trigger
description: "Use when research-planner queries.md is ready; handles web crawling and page fetching via WebFetch/WebSearch. Writes SOURCE-XXX entries to findings.md."

# Specific artifact produced
description: "Use when review-moderator report is ready; handles final approve/block verdict with SARIF-compatible output."
```

### Bad descriptions (do not use)

```yaml
# ❌ No trigger — just lists capabilities
description: "API design, resource modeling, route structure, middleware layering"

# ❌ No action — just lists when to use
description: "For backend work when API is needed"

# ❌ Too vague — trigger is unclear
description: "Backend specialist"

# ❌ No quotes — will break YAML parsing in some contexts
description: Use when backend work is needed
```

## Why this matters

Claude Code reads agent `description` fields to decide which agent to route a task to. A description that clearly states **when** to use it and **what** it does produces better routing than a capability summary.

The `Use when` prefix is a strong signal to the routing model that this field contains routing instructions, not just documentation.

## Skill descriptions

Skills follow the same formula. Additionally, skills should include the trigger word:

```yaml
description: "Use when you need to run the full feature development pipeline; handles planner → FE+BE parallel implementation → reviewer → QA."
trigger: /dev-feature
```
