import tomllib
from importlib.resources import files
from pathlib import Path


_PACKAGE_AGENTS_DIR = files("codex_harnesses").joinpath("agents")
_SOURCE_AGENTS_DIR = Path(__file__).resolve().parents[2] / "agents"


def load_instructions(team: str, name: str) -> str:
    path = _PACKAGE_AGENTS_DIR.joinpath(team, f"{name}.toml")
    if not path.is_file():
        path = _SOURCE_AGENTS_DIR / team / f"{name}.toml"
    data = tomllib.loads(path.read_text(encoding="utf-8"))
    return data["developer_instructions"]
