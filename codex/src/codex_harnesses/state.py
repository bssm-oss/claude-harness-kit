import json
import re
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .types import SectionResult, TeamRunResult


def _slug(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9가-힣]+", "-", text.lower()).strip("-")
    return slug[:48] or "run"


class RunRecorder:
    def __init__(self, team: str, request: str, workdir: str | None = None):
        self.team = team
        self.request = request
        root = Path(workdir or ".").resolve()
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        self.run_id = f"{timestamp}-{team}-{_slug(request)}"
        self.run_dir = root / ".harness" / "runs" / self.run_id
        self.artifacts_dir = self.run_dir / "artifacts"
        self.blackboard_dir = self.run_dir / "blackboard"
        self.trace_path = self.run_dir / "trace.jsonl"
        self.manifest_path = self.run_dir / "manifest.json"
        self.transcript_path = self.run_dir / "transcript.md"

    def start(self, route: dict[str, Any] | None = None) -> None:
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        self.blackboard_dir.mkdir(parents=True, exist_ok=True)
        self._write_manifest("running", route=route, sections=[])
        self.record("run_start", {"team": self.team, "request": self.request})

    def record_step(self, role: str, title: str, output: str) -> None:
        self.record("agent_complete", {"role": role, "title": title, "output_chars": len(output)})

    def finish(self, result: TeamRunResult) -> None:
        self.record("run_complete", {"team": result.team, "sections": len(result.sections)})
        self._write_manifest("complete", sections=[asdict(section) for section in result.sections])
        self.transcript_path.write_text(render_transcript(result), encoding="utf-8")

    def fail(self, error: Exception) -> None:
        self.record("run_failed", {"error": str(error)})
        self._write_manifest("failed", error=str(error), sections=[])

    def record(self, event: str, data: dict[str, Any]) -> None:
        payload = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "event": event,
            "team": self.team,
            "run_id": self.run_id,
            **data,
        }
        with self.trace_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")

    def _write_manifest(self, status: str, **extra: Any) -> None:
        payload = {
            "schema_version": 1,
            "run_id": self.run_id,
            "team": self.team,
            "request": self.request,
            "status": status,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "paths": {
                "trace": "trace.jsonl",
                "transcript": "transcript.md",
                "artifacts": "artifacts",
                "blackboard": "blackboard",
            },
            **extra,
        }
        self.manifest_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def render_transcript(result: TeamRunResult) -> str:
    lines = [
        f"# {result.team.title()} Harness Run",
        "",
        f"Request: {result.request}",
        "",
    ]
    for section in result.sections:
        lines.extend([
            f"## {section.title}",
            "",
            section.output,
            "",
        ])
    return "\n".join(lines).rstrip() + "\n"


def load_run(run_id: str, workdir: str | None = None) -> tuple[dict[str, Any], str]:
    root = Path(workdir or ".").resolve()
    run_dir = root / ".harness" / "runs" / run_id
    manifest_path = run_dir / "manifest.json"
    transcript_path = run_dir / "transcript.md"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    transcript = transcript_path.read_text(encoding="utf-8") if transcript_path.exists() else ""
    return manifest, transcript
