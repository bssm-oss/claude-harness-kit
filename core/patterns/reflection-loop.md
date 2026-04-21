# Reflection Loop Pattern

## Purpose

After an implementer produces output, a dedicated reflector agent critiques it against the original spec. This catches bugs and spec violations before downstream agents see the output.

## Flow

```
Implementer → output
    ↓
Reflector reads: output + original spec
    ↓
Severity assessment
    ↓
HIGH issues? → feedback to Implementer (one retry)
LOW/MEDIUM? → proceed to next stage
PASS?       → proceed immediately
```

## Severity levels

| Level | Action |
|-------|--------|
| HIGH | Block. Return to implementer with specific feedback. |
| MEDIUM | Allow proceed. Include in report for awareness. |
| LOW | Allow proceed. Include in report for awareness. |
| PASS | Allow proceed immediately. |

## Maximum loops

One reflection loop per implementation. If implementer resubmits and HIGH issues remain, escalate to the architect instead of looping again.

## Enabling

Default: off. Enable per-agent with `reflect: true` in frontmatter, or per-session with `--reflect` CLI flag.

## Agents

- `fe-reflector` — frontend reflection (React, TypeScript, accessibility)
- `be-reflector` — backend reflection (type safety, error handling, security)
