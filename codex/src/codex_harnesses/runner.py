import asyncio
import tempfile
from dataclasses import dataclass
from pathlib import Path


@dataclass
class WorkerResult:
    role: str
    output: str


@dataclass
class CodexInvocationResult:
    output: str
    stdout: str
    stderr: str
    returncode: int


async def run_worker(
    role: str,
    prompt: str,
    developer_instructions: str,
    model: str | None = None,
    fallback_model: str | None = "gpt-5.2",
    sandbox: str = "workspace-write",
    workdir: str | None = None,
    disable_plugins: bool = True,
) -> WorkerResult:
    result = await _run_codex_worker(
        role,
        prompt,
        developer_instructions,
        model=model,
        sandbox=sandbox,
        workdir=workdir,
        disable_plugins=disable_plugins,
    )
    if (
        not result.output
        and model is None
        and fallback_model
        and "requires a newer version of Codex" in result.stderr
    ):
        result = await _run_codex_worker(
            role,
            prompt,
            developer_instructions,
            model=fallback_model,
            sandbox=sandbox,
            workdir=workdir,
            disable_plugins=disable_plugins,
        )

    if not result.output:
        raise RuntimeError(_format_no_output_error(role, result))

    return WorkerResult(role=role, output=result.output)


async def _run_codex_worker(
    role: str,
    prompt: str,
    developer_instructions: str,
    model: str | None,
    sandbox: str,
    workdir: str | None,
    disable_plugins: bool,
) -> CodexInvocationResult:
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
        out_path = Path(f.name)

    cmd = ["codex", "exec"]
    if disable_plugins:
        cmd += ["--disable", "plugins"]
    cmd += [
        "-c", f"developer_instructions={repr(developer_instructions)}",
        "-s", sandbox,
        "--ephemeral",
        "--color", "never",
        "-o", str(out_path),
    ]
    if model:
        cmd += ["-m", model]
    if workdir:
        cmd += ["-C", workdir]
    cmd.append(prompt)

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        output = out_path.read_text().strip() if out_path.exists() else ""
        return CodexInvocationResult(
            output=output,
            stdout=stdout.decode(errors="replace"),
            stderr=stderr.decode(errors="replace"),
            returncode=proc.returncode,
        )
    finally:
        out_path.unlink(missing_ok=True)


def _clip(text: str, limit: int = 4000) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    head = limit // 2
    tail = limit - head
    return f"{text[:head]}\n... <truncated> ...\n{text[-tail:]}"


def _format_no_output_error(role: str, result: CodexInvocationResult) -> str:
    parts = [
        f"[{role}] produced no output.",
        f"returncode: {result.returncode}",
    ]
    if result.stderr.strip():
        parts.append(f"stderr:\n{_clip(result.stderr)}")
    if result.stdout.strip():
        parts.append(f"stdout:\n{_clip(result.stdout, limit=1200)}")
    return "\n".join(parts)
