#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ZOMBIES=$(cat)

if [ "$(echo "$ZOMBIES" | jq 'length')" -eq 0 ]; then
  echo "No zombies found."
  exit 0
fi

echo "Claude Code Zombie Collector"
echo ""
echo "좀비/고아 프로세스 $(echo "$ZOMBIES" | jq 'length')개 발견:"
echo "$ZOMBIES" | jq -r '.[] | "  PID \(.pid) — RAM \(.rss_mb)MB, idle \(.idle_min)min"'
echo ""
read -rp "모두 종료할까요? [y/N]: " CONFIRM

if [[ "${CONFIRM:-N}" =~ ^[Yy]$ ]]; then
  echo "$ZOMBIES" | jq -r '.[].pid' | while read -r pid; do
    bash "$SCRIPT_DIR/kill-safe.sh" "$pid"
  done
  echo "정리 완료"
else
  echo "취소됨"
fi
