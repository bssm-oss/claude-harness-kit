import asyncio
import tempfile
from dataclasses import dataclass
from pathlib import Path


@dataclass
class WorkerResult:
    role: str
    output: str


async def run_worker(
    role: str,
    prompt: str,
    developer_instructions: str,
    model: str | None = None,
    sandbox: str = "workspace-write",
    workdir: str | None = None,
) -> WorkerResult:
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
        out_path = Path(f.name)

    cmd = [
        "codex", "exec",
        "-c", f"developer_instructions={repr(developer_instructions)}",
        "-s", sandbox,
        "--ephemeral",
        "--color", "never",
        "-o", str(out_path),
        prompt,
    ]
    if model:
        cmd += ["-m", model]
    if workdir:
        cmd += ["-C", workdir]

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()

    output = out_path.read_text().strip()
    out_path.unlink(missing_ok=True)

    if not output:
        raise RuntimeError(
            f"[{role}] produced no output.\nstderr: {stderr.decode()[:500]}"
        )

    return WorkerResult(role=role, output=output)
