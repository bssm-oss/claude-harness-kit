---
name: explore-investigate
description: "Launch a full architecture exploration investigation with hierarchical delegation"
user_invocable: true
trigger_keywords: ["explore", "investigate", "how does X work", "architect", "탐색", "조사"]
---

# explore-investigate

Full architecture exploration using the explore agent team.

## Usage
`/explore-investigate <question or target>`

## Examples
- `/explore-investigate how does the auth flow work`
- `/explore-investigate what would break if we remove the legacy adapter`
- `/explore-investigate root cause of flaky payment tests`

## Process

When triggered, orchestrate the exploration:

1. **Launch explore-scout** as the lead agent with the user's question:
   - Use `Agent` tool with `subagent_type: "general-purpose"` and `model: "opus"`
   - The scout will:
     a. Survey the codebase structure
     b. Delegate hypothesis generation to `explore-hypothesizer`
     c. Delegate evidence gathering to `explore-evidence`
     d. Delegate report synthesis to `explore-synthesizer`
     e. Review and deliver the final report

2. **Pass the question verbatim** — do not rephrase or narrow the scope unless the user asks

3. **Deliver the final report** from explore-scout to the user

## Prompt Template for explore-scout

```
You are explore-scout. The user wants to investigate:

"{user_question}"

Working directory: {cwd}

Follow your agent instructions in .claude/agents/explore-scout.md.
Start with broad codebase survey, then delegate to:
- explore-hypothesizer: for generating competing hypotheses
- explore-evidence: for gathering supporting/refuting evidence  
- explore-synthesizer: for producing the final architecture report

Deliver the final reviewed report.
```
