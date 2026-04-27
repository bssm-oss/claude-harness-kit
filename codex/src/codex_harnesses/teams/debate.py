from dataclasses import dataclass

from ..instructions import load_instructions
from ..runner import run_worker, WorkerResult
from ..state import RunRecorder
from ..types import SectionResult, TeamRunResult


def _load_instructions(name: str) -> str:
    return load_instructions("debate", name)


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
    model: str | None = None,
    recorder: RunRecorder | None = None,
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
        model=model,
        workdir=workdir,
    )
    if recorder:
        recorder.record_step(result_a.role, f"Advocate A - {option_a}", result_a.output)

    # Step 2 — Advocate B reads A's argument, argues for Option B and rebuts A
    result_b = await run_worker(
        role="advocate-b",
        prompt=(
            f"Debate question: {question}\n"
            f"You are arguing FOR: {option_b}\n\n"
            f"Advocate A argued:\n{result_a.output}"
        ),
        developer_instructions=di_b,
        model=model,
        workdir=workdir,
    )
    if recorder:
        recorder.record_step(result_b.role, f"Advocate B - {option_b}", result_b.output)

    # Step 3 — Devil's Advocate challenges both sides
    result_da = await run_worker(
        role="devils-advocate",
        prompt=(
            f"Debate question: {question}\n\n"
            f"Advocate A ({option_a}):\n{result_a.output}\n\n"
            f"Advocate B ({option_b}):\n{result_b.output}"
        ),
        developer_instructions=di_da,
        model=model,
        workdir=workdir,
    )
    if recorder:
        recorder.record_step(result_da.role, "Devil's Advocate", result_da.output)

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
        model=model,
        workdir=workdir,
    )
    if recorder:
        recorder.record_step(result_judge.role, "Judge's Verdict", result_judge.output)

    return DebateResult(
        question=question,
        option_a=option_a,
        option_b=option_b,
        advocate_a=result_a,
        advocate_b=result_b,
        devils_advocate=result_da,
        judge=result_judge,
    )


async def run_debate_as_team(
    request: str,
    option_a: str,
    option_b: str,
    workdir: str | None = None,
    model: str | None = None,
    recorder: RunRecorder | None = None,
) -> TeamRunResult:
    result = await run_debate(
        request,
        option_a,
        option_b,
        workdir=workdir,
        model=model,
        recorder=recorder,
    )
    return TeamRunResult(
        team="debate",
        request=request,
        sections=[
            SectionResult.from_worker(f"Advocate A - {option_a}", result.advocate_a),
            SectionResult.from_worker(f"Advocate B - {option_b}", result.advocate_b),
            SectionResult.from_worker("Devil's Advocate", result.devils_advocate),
            SectionResult.from_worker("Judge's Verdict", result.judge),
        ],
    )
