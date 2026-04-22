from unittest.mock import AsyncMock, patch

from typer.testing import CliRunner

from codex_harnesses.cli import app
from codex_harnesses.runner import WorkerResult
from codex_harnesses.teams.debate import DebateResult

runner = CliRunner()


def _fake_result(question="q", option_a="A", option_b="B") -> DebateResult:
    return DebateResult(
        question=question,
        option_a=option_a,
        option_b=option_b,
        advocate_a=WorkerResult("advocate-a", "Advocate A output"),
        advocate_b=WorkerResult("advocate-b", "Advocate B output"),
        devils_advocate=WorkerResult("devils-advocate", "DA output"),
        judge=WorkerResult("judge", "Judge verdict"),
    )


def test_debate_prints_all_sections():
    with patch("codex_harnesses.cli.run_debate", new_callable=AsyncMock, return_value=_fake_result()):
        result = runner.invoke(app, ["question", "--option-a", "A", "--option-b", "B"])

    assert result.exit_code == 0
    assert "Advocate A output" in result.output
    assert "Advocate B output" in result.output
    assert "DA output" in result.output
    assert "Judge verdict" in result.output


def test_debate_shows_option_names_in_headers():
    with patch("codex_harnesses.cli.run_debate", new_callable=AsyncMock, return_value=_fake_result(option_a="PostgreSQL", option_b="MongoDB")):
        result = runner.invoke(app, ["q", "--option-a", "PostgreSQL", "--option-b", "MongoDB"])

    assert result.exit_code == 0
    assert "PostgreSQL" in result.output
    assert "MongoDB" in result.output


def test_debate_requires_option_a():
    result = runner.invoke(app, ["question", "--option-b", "B"])
    assert result.exit_code != 0


def test_debate_requires_option_b():
    result = runner.invoke(app, ["question", "--option-a", "A"])
    assert result.exit_code != 0


def test_debate_requires_question():
    result = runner.invoke(app, ["--option-a", "A", "--option-b", "B"])
    assert result.exit_code != 0


def test_debate_short_flags():
    with patch("codex_harnesses.cli.run_debate", new_callable=AsyncMock, return_value=_fake_result()):
        result = runner.invoke(app, ["q", "-a", "A", "-b", "B"])
    assert result.exit_code == 0
