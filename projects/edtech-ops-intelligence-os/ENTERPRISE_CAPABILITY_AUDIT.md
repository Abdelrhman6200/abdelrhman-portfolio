# Enterprise Capability Audit

## Purpose

This audit extends the existing local-first EdTech Operations Intelligence OS from a strong operational control tower into a comprehensive enterprise operating platform. It distinguishes capabilities that are available in the desktop release from the additional controls required to operate across teams, organizations, systems, and governed data flows.

## Capability Model

| Capability area | Enterprise requirement | Completion approach |
|---|---|---|
| Organization governance | Multiple workspaces, team directory, role matrix, term calendar, reference data, and policy ownership | Add governed organization records and workspace configuration views |
| Identity and access | Role review, access request, approval, session/device awareness, and least-privilege evidence | Extend access review register and security control tracking |
| Integrations | Source registry, readiness gating, mapping version, queued synchronization, retry policy, lineage, reconciliation, and error ownership | Add integration controls, sync runs, and source-level operations |
| Workflow automation | Trigger, condition, action, approval, escalation, override, and immutable run history | Add workflow definitions and execution records with human checkpoints |
| Collaboration | Internal case notes, mentions, handoffs, attachments metadata, decision assignments, and notification preferences | Add linked collaboration records and structured follow-up workflows |
| Compliance and privacy | Consent state, request intake, retention/legal hold, subject export/delete workflow, control evidence, and review schedule | Add privacy request and control register workflows |
| Planning and analytics | Dashboard composer, metric explorer, capacity plan, scenario assumptions, forecast, and plan-versus-actual review | Add planning and analytic asset records with attributable assumptions |
| Reliability and support | Service checks, backup/restore test, diagnostics capture, incident communications, post-incident review, and service review cadence | Add operational resilience records and support review artifacts |
| Release readiness | Configuration verification, structured test evidence, packaging checks, release notes, and rollback checklist | Add release readiness workspace and audit-backed sign-off |

## Deliberate Product Boundary

The desktop application remains **local-first**. Connector credentials, production synchronization, organization identity federation, cloud backups, actual email delivery, and scheduled background execution are represented through secure readiness and run-control workflows; they require customer-approved infrastructure and credentials before a real external connection can be activated. No live customer data or external communications are fabricated in the application.

## Implementation Priority

The next release should concentrate on governed organization administration, integration and automation control planes, collaboration/accountability, privacy/security operations, planning, and reliability/release controls. These capability groups complete the operational model while preserving the current append-only audit design and local persistence model.
