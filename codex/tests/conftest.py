import os
import pytest


@pytest.fixture
def fake_codex(tmp_path, monkeypatch):
    """Fake `codex` binary: writes 'FAKE_OUTPUT' to the -o file, exits 0."""
    script = tmp_path / "codex"
    script.write_text(
        "#!/usr/bin/env python3\n"
        "import sys\n"
        "args = sys.argv[1:]\n"
        "for i, a in enumerate(args):\n"
        "    if a == '-o' and i + 1 < len(args):\n"
        "        open(args[i + 1], 'w').write('FAKE_OUTPUT')\n"
        "        break\n"
    )
    script.chmod(0o755)
    monkeypatch.setenv("PATH", str(tmp_path) + ":" + os.environ["PATH"])


@pytest.fixture
def empty_codex(tmp_path, monkeypatch):
    """Fake `codex` binary that writes nothing (simulates no-output failure)."""
    script = tmp_path / "codex"
    script.write_text("#!/usr/bin/env python3\n")
    script.chmod(0o755)
    monkeypatch.setenv("PATH", str(tmp_path) + ":" + os.environ["PATH"])
