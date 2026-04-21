# Escalation Pattern

## Purpose

When a junior (implementer) agent fails repeatedly, escalate to a senior (architect) agent who re-plans the approach. The implementer then retries with a new plan.

## Flow

```
Junior agent attempts task
    ↓
Failure (retry 1)
    ↓
Failure (retry 2)
    ↓
Failure (retry 3) → escalation_triggered event
    ↓
Senior agent (architect) re-plans
    ↓
Junior retries with new plan
    ↓
If still fails → surface to user
```

## Configuration

Agent frontmatter:

```yaml
---
name: fe-implementer
escalate_to: fe-architect
---
```

## Log

`.harness/escalation-log.md`:

```markdown
## 2026-04-22T00:30:15Z

**From:** fe-implementer
**To:** fe-architect
**Reason:** 3 consecutive failures — cannot resolve TypeScript type conflict
**New plan:** [fe-architect's revised approach]
```
