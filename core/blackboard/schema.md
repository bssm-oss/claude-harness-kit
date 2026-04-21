# Blackboard File Schemas

## plan.md

```markdown
# Research Plan

## Question
<original research question, verbatim>

## Success Criteria
<what a complete answer looks like — specific, measurable>

## Sub-questions
1. <sub-question 1>
2. <sub-question 2>
3. <sub-question 3>
...

## Scope
- In scope: <what this research covers>
- Out of scope: <explicit exclusions>

## Status
- [ ] Sub-question 1
- [ ] Sub-question 2
...
```

## queries.md

```markdown
# Search Queries

## Sub-question 1: <title>
- Query: "<exact search query>"
- Query: "<alternate phrasing>"

## Sub-question 2: <title>
- Query: "<exact search query>"
...
```

## findings.md

Each source is a SOURCE-XXX block. IDs are sequential across the session (001, 002, ...).

```markdown
# Findings

## [SOURCE-001] https://example.com/article
Extracted: 2026-04-22T00:30:15Z
Extractor: research-crawler
Reader: research-reader
Query: "the search query that found this"
Confidence: HIGH | MEDIUM | LOW

### Key claims
- [Q1] Claim directly answering sub-question 1
- [Q2] Claim directly answering sub-question 2
- [GENERAL] Broader context claim
- [CONFLICT: SOURCE-002] This source says X, but SOURCE-002 says Y

### Raw excerpts
> "Direct quote from the page, preserved verbatim"

---

## [SOURCE-002] https://other.com/page
...

## [FAILED] https://broken.com/page
Reason: HTTP 403
Query: "query that returned this URL"

---
```

### Confidence levels

| Level | Description |
|-------|-------------|
| HIGH | Primary source: official docs, peer-reviewed, canonical reference |
| MEDIUM | Secondary source: well-known author, accepted StackOverflow answer |
| LOW | Forum post, unknown author, possibly outdated (>2 years) |

### Claim tags

| Tag | Meaning |
|-----|---------|
| `[Q1]`, `[Q2]`, ... | Answers sub-question N from plan.md |
| `[GENERAL]` | Relevant context, not tied to a specific sub-question |
| `[CONFLICT: SOURCE-XXX]` | Contradicts another source |
| `[SKIP]` | Source marked as irrelevant by research-reader |

## synthesis.md

```markdown
# Research Synthesis

**Question:** <original question>
**Session:** <session-id>
**Date:** <YYYY-MM-DD>
**Sources consulted:** <N>
**Status:** COMPLETE | PARTIAL (missing: Q2, Q4)

## Executive Summary

<2–3 paragraphs summarizing the key findings>

## Findings by Sub-question

### Q1: <sub-question title>
<answer with inline citations [SOURCE-001], [SOURCE-002]>

### Q2: <sub-question title>
<answer with inline citations>

...

## Conflicts and Uncertainties

- [SOURCE-001 vs SOURCE-003]: SOURCE-001 claims X, SOURCE-003 claims Y. More recent source (SOURCE-003) preferred.
- ...

## Evidence Gaps

- Q4: Insufficient sources found. Additional search recommended.
- ...

## Sources

| ID | URL | Confidence | Sub-questions |
|----|-----|-----------|--------------|
| SOURCE-001 | https://... | HIGH | Q1, Q2 |
| SOURCE-002 | https://... | MEDIUM | Q1 |
...
```
