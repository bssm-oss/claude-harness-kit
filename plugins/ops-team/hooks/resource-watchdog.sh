#!/usr/bin/env bash
# Pre-agent-invoke hook: warns if resources are high

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! bash "$SCRIPT_DIR/../skills/zombie-collector/check-resources.sh" > /dev/null 2>&1; then
  echo "리소스 사용량 임계치 초과"
  echo "zombie-collector 실행을 권장합니다: /zombie-collector"
fi
