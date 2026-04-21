# Trace Event Schema

File: `.harness/logs/<YYYY-MM-DD>/<session-id>.jsonl`

Each line is a complete JSON object (JSONL format).

## Event Types

| Event | When emitted | Key fields |
|-------|-------------|-----------|
| `session_start` | Team begins task | session_id, team, task |
| `agent_invoke` | Agent is called | agent, model, input_tokens |
| `agent_complete` | Agent finishes | agent, output_tokens, duration_ms |
| `tool_call` | Agent calls a tool | tool, target |
| `reflection_triggered` | Reflector agent starts | agent |
| `escalation_triggered` | Escalation path taken | from_agent, to_agent |
| `circuit_open` | Circuit breaker opens | agent, failure_count |
| `session_end` | Team task complete | status, total_duration_ms |

## Full Field Reference

```typescript
{
  ts: string;               // ISO 8601: "2026-04-22T00:30:15Z"
  event: string;            // One of the event types above
  session_id: string;       // "abc123" — unique per team invocation
  
  // session_start, session_end
  team?: string;            // "fe-team", "be-team", etc.
  task?: string;            // User's original task description
  status?: string;          // "success" | "failure" | "cancelled"
  total_duration_ms?: number;
  
  // agent_invoke, agent_complete
  agent?: string;           // "fe-implementer", "be-architect", etc.
  model?: string;           // "sonnet" | "opus"
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
  
  // tool_call
  tool?: string;            // "Write", "Bash", "WebFetch", etc.
  target?: string;          // File path or URL
  
  // reflection_triggered
  issues_found?: number;    // Count of issues found by reflector
  
  // escalation_triggered
  from_agent?: string;
  to_agent?: string;
  
  // circuit_open
  failure_count?: number;
}
```
