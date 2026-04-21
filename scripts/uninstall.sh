#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

removed=0

# Remove agents from all plugins
for f in "$REPO_DIR"/plugins/*/agents/*.md; do
  [ -f "$f" ] || continue
  dest="$CLAUDE_DIR/agents/$(basename "$f")"
  if [ -f "$dest" ]; then
    rm "$dest"
    echo "removed: agents/$(basename "$f")"
    ((removed++))
  fi
done

# Remove skills
for d in "$REPO_DIR"/plugins/*/skills/*/; do
  [ -d "$d" ] || continue
  name="$(basename "$d")"
  dest="$CLAUDE_DIR/skills/${name}.md"
  if [ -f "$dest" ]; then
    rm "$dest"
    echo "removed: skills/${name}.md"
    ((removed++))
  fi
done

# Remove harness docs
for f in "$REPO_DIR"/plugins/*/*.md; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  dest="$CLAUDE_DIR/harnesses/$name"
  if [ -f "$dest" ]; then
    rm "$dest"
    echo "removed: harnesses/$name"
    ((removed++))
  fi
done

echo ""
echo "done. removed: $removed files."
