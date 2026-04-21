# Agent Trace Logging

Optional observability for claude-harness-kit agent sessions.

## Quick start

```bash
HARNESS_TRACE=1 claude  # Enable for the session
```

Logs are written to `.harness/logs/<YYYY-MM-DD>/<session-id>.jsonl`.

## Full documentation

See [docs/TRACE_LOG.md](../../docs/TRACE_LOG.md) for:
- Full event schema
- All event types
- Example log output
- Useful jq queries for analysis
