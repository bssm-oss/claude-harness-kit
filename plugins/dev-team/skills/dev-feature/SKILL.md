# dev-feature

Orchestrates the full feature development pipeline.

## Usage
`/dev-feature {feature description}`

## Trigger
When the user wants to build a new feature end-to-end, or says `/dev-feature`.

## Pipeline

This skill runs a pipeline: **planner → frontend+backend (parallel) → reviewer → qa**

### Step 1: Planning (dev-planner)
Spawn `dev-planner` agent with the user's feature request.
- Input: user's feature description
- Output: `.claude/specs/dev-{feature-slug}.md` with task breakdown

Present the spec to the user for approval before proceeding. Ask:
> "📋 기획이 완료되었습니다. 스펙을 확인해주세요: `.claude/specs/dev-{feature-slug}.md`\n진행할까요? (y/수정사항)"

### Step 2: Implementation (dev-frontend + dev-backend in parallel)
After user approves the plan, spawn both agents **in parallel**:
- `dev-frontend` — reads FE tasks from spec, implements, updates spec
- `dev-backend` — reads BE tasks from spec, implements, updates spec

Wait for both to complete.

### Step 3: Review Checkpoint (dev-reviewer) — Producer-Reviewer Pattern
This is the **Producer-Reviewer checkpoint**. The reviewer agent acts as a gate.

Spawn `dev-reviewer` to review all implemented code.
- If APPROVE: proceed to Step 4
- If REQUEST_CHANGES: the reviewer fixes issues directly, then re-approves

Report review result to user:
> "✅ 리뷰 완료: APPROVE" or "🔧 리뷰에서 수정 사항 발견 — 자동 수정 후 승인 완료"

### Step 4: QA (dev-qa)
Spawn `dev-qa` agent to generate tests and verify quality.
- Reads approved spec
- Generates tests
- Runs tests if possible
- Reports results

### Step 5: Summary
Present final summary to user in Korean:

```
## 기능 개발 완료: {feature-name}

### 파이프라인 결과
| 단계 | 상태 |
|------|------|
| 기획 | ✅ |
| 프론트엔드 | ✅ |
| 백엔드 | ✅ |
| 리뷰 | ✅ |
| QA | ✅ / ⚠️ |

### 생성/수정된 파일
{file list}

### 다음 단계
- 스펙 확인: `.claude/specs/dev-{feature-slug}.md`
- 커밋 준비가 되면 `/commit` 실행
```

## Slug Generation
Convert the feature name to a URL-safe slug:
- Lowercase, spaces to hyphens, remove special chars
- Example: "사용자 프로필 페이지" → `user-profile-page`

## Error Handling
- If any agent fails, report the failure stage and error to the user
- Do not skip the reviewer checkpoint — it is mandatory
- QA agent must verify reviewer approval before running
