#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readdirSync, statSync, unlinkSync, chmodSync, readFileSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = join(__dirname, '..', 'plugins');
const CODEX_DIR = join(__dirname, '..', 'codex');
const CLAUDE_HOME = join(homedir(), '.claude');
const CLAUDE_HOME_RESOLVED = resolve(CLAUDE_HOME) + sep;

const CLAUDE_FLAGS = ['--claude', '--cc', '--anthropic'];
const CODEX_FLAGS = ['--codex', '--openai', '--gpt', '--chatgpt'];

function assertSafeDest(destPath) {
  const resolved = resolve(destPath);
  if (!resolved.startsWith(CLAUDE_HOME_RESOLVED)) {
    throw new Error(`Path traversal detected: ${resolved}`);
  }
}

function collectFiles(src, dest, list = []) {
  if (!existsSync(src)) return list;
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      collectFiles(srcPath, destPath, list);
    } else {
      list.push({ src: srcPath, dest: destPath });
    }
  }
  return list;
}

function findCommand(name) {
  const result = spawnSync('which', [name], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

function printHelp() {
  console.log(`
  harnesses — multi-agent orchestration kit

  Usage:
    npx harnesses [--claude | --codex] [options] [teams...]

  Provider:
    --claude, --cc, --anthropic    Claude Code setup (default) — installs agents/skills to ~/.claude/
    --codex,  --openai, --gpt,     Codex / OpenAI setup — installs codex-harnesses Python package
              --chatgpt

  Claude options:
    --uninstall       Remove installed files from ~/.claude/
    --force, -f       Overwrite existing files
    --dry-run         Preview without copying
    --install-hooks   Also install shell hooks to ~/.claude/hooks/ (opt-in)
    --help, -h        Show this help

  Teams (Claude mode):
    dev-team        Feature development pipeline (5 agents, 1 skill)
    review-team     Code review fan-out/fan-in (6 agents, 2 skills)
    fe-team         Frontend expert pool + reflection (6 agents, 5 skills)
    be-team         Backend expert pool + reflection (8 agents, 5 skills)
    explore-team    Codebase exploration (4 agents, 3 skills)
    research-team   Blackboard-pattern web research (4 agents, 3 skills)
    debate-team     Adversarial debate for decisions (4 agents, 2 skills)
    ops-team        Release, CI watch, zombie-collector (0 agents, 3 skills)

  Examples:
    npx harnesses                        # Claude Code: all teams
    npx harnesses --claude be-team       # Claude Code: backend team only
    npx harnesses --codex                # Codex / OpenAI: install Python package
    npx harnesses --dry-run              # Preview Claude install
    npx harnesses --force                # Overwrite existing files
    npx harnesses --install-hooks        # Also install shell hooks
`);
}

async function installCodex() {
  console.log('\n  harnesses — Codex setup\n');

  if (!existsSync(CODEX_DIR)) {
    console.error('  ✗ codex/ bundle not found. Try reinstalling: npm i -g harnesses@latest');
    process.exit(1);
  }

  console.log(`  Source: ${CODEX_DIR}`);
  console.log(`  Package: codex-harnesses`);
  console.log(`  Command after install: codex-harnesses --help\n`);

  const uv = findCommand('uv');

  if (uv) {
    console.log('  Using uv tool install...');
    await runCommand('uv', ['tool', 'install', '--reinstall', CODEX_DIR]);
    console.log('\n  ✓ Done!\n');
    console.log('  Run: codex-harnesses "Should we use PostgreSQL or MongoDB?" --option-a PostgreSQL --option-b MongoDB\n');
    return;
  }

  const pip = findCommand('pip3') || findCommand('pip');
  if (!pip) {
    console.error('  ✗ Neither uv nor pip3 found.\n');
    console.error('  Install uv (recommended):');
    console.error('    curl -LsSf https://astral.sh/uv/install.sh | sh\n');
    console.error('  Then re-run: npx harnesses --codex\n');
    process.exit(1);
  }

  console.log(`  Using ${pip} install --user...`);
  try {
    await runCommand(pip, ['install', '--user', CODEX_DIR]);
    console.log('\n  ✓ Done!\n');
    console.log('  If codex-harnesses is not in PATH, add ~/.local/bin to your PATH.\n');
    console.log('  Run: codex-harnesses "question" --option-a A --option-b B\n');
  } catch {
    console.error('\n  pip install failed (possibly PEP 668 system Python restriction).\n');
    console.error('  Fix: install uv and retry:');
    console.error('    curl -LsSf https://astral.sh/uv/install.sh | sh');
    console.error('    npx harnesses --codex\n');
    process.exit(1);
  }
}

async function installClaude(args) {
  const force = args.includes('--force') || args.includes('-f');
  const dryRun = args.includes('--dry-run');
  const uninstall = args.includes('--uninstall');
  const installHooks = args.includes('--install-hooks');

  const allFlags = [
    '--force', '-f', '--dry-run', '--uninstall', '--install-hooks',
    ...CLAUDE_FLAGS, ...CODEX_FLAGS,
  ];
  const requestedPlugins = args.filter((a) => !allFlags.includes(a));

  const allPlugins = readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const plugins =
    requestedPlugins.length > 0
      ? requestedPlugins.filter((p) => {
          if (!allPlugins.includes(p)) {
            console.log(`  unknown team: ${p} (available: ${allPlugins.join(', ')})`);
            return false;
          }
          return true;
        })
      : allPlugins;

  if (plugins.length === 0) {
    console.log('  no teams to install.');
    process.exit(1);
  }

  const mode = uninstall ? 'uninstall' : dryRun ? 'dry-run' : force ? 'force' : 'safe (skip existing)';
  console.log(`\n  harnesses ${uninstall ? 'uninstaller' : 'installer'}\n`);
  console.log(`  Target: ${CLAUDE_HOME}`);
  console.log(`  Teams: ${plugins.join(', ')}`);
  console.log(`  Mode: ${mode}`);
  if (!uninstall && !installHooks) {
    console.log(`  Hooks: skipped (pass --install-hooks to install shell hooks)`);
  }
  console.log();

  if (uninstall) {
    let removed = 0;
    for (const plugin of plugins) {
      const pluginDir = join(PLUGINS_DIR, plugin);

      const agentsDir = join(pluginDir, 'agents');
      if (existsSync(agentsDir)) {
        for (const f of readdirSync(agentsDir)) {
          const dest = join(CLAUDE_HOME, 'agents', f);
          assertSafeDest(dest);
          if (existsSync(dest)) {
            if (!dryRun) unlinkSync(dest);
            console.log(`  remove: agents/${f}`);
            removed++;
          }
        }
      }

      const skillsDir = join(pluginDir, 'skills');
      if (existsSync(skillsDir)) {
        for (const d of readdirSync(skillsDir, { withFileTypes: true })) {
          if (!d.isDirectory()) continue;
          const dest = join(CLAUDE_HOME, 'commands', `${d.name}.md`);
          assertSafeDest(dest);
          if (existsSync(dest)) {
            if (!dryRun) unlinkSync(dest);
            console.log(`  remove: commands/${d.name}.md`);
            removed++;
          }
        }
      }

      const rootMds = readdirSync(pluginDir).filter(
        (f) => f.endsWith('.md') && f !== 'AGENTS.md' && statSync(join(pluginDir, f)).isFile()
      );
      for (const md of rootMds) {
        const dest = join(CLAUDE_HOME, 'harnesses', md);
        assertSafeDest(dest);
        if (existsSync(dest)) {
          if (!dryRun) unlinkSync(dest);
          console.log(`  remove: harnesses/${md}`);
          removed++;
        }
      }

      const hooksDir = join(pluginDir, 'hooks');
      if (existsSync(hooksDir)) {
        for (const entry of readdirSync(hooksDir, { withFileTypes: true })) {
          if (!entry.isFile() || !entry.name.endsWith('.sh')) continue;
          const dest = join(CLAUDE_HOME, 'hooks', entry.name);
          assertSafeDest(dest);
          if (existsSync(dest)) {
            if (!dryRun) unlinkSync(dest);
            console.log(`  remove: hooks/${entry.name}`);
            removed++;
          }
        }
      }
    }
    console.log(`\n  Done! Removed: ${removed}\n`);
    process.exit(0);
  }

  const operations = [];

  for (const plugin of plugins) {
    const pluginDir = join(PLUGINS_DIR, plugin);

    const agentsDir = join(pluginDir, 'agents');
    if (existsSync(agentsDir)) {
      operations.push(...collectFiles(agentsDir, join(CLAUDE_HOME, 'agents')));
    }

    const skillsDir = join(pluginDir, 'skills');
    if (existsSync(skillsDir)) {
      const skillFolders = readdirSync(skillsDir, { withFileTypes: true }).filter((d) =>
        d.isDirectory()
      );
      for (const folder of skillFolders) {
        const skillFile = join(skillsDir, folder.name, 'SKILL.md');
        if (existsSync(skillFile)) {
          operations.push({
            src: skillFile,
            dest: join(CLAUDE_HOME, 'commands', `${folder.name}.md`),
          });
        }
      }
    }

    const rootMds = readdirSync(pluginDir).filter(
      (f) => f.endsWith('.md') && f !== 'AGENTS.md' && statSync(join(pluginDir, f)).isFile()
    );
    for (const md of rootMds) {
      operations.push({
        src: join(pluginDir, md),
        dest: join(CLAUDE_HOME, 'harnesses', md),
      });
    }

    if (installHooks) {
      const hooksDir = join(pluginDir, 'hooks');
      if (existsSync(hooksDir)) {
        for (const entry of readdirSync(hooksDir, { withFileTypes: true })) {
          if (entry.isFile() && entry.name.endsWith('.sh')) {
            operations.push({
              src: join(hooksDir, entry.name),
              dest: join(CLAUDE_HOME, 'hooks', entry.name),
              executable: true,
            });
          }
        }
      }
    }
  }

  const hookOps = operations.filter((op) => op.executable);
  if (hookOps.length > 0) {
    console.log(`  Hooks to install (review before proceeding):`);
    for (const op of hookOps) {
      console.log(`    ${op.src}`);
      const lines = readFileSync(op.src, 'utf8').split('\n').slice(0, 5).join('\n  > ');
      console.log(`  > ${lines}`);
      console.log();
    }
  }

  let copied = 0;
  let skipped = 0;

  for (const op of operations) {
    assertSafeDest(op.dest);
    const rel = op.dest.replace(CLAUDE_HOME + sep, '');
    if (dryRun) {
      if (existsSync(op.dest)) {
        console.log(`  [skip] ${rel}`);
        skipped++;
      } else {
        console.log(`  [copy] ${rel}`);
        copied++;
      }
      continue;
    }

    mkdirSync(dirname(op.dest), { recursive: true });

    if (existsSync(op.dest) && !force) {
      console.log(`  skip: ${rel}`);
      skipped++;
    } else {
      cpSync(op.src, op.dest);
      if (op.executable) chmodSync(op.dest, 0o755);
      console.log(`  copy: ${rel}`);
      copied++;
    }
  }

  console.log(`\n  Done! ${dryRun ? 'Would copy' : 'Copied'}: ${copied}, Skipped: ${skipped}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const help = args.includes('--help') || args.includes('-h');
  const isCodexMode = CODEX_FLAGS.some((f) => args.includes(f));

  if (help) {
    printHelp();
    process.exit(0);
  }

  if (isCodexMode) {
    await installCodex();
  } else {
    await installClaude(args);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
