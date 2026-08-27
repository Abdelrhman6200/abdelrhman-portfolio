const transitionMap = {
  sessions: { planned: ["confirmed", "cancelled"], confirmed: ["completed", "cancelled"], completed: [], cancelled: [] },
  incidents: { new: ["triaged", "resolved"], triaged: ["investigating", "escalated", "resolved"], investigating: ["escalated", "resolved"], escalated: ["resolved"], resolved: [] },
  anomalies: { flagged: ["investigating", "dismissed"], investigating: ["resolved", "dismissed"], resolved: [], dismissed: [] },
  actions: { new: ["assigned", "cancelled"], assigned: ["in_progress", "cancelled"], in_progress: ["awaiting_approval", "completed", "cancelled"], awaiting_approval: ["completed", "in_progress"], completed: [], cancelled: [] },
  privacy: { received: ["verifying", "closed"], verifying: ["fulfilling", "rejected", "closed"], fulfilling: ["awaiting_approval", "closed"], awaiting_approval: ["closed", "fulfilling"], rejected: [], closed: [] },
  releases: { draft: ["ready_for_review", "cancelled"], ready_for_review: ["approved", "draft", "cancelled"], approved: ["released", "cancelled"], released: [], cancelled: [] },
  reconciliations: { open: ["investigating", "resolved", "cancelled"], investigating: ["awaiting_approval", "resolved", "cancelled"], awaiting_approval: ["resolved", "investigating"], resolved: [], cancelled: [] },
  securityControls: { draft: ["active", "retired"], active: ["attention", "retired"], attention: ["active", "retired"], retired: [] },
  datasets: { draft: ["profiled", "cancelled"], profiled: ["mapping_ready", "cancelled"], mapping_ready: ["committed", "cancelled"], committed: [], cancelled: [] },
  evaluations: { draft: ["pending_calibration", "cancelled"], pending_calibration: ["approved", "returned", "cancelled"], returned: ["pending_calibration", "cancelled"], approved: [], cancelled: [] },
  businessReviews: { draft: ["awaiting_approval", "cancelled"], awaiting_approval: ["published", "draft", "cancelled"], published: [], cancelled: [] },
};

const requiredFields = {
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
  organizationSettings: ["name", "category", "status"],
  integrations: ["name", "system", "status", "owner"],
  automations: ["name", "trigger", "status", "owner"],
  collaboration: ["subject", "linkedType", "linkedId", "owner", "status"],
  privacy: ["title", "requestType", "status", "owner"],
  plans: ["name", "domain", "horizon", "owner", "status"],
  resilience: ["title", "control", "status", "owner"],
  releases: ["name", "version", "status", "owner"],
  reconciliations: ["title", "integrationId", "status", "owner"],
  securityControls: ["name", "domain", "status", "owner"],
  dashboards: ["name", "audience", "status", "owner"],
  explorations: ["name", "metric", "scope", "owner"],
  diagnostics: ["name", "category", "status", "owner"],
  serviceReviews: ["title", "period", "status", "owner"],
  programs: ["name", "status", "owner"],
  cohorts: ["name", "programId", "status", "owner"],
  attendanceRecords: ["studentId", "sessionId", "status", "recordedAt"],
  cancellations: ["sessionId", "reason", "status", "recordedAt"],
  feedback: ["sessionId", "source", "status", "recordedAt"],
  transcripts: ["sessionId", "source", "status", "capturedAt"],
  rubrics: ["name", "status", "owner"],
  evaluations: ["sessionId", "rubricId", "rubricVersion", "status", "owner"],
  datasets: ["name", "sourceType", "status", "owner"],
  analystRuns: ["question", "scope", "status", "requestedBy"],
  businessReviews: ["title", "period", "status", "owner"],
};

function isTransitionAllowed(entity, from, to) {
  return from === to || Boolean(transitionMap[entity]?.[from]?.includes(to));
}

function validateInput(entity, record) {
  const missing = (requiredFields[entity] || []).filter((key) => record[key] === undefined || record[key] === null || record[key] === "");
  if (missing.length) throw new Error(`Required fields missing: ${missing.join(", ")}.`);
  ["progress", "attendance", "rating", "sessionLoad", "completeness", "accuracy", "freshness", "target", "warningThreshold"].forEach((field) => {
    if (record[field] !== undefined && (Number.isNaN(Number(record[field])) || Number(record[field]) < 0)) throw new Error(`${field} must be a non-negative number.`);
  });
  return true;
}

module.exports = { isTransitionAllowed, validateInput };
