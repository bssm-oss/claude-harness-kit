import json

from codex_harnesses.state import RunRecorder, load_run
from codex_harnesses.types import SectionResult, TeamRunResult


def test_run_recorder_writes_manifest_trace_and_transcript(tmp_path):
    recorder = RunRecorder("explore", "Investigate auth flow", workdir=str(tmp_path))
    recorder.start(route={"team": "explore"})
    result = TeamRunResult(
        team="explore",
        request="Investigate auth flow",
        sections=[SectionResult("Explore Scout", "explore-scout", "scout output")],
    )
    recorder.finish(result)

    manifest = json.loads((recorder.run_dir / "manifest.json").read_text())
    trace = (recorder.run_dir / "trace.jsonl").read_text()
    transcript = (recorder.run_dir / "transcript.md").read_text()

    assert manifest["status"] == "complete"
    assert manifest["paths"]["blackboard"] == "blackboard"
    assert "run_start" in trace
    assert "scout output" in transcript


def test_load_run_reads_saved_transcript(tmp_path):
    recorder = RunRecorder("review", "Review patch", workdir=str(tmp_path))
    recorder.start()
    recorder.finish(TeamRunResult("review", "Review patch", [SectionResult("Verdict", "judge", "ok")]))

    manifest, transcript = load_run(recorder.run_id, workdir=str(tmp_path))

    assert manifest["team"] == "review"
    assert "ok" in transcript
