#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  cpSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = join(__dirname, '..', 'plugins');

const TARGETS = {
  claude: {
    name: 'Claude Code',
    home: join(homedir(), '.claude'),
    agentsDir: 'agents',
    skillsDir: 'skills',
    skillFormat: 'flat', // SKILL.md -> <name>.md
    transformAgent: null,
  },
  opencode: {
    name: 'OpenCode',
    home: join(homedir(), '.config', 'opencode'),
    agentsDir: 'agents',
    skillsDir: 'skills',
    skillFormat: 'folder', // keep SKILL.md in folder
    transformAgent: transformForOpenCode,
  },
};

const MODEL_MAP = {
  opus: 'anthropic/claude-opus-4-6',
  sonnet: 'anthropic/claude-sonnet-4-6',
  haiku: 'anthropic/claude-haiku-4-5-20251001',
};

function transformForOpenCode(content) {
  // Add mode: subagent if not present
  if (/^---\s*$/m.test(content)) {
    // Has frontmatter — transform model names and add mode
    let transformed = content;

    // Convert model short names to provider/model format
    for (const [short, full] of Object.entries(MODEL_MAP)) {
      transformed = transformed.replace(
        new RegExp(`^(model:\\s*)${short}\\s*$`, 'm'),
        `$1${full}`
      );
    }

    // Add mode: subagent after description if not present
    if (!/^mode:/m.test(transformed)) {
      transformed = transformed.replace(
        /^(description:.*$)/m,
        '$1\nmode: subagent'
      );
    }

    // Convert tools array to OpenCode permission record
    // Claude Code: tools:\n  - Read\n  - Write\n  - Bash
    // OpenCode: permission:\n  read: allow\n  write: allow\n  bash:\n    "*": allow
    const toolsMatch = transformed.match(/^tools:\n((?:\s+-\s+\w+\n?)+)/m);
    if (toolsMatch) {
      const toolNames = toolsMatch[1]
        .split('\n')
        .map((l) => l.replace(/^\s+-\s+/, '').trim().toLowerCase())
        .filter(Boolean);

      const TOOL_PERMISSION_MAP = {
        read: 'read: allow',
        write: 'write: allow',
        edit: 'edit: allow',
        glob: 'glob: allow',
        grep: 'grep: allow',
        bash: 'bash:\n    "*": allow',
        notebookedit: 'notebook: allow',
      };

      const permissionLines = toolNames
        .map((t) => TOOL_PERMISSION_MAP[t])
        .filter(Boolean)
        .map((l) => `  ${l}`)
        .join('\n');

      const replacement = permissionLines ? `permission:\n${permissionLines}` : '';
      transformed = transformed.replace(/^tools:\n(?:\s+-\s+\w+\n?)+/m, replacement);
    }

    return transformed;
  }

  // No frontmatter — wrap with minimal OpenCode frontmatter
  const firstLine = content.split('\n').find((l) => l.trim().length > 0) || 'Agent';
  const desc = firstLine.replace(/^#+\s*/, '').slice(0, 100);
  return `---\ndescription: "${desc}"\nmode: subagent\n---\n\n${content}`;
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
  harness-for-yall — install multi-agent harness

  Usage:
    npx harness-for-yall [options] [plugins...]

  Options:
    --target <t>    Target: claude (default) or opencode
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
    npx harness-for-yall                          # All plugins → Claude Code
    npx harness-for-yall --target opencode        # All plugins → OpenCode
    npx harness-for-yall fe-experts be-experts    # Specific plugins
    npx harness-for-yall --dry-run                # Preview
`);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');

  // Parse --target
  const targetIdx = args.indexOf('--target');
  const targetName = targetIdx !== -1 ? args[targetIdx + 1] : 'claude';
  const target = TARGETS[targetName];

  if (!target) {
    console.log(`  unknown target: ${targetName} (available: claude, opencode)`);
    process.exit(1);
  }

  if (help) {
    printHelp();
    process.exit(0);
  }

  const flags = ['--force', '-f', '--dry-run', '--help', '-h', '--target'];
  const requestedPlugins = args.filter((a, i) => {
    if (flags.includes(a)) return false;
    if (i > 0 && args[i - 1] === '--target') return false;
    return true;
  });

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

  const targetHome = target.home;

  console.log(`\n  harness-for-yall installer\n`);
  console.log(`  Target: ${target.name} (${targetHome})`);
  console.log(`  Plugins: ${plugins.join(', ')}`);
  console.log(`  Mode: ${dryRun ? 'dry-run' : force ? 'force' : 'safe (skip existing)'}\n`);

  // Collect all file operations
  const operations = [];

  for (const plugin of plugins) {
    const pluginDir = join(PLUGINS_DIR, plugin);

    // agents/
    const agentsDir = join(pluginDir, 'agents');
    if (existsSync(agentsDir)) {
      const agentFiles = collectFiles(agentsDir, join(targetHome, target.agentsDir));
      for (const op of agentFiles) {
        op.transform = target.transformAgent;
      }
      operations.push(...agentFiles);
    }

    // skills/
    const skillsDir = join(pluginDir, 'skills');
    if (existsSync(skillsDir)) {
      const skillFolders = readdirSync(skillsDir, { withFileTypes: true }).filter((d) =>
        d.isDirectory()
      );
      for (const folder of skillFolders) {
        const skillFile = join(skillsDir, folder.name, 'SKILL.md');
        if (!existsSync(skillFile)) continue;

        if (target.skillFormat === 'flat') {
          // Claude Code: SKILL.md -> <name>.md
          operations.push({
            src: skillFile,
            dest: join(targetHome, target.skillsDir, `${folder.name}.md`),
          });
        } else {
          // OpenCode: keep folder structure
          operations.push({
            src: skillFile,
            dest: join(targetHome, target.skillsDir, folder.name, 'SKILL.md'),
          });
        }
      }
    }

    // harness docs (*.md at plugin root)
    const rootMds = readdirSync(pluginDir).filter(
      (f) => f.endsWith('.md') && statSync(join(pluginDir, f)).isFile()
    );
    for (const md of rootMds) {
      operations.push({
        src: join(pluginDir, md),
        dest: join(targetHome, 'harnesses', md),
      });
    }
  }

  // Execute
  let copied = 0;
  let skipped = 0;

  for (const op of operations) {
    const rel = op.dest.replace(targetHome + '/', '');
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
      if (op.transform) {
        const content = readFileSync(op.src, 'utf-8');
        writeFileSync(op.dest, op.transform(content));
      } else {
        cpSync(op.src, op.dest);
      }
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
