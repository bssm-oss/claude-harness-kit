# Security Policy

## Supported Versions

Only the **latest published version** on npm receives security fixes.

| Version | Supported |
|---|---|
| latest | yes |
| older releases | no — please upgrade |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Use GitHub's Private Vulnerability Reporting:

> [https://github.com/bssm-oss/claude-harness-kit/security/advisories/new](https://github.com/bssm-oss/claude-harness-kit/security/advisories/new)

Your report will only be visible to the maintainers until it is resolved and a fix is published.

### What to include

- A clear description of the vulnerability and its potential impact
- Steps to reproduce (command, input, environment)
- Node.js version and OS
- Any proof-of-concept code or output (attach as a file, not inline, if it contains exploit payloads)

## Response Timeline

| Stage | Target |
|---|---|
| Initial acknowledgment | 5 business days |
| Severity assessment | 10 business days |
| Patch release | 30 days from confirmation |

If the timeline cannot be met for a confirmed critical issue, we will notify you with a revised estimate.

## Scope

The following are **in scope**:

- **Installer path traversal** — `bin/install.mjs` writing files outside `~/.claude/` or the project's `.claude/` directory
- **Hook injection** — a malicious plugin embedding shell commands that execute during `PostToolUse` / `PreToolUse` / `Stop` hooks via `.claude/settings.json`
- **Supply chain attacks** — a compromised plugin in the marketplace (`plugins/`) that exfiltrates environment variables, API keys, or file contents at install time or runtime
- **Privilege escalation** — the installer or any hook gaining permissions beyond what the user explicitly granted

## Out of Scope

The following are **not considered security vulnerabilities** in this project:

- Agent prompt content that produces unhelpful, biased, or incorrect AI responses — this is a model behavior issue, not a software vulnerability
- Denial-of-service via resource-intensive agent chains (no availability SLA)
- Issues in Claude Code itself or the Anthropic API — report those to Anthropic directly
- Social-engineering attacks that require the victim to manually copy malicious plugin files

## Disclosure Policy

We follow **coordinated disclosure**. We ask that you:

1. Give us the response timeline above before any public disclosure
2. Avoid accessing, modifying, or deleting data that does not belong to you during research
3. Act in good faith — we will do the same

We will credit reporters in the release notes for confirmed vulnerabilities unless you prefer to remain anonymous.
