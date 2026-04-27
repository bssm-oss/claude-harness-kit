from dataclasses import dataclass, field
from pathlib import Path

from .runner import WorkerResult


@dataclass
class RouteResult:
    request: str
    team: str
    confidence: float
    reason: str
    requires_confirmation: bool = False
    option_a: str | None = None
    option_b: str | None = None
    chain: list[str] = field(default_factory=list)


@dataclass
class SectionResult:
    title: str
    role: str
    output: str

    @classmethod
    def from_worker(cls, title: str, result: WorkerResult) -> "SectionResult":
        return cls(title=title, role=result.role, output=result.output)


@dataclass
class TeamRunResult:
    team: str
    request: str
    sections: list[SectionResult]
    run_id: str | None = None
    run_dir: Path | None = None
