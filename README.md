# harness-for-yall

Claude Code multi-agent harness: 25 agents, 15 skills, 5 teams.

## Teams

| Plugin | Pattern | Agents | Skills | Purpose |
|--------|---------|--------|--------|---------|
| dev-pipeline | Pipeline | 5 | 1 | planner -> FE+BE parallel -> reviewer -> QA |
| review-pipeline | Fan-out/Fan-in | 5 | 1 | 3 screeners -> moderator -> judge (SARIF) |
| fe-experts | Expert Pool | 5 | 5 | architect routes to implementer/styler/perf/tester |
| be-experts | Pipeline + Expert Pool | 6 | 5 | architect -> impl+validator -> resilience/provider -> tester |
| explore-team | Hierarchical Delegation | 4 | 3 | scout(opus) -> hypothesizer -> evidence -> synthesizer |

## Install

### Option 1: npx (flat copy to ~/.claude/)

```bash
# Install all plugins
npx claude-code-harness

# Install specific plugins only
npx claude-code-harness fe-experts be-experts

# Preview without copying
npx claude-code-harness --dry-run

# Overwrite existing files
npx claude-code-harness --force
```

### Option 2: Plugin Marketplace

In Claude Code:

```
/plugin marketplace add bssm-oss/harness-for-yall
/plugin install dev-pipeline@justn-harness
/plugin install review-pipeline@justn-harness
/plugin install fe-experts@justn-harness
/plugin install be-experts@justn-harness
/plugin install explore-team@justn-harness
```

### Option 3: Shell script (symlink)

```bash
chmod +x install.sh && ./install.sh
```

## Structure

```
.claude-plugin/
  marketplace.json       # Plugin Marketplace catalog
plugins/
  dev-pipeline/          # 5 agents + 1 skill
  review-pipeline/       # 5 agents + 1 skill
  fe-experts/            # 5 agents + 5 skills
  be-experts/            # 6 agents + 5 skills
  explore-team/          # 4 agents + 3 skills
bin/
  install.mjs            # npx CLI entry point
package.json             # npm package config
install.sh               # Symlink installer
uninstall.sh             # Symlink cleanup
```

## Model Strategy

- `explore-scout`: opus (orchestration + architecture judgment)
- Everything else: sonnet (cost efficiency)

## Routing Rules

1. Specificity first: be > dev, fe > dev (use specialized teams over generic dev)
2. Chainable: explore -> dev -> review
3. Skip harness for trivial tasks (one-line fixes, simple questions)
