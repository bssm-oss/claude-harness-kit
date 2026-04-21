# Example 04: Architecture Decision — debate-team

**Scenario**: SSR (Next.js) vs SPA (Vite + React) for a new internal dashboard.

**Team**: `debate-team` (Adversarial Debate pattern)

---

## Trigger

```
"SSR이랑 SPA 중에 뭐가 나아? 토론해봐"
"Debate SSR vs SPA for our internal dashboard — which should we pick?"
/debate-tradeoff
```

## Harness Flow

```
debate-advocate-a (FOR: SSR) ─┐
debate-advocate-b (FOR: SPA) ─┴──► debate-devils-advocate ──► Round 2 ──► debate-judge
```

Max 5 rounds. Stops when judge reaches verdict.

## Round 1

**advocate-a** (SSR/Next.js):
- SEO matters even for internal dashboards (internal search, deep links)
- Server Components cut client JS by ~40% for data-heavy tables
- Unified codebase — no separate API layer needed
- Next.js 15 App Router stable, team already knows it

**advocate-b** (SPA/Vite):
- Internal dashboard: zero SEO requirement, auth-gated
- SPA bundle cached after first load — subsequent navigations instant
- Simpler mental model: no RSC hydration pitfalls
- Vite HMR significantly faster DX than Next.js dev server
- No vendor lock-in to Vercel deployment

## devils-advocate challenges

- Challenges advocate-a: "Your SEO argument doesn't apply — this is auth-gated. What's the actual SSR benefit?"
- Challenges advocate-b: "You're citing DX speed. What's the real-world impact after deploy? Users don't run Vite."

## Round 2

**advocate-a** revises: SSR benefit = real-time server data without client fetch waterfalls.
**advocate-b** holds: for dashboard, all data is user-specific — server rendering offers no meaningful advantage over RSC on SPA.

## judge Verdict

```
VERDICT: SPA (Vite + React)
Confidence: HIGH

Rationale:
- No SEO requirement (auth-gated) — SSR's primary advantage eliminated
- Dashboard is interaction-heavy; client-side state > server rendering
- Simpler deployment: static files, any CDN
- advocate-a's waterfall concern addressed by React Query parallel fetching

Dissent:
- If the dashboard later needs public pages or shared links with previews,
  migration to Next.js will be non-trivial. Revisit if scope expands.

Decision logged: .harness/debate-ssr-vs-spa-20260422.md
```

## Output

`.harness/debate-<slug>-<date>.md` — full transcript + verdict + dissenting opinion
