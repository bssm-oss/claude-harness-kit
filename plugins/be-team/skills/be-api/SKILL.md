---
name: be-api
description: "Create a REST/RPC endpoint with Zod validation, OpenAPI spec, and RFC 9457 error handling"
user_invocable: true
arguments:
  - name: resource
    description: "Resource name (e.g., 'users', 'projects', 'chat')"
    required: true
  - name: method
    description: "HTTP method or RPC action (e.g., 'CRUD', 'POST', 'GET /search')"
    required: false
  - name: framework
    description: "hono (default) or express"
    required: false
---

# Create Backend API Endpoint

Build a complete backend endpoint through the Expert Pool pipeline.

## Workflow

1. **Architecture** (be-architect): Design the endpoint
   - Resource modeling and URL structure
   - Middleware chain (auth, validation, error handling)
   - Request/response schema shapes
   - Write spec to `.claude/specs/be-{resource}.md`

2. **Implementation + Validation** (be-implementer + be-validator in parallel):
   - be-implementer: Route handler, service layer, DI wiring
   - be-validator: Zod schemas, OpenAPI generation, RFC 9457 error factories

3. **Testing** (be-tester): HTTP contract tests
   - Happy path + error cases
   - Validation error format verification
   - Auth/authz checks

## Arguments

- **resource**: `$ARGUMENTS.resource` — The resource name
- **method**: `$ARGUMENTS.method` — HTTP method(s) or "CRUD" for full resource (default: CRUD)
- **framework**: `$ARGUMENTS.framework` — hono (default) or express

## Execution

Start by spawning be-architect with:
```
Design a REST API endpoint for resource: $ARGUMENTS.resource
Methods: ${ARGUMENTS.method || "CRUD"}
Framework: ${ARGUMENTS.framework || "hono"}

Requirements:
- Zod validation on all inputs
- OpenAPI spec auto-generated
- RFC 9457 Problem Details for errors
- pino logging

Provide the endpoint spec, then delegate:
1. be-implementer for route/handler/service implementation
2. be-validator for schemas/OpenAPI/error factories (in parallel with implementer)
3. After both complete, be-tester for contract tests
```
