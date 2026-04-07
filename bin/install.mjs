#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = join(__dirname, '..', 'plugins');
const CLAUDE_HOME = join(homedir(), '.claude');

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function collectFiles(src, dest, list = []) {
  if (!existsSync(src)) return list;
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
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

function printHelp() {
  console.log(`
  claude-code-harness — install multi-agent harness to ~/.claude/

  Usage:
    npx claude-code-harness [options] [plugins...]

  Options:
    --force, -f     Overwrite existing files
    --dry-run       Preview without copying
    --help, -h      Show this help

  Plugins:
    dev-pipeline    Feature development pipeline (5 agents, 1 skill)
    review-pipeline Code review fan-out/fan-in (5 agents, 1 skill)
    fe-experts      Frontend expert pool (5 agents, 5 skills)
    be-experts      Backend expert pool (6 agents, 5 skills)
    explore-team    Codebase exploration (4 agents, 3 skills)

  Examples:
    npx claude-code-harness                 # Install all plugins
    npx claude-code-harness fe-experts      # Install only frontend
    npx claude-code-harness fe-experts be-experts  # Install FE + BE
    npx claude-code-harness --dry-run       # Preview all
`);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    printHelp();
    process.exit(0);
  }

  const flags = ['--force', '-f', '--dry-run', '--help', '-h'];
  const requestedPlugins = args.filter((a) => !flags.includes(a));

  const allPlugins = readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const plugins =
    requestedPlugins.length > 0
      ? requestedPlugins.filter((p) => {
          if (!allPlugins.includes(p)) {
            console.log(`  unknown plugin: ${p} (available: ${allPlugins.join(', ')})`);
            return false;
          }
          return true;
        })
      : allPlugins;

  if (plugins.length === 0) {
    console.log('  no plugins to install.');
    process.exit(1);
  }

  console.log('\n  Claude Code Harness Installer\n');
  console.log(`  Target: ${CLAUDE_HOME}`);
  console.log(`  Plugins: ${plugins.join(', ')}`);
  console.log(`  Mode: ${dryRun ? 'dry-run' : force ? 'force' : 'safe (skip existing)'}\n`);

  // Collect all file operations
  const operations = [];

  for (const plugin of plugins) {
    const pluginDir = join(PLUGINS_DIR, plugin);

    // agents/ -> ~/.claude/agents/
    const agentsDir = join(pluginDir, 'agents');
    if (existsSync(agentsDir)) {
      operations.push(...collectFiles(agentsDir, join(CLAUDE_HOME, 'agents')));
    }

    // skills/<name>/SKILL.md -> ~/.claude/skills/<name>.md (flatten)
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
            dest: join(CLAUDE_HOME, 'skills', `${folder.name}.md`),
          });
        }
      }
    }

    // harness docs (*.md at plugin root, excluding .claude-plugin/)
    const rootMds = readdirSync(pluginDir)
      .filter((f) => f.endsWith('.md') && statSync(join(pluginDir, f)).isFile());
    for (const md of rootMds) {
      operations.push({
        src: join(pluginDir, md),
        dest: join(CLAUDE_HOME, 'harnesses', md),
      });
    }
  }

  // Execute
  let copied = 0;
  let skipped = 0;

  for (const op of operations) {
    const rel = op.dest.replace(CLAUDE_HOME + '/', '');
    if (dryRun) {
      console.log(`  [dry-run] ${rel}`);
      copied++;
      continue;
    }

    mkdirSync(dirname(op.dest), { recursive: true });

    if (existsSync(op.dest) && !force) {
      console.log(`  skip: ${rel}`);
      skipped++;
    } else {
      cpSync(op.src, op.dest);
      console.log(`  copy: ${rel}`);
      copied++;
    }
  }

  console.log(`\n  Done! ${dryRun ? 'Would copy' : 'Copied'}: ${copied}, Skipped: ${skipped}\n`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
