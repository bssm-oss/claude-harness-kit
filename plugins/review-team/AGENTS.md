<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# review-team

## Purpose

Multi-stage code review with SARIF-compatible output. Supports PR diff review (3 fixed screeners) and full codebase review (3–10 auto-scaled screeners).

## Pattern

**Fan-out / Fan-in** — Parallel L1 screeners aggregated by moderator, decided by judge. See [docs/PATTERNS.md](../../docs/PATTERNS.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| review-screener-1 | sonnet | Correctness analysis: logic errors, algorithmic issues, spec adherence. L1 screener for PR review, runs in parallel. | (fan-out) |
| review-screener-2 | sonnet | Security analysis: auth flaws, injection risks, secret exposure, OWASP Top 10. L1 screener for PR review, runs in parallel. | (fan-out) |
| review-screener-3 | sonnet | Performance and style: algorithmic complexity, bundle size, code quality. L1 screener for PR review, runs in parallel. | (fan-out) |
| review-screener-codebase | sonnet | Full-spectrum screener for codebase review. Receives a file group + primary focus, reads files directly, reports all dimensions. Used by /review-codebase with N=3–10 instances in parallel. | (fan-out) |
| review-moderator | sonnet | Consolidates all screener findings: deduplicates, resolves severity conflicts, produces unified report. | (fan-in) |
| review-judge | sonnet | Issues final approve/block verdict with SARIF-compatible output. | (final) |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| review-code | /review-code | PR/diff-based review — 3 fixed specialist screeners |
| review-codebase | /review-codebase | Full codebase review — 3–10 auto-scaled screeners, file partitioning |

## Dependencies

- **Required:** none

## Routing Rules

### Use this team when:
- PR/diff review: "리뷰해줘", "PR 봐줘", "코드 검토", "머지해도 돼?", "audit"
- Codebase review: "코드베이스 리뷰", "전체 리뷰", "review codebase", "audit codebase"

### Do NOT use when:
- Quick inline review → ask directly
- Reviewing own changes in dev pipeline → use dev-reviewer

## For AI Agents

### Entry Point
- **PR review** (`/review-code`): send diff to review-screener-1/2/3 simultaneously
- **Codebase review** (`/review-codebase`): glob files → partition → spawn N review-screener-codebase in parallel

### Data Flow
screeners (parallel) → moderator (consolidation) → judge (verdict)

### Exit Criteria
review-judge outputs APPROVE or BLOCK with SARIF-compatible findings.
