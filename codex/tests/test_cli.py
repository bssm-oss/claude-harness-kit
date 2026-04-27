from unittest.mock import AsyncMock, patch
import sys

from typer.testing import CliRunner

import codex_harnesses.cli as cli
from codex_harnesses.types import SectionResult, TeamRunResult

runner = CliRunner()


def _fake_result(team="debate", request="q") -> TeamRunResult:
    return TeamRunResult(
        team=team,
        request=request,
        run_id="run-1",
        sections=[
            SectionResult("Advocate A - A", "advocate-a", "Advocate A output"),
            SectionResult("Advocate B - B", "advocate-b", "Advocate B output"),
            SectionResult("Devil's Advocate", "devils-advocate", "DA output"),
            SectionResult("Judge's Verdict", "judge", "Judge verdict"),
        ],
    )


def test_debate_prints_all_sections():
    with patch("codex_harnesses.cli.run_team", new_callable=AsyncMock, return_value=_fake_result()):
        result = runner.invoke(cli.app, ["debate", "question", "--option-a", "A", "--option-b", "B"])

    assert result.exit_code == 0
    assert "Advocate A output" in result.output
    assert "Advocate B output" in result.output
    assert "DA output" in result.output
    assert "Judge verdict" in result.output


def test_debate_shows_option_names_in_headers():
    result_data = TeamRunResult(
        team="debate",
        request="q",
        sections=[
            SectionResult("Advocate A - PostgreSQL", "advocate-a", "A"),
            SectionResult("Advocate B - MongoDB", "advocate-b", "B"),
        ],
    )
    with patch("codex_harnesses.cli.run_team", new_callable=AsyncMock, return_value=result_data):
        result = runner.invoke(cli.app, ["debate", "q", "--option-a", "PostgreSQL", "--option-b", "MongoDB"])

    assert result.exit_code == 0
    assert "PostgreSQL" in result.output
    assert "MongoDB" in result.output


def test_debate_requires_option_a():
    result = runner.invoke(cli.app, ["debate", "question", "--option-b", "B"])
    assert result.exit_code != 0


def test_debate_requires_option_b():
    result = runner.invoke(cli.app, ["debate", "question", "--option-a", "A"])
    assert result.exit_code != 0


def test_debate_requires_question():
    result = runner.invoke(cli.app, ["debate", "--option-a", "A", "--option-b", "B"])
    assert result.exit_code != 0


def test_debate_short_flags():
    with patch("codex_harnesses.cli.run_team", new_callable=AsyncMock, return_value=_fake_result()):
        result = runner.invoke(cli.app, ["debate", "q", "-a", "A", "-b", "B"])
    assert result.exit_code == 0


def test_route_json_classifies_debate():
    result = runner.invoke(cli.app, ["route", "Redis vs Memcached 결정해줘", "--json"])
    assert result.exit_code == 0
    assert '"team": "debate"' in result.output
    assert '"option_a": "Redis"' in result.output
    assert '"option_b": "Memcached"' in result.output


def test_run_requires_confirmation_for_missing_debate_options():
    result = runner.invoke(cli.app, ["run", "결정해줘"])
    assert result.exit_code == 2
    assert "Route needs confirmation" in result.output


def test_main_rewrites_legacy_default_debate_args(monkeypatch):
    calls = {}

    def fake_app(args):
        calls["args"] = args

    monkeypatch.setattr(sys, "argv", ["codex-harnesses", "q", "--option-a", "A", "--option-b", "B"])
    monkeypatch.setattr(cli, "app", fake_app)

    cli.main()

    assert calls["args"] == ["debate", "q", "--option-a", "A", "--option-b", "B"]
