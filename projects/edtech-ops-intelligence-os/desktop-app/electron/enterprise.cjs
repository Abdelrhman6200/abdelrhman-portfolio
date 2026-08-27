const { validateConnectorPolicy } = require("./connectorPolicy.cjs");

function asReady(value) {
  return value === true || value === "true";
}

function validateMappingDefinition(record) {
  const targets = Array.isArray(record.mappingDefinition?.targets) ? record.mappingDefinition.targets : [];
  const canonicalTargets = ["student.name", "student.email", "student.cohort"];
  const missingTargets = canonicalTargets.filter((target) => !targets.includes(target));
  return { valid: missingTargets.length === 0, missingTargets };
}

function buildIntegrationReadinessCheck(record, { createId, now }) {
  const connectorPolicy = validateConnectorPolicy(record);
  const credentialsReady = connectorPolicy.credentialReady;
  const mappingValidation = validateMappingDefinition(record);
  const mappingReady = connectorPolicy.mappingReady && mappingValidation.valid;
  return {
    id: createId("sync-check"),
    checkedAt: now(),
    status: connectorPolicy.valid && credentialsReady && mappingReady ? "ready" : "attention",
    evidence: connectorPolicy.valid && credentialsReady && mappingReady ? "Credential reference, mapping, and offline-safe connector readiness verified." : !connectorPolicy.credentialReady ? connectorPolicy.credential.evidence : !connectorPolicy.offlineSafe ? "Offline-safe mode must remain enabled." : mappingValidation.missingTargets.length ? `Required mapping targets missing: ${mappingValidation.missingTargets.join(", ")}.` : "Credential or mapping approval remains incomplete.",
    mappingValidation,
    connectorPolicy,
  };
}

function buildAutomationRun(record, { createId, now, executedBy, overrideNote = "" }) {
  if (record.status !== "active") throw new Error("Only active automation definitions can run.");
  return {
    id: createId("automation-run"),
    startedAt: now(),
    status: asReady(record.approvalRequired) ? "awaiting_approval" : "completed",
    trigger: record.trigger,
    actions: record.actions || [],
    overrideNote: String(overrideNote || ""),
    executedBy,
  };
}

function buildAutomationEffects(record, { createId, now, owner }) {
  const timestamp = now();
  const action = { id: createId("action"), title: `Automation follow-through: ${record.name}`, owner, dueAt: timestamp, status: record.approvalRequired ? "awaiting_approval" : "assigned", priority: "high", linkedType: "automations", linkedId: record.id, description: `Triggered by: ${record.trigger}. ${record.condition || ""}`.trim(), createdAt: timestamp, updatedAt: timestamp };
  const notification = { id: createId("notification"), title: `Automation triggered: ${record.name}`, channel: "in_app", status: "unread", audience: owner, dueAt: timestamp, body: `A routed action has been created from trigger: ${record.trigger}.`, createdAt: timestamp, updatedAt: timestamp };
  const incident = record.escalationRule ? { id: createId("incident"), title: `Automation escalation: ${record.name}`, type: "automation", severity: "high", status: "new", assignee: owner, description: record.escalationRule, createdAt: timestamp, updatedAt: timestamp } : null;
  return { action, notification, incident };
}

module.exports = { buildIntegrationReadinessCheck, buildAutomationRun, buildAutomationEffects, validateMappingDefinition };
