# Changelog

## [1.0.0] - 2026-04-22

### Stable Open Source Release

First stable release. Fully tested install/uninstall pipeline, all 8 teams and 24 slash commands verified working.

### Added
- `CONTRIBUTING.md`: team/agent/skill contribution guide
- `SECURITY.md`: vulnerability reporting policy
- `CODE_OF_CONDUCT.md`: Contributor Covenant v2.1

### Fixed
- Skills now install to `~/.claude/commands/` (not `~/.claude/skills/`) — slash commands work correctly in Claude Code
- `bin/install.mjs`: path traversal defense (`assertSafeDest`), symlink skipping, hooks opt-in via `--install-hooks`
- Shell scripts: POSIX-safe arithmetic (`n=$((n+1))`), AGENTS.md exclusion, hooks copy/remove blocks

---

## [0.1.4] - 2026-04-22

### Fixed
- Install skills to `~/.claude/commands/` instead of `~/.claude/skills/` — skills now work as Claude Code slash commands
- Updated `bin/install.mjs`, `scripts/install.sh`, `scripts/uninstall.sh` accordingly

## [0.1.3] - 2026-04-22

### Security
- `bin/install.mjs`: add `assertSafeDest()` — resolves all dest paths and validates they are within `~/.claude/` before copy/delete (prevents path traversal)
- `bin/install.mjs`: skip symlinks in `collectFiles()` (prevents symlink attacks via `cpSync`)
- `bin/install.mjs`: hooks are now opt-in via `--install-hooks` flag; hook file previews printed before installation
- `bin/install.mjs`: use platform-safe path separator (`sep`) in `rel` calculation
- CI/release: pin all GitHub Actions to immutable commit SHAs (`actions/checkout`, `actions/setup-node`, `softprops/action-gh-release`)
- release.yml: add `id-token: write` + `npm publish --provenance` for SLSA Level 2 supply-chain attestation
- release.yml: bump Node to 22, drop deprecated Node 20

## [0.1.2] - 2026-04-22

### Added
- `/review-codebase` skill: full codebase review with 3–10 auto-scaled parallel screeners
  - Auto-scales by file count: ≤30→3, 31-80→5, 81-150→7, 150+→10
  - `--screeners N` to override, `--focus area` to hint
  - Files partitioned by directory; slot-based focus rotation
- `review-screener-codebase` agent: full-spectrum L1 screener that reads files directly

## [0.1.1] - 2026-04-22

### Fixed
- `scripts/install.sh` / `uninstall.sh`: replace `((n++))` with `n=$((n+1))` — safe under `set -e`
- `scripts/install.sh`: add hooks copy block; exclude `AGENTS.md` from harnesses
- `scripts/uninstall.sh`: add hooks remove block; exclude `AGENTS.md` from harnesses
- `bin/install.mjs`: uninstall now excludes `AGENTS.md` from harnesses, filters hooks to `.sh` + `isFile()`
- `bin/install.mjs`: dry-run now accurately reports copy vs skip counts
- CI: remove stale `master` branch trigger; bump Node matrix to `[20, 22]`
- Release: add `if: success()` guard before GitHub Release step

## [0.1.0] - 2026-04-22

### Initial stable release

Complete redesign from harness-for-yall v0.x.

### Renamed

- Package: `harness-for-yall` → `claude-harness-kit`
- All plugin directories renamed to `<name>-team` convention:
  - `dev-pipeline` → `dev-team`
  - `review-pipeline` → `review-team`
  - `fe-experts` → `fe-team`
  - `be-experts` → `be-team`
  - `ops-kit` → `ops-team`

### Added

#### New orchestration patterns
- **Adversarial Debate** (`debate-team`): advocate-a + advocate-b + devils-advocate → judge
- **Blackboard** (`research-team`): shared state file consumed by parallel agents
- **Reflection Loop** (`fe-reflector`, `be-reflector`): post-implementation self-critique
- **Circuit Breaker**: cross-cutting pattern docs in `core/patterns/`
- **Escalation**: Expert Pool escalation path docs

#### New teams
- `research-team` (4 agents, 3 skills): Blackboard-based long-running research
- `debate-team` (4 agents, 2 skills): Adversarial debate for contested decisions

#### New agents
- `fe-reflector`: post-implementation reflection for frontend
- `be-reflector`: post-implementation reflection for backend

#### New skills
- `ops-team/zombie-collector`: detects orphan Claude Code processes, confirms before killing

#### Structure
- `core/`: shared pattern docs and schemas (blackboard, trace)
- `docs/`: PATTERNS.md, AGENTS_MD_STANDARD.md, DESCRIPTION_FORMULA.md, CREATING_TEAMS.md, TRACE_LOG.md
- `examples/`: 5 real-world scenario walkthroughs
- `scripts/`: install.sh + uninstall.sh (moved from root)
- `.github/`: CI + release workflows, issue templates
- `AGENTS.md` in every team directory following standard format

### Improved

- All 36 agent descriptions rewritten: "Use when [TRIGGER]; handles [ACTION]" formula
- `bin/install.mjs`: hooks installation support (ops-team/hooks/ → ~/.claude/hooks/)
- `bin/uninstall.mjs`: hooks cleanup support

### Migration from v0.x

Run `npx claude-harness-kit --force` to overwrite old installation.
Directory names changed — old `*-pipeline`/`*-experts`/`*-kit` names are gone.
