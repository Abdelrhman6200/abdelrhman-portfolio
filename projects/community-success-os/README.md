# Community Success OS

A learner-success workspace built around Student 360: engagement signals,
renewal state and intervention workflows in one place, with AI assistance that
returns the evidence behind a recommendation rather than only the recommendation.

```bash
cp .env.example .env    # fill in DATABASE_URL and SESSION_SECRET
npm install
npm run db:push
npm run dev             # http://localhost:3000
npm run check           # TypeScript
npm test                # 20 tests
npm run build
```

## The workflow

```
Signal → Student 360 → Risk → Intervene → Renew
```

1. **Signal** — engagement, attendance and progress changes land as events.
2. **Student 360** — signals are assembled into one view of the learner rather
   than scattered across five dashboards.
3. **Risk** — the view is scored, and the evidence behind the score stays
   attached to it.
4. **Intervene** — a human picks the action. The system supplies the reasons,
   never the decision.
5. **Renew** — the outcome feeds back into which signals count as risk next time.

## Design decisions worth knowing

**Recommendations arrive with their evidence.** The AI analyst returns the
stored records a suggestion was derived from, and names its data limits. A
recommendation you cannot audit is a recommendation you cannot act on.

**The workspace is the security boundary.** Students, sessions and interventions
are scoped to an organization, and `assertStudentScope` rejects any request that
reaches across workspaces — checked in the data layer, not the UI.

**Admin actions are separated.** The operational audit surface is admin-only and
tested for both admin and non-admin callers.

## Authentication

Local credential auth, implemented in this repository — see
`server/_core/password.ts` (scrypt) and `server/_core/session.ts` (HS256 JWT in
an httpOnly cookie). Sign-in lives at `/sign-in`.

`users.openId` is retained as a stable public identifier, minted locally at
registration. It is not an external identity and involves no identity provider.

## Layout

```
client/src/
  pages/               Home, OperationsPages, sign-in
  components/          DashboardLayout and workspace UI
  _core/hooks/         useAuth
server/
  _core/               Auth, sessions, LLM client, tRPC setup
  routers.ts           API surface and role boundaries
  db.ts                Data access, workspace scoping
drizzle/schema.ts      Database schema
```
