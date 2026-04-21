#!/usr/bin/env bash
set -euo pipefail

ps -eo pid,ppid,rss,etime,comm,args 2>/dev/null \
  | grep -i 'claude' \
  | grep -v grep \
  | while IFS= read -r line; do
      pid=$(echo "$line" | awk '{print $1}')
      ppid=$(echo "$line" | awk '{print $2}')
      rss=$(echo "$line" | awk '{print $3}')
      etime=$(echo "$line" | awk '{print $4}')
      args=$(echo "$line" | awk '{$1=$2=$3=$4=$5=""; print $0}' | xargs)

      if [ "$ppid" -eq 1 ] 2>/dev/null; then
        # Parse elapsed time to minutes
        if [[ "$etime" =~ ^([0-9]+)-([0-9]+):([0-9]+):([0-9]+)$ ]]; then
          idle_min=$(( (${BASH_REMATCH[1]} * 1440) + (${BASH_REMATCH[2]} * 60) + ${BASH_REMATCH[3]} ))
        elif [[ "$etime" =~ ^([0-9]+):([0-9]+):([0-9]+)$ ]]; then
          idle_min=$(( (${BASH_REMATCH[1]} * 60) + ${BASH_REMATCH[2]} ))
        elif [[ "$etime" =~ ^([0-9]+):([0-9]+)$ ]]; then
          idle_min=${BASH_REMATCH[1]}
        else
          idle_min=0
        fi

        if [ "$idle_min" -gt 10 ]; then
          rss_mb=$((rss / 1024))
          printf '{"pid":%s,"rss_mb":%s,"idle_min":%s,"command":"%s"}\n' \
            "$pid" "$rss_mb" "$idle_min" "${args//\"/\\\"}"
        fi
      fi
    done | jq -s .
