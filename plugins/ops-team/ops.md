# Ops Kit

Operational productivity tools for Claude Code — release automation, CI monitoring, and behavioral rules.

## Contents

| Component | Type | What it does |
|-----------|------|-------------|
| `/release` | Skill | 9-step release pipeline: version → test → tag → CI verify → registry → smoke test |
| `/ci-watch` | Skill | Background CI monitor: detect failure → diagnose → auto-fix → re-push |
| `ci-push-check.sh` | Hook | Lightweight post-push feedback — tells Claude if CI is running/passed/failed |
| `claude-md-rules.md` | Rules | Copy-paste CLAUDE.md additions for end-to-end verification, premature execution prevention, environment safety |

## Install

### Via harness-for-yall

```bash
npx harness-for-yall ops-kit
```

### Manual

1. Copy `skills/release/SKILL.md` → `~/.claude/skills/release.md`
2. Copy `skills/ci-watch/SKILL.md` → `~/.claude/skills/ci-watch.md`
3. Copy `hooks/ci-push-check.sh` → `~/.claude/hooks/ci-push-check.sh` and `chmod +x`
4. Add hook config from `claude-md-rules.md` → your `~/.claude/settings.json`
5. Copy desired rules from `claude-md-rules.md` → your `CLAUDE.md`

## How it works

```
git push origin main
    └─▶ Hook: ci-push-check.sh
         ├─ "🏃 CI in_progress" → Claude spawns background agent to poll
         ├─ "❌ CI FAILED"      → Claude runs /ci-watch (diagnose → fix → re-push)
         └─ "✅ CI passed"      → one-line report, done

/release
    └─▶ Prerequisites → Version → Test → Tag → CI Verify → Registry → Smoke Test
         └─ Every step must pass before "done"
```

## Auto-fix scope

| Can fix automatically | Needs user confirmation |
|----------------------|------------------------|
| Runner version (macos-13 → latest) | Source code changes |
| Node.js version in workflow | Secrets / env vars |
| Lockfile regeneration | Dropping OS from matrix |
| YAML typos | |

## Battle-tested against

These gotchas were discovered in real release sessions and are encoded into the skills:

- GitHub Actions not firing on newly-migrated repos (needs manual enable via Actions tab)
- `macos-13` runner deprecation breaking release matrix
- npm auth expiration mid-session
- ESM `import.meta.url` guard failing under npm global install symlinks
- `.gitignore` used as `.npmignore` fallback causing dist/ exclusion + debug/ inclusion (5MB → 7KB fix)
- Monorepo publish loops missing packages
