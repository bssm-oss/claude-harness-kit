---
name: review-code
description: "Multi-stage CodeAgora-style code review with SARIF output"
trigger: "review code|audit PR|code review"
---

# CodeAgora Multi-Stage Code Review

Orchestrates a full code review pipeline: fan-out to parallel L1 screeners, consolidation by moderator, final verdict by judge.

## Workflow

### Step 0 — Identify Target

Determine what to review:
- If the user provided a file path or list of files, use those
- If the user said "audit PR" or referenced a PR, get the diff with `git diff` against the base branch
- If the user said "review code" without specifics, review staged changes (`git diff --cached`) or the most recent commit (`git diff HEAD~1`)

Read all target files/diffs so you have the full context.

### Step 1 — Fan-Out: Parallel L1 Screening

Launch all three screener agents **in parallel** using the Agent tool:

1. **review-screener-1** (correctness) — send the code/diff and ask for correctness findings
2. **review-screener-2** (security) — send the code/diff and ask for security findings  
3. **review-screener-3** (performance/style) — send the code/diff and ask for performance and style findings

Each agent prompt must include:
- The full code or diff to review
- The file path(s) being reviewed
- Instruction to return findings as a JSON array per their agent spec

Wait for all three to complete.

### Step 2 — Fan-In: Moderator Consolidation

Launch **review-moderator** with:
- The three JSON arrays from Step 1
- Instruction to deduplicate, resolve conflicts, validate severity, and produce the consolidated report

### Step 3 — Final Verdict: Judge

Launch **review-judge** with:
- The moderator's consolidated report
- Instruction to render a verdict and produce the final SARIF v2.1.0 report

### Step 4 — Output

1. Save the SARIF JSON report to `review-report.sarif.json` in the project root
2. Present a human-readable summary to the user:

```
## Code Review Complete

**Verdict**: [APPROVE|APPROVE_WITH_NOTES|REQUEST_CHANGES|BLOCK]
**Risk Level**: [CRITICAL|HIGH|MODERATE|LOW|CLEAN]

### Findings Summary
- BLOCKER: X
- HIGH: X  
- MEDIUM: X
- LOW: X

### Top Issues
1. ...
2. ...
3. ...

### Action Items
- ...

Full SARIF report saved to: review-report.sarif.json
```

## Important Notes

- All agent launches must use the agents defined in `.claude/agents/`
- Screener agents run in **parallel** (fan-out) — do not run them sequentially
- Moderator and judge run **sequentially** (fan-in then producer-reviewer)
- If any agent fails, report the failure and continue with available results
- The SARIF report must be valid against the SARIF v2.1.0 schema
