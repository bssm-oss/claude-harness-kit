import tomllib
from dataclasses import dataclass
from pathlib import Path

from ..runner import run_worker, WorkerResult

_AGENTS_DIR = Path(__file__).parent.parent.parent.parent / "agents" / "debate"


def _load_instructions(name: str) -> str:
    path = _AGENTS_DIR / f"{name}.toml"
    data = tomllib.loads(path.read_text())
    return data["developer_instructions"]


@dataclass
class DebateResult:
    question: str
    option_a: str
    option_b: str
    advocate_a: WorkerResult
    advocate_b: WorkerResult
    devils_advocate: WorkerResult
    judge: WorkerResult


async def run_debate(
    question: str,
    option_a: str,
    option_b: str,
    workdir: str | None = None,
) -> DebateResult:
    di_a = _load_instructions("advocate_a")
    di_b = _load_instructions("advocate_b")
    di_da = _load_instructions("devils_advocate")
    di_judge = _load_instructions("judge")

    # Step 1 — Advocate A argues for Option A
    result_a = await run_worker(
        role="advocate-a",
        prompt=(
            f"Debate question: {question}\n"
            f"You are arguing FOR: {option_a}"
        ),
        developer_instructions=di_a,
        workdir=workdir,
    )

    # Step 2 — Advocate B reads A's argument, argues for Option B and rebuts A
    result_b = await run_worker(
        role="advocate-b",
        prompt=(
            f"Debate question: {question}\n"
            f"You are arguing FOR: {option_b}\n\n"
            f"Advocate A argued:\n{result_a.output}"
        ),
        developer_instructions=di_b,
        workdir=workdir,
    )

    # Step 3 — Devil's Advocate challenges both sides
    result_da = await run_worker(
        role="devils-advocate",
        prompt=(
            f"Debate question: {question}\n\n"
            f"Advocate A ({option_a}):\n{result_a.output}\n\n"
            f"Advocate B ({option_b}):\n{result_b.output}"
        ),
        developer_instructions=di_da,
        workdir=workdir,
    )

    # Step 4 — Judge issues verdict
    result_judge = await run_worker(
        role="judge",
        prompt=(
            f"Debate question: {question}\n"
            f"Option A: {option_a} | Option B: {option_b}\n\n"
            f"Advocate A:\n{result_a.output}\n\n"
            f"Advocate B:\n{result_b.output}\n\n"
            f"Devil's Advocate:\n{result_da.output}"
        ),
        developer_instructions=di_judge,
        workdir=workdir,
    )

    return DebateResult(
        question=question,
        option_a=option_a,
        option_b=option_b,
        advocate_a=result_a,
        advocate_b=result_b,
        devils_advocate=result_da,
        judge=result_judge,
    )
