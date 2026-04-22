import pytest
from codex_harnesses.runner import run_worker, WorkerResult


async def test_run_worker_returns_output(fake_codex):
    result = await run_worker(
        role="test-role",
        prompt="hello",
        developer_instructions="be concise",
    )
    assert isinstance(result, WorkerResult)
    assert result.role == "test-role"
    assert result.output == "FAKE_OUTPUT"


async def test_run_worker_passes_developer_instructions(tmp_path, monkeypatch):
    """developer_instructions must appear in the codex exec command."""
    import os
    captured = tmp_path / "captured_args.txt"
    script = tmp_path / "codex"
    script.write_text(
        "#!/usr/bin/env python3\n"
        "import sys\n"
        f"open('{captured}', 'w').write('\\n'.join(sys.argv))\n"
        "args = sys.argv[1:]\n"
        "for i, a in enumerate(args):\n"
        "    if a == '-o' and i + 1 < len(args):\n"
        "        open(args[i + 1], 'w').write('ok')\n"
        "        break\n"
    )
    script.chmod(0o755)
    monkeypatch.setenv("PATH", str(tmp_path) + ":" + os.environ["PATH"])

    await run_worker("role", "prompt", "MY_SPECIAL_INSTRUCTION")

    args_text = captured.read_text()
    assert "MY_SPECIAL_INSTRUCTION" in args_text


async def test_run_worker_raises_on_empty_output(empty_codex):
    with pytest.raises(RuntimeError, match="no output"):
        await run_worker("role", "prompt", "instructions")


async def test_run_worker_uses_sandbox_flag(tmp_path, monkeypatch):
    import os
    captured = tmp_path / "captured_args.txt"
    script = tmp_path / "codex"
    script.write_text(
        "#!/usr/bin/env python3\n"
        "import sys\n"
        f"open('{captured}', 'w').write('\\n'.join(sys.argv))\n"
        "args = sys.argv[1:]\n"
        "for i, a in enumerate(args):\n"
        "    if a == '-o' and i + 1 < len(args):\n"
        "        open(args[i + 1], 'w').write('ok')\n"
        "        break\n"
    )
    script.chmod(0o755)
    monkeypatch.setenv("PATH", str(tmp_path) + ":" + os.environ["PATH"])

    await run_worker("role", "prompt", "instr", sandbox="read-only")

    assert "read-only" in captured.read_text()


async def test_run_worker_passes_model_flag(tmp_path, monkeypatch):
    import os
    captured = tmp_path / "captured_args.txt"
    script = tmp_path / "codex"
    script.write_text(
        "#!/usr/bin/env python3\n"
        "import sys\n"
        f"open('{captured}', 'w').write('\\n'.join(sys.argv))\n"
        "args = sys.argv[1:]\n"
        "for i, a in enumerate(args):\n"
        "    if a == '-o' and i + 1 < len(args):\n"
        "        open(args[i + 1], 'w').write('ok')\n"
        "        break\n"
    )
    script.chmod(0o755)
    monkeypatch.setenv("PATH", str(tmp_path) + ":" + os.environ["PATH"])

    await run_worker("role", "prompt", "instr", model="gpt-4.1")

    args = captured.read_text().splitlines()
    assert "-m" in args
    assert "gpt-4.1" in args
