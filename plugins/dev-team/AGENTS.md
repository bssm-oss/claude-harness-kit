<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# dev-team

## Purpose

Full-stack feature development pipeline. Takes a user feature request from requirements through planning, parallel FE+BE implementation, code review, and QA testing.

## Pattern

**Pipeline** — Sequential stages where each stage output feeds the next. See [docs/PATTERNS.md](../../docs/PATTERNS.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| dev-planner | sonnet | Use when starting a new feature or task; handles requirement breakdown and handoff spec | "기능 만들어", "feature", "구현해줘" |
| dev-frontend | sonnet | Use when dev-planner spec is ready and UI work is needed; handles React/Next.js implementation | (delegated) |
| dev-backend | sonnet | Use when dev-planner spec is ready and server-side work is needed; handles API and business logic | (delegated) |
| dev-reviewer | sonnet | Use when FE and BE implementations are complete; handles cross-cutting review | (delegated) |
| dev-qa | sonnet | Use when dev-reviewer has approved; handles unit and integration test generation | (delegated) |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| dev-feature | /dev-feature | Run the full feature development pipeline |

## Dependencies

- **Required:** none
- **Optional:** be-team (complex backend), fe-team (complex frontend)

## Routing Rules

### Use this team when:
- Building a new feature requiring both frontend and backend
- "기능 만들어", "build", "ship", "구현해줘", "풀스택"

### Do NOT use when:
- Only frontend → fe-team
- Only backend → be-team
- Code review → review-team

## For AI Agents

### Entry Point
dev-planner receives the feature description and produces a spec at `.claude/specs/dev-{slug}.md` where slug is a short feature name.

### Data Flow
planner spec → dev-frontend (parallel) + dev-backend (parallel) → dev-reviewer → dev-qa

### Exit Criteria
dev-qa reports passing tests.
