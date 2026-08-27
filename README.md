# Abdelrhman Shoman — Portfolio

**Live site:** https://ashomanportfolio.vercel.app · **Contact:** abdelrhman.shoman62@gmail.com

[![CI](https://github.com/Abdelrhman6200/abdelrhman-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Abdelrhman6200/abdelrhman-portfolio/actions/workflows/ci.yml)

One bundle: the portfolio site, and the software it points at.

Every number the site states is checked here on every push — the type check,
the tests and the build run for all four packages in CI.

```
site/                              The portfolio web app
projects/
  edtech-ops-intelligence-os/      Operations control tower (+ Electron desktop shell)
  feedback-copilot/                Human-in-the-loop AI feedback
  community-success-os/            Learner lifecycle & retention
```

Every project here is a standalone application. None of them depends on a
hosting platform to run: authentication, sessions and password hashing are
implemented in the repositories themselves, and the AI features talk to any
OpenAI-compatible endpoint you configure.

## Running it

Each of the four directories is an independent npm project with the same
commands:

```bash
npm install
npm run dev      # development server
npm run check    # TypeScript, no emit
npm test         # vitest
npm run build    # production build (the site builds to site/dist/)
```

Start with `site/`. It needs no database and no environment variables.

The three applications under `projects/` need a MySQL-compatible `DATABASE_URL`
and a `SESSION_SECRET`; see each project's own README and `.env.example`.

## What the site argues

The claim is *different problems, same approach*. The **Method** section makes
that checkable rather than asserted: each of the eight stages is shown applied
to three unrelated problems — an operations backlog, an AI workflow, a
data-quality failure — so the same stage can be read across different domains.

Every project card runs a **live simulation** of that project's pipeline: work
enters, moves through the stages, and leaves as a finished unit. The simulations
pause when scrolled out of view, can be paused by hand, and are replaced by a
still frame under `prefers-reduced-motion`. Nothing they show is only available
as animation — the stage names, the active stage's explanation and the counters
are all rendered as text.

Seven projects carry working in-browser demos under `/demo/*` — each project's core logic re-implemented client-side, tested, and driven by the visitor on synthetic data.

Dark is the default. A control in the header cycles light, dark and system; the
choice persists, and "system" follows the OS live. The theme is resolved by an
inline script before first paint, so there is no flash of the wrong one.

## Publishing the site

The site is fully static — no server, no API. `npm run build` in `site/`
writes it to `site/dist/`; upload that directory to any static host.

A single-page app needs every path served by `index.html`, or a link straight
to `/system/...` returns 404. That is already configured: `_redirects` covers
Netlify and Cloudflare Pages, `vercel.json` covers Vercel, and the Pages
workflow writes a `404.html` copy for GitHub Pages.

## The evidence model

Work is labelled by how strongly it is backed, and the badge is on every card:

| Tier | Badge | Means |
| --- | --- | --- |
| `code` | SOURCE AVAILABLE | Source you can read — in `projects/`, or a public repository. |
| `brief` | REPORTED OUTCOME | Operator-supplied record. Figures are as reported, not independently measured. |

Two rules are enforced by tests rather than by discipline:

- a `brief` project stating a figure must attribute it (`Reported: …`);
- a `verifiable` claim list may only appear on a `code` project.

A reader should never have to guess whether they are looking at software or a
story about software.

## Continuous integration

Every push runs each package's type check, tests and build in a GitHub
Actions matrix (`.github/workflows/ci.yml`). The portfolio's claim is that its
numbers are checkable; CI is where they get checked in public.

## One core, three applications

`server/_core/password.ts`, `session.ts`, `rateLimit.ts` and `cookies.ts` are
**byte-identical across all three applications** — 288 lines of scrypt hashing,
stateless session JWTs, sliding-window rate limiting and cookie policy, applied
to three unrelated problems. A test in `site/` compares their checksums, so the
claim cannot quietly become false.

## Test coverage

| Project | Tests |
| --- | --- |
| `site` | 173 |
| `projects/feedback-copilot` | 51 |
| `projects/edtech-ops-intelligence-os` | 43 |
| `projects/community-success-os` | 34 |

Run `npm test` in any of them.

## Authentication

The three applications share one local authentication implementation:

- **Passwords** — scrypt via `node:crypto` (N=2¹⁷, r=8, p=1), parameters stored
  alongside each hash so they can be raised later without invalidating existing
  passwords. See `server/_core/password.ts`.
- **Sessions** — stateless HS256 JWTs in an httpOnly cookie, verified against
  the app's own users table with no network call on the auth path. See
  `server/_core/session.ts`.
- **Endpoints** — `POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout`.

Both layers are covered by tests that pin the properties that matter: wrong
passwords fail, hashes are salted, tampered and expired tokens are rejected, and
an account with no password set cannot be signed into.

Credential endpoints are rate-limited (sliding window, keyed by IP and
identity, reset on success), and session cookies are httpOnly and
SameSite-Lax, so cross-site POSTs never carry a session.

Set `SESSION_SECRET` in production — the apps refuse to start with the
development fallback when `NODE_ENV=production`.
