#!/usr/bin/env bash
set -euo pipefail

PID=$1
LOG_DIR=".harness/logs"
LOG="$LOG_DIR/zombie-collector.log"

mkdir -p "$LOG_DIR"

echo "$(date -Iseconds) SIGTERM $PID" >> "$LOG"
kill -TERM "$PID" 2>/dev/null || true

for i in {1..5}; do
  sleep 1
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "$(date -Iseconds) terminated $PID (SIGTERM)" >> "$LOG"
    exit 0
  fi
done

echo "$(date -Iseconds) SIGKILL $PID (unresponsive)" >> "$LOG"
kill -KILL "$PID" 2>/dev/null || true
echo "$(date -Iseconds) killed $PID (SIGKILL)" >> "$LOG"
