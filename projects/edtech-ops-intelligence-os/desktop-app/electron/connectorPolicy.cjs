function asReady(value) {
  return value === true || value === "true";
}

function validateCredentialReference(reference) {
  if (!reference) return { valid: false, evidence: "No credential reference is configured." };
  const value = String(reference).trim();
  if (!/^(keychain|env):\/\/[A-Z0-9_.-]+$/i.test(value)) return { valid: false, evidence: "Credential references must use keychain:// or env:// notation; raw credentials are never stored in the desktop workspace." };
  return { valid: true, evidence: "Credential reference format is valid; the secret value is not stored in application state." };
}

function validateConnectorPolicy(record) {
  const system = String(record.system || "").toUpperCase();
  const credential = validateCredentialReference(record.credentialRef);
  const offlineSafe = record.offlineSafe !== false && record.offlineSafe !== "false";
  const syncMode = record.syncMode || "offline_safe";
  const mappingReady = asReady(record.mappingApproved) && Array.isArray(record.mappingDefinition?.targets) && ["student.name", "student.email", "student.cohort"].every((target) => record.mappingDefinition.targets.includes(target));
  const credentialReady = asReady(record.credentialsConfigured) && credential.valid;
  return { valid: ["SIS", "LMS"].includes(system) && credentialReady && mappingReady && offlineSafe, system, credential, offlineSafe, syncMode, mappingReady, credentialReady };
}

function buildGuardedSyncRun(record, { createId, now, executedBy }) {
  const policy = validateConnectorPolicy(record);
  const checkedAt = now();
  if (!policy.valid) return { id: createId("sync-run"), checkedAt, status: "blocked", mode: policy.syncMode, executedBy, evidence: `No network call was made. ${!policy.credentialReady ? policy.credential.evidence : !policy.mappingReady ? "Required canonical mapping approval is incomplete." : !policy.offlineSafe ? "Offline-safe mode must remain enabled." : "Only SIS and LMS connector types are supported."}`, policy };
  if (policy.syncMode !== "live") return { id: createId("sync-run"), checkedAt, status: "offline_safe", mode: "offline_safe", executedBy, evidence: "Connector policy passed. No network call was made because this desktop build is operating in offline-safe mode.", policy };
  return { id: createId("sync-run"), checkedAt, status: "blocked", mode: "live", executedBy, evidence: "Live network sync is blocked in this local-first build until an organization-approved connector adapter is installed.", policy };
}

module.exports = { validateCredentialReference, validateConnectorPolicy, buildGuardedSyncRun };
