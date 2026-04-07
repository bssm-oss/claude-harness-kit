---
name: be-llm-integration
description: "LLM provider adapter layer with streaming, multi-model parallel execution, cost tracking, and graceful fallback"
user_invocable: true
arguments:
  - name: providers
    description: "Comma-separated providers (e.g., 'anthropic,openai,google')"
    required: true
  - name: features
    description: "Comma-separated features: streaming, tools, fallback, cost-tracking, parallel"
    required: false
  - name: endpoint
    description: "API endpoint path (e.g., '/api/v1/chat')"
    required: false
---

# LLM Provider Integration

Build a multi-provider LLM adapter layer with streaming, parallel execution, cost/token tracking, and graceful fallback across providers.

## Workflow

1. **Architecture** (be-architect): Design adapter layer
   - Unified LLMProvider interface
   - Provider-specific adapter mapping
   - Streaming strategy (SSE vs chunked)
   - Fallback chain priority
   - Write spec to `.claude/specs/be-llm-{providers}.md`

2. **Implementation** (be-implementer): Build adapters
   - Provider-specific API clients
   - Unified response mapping
   - Streaming SSE endpoint

3. **Validation** (be-validator): Schema enforcement
   - Request/response Zod schemas
   - Provider-specific quirk handling
   - OpenAPI spec for chat endpoints

4. **Provider Layer** (be-provider): Multi-provider integration
   - Provider adapters (OpenAI, Anthropic, Google, etc.)
   - Token counting and cost tracking
   - Rate limiting per provider
   - Fallback routing

5. **Resilience** (be-resilience): Fault tolerance
   - Circuit breakers per provider
   - Retry with backoff for rate limits
   - Timeout handling for slow providers

6. **Testing** (be-tester): Comprehensive tests
   - Mock provider tests
   - Streaming tests
   - Fallback chain tests
   - Cost calculation tests

## Arguments

- **providers**: `$ARGUMENTS.providers` — LLM providers to integrate
- **features**: `$ARGUMENTS.features` — Features to include (default: streaming,fallback,cost-tracking)
- **endpoint**: `$ARGUMENTS.endpoint` — API path (default: /api/v1/chat)

## Execution

Start by spawning be-architect with:
```
Design an LLM integration layer for providers: $ARGUMENTS.providers
Features: ${ARGUMENTS.features || "streaming,fallback,cost-tracking"}
Endpoint: ${ARGUMENTS.endpoint || "/api/v1/chat"}

Requirements:
- Unified LLMProvider interface across all providers
- SSE streaming for real-time responses
- Automatic fallback when primary provider fails
- Per-request token counting and cost tracking
- Rate limiting per provider (token bucket)
- Circuit breakers on all provider calls
- Zod validation on all inputs/outputs
- RFC 9457 errors for provider failures

Provide the architecture spec, then delegate:
1. be-implementer for route/handler skeleton
2. be-provider for provider adapters (parallel with implementer)
3. be-validator for schemas (parallel)
4. be-resilience for circuit breakers and retries
5. be-tester for contract and streaming tests
```
