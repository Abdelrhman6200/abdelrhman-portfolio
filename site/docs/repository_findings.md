# Repository inspection findings

## Supplied URL

The supplied repository URL, `https://github.com/Abdelrhman6200/bolt-domain-whisperer`, currently returns GitHub **404 Not Found** in both the web page and the public GitHub REST API endpoint:

`https://api.github.com/repos/Abdelrhman6200/bolt-domain-whisperer`

## Public repositories visible for the account

The public repository list at `https://api.github.com/users/Abdelrhman6200/repos?per_page=100` currently exposes these repositories:

- `https://github.com/Abdelrhman6200/BackendApp`
- `https://github.com/Abdelrhman6200/CGF`
- `https://github.com/Abdelrhman6200/Portoflio-`
- `https://github.com/Abdelrhman6200/question-template-fill`

No public repository named `bolt-domain-whisperer` appeared in the account’s current public repository list. The intended repository may be private, renamed, deleted, or shared with a typo in the URL.

## Verified repository: CGF

Source: `https://github.com/Abdelrhman6200/CGF`

The README describes a landing page and paid enrollment platform for a CG Foundry training program. Its documented flow is: landing page → Stripe Checkout → payment webhook → purchase and enrollment record → Supabase Auth account creation → magic login link → protected student dashboard.

The README explicitly documents Vite, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase Postgres with row-level security, Stripe Checkout and webhooks through Supabase Edge Functions, VdoCipher DRM streaming with OTP playback tokens, and Resend through a transactional email queue.

The documented student dashboard includes protected recordings, downloadable resources, and a private Discord invite. The documented admin surface manages cohorts, sessions, recordings, resources, paid students with CSV export, and attendance. These are README claims and should be presented as implemented project capabilities rather than measured outcomes.

## Other public repositories inspected

`BackendApp` and `Portoflio-` are public but currently empty, so they provide no project evidence: [BackendApp](https://github.com/Abdelrhman6200/BackendApp) and [Portoflio-](https://github.com/Abdelrhman6200/Portoflio-).

## Verified repository: question-template-fill

Source: `https://github.com/Abdelrhman6200/question-template-fill`

The repository contains a Vite + React + TypeScript application using the `vite_react_shadcn_ts` stack. Its commit history and file structure document a form for uploading questionnaire data and filling a provided template, optional student-picture upload, and report export to PowerPoint and PDF. The README identifies it as a Lovable project and links to the project workspace at `https://lovable.dev/projects/7458f672-2467-43e0-929a-137ce091c6d4`.

The repository page does not provide a deployed application URL. The portfolio should link to the GitHub repository and label the Lovable workspace separately rather than implying a public live demo.

The package manifest confirms `react-hook-form`, `zod`, `html2canvas`, `jspdf`, and `pptxgenjs` alongside React, TypeScript, Vite, Tailwind, and Radix UI packages. These dependencies support the documented form workflow and PDF/PowerPoint report generation without implying a backend service.

## Commit evidence

The public `CGF` repository currently shows no commit history on its `main` branch, so the case file should use repository and README evidence rather than a fabricated commit timeline: [CGF commits](https://github.com/Abdelrhman6200/CGF/commits/main).

The public `question-template-fill` history provides verifiable implementation milestones. It includes `Add download report option` (`e1de8cc`, Jul 17, 2025), `Make report one page landscape` (`85583e0`, Jul 17, 2025), `Implement report page separation and formats` (`f344ead`, Jul 18, 2025), `Implement report export and student picture.` (`e0e6284`, Jul 18, 2025), `Fix report export bugs` (`bb3a415`, Jul 19, 2025), and `Fix PowerPoint report design` (`33fbc6a`, Jul 19, 2025): [question-template-fill commits](https://github.com/Abdelrhman6200/question-template-fill/commits/main).
