from codex_harnesses.orchestrator import run_team


async def test_run_team_routes_explore(fake_codex, tmp_path):
    result = await run_team(
        "Investigate this architecture issue",
        workdir=str(tmp_path),
    )

    assert result.team == "explore"
    assert [section.role for section in result.sections] == [
        "explore-scout",
        "explore-hypothesizer",
        "explore-evidence",
        "explore-synthesizer",
    ]
    assert result.run_id is not None
    assert (result.run_dir / "manifest.json").exists()


async def test_run_team_runs_review_fanout_then_tail(fake_codex, tmp_path):
    result = await run_team(
        "Review this PR for correctness and security",
        workdir=str(tmp_path),
    )

    assert result.team == "review"
    assert [section.role for section in result.sections] == [
        "review-correctness",
        "review-security",
        "review-performance",
        "review-moderator",
        "review-judge",
    ]


async def test_run_team_requires_debate_options(tmp_path):
    try:
        await run_team("결정해줘", team="debate", workdir=str(tmp_path))
    except ValueError as exc:
        assert "Debate requires two options" in str(exc)
    else:
        raise AssertionError("expected debate option validation to fail")
