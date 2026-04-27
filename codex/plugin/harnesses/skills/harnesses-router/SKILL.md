---
name: harnesses-router
description: "Use when a Codex task should be routed to a harness team: debate for decisions, explore for codebase investigation, review for code review, or research for evidence gathering."
---

# Harnesses Router

Use this skill when the user asks for structured work that benefits from a harness team:

- `debate`: contested decisions, tradeoffs, A vs B comparisons.
- `explore`: codebase investigation, root cause analysis, architecture tracing.
- `review`: code review, PR review, correctness/security/performance checks.
- `research`: documentation, technology, library, or external evidence gathering.

## Workflow

1. Classify the request first:

```bash
codex-harnesses route "<user request>" --json
```

2. If `requires_confirmation` is false, run:

```bash
codex-harnesses run "<user request>"
```

If Codex reports that the configured default model requires a newer Codex version, retry once with `--model gpt-5.2`.

3. If `requires_confirmation` is true, ask one concise clarification question naming the likely team and the missing detail.
4. Do not replace a harness result with a direct model answer. The command output is the source of truth.
5. Display the full command output and include the saved run id.
