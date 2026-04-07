---
name: be-observability
description: "Add structured logging (pino), Prometheus metrics (prom-client), and distributed tracing (OpenTelemetry)"
user_invocable: true
arguments:
  - name: scope
    description: "What to instrument (e.g., 'full', 'logging', 'metrics', 'tracing')"
    required: false
  - name: target
    description: "File or module to instrument (e.g., 'src/routes/v1/chat.ts')"
    required: false
---

# Add Observability

Add structured logging, Prometheus metrics, and distributed tracing to backend services.

## Three Pillars

### 1. Structured Logging (pino)
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
```

### 2. Prometheus Metrics (prom-client)
```typescript
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const registry = new Registry();

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10],
  registers: [registry],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [registry],
});

export const llmTokensUsed = new Counter({
  name: 'llm_tokens_used_total',
  help: 'Total LLM tokens used',
  labelNames: ['provider', 'model', 'type'],
  registers: [registry],
});

export const llmRequestCost = new Counter({
  name: 'llm_request_cost_usd',
  help: 'Total LLM API cost in USD',
  labelNames: ['provider', 'model'],
  registers: [registry],
});

export const circuitBreakerState = new Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=half-open, 2=open)',
  labelNames: ['name'],
  registers: [registry],
});
```

### 3. Distributed Tracing (OpenTelemetry)
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [new HttpInstrumentation()],
  serviceName: process.env.SERVICE_NAME ?? 'backend',
});

sdk.start();
```

## Workflow

1. **Architecture** (be-architect): Design observability strategy
   - Which metrics matter for this service
   - Log levels and redaction rules
   - Trace propagation requirements

2. **Implementation** (be-implementer): Wire up instrumentation
   - pino logger setup and middleware
   - Prometheus metrics middleware
   - OpenTelemetry SDK initialization
   - Custom metrics for business events

3. **Validation** (be-validator): Verify metric names and labels
   - Prometheus naming conventions
   - Label cardinality checks

4. **Testing** (be-tester): Verify instrumentation
   - Log output assertions
   - Metrics endpoint contract tests
   - Trace propagation tests

## Arguments

- **scope**: `$ARGUMENTS.scope` — What to add (default: full)
- **target**: `$ARGUMENTS.target` — Specific file/module to instrument

## Execution

Start by spawning be-architect with:
```
Design observability for scope: ${ARGUMENTS.scope || "full"}
Target: ${ARGUMENTS.target || "entire service"}

Requirements:
- pino for structured logging (redact auth headers)
- prom-client for Prometheus metrics (/metrics endpoint)
- OpenTelemetry for distributed tracing
- Custom metrics: HTTP duration, LLM token usage, cost, circuit breaker state
- Request ID propagation (x-request-id)

Delegate:
1. be-implementer for logger/metrics/tracing setup
2. be-validator for metric naming conventions
3. be-tester for instrumentation verification
```
