# debate-team

## Pattern: Adversarial Debate

Two advocates argue opposing positions. A devil's advocate challenges both. A judge issues a verdict.

## Flow

```
debate-advocate-a   ─┐
  (argues FOR A)     │
                     ├─► Round 1: independent positions
debate-advocate-b   ─┘
  (argues FOR B, rebuts A)
        ↓
debate-devils-advocate
  (challenges both sides, surfaces blind spots)
        ↓
Cross-examination round (optional)
  (advocates respond to devil's challenges)
        ↓
debate-judge
  (verdict + dissenting opinion + reversal conditions)
```

## Key principle

**Moderate disagreement** — advocates make honest, well-reasoned cases, not maximally aggressive attacks. The goal is a better decision, not a win.

## Skills

- `/debate-tradeoff` — explicit Option A vs Option B analysis
- `/debate-decision` — open-ended decision question (team identifies options)

## Triggers

Use debate-team when the user says: "토론", "반론", "트레이드오프", "어느 게 나아", "장단점 비교", "debate", "A vs B", "뭐가 더 나아", "결정 못 하겠어", "pros and cons"
