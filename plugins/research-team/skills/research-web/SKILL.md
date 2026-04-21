---
name: research-web
description: "Use when you need to research a topic via web search and crawling; runs the full research-team pipeline (planner → crawler → reader → synthesizer) for web-based sources."
trigger: /research-web
---

# research-web

Runs the full Blackboard research pipeline for web-based research.

## Usage

```
/research-web <research question>
```

## Flow

1. **research-planner** — breaks question into sub-questions, creates Blackboard
2. **research-crawler** — fetches web sources, writes SOURCE-XXX to findings.md
3. **research-reader** — extracts key claims, tags by sub-question
4. **research-synthesizer** — produces synthesis.md with citations

## Output

Final report at `.harness/blackboard/<session-id>/synthesis.md`

## Examples

```
/research-web What are the tradeoffs between Hono and Express for a Node.js API?
/research-web How does Next.js App Router handle caching compared to Pages Router?
/research-web What LLM providers support streaming with the OpenAI-compatible API?
```
