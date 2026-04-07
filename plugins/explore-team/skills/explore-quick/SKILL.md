---
name: explore-quick
description: "Quick codebase exploration without full hypothesis cycle — for simpler questions"
user_invocable: true
trigger_keywords: ["quick explore", "빠른 탐색"]
---

# explore-quick

Lightweight exploration using only explore-scout (no delegation to sub-agents).

## Usage
`/explore-quick <question>`

## Examples
- `/explore-quick where is the database connection configured`
- `/explore-quick what testing framework is used`

## Process

1. Launch explore-scout with instructions to do a **solo exploration** (no delegation)
2. Scout performs recon, analysis, and reports directly
3. Output is a concise summary rather than a full architecture report

## Prompt Template

```
You are explore-scout in QUICK MODE. The user wants a fast answer to:

"{user_question}"

Working directory: {cwd}

Do NOT delegate to other agents. Perform a focused exploration yourself:
1. Survey relevant files with Glob and Grep
2. Read key files
3. Answer the question directly in a concise format

Output format:
## 답변
{direct answer}

## 근거
{key files and evidence, with file:line citations}
```
