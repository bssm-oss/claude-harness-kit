# Operational CLAUDE.md Rules

Copy these into your project or global `CLAUDE.md` to improve Claude Code behavior.

---

## End-to-end Verification

```markdown
# Operational Rules
- **End-to-end 검증 필수**: 빌드/릴리즈/배포 작업 후에는 실제 소비 경로까지 확인 — CI run 상태, 포뮬러 asset 이름 일치, 바이너리 재설치+스모크 테스트, 레지스트리 반영 등. "done" 선언은 사용자 경로가 실제로 동작할 때만.
- **바이너리/패키지 수정 후 reinstall**: CLI 도구 수정했으면 재설치 후 명령 1번 돌려보고 done.
```

## Premature Execution Prevention

```markdown
- **Premature execution 금지**: "이거 해줘" vs "이거 어떻게 할까?" 구분. 모호하면 먼저 1~2문장 제안 제시, 사용자 OK 후 실행.
- **인라인 콘텐츠 존중**: 사용자가 프롬프트에 붙여넣은 내용이 있으면 원본 파일/PDF 다시 읽지 말 것.
```

## Environment & Safety

```markdown
- **Tunneling 선택**: 로컬 서비스 공개할 때 `tailscale funnel` 우선. `cloudflare trycloudflare`는 불안정.
- **`.claude/worktrees/` 금지**: 절대 commit/scp/rsync 대상에 포함하지 말 것.
- **환경 문제는 선제 진단**: Vitest/Playwright worker, Colima 등 리소스 폭주 의심되면 먼저 `ps` 확인.
```

## Communication

```markdown
- **설명 톤**: 추상적·장황한 기술 서술보다 입력/출력 예시 중심. 인터뷰·PR 설명 같은 컨텍스트에선 특히 구체적으로.
```

## Auto CI Watch

```markdown
# Auto CI Watch
`git push`로 `main` 또는 `develop` 브랜치에 푸시한 직후, 자동으로 백그라운드 에이전트를 띄워 CI 상태를 감시한다.
1. `gh api /repos/{owner}/{repo}/actions/runs?per_page=1&branch={branch}`로 run 상태 확인
2. `in_progress`면 백그라운드에서 270초 간격으로 폴링 (최대 3회)
3. `failure`/`cancelled`면 `/ci-watch` 스킬에 따라 자동 진단 → 수정 → 재푸시
4. 워크플로우 YAML 수정은 자동. 소스 코드 수정은 사용자 확인 후.
5. `success`면 한 줄 보고하고 끝.
```

## Hook Setup (settings.json)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CC_BASH_COMMAND\" | grep -q 'git push'; then ~/.claude/hooks/ci-push-check.sh; fi"
          }
        ]
      }
    ]
  }
}
```
