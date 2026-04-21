# Example 01: Simple CRUD Feature — dev-team

**Scenario**: Add a user notes endpoint to an existing Express API.

**Team**: `dev-team` (Pipeline pattern)

---

## Trigger

```
"사용자 노트 CRUD API 엔드포인트 추가해줘"
"Add a user notes CRUD feature"
```

## Harness Flow

```
dev-planner ──► dev-frontend ─┐
                               ├──► dev-reviewer ──► dev-qa
              dev-backend ────┘
```

**Step 1 — dev-planner** produces a spec at `.claude/specs/dev-user-notes.md`:
- API contract: `GET /notes`, `POST /notes`, `GET /notes/:id`, `PUT /notes/:id`, `DELETE /notes/:id`
- Schema: `{ id, userId, title, body, createdAt, updatedAt }`
- Tasks split: backend (router + service + tests), frontend (list view + form)

**Step 2 — dev-backend + dev-frontend run in parallel**

dev-backend implements:
```
src/
  routes/notes.ts       ← Hono router with Zod validation
  services/notes.ts     ← business logic, prisma calls
  tests/notes.test.ts   ← Vitest + Supertest
```

dev-frontend implements:
```
app/notes/
  page.tsx              ← Server Component, list
  [id]/page.tsx         ← detail
  _components/
    NoteForm.tsx        ← Client Component, create/edit
```

**Step 3 — dev-reviewer** flags:
- MEDIUM: `PUT /notes/:id` lacks ownership check — any user can overwrite another's note
- LOW: Missing `updatedAt` index on the notes table

**Step 4 — dev-qa** runs:
```bash
vitest run
npx playwright test e2e/notes.spec.ts
```
All green → task complete.

## Handoff File

`.claude/specs/dev-user-notes.md` (written by dev-planner, read by all agents)

## Output

- 5 REST endpoints with Zod validation and auth middleware
- Frontend list + detail + form pages
- 18 unit/integration tests, 4 E2E tests
- Review report at `.harness/review-user-notes.md`
