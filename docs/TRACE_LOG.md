# Agent Trace Logging

claude-harness-kit supports optional trace logging for observability.

## Enabling

```bash
# Via environment variable
HARNESS_TRACE=1 npx claude-harness-kit

# Via agent frontmatter (per-agent)
---
name: fe-implementer
trace: true
---
```

## Log Location

```
.harness/logs/<YYYY-MM-DD>/<session-id>.jsonl
```

## Event Schema

Each line is a JSON object:

```typescript
type TraceEvent = {
  ts: string;           // ISO 8601 timestamp
  event: EventType;     // See event types below
  session_id: string;   // Unique session identifier
  team?: string;        // Team name (e.g., "fe-team")
  agent?: string;       // Agent name (e.g., "fe-implementer")
  model?: string;       // "sonnet" | "opus"
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
  tool?: string;        // Tool name for tool_call events
  target?: string;      // File path for tool_call events
  issues_found?: number; // For reflection events
  status?: string;      // "success" | "failure" | "cancelled"
  total_duration_ms?: number;
}

type EventType =
  | "session_start"
  | "agent_invoke"
  | "agent_complete"
  | "tool_call"
  | "reflection_triggered"
  | "escalation_triggered"
  | "circuit_open"
  | "session_end";
```

## Example Log

```jsonl
{"ts":"2026-04-22T00:30:15Z","event":"session_start","session_id":"abc123","team":"fe-team","task":"Build UserCard component"}
{"ts":"2026-04-22T00:30:16Z","event":"agent_invoke","session_id":"abc123","agent":"fe-architect","model":"sonnet","input_tokens":1234}
{"ts":"2026-04-22T00:30:45Z","event":"agent_complete","session_id":"abc123","agent":"fe-architect","output_tokens":567,"duration_ms":29000}
{"ts":"2026-04-22T00:30:46Z","event":"agent_invoke","session_id":"abc123","agent":"fe-implementer","model":"sonnet","input_tokens":2100}
{"ts":"2026-04-22T00:32:10Z","event":"tool_call","session_id":"abc123","agent":"fe-implementer","tool":"Write","target":"src/components/UserCard.tsx"}
{"ts":"2026-04-22T00:32:15Z","event":"reflection_triggered","session_id":"abc123","agent":"fe-reflector"}
{"ts":"2026-04-22T00:32:45Z","event":"agent_complete","session_id":"abc123","agent":"fe-reflector","output_tokens":234,"duration_ms":30000,"issues_found":2}
{"ts":"2026-04-22T00:33:00Z","event":"session_end","session_id":"abc123","status":"success","total_duration_ms":165000}
```

## Useful jq Queries

```bash
# Average session duration by team
jq -s 'map(select(.event == "session_end")) | group_by(.team) | map({team: .[0].team, avg_ms: (map(.total_duration_ms) | add / length)})' .harness/logs/**/*.jsonl

# Most frequently invoked agent
jq -r 'select(.event == "agent_invoke") | .agent' .harness/logs/**/*.jsonl | sort | uniq -c | sort -rn

# Sessions with reflection triggered
jq -s 'map(select(.event == "reflection_triggered")) | group_by(.session_id) | map({session: .[0].session_id, count: length})' .harness/logs/**/*.jsonl

# Total tokens by model
jq -s 'map(select(.event == "agent_complete") | {model, tokens: (.input_tokens + .output_tokens)}) | group_by(.model) | map({model: .[0].model, total_tokens: (map(.tokens) | add)})' .harness/logs/**/*.jsonl

# All tool calls for a specific session
jq 'select(.event == "tool_call" and .session_id == "abc123")' .harness/logs/**/*.jsonl
```

## Privacy

Trace logs stay local. They are never uploaded or transmitted. Add `.harness/` to `.gitignore` to exclude them from version control (already done in the default `.gitignore`).
