# Run State Schema

Each Codex harness execution writes `.harness/runs/<run-id>/`:

```text
manifest.json
trace.jsonl
transcript.md
artifacts/
blackboard/
```

`manifest.json` records run identity, team, request, status, paths, route metadata, and section summaries.
`trace.jsonl` records timestamped lifecycle events. `transcript.md` is the human-readable result.
