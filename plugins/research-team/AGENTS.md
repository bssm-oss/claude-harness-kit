<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# research-team

## Purpose

Long-running web and document research using the Blackboard pattern.

## Pattern

**Blackboard** — Agents share state via files. See [docs/PATTERNS.md](../../docs/PATTERNS.md) and [core/blackboard/README.md](../../core/blackboard/README.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| research-planner | sonnet | Use when starting a research task; handles breaking down the research question, creating sub-queries, and initializing the blackboard. | "조사해", "research" |
| research-crawler | sonnet | Use when research-planner queries.md is ready; handles web crawling and page fetching via WebFetch/WebSearch. Writes SOURCE-XXX entries to findings.md. | (delegated) |
| research-reader | sonnet | Use when research-crawler has populated findings.md; handles extracting structured data and key claims from raw crawled content. | (delegated) |
| research-synthesizer | sonnet | Use when findings.md has sufficient data; handles assembling the final report to synthesis.md. Detects gaps and triggers additional crawling if needed. | (delegated) |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| research-web | /research-web | Full pipeline for web-based research |
| research-doc | /research-doc | Full pipeline focused on official docs and specs |
| research-report | /research-report | Re-synthesize an existing Blackboard session |

## Dependencies

- **Required:** WebFetch, WebSearch tools

## Routing Rules

### Use this team when:
- "조사해", "찾아봐", "검색해", "research", "크롤", "비교해줘", "최신 동향"

### Do NOT use when:
- Answer is in the codebase → explore-team
- Simple factual question → answer directly

## For AI Agents

### Entry Point
research-planner receives the research question. Creates `.harness/blackboard/<session-id>/`.

### Data Flow
planner (plan.md + queries.md) → crawler (findings.md) → reader (enriched findings.md) → synthesizer (synthesis.md)

### Exit Criteria
synthesis.md written with all sub-questions answered or gaps flagged.
