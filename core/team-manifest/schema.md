# Team Manifest Schema

Codex harness team manifests describe executable team runs:

```json
{
  "team": "debate",
  "request": "PostgreSQL vs MongoDB?",
  "stages": ["advocate-a", "advocate-b", "devils-advocate", "judge"],
  "artifacts": [".harness/runs/<run-id>/transcript.md"]
}
```

Team implementations may be provider-specific, but stage names and run artifacts should be stable.
