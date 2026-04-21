# claude-harness-kit v1.0.0 — Implementation Plan

> Source: design session 2026-04-22  
> Repo: harness-for-yall → claude-harness-kit  
> npm: `claude-harness-kit@1.0.0`

---

## Target Structure

```
claude-harness-kit/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   ├── dev-team/          [renamed: dev-pipeline]
│   ├── review-team/       [renamed: review-pipeline]
│   ├── fe-team/           [renamed: fe-experts, +fe-reflector]
│   ├── be-team/           [renamed: be-experts, +be-reflector]
│   ├── explore-team/      [unchanged]
│   ├── research-team/     [NEW: Blackboard pattern]
│   ├── debate-team/       [NEW: Adversarial Debate]
│   └── ops-team/          [renamed: ops-kit, +zombie-collector]
├── core/
│   ├── blackboard/        schema.md
│   ├── patterns/          7 pattern docs
│   └── trace/             schema.md
├── docs/
│   ├── PATTERNS.md
│   ├── AGENTS_MD_STANDARD.md
│   ├── DESCRIPTION_FORMULA.md
│   ├── CREATING_TEAMS.md
│   └── TRACE_LOG.md
├── examples/              01~05 시나리오
├── scripts/
│   ├── install.sh
│   └── uninstall.sh
├── bin/
│   └── install.mjs
├── .github/
│   └── workflows/         ci.yml, release.yml
├── package.json
├── README.md
├── README.ko.md
├── CHANGELOG.md
└── LICENSE
```

---

## Stats

| | Before | After |
|--|--|--|
| Teams | 6 | 8 |
| Agents | 29 | 36 |
| Skills | 20 | 23 |
| Patterns | 4 | 7 (+Adversarial, Blackboard, + 4 cross-cutting) |

---

## Task List

### Phase 1 — Setup & Rename

**Task 1** · Setup: 패키지 정리 + 레거시 제거
- `claude-harness/` 중첩 repo 삭제
- `install.sh` + `uninstall.sh` → `scripts/` 이동
- `package.json`: name=`claude-harness-kit`, version=`1.0.0`, keywords 업데이트
- `LICENSE` MIT 생성
- `.gitignore`: `.harness/`, `*.log` 추가

**Task 2** · Rename: 모든 팀 디렉토리 `*-team` 통일 ← blocked by #1
- `dev-pipeline` → `dev-team`
- `review-pipeline` → `review-team`
- `fe-experts` → `fe-team`
- `be-experts` → `be-team`
- `ops-kit` → `ops-team`
- `.claude-plugin/marketplace.json` 8팀 전부 업데이트
- `bin/install.mjs` 팀 목록/도움말 업데이트

**Task 3** · Installer: hooks + core 설치 지원 추가
- `bin/install.mjs`: `ops-team/hooks/*.sh` → `~/.claude/hooks/` + chmod +x
- `bin/uninstall.mjs`: hooks 제거 로직
- `package.json` `files` 필드에 `core/`, `docs/`, `examples/`, `scripts/` 추가

---

### Phase 2 — New Plugins

**Task 4** · 신규: `research-team` (Blackboard 패턴)
```
research-planner → research-crawler → research-reader → research-synthesizer
```
- agents: research-planner, research-crawler, research-reader, research-synthesizer
- skills: research-web, research-doc, research-report
- Blackboard 파일: `.harness/blackboard/<session-id>/plan.md, queries.md, findings.md, synthesis.md`

**Task 5** · 신규: `debate-team` (Adversarial Debate 패턴)
```
advocate-a + advocate-b → devils-advocate → judge
```
- agents: debate-advocate-a, debate-advocate-b, debate-devils-advocate, debate-judge
- skills: debate-tradeoff, debate-decision
- 최대 5라운드, moderate disagreement

**Task 6** · Cross-cutting: `fe-reflector` + `be-reflector` 추가
- 구현 결과 수신 → spec 대비 검토 → HIGH 이상 이슈 시 implementer 피드백 루프
- frontmatter: `reflect: false` (기본 off), `escalate_to` 필드

---

### Phase 3 — Content & Docs

**Task 7** · 전체 에이전트 description 재작성 (36개) ← blocked by #6
- 공식: `"Use when [TRIGGER]; handles [ACTION]. [OPTIONAL CONTEXT]"`
- 대상: be-team(8) + dev-team(5) + explore-team(4) + fe-team(6) + review-team(5) + research-team(4) + debate-team(4)

**Task 10** · `core/` + `docs/` 패턴 문서 + 스펙 파일 생성
- `docs/PATTERNS.md`: 7패턴 + 4 cross-cutting 상세
- `docs/AGENTS_MD_STANDARD.md`: AGENTS.md 포맷 스펙
- `docs/DESCRIPTION_FORMULA.md`: description 공식 스펙
- `docs/CREATING_TEAMS.md`: 커스텀 팀 생성 가이드
- `docs/TRACE_LOG.md`: trace log 포맷 + jq 쿼리 예시
- `core/blackboard/schema.md`: SOURCE-XXX findings 포맷
- `core/patterns/*.md`: circuit-breaker, escalation, reflection-loop, consensus-voting, blackboard
- `core/trace/schema.md`: JSONL 이벤트 스펙

**Task 11** · AGENTS.md 8팀 전체 작성 ← blocked by #10
- 포맷: Purpose / Pattern / Agents 표 / Skills 표 / Dependencies / Routing Rules / For AI Agents

---

### Phase 4 — Skills & Examples

**Task 12** · `zombie-collector` SKILL.md + 스크립트 4개
- `check-resources.sh`: macOS/Linux CPU%+RAM, 임계치 비교, JSON 출력
- `find-zombies.sh`: claude-code 고아 프로세스 탐지 (ppid=1, idle>10m)
- `prompt-kill.sh`: 목록 표시 → 사용자 확인(기본 N) → kill-safe 호출
- `kill-safe.sh`: SIGTERM → 5초 → SIGKILL, `.harness/logs/zombie-collector.log`
- 선택적 hook: `resource-watchdog.sh` (HARNESS_AUTO_REAP 지원)

**Task 13** · `examples/` 시나리오 5개
- `01-simple-feature.md`: dev-team CRUD 기능 개발
- `02-code-review.md`: review-team PR 리뷰 (SARIF 출력)
- `03-research-task.md`: research-team 라이브러리 비교 (Blackboard 흐름)
- `04-architecture-decision.md`: debate-team SSR vs SPA 결정
- `05-debugging-session.md`: explore-team → ops-team(zombie-collector) 체이닝

---

### Phase 5 — Routing & Docs

**Task 8** · CLAUDE.md 라우팅 8팀 + 트리거 강화 ← blocked by #4,5,6
```
research-team: "조사해", "찾아봐", "검색해", "research", "크롤", "비교해줘"
debate-team:   "토론", "반론", "트레이드오프", "어느 게 나아", "장단점"
ops-team:      "/release", "/ci-watch", "/zombie-collector", "좀비", "릴리즈"
```

**Task 9** · README.md + README.ko.md + CHANGELOG.md ← blocked by #4,5,6,7
- npm badge + license badge
- 8팀 테이블, 7패턴, 설치 3가지 방법
- CHANGELOG: v1.0.0 전체 내역

---

### Phase 6 — CI & Publish

**Task 14** · `.github/` CI + release 워크플로우
- `ci.yml`: Node 18/20 matrix, npm pack dry-run, markdown lint
- `release.yml`: `v*` 태그 push → npm publish → GitHub release 자동 생성
- `ISSUE_TEMPLATE/`: bug_report, feature_request, new_team_proposal

**Task 15** · npm publish + GitHub release ← blocked by ALL
1. `npm pack --dry-run` 검증
2. `npm publish`
3. `git tag v1.0.0 && git push --tags`
4. `gh release create v1.0.0`
5. 스모크 테스트: `npx claude-harness-kit --dry-run`

---

## Dependency Graph

```
#1 ──► #2
#1 ──► #3
#4 ─┐
#5 ─┼──► #8
#6 ─┘
#6 ──► #7
#10 ──► #11
#4,5,6,7 ──► #9
ALL ──► #15
```

## Parallel Execution Groups

| Wave | Tasks |
|------|-------|
| Wave 1 (즉시) | #1, #3, #4, #5, #6, #10, #12, #13, #14 |
| Wave 2 (#1 후) | #2 |
| Wave 3 (#6 후) | #7 |
| Wave 4 (#10 후) | #11 |
| Wave 5 (#4,5,6 후) | #8 |
| Wave 6 (#4,5,6,7 후) | #9 |
| Final | #15 |

---

## Orchestration Patterns (7 total)

| # | Pattern | Team | Status |
|---|---------|------|--------|
| 1 | Pipeline | dev-team | Existing |
| 2 | Fan-out / Fan-in | review-team | Existing |
| 3 | Expert Pool | fe-team, be-team | Existing |
| 4 | Pipeline + Expert Pool | be-team (hybrid) | Existing |
| 5 | Hierarchical Delegation | explore-team | Existing |
| 6 | Adversarial Debate | debate-team | **NEW** |
| 7 | Blackboard | research-team | **NEW** |

### Cross-cutting Patterns

| | Pattern | Applied To |
|--|---------|-----------|
| a | Reflection Loop | fe-reflector, be-reflector |
| b | Circuit Breaker | All *-implementer agents |
| c | Escalation | fe-team, be-team |
| d | Consensus Voting | review-team, debate-team |
