# Blackboard Pattern

The Blackboard pattern enables agents to collaborate via a shared state file, without explicit message passing.

## How it works

1. **research-planner** creates the session directory and initial files
2. Each subsequent agent reads from the Blackboard, processes, and writes back
3. No agent waits for an explicit handoff — they read the current state and proceed
4. **research-synthesizer** detects gaps and can trigger additional rounds

## Session directory

```
.harness/blackboard/<session-id>/
├── plan.md        # Research plan, sub-questions, scope
├── queries.md     # Concrete search queries for each sub-question
├── findings.md    # Accumulated evidence in SOURCE-XXX format
└── synthesis.md   # Final report, updated iteratively
```

Session ID format: `research-YYYYMMDD-HHMMSS`

## File schemas

See [schema.md](./schema.md) for the exact format of each file.

## When to use

Use the Blackboard pattern when:
- Tasks run for multiple rounds and agents need to share accumulated state
- Agents may run in parallel and write to different sections of the same file
- The orchestrator cannot predict upfront how many rounds will be needed
