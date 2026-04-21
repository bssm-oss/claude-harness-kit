# Circuit Breaker Pattern

## Purpose

Prevents cascading failures by tracking consecutive errors and temporarily disabling a failing agent or tool call path.

## State Machine

```
CLOSED ──(3 failures in 60s)──► OPEN
  ▲                               │
  │                            (60s wait)
  │                               │
  └──── (1 success) ──── HALF_OPEN
                            │
                         (1 failure)
                            │
                            ▼
                           OPEN
```

## States

| State | Description |
|-------|-------------|
| CLOSED | Normal operation. Failures are counted. |
| OPEN | Calls blocked. Returns immediate error. |
| HALF_OPEN | One trial call allowed to test recovery. |

## Configuration

| Parameter | Default |
|-----------|---------|
| Failure threshold | 3 |
| Window | 60 seconds |
| Open timeout | 60 seconds |

## State Storage

`.harness/circuit-state.json`:

```json
{
  "agent": "be-implementer",
  "state": "OPEN",
  "failures": 3,
  "last_failure": "2026-04-22T00:30:15Z",
  "opened_at": "2026-04-22T00:30:15Z"
}
```
