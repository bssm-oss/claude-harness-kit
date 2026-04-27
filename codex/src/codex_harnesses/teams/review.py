from .generic import Stage, prompt_with_context, run_fanout_then_linear_team
from ..state import RunRecorder
from ..types import TeamRunResult


FANOUT = [
    Stage("correctness", "Correctness Review", prompt_with_context, sandbox="read-only"),
    Stage("security", "Security Review", prompt_with_context, sandbox="read-only"),
    Stage("performance", "Performance Review", prompt_with_context, sandbox="read-only"),
]

TAIL = [
    Stage("moderator", "Review Moderator", prompt_with_context, sandbox="read-only"),
    Stage("judge", "Review Verdict", prompt_with_context, sandbox="read-only"),
]


async def run_review(
    request: str,
    workdir: str | None = None,
    model: str | None = None,
    recorder: RunRecorder | None = None,
) -> TeamRunResult:
    return await run_fanout_then_linear_team(
        "review",
        request,
        FANOUT,
        TAIL,
        workdir=workdir,
        model=model,
        recorder=recorder,
    )
