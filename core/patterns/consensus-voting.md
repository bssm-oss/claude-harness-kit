# Consensus Voting Pattern

## Purpose

When multiple agents produce conflicting outputs (e.g., different review verdicts), a mediator runs structured voting rounds to reach consensus.

## Flow (review-team)

```
screener-1 (correctness) ─┐
screener-2 (security)     ├──► moderator (vote aggregation) ──► judge (verdict)
screener-3 (performance)  ─┘
```

The moderator resolves conflicts by:
1. Identifying contradictory findings
2. Requesting clarification from the originating screener if needed
3. Producing a unified report with conflict resolution notes

## Flow (debate-team)

```
advocate-a ─┐
advocate-b  ─┼──► devils-advocate ──► Round 2 ──► judge (verdict)
             ─┘
```

- Max 5 rounds
- If judge is split after round 5: forced verdict with explicit uncertainty rating

## When consensus fails

If no consensus after max rounds:
- **review-team**: moderator flags the conflict explicitly; judge issues CONDITIONAL verdict
- **debate-team**: judge issues SPLIT verdict with both options documented
