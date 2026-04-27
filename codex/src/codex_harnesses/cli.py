import asyncio
import json
import sys
from dataclasses import asdict
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.rule import Rule

from .orchestrator import run_team
from .routing import classify_request, route_to_dict
from .state import load_run
from .teams.debate import run_debate

app = typer.Typer(
    name="codex-harnesses",
    help="Multi-agent orchestration for Codex CLI.",
    add_completion=False,
    no_args_is_help=True,
)
console = Console()
KNOWN_COMMANDS = {"debate", "route", "run", "resume"}


def _print_debate(result) -> None:
    console.print(Rule(f"[bold]Debate: {result.question}[/bold]"))
    console.print(Panel(
        result.advocate_a.output,
        title=f"[cyan]Advocate A — {result.option_a}[/cyan]",
        border_style="cyan",
    ))
    console.print(Panel(
        result.advocate_b.output,
        title=f"[magenta]Advocate B — {result.option_b}[/magenta]",
        border_style="magenta",
    ))
    console.print(Panel(
        result.devils_advocate.output,
        title="[yellow]Devil's Advocate[/yellow]",
        border_style="yellow",
    ))
    console.print(Panel(
        result.judge.output,
        title="[bold green]Judge's Verdict[/bold green]",
        border_style="green",
    ))
    if getattr(result, "run_id", None):
        console.print(f"\nRun saved: {result.run_id}")


def _print_team_result(result) -> None:
    console.print(Rule(f"[bold]{result.team.title()}: {result.request}[/bold]"))
    for section in result.sections:
        console.print(Panel(section.output, title=f"[bold]{section.title}[/bold]"))
    if result.run_id:
        console.print(f"\nRun saved: {result.run_id}")


def _team_result_to_dict(result) -> dict:
    return {
        "team": result.team,
        "request": result.request,
        "run_id": result.run_id,
        "run_dir": str(result.run_dir) if result.run_dir else None,
        "sections": [asdict(section) for section in result.sections],
    }


@app.command("debate")
def debate_cmd(
    question: str = typer.Argument(..., help="The question or decision to debate"),
    option_a: str = typer.Option(..., "--option-a", "-a", help="Option A (primary position)"),
    option_b: str = typer.Option(..., "--option-b", "-b", help="Option B (alternative)"),
    workdir: Optional[str] = typer.Option(None, "--workdir", "-C", help="Working directory for Codex"),
    model: Optional[str] = typer.Option(None, "--model", "-m", help="Model to pass to Codex workers"),
    save: bool = typer.Option(True, "--save/--no-save", help="Save run state under .harness/runs/"),
) -> None:
    """Run the adversarial debate team: advocate-a → advocate-b → devil's advocate → judge."""
    result = asyncio.run(
        run_team(
            question,
            team="debate",
            option_a=option_a,
            option_b=option_b,
            workdir=workdir,
            model=model,
            save=save,
        )
    )
    _print_team_result(result)


@app.command("route")
def route_cmd(
    request: str = typer.Argument(..., help="User request to classify"),
    json_output: bool = typer.Option(False, "--json", help="Print machine-readable JSON"),
) -> None:
    """Classify a user request into a harness team."""
    route = classify_request(request)
    if json_output:
        console.print(json.dumps(route_to_dict(route), ensure_ascii=False))
        return

    console.print(f"team: {route.team}")
    console.print(f"confidence: {route.confidence:.2f}")
    console.print(f"requires_confirmation: {route.requires_confirmation}")
    console.print(f"reason: {route.reason}")
    if route.option_a and route.option_b:
        console.print(f"options: {route.option_a} vs {route.option_b}")
    if route.chain:
        console.print(f"chain: {' -> '.join(route.chain)}")


@app.command("run")
def run_cmd(
    request: str = typer.Argument(..., help="User request to route and run"),
    team: Optional[str] = typer.Option(None, "--team", "-t", help="Force a team: debate, explore, review, research"),
    option_a: Optional[str] = typer.Option(None, "--option-a", "-a", help="Option A for debate"),
    option_b: Optional[str] = typer.Option(None, "--option-b", "-b", help="Option B for debate"),
    workdir: Optional[str] = typer.Option(None, "--workdir", "-C", help="Working directory for Codex"),
    model: Optional[str] = typer.Option(None, "--model", "-m", help="Model to pass to Codex workers"),
    json_output: bool = typer.Option(False, "--json", help="Print machine-readable JSON"),
    save: bool = typer.Option(True, "--save/--no-save", help="Save run state under .harness/runs/"),
) -> None:
    """Route a natural-language request to the right harness team and run it."""
    route = classify_request(request)
    if team is None and route.requires_confirmation:
        console.print(
            f"Route needs confirmation: {route.reason}. "
            "Pass --team and any required options to run explicitly."
        )
        raise typer.Exit(2)

    result = asyncio.run(
        run_team(
            request,
            team=team,
            option_a=option_a,
            option_b=option_b,
            workdir=workdir,
            model=model,
            save=save,
        )
    )
    if json_output:
        console.print(json.dumps(_team_result_to_dict(result), ensure_ascii=False))
        return
    _print_team_result(result)


@app.command("resume")
def resume_cmd(
    run_id: str = typer.Argument(..., help="Run id under .harness/runs/"),
    workdir: Optional[str] = typer.Option(None, "--workdir", "-C", help="Working directory containing .harness/runs/"),
) -> None:
    """Show a previous harness run transcript."""
    manifest, transcript = load_run(run_id, workdir=workdir)
    console.print(Rule(f"[bold]Resume: {manifest['run_id']}[/bold]"))
    console.print(f"team: {manifest['team']}")
    console.print(f"status: {manifest['status']}")
    console.print(f"request: {manifest['request']}\n")
    console.print(transcript or "(no transcript saved)")


def main() -> None:
    args = sys.argv[1:]
    if args and args[0] not in KNOWN_COMMANDS and not args[0].startswith("-"):
        args = ["debate", *args]
    app(args=args)
