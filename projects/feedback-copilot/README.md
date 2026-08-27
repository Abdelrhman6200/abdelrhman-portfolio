# Feedback Copilot

AI drafts structured student feedback; a coordinator approves it before it can
be sent. The approval gate is the product — the model accelerates the writing,
a person still owns what goes out.

```bash
cp .env.example .env    # fill in DATABASE_URL and SESSION_SECRET
npm install
npm run db:push
npm run dev             # http://localhost:3000
npm run check           # TypeScript
npm test                # 47 tests
npm run build
```

## The workflow

```
Evidence → Draft → Edit → Review → Approve
```

1. **Evidence** — session notes and observations for one learner are gathered.
2. **Draft** — the model returns Strengths, Areas for Improvement and Next
   Steps. Structured, not freeform, so drafts stay comparable.
3. **Edit** — the teacher rewrites anything the model got wrong.
4. **Review** — a coordinator comments, approves, or returns it to draft.
5. **Approve** — only an approved draft can be sent.

## Design decisions worth knowing

**The status machine is explicit.** `draft → pending review → approved`, with
return-to-draft. Feedback cannot skip review by accident, because there is no
transition that allows it.

**Roles are enforced on the server.** Teacher and coordinator permissions live
in tRPC procedures, not in conditional rendering. Hiding a button is a UI
courtesy; the boundary is `server/routers.ts`.

**Generation failures surface.** If the streaming LLM call fails, the teacher is
told. There is no fallback to fabricated output — a plausible invented draft
about a real student is worse than no draft.

**Every transition is logged — and visible.** Each save, submission, approval, return and
comment writes an append-only event with its actor to `feedbackEvents` —
there is no API to update or delete a log row. `feedback.events` reads the
trail back, scoped: a coordinator sees any entry, a teacher only their own.
The `/workspace` route renders it: students → history → entry → timeline,
with submit/approve/return actions per role.

## Authentication

Local credential auth, implemented in this repository:

- `server/_core/password.ts` — scrypt via `node:crypto`, parameters stored with
  each hash so they can be raised later without invalidating existing passwords.
- `server/_core/session.ts` — stateless HS256 JWTs in an httpOnly cookie,
  verified against this app's own `users` table. No network call on the auth path.
- `server/_core/authRoutes.ts` — `POST /api/auth/register`, `/login`, `/logout`.

Sign-in lives at `/sign-in`. Both layers are covered by `server/password.test.ts`
and `server/session.test.ts`.

## AI configuration

`LLM_BASE_URL` accepts any OpenAI-compatible endpoint. Left unset, AI features
report themselves as unavailable rather than failing at call time.

## Layout

```
client/src/
  pages/               Workspace, demos, sign-in
  lib/                 Rubric and collective-grading logic (unit tested)
  _core/hooks/         useAuth
server/
  _core/               Auth, sessions, LLM client, tRPC setup
  routers.ts           API surface, role boundaries
  feedback.ts          Feedback domain logic
  feedbackStream.ts    Streaming generation endpoint
drizzle/schema.ts      Database schema
```
