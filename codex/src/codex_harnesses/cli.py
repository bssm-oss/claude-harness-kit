import asyncio
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.rule import Rule

from .teams.debate import run_debate

app = typer.Typer(
    name="codex-harnesses",
    help="Multi-agent orchestration for Codex CLI.",
    add_completion=False,
    no_args_is_help=True,
)
console = Console()


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


@app.command("debate")
def debate_cmd(
    question: str = typer.Argument(..., help="The question or decision to debate"),
    option_a: str = typer.Option(..., "--option-a", "-a", help="Option A (primary position)"),
    option_b: str = typer.Option(..., "--option-b", "-b", help="Option B (alternative)"),
    workdir: Optional[str] = typer.Option(None, "--workdir", "-C", help="Working directory for Codex"),
) -> None:
    """Run the adversarial debate team: advocate-a → advocate-b → devil's advocate → judge."""
    result = asyncio.run(run_debate(question, option_a, option_b, workdir))
    _print_debate(result)


def main() -> None:
    app()
