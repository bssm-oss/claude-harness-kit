---
name: research-report
description: "Use when research findings exist in the Blackboard and you want to re-synthesize or format the final report; skips crawling and runs only research-synthesizer."
trigger: /research-report
---

# research-report

Re-synthesizes an existing Blackboard session into a formatted report.

## Usage

```
/research-report <session-id>
/research-report  (uses most recent session)
```

## When to use

- The crawler and reader already ran but the synthesis is incomplete
- You want to reformat the synthesis with different structure
- You want to add a gap analysis to an existing session

## Flow

Reads existing `.harness/blackboard/<session-id>/findings.md` → runs research-synthesizer only.
