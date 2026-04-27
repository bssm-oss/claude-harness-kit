import asyncio
from dataclasses import dataclass
from typing import Callable

from ..instructions import load_instructions
from ..runner import run_worker
from ..state import RunRecorder
from ..types import SectionResult, TeamRunResult


@dataclass(frozen=True)
class Stage:
    name: str
    title: str
    prompt: Callable[[str, list[SectionResult]], str]
    sandbox: str = "workspace-write"


def _context(sections: list[SectionResult]) -> str:
    if not sections:
        return ""
    return "\n\n".join(f"{section.title}:\n{section.output}" for section in sections)


def prompt_with_context(request: str, sections: list[SectionResult]) -> str:
    context = _context(sections)
    if not context:
        return f"User request:\n{request}"
    return f"User request:\n{request}\n\nPrevious harness output:\n{context}"


async def run_linear_team(
    team: str,
    request: str,
    stages: list[Stage],
    workdir: str | None = None,
    model: str | None = None,
    recorder: RunRecorder | None = None,
) -> TeamRunResult:
    sections: list[SectionResult] = []
    for stage in stages:
        result = await run_worker(
            role=f"{team}-{stage.name}",
            prompt=stage.prompt(request, sections),
            developer_instructions=load_instructions(team, stage.name),
            model=model,
            sandbox=stage.sandbox,
            workdir=workdir,
        )
        section = SectionResult.from_worker(stage.title, result)
        sections.append(section)
        if recorder:
            recorder.record_step(result.role, stage.title, result.output)

    return TeamRunResult(team=team, request=request, sections=sections)


async def run_fanout_then_linear_team(
    team: str,
    request: str,
    fanout: list[Stage],
    tail: list[Stage],
    workdir: str | None = None,
    model: str | None = None,
    recorder: RunRecorder | None = None,
) -> TeamRunResult:
    async def run_stage(stage: Stage) -> SectionResult:
        result = await run_worker(
            role=f"{team}-{stage.name}",
            prompt=stage.prompt(request, []),
            developer_instructions=load_instructions(team, stage.name),
            model=model,
            sandbox=stage.sandbox,
            workdir=workdir,
        )
        if recorder:
            recorder.record_step(result.role, stage.title, result.output)
        return SectionResult.from_worker(stage.title, result)

    sections = list(await asyncio.gather(*(run_stage(stage) for stage in fanout)))

    for stage in tail:
        result = await run_worker(
            role=f"{team}-{stage.name}",
            prompt=stage.prompt(request, sections),
            developer_instructions=load_instructions(team, stage.name),
            model=model,
            sandbox=stage.sandbox,
            workdir=workdir,
        )
        section = SectionResult.from_worker(stage.title, result)
        sections.append(section)
        if recorder:
            recorder.record_step(result.role, stage.title, result.output)

    return TeamRunResult(team=team, request=request, sections=sections)
