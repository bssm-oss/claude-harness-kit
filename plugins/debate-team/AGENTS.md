<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# debate-team

## Purpose

Structured adversarial debate for contested technical decisions.

## Pattern

**Adversarial Debate** — Advocates argue positions, devil's advocate challenges, judge decides. See [docs/PATTERNS.md](../../docs/PATTERNS.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| debate-advocate-a | sonnet | Use when a contested decision needs structured debate; argues FOR the primary position with evidence and reasoning. | "토론", "A vs B" |
| debate-advocate-b | sonnet | Use when debate-advocate-a has stated their position; argues AGAINST or for an alternative position, directly countering advocate-a. | (follows a) |
| debate-devils-advocate | sonnet | Use after both advocates have stated positions; challenges the weakest arguments on both sides to prevent groupthink. | (cross-exam) |
| debate-judge | sonnet | Use when debate rounds are complete; handles weighing evidence, issuing a verdict, and documenting the dissenting opinion. | (final) |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| debate-tradeoff | /debate-tradeoff | Structured debate between two explicit options |
| debate-decision | /debate-decision | Open-ended decision — team identifies options |

## Dependencies

- **Required:** none

## Routing Rules

### Use this team when:
- "트레이드오프", "A vs B", "어느 게 나아", "토론", "반론", "장단점"

### Do NOT use when:
- Answer is obvious → respond directly
- Research needed first → use research-team first

## For AI Agents

### Entry Point
debate-advocate-a receives the question and Option A definition.

### Data Flow
advocate-a (R1) → advocate-b (R1, rebuttal) → devils-advocate (challenge) → cross-exam → judge (verdict)

### Exit Criteria
debate-judge outputs: decision, reasoning, dissenting view, reversal conditions. Max 5 rounds.
