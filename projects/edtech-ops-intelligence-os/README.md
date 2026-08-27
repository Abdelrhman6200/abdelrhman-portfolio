# EdTech Operations Intelligence OS

EdTech Operations Intelligence OS is a **Windows desktop command center** for operational teams responsible for learner progression, instructor capacity, session delivery, exceptions, KPI governance, data quality, and operating procedures. It is designed around visible records and attributed decisions rather than a generic chat interface.

The first release is intentionally **local-first**. It runs without external credentials and initializes a deterministic synthetic workspace that includes healthy performance, missing data, stale source conditions, learner risk, investigations, escalation states, and versioned SOPs. The desktop-process boundary is designed so a future Postgres, Microsoft 365, Power Automate, n8n, or Supabase adapter can replace the local store without moving business rules into the renderer.

## Included operating modules

| Module | Delivered capability |
|---|---|
| Control Tower | Cross-domain KPI cards, Recharts attendance trend, anomaly feed, data-health scorecard, and deterministic next-action queue |
| Student lifecycle | Enrollment records, cohort/program filtering, progress, attendance, risk, mentor context, validation, CSV import, and CSV export |
| Instructor overview | Instructor profile, specialty, availability, workload, performance rating, and incident-linked context |
| Session operations | Create, update, confirm, cancel, complete, log attendance, and record outcomes with enforced workflow transitions |
| Incident management | Log, triage, investigate, assign, escalate, resolve, attach root-cause notes, and retain an attributable history |
| KPI library | Governed definitions, owners, units, targets, warning thresholds, Recharts actual-vs-target display, and visible data definitions |
| Anomaly workspace | Threshold exceptions, drill-down context, evidence notes, root-cause capture, status workflow, and resolution control |
| Data quality | Completeness, accuracy, freshness, owner assignment, domain health visuals, and remediation issue context |
| SOP library | Searchable procedures, links to domains/incident types, active-version control, and version history/publishing |
| Saved analyses | Named analysis snapshots with scope, parameters, data range, result summary, and source/provenance references |
| Role activation | Per-role mandatory activation checklists with completion evidence, progress state, ownership, and audited reopening/completion |
| Decision queue | Assigned, due-dated operational actions with linked records, approval-ready state, priorities, and enforced workflow transitions |
| Follow-up log | Attributable email, phone, in-app, and meeting records with linked context and outcome states |
| Notification center | In-app approval prompts, source alerts, delivery state, audience, and response due date |
| Import center | Source registry, mapping template, duplicate policy, validation preview, import-run history, failed-row evidence, remediation recording, owner, and health state |
| Reporting center | Revisioned report definitions with scope, parameters, owner, scheduled-export readiness, live result snapshots, and attributable run history |
| Workspace settings | Change-audited thresholds, source expectations, retention references, and other operating values maintained outside code |
| Supportability | Backup/export readiness, integration-health checks, diagnostics, and privacy/support intake records |
| Organization governance | Workspace governance, team directory, role matrix, operating calendar, reference data, and accountable policy ownership |
| Integration control plane | Connector registry, credential and mapping readiness, required-target mapping validation, sync queue, retry policy, source lineage, attributable readiness history, and manual reconciliation records |
| Workflow automation | Governed triggers, conditions, actions, approval checkpoints, human override notes, audited run history, and stateful routed actions, notifications, and escalation incidents |
| Team handoffs | Linked internal notes, accountable handoffs, mentions, due context, and evidence metadata across operational records |
| Privacy and compliance | Consent/retention context, subject-request intake, access-review evidence, controlled fulfilment states, and review ownership |
| Capacity plans | Scenario assumptions, forecast, actual, variance, horizon, and ownership for operational planning reviews |
| Resilience | Backup/restore rehearsal, diagnostics, incident communications, recurring service-review controls, and evidence records |
| Release controls | Configuration checks, automated-test evidence, approval state, rollback plan, and desktop-release readiness |
| Security controls | Access, audit, retention, and monitoring controls with cadence, owner, evidence, and explicit audit-export evidence history |
| Dashboard composer and metric explorer | Governed dashboard audiences and widget composition plus saved evidence-led metric exploration with Recharts planning and target-to-actual visuals |
| Diagnostics bundles | Privacy-minimized runtime metadata bundles with generated bundle history and no raw learner or instructor data payload |
| Service reviews | Agenda-driven recurring reviews with accountable owner, decision outcomes, completion control, and audit evidence |
| Audit log | Append-only record of create, update, delete, import, export, role, reset, and SOP-version actions |

## Architecture

| Layer | Design |
|---|---|
| Electron main process | Local storage, input validation, authorization, status-transition checks, import/export, and append-only audit writes |
| Preload bridge | Minimal context-isolated IPC API; the UI has no direct Node.js or filesystem access |
| React renderer | Desktop-first operational workspaces, filters, Recharts visualizations, forms, drawer details, loading states, and error feedback |
| Local workspace store | Atomic JSON write under the Windows application data folder, making the demo persistent across app restarts |

The built-in desktop demo selector exercises four roles: **admin**, **manager**, **coordinator**, and **analyst**. Permissions are checked in the Electron main process. The renderer never creates, alters, or deletes audit events; audit writes use a cloned change payload, preserving previous events when related records are later changed or deleted.

## Run from source on Windows

Install Node.js 22 or later, then run the following from the project directory.

```bash
npm install
npm run desktop:dev
```

The first run creates the synthetic local workspace automatically. To reset it, use the in-app reset action when available or remove the desktop application's user-data file after closing the app.

## Build a Windows release

```bash
npm run desktop:package:win
```

> **Note:** this command calls `scripts/stage-desktop.mjs`, which is not present
> in this bundle. The pre-staged `desktop-app/` directory is included instead —
> its `electron/` contents are byte-identical to `electron/` at the project root.
> Restore the staging script, or stage `desktop-app/` by hand, before packaging.

The packaging command builds the renderer, stages only the files required by Electron, and produces a portable Windows executable under the configured release directory. The staged packaging approach excludes unrelated web-server dependencies, reducing the release footprint materially.

> Windows may display a SmartScreen prompt for an unsigned local build. This application has not been code-signed; an organization should sign the release executable before internal distribution.

## Validation and automated tests

```bash
npm run check
npm test
npm run desktop:build
```

The automated suite covers authentication cookie behavior plus EdTech-specific validation, role authorization, state transitions, session conflict detection, KPI/data-quality calculation rules, seeded risk and investigation conditions, follow-through actions, production-operations seed state, enterprise governance collections, privacy/release transitions, and append-only audit evidence. Manual acceptance checks should include creating and editing records, rejected status transitions, attempted updates as a lower-privilege role, CSV import duplicate handling, CSV export, incident/anomaly evidence capture, SOP version publishing, saved views, decision approval, controlled integration validation, controlled automation execution, privacy workflow ownership, release readiness review, and audit log visibility.

## Local data and privacy

The included dataset is **synthetic**. Do not use the demo store for real student personal information without a governed storage, retention, backup, access-control, and encryption strategy. The application avoids sending its local records to a hosted service in this release. Future integrations should use named adapters and server-controlled credentials rather than exposing access tokens to the renderer.

## Product completeness

`FEATURE_COMPLETENESS_AUDIT.md` and `ENTERPRISE_CAPABILITY_AUDIT.md` record the complete operating and enterprise capability models. The implemented expansion includes enterprise governance, controlled integrations and automation, collaboration, privacy operations, planning, resilience, and release controls. Production identity federation, managed connectors, encrypted shared storage, code signing, and organization-specific data governance remain infrastructure-dependent follow-on work; no connector is presented as live until the organization supplies approved credentials and infrastructure.

## Project commands

| Command | Purpose |
|---|---|
| `npm run desktop:dev` | Run the Windows Electron application against the local Vite renderer |
| `npm run desktop:build` | Build the production React renderer |
| `npm run desktop:package:win` | Stage a minimal desktop package and create a portable Windows release |
| `npm run check` | Run TypeScript checks |
| `npm test` | Run Vitest business-rule tests |
