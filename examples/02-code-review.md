# Example 02: Code Review — review-team

**Scenario**: Review a PR that refactors the authentication middleware.

**Team**: `review-team` (Fan-out/Fan-in + Consensus Voting pattern)

---

## Trigger

```
"이 PR 리뷰해줘"
"Review PR #42 — refactor auth middleware"
/review-code
```

## Harness Flow

```
review-screener-1 (correctness) ─┐
review-screener-2 (security)     ├──► review-moderator ──► review-judge
review-screener-3 (performance)  ─┘
```

## Input

```bash
# Pass PR diff or file list to the skill
/review-code src/middleware/auth.ts src/middleware/session.ts
```

## Per-Screener Output

**screener-1 (correctness)**:
- BLOCKER: `refreshToken()` called without awaiting the result — silent failure on token expiry
- MEDIUM: Missing null check on `req.user` before downstream handlers

**screener-2 (security)**:
- BLOCKER: JWT secret read from `process.env.JWT_SECRET` with no fallback guard — crashes in test env
- HIGH: Session cookie missing `HttpOnly` and `Secure` flags

**screener-3 (performance)**:
- MEDIUM: `db.user.findUnique()` called on every request — should cache with Redis or in-memory TTL
- LOW: Unused import `lodash/merge` adds 4kB to bundle

## moderator Consolidation

Conflicts resolved:
- screener-1 and screener-2 both flagged JWT handling — merged into single BLOCKER finding
- screener-3's Redis suggestion tagged as MEDIUM (not a correctness blocker)

Unified report written to `.harness/review-auth-pr42.md`.

## judge Verdict

```
VERDICT: BLOCK

Blockers (2):
  [SEC-001] JWT secret has no guard — fix before merge
  [COR-001] Unawaited refreshToken() — silent failure path

High (1):
  [SEC-002] Session cookie flags missing

Approve after blockers are fixed. Re-review not required for MEDIUM/LOW.
```

## SARIF Output

```json
{
  "version": "2.1.0",
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "runs": [{
    "tool": { "driver": { "name": "review-team", "version": "1.0.0" }},
    "results": [
      {
        "ruleId": "SEC-001",
        "level": "error",
        "message": { "text": "JWT secret read without guard — crashes if env var missing" },
        "locations": [{ "physicalLocation": { "artifactLocation": { "uri": "src/middleware/auth.ts" }, "region": { "startLine": 12 }}}]
      }
    ]
  }]
}
```
