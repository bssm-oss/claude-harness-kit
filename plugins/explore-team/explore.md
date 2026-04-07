# Explore Harness

Architecture exploration and investigation harness using hierarchical agent delegation.

## Team: explore

| Agent | Model | Role |
|-------|-------|------|
| explore-scout | opus | Lead explorer — codebase survey, cross-cutting patterns, orchestration |
| explore-hypothesizer | sonnet | Generates 2-4 competing hypotheses with evidence plans |
| explore-evidence | sonnet | Gathers supporting/refuting evidence via code search |
| explore-synthesizer | sonnet | Consolidates findings into actionable architecture report |

## Pattern: Hierarchical Delegation

```
User Question
    └─▶ explore-scout (opus)
            ├─▶ explore-hypothesizer → competing hypotheses
            ├─▶ explore-evidence → evidence for/against each hypothesis
            ├─▶ explore-synthesizer → architecture report
            └─▶ final review & delivery
```

## Skills

- `/explore-investigate` — Full investigation with all 4 agents
- `/explore-quick` — Fast exploration with scout only (no delegation)
- `/explore-hypothesis` — Standalone hypothesis generation

## Trigger Keywords
"explore", "investigate", "how does X work", "architect", "탐색", "조사"

## Use Cases
- Refactoring planning
- Legacy code understanding
- Bug root cause analysis
- Migration feasibility assessment

## Conventions
- User-facing output: Korean
- Code references and technical terms: English
- All findings must cite file:line sources
- Reports written to `.claude/specs/explore-{slug}.md`
- Agents are read-only — no file modifications during exploration
