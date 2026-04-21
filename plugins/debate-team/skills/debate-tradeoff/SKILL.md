---
name: debate-tradeoff
description: "Use when you need to analyze tradeoffs between two technical options; runs the full adversarial debate pipeline (advocate-a + advocate-b → devils-advocate → judge)."
trigger: /debate-tradeoff
---

# debate-tradeoff

Runs the full Adversarial Debate pipeline for technical tradeoff analysis.

## Usage

```
/debate-tradeoff <Option A> vs <Option B>: <question or context>
```

## Flow

1. **debate-advocate-a** — argues for Option A
2. **debate-advocate-b** — argues for Option B, rebuts A
3. **debate-devils-advocate** — challenges both, surfaces blind spots
4. **[cross-examination round]** — advocates respond to devil's challenge
5. **debate-judge** — issues verdict with dissenting opinion

## Examples

```
/debate-tradeoff Hono vs Express: Which should we use for a new Node.js API with streaming LLM responses?
/debate-tradeoff Monolith vs Microservices: We have 3 developers and need to ship in 6 weeks
/debate-tradeoff Server Components vs Client Components: For a dashboard with real-time data
```

## Output

Structured verdict with: decision, reasoning, dissenting view, and reversal conditions.
