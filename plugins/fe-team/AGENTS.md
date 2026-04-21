<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# fe-team

## Purpose

Frontend specialist team for React/Next.js with built-in reflection loop.

## Pattern

**Expert Pool + Reflection Loop** — Architect delegates to specialists; implementer output passes through reflector. See [docs/PATTERNS.md](../../docs/PATTERNS.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| fe-architect | sonnet | Use when designing React component structure, Next.js page architecture, or planning state management; delegates to implementer, styler, perf, tester. | "컴포넌트 설계", "아키텍처" |
| fe-implementer | sonnet | Use when fe-architect spec is ready; handles React component implementation with TypeScript, hooks, and data fetching. | (delegated) |
| fe-reflector | sonnet | Use after fe-implementer completes; handles self-critique against original spec, identifies bugs and missing edge cases. Routes HIGH severity issues back to fe-implementer. | (auto) |
| fe-styler | sonnet | Use when component needs Tailwind CSS styling, responsive design, dark mode, or WCAG accessibility review. | "스타일", "a11y" |
| fe-perf | sonnet | Use when component needs performance audit; handles bundle size analysis, lazy loading, memoization, and React performance optimization. | "번들", "성능" |
| fe-tester | sonnet | Use when implementation is approved; handles Vitest unit tests, Testing Library component tests, and Playwright E2E tests. | "테스트" |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| fe-component | /fe-component | Create a new React component end-to-end |
| fe-page | /fe-page | Create a new Next.js App Router page |
| fe-refactor | /fe-refactor | Refactor components for performance or architecture |
| fe-review | /fe-review | Review existing components for perf + accessibility |
| fe-test | /fe-test | Generate tests for existing components |

## Dependencies

- **Required:** none

## Routing Rules

### Use this team when:
- "컴포넌트", "React", "Next", "페이지", "스타일", "a11y", "번들", "UI"

### Do NOT use when:
- One-line style fix → inline
- Full-stack feature → dev-team or chain with be-team

## For AI Agents

### Entry Point
fe-architect receives the task.

### Data Flow
architect → implementer → reflector → styler → perf → tester

### Exit Criteria
fe-tester reports passing tests. No HIGH issues from fe-reflector.
