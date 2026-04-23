import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
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

function runCli(script, args = [], home = makeHome()) {
  const result = spawnSync(nodeBin, [script, ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      HOME: home,
      USERPROFILE: home,
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
