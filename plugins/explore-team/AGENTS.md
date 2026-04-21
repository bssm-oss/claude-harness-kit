<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# explore-team

## Purpose

Codebase exploration and investigation. Read-only. Forms hypotheses, gathers evidence, synthesizes findings.

## Pattern

**Hierarchical Delegation** — opus-level scout orchestrates specialist sub-agents. See [docs/PATTERNS.md](../../docs/PATTERNS.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| explore-scout | opus | Use when investigating codebase architecture, tracing a bug's root cause, or planning a major refactor; orchestrates hypothesizer, evidence, and synthesizer sub-agents. | "탐색", "조사", "왜" |
| explore-hypothesizer | sonnet | Use when explore-scout needs competing explanations; handles generating multiple hypotheses about architecture, behavior, or root causes from exploration data. | (delegated) |
| explore-evidence | sonnet | Use when a hypothesis needs validation; handles code search, file analysis, and test execution to gather supporting or refuting evidence. | (delegated) |
| explore-synthesizer | sonnet | Use when evidence collection is complete; handles consolidating exploration findings into an actionable architecture report. | (delegated) |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| explore-investigate | /explore-investigate | Full investigation with hierarchical delegation |
| explore-quick | /explore-quick | Quick exploration without full hypothesis cycle |
| explore-hypothesis | /explore-hypothesis | Generate competing hypotheses for a question |

## Dependencies

- **Required:** none

## Routing Rules

### Use this team when:
- "왜", "어떻게 동작", "탐색", "조사", "레거시 파악", "근본 원인"

### Do NOT use when:
- Need to modify files → be-team or fe-team
- Simple symbol search → use Grep directly

## For AI Agents

### Entry Point
explore-scout receives the investigation question.

### Data Flow
scout → hypothesizer → evidence → synthesizer

### Exit Criteria
explore-synthesizer produces architecture report. No files modified.
