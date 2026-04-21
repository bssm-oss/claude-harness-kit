# ci-watch

`git push` 후 GitHub Actions 실패를 백그라운드로 감시하고, 실패 시 자동 진단+수정.

## Usage
`/ci-watch` — 현재 레포의 최근 push 기준으로 CI 감시 시작.

## Trigger
- 자동: CLAUDE.md "Auto CI Watch" 규칙에 의해 main/develop 푸시 후 자동 발동
- 수동: "CI 확인해줘", "액션 상태", `/ci-watch`

## Process

### Step 1: 최근 run 감지
```bash
gh api "/repos/{owner}/{repo}/actions/runs?per_page=3&branch={branch}" \
  --jq '.workflow_runs[] | "\(.id) \(.name) \(.status) \(.conclusion) \(.html_url)"'
```
- `queued`/`in_progress` → Step 2 (대기)
- `completed` + `success` → 보고하고 끝
- `completed` + `failure`/`cancelled` → Step 3

### Step 2: 완료 대기 (백그라운드)
- 백그라운드 에이전트로 전환
- 270초 간격으로 폴링 (캐시 TTL 5분 이내 유지)
- 최대 3회 폴링 (~15분). 이후 미완료면 사용자에게 보고

### Step 3: 실패 진단
1. 실패한 job 목록: `gh run view {run-id} --json jobs`
2. 실패 로그: `gh run view {run-id} --log-failed`
3. 에러 패턴 매칭:
   - Runner 단종 → runner 교체
   - 의존성 해결 실패 → lockfile/레지스트리
   - 테스트 실패 → 코드 수정
   - 빌드 실패 → 컴파일 에러
   - 시크릿 누락 → 사용자에게 안내

### Step 4: 자동 수정 판단
**사용자 확인 없이 자동**:
- 워크플로우 YAML 수정 (runner 교체, Node 버전, 오타)
- lockfile 재생성

**사용자 확인 필수**:
- 소스 코드 수정
- 시크릿/환경변수 관련
- OS 지원 범위 변경

### Step 5: 수정 + 재푸시
1. 수정 커밋 (`ci: fix {문제 요약}`)
2. `git push origin {branch}`
3. Step 1 재진입 — 새 run 감시
4. 최대 재시도 2회

### Step 6: 태그 릴리즈면 태그 재발행
- 워크플로우 수정 후 기존 태그 삭제 + 재생성

## Output
```
🔍 CI Watch: {repo}@{branch}
├─ Run #{id}: {workflow name}
├─ Status: {status}/{conclusion}
├─ Failed jobs: {list}
├─ Root cause: {1줄 진단}
├─ Fix: {수정 요약}
└─ Re-push: {SHA} → 재감시 중...
```

최종: `✅ CI passed` 또는 `❌ 2회 수정 실패, 수동 개입 필요`
