---
name: debate-decision
description: "Use when you need to make a contested architecture or design decision; structures the problem as a debate and produces a documented verdict."
trigger: /debate-decision
---

# debate-decision

Structures an open-ended architecture decision as a formal debate.

## Usage

```
/debate-decision <decision question>
```

The debate-team will identify the two main competing options from the question and run the full debate.

## Examples

```
/debate-decision Should we use GraphQL or REST for our mobile app API?
/debate-decision Should we add a Redis cache layer or optimize our PostgreSQL queries?
/debate-decision Should authentication live in a separate microservice or in our main API?
```

## Difference from /debate-tradeoff

- `/debate-tradeoff` — you specify Option A and Option B explicitly
- `/debate-decision` — the team identifies the competing options from your question
