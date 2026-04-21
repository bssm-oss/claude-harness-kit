<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# review-team

## Purpose

Multi-stage code review with SARIF-compatible output. Three parallel screeners, a moderator, and a judge.

## Pattern

**Fan-out / Fan-in** — Parallel L1 screeners aggregated by moderator, decided by judge. See [docs/PATTERNS.md](../../docs/PATTERNS.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| review-screener-1 | sonnet | Use when code needs correctness analysis; handles logic errors, algorithmic issues, and specification adherence. L1 screener, runs in parallel. | (fan-out) |
| review-screener-2 | sonnet | Use when code needs security analysis; handles auth flaws, injection risks, secret exposure, and OWASP Top 10. L1 screener, runs in parallel. | (fan-out) |
| review-screener-3 | sonnet | Use when code needs performance and style analysis; handles algorithmic complexity, bundle size, and code quality. L1 screener, runs in parallel. | (fan-out) |
| review-moderator | sonnet | Use when all L1 screeners have reported; handles conflict resolution and unified finding consolidation. | (fan-in) |
| review-judge | sonnet | Use when review-moderator report is ready; handles final approve/block verdict with SARIF-compatible output. | (final) |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| review-code | /review-code | Run the full multi-stage review pipeline |

## Dependencies

- **Required:** none

## Routing Rules

### Use this team when:
- "리뷰해줘", "PR 봐줘", "코드 검토", "머지해도 돼?", "audit"

### Do NOT use when:
- Quick inline review → ask directly
- Reviewing own changes in dev pipeline → use dev-reviewer

## For AI Agents

### Entry Point
Send code or PR diff to review-screener-1/2/3 simultaneously (parallel).

### Data Flow
screeners (parallel) → moderator (consolidation) → judge (verdict)

### Exit Criteria
review-judge outputs APPROVE or BLOCK with SARIF-compatible findings.
