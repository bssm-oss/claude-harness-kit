<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# ops-team

## Purpose

Operational tooling: release pipeline, CI diagnosis and auto-fix, zombie process cleanup. Skill-only — no agents.

## Pattern

**Skills + Hooks** — Direct skill invocation, no agent orchestration.

## Agents

None. ops-team is skill-only.

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| release | /release | End-to-end release: version bump → build → tag → publish → verify |
| ci-watch | /ci-watch | Watch GitHub Actions, diagnose failures, apply safe fixes |
| zombie-collector | /zombie-collector | Detect orphan processes, confirm, kill safely |

## Dependencies

- **Required:** `gh` CLI
- **Optional:** `npm`, `brew`

## Routing Rules

### Use this team when:
- "/release", "/ci-watch", "/zombie-collector"
- "릴리즈", "배포", "CI 실패", "좀비 프로세스", "메모리 폭주"

### Do NOT use when:
- Code changes needed → be-team or fe-team
- Code review → review-team

## For AI Agents

### Entry Point
Skills are invoked directly via trigger commands.

### Data Flow
Skill → external tool (gh, npm) → verification → report

### Exit Criteria
/release: package published and verified via smoke test. /ci-watch: CI passes or fix applied. /zombie-collector: processes listed and optionally killed.
