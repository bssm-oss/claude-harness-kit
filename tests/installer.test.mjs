import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';

const repoRoot = resolve(join(fileURLToPath(import.meta.url), '..', '..'));
const nodeBin = process.execPath;

function makeHome() {
  return mkdtempSync(join(tmpdir(), 'harnesses-home-'));
}

function runCli(script, args = [], home = makeHome(), extraEnv = {}) {
  const result = spawnSync(nodeBin, [script, ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      HOME: home,
      USERPROFILE: home,
      ...extraEnv,
    },
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    home,
  };
}

function writeClaudeFile(home, relativePath, contents = 'existing\n') {
  const dest = join(home, '.claude', relativePath);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, contents);
}

function writeExecutable(path, contents) {
  writeFileSync(path, contents, { mode: 0o755 });
}

test('install dry-run includes commands/* for skills', () => {
  const { status, stdout, stderr } = runCli('bin/install.mjs', ['--dry-run']);

  assert.equal(status, 0);
  assert.equal(stderr, '');
  assert.match(stdout, /\[copy\] commands\/be-api\.md/);
});

test('install --uninstall --dry-run includes commands/* removals', () => {
  const home = makeHome();
  writeClaudeFile(home, 'commands/be-api.md');

  const { status, stdout, stderr } = runCli('bin/install.mjs', ['--uninstall', '--dry-run', 'be-team'], home);

  assert.equal(status, 0);
  assert.equal(stderr, '');
  assert.match(stdout, /remove: commands\/be-api\.md/);
});

test('install --uninstall removes hooks installed with opt-in hooks', () => {
  const home = makeHome();

  const install = runCli('bin/install.mjs', ['ops-team', '--install-hooks'], home);
  assert.equal(install.status, 0);
  assert.equal(install.stderr, '');
  assert.match(install.stdout, /copy: hooks\/ci-push-check\.sh/);

  const uninstall = runCli('bin/install.mjs', ['--uninstall', 'ops-team'], home);

  assert.equal(uninstall.status, 0);
  assert.equal(uninstall.stderr, '');
  assert.match(uninstall.stdout, /remove: hooks\/ci-push-check\.sh/);
});

test('codex dry-run previews tool, prompt, plugin, and marketplace install', () => {
  const home = makeHome();
  const { status, stdout, stderr } = runCli('bin/install.mjs', ['--codex', '--dry-run'], home);

  assert.equal(status, 0);
  assert.equal(stderr, '');
  assert.match(stdout, /\[run\].*codex/);
  assert.match(stdout, /\[copy\] ~\/\.codex\/prompts\/debate\.md/);
  assert.match(stdout, /\[copy\] ~\/plugins\/harnesses\/skills\/harnesses-debate\/SKILL\.md/);
  assert.match(stdout, /\[write\] ~\/\.agents\/plugins\/marketplace\.json/);
  assert.match(stdout, /\[write\] ~\/\.codex\/config\.toml plugin enable: harnesses@harnesses/);
  assert.equal(existsSync(join(home, '.codex')), false);
});

test('codex install copies plugin and marketplace with fake tools', () => {
  const home = makeHome();
  const binDir = join(home, 'bin');
  const capturedCodexArgs = join(home, 'codex-args.txt');
  mkdirSync(binDir, { recursive: true });
  writeExecutable(join(binDir, 'uv'), '#!/bin/sh\nexit 0\n');
  writeExecutable(join(binDir, 'codex'), `#!/bin/sh\nprintf '%s\\n' "$@" > "${capturedCodexArgs}"\nexit 0\n`);

  const { status, stdout, stderr } = runCli(
    'bin/install.mjs',
    ['--codex'],
    home,
    { PATH: `${binDir}:${process.env.PATH}` },
  );

  assert.equal(status, 0);
  assert.equal(stderr, '');
  assert.match(stdout, /plugin: ~\/plugins\/harnesses/);
  assert.equal(existsSync(join(home, 'plugins', 'harnesses', 'skills', 'harnesses-router', 'SKILL.md')), true);

  const marketplace = JSON.parse(readFileSync(join(home, '.agents', 'plugins', 'marketplace.json'), 'utf8'));
  assert.equal(marketplace.plugins[0].name, 'harnesses');
  assert.equal(marketplace.plugins[0].policy.installation, 'INSTALLED_BY_DEFAULT');
  const codexConfig = readFileSync(join(home, '.codex', 'config.toml'), 'utf8');
  assert.match(codexConfig, /\[plugins\."harnesses@harnesses"\]/);
  assert.match(codexConfig, /enabled = true/);
  assert.equal(readFileSync(capturedCodexArgs, 'utf8').trim(), `plugin\nmarketplace\nadd\n${home}`);
});

test('codex uninstall dry-run previews cleanup', () => {
  const home = makeHome();
  const { status, stdout, stderr } = runCli('bin/install.mjs', ['--codex', '--uninstall', '--dry-run'], home);

  assert.equal(status, 0);
  assert.equal(stderr, '');
  assert.match(stdout, /\[remove\] ~\/\.codex\/prompts\/debate\.md/);
  assert.match(stdout, /\[remove\] ~\/plugins\/harnesses/);
  assert.match(stdout, /\[write\] ~\/\.codex\/config\.toml plugin disable: harnesses@harnesses/);
  assert.match(stdout, /\[run\] uv tool uninstall codex-harnesses/);
});

test('codex uninstall disables configured Codex plugin', () => {
  const home = makeHome();
  const configPath = join(home, '.codex', 'config.toml');
  const binDir = join(home, 'bin');
  mkdirSync(dirname(configPath), { recursive: true });
  mkdirSync(binDir, { recursive: true });
  writeFileSync(
    configPath,
    [
      'model = "gpt-5.5"',
      '',
      '[plugins."harnesses@harnesses"]',
      'enabled = true',
      '',
      '[plugins."other@example"]',
      'enabled = true',
      '',
    ].join('\n'),
  );
  writeExecutable(join(binDir, 'uv'), '#!/bin/sh\nexit 0\n');

  const { status, stderr } = runCli(
    'bin/install.mjs',
    ['--codex', '--uninstall'],
    home,
    { PATH: `${binDir}:${process.env.PATH}` },
  );

  assert.equal(status, 0);
  assert.equal(stderr, '');
  const codexConfig = readFileSync(configPath, 'utf8');
  assert.match(codexConfig, /\[plugins\."harnesses@harnesses"\]\nenabled = false/);
  assert.match(codexConfig, /\[plugins\."other@example"\]\nenabled = true/);
});
