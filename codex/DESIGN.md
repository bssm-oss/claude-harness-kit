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
| Flow control | Python asyncio | o3 dynamic planner | Fixed-flow teams (debate: A→B→DA→Judge) need no runtime planning |
| Parallelism | `asyncio.gather` for independent steps | threads | Native async; works with `asyncio.create_subprocess_exec` |
| Model | inherits `~/.codex/config.toml` default | hardcoded `gpt-4.1` | Respects user config; overridable per-call with `-m` |

o3 as planner is reserved for research-team where crawl strategy must adapt dynamically.

---

## Package layout

```
codex/                         # sibling to plugins/ in this repo
├── pyproject.toml             # pip install codex-harnesses
├── src/
│   └── codex_harnesses/
│       ├── __init__.py        # version only
│       ├── runner.py          # run_worker() — subprocess wrapper
│       ├── cli.py             # typer app: codex-harnesses run <team> "..."
│       └── teams/
│           ├── __init__.py
│           └── debate.py      # DebateOrchestrator
└── agents/
    └── debate/
        ├── advocate_a.toml    # developer_instructions content
        ├── advocate_b.toml
        ├── devils_advocate.toml
        └── judge.toml
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
`asyncio.gather` reserved for research-team's parallel crawlers.

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

# 실행 — typer 단일 커맨드 flattening: 'debate' 서브커맨드 이름 생략
codex-harnesses "PostgreSQL vs MongoDB?" --option-a PostgreSQL --option-b MongoDB
codex-harnesses "Should we use microservices?" -a yes -b no

# 팀 추가 시 서브커맨드로 자동 분리됨 (typer 동작 방식)
# codex-harnesses debate "..." --option-a A --option-b B
# codex-harnesses research "..."
```

---

## `pyproject.toml`

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "codex-harnesses"
version = "0.1.0"
description = "Multi-agent orchestration for Codex CLI"
requires-python = ">=3.11"
dependencies = [
    "typer>=0.12",
    "rich>=13",
]

[project.scripts]
codex-harnesses = "codex_harnesses.cli:app"

[tool.hatch.build.targets.wheel]
packages = ["src/codex_harnesses"]
```

No `openai-agents` dependency — pure stdlib + typer + rich.

---

## Open questions before implementation

1. **Agent TOML loading path**: load from `codex/agents/<team>/` relative to package install, or from `~/.codex/harnesses/<team>/`? The former is simpler for now.
2. **Output file**: save verdict as `debate-{slug}.md` in cwd, or print-only? Print-only first; add `--output` flag later.
3. **Future teams**: research-team needs `asyncio.gather` for parallel crawlers + a state file (Blackboard). That's the natural next step after debate-team works.
