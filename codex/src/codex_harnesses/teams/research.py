from .generic import Stage, prompt_with_context, run_linear_team
from ..state import RunRecorder
from ..types import TeamRunResult


STAGES = [
    Stage("planner", "Research Plan", prompt_with_context, sandbox="read-only"),
    Stage("crawler", "Research Source Collection", prompt_with_context, sandbox="read-only"),
    Stage("reader", "Research Extraction", prompt_with_context, sandbox="read-only"),
    Stage("synthesizer", "Research Synthesis", prompt_with_context, sandbox="read-only"),
]


async def run_research(
    request: str,
    workdir: str | None = None,
    model: str | None = None,
    recorder: RunRecorder | None = None,
) -> TeamRunResult:
    return await run_linear_team("research", request, STAGES, workdir=workdir, model=model, recorder=recorder)
