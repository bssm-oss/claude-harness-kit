# research-team

## Pattern: Blackboard

Agents share state via files in `.harness/blackboard/<session-id>/`. No explicit handoff messages — each agent reads and writes the Blackboard autonomously.

## Flow

```
research-planner
  Creates: plan.md, queries.md, findings.md, synthesis.md
      ↓
research-crawler
  Reads:  queries.md
  Writes: findings.md (SOURCE-XXX blocks)
      ↓
research-reader
  Reads:  findings.md, plan.md
  Writes: findings.md (adds Key claims to each SOURCE)
      ↓
research-synthesizer
  Reads:  plan.md, findings.md
  Writes: synthesis.md (final report with citations)
```

## Skills

- `/research-web` — full pipeline, web sources
- `/research-doc` — full pipeline, docs-only sources
- `/research-report` — re-synthesize existing Blackboard session

## Triggers

Use research-team when the user says: "조사해", "찾아봐", "검색해줘", "research", "크롤", "비교해줘", "어떤 라이브러리가", "최신 동향", "레퍼런스 찾아"
