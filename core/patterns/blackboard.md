# Blackboard Pattern

See [core/blackboard/README.md](../blackboard/README.md) for the full description.

## Summary

Agents share state via files (the "Blackboard") instead of explicit message passing. Each agent reads the current state, processes it, and writes back — enabling async and multi-round collaboration.

## Key properties

- **No explicit handoff**: Agents pull from the Blackboard when ready
- **Iterative**: Multiple crawling/reading rounds possible until synthesizer is satisfied
- **Persistent**: Blackboard survives agent restarts
- **Auditable**: All evidence is preserved in findings.md with source attribution

## File format

See [core/blackboard/schema.md](../blackboard/schema.md) for exact schemas.
