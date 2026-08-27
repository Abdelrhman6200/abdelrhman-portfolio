const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const { createSeedState, createId, isoNow, normalizeState } = require("./seed.cjs");
const { validateInput, isTransitionAllowed } = require("./rules.cjs");
const { appendAudit } = require("./audit.cjs");
const { canMutate } = require("./authorization.cjs");
const { assertNoSessionConflicts } = require("./scheduling.cjs");
const { publishSopVersion } = require("./sop.cjs");
const { buildReportSnapshot } = require("./reporting.cjs");
const { buildImportRun } = require("./importTracking.cjs");
const { buildIntegrationReadinessCheck, buildAutomationRun, buildAutomationEffects } = require("./enterprise.cjs");
const { buildSafeFailureAnalystRun } = require("./analyst.cjs");
const { genericMutationError } = require("./workflowPolicy.cjs");
const { buildGuardedSyncRun, validateCredentialReference } = require("./connectorPolicy.cjs");

let mainWindow;
const DEV_URL = process.env.ELECTRON_RENDERER_URL || "http://127.0.0.1:5173";

function storagePath() {
  return path.join(app.getPath("userData"), "edtech-ops-state.json");
}

function readState() {
  const target = storagePath();
  if (!fs.existsSync(target)) return createSeedState();
  try {
    return normalizeState(JSON.parse(fs.readFileSync(target, "utf8")));
  } catch (error) {
    console.error("[desktop-store] Could not read persisted state", error);
    return createSeedState();
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(storagePath()), { recursive: true });
  const temporary = `${storagePath()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(state, null, 2), "utf8");
  fs.renameSync(temporary, storagePath());
}

let state;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validEntity(entity) {
  return ["students", "instructors", "sessions", "incidents", "kpis", "anomalies", "quality", "sops", "analyses", "onboarding", "actions", "notifications", "communications", "imports", "reports", "configRecords", "support", "organizationSettings", "integrations", "automations", "collaboration", "privacy", "plans", "resilience", "releases", "reconciliations", "securityControls", "dashboards", "explorations", "diagnostics", "serviceReviews", "programs", "cohorts", "attendanceRecords", "cancellations", "feedback", "transcripts", "rubrics", "evaluations", "datasets", "analystRuns", "businessReviews"].includes(entity);
}

function assertAuthorized(entity, action) {
  const user = state.currentUser;
  if (!user) throw new Error("A signed-in desktop profile is required.");
  if (action === "read") return;
  if (!canMutate(user.role, entity)) {
    throw new Error(`${user.role} does not have permission to modify ${entity}.`);
  }
}

function audit(draft, { action, entityType, entityId, summary, changes, correlationId }) {
  return appendAudit(draft, { action, entityType, entityId, summary, changes, correlationId }, { createId, now: isoNow });
}

function mutate(metadata, operation) {
  const draft = deepClone(state);
  const result = operation(draft);
  audit(draft, metadata(result, draft));
  state = normalizeState(draft);
  writeState(state);
  return result;
}

function findRecord(draft, entity, id) {
  const record = draft[entity]?.find((item) => item.id === id);
  if (!record) throw new Error(`${entity.slice(0, -1)} not found.`);
  return record;
}

function validateRecord(entity, record) {
  validateInput(entity, record);
  const required = {
    students: ["name", "cohort", "program", "status"],
    instructors: ["name", "specialty", "status"],
    sessions: ["title", "course", "instructorId", "startAt", "status"],
    incidents: ["title", "type", "severity", "status", "description"],
    kpis: ["name", "domain", "unit", "target", "owner"],
    anomalies: ["title", "domain", "metric", "severity", "status"],
    quality: ["domain", "completeness", "accuracy", "freshness"],
    sops: ["title", "domain"],
    analyses: ["name", "scope", "summary"],
    onboarding: ["title", "role", "status"],
    actions: ["title", "owner", "dueAt", "status"],
    notifications: ["title", "channel", "status"],
    communications: ["subject", "channel", "owner", "outcome"],
    imports: ["name", "sourceType", "status"],
    reports: ["name", "scope", "status"],
    configRecords: ["key", "category", "value", "status"],
    support: ["title", "category", "status"],
  };
  const missing = (required[entity] || []).filter((key) => record[key] === undefined || record[key] === null || record[key] === "");
  if (missing.length) throw new Error(`Required fields missing: ${missing.join(", ")}.`);
  ["progress", "attendance", "rating", "sessionLoad", "completeness", "accuracy", "freshness", "target", "warningThreshold"].forEach((field) => {
    if (record[field] !== undefined && (Number.isNaN(Number(record[field])) || Number(record[field]) < 0)) {
      throw new Error(`${field} must be a non-negative number.`);
    }
  });
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("The CSV must include a header and at least one data row.");
  const columns = lines[0].split(",").map((item) => item.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((item) => item.trim());
    return Object.fromEntries(columns.map((column, index) => [column, cells[index] || ""]));
  });
  return { columns, rows };
}

function profileStudentDataset(columns, rows) {
  const aliases = { name: "name", student_name: "name", email: "email", student_email: "email", cohort: "cohort", program: "program", status: "status", progress: "progress", attendance: "attendance", risk: "risk", mentor: "mentor" };
  const mapping = Object.fromEntries(columns.filter((column) => aliases[column.toLowerCase()]).map((column) => [column, `student.${aliases[column.toLowerCase()]}`]));
  const missingRequired = ["name", "cohort", "program"].filter((field) => !Object.values(mapping).includes(`student.${field}`));
  const duplicateRows = rows.reduce((total, row, index) => total + rows.slice(0, index).some((prior) => row.email && prior.email === row.email) ? 1 : total, 0);
  return { mapping, missingRequired, duplicateRows, rows: rows.length, profileStatus: missingRequired.length ? "attention" : "mapping_ready" };
}

function studentCandidate(row) {
  return { name: row.name || row.student_name || "", cohort: row.cohort || "", program: row.program || "", status: row.status || "active", progress: Number(row.progress || 0), attendance: Number(row.attendance || 0), risk: row.risk || "low", mentor: row.mentor || "Unassigned", email: row.email || row.student_email || "" };
}

function registerHandlers() {
  ipcMain.handle("ops:get-state", () => state);
  ipcMain.handle("ops:change-role", (_event, role) => {
    if (!["admin", "manager", "coordinator", "analyst"].includes(role)) throw new Error("Unsupported role.");
    return mutate(
      () => ({ action: "ROLE_CHANGED", entityType: "desktop_profile", entityId: state.currentUser.id, summary: `Desktop role switched to ${role}`, changes: { role } }),
      (draft) => {
        draft.currentUser.role = role;
        return draft.currentUser;
      },
    );
  });
  ipcMain.handle("ops:create", (_event, entity, payload) => {
    if (!validEntity(entity)) throw new Error("Unsupported domain entity.");
    const policyError = genericMutationError(entity, "create", payload); if (policyError) throw new Error(policyError);
    if (entity === "integrations" && Object.keys(payload || {}).some((key) => /token|secret|password|api.?key/i.test(key))) throw new Error("Raw connector credentials are not accepted. Store an approved keychain:// or env:// credential reference instead.");
    if (entity === "integrations" && payload.credentialRef && !validateCredentialReference(payload.credentialRef).valid) throw new Error("Connector credential references must use keychain:// or env:// notation.");
    assertAuthorized(entity, "create");
    validateRecord(entity, payload);
    return mutate(
      (record) => ({ action: "CREATED", entityType: entity, entityId: record.id, summary: `Created ${entity.slice(0, -1)}: ${record.name || record.title || record.domain}`, changes: record }),
      (draft) => {
        const record = { ...payload, id: createId(entity.slice(0, -1)), createdAt: isoNow(), updatedAt: isoNow() };
        if (entity === "reports") record.definitionRevision = 1;
        if (entity === "sessions") assertNoSessionConflicts(draft.sessions, record);
        if (entity === "sops" && !record.versions) record.versions = [{ version: 1, body: record.body || "", createdAt: record.createdAt, createdBy: draft.currentUser.name, summary: "Initial version" }];
        if (entity === "sops") record.activeVersion = record.versions.length;
        draft[entity].unshift(record);
        return record;
      },
    );
  });
  ipcMain.handle("ops:update", (_event, entity, id, patch) => {
    if (!validEntity(entity)) throw new Error("Unsupported domain entity.");
    const policyError = genericMutationError(entity, "update", patch); if (policyError) throw new Error(policyError);
    if (entity === "integrations" && Object.keys(patch || {}).some((key) => /token|secret|password|api.?key/i.test(key))) throw new Error("Raw connector credentials are not accepted. Store an approved keychain:// or env:// credential reference instead.");
    if (entity === "integrations" && patch.credentialRef && !validateCredentialReference(patch.credentialRef).valid) throw new Error("Connector credential references must use keychain:// or env:// notation.");
    assertAuthorized(entity, "update");
    return mutate(
      (record) => ({ action: "UPDATED", entityType: entity, entityId: id, summary: `Updated ${entity.slice(0, -1)}: ${record.name || record.title || record.domain}`, changes: patch }),
      (draft) => {
        const record = findRecord(draft, entity, id);
        if (patch.status && ["sessions", "incidents", "anomalies", "actions", "privacy", "releases", "reconciliations", "securityControls", "datasets", "evaluations", "businessReviews"].includes(entity) && !isTransitionAllowed(entity, record.status, patch.status)) {
          throw new Error(`Invalid ${entity.slice(0, -1)} transition from ${record.status} to ${patch.status}.`);
        }
        const updated = { ...record, ...patch, updatedAt: isoNow() };
        if (entity === "reports" && ["definition", "parameters", "scope"].some((key) => patch[key] !== undefined && patch[key] !== record[key])) {
          updated.definitionRevision = Number(record.definitionRevision || 1) + 1;
        }
        if (entity === "sessions") assertNoSessionConflicts(draft.sessions, updated, id);
        validateRecord(entity, updated);
        Object.assign(record, updated);
        return record;
      },
    );
  });
  ipcMain.handle("ops:delete", (_event, entity, id) => {
    if (!validEntity(entity)) throw new Error("Unsupported domain entity.");
    const policyError = genericMutationError(entity, "delete"); if (policyError) throw new Error(policyError);
    assertAuthorized(entity, "delete");
    return mutate(
      (record) => ({ action: "DELETED", entityType: entity, entityId: id, summary: `Deleted ${entity.slice(0, -1)}: ${record.name || record.title || record.domain}`, changes: { deletedRecord: record } }),
      (draft) => {
        const record = findRecord(draft, entity, id);
        draft[entity] = draft[entity].filter((item) => item.id !== id);
        return record;
      },
    );
  });
  ipcMain.handle("ops:add-sop-version", (_event, id, payload) => {
    assertAuthorized("sops", "update");
    if (!payload?.body?.trim()) throw new Error("A version body is required.");
    return mutate(
      (record) => ({ action: "SOP_VERSION_PUBLISHED", entityType: "sops", entityId: id, summary: `Published SOP version ${record.activeVersion} for ${record.title}`, changes: { version: record.activeVersion, summary: payload.summary || "" } }),
      (draft) => {
        const record = findRecord(draft, "sops", id);
        publishSopVersion(record, payload, draft.currentUser.name, isoNow);
        return record;
      },
    );
  });
  ipcMain.handle("ops:validate-integration", (_event, id) => {
    assertAuthorized("integrations", "update");
    return mutate(
      (result) => ({ action: "INTEGRATION_READINESS_VALIDATED", entityType: "integrations", entityId: id, summary: `Validated connector readiness for ${result.record.name}`, changes: { readiness: result.record.readiness, checkedAt: result.record.checkedAt, reconciliationId: result.reconciliation?.id || null } }),
      (draft) => { const record = findRecord(draft, "integrations", id); const check = buildIntegrationReadinessCheck(record, { createId, now: isoNow }); let reconciliation = null; if (check.status !== "ready") { const existing = (draft.reconciliations || []).find((item) => item.integrationId === id && !["resolved", "cancelled"].includes(item.status)); reconciliation = existing || { id: createId("reconciliation"), title: `${record.name} validation reconciliation`, integrationId: id, sourceRunId: check.id, status: "open", owner: record.owner || draft.currentUser.name, issue: check.evidence, proposedResolution: "Review mapping targets and connector credential readiness; validate again after correction.", createdAt: check.checkedAt, evidence: [check] }; if (!existing) draft.reconciliations.unshift(reconciliation); else { reconciliation.evidence = [check, ...(reconciliation.evidence || [])]; reconciliation.updatedAt = check.checkedAt; } check.reconciliationId = reconciliation.id; } record.syncRuns = [check, ...(record.syncRuns || [])]; record.syncQueue = (record.syncQueue || []).map((item) => item.status === "pending" ? { ...item, status: check.status === "ready" ? "completed" : "attention", completedAt: check.checkedAt, result: check.evidence, reconciliationId: reconciliation?.id || null } : item); record.readiness = check.status; record.checkedAt = check.checkedAt; record.updatedAt = check.checkedAt; return { record, reconciliation }; },
    );
  });
  ipcMain.handle("ops:resolve-reconciliation", (_event, id, resolution) => {
    assertAuthorized("reconciliations", "update");
    if (!String(resolution || "").trim()) throw new Error("Resolution evidence is required.");
    return mutate(
      (result) => ({ action: "RECONCILIATION_RESOLVED", entityType: "reconciliations", entityId: id, summary: `Resolved integration reconciliation ${result.record.title}`, changes: { resolution: result.record.resolution } }),
      (draft) => { const record = findRecord(draft, "reconciliations", id); if (!isTransitionAllowed("reconciliations", record.status, "resolved")) throw new Error(`Reconciliation cannot be resolved from ${record.status}.`); record.status = "resolved"; record.resolution = String(resolution).trim(); record.resolvedAt = isoNow(); record.resolvedBy = draft.currentUser.name; record.updatedAt = record.resolvedAt; return { record }; },
    );
  });
  ipcMain.handle("ops:queue-integration-sync", (_event, id) => {
    assertAuthorized("integrations", "update");
    return mutate(
      (result) => ({ action: "INTEGRATION_SYNC_QUEUED", entityType: "integrations", entityId: id, summary: `Queued governed readiness work for ${result.record.name}`, changes: { queueItem: result.queueItem } }),
      (draft) => { const record = findRecord(draft, "integrations", id); const queueItem = { id: createId("sync-queue"), enqueuedAt: isoNow(), status: "pending", purpose: "Validate credentials, mapping approval, lineage, and retry policy", requestedBy: draft.currentUser.name }; record.syncQueue = [queueItem, ...(record.syncQueue || [])]; record.updatedAt = queueItem.enqueuedAt; return { record, queueItem }; },
    );
  });
  ipcMain.handle("ops:run-guarded-integration-sync", (_event, id) => {
    assertAuthorized("integrations", "update");
    return mutate(
      (result) => ({ action: "INTEGRATION_GUARDED_SYNC_RECORDED", entityType: "integrations", entityId: id, summary: `Recorded ${result.run.status} governed connector sync for ${result.record.name}`, changes: { run: result.run, reconciliationId: result.reconciliation?.id || null } }),
      (draft) => { const record = findRecord(draft, "integrations", id); const run = buildGuardedSyncRun(record, { createId, now: isoNow, executedBy: draft.currentUser.name }); let reconciliation = null; if (run.status === "blocked") { reconciliation = (draft.reconciliations || []).find((item) => item.integrationId === id && !["resolved", "cancelled"].includes(item.status)); if (!reconciliation) { reconciliation = { id: createId("reconciliation"), title: `${record.name} guarded sync reconciliation`, integrationId: id, sourceRunId: run.id, status: "open", owner: record.owner || draft.currentUser.name, issue: run.evidence, proposedResolution: "Configure an approved credential reference, canonical mapping, and offline-safe connector policy before repeating validation.", createdAt: run.checkedAt, evidence: [] }; draft.reconciliations.unshift(reconciliation); } reconciliation.evidence = [run, ...(reconciliation.evidence || [])]; reconciliation.updatedAt = run.checkedAt; } record.syncRuns = [run, ...(record.syncRuns || [])]; record.updatedAt = run.checkedAt; return { record, run, reconciliation }; },
    );
  });
  ipcMain.handle("ops:run-automation", (_event, id, overrideNote = "") => {
    assertAuthorized("automations", "update");
    return mutate(
      (result) => ({ action: "AUTOMATION_RUN_RECORDED", entityType: "automations", entityId: id, summary: `Executed controlled automation for ${result.record.name} and routed follow-through`, changes: { run: result.run, effects: result.effects } }),
      (draft) => { const record = findRecord(draft, "automations", id); const run = buildAutomationRun(record, { createId, now: isoNow, executedBy: draft.currentUser.name, overrideNote }); const effects = buildAutomationEffects(record, { createId, now: isoNow, owner: record.owner || draft.currentUser.name }); draft.actions.unshift(effects.action); draft.notifications.unshift(effects.notification); if (effects.incident) draft.incidents.unshift(effects.incident); run.effects = { actionId: effects.action.id, notificationId: effects.notification.id, incidentId: effects.incident?.id || null }; record.runs = [run, ...(record.runs || [])]; record.updatedAt = run.startedAt; return { record, run, effects: run.effects }; },
    );
  });
  ipcMain.handle("ops:record-security-audit-export", (_event, id) => {
    assertAuthorized("securityControls", "update");
    return mutate(
      (result) => ({ action: "SECURITY_AUDIT_EXPORT_RECORDED", entityType: "securityControls", entityId: id, summary: `Recorded audit evidence export for ${result.record.name}`, changes: { export: result.exportRecord } }),
      (draft) => { const record = findRecord(draft, "securityControls", id); const exportRecord = { id: createId("audit-export"), generatedAt: isoNow(), eventCount: draft.audit.length, generatedBy: draft.currentUser.name, scope: "Append-only operational audit metadata" }; record.auditExports = [exportRecord, ...(record.auditExports || [])]; record.updatedAt = exportRecord.generatedAt; return { record, exportRecord }; },
    );
  });
  ipcMain.handle("ops:generate-diagnostics-bundle", (_event, id) => {
    assertAuthorized("diagnostics", "update");
    return mutate(
      (result) => ({ action: "DIAGNOSTICS_BUNDLE_GENERATED", entityType: "diagnostics", entityId: id, summary: `Generated minimized diagnostics metadata for ${result.record.name}`, changes: { bundle: result.bundle } }),
      (draft) => { const record = findRecord(draft, "diagnostics", id); const bundle = { id: createId("diagnostic-run"), generatedAt: isoNow(), generatedBy: draft.currentUser.name, recordCounts: { students: draft.students.length, sessions: draft.sessions.length, incidents: draft.incidents.length, integrations: draft.integrations.length, auditEvents: draft.audit.length }, redaction: "No student or instructor personal-data values included" }; record.bundles = [bundle, ...(record.bundles || [])]; record.status = "ready"; record.updatedAt = bundle.generatedAt; return { record, bundle }; },
    );
  });
  ipcMain.handle("ops:generate-report-snapshot", (_event, id, schedule) => {
    assertAuthorized("reports", "update");
    return mutate(
      (result) => ({ action: "REPORT_SNAPSHOT_GENERATED", entityType: "reports", entityId: id, summary: `Generated ${result.snapshot.rowCount}-record snapshot for ${result.record.name}`, changes: { snapshot: result.snapshot } }),
      (draft) => {
        const record = findRecord(draft, "reports", id);
        const snapshot = buildReportSnapshot(record, draft, { createId, now: isoNow });
        record.snapshots = [...(record.snapshots || []), snapshot];
        record.runHistory = [...(record.runHistory || []), { id: createId("report-run"), snapshotId: snapshot.id, generatedAt: snapshot.generatedAt, status: snapshot.status, definitionRevision: snapshot.definitionRevision, parameters: snapshot.parameters, rowCount: snapshot.rowCount, summary: snapshot.summary }];
        if (typeof schedule === "string") record.schedule = schedule;
        record.lastGeneratedAt = snapshot.generatedAt;
        record.status = "ready";
        record.updatedAt = isoNow();
        return { record, snapshot };
      },
    );
  });
  ipcMain.handle("ops:resolve-import-run", (_event, sourceId, runId, remediation) => {
    assertAuthorized("imports", "update");
    if (!String(remediation || "").trim()) throw new Error("Remediation evidence is required.");
    return mutate(
      (result) => ({ action: "IMPORT_REMEDIATION_RECORDED", entityType: "imports", entityId: sourceId, summary: `Recorded remediation for import run ${runId}`, changes: { runId, remediation: result.run.remediation } }),
      (draft) => {
        const source = findRecord(draft, "imports", sourceId);
        const run = (source.runs || []).find((item) => item.id === runId);
        if (!run) throw new Error("Import run not found.");
        run.remediation = String(remediation).trim();
        run.remediationAt = isoNow();
        run.remediatedBy = draft.currentUser.name;
        run.status = "remediation_recorded";
        run.remediationStatus = "recorded";
        source.updatedAt = isoNow();
        return { source, run };
      },
    );
  });
  ipcMain.handle("ops:profile-student-dataset", (_event, name, csvText) => {
    assertAuthorized("datasets", "create");
    const { columns, rows } = parseCsv(csvText);
    const profile = profileStudentDataset(columns, rows);
    return mutate(
      (result) => ({ action: "DATASET_PROFILED", entityType: "datasets", entityId: result.dataset.id, summary: `Profiled ${result.dataset.profile.rows} rows for ${result.dataset.name}`, changes: { mapping: result.dataset.mapping, profile: result.dataset.profile } }),
      (draft) => { const dataset = { id: createId("dataset"), name: String(name || "Student CSV intake").trim(), sourceType: "CSV", status: profile.profileStatus, owner: draft.currentUser.name, schema: columns, mapping: profile.mapping, profile: { rows: profile.rows, duplicateRows: profile.duplicateRows, missingRequired: profile.missingRequired.length }, rawRows: rows, lineage: "Pending profile approval → normalized student lifecycle", createdAt: isoNow(), updatedAt: isoNow() }; draft.datasets.unshift(dataset); return { dataset }; },
    );
  });
  ipcMain.handle("ops:commit-student-dataset", (_event, datasetId) => {
    assertAuthorized("datasets", "update");
    return mutate(
      (summary) => ({ action: "DATASET_NORMALIZED_COMMITTED", entityType: "datasets", entityId: datasetId, summary: `Committed normalized student records: ${summary.created} created, ${summary.duplicates} duplicates, ${summary.failed} failed`, changes: summary }),
      (draft) => {
        const dataset = findRecord(draft, "datasets", datasetId);
        if (dataset.status !== "mapping_ready" && dataset.status !== "profiled") throw new Error("Dataset must be profiled and mapping-ready before commit.");
        if (Number(dataset.profile?.missingRequired || 0) > 0) throw new Error("Required canonical fields are not mapped; correct the dataset profile before commit.");
        const correlationId = createId("dataset-commit"); let created = 0; let duplicates = 0; let failed = 0; const outcomes = [];
        (dataset.rawRows || []).forEach((row, index) => { const candidate = studentCandidate(row); try { validateRecord("students", candidate); const duplicate = draft.students.some((student) => (candidate.email && student.email === candidate.email) || (student.name === candidate.name && student.cohort === candidate.cohort)); if (duplicate) { duplicates += 1; outcomes.push({ row: index + 2, status: "duplicate", message: "Matched existing canonical learner." }); return; } draft.students.unshift({ ...candidate, id: createId("student"), sourceDatasetId: dataset.id, createdAt: isoNow(), updatedAt: isoNow() }); created += 1; outcomes.push({ row: index + 2, status: "created", message: "Normalized student lifecycle record created." }); } catch (error) { failed += 1; outcomes.push({ row: index + 2, status: "failed", message: error.message }); } });
        dataset.status = "committed"; dataset.commit = { correlationId, committedAt: isoNow(), committedBy: draft.currentUser.name, created, duplicates, failed, outcomes }; dataset.lineage = `${dataset.name} → normalized students`; dataset.updatedAt = isoNow(); return { created, duplicates, failed, outcomes, correlationId, dataset };
      },
    );
  });
  ipcMain.handle("ops:prepare-session-evaluation", (_event, sessionId, rubricId) => {
    assertAuthorized("evaluations", "create");
    return mutate(
      (result) => ({ action: "SESSION_EVALUATION_PREPARED", entityType: "evaluations", entityId: result.evaluation.id, summary: `Prepared evidence-linked evaluation for ${result.session.title}`, changes: { rubricVersion: result.evaluation.rubricVersion, transcriptId: result.evaluation.transcriptId } }),
      (draft) => {
        const session = findRecord(draft, "sessions", sessionId); const rubric = findRecord(draft, "rubrics", rubricId); const transcript = (draft.transcripts || []).find((item) => item.sessionId === sessionId && item.permittedForEvaluation);
        if (!transcript) throw new Error("No authorized transcript evidence is available for this session.");
        const version = (rubric.versions || []).find((item) => item.version === rubric.activeVersion);
        if (!version) throw new Error("The active rubric version is unavailable.");
        const fragments = String(transcript.text || "").split(/[.!?]/).map((part) => part.trim()).filter(Boolean);
        const evidence = (version.criteria || []).flatMap((criterion) => { const terms = String(`${criterion.label} ${criterion.description || ""}`).toLowerCase().match(/[a-z]{4,}/g) || []; const match = fragments.find((fragment) => terms.some((term) => String(fragment).toLowerCase().includes(term)) || /evidence|next step|return|action|goal/i.test(fragment)); return match ? [{ criterionId: criterion.id, quote: match, sourceId: transcript.id }] : []; });
        if (!evidence.length) throw new Error("The authorized transcript does not contain a citable excerpt for the active rubric.");
        const uncovered = (version.criteria || []).filter((criterion) => !evidence.some((item) => item.criterionId === criterion.id)).map((criterion) => criterion.label);
        const evaluation = { id: createId("evaluation"), sessionId, rubricId, rubricVersion: version.version, status: "pending_calibration", owner: draft.currentUser.name, transcriptId: transcript.id, evidence, findings: "Cited transcript evidence was prepared against the active rubric. A human calibrator must approve or return this evaluation.", limitations: uncovered.length ? `No citable transcript excerpt was found for: ${uncovered.join(", ")}. No score or inferred quality has been produced for those criteria.` : "This preparation does not generate an opaque score and does not infer quality beyond the cited evidence.", createdAt: isoNow(), updatedAt: isoNow() }; draft.evaluations.unshift(evaluation); return { evaluation, session };
      },
    );
  });
  ipcMain.handle("ops:request-analyst-run", (_event, payload) => {
    if (!["admin", "manager", "analyst"].includes(state.currentUser?.role)) throw new Error("The current role cannot request analyst runs.");
    return mutate(
      (run) => ({ action: "ANALYST_RUN_SAFE_FAILURE", entityType: "analystRuns", entityId: run.id, summary: `Recorded read-only analyst run for authorized scope: ${run.scope}`, changes: { question: run.question, scope: run.scope, status: run.status, sourceIds: run.sourceIds } }),
      (draft) => { const run = buildSafeFailureAnalystRun({ question: payload?.question, scope: payload?.scope, state: draft, createId, now: isoNow, requestedBy: draft.currentUser.name }); draft.analystRuns.unshift(run); return run; },
    );
  });
  ipcMain.handle("ops:generate-business-review", (_event, period) => {
    assertAuthorized("businessReviews", "create");
    return mutate(
      (result) => ({ action: "BUSINESS_REVIEW_GENERATED", entityType: "businessReviews", entityId: result.review.id, summary: `Generated canonical business review for ${result.review.period}`, changes: { metricSources: result.review.metricSources, actionIds: result.review.actionIds } }),
      (draft) => { const canonicalMetrics = draft.kpis.map((kpi) => ({ id: kpi.id, name: kpi.name, actual: Number(kpi.actuals?.at(-1)?.value || 0), target: Number(kpi.target || 0) })); const belowTarget = canonicalMetrics.filter((metric) => metric.actual < metric.target); const actionIds = draft.actions.filter((action) => ["assigned", "in_progress", "awaiting_approval"].includes(action.status)).map((action) => action.id); const review = { id: createId("business-review"), title: "Operational business review", period: String(period || "Current operational period"), status: "awaiting_approval", owner: draft.currentUser.name, metricSources: canonicalMetrics.map((metric) => metric.id), canonicalMetrics, findings: belowTarget.length ? `${belowTarget.map((metric) => metric.name).join(", ")} are below their published targets. Review the linked actions before approval.` : "All available canonical metrics meet their published targets.", actionIds, generatedAt: isoNow(), approvedBy: "" }; draft.businessReviews.unshift(review); return { review }; },
    );
  });
  ipcMain.handle("ops:import-students", (_event, csvText) => {
    assertAuthorized("students", "create");
    const { columns, rows: incoming } = parseCsv(csvText);
    return mutate(
      (summary) => ({ action: "IMPORTED", entityType: "students", entityId: summary.correlationId, summary: `Imported ${summary.created} students; skipped ${summary.duplicates} duplicates`, changes: summary, correlationId: summary.correlationId }),
      (draft) => {
        const correlationId = createId("import");
        let created = 0;
        let duplicates = 0;
        const errors = [];
        const outcomes = [];
        incoming.forEach((row, index) => {
          const candidate = studentCandidate(row);
          try {
            validateRecord("students", candidate);
            const duplicate = draft.students.some((student) => (candidate.email && student.email === candidate.email) || (student.name === candidate.name && student.cohort === candidate.cohort));
            if (duplicate) { duplicates += 1; outcomes.push({ row: index + 2, status: "duplicate", message: "Matched existing email or name/cohort record." }); return; }
            draft.students.unshift({ ...candidate, id: createId("student"), createdAt: isoNow(), updatedAt: isoNow() });
            created += 1;
            outcomes.push({ row: index + 2, status: "created", message: "Student lifecycle record created." });
          } catch (error) { const message = `Row ${index + 2}: ${error.message}`; errors.push(message); outcomes.push({ row: index + 2, status: "failed", message }); }
        });
        let source = draft.imports.find((item) => item.id === "imp-student-csv");
        if (!source) {
          source = { id: "imp-student-csv", name: "Student CSV intake", sourceType: "CSV", status: "healthy", mappingTemplate: "Student lifecycle manual CSV v1", duplicatePolicy: "email_or_name_cohort", owner: draft.currentUser.name, validationSummary: "", runs: [], createdAt: isoNow(), updatedAt: isoNow() };
          draft.imports.unshift(source);
        }
        const run = buildImportRun({ id: correlationId, now: isoNow(), columns, outcomes });
        source.runs = [run, ...(source.runs || [])];
        source.lastRunAt = run.startedAt;
        source.status = run.failed ? "attention" : "healthy";
        source.validationSummary = `${run.created} created, ${run.duplicates} duplicate(s), ${run.failed} failed row(s).`;
        source.updatedAt = isoNow();
        return { correlationId, sourceId: source.id, runId: run.id, created, duplicates, errors, preview: run.preview, outcomes };
      },
    );
  });
  ipcMain.handle("ops:export-csv", async (_event, payload) => {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, { defaultPath: payload.filename || "edtech-operations-export.csv", filters: [{ name: "CSV", extensions: ["csv"] }] });
    if (canceled || !filePath) return { saved: false };
    const rows = payload.rows || [];
    const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? "")).join(","))].join("\n");
    fs.writeFileSync(filePath, csv, "utf8");
    mutate(() => ({ action: "EXPORTED", entityType: payload.entityType || "report", entityId: createId("export"), summary: `Exported ${rows.length} rows to CSV`, changes: { columns, rowCount: rows.length } }), (draft) => draft);
    return { saved: true, filePath };
  });
  ipcMain.handle("ops:reset-demo", () => {
    const priorAudit = state.audit || [];
    state = createSeedState();
    state.audit = priorAudit;
    audit(state, { action: "DEMO_DATA_RESET", entityType: "workspace", entityId: "demo", summary: "Reset all operational datasets to the deterministic demo baseline", changes: {} });
    writeState(state);
    return state;
  });
  ipcMain.handle("ops:open-external", (_event, target) => shell.openExternal(target));
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 980,
    minWidth: 1120,
    minHeight: 720,
    title: "EdTech Operations Intelligence OS",
    backgroundColor: "#0a1020",
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  if (process.env.ELECTRON_RENDERER_URL) await mainWindow.loadURL(DEV_URL);
  else await mainWindow.loadFile(path.join(__dirname, "../dist/public/index.html"));
}

app.whenReady().then(() => {
  state = readState();
  registerHandlers();
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
