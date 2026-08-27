import { describe, expect, it } from "vitest";

const { appendAudit } = require("../electron/audit.cjs");
const { isTransitionAllowed, validateInput } = require("../electron/rules.cjs");
const { createSeedState } = require("../electron/seed.cjs");
const { canMutate } = require("../electron/authorization.cjs");
const { findSessionConflicts } = require("../electron/scheduling.cjs");
const { publishSopVersion } = require("../electron/sop.cjs");
const { averageQuality, kpiStatus } = require("../electron/metrics.cjs");
const { buildReportSnapshot } = require("../electron/reporting.cjs");
const { buildImportRun, buildValidationPreview } = require("../electron/importTracking.cjs");
const { buildIntegrationReadinessCheck, buildAutomationRun, buildAutomationEffects, validateMappingDefinition } = require("../electron/enterprise.cjs");
const { buildSafeFailureAnalystRun } = require("../electron/analyst.cjs");
const { genericMutationError } = require("../electron/workflowPolicy.cjs");
const { buildGuardedSyncRun, validateCredentialReference } = require("../electron/connectorPolicy.cjs");

describe("EdTech desktop domain controls", () => {
  it("enforces explicit lifecycle transitions", () => {
    expect(isTransitionAllowed("sessions", "planned", "confirmed")).toBe(true);
    expect(isTransitionAllowed("sessions", "planned", "completed")).toBe(false);
    expect(isTransitionAllowed("incidents", "triaged", "escalated")).toBe(true);
    expect(isTransitionAllowed("anomalies", "resolved", "investigating")).toBe(false);
  });

  it("rejects incomplete or invalid operational input", () => {
    expect(() => validateInput("students", { name: "Ada", cohort: "Autumn 2026", status: "active" })).toThrow("program");
    expect(() => validateInput("kpis", { name: "Attendance", domain: "Students", unit: "%", target: -1, owner: "Maya" })).toThrow("target");
    expect(validateInput("incidents", { title: "Access issue", type: "platform", severity: "medium", status: "new", description: "Learner cannot access lab." })).toBe(true);
  });

  it("appends immutable audit evidence without modifying preceding audit events", () => {
    const state = { currentUser: { id: "u-1", name: "Maya", role: "manager" }, audit: [{ id: "audit-old", summary: "Earlier event", changes: { before: true } }] };
    const originalEvent = state.audit[0];
    const sourceChanges = { status: "resolved" };
    const event = appendAudit(state, { action: "UPDATED", entityType: "incidents", entityId: "inc-1", summary: "Resolved incident", changes: sourceChanges }, { createId: (prefix: string) => `${prefix}-new`, now: () => "2026-08-15T00:00:00.000Z" });
    sourceChanges.status = "tampered";
    expect(state.audit).toHaveLength(2);
    expect(state.audit[1]).toBe(originalEvent);
    expect(event.changes).toEqual({ status: "resolved" });
    expect(event.userName).toBe("Maya");
  });

  it("seeds a demonstrable operations workspace with traceable edge cases", () => {
    const state = createSeedState();
    expect(state.students.some((student: any) => student.status === "at_risk")).toBe(true);
    expect(state.anomalies.some((anomaly: any) => anomaly.status === "investigating")).toBe(true);
    expect(state.sops.some((sop: any) => sop.versions.length > 1)).toBe(true);
    expect(state.audit.length).toBeGreaterThan(0);
  });

  it("enforces role-aware mutation permissions", () => {
    expect(canMutate("analyst", "kpis")).toBe(true);
    expect(canMutate("analyst", "students")).toBe(false);
    expect(canMutate("coordinator", "sessions")).toBe(true);
    expect(canMutate("coordinator", "sops")).toBe(false);
  });

  it("detects overlapping instructor, room, and learner scheduling conflicts", () => {
    const scheduled = [{ id: "ses-1", title: "SQL Lab", instructorId: "ins-1", room: "Lab A", studentIds: ["stu-1"], startAt: "2026-08-16T10:00:00.000Z", duration: 90, status: "confirmed" }];
    expect(findSessionConflicts(scheduled, { instructorId: "ins-1", room: "Lab B", studentIds: [], startAt: "2026-08-16T10:30:00.000Z", duration: 45, status: "planned" })).toHaveLength(1);
    expect(findSessionConflicts(scheduled, { instructorId: "ins-2", room: "Lab B", studentIds: ["stu-1"], startAt: "2026-08-16T10:30:00.000Z", duration: 45, status: "planned" })).toHaveLength(1);
    expect(findSessionConflicts(scheduled, { instructorId: "ins-2", room: "Lab B", studentIds: [], startAt: "2026-08-16T12:00:00.000Z", duration: 45, status: "planned" })).toHaveLength(0);
  });

  it("publishes immutable SOP versions and calculates governed health states", () => {
    const sop = { versions: [{ version: 1, body: "Initial", summary: "Initial", createdAt: "2026-08-01T00:00:00.000Z", createdBy: "Maya" }], activeVersion: 1 };
    const version = publishSopVersion(sop, { body: "Revised procedure", summary: "Escalation control" }, "Maya", () => "2026-08-15T00:00:00.000Z");
    expect(version.version).toBe(2);
    expect(sop.activeVersion).toBe(2);
    expect(averageQuality({ completeness: 90, accuracy: 96, freshness: 84 })).toBe(90);
    expect(kpiStatus({ target: 90, warningThreshold: 82, actuals: [{ value: 84 }] })).toBe("watch");
  });

  it("supports accountable follow-through and production operations workspace data", () => {
    const state = createSeedState();
    expect(isTransitionAllowed("actions", "assigned", "in_progress")).toBe(true);
    expect(isTransitionAllowed("actions", "completed", "in_progress")).toBe(false);
    expect(state.actions.some((action: any) => action.decisionRequired)).toBe(true);
    expect(state.notifications.some((notification: any) => notification.status === "unread")).toBe(true);
    expect(state.imports.some((source: any) => source.mappingTemplate)).toBe(true);
    expect(state.reports.some((report: any) => report.status === "ready")).toBe(true);
    expect(state.configRecords.some((entry: any) => entry.category === "Threshold governance")).toBe(true);
    expect(state.support.some((check: any) => check.category === "Backup and recovery")).toBe(true);
  });

  it("keeps governance configuration restricted while allowing analyst action follow-through", () => {
    expect(canMutate("analyst", "actions")).toBe(true);
    expect(canMutate("analyst", "configRecords")).toBe(false);
    expect(canMutate("coordinator", "communications")).toBe(true);
    expect(canMutate("coordinator", "support")).toBe(false);
  });

  it("seeds activation, integration, report execution, and import remediation controls", () => {
    const state = createSeedState();
    const managerChecklist = state.onboarding.find((checklist: any) => checklist.role === "manager");
    expect(managerChecklist.items.some((item: any) => item.required && !item.completed)).toBe(true);
    expect(state.configRecords.some((entry: any) => entry.category === "Integration readiness")).toBe(true);
    expect(state.reports.some((report: any) => report.schedule && report.snapshots?.length)).toBe(true);
    expect(state.reports.some((report: any) => report.runHistory?.every((run: any) => run.definitionRevision))).toBe(true);
    expect(state.imports.some((source: any) => source.runs?.some((run: any) => run.status === "validation_failed"))).toBe(true);
    expect(canMutate("coordinator", "onboarding")).toBe(true);
    expect(canMutate("analyst", "onboarding")).toBe(false);
  });

  it("builds reproducible report snapshots from the current workspace result set", () => {
    const state = createSeedState();
    const report = state.reports.find((entry: any) => entry.id === "rep-weekly");
    const snapshot = buildReportSnapshot(report, state, { createId: (prefix: string) => `${prefix}-test`, now: () => "2026-08-15T10:00:00.000Z" });
    expect(snapshot.id).toBe("snapshot-test");
    expect(snapshot.parameters).toBe(report.parameters);
    expect(snapshot.definition).toBe(report.definition);
    expect(snapshot.definitionRevision).toBe(report.definitionRevision);
    expect(snapshot.rowCount).toBeGreaterThan(0);
    expect(snapshot.resultRows.some((row: any) => row.entity === "students")).toBe(true);
  });

  it("creates validation-preview and row-outcome evidence for each student import run", () => {
    const preview = buildValidationPreview(["name", "email", "cohort", "program"]);
    expect(preview.every((entry: any) => entry.status === "mapped")).toBe(true);
    const run = buildImportRun({ id: "run-test", now: "2026-08-15T10:00:00.000Z", columns: ["name", "cohort", "program"], outcomes: [{ row: 2, status: "created", message: "Created" }, { row: 3, status: "duplicate", message: "Duplicate" }, { row: 4, status: "failed", message: "Missing program" }] });
    expect(run.status).toBe("completed_with_errors");
    expect(run.created).toBe(1);
    expect(run.duplicates).toBe(1);
    expect(run.failed).toBe(1);
    expect(run.remediationStatus).toBe("required");
  });

  it("seeds governed enterprise controls and applies role boundaries", () => {
    const state = createSeedState();
    expect(state.organizationSettings).toHaveLength(1);
    expect(state.integrations.some((record: any) => record.system === "SIS" && Array.isArray(record.syncRuns))).toBe(true);
    expect(state.automations.some((record: any) => record.approvalRequired && record.status === "active")).toBe(true);
    expect(state.privacy.some((record: any) => record.requestType === "retention_review")).toBe(true);
    expect(state.plans.some((record: any) => record.forecast && record.actual)).toBe(true);
    expect(state.resilience.some((record: any) => record.control === "Backup/restore readiness")).toBe(true);
    expect(state.releases.some((record: any) => record.rollbackPlan)).toBe(true);
    expect(state.reconciliations.some((record: any) => record.integrationId && record.proposedResolution)).toBe(true);
    expect(state.securityControls.some((record: any) => record.domain && Array.isArray(record.auditExports))).toBe(true);
    expect(state.dashboards.some((record: any) => record.widgets?.length)).toBe(true);
    expect(state.explorations.some((record: any) => record.metric && record.insight)).toBe(true);
    expect(state.diagnostics.some((record: any) => record.summary)).toBe(true);
    expect(state.serviceReviews.some((record: any) => record.agenda && record.period)).toBe(true);
    expect(canMutate("manager", "integrations")).toBe(true);
    expect(canMutate("coordinator", "integrations")).toBe(false);
    expect(canMutate("analyst", "plans")).toBe(true);
  });

  it("validates enterprise records and preserves privacy and release transitions", () => {
    expect(validateInput("integrations", { name: "SIS", system: "SIS", status: "draft", owner: "Maya" })).toBe(true);
    expect(validateInput("privacy", { title: "Export", requestType: "export_request", status: "received", owner: "Maya" })).toBe(true);
    expect(() => validateInput("releases", { name: "Desktop", version: "1.2.0", status: "draft" })).toThrow("owner");
    expect(isTransitionAllowed("privacy", "verifying", "fulfilling")).toBe(true);
    expect(isTransitionAllowed("privacy", "closed", "fulfilling")).toBe(false);
    expect(isTransitionAllowed("releases", "ready_for_review", "approved")).toBe(true);
    expect(isTransitionAllowed("releases", "released", "draft")).toBe(false);
  });

  it("creates attributable integration readiness and automation execution evidence", () => {
    const createId = (prefix: string) => `${prefix}-test`;
    const now = () => "2026-08-15T12:00:00.000Z";
    const incomplete = buildIntegrationReadinessCheck({ credentialsConfigured: "false", mappingApproved: "true" }, { createId, now });
    const ready = buildIntegrationReadinessCheck({ credentialsConfigured: true, mappingApproved: true }, { createId, now });
    expect(incomplete.status).toBe("attention");
    expect(ready.status).toBe("attention");
    const mapped = buildIntegrationReadinessCheck({ system: "SIS", credentialsConfigured: true, credentialRef: "keychain://SIS_SERVICE_ACCOUNT", offlineSafe: true, mappingApproved: true, mappingDefinition: { targets: ["student.name", "student.email", "student.cohort"] } }, { createId, now });
    expect(mapped.status).toBe("ready");
    expect(validateMappingDefinition({ mappingDefinition: { targets: ["student.name"] } }).missingTargets).toEqual(["student.email", "student.cohort"]);
    expect(validateCredentialReference("plain-text-token").valid).toBe(false);
    const guarded = buildGuardedSyncRun({ system: "LMS", credentialsConfigured: true, credentialRef: "env://LMS_TOKEN", offlineSafe: true, syncMode: "offline_safe", mappingApproved: true, mappingDefinition: { targets: ["student.name", "student.email", "student.cohort"] } }, { createId, now, executedBy: "Maya" });
    expect(guarded.status).toBe("offline_safe");
    expect(guarded.evidence).toContain("No network call");
    const run = buildAutomationRun({ status: "active", approvalRequired: true, trigger: "Threshold breach", actions: ["Create action"] }, { createId, now, executedBy: "Maya", overrideNote: "Manager review." });
    expect(run.status).toBe("awaiting_approval");
    expect(run.executedBy).toBe("Maya");
    expect(() => buildAutomationRun({ status: "paused" }, { createId, now, executedBy: "Maya" })).toThrow("Only active");
    const effects = buildAutomationEffects({ id: "auto-1", name: "Attendance routing", trigger: "KPI breach", condition: "Below target", approvalRequired: true, escalationRule: "Escalate after 24h" }, { createId, now, owner: "Maya" });
    expect(effects.action.linkedId).toBe("auto-1");
    expect(effects.notification.audience).toBe("Maya");
    expect(effects.incident?.status).toBe("new");
  });

  it("seeds PRD canonical records with evidence, rubric versions, and review provenance", () => {
    const state = createSeedState();
    expect(state.programs.some((record: any) => record.deliveryModel)).toBe(true);
    expect(state.cohorts.some((record: any) => record.programId)).toBe(true);
    expect(state.attendanceRecords.some((record: any) => record.studentId && record.sessionId)).toBe(true);
    expect(state.cancellations.some((record: any) => record.reason)).toBe(true);
    expect(state.feedback.some((record: any) => record.evidence)).toBe(true);
    expect(state.transcripts.some((record: any) => record.permittedForEvaluation)).toBe(true);
    expect(state.rubrics.some((record: any) => record.activeVersion && record.versions?.[0]?.criteria?.length)).toBe(true);
    expect(state.evaluations.some((record: any) => record.transcriptId && record.evidence?.every((item: any) => item.sourceId))).toBe(true);
    expect(state.datasets.some((record: any) => record.profile && record.mapping)).toBe(true);
    expect(state.businessReviews.some((record: any) => record.metricSources?.length && record.canonicalMetrics?.length)).toBe(true);
    expect(state.analystRuns.some((record: any) => record.sourceIds?.length && record.limitations?.length)).toBe(true);
  });

  it("enforces governed PRD workflow transitions and permissions", () => {
    expect(isTransitionAllowed("datasets", "profiled", "mapping_ready")).toBe(true);
    expect(isTransitionAllowed("datasets", "committed", "profiled")).toBe(false);
    expect(isTransitionAllowed("evaluations", "pending_calibration", "approved")).toBe(true);
    expect(isTransitionAllowed("businessReviews", "awaiting_approval", "published")).toBe(true);
    expect(validateInput("datasets", { name: "Roster", sourceType: "CSV", status: "draft", owner: "Maya" })).toBe(true);
    expect(validateInput("evaluations", { sessionId: "ses-1", rubricId: "rubric-1", rubricVersion: 1, status: "draft", owner: "Maya" })).toBe(true);
    expect(canMutate("coordinator", "evaluations")).toBe(true);
    expect(canMutate("analyst", "students")).toBe(false);
  });

  it("records a bounded grounded analyst safe-failure without fabricating a model response", () => {
    const state = createSeedState();
    const run = buildSafeFailureAnalystRun({ question: "What should the team do about attendance?", scope: "Autumn Data Analytics", state, createId: (prefix: string) => `${prefix}-test`, now: () => "2026-08-15T13:00:00.000Z", requestedBy: "Maya" });
    expect(run.status).toBe("safe_failure");
    expect(run.provider).toBe("local-qwen-3.5-9b");
    expect(run.sourceIds.length).toBeGreaterThan(0);
    expect(run.observedFacts.length).toBeGreaterThan(0);
    expect(run.interpretation).toContain("No model interpretation");
    expect(run.limitations.some((item: string) => item.includes("not configured"))).toBe(true);
    expect(canMutate("analyst", "analystRuns")).toBe(false);
  });

  it("blocks hostile generic mutations of governed PRD history while allowing human approval fields", () => {
    expect(genericMutationError("analystRuns", "create")).toContain("governed workflow");
    expect(genericMutationError("analystRuns", "update", { recommendation: "tamper" })).toContain("read-only");
    expect(genericMutationError("datasets", "delete")).toContain("cannot be deleted");
    expect(genericMutationError("evaluations", "update", { evidence: [] })).toContain("immutable");
    expect(genericMutationError("evaluations", "update", { status: "approved", calibratedBy: "Maya" })).toBeNull();
    expect(genericMutationError("businessReviews", "update", { canonicalMetrics: [] })).toContain("immutable");
    expect(genericMutationError("businessReviews", "update", { status: "published", approvedBy: "Maya" })).toBeNull();
  });
});
