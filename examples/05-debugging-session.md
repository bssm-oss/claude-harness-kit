# Example 05: Debugging Session — explore-team → ops-team

**Scenario**: Tests are slow and the CI runner keeps OOM-killing. Investigate and clean up.

**Teams**: `explore-team` (root cause) + `ops-team`/zombie-collector (cleanup)

---

## Trigger

```
"테스트가 왜 이렇게 느리지? CI가 계속 메모리 부족이래"
"Investigate why Vitest workers are eating 12GB RAM and fix it"
```

## Phase 1 — explore-team (Root Cause)

**Routing**: "investigate" + "why" → explore-team

```
explore-scout (orchestrator) ──► explore-hypothesizer
                                       │
                               explore-evidence
                                       │
                               explore-synthesizer
```

**explore-scout** delegates:
- Hypothesis generation: "What could cause Vitest workers to accumulate 12GB RAM?"
- Evidence gathering: read `vitest.config.ts`, `package.json`, recent git log

**explore-hypothesizer** produces 3 hypotheses:
1. Vitest `--pool=forks` spawning too many workers, each loading full app
2. Test fixtures leaking large objects across tests (no `afterEach` cleanup)
3. Previous test run workers not exiting (orphan processes from SIGTERM timeout)

**explore-evidence** investigates each:
- H1: `vitest.config.ts` shows `pool: 'forks', maxWorkers: 8` — 8 forked processes × 1.5GB each = 12GB ✅
- H2: Searched for `afterEach`/`afterAll` — found 3 fixtures with no cleanup ✅
- H3: `ps aux | grep vitest` — 6 zombie vitest workers still running from last CI run ✅

**explore-synthesizer** report:
```
Root causes (all three confirmed):
1. maxWorkers too high for available RAM — reduce to 4
2. 3 fixture files missing afterEach cleanup
3. 6 orphan vitest workers consuming 3.2GB total
```

## Phase 2 — Implement Fixes (be-team inline)

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'forks',
    poolOptions: { forks: { maxWorkers: 4 } },  // was 8
  }
})
```

Fixture cleanup added to 3 test files.

## Phase 3 — ops-team / zombie-collector

Orphan processes cleaned up:

```
/zombie-collector
```

```
Claude Code Zombie Collector

좀비/고아 프로세스 6개 발견:
  PID 18234 — RAM 542MB, idle 47min
  PID 18291 — RAM 618MB, idle 47min
  PID 18302 — RAM 489MB, idle 47min
  PID 19001 — RAM 551MB, idle 31min
  PID 19042 — RAM 503MB, idle 31min
  PID 19099 — RAM 572MB, idle 31min

모두 종료할까요? [y/N]: y
정리 완료
```

Log written to `.harness/logs/zombie-collector.log`.

## Result

| Metric | Before | After |
|--------|--------|-------|
| Vitest peak RAM | 12GB | 5.8GB |
| Test suite duration | 4m 22s | 1m 49s |
| CI OOM kills | 3/5 runs | 0/5 runs |
| Orphan processes | 6 | 0 |

## Chaining Pattern

```
explore-* (read-only investigation)
    ↓
be-* or inline fix (code change)
    ↓
ops-team (process cleanup)
    ↓
review-* (optional: verify fix quality)
```
