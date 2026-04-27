# codex-harnesses — Python Orchestrator Design

Python implementation of the harnesses multi-agent patterns, powered by Codex CLI.

---

## Core finding (verified)

`codex exec -c "developer_instructions='...'" -o out.txt "prompt"` works.
No Agents SDK needed — pure subprocess orchestration.

---

## Architecture decision table

| Question | Decision | Alternative | Why |
|---|---|---|---|
| Execution layer | `codex exec` subprocess | Agents SDK + MCPServerStdio + GPT-4.1 bridge | Simpler; no relay cost; trivially testable with subprocess mocks |
| Output capture | `-o <tmpfile>` | `--json` JSONL parse | One line; no JSONL event parsing |
| Instruction injection | `-c developer_instructions=...` | Named TOML agent files | Per-call; avoids Codex issue #15250 (named agents inaccessible from MCP sessions) |
| Flow control | Python asyncio | o3 dynamic planner | Fixed-flow teams and chained teams are explicit, testable Python flows |
| Parallelism | `asyncio.gather` for independent steps | threads | Native async; works with `asyncio.create_subprocess_exec` |
| Model | inherits `~/.codex/config.toml` default | hardcoded `gpt-4.1` | Respects user config; overridable per-call with `-m` |

Dynamic planning is deliberately kept outside the first implementation. The router chooses a team or chain; each team owns its deterministic flow.

---

## Package layout

```
codex/                         # Codex layer, sibling to claudecode/ and core/
├── pyproject.toml             # pip install codex-harnesses
├── src/
│   └── codex_harnesses/
│       ├── __init__.py        # version only
│       ├── runner.py          # run_worker() — subprocess wrapper
│       ├── cli.py             # debate/route/run/resume commands
│       ├── routing.py         # natural-language team classifier
│       ├── state.py           # .harness/runs/<run-id>/ recorder
│       └── teams/
│           ├── __init__.py
│           ├── debate.py      # Advocate A → B → DA → Judge
│           ├── explore.py     # Scout → Hypotheses → Evidence → Synthesis
│           ├── review.py      # Fan-out reviewers → Moderator → Judge
│           └── research.py    # Plan → Collect → Read → Synthesize
└── agents/
    ├── debate/
    ├── explore/
    ├── review/
    └── research/
codex/plugin/harnesses/        # Codex plugin/skills for auto-routing
```

---

## Core runner (`runner.py`)

```python
import asyncio
import tempfile
from pathlib import Path
from dataclasses import dataclass

@dataclass
class WorkerResult:
    role: str
    output: str

async def run_worker(
    role: str,
    prompt: str,
    developer_instructions: str,
    model: str | None = None,
    sandbox: str = "workspace-write",
    workdir: str | None = None,
) -> WorkerResult:
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
        out_path = Path(f.name)

    cmd = [
        "codex", "exec",
        "-c", f"developer_instructions={repr(developer_instructions)}",
        "-s", sandbox,
        "--ephemeral",
        "--color", "never",
        "-o", str(out_path),
        prompt,
    ]
    if model:
        cmd += ["-m", model]
    if workdir:
        cmd += ["-C", workdir]

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()

    output = out_path.read_text().strip()
    out_path.unlink(missing_ok=True)

    if not output:
        raise RuntimeError(f"[{role}] no output. stderr: {stderr.decode()[:500]}")

    return WorkerResult(role=role, output=output)
```

---

## Debate team flow

```
codex-harnesses run debate "PostgreSQL vs MongoDB?" \
    --option-a "PostgreSQL" --option-b "MongoDB"

Step 1 — Advocate A
  codex exec -c developer_instructions='...' "Question + Option A"
  → advocate_a_output

Step 2 — Advocate B  (reads A's output to rebut)
  codex exec -c developer_instructions='...' "A said: {a_out}\nOption B: MongoDB"
  → advocate_b_output

Step 3 — Devil's Advocate
  codex exec -c developer_instructions='...' "A: {a_out}\nB: {b_out}"
  → da_output

Step 4 — Judge
  codex exec -c developer_instructions='...' "A: ...\nB: ...\nDA: ..."
  → verdict (printed to stdout + saved to debate-{slug}.md)
```

Steps 1→2→3→4 are sequential (each reads the previous output).  
Review uses `asyncio.gather` for independent correctness/security/performance reviewers.

---

## TOML agent format (`agents/debate/advocate_a.toml`)

```toml
name = "advocate-a"

developer_instructions = """
# Role
You are Advocate A in a structured debate. Argue FOR Option A.

# Instructions
1. Build the strongest case FOR Option A using evidence and reasoning.
2. Pre-empt the obvious counterarguments.
3. Use read_file or list_directory if you need to examine code files.

# Output format
## Advocate A — Position: <Option A name>
### Core claim
### Evidence
### Pre-empted counterarguments
### Conditions where Option A wins

# Rules
- Max 400 words. Concrete evidence over rhetoric.
- Do NOT attack Option B directly.

# Reminders
- Complete your argument fully before stopping.
- Call tools if codebase evidence would strengthen your case.
- Plan your structure before writing.
"""
```

Python loads this at runtime with `tomllib.loads()` — no hardcoded prompts in code.

---

## CLI

```
# 설치
uv venv .venv && uv pip install -e .
source .venv/bin/activate

# 실행
codex-harnesses route "Redis vs Memcached 결정해줘" --json
codex-harnesses run "Review this PR for correctness and security"
codex-harnesses run "Redis vs Memcached 결정해줘"
codex-harnesses "PostgreSQL vs MongoDB?" --option-a PostgreSQL --option-b MongoDB
codex-harnesses "Should we use microservices?" -a yes -b no
codex-harnesses resume <run-id>

# 명시적 팀 실행
codex-harnesses run "Investigate auth flow" --team explore
codex-harnesses debate "PostgreSQL vs MongoDB?" --option-a PostgreSQL --option-b MongoDB
```

The console entrypoint rewrites legacy default debate calls to `debate ...` before
invoking Typer, preserving the original `codex-harnesses "..." --option-a ...`
UX while allowing multiple subcommands.

---

## `pyproject.toml`

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "codex-harnesses"
version = "0.1.1"
description = "Codex-native multi-agent orchestration with routing, teams, and saved runs"
requires-python = ">=3.11"
dependencies = [
    "typer>=0.12",
    "rich>=13",
]

[project.scripts]
codex-harnesses = "codex_harnesses.cli:main"

[tool.hatch.build.targets.wheel]
packages = ["src/codex_harnesses"]
```

No `openai-agents` dependency — pure stdlib + typer + rich.

---

## Run state

Every saved run writes:

```text
.harness/runs/<run-id>/
├── manifest.json
├── trace.jsonl
├── transcript.md
├── artifacts/
└── blackboard/
```

`resume <run-id>` reads the manifest and transcript from the current workdir.

---

## Current boundaries

The repository is split into three top-level product layers:

- `core/`: shared pattern specs and schemas.
- `claudecode/plugins/`: Claude Code teams, agents, skills, hooks, and harness docs.
- `codex/`: executable Python orchestration for Codex CLI.

Codex ships independent team implementations under
`codex/src/codex_harnesses/teams/` and reuses the shared pattern language from
`core/` rather than importing Claude Code prompt files directly. The Codex plugin
under `codex/plugin/harnesses/` is the automatic routing surface for the app.
