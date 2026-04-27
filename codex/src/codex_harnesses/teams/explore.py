from .generic import Stage, prompt_with_context, run_linear_team
from ..state import RunRecorder
from ..types import TeamRunResult


STAGES = [
    Stage("scout", "Explore Scout", prompt_with_context, sandbox="read-only"),
    Stage("hypothesizer", "Explore Hypotheses", prompt_with_context, sandbox="read-only"),
    Stage("evidence", "Explore Evidence", prompt_with_context, sandbox="read-only"),
    Stage("synthesizer", "Explore Synthesis", prompt_with_context, sandbox="read-only"),
]


async def run_explore(
    request: str,
    workdir: str | None = None,
    model: str | None = None,
    recorder: RunRecorder | None = None,
) -> TeamRunResult:
    return await run_linear_team("explore", request, STAGES, workdir=workdir, model=model, recorder=recorder)
