# claude-harness-kit v1.0.0 — Implementation Spec

> Reference file for Ralph loop. Contains exact file content, schemas, scripts, and formulas.

---

## A. Package Identity

```json
{
  "name": "claude-harness-kit",
  "version": "1.0.0",
  "description": "Community harness kit for Claude Code — multi-agent orchestration with 7 patterns, 8 teams, built-in operations tooling",
  "type": "module",
  "bin": { "claude-harness-kit": "bin/install.mjs" },
  "files": ["bin/", "plugins/", "scripts/", "core/", "docs/", "examples/", "README.md", "README.ko.md", "CHANGELOG.md", "LICENSE"],
  "keywords": ["claude-code", "claude", "harness", "multi-agent", "orchestration", "ai-agent", "llm", "mcp"],
  "author": "justn-hyeok",
  "license": "MIT",
  "engines": { "node": ">=18" }
}
```

---

## B. Team Roster

| Team | Pattern | Agents | Skills | Renamed From |
|------|---------|:------:|:------:|-------------|
| dev-team | Pipeline | 5 | 1 | dev-pipeline |
| review-team | Fan-out/Fan-in | 5 | 1 | review-pipeline |
| fe-team | Expert Pool + Reflection | 6 | 5 | fe-experts |
| be-team | Pipeline + Expert Pool + Reflection | 8 | 5 | be-experts |
| explore-team | Hierarchical Delegation | 4 | 3 | (unchanged) |
| research-team | Blackboard | 4 | 3 | NEW |
| debate-team | Adversarial Debate | 4 | 2 | NEW |
| ops-team | Skills + Hooks | 0 | 3 | ops-kit |

---

## C. Description Formula

**Standard format for ALL agent descriptions:**
```
"Use when [TRIGGER]; handles [ACTION]. [OPTIONAL CONTEXT]"
```

### Examples by team:

```yaml
# dev-planner
description: "Use when starting a new feature or task; handles requirement breakdown, acceptance criteria, and handoff spec to dev-frontend and dev-backend."

# dev-frontend
description: "Use when dev-planner spec is ready and UI work is needed; handles React/Next.js component implementation, state management, and data fetching."

# dev-backend
description: "Use when dev-planner spec is ready and server-side work is needed; handles API endpoints, database schemas, business logic, and validation."

# dev-reviewer
description: "Use when dev-frontend and dev-backend implementations are complete; handles cross-cutting review for correctness, style, and security."

# dev-qa
description: "Use when dev-reviewer has approved; handles unit and integration test generation, edge case analysis."

# review-screener-1
description: "Use when code needs correctness analysis; handles logic errors, algorithmic issues, and specification adherence. L1 screener."

# review-screener-2
description: "Use when code needs security analysis; handles auth flaws, injection risks, secret exposure, and OWASP Top 10. L1 screener."

# review-screener-3
description: "Use when code needs performance and style analysis; handles algorithmic complexity, bundle size, and code style. L1 screener."

# review-moderator
description: "Use when all L1 screeners have reported; handles conflict resolution and unified finding consolidation."

# review-judge
description: "Use when review-moderator report is ready; handles final approve/block verdict with SARIF-compatible output."

# fe-architect
description: "Use when designing React component structure, Next.js page architecture, or planning state management; delegates to fe-implementer, fe-styler, fe-perf, fe-tester."

# fe-implementer
description: "Use when fe-architect spec is ready; handles React component implementation with TypeScript, hooks, and data fetching."

# fe-reflector
description: "Use after fe-implementer completes; handles self-critique against original spec, identifies bugs and missing edge cases. Routes HIGH severity issues back to fe-implementer."

# fe-styler
description: "Use when component needs Tailwind CSS styling, responsive design, dark mode, or WCAG accessibility review."

# fe-perf
description: "Use when component needs performance audit; handles bundle size analysis, lazy loading, and memoization."

# fe-tester
description: "Use when implementation is approved; handles Vitest unit tests, Testing Library component tests, and Playwright E2E."

# be-architect
description: "Use when designing backend API routes, resource models, or middleware strategy for Hono/Express; delegates to be-implementer and be-validator."

# be-implementer
description: "Use when be-architect spec is ready; handles Hono/Express route handlers, middleware, and dependency injection."

# be-reflector
description: "Use after be-implementer completes; handles self-critique for type safety, error responses, and security gaps. Routes HIGH severity issues back to be-implementer."

# be-validator
description: "Use when API implementation needs input validation; handles Zod schemas, OpenAPI generation, and RFC 9457 error responses."

# be-resilience
description: "Use when API needs fault tolerance; handles circuit breakers, exponential backoff, timeouts, and health checks."

# be-provider
description: "Use when integrating multiple LLM providers; handles streaming adapters, token counting, cost tracking, and graceful fallback."

# be-security
description: "Use when API needs security hardening; handles AuthN/Z, secret management, CORS, audit logging, and OWASP Top 10 defense."

# be-tester
description: "Use when backend implementation is approved; handles Vitest + Supertest HTTP contract tests and integration tests."

# explore-scout
description: "Use when investigating codebase architecture, tracing a bug's root cause, or planning a major refactor; orchestrates hypothesizer, evidence, and synthesizer sub-agents."

# explore-hypothesizer
description: "Use when explore-scout needs competing explanations; handles generating multiple hypotheses about architecture or behavior from exploration data."

# explore-evidence
description: "Use when a hypothesis needs validation; handles code search, file analysis, and test execution to gather supporting or refuting evidence."

# explore-synthesizer
description: "Use when evidence collection is complete; handles consolidating findings into an actionable architecture report."

# research-planner
description: "Use when starting a research task; handles breaking down the research question, creating sub-queries, and initializing the blackboard at .harness/blackboard/<session-id>/."

# research-crawler
description: "Use when research-planner queries.md is ready; handles web crawling and page fetching via WebFetch/WebSearch. Writes SOURCE-XXX entries to findings.md."

# research-reader
description: "Use when research-crawler has populated findings.md; handles extracting structured data and key claims from raw crawled content."

# research-synthesizer
description: "Use when findings.md has sufficient data; handles assembling the final report to synthesis.md. Detects gaps and triggers additional crawling if needed."

# debate-advocate-a
description: "Use when a contested decision needs structured debate; argues FOR the primary position with evidence and reasoning."

# debate-advocate-b
description: "Use when debate-advocate-a has stated their position; argues AGAINST or for an alternative position, directly countering advocate-a."

# debate-devils-advocate
description: "Use after both advocates have stated positions; challenges the weakest arguments on both sides to prevent groupthink."

# debate-judge
description: "Use when debate rounds are complete; handles weighing evidence, issuing a verdict, and documenting the dissenting opinion."
```

---

## D. AGENTS.md Standard Format

Every team directory must have an `AGENTS.md` with this exact structure:

```markdown
<!-- Parent: ../../AGENTS.md -->
<!-- Generated: YYYY-MM-DD -->

# <team-name>

## Purpose

One paragraph explaining why this team exists and what problem it solves.

## Pattern

The orchestration pattern this team implements. See [docs/PATTERNS.md](../../docs/PATTERNS.md).

## Agents

| Agent | Model | Role | Triggers |
|-------|-------|------|----------|
| agent-name | sonnet/opus | Short role description | "Use when..." |

## Skills

| Skill | Purpose |
|-------|---------|
| skill-name | One-line description |

## Dependencies

- Required: none / list of required other teams
- Optional: list of optional integrations

## Routing Rules

**Use this team when:**
- ...

**Do NOT use when:**
- ...

## For AI Agents

### Entry Point
Which agent receives the task first and how.

### Data Flow
How agents pass artifacts between each other.

### Exit Criteria
When the team considers the task complete.
```

---

## E. Blackboard Schema

### Directory structure
```
.harness/blackboard/<session-id>/
├── plan.md        # Research plan + sub-questions
├── queries.md     # Search queries to execute
├── findings.md    # Accumulated evidence (SOURCE-XXX format)
└── synthesis.md   # Final report (updated iteratively)
```

### findings.md format
```markdown
# findings.md

## [SOURCE-001] https://example.com/article
Extracted: 2026-04-22T00:30:15Z
Extractor: research-reader
Confidence: HIGH

### Key claims
- Claim 1
- Claim 2

### Raw excerpts
> "..."

---

## [SOURCE-002] ...
```

---

## F. Agent Trace Log Schema

File: `.harness/logs/<YYYY-MM-DD>/<session-id>.jsonl`

```jsonl
{"ts":"2026-04-22T00:30:15Z","event":"session_start","session_id":"abc123","team":"fe-team","task":"..."}
{"ts":"2026-04-22T00:30:16Z","event":"agent_invoke","agent":"fe-architect","model":"sonnet","input_tokens":1234}
{"ts":"2026-04-22T00:30:45Z","event":"agent_complete","agent":"fe-architect","output_tokens":567,"duration_ms":29000}
{"ts":"2026-04-22T00:30:46Z","event":"agent_invoke","agent":"fe-implementer","model":"sonnet"}
{"ts":"2026-04-22T00:32:10Z","event":"tool_call","tool":"Write","target":"src/Component.tsx"}
{"ts":"2026-04-22T00:32:15Z","event":"reflection_triggered","agent":"fe-reflector"}
{"ts":"2026-04-22T00:32:45Z","event":"agent_complete","agent":"fe-reflector","issues_found":2}
{"ts":"2026-04-22T00:33:00Z","event":"session_end","status":"success","total_duration_ms":165000}
```

Events: `session_start`, `agent_invoke`, `agent_complete`, `tool_call`, `reflection_triggered`, `escalation_triggered`, `circuit_open`, `session_end`

---

## G. Agent Frontmatter Template

```yaml
---
name: <agent-name>
description: "Use when [TRIGGER]; handles [ACTION]. [OPTIONAL CONTEXT]"
model: sonnet
tools:
  - Read
  - Glob
  - Grep
reflect: false
escalate_to: ""
---
```

Tool sets by role:
- **Architect/planner** (read-only): `Read, Glob, Grep, Agent, SendMessage, TaskCreate, TaskUpdate, TaskGet, TaskList, mcp__sequential-thinking__sequentialthinking`
- **Implementer** (read+write): `Read, Write, Edit, Glob, Grep, Bash, SendMessage, TaskUpdate, mcp__claude_ai_Context7__resolve-library-id, mcp__claude_ai_Context7__query-docs`
- **Tester/reviewer** (read+write+bash): `Read, Write, Edit, Glob, Grep, Bash, SendMessage, TaskUpdate`
- **Research crawler**: `Read, Write, Edit, Glob, Grep, Bash, SendMessage, TaskUpdate, WebFetch, WebSearch`
- **Design spec parser**: `Read, Glob, Grep, mcp__claude_ai_Figma__get_design_context, mcp__claude_ai_Figma__get_screenshot, mcp__claude_ai_Figma__get_metadata`
- **Explorer** (read-only): `Read, Glob, Grep, Bash, SendMessage, TaskUpdate`

---

## H. zombie-collector Scripts

### SKILL.md
```markdown
---
name: zombie-collector
description: "Use when Claude Code session resource usage exceeds threshold or test runs left orphan processes; detects zombies, asks for confirmation, kills safely."
trigger: /zombie-collector
---

# Zombie Collector

Detects high resource usage and orphan Claude Code processes. Asks before killing.

## Usage

Manual:
  /zombie-collector

## What it does

1. Check resource usage (CPU, RAM)
2. If above threshold → find orphan processes
3. Identify Claude Code zombies (ppid=1, idle>10min)
4. Present list with PID, RAM, idle time
5. Ask for confirmation (default: no)
6. Kill approved processes with SIGTERM, then SIGKILL if stubborn
7. Log to .harness/logs/zombie-collector.log

## Environment Variables

- `HARNESS_CPU_THRESHOLD` — CPU% threshold (default: 80)
- `HARNESS_RAM_THRESHOLD_GB` — RAM GB threshold (default: 8)
```

### check-resources.sh
```bash
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
```

### find-zombies.sh
```bash
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
```

### prompt-kill.sh
```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ZOMBIES=$(cat)

if [ "$(echo "$ZOMBIES" | jq 'length')" -eq 0 ]; then
  echo "🩺 No zombies found."
  exit 0
fi

echo "🩺 Claude Code Zombie Collector"
echo ""
echo "좀비/고아 프로세스 $(echo "$ZOMBIES" | jq 'length')개 발견:"
echo "$ZOMBIES" | jq -r '.[] | "  PID \(.pid) — RAM \(.rss_mb)MB, idle \(.idle_min)min"'
echo ""
read -rp "모두 종료할까요? [y/N]: " CONFIRM

if [[ "${CONFIRM:-N}" =~ ^[Yy]$ ]]; then
  echo "$ZOMBIES" | jq -r '.[].pid' | while read -r pid; do
    bash "$SCRIPT_DIR/kill-safe.sh" "$pid"
  done
  echo "✅ 정리 완료"
else
  echo "❌ 취소됨"
fi
```

### kill-safe.sh
```bash
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
```

### resource-watchdog.sh (optional hook)
```bash
#!/usr/bin/env bash
# Pre-agent-invoke hook: warns if resources are high

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! bash "$SCRIPT_DIR/../skills/zombie-collector/check-resources.sh" > /dev/null 2>&1; then
  echo "⚠️  리소스 사용량 임계치 초과"
  echo "zombie-collector 실행을 권장합니다: /zombie-collector"
fi
```

---

## I. GitHub Workflows

### .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  validate:
    name: Validate (${{ matrix.node }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - name: Validate package.json
        run: node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"
      - name: npm pack dry-run
        run: npm pack --dry-run
      - name: Validate marketplace.json
        run: node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('marketplace.json OK')"
      - name: Check bash scripts
        run: |
          find plugins scripts -name '*.sh' -exec bash -n {} \; -print
          echo "All bash scripts OK"
```

### .github/workflows/release.yml
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

### .github/ISSUE_TEMPLATE/bug_report.md
```markdown
---
name: Bug report
about: Something isn't working
labels: bug
---

**Team/Agent affected:**

**What happened:**

**Expected behavior:**

**Steps to reproduce:**

**Environment:**
- OS:
- Node version:
- claude-harness-kit version:
```

### .github/ISSUE_TEMPLATE/feature_request.md
```markdown
---
name: Feature request
about: Suggest a new agent, skill, or pattern
labels: enhancement
---

**What problem does this solve?**

**Proposed solution:**

**Which team/pattern would this affect?**
```

### .github/ISSUE_TEMPLATE/new_team_proposal.md
```markdown
---
name: New team proposal
about: Propose a new team plugin
labels: new-team
---

**Team name:** `<name>-team`

**Pattern:** (Pipeline / Fan-out / Expert Pool / Hierarchical / Blackboard / Adversarial)

**Agents (list):**

**Skills (list):**

**Use cases:**

**Why not extend an existing team?**
```

---

## J. CHANGELOG.md Content

```markdown
# Changelog

## [1.0.0] - 2026-04-22

### 🎉 Initial stable release

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
```

---

## K. Orchestration Patterns Reference

### 7 Main Patterns

1. **Pipeline** — Sequential transformation. Each stage's output is next stage's input.
2. **Fan-out / Fan-in** — Parallel independent workers, results aggregated.
3. **Expert Pool** — Route to specialist agent by domain, same task different angles.
4. **Pipeline + Expert Pool (hybrid)** — Sequential stages, each stage is an expert.
5. **Hierarchical Delegation** — Orchestrator scouts, then delegates to specialists.
6. **Adversarial Debate** — Multiple advocates argue positions, judge decides.
7. **Blackboard** — Shared state file; agents read/write autonomously, no explicit handoff.

### 4 Cross-cutting Patterns

- **Reflection Loop** — Implementer → Reflector → back if HIGH severity issues.
- **Circuit Breaker** — CLOSED → OPEN (3 failures/60s) → HALF_OPEN (60s) → CLOSED.
- **Escalation** — Junior fails 3x → Senior re-plans → Junior retries.
- **Consensus Voting** — Multi-agent vote, tie-break by rounds (max 5).

---

## L. plugin.json Template

Each plugin directory needs `.claude-plugin/plugin.json`:

```json
{
  "name": "<team-name>",
  "version": "1.0.0",
  "description": "<one-line description>",
  "keywords": ["<keyword>"],
  "category": "development|quality|frontend|backend|analysis|research|reasoning|operations"
}
```
