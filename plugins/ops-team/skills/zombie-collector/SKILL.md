---
name: zombie-collector
description: "Use when Claude Code session resource usage exceeds threshold or test runs left orphan processes; detects zombies, asks for confirmation, kills safely."
trigger: /zombie-collector
---

# zombie-collector

Detects high resource usage and orphan Claude Code processes. Asks before killing.

## Usage

Manual:
```
/zombie-collector
```

## What it does

1. Check resource usage (CPU, RAM) via `check-resources.sh`
2. If above threshold → find orphan processes via `find-zombies.sh`
3. Identify Claude Code zombies: parent PID = 1, idle > 10 min
4. Present list with PID, RAM usage, idle time
5. Ask for confirmation (default: no) via `prompt-kill.sh`
6. Kill approved processes with SIGTERM → wait 5s → SIGKILL if stubborn via `kill-safe.sh`
7. Log to `.harness/logs/zombie-collector.log`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HARNESS_CPU_THRESHOLD` | 80 | CPU% threshold to trigger scan |
| `HARNESS_RAM_THRESHOLD_GB` | 8 | RAM GB threshold to trigger scan |
| `HARNESS_AUTO_REAP` | (unset) | If set, auto-kill without confirmation |

## Scripts

- `check-resources.sh` — measure CPU and RAM, exit 1 if above threshold
- `find-zombies.sh` — find orphan claude-code processes, output JSON array
- `prompt-kill.sh` — display list, ask confirmation, invoke kill-safe
- `kill-safe.sh <PID>` — SIGTERM → 5s wait → SIGKILL if alive

## Optional auto-trigger hook

Add `resource-watchdog.sh` to ops-team hooks to warn on high resource usage before each agent invocation.
