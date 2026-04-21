#!/usr/bin/env bash
set -euo pipefail

CPU_THRESHOLD=${HARNESS_CPU_THRESHOLD:-80}
RAM_THRESHOLD_GB=${HARNESS_RAM_THRESHOLD_GB:-8}

if [[ "$OSTYPE" == "darwin"* ]]; then
  CPU=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | tr -d '%')
  PAGES_USED=$(vm_stat | grep "Pages active" | awk '{print $3}' | tr -d '.')
  PAGES_WIRED=$(vm_stat | grep "Pages wired" | awk '{print $4}' | tr -d '.')
  PAGE_SIZE=4096
  RAM_USED=$(( (PAGES_USED + PAGES_WIRED) * PAGE_SIZE / 1024 / 1024 / 1024 ))
else
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | tr -d '%us,')
  RAM_USED=$(free -g | awk '/^Mem:/{print $3}')
fi

echo "{\"cpu\":${CPU:-0},\"ram_gb\":${RAM_USED:-0}}"

if (( ${CPU:-0} > CPU_THRESHOLD )) || (( ${RAM_USED:-0} > RAM_THRESHOLD_GB )); then
  exit 1
fi
exit 0
