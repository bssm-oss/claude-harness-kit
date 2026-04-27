#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readdirSync, statSync, unlinkSync, chmodSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLAUDECODE_DIR = join(__dirname, '..', 'claudecode');
const PLUGINS_DIR = join(CLAUDECODE_DIR, 'plugins');
const CODEX_DIR = join(__dirname, '..', 'codex');
const CODEX_PLUGIN_DIR = join(CODEX_DIR, 'plugin', 'harnesses');
const CODEX_PLUGIN_ID = 'harnesses@harnesses';
const CLAUDE_HOME = join(homedir(), '.claude');
const CLAUDE_HOME_RESOLVED = resolve(CLAUDE_HOME) + sep;
const HOME_RESOLVED = resolve(homedir()) + sep;

const CLAUDE_FLAGS = ['--claude', '--cc', '--anthropic'];
const CODEX_FLAGS = ['--codex', '--openai', '--gpt', '--chatgpt'];

function assertSafeDest(destPath) {
  const resolved = resolve(destPath);
  if (!resolved.startsWith(CLAUDE_HOME_RESOLVED)) {
    throw new Error(`Path traversal detected: ${resolved}`);
  }
}

function assertInsideHome(destPath) {
  const resolved = resolve(destPath);
  if (!resolved.startsWith(HOME_RESOLVED)) {
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
    --codex,  --openai, --gpt,     Codex / OpenAI setup — installs Python package + auto-routing plugin
              --chatgpt

  Claude options:
    --uninstall       Remove installed files from ~/.claude/
    --force, -f       Overwrite existing files
    --dry-run         Preview without copying
    --install-hooks   Also install shell hooks to ~/.claude/hooks/ (opt-in)
    --help, -h        Show this help

  Codex options:
    --uninstall       Remove codex-harnesses tool, prompts, and plugin files
    --dry-run         Preview without installing

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
    npx harnesses --codex                # Codex / OpenAI: install Python package + plugin
    npx harnesses --dry-run              # Preview Claude install
    npx harnesses --force                # Overwrite existing files
    npx harnesses --install-hooks        # Also install shell hooks
`);
}

function loadMarketplace(path) {
  if (!existsSync(path)) {
    return {
      name: 'harnesses',
      interface: { displayName: 'Harnesses' },
      plugins: [],
    };
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeMarketplaceEntry(dryRun) {
  const marketplacePath = join(homedir(), '.agents', 'plugins', 'marketplace.json');
  assertInsideHome(marketplacePath);
  if (dryRun) {
    console.log(`  [write] ~/.agents/plugins/marketplace.json`);
    return;
  }

  mkdirSync(dirname(marketplacePath), { recursive: true });
  const marketplace = loadMarketplace(marketplacePath);
  marketplace.name ||= 'harnesses';
  marketplace.interface ||= {};
  marketplace.interface.displayName ||= 'Harnesses';
  marketplace.plugins ||= [];

  const entry = {
    name: 'harnesses',
    source: {
      source: 'local',
      path: './plugins/harnesses',
    },
    policy: {
      installation: 'INSTALLED_BY_DEFAULT',
      authentication: 'ON_USE',
    },
    category: 'Engineering',
  };

  const index = marketplace.plugins.findIndex((plugin) => plugin.name === 'harnesses');
  if (index >= 0) marketplace.plugins[index] = entry;
  else marketplace.plugins.push(entry);

  writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
  console.log(`  marketplace: ~/.agents/plugins/marketplace.json`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setCodexPluginEnabled(dryRun, enabled) {
  const configPath = join(homedir(), '.codex', 'config.toml');
  assertInsideHome(configPath);

  const action = enabled ? 'enable' : 'disable';
  const done = enabled ? 'enabled' : 'disabled';

  if (dryRun) {
    console.log(`  [write] ~/.codex/config.toml plugin ${action}: ${CODEX_PLUGIN_ID}`);
    return;
  }

  if (!existsSync(configPath) && !enabled) return;

  mkdirSync(dirname(configPath), { recursive: true });
  const header = `[plugins."${CODEX_PLUGIN_ID}"]`;
  const enabledLine = `enabled = ${enabled ? 'true' : 'false'}`;
  const rawConfig = existsSync(configPath) ? readFileSync(configPath, 'utf8') : '';
  const config = rawConfig.length > 0 && !rawConfig.endsWith('\n') ? `${rawConfig}\n` : rawConfig;

  if (!enabled && !config.includes(header)) return;

  const sectionPattern = new RegExp(`(^${escapeRegExp(header)}\\n)([\\s\\S]*?)(?=^\\[|\\s*$)`, 'm');
  let nextConfig;

  if (sectionPattern.test(config)) {
    nextConfig = config.replace(sectionPattern, (_match, sectionHeader, body) => {
      const nextBody = /^enabled\s*=.*$/m.test(body)
        ? body.replace(/^enabled\s*=.*$/m, enabledLine)
        : `${enabledLine}\n${body}`;
      return `${sectionHeader}${nextBody}`;
    });
  } else {
    const separator = config.trim().length > 0 ? '\n' : '';
    nextConfig = `${config}${separator}${header}\n${enabledLine}\n`;
  }

  writeFileSync(configPath, nextConfig);
  console.log(`  codex config: plugin ${done} (${CODEX_PLUGIN_ID})`);
}

function removeMarketplaceEntry(dryRun) {
  const marketplacePath = join(homedir(), '.agents', 'plugins', 'marketplace.json');
  assertInsideHome(marketplacePath);
  if (dryRun) {
    console.log(`  [remove] ~/.agents/plugins/marketplace.json entry: harnesses`);
    return;
  }
  if (!existsSync(marketplacePath)) return;
  const marketplace = loadMarketplace(marketplacePath);
  marketplace.plugins = (marketplace.plugins || []).filter((plugin) => plugin.name !== 'harnesses');
  writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
  console.log(`  marketplace removed: harnesses`);
}

async function installCodexPlugin(dryRun) {
  if (!existsSync(CODEX_PLUGIN_DIR)) {
    console.error('  ✗ codex/plugin/harnesses bundle not found.');
    process.exit(1);
  }

  const pluginDest = join(homedir(), 'plugins', 'harnesses');
  assertInsideHome(pluginDest);
  if (dryRun) {
    for (const op of collectFiles(CODEX_PLUGIN_DIR, pluginDest)) {
      console.log(`  [copy] ${op.dest.replace(homedir() + sep, '~/')}`);
    }
  } else {
    mkdirSync(dirname(pluginDest), { recursive: true });
    rmSync(pluginDest, { recursive: true, force: true });
    cpSync(CODEX_PLUGIN_DIR, pluginDest, { recursive: true });
    console.log(`  plugin: ~/plugins/harnesses`);
  }

  writeMarketplaceEntry(dryRun);
  setCodexPluginEnabled(dryRun, true);

  const codex = findCommand('codex');
  if (codex) {
    if (dryRun) {
      console.log(`  [run] codex plugin marketplace add ~`);
    } else {
      try {
        await runCommand(codex, ['plugin', 'marketplace', 'add', homedir()]);
      } catch {
        console.log('  note: Codex marketplace registration failed; plugin files were installed.');
        console.log('        Run manually: codex plugin marketplace add ~');
      }
    }
  } else {
    console.log('  note: codex CLI not found; install Codex and run: codex plugin marketplace add ~');
  }
}

async function uninstallCodex(dryRun) {
  console.log('\n  harnesses — Codex uninstall\n');

  const promptsSrc = join(CODEX_DIR, 'prompts');
  if (existsSync(promptsSrc)) {
    for (const entry of readdirSync(promptsSrc, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const dest = join(homedir(), '.codex', 'prompts', entry.name);
      assertInsideHome(dest);
      if (existsSync(dest) || dryRun) {
        if (!dryRun) unlinkSync(dest);
        console.log(`${dryRun ? '  [remove]' : '  remove:'} ~/.codex/prompts/${entry.name}`);
      }
    }
  }

  const pluginDest = join(homedir(), 'plugins', 'harnesses');
  assertInsideHome(pluginDest);
  if (existsSync(pluginDest) || dryRun) {
    if (!dryRun) rmSync(pluginDest, { recursive: true, force: true });
    console.log(`${dryRun ? '  [remove]' : '  remove:'} ~/plugins/harnesses`);
  }

  removeMarketplaceEntry(dryRun);
  setCodexPluginEnabled(dryRun, false);

  if (!dryRun) {
    const uv = findCommand('uv');
    const pip = findCommand('pip3') || findCommand('pip');
    try {
      if (uv) await runCommand('uv', ['tool', 'uninstall', 'codex-harnesses']);
      else if (pip) await runCommand(pip, ['uninstall', '-y', 'codex-harnesses']);
    } catch {
      console.log('  note: codex-harnesses tool uninstall failed or was already absent.');
    }
  } else {
    console.log(`  [run] uv tool uninstall codex-harnesses`);
  }

  console.log('\n  ✓ Codex uninstall complete\n');
}

async function installCodex(args) {
  const dryRun = args.includes('--dry-run');
  const uninstall = args.includes('--uninstall');

  if (uninstall) {
    await uninstallCodex(dryRun);
    return;
  }

  console.log('\n  harnesses — Codex setup\n');

  if (!existsSync(CODEX_DIR)) {
    console.error('  ✗ codex/ bundle not found. Try reinstalling: npm i -g harnesses@latest');
    process.exit(1);
  }

  console.log(`  Source: ${CODEX_DIR}`);
  console.log(`  Package: codex-harnesses`);
  console.log(`  Command after install: codex-harnesses --help\n`);

  const uv = findCommand('uv');

  if (dryRun) {
    console.log(`  [run] ${uv ? 'uv tool install --reinstall' : 'pip install --user'} ${CODEX_DIR}`);
  } else if (uv) {
    console.log('  Using uv tool install...');
    await runCommand('uv', ['tool', 'install', '--reinstall', CODEX_DIR]);
  } else {
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
    } catch {
      console.error('\n  pip install failed (possibly PEP 668 system Python restriction).\n');
      console.error('  Fix: install uv and retry:');
      console.error('    curl -LsSf https://astral.sh/uv/install.sh | sh');
      console.error('    npx harnesses --codex\n');
      process.exit(1);
    }
  }

  // Install Codex TUI slash command prompts → ~/.codex/prompts/
  const promptsSrc = join(CODEX_DIR, 'prompts');
  if (existsSync(promptsSrc)) {
    const codexPromptsDir = join(homedir(), '.codex', 'prompts');
    let promptsCopied = 0;
    for (const entry of readdirSync(promptsSrc, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const dest = join(codexPromptsDir, entry.name);
      assertInsideHome(dest);
      if (!dryRun) {
        mkdirSync(codexPromptsDir, { recursive: true });
        cpSync(join(promptsSrc, entry.name), dest);
      }
      console.log(`${dryRun ? '  [copy]' : '  prompt:'} ~/.codex/prompts/${entry.name}`);
      promptsCopied++;
    }
    if (promptsCopied > 0) {
      console.log(`\n  Codex TUI slash commands installed (type / in Codex to use):`);
      console.log(`    /debate "question" --option-a A --option-b B`);
    }
  }

  await installCodexPlugin(dryRun);

  console.log('\n  ✓ Done!\n');
  console.log('  CLI:    codex-harnesses "question" --option-a A --option-b B');
  console.log('  Codex:  natural-language routing, or /debate "question" --option-a A --option-b B\n');
  console.log('  Restart Codex to load the Harnesses plugin in new sessions.\n');
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
    await installCodex(args);
  } else {
    await installClaude(args);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
