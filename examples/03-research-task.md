# Example 03: Research Task — research-team

**Scenario**: Compare Zustand vs Jotai vs Valtio for a large Next.js 15 app.

**Team**: `research-team` (Blackboard pattern)

---

## Trigger

```
"Zustand vs Jotai vs Valtio 비교 조사해줘"
"Research which state manager fits our Next.js 15 app best"
/research-web
```

## Harness Flow

```
research-planner ──► research-crawler ──► research-reader ──► research-synthesizer
                           ↑_______________↓  (multi-round until gaps filled)
```

Shared state: `.harness/blackboard/<session-id>/`

## Blackboard Files

```
plan.md          ← written by planner, read by all
queries.md       ← search queries for crawler
findings.md      ← raw evidence (SOURCE-001 … SOURCE-N)
synthesis.md     ← final report (written by synthesizer)
```

## Step-by-Step

**research-planner** writes `plan.md`:
```markdown
## Research Goal
Compare Zustand, Jotai, Valtio for Next.js 15 App Router with SSR requirements.

## Sub-questions
1. RSC/SSR compatibility
2. Bundle size and tree-shaking
3. DevTools support
4. TypeScript ergonomics
5. Community velocity (stars, PRs last 6mo)
```

**research-crawler** (Round 1) fetches:
- Official docs for all three libraries
- npm download trends (npmtrends.com)
- GitHub pulse pages
- Two benchmark blog posts

Writes `SOURCE-001` through `SOURCE-009` to `findings.md`.

**research-reader** extracts key claims per sub-question, tags each claim `[SOURCE-XXX]`.

**research-synthesizer** checks coverage → detects gap: no data on Valtio + RSC compatibility.

**research-crawler** (Round 2) fetches Valtio GitHub issues tagged `RSC`, fills gap.

**research-synthesizer** writes `synthesis.md`:

```markdown
## Recommendation: Jotai

| Criterion         | Zustand | Jotai  | Valtio |
|-------------------|---------|--------|--------|
| RSC compatible    | ✅       | ✅      | ⚠️ partial |
| Bundle (gzip)     | 2.9kB   | 2.4kB  | 1.7kB  |
| DevTools          | ✅       | ✅      | ❌      |
| TypeScript        | Good    | Excellent | Good |
| Community (6mo)   | 312 PRs | 198 PRs | 89 PRs |

**Rationale**: Jotai's atom model maps cleanly to Next.js Server/Client component
boundaries. Smallest API surface for the team's current size. Valtio's RSC support
is experimental; Zustand is excellent but heavier for purely atomic state.
```

## Output

`.harness/blackboard/<session-id>/synthesis.md` — full comparison report with citations
