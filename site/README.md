# Abdelrhman Shoman — Systems Builder

Personal portfolio. React + Vite + TypeScript, no runtime framework beyond the
router, deployed as static files behind a small Express server.

```bash
npm install
npm run dev      # http://localhost:3000
npm run check    # TypeScript, no emit
npm test         # vitest
npm run build    # static site -> dist/
npm run preview  # serve the built site locally
```

## What the site argues

The claim is *different problems, same approach*. Rather than assert that in
prose, the **Method** section (`#method`) makes it checkable: each of the eight
stages is shown applied to three unrelated problems — an operations backlog, an
AI workflow, a data-quality failure — so a visitor reads the same stage across
different domains and sees it repeat.

Everything else on the page is arranged to support or qualify that claim.

## Live demos

Seven projects carry a working demo under `/demo/*` — not walkthroughs, but the
project's core logic re-implemented client-side and driven by the visitor:

- **feedback** — the draft → review → approve machine, with role enforcement.
  Switch to coordinator mid-draft and the controls are dead, because the
  machine forbids it, not the UI.
- **ops** — KPI thresholds raise anomalies; resolution requires a recorded
  root cause; the audit log is append-only.
- **success** — live risk scoring where the score never appears without the
  rules that produced it.
- **validation** — an editable sheet running the full rule engine on every
  keystroke.
- **sessions** — the naming convention, encoding and decoding, plus the batch
  run.
- **report** — a self-validating questionnaire that only fills the template
  from clean answers.
- **agent** — TF-IDF retrieval over an SOP corpus with the ranked sources,
  scores and matched terms exposed. When nothing scores it refuses to answer
  rather than improvising.

Each logic module lives in `client/src/demos/logic/` as pure functions with
its own tests, so the demos are pinned demonstrations rather than animations.
Every demo states, in the same banner, that it runs on synthetic data entirely
in the browser.

## Theme

Dark is the default. A control in the header cycles light, dark and system; the
choice persists, and "system" follows the OS live. The correct theme is resolved
by an inline script before first paint, so there is no flash of the wrong one.

Both palettes are defined as tokens in one place per stylesheet, and two suites
keep them honest: `theme.test.ts` fails if a token is used but never declared,
or declared for light and forgotten for dark; `contrast.test.ts` recomputes
WCAG ratios from the stylesheet on every run, so adjusting a colour for looks
cannot quietly drop text below AA.

## The evidence model

Portfolios usually flatten very different kinds of work into identical cards. This
one does not. Every project carries an explicit tier, rendered as a badge:

| Tier | Badge | Means |
| --- | --- | --- |
| `code` | SOURCE AVAILABLE | Source you can read — in `projects/`, or a public repository. |
| `brief` | REPORTED OUTCOME | Operator-supplied record. Figures are as reported, not independently measured. |

Two rules are enforced by tests in `client/src/pages/ReferenceHome.test.tsx`:

- a `brief` project stating a figure must attribute it (`Reported: …`);
- a `verifiable` claim list may only appear on a `code` project.

This is the point of the site. A reader should never have to guess whether they
are looking at software or a story about software.

## Layout

```
client/src/
  content/portfolio.ts   All copy, projects and method stages. Single source of truth.
  pages/ReferenceHome    The home page. Presentation only — no content lives here.
  components/ui/         shadcn/ui primitives.
  index.css              Design tokens (@theme) + base elements + reduced-motion contract.
  reference.css          Home page layout.
  editorial.css          Demo page layout.
```

Content and presentation are separated so the record can be extended without
touching the page, and so the two content rules above can be tested directly
against the data.

## Accessibility

- Method stages follow the WAI-ARIA tabs pattern, including arrow/Home/End keys.
- Case-file cards respond to focus as well as hover, so the inspector is reachable
  by keyboard rather than pointer only.
- A skip link is the first tab stop; `scroll-padding-top` keeps anchor targets
  clear of the sticky header.
- Pinch-zoom is not disabled.
- All motion is suppressed under `prefers-reduced-motion: reduce`.

## Notes

Analytics are not wired up. If added, inject the tag at deploy time rather than
templating it into `index.html` — an unset variable previously shipped a literal
broken `<script>` tag to production.
