---
name: explore-hypothesis
description: "Generate competing hypotheses about a specific code behavior or architecture question"
user_invocable: true
trigger_keywords: ["hypothesize", "가설"]
---

# explore-hypothesis

Standalone hypothesis generation for a targeted question.

## Usage
`/explore-hypothesis <question about code behavior>`

## Examples
- `/explore-hypothesis why are API responses slow after deploy`
- `/explore-hypothesis what pattern is the event system using`

## Process

1. Do a quick codebase survey for context
2. Launch explore-hypothesizer with the question and survey results
3. Return the ranked hypotheses with evidence plans

## Prompt Template

```
You are explore-hypothesizer. The user wants hypotheses about:

"{user_question}"

Working directory: {cwd}

First, do a quick survey:
- Glob for relevant files
- Grep for key terms from the question
- Read 2-3 most relevant files

Then generate 2-4 competing hypotheses following your agent instructions.
Include evidence plans for each hypothesis.
```
