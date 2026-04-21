# release

End-to-end release skill — version bump부터 사용자 소비 경로 검증까지.

## Usage
`/release {repo-path-or-name}` 또는 그냥 `/release`로 현재 디렉토리 대상.

## Trigger
"릴리즈", "release", "publish", "배포", "v{number} 내자" 등

## Prerequisites (자동 확인)

Step 0에서 무조건 확인:
1. `git status` — 작업 트리 클린 아니면 중단, 의도 확인
2. `git remote -v` — 원격 경로 확인 (404 org 같은 이슈 경고)
3. `gh auth status` — GitHub 로그인
4. 대상 레지스트리 인증: `npm whoami`, `cargo login` 상태, `deno.json` publish config 등
5. `.github/workflows/release.yml` 존재 + `on: push: tags:` 트리거인지 확인

인증 실패 시 "어떻게 로그인할지 사용자에게 안내"만 하고 대기. 절대 임의로 우회하지 말 것.

## Pipeline

### 1. 버전 결정
- 현재 버전 읽기 (`package.json`, `Cargo.toml`, `deno.json`, `go.mod`, `build.zig.zon`, Xcode Info.plist 등)
- 변경 내용 요약 → semver 판정 (MAJOR/MINOR/PATCH)
- 사용자에게 제안 후 승인 대기

### 2. 사전 검증
- `test`, `build`, `typecheck`, `lint` 전부 로컬에서 그린인지 확인
- 실패하면 바로 중단 — 릴리즈 태그 만들기 전에 고침
- **절대 CI에 검증을 미루지 말 것**

### 3. 메타데이터 업데이트
- 모든 manifest의 version 필드 동기화 (monorepo면 workspace packages 전부)
- CHANGELOG.md 업데이트 (없으면 생성 제안)
- README badge가 하드코딩된 버전 있으면 교체

### 4. 커밋 + 태그
- `chore: release v{version}` 커밋
- 태그는 annotated (`git tag -a v{version} -m "..."`)
- `git push && git push --tags`

### 5. CI 트리거 실제 확인
- 태그 push 후 `gh run list --limit 3`으로 워크플로우 실제 시작 여부 확인
- **total_count=0이면 원인 조사** (신규 repo는 Actions 수동 enable 게이트가 있을 수 있음)
- Runner 이슈(macos-13 등 단종 runner) 시 즉시 워크플로우 수정 → 태그 삭제/재푸시
- 빌드 매트릭스 실패 하나라도 있으면 release/publish가 cancelled 되므로 **모든 job 초록불 확인**

### 6. 아티팩트 검증 (이름/체크섬)
- GitHub Release에 파일 업로드 완료 확인 (`gh release view v{version} --json assets`)
- 포뮬러/cask가 참조하는 asset 이름과 일치하는지 확인
- `sha256` 필요한 포뮬러면 실제 다운로드 후 해시 갱신

### 7. 레지스트리 반영 확인
- npm: `npm view {pkg} version`
- crates.io: `cargo search {pkg}`
- brew: `brew info`
- JSR/Deno: `deno info jsr:@scope/pkg`

### 8. 최종 관문: 실제 설치 + 스모크 테스트
- 깨끗한 경로에서 설치:
  - `npm i -g {pkg}` → bin 이름으로 실행
  - `brew reinstall {pkg}` → `{pkg} --version`
  - `cargo install {pkg}` → 실행
- 이 단계 통과 못 하면 **done 선언 금지**

### 9. 후속 정리
- brew tap formula 자동 bump
- 관련 다른 repo의 의존 버전 업데이트
- release note 게시 확인 (`gh release view`)

## Known Gotchas

- **신규 repo Actions 미발화**: 레포 이전 직후 workflow 0 runs — Actions 탭 수동 방문 필요할 수 있음
- **macos-13 runner 단종**: `macos-latest`로 교체
- **npm auth 만료**: `npm login` 대화형 필요
- **monorepo partial publish**: release.yml publish 루프에 모든 public 패키지 포함 확인
- **ESM bin 심링크**: `import.meta.url` 가드 사용 시 `realpathSync`로 심링크 해소 필요
- **files 화이트리스트 누락**: `.npmignore` 없으면 gitignore가 fallback → dist/ 빠지고 debug/ 들어가는 역전 현상. `"files"` 필드로 화이트리스트 강제

## Output

```
✅ {pkg}@{version} — commit {sha} · tag v{version} · CI {status} · registry {status} · smoke {status}
```
