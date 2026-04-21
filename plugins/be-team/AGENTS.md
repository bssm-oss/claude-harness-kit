<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-22 -->

# be-team

## Purpose

Backend specialist team for Hono/Express APIs with reflection, validation, resilience, LLM provider integration, and security.

## Pattern

**Pipeline + Expert Pool + Reflection Loop** — Sequential stages with expert specialists and self-critique. See [docs/PATTERNS.md](../../docs/PATTERNS.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| be-architect | sonnet | Use when designing backend API routes, resource models, middleware strategy, or error handling for Hono/Express; delegates to implementer and validator. | "API 설계" |
| be-implementer | sonnet | Use when be-architect spec is ready; handles Hono/Express route handlers, middleware, and dependency injection. | (delegated) |
| be-reflector | sonnet | Use after be-implementer completes; handles self-critique for type safety, error responses, and security gaps. Routes HIGH severity issues back to be-implementer. | (auto) |
| be-validator | sonnet | Use when API implementation needs input validation; handles Zod schemas, OpenAPI generation, RFC 9457 error responses, and input sanitization. | "검증", "스키마" |
| be-resilience | sonnet | Use when API needs fault tolerance; handles circuit breakers, exponential backoff, timeouts, graceful degradation, health checks, and bulkhead isolation. | "회복력" |
| be-provider | sonnet | Use when integrating multiple LLM providers; handles streaming adapters, token counting, cost tracking, rate limiting, and graceful fallback. | "LLM" |
| be-security | sonnet | Use when API needs security hardening; handles AuthN/Z, secret management, CORS, audit logging, and OWASP Top 10 defense. | "인증", "보안" |
| be-tester | sonnet | Use when backend implementation is approved; handles Vitest + Supertest HTTP contract tests, provider mocking, fixture management, and integration tests. | "테스트" |

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| be-api | /be-api | Create a REST/RPC endpoint with validation and error handling |
| be-mcp-server | /be-mcp-server | Scaffold an MCP server with stdio/HTTP transport |
| be-pipeline | /be-pipeline | Multi-stage stateful orchestration pattern |
| be-llm-integration | /be-llm-integration | LLM provider adapter with streaming and cost tracking |
| be-observability | /be-observability | Add structured logging, metrics, and tracing |

## Dependencies

- **Required:** none

## Routing Rules

### Use this team when:
- "backend", "API", "endpoint", "서버", "라우트", "인증", "DB", "Hono", "Express"

### Do NOT use when:
- Quick CRUD → dev-backend directly

## For AI Agents

### Entry Point
be-architect receives the task, produces spec at `.claude/specs/be-{slug}.md` where slug is a short feature name.

### Data Flow
architect → implementer → reflector → (validator || resilience || provider || security) → tester

### Exit Criteria
be-tester reports passing tests. No HIGH issues from be-reflector.
