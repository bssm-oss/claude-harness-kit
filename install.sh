#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

mkdir -p "$CLAUDE_DIR/agents" "$CLAUDE_DIR/skills" "$CLAUDE_DIR/harnesses"

copied=0
skipped=0

# Copy agents from all plugins
for f in "$REPO_DIR"/plugins/*/agents/*.md; do
  [ -f "$f" ] || continue
  dest="$CLAUDE_DIR/agents/$(basename "$f")"
  if [ -f "$dest" ]; then
    echo "skip: agents/$(basename "$f")"
    ((skipped++))
  else
    cp "$f" "$dest"
    echo "copy: agents/$(basename "$f")"
    ((copied++))
  fi
done

# Copy skills (SKILL.md -> flat .md)
for d in "$REPO_DIR"/plugins/*/skills/*/; do
  [ -d "$d" ] || continue
  name="$(basename "$d")"
  src="$d/SKILL.md"
  dest="$CLAUDE_DIR/skills/${name}.md"
  if [ ! -f "$src" ]; then continue; fi
  if [ -f "$dest" ]; then
    echo "skip: skills/${name}.md"
    ((skipped++))
  else
    cp "$src" "$dest"
    echo "copy: skills/${name}.md"
    ((copied++))
  fi
done

# Copy harness docs
for f in "$REPO_DIR"/plugins/*/*.md; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  dest="$CLAUDE_DIR/harnesses/$name"
  if [ -f "$dest" ]; then
    echo "skip: harnesses/$name"
    ((skipped++))
  else
    cp "$f" "$dest"
    echo "copy: harnesses/$name"
    ((copied++))
  fi
done

echo ""
echo "done. copied: $copied, skipped: $skipped"
echo "add harness routing to ~/.claude/CLAUDE.md if not already present."
