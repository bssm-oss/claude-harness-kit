import pytest
from unittest.mock import patch, AsyncMock

from codex_harnesses.runner import WorkerResult
from codex_harnesses.teams.debate import run_debate, DebateResult


def _worker(role: str) -> WorkerResult:
    return WorkerResult(role=role, output=f"output-from-{role}")


async def _mock_worker(role, prompt, developer_instructions, **kwargs):
    return _worker(role)


async def test_run_debate_returns_debate_result():
    with patch("codex_harnesses.teams.debate.run_worker", side_effect=_mock_worker):
        result = await run_debate("question", "option-a", "option-b")

    assert isinstance(result, DebateResult)
    assert result.question == "question"
    assert result.option_a == "option-a"
    assert result.option_b == "option-b"


async def test_run_debate_calls_all_four_agents():
    called = []

    async def tracking_worker(role, prompt, developer_instructions, **kwargs):
        called.append(role)
        return _worker(role)

    with patch("codex_harnesses.teams.debate.run_worker", side_effect=tracking_worker):
        await run_debate("q", "A", "B")

    assert called == ["advocate-a", "advocate-b", "devils-advocate", "judge"]


async def test_advocate_b_prompt_includes_advocate_a_output():
    """Advocate B must receive Advocate A's output so it can rebut."""
    captured = {}

    async def capturing_worker(role, prompt, developer_instructions, **kwargs):
        captured[role] = prompt
        return _worker(role)

    with patch("codex_harnesses.teams.debate.run_worker", side_effect=capturing_worker):
        await run_debate("the question", "A", "B")

    assert "output-from-advocate-a" in captured["advocate-b"]


async def test_devils_advocate_prompt_includes_both_outputs():
    captured = {}

    async def capturing_worker(role, prompt, developer_instructions, **kwargs):
        captured[role] = prompt
        return _worker(role)

    with patch("codex_harnesses.teams.debate.run_worker", side_effect=capturing_worker):
        await run_debate("q", "A", "B")

    da_prompt = captured["devils-advocate"]
    assert "output-from-advocate-a" in da_prompt
    assert "output-from-advocate-b" in da_prompt


async def test_judge_prompt_includes_all_three_outputs():
    captured = {}

    async def capturing_worker(role, prompt, developer_instructions, **kwargs):
        captured[role] = prompt
        return _worker(role)

    with patch("codex_harnesses.teams.debate.run_worker", side_effect=capturing_worker):
        await run_debate("q", "A", "B")

    judge_prompt = captured["judge"]
    assert "output-from-advocate-a" in judge_prompt
    assert "output-from-advocate-b" in judge_prompt
    assert "output-from-devils-advocate" in judge_prompt


async def test_run_debate_result_fields():
    with patch("codex_harnesses.teams.debate.run_worker", side_effect=_mock_worker):
        result = await run_debate("q", "A", "B")

    assert result.advocate_a.output == "output-from-advocate-a"
    assert result.advocate_b.output == "output-from-advocate-b"
    assert result.devils_advocate.output == "output-from-devils-advocate"
    assert result.judge.output == "output-from-judge"


async def test_load_instructions_returns_nonempty_string():
    from codex_harnesses.teams.debate import _load_instructions
    for name in ["advocate_a", "advocate_b", "devils_advocate", "judge"]:
        di = _load_instructions(name)
        assert isinstance(di, str)
        assert len(di) > 100, f"{name} developer_instructions too short"
        assert "# Role" in di
