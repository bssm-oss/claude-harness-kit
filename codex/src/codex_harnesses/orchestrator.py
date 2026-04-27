from .routing import RouteResult, classify_request
from .state import RunRecorder
from .teams.debate import run_debate_as_team
from .teams.explore import run_explore
from .teams.research import run_research
from .teams.review import run_review
from .types import TeamRunResult


TEAM_RUNNERS = {
    "debate": run_debate_as_team,
    "explore": run_explore,
    "review": run_review,
    "research": run_research,
}


async def run_team(
    request: str,
    team: str | None = None,
    option_a: str | None = None,
    option_b: str | None = None,
    workdir: str | None = None,
    model: str | None = None,
    save: bool = True,
) -> TeamRunResult:
    route = classify_request(request)
    selected_team = team or route.team
    if selected_team not in TEAM_RUNNERS:
        raise ValueError(f"Cannot route request to a known harness team: {route.reason}")

    if selected_team == "debate":
        option_a = option_a or route.option_a
        option_b = option_b or route.option_b
        if not option_a or not option_b:
            raise ValueError("Debate requires two options. Pass --option-a and --option-b.")

    recorder = RunRecorder(selected_team, request, workdir=workdir) if save else None
    if recorder:
        recorder.start(route=route.__dict__)

    try:
        if selected_team == "debate":
            result = await run_debate_as_team(
                request,
                option_a=option_a,
                option_b=option_b,
                workdir=workdir,
                model=model,
                recorder=recorder,
            )
        else:
            result = await TEAM_RUNNERS[selected_team](request, workdir=workdir, model=model, recorder=recorder)
    except Exception as exc:
        if recorder:
            recorder.fail(exc)
        raise

    if recorder:
        result.run_id = recorder.run_id
        result.run_dir = recorder.run_dir
        recorder.finish(result)

    return result
