# PRD Implementation and Release Traceability

This document maps the supplied **EdTech Operations Intelligence** requirements to the completed local-first Windows desktop application. The product operates only on deterministic synthetic data by default. Important operational outputs remain inspectable, attributable, and safe to use without external credentials.

| PRD area | Implemented capability | Evidence and safety boundary |
|---|---|---|
| Canonical operations model | The persistent model and visible workspaces cover programs, cohorts, students, instructors, sessions, attendance records, cancellations, learner feedback, transcripts, versioned rubrics, evaluations, datasets, analyst runs, and business reviews. | Every mutation is performed in the Electron main process and adds an append-only audit event. Canonical review, evaluation, dataset, and analyst records cannot be deleted through the generic record API. |
| Governed dataset intake | The dataset workspace profiles student CSV input before commit, displaying source schema, normalized field mapping, duplicate count, missing-required-field count, lineage, and row outcomes. | A commit is blocked unless required canonical fields are mapped. Duplicate matching is retry-safe through email or name-and-cohort matching, and commit outcomes are retained with the dataset record. |
| Session evaluator | Evaluation preparation starts from a session and active rubric ID. It locates an authorized transcript, preserves the active rubric version, and creates only transcript-cited evidence records. | The application never produces an opaque score. It rejects preparation when no citable authorized transcript evidence exists. Prepared evaluation evidence, transcript linkage, and rubric version are immutable; human calibration can approve or return the evaluation. |
| Grounded analyst | The analyst workspace accepts a question and explicit authorized scope, then records the source IDs, observed facts, interpretation state, hypotheses, limitations, and recommendation in an evidence-first drawer. | The configured provider identity is `local-qwen-3.5-9b`. Without a local provider, the deterministic handler records `safe_failure`, clearly states that no model interpretation occurred, and does not fabricate an AI answer. Analyst runs are read-only. |
| Canonical business review | Reviews are generated from published KPI definitions and their latest actuals, with linked active follow-through actions, findings, approval state, and provenance. | Metric inputs and generated findings are immutable after creation. Approval is explicit and auditable; the review drawer shows canonical actual-versus-target values and linked action states. |
| Access and durability | Desktop authorization enforces administrator, manager, coordinator, and analyst boundaries. The renderer is context-isolated and the state store uses atomic JSON writes. | Analyst roles can request the read-only safe-failure workflow but do not receive generic analyst-record mutation permission. Role checks are repeated by the main process, not trusted to the UI. |

## Verified Release Evidence

| Check | Result |
|---|---|
| TypeScript verification | `pnpm check` completed with no errors. |
| Automated business-rule tests | `pnpm test` completed with **20 passing tests**, including canonical record, workflow-transition, authorization, dataset, evaluation, analyst safe-failure, and hostile-mutation coverage. |
| Desktop-process syntax | `electron/main.cjs`, `electron/preload.cjs`, and `electron/analyst.cjs` passed syntax checks. |
| Production renderer | `pnpm desktop:build` completed successfully. |
| Windows archive | `EdTech-Operations-Intelligence-OS-win-x64.zip` was integrity-tested with `unzip -t`; it contains the unpacked Windows executable, `app.asar`, the new analyst module, and the production renderer bundle. |

## Non-Negotiable Implementation Boundaries

> Local inference is intentionally a provider abstraction. The application does not synthesize a result when a local Qwen provider is unavailable; it records an explicit `safe_failure` with its permitted evidence and limitations.

Live SIS/LMS synchronization and Windows code signing require organization-owned endpoints, credentials, certificates, and an appropriate Windows deployment environment. The application exposes offline-safe readiness, validation, reconciliation, and audit controls but does not activate a live connector or claim signed-binary status without those organization-supplied materials.
