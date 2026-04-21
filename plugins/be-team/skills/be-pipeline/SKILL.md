---
name: be-pipeline
description: "Multi-stage stateful orchestration pattern with checkpoints, handoff artifacts, and per-stage retry policies"
user_invocable: true
arguments:
  - name: name
    description: "Pipeline name (e.g., 'code-review', 'content-generation', 'data-processing')"
    required: true
  - name: stages
    description: "Comma-separated stage names (e.g., 'ingest,analyze,generate,review,publish')"
    required: false
  - name: stateful
    description: "Whether pipeline needs persistent state (default: true)"
    required: false
---

# Create Multi-Stage Pipeline

Build a stateful orchestration pipeline with checkpoints, handoff artifacts, and per-stage retry policies. Inspired by CodeAgora's 6-stage architecture.

## Pipeline Architecture

```
Stage 1 → Checkpoint → Stage 2 → Checkpoint → ... → Stage N → Final Output
   ↓                      ↓                            ↓
 Retry                  Retry                        Retry
 Policy                 Policy                       Policy
   ↓                      ↓                            ↓
 Fallback              Fallback                     Fallback
```

### Core Concepts

- **Stages**: Sequential processing steps with defined input/output
- **Checkpoints**: Serialized state between stages (resume on failure)
- **Handoff Artifacts**: Typed data passed between stages
- **Retry Policies**: Per-stage retry with backoff configuration
- **Circuit Breakers**: For stages that call external services

## Workflow

1. **Architecture** (be-architect): Design pipeline structure
   - Define stages, their inputs/outputs, and dependencies
   - Design checkpoint/state schema
   - Plan retry policies per stage
   - Identify stages needing circuit breakers
   - Write spec to `.claude/specs/be-pipeline-{name}.md`

2. **Implementation** (be-implementer): Build pipeline engine
   - Pipeline runner with stage execution
   - Checkpoint persistence (file/DB/Redis)
   - Handoff artifact typing

3. **Validation** (be-validator): Schema enforcement
   - Zod schemas for each stage's input/output
   - Checkpoint serialization validation
   - Pipeline configuration schema

4. **Resilience** (be-resilience): Fault tolerance
   - Per-stage retry policies
   - Circuit breakers for external stages
   - Graceful degradation and partial results

5. **Testing** (be-tester): Pipeline tests
   - Per-stage unit tests
   - Full pipeline integration tests
   - Failure/retry scenario tests
   - Checkpoint resume tests

## Pipeline Template

```typescript
interface PipelineStage<TInput, TOutput> {
  name: string;
  execute(input: TInput, ctx: PipelineContext): Promise<TOutput>;
  retryPolicy?: RetryPolicy;
  circuitBreaker?: boolean;
  timeout?: number;
}

interface PipelineContext {
  pipelineId: string;
  runId: string;
  logger: Logger;
  checkpoint: CheckpointStore;
  metadata: Record<string, unknown>;
}

interface CheckpointStore {
  save(stageIndex: number, data: unknown): Promise<void>;
  load(stageIndex: number): Promise<unknown | null>;
  getLastCompletedStage(): Promise<number>;
}
```

## Arguments

- **name**: `$ARGUMENTS.name` — Pipeline name
- **stages**: `$ARGUMENTS.stages` — Stage names (default: "ingest,process,validate,transform,review,output")
- **stateful**: `$ARGUMENTS.stateful` — Persistent state (default: true)

## Execution

Start by spawning be-architect with:
```
Design a multi-stage pipeline: $ARGUMENTS.name
Stages: ${ARGUMENTS.stages || "ingest,process,validate,transform,review,output"}
Stateful: ${ARGUMENTS.stateful || "true"}

Requirements:
- TypeScript strict, Zod schemas per stage
- Checkpoint persistence between stages
- Per-stage retry policies with exponential backoff
- Circuit breakers for external service stages
- Resume from last checkpoint on failure
- pino structured logging per stage

Provide the pipeline spec, then delegate:
1. be-implementer for pipeline engine and stages
2. be-validator for stage input/output schemas (parallel)
3. be-resilience for retry policies and circuit breakers
4. be-tester for stage and integration tests
```
