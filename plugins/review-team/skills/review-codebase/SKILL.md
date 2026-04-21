---
name: review-codebase
description: "Full codebase review with 3–10 parallel screeners. Auto-scales to file count or takes --screeners N."
trigger: "review codebase|audit codebase|codebase review|코드베이스 리뷰|전체 리뷰"
---

# /review-codebase — Codebase Review

Orchestrates a full codebase review by partitioning files across N parallel screeners (3–10), then consolidating through moderator → judge.

## Usage

```
/review-codebase [path]                    # Review specific path (default: .)
/review-codebase src/ --screeners 5        # Force screener count
/review-codebase --focus security          # Hint screeners to prioritize security
/review-codebase src/ --screeners 7 --focus perf,style
```

**Options**
- `path` — Directory or file glob to review. Default: `.` (project root)
- `--screeners N` — Number of parallel screeners (3–10). Omit to auto-calculate.
- `--focus <areas>` — Comma-separated hint: `correctness`, `security`, `perf`, `style`, `all` (default: `all`)

---

## Workflow

### Step 0 — Parse Args & Collect Files

1. Parse `path`, `--screeners`, `--focus` from the user's invocation.
2. Glob all reviewable files under `path`:
   - Include: `**/*.{js,ts,mjs,cjs,jsx,tsx,py,go,rs,java,rb,sh,bash,yml,yaml,json,toml}`
   - Exclude: `node_modules/`, `.git/`, `dist/`, `build/`, `*.lock`, `*.min.*`
3. Count total files → `fileCount`.

### Step 1 — Determine Screener Count

If `--screeners N` was given, clamp to [3, 10] and use it.

Otherwise auto-calculate from `fileCount`:

| Files | Screeners |
|-------|-----------|
| ≤ 30  | 3         |
| 31–80 | 5         |
| 81–150| 7         |
| 151+  | 10        |

Log: `Reviewing <fileCount> files with <N> screeners.`

### Step 2 — Partition Files

Split the file list into N roughly equal groups. Prefer grouping by directory so each screener gets a coherent slice (e.g., all of `src/utils/` goes to one screener rather than being split across two).

Assign each group a **slot number** (1–N) and a **primary focus** from this rotation:

| Slot | Primary focus |
|------|--------------|
| 1    | correctness  |
| 2    | security     |
| 3    | perf + style |
| 4    | error handling + edge cases |
| 5    | config, deps, CI/CD |
| 6    | test coverage + assertions |
| 7    | API design + contracts |
| 8    | documentation + comments |
| 9    | maintainability + DRY |
| 10   | architecture + coupling |

If `--focus` was specified, prepend those areas to every screener's focus list.

### Step 3 — Fan-Out: Parallel Screeners

Launch all N **review-screener-codebase** agents **in parallel** using the Agent tool.

Each agent prompt must include:
- The list of file paths assigned to this screener (full paths)
- The primary focus for this slot
- The `--focus` override if provided
- Instruction to use the Read tool to read each file before reviewing
- Instruction to return a JSON array of findings per the review-screener-codebase spec

**Do not run screeners sequentially — launch all N at once.**

Wait for all N to complete.

### Step 4 — Fan-In: Moderator

Launch **review-moderator** with:
- All N JSON arrays concatenated
- Total file count and screener count for context
- Instruction to deduplicate cross-screener findings, resolve severity conflicts, and produce the consolidated report

### Step 5 — Final Verdict: Judge

Launch **review-judge** with the moderator's consolidated report.

### Step 6 — Output

1. Save the SARIF JSON report to `review-report.sarif.json` in the project root.
2. Present a human-readable summary:

```
## Codebase Review Complete

**Path**: <reviewed path>
**Files reviewed**: <N>
**Screeners used**: <N>
**Verdict**: [APPROVE | APPROVE_WITH_NOTES | REQUEST_CHANGES | BLOCK]
**Risk Level**: [CRITICAL | HIGH | MODERATE | LOW | CLEAN]

### Findings Summary
- BLOCKER: X
- HIGH: X
- MEDIUM: X
- LOW: X

### Top Issues
1. <file>:<line> — <description>
2. ...

### Action Items
- ...

Full SARIF report: review-report.sarif.json
```

---

## Rules

- Screeners run **in parallel** — never sequentially
- Moderator and judge run **sequentially** after all screeners complete
- If a screener fails, log the failure and continue with available results
- Never review `node_modules/`, `.git/`, or lock files
- If `fileCount` is 0, tell the user and exit
