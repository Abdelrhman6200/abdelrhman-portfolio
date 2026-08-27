const rolePermissions = {
  admin: ["students", "instructors", "sessions", "incidents", "kpis", "anomalies", "quality", "sops", "analyses", "onboarding", "actions", "notifications", "communications", "imports", "reports", "configRecords", "support", "organizationSettings", "integrations", "automations", "collaboration", "privacy", "plans", "resilience", "releases", "reconciliations", "securityControls", "dashboards", "explorations", "diagnostics", "serviceReviews", "programs", "cohorts", "attendanceRecords", "cancellations", "feedback", "transcripts", "rubrics", "evaluations", "datasets", "analystRuns", "businessReviews"],
  manager: ["students", "instructors", "sessions", "incidents", "kpis", "anomalies", "quality", "sops", "analyses", "onboarding", "actions", "notifications", "communications", "imports", "reports", "configRecords", "support", "organizationSettings", "integrations", "automations", "collaboration", "privacy", "plans", "resilience", "releases", "reconciliations", "securityControls", "dashboards", "explorations", "diagnostics", "serviceReviews", "programs", "cohorts", "attendanceRecords", "cancellations", "feedback", "transcripts", "rubrics", "evaluations", "datasets", "analystRuns", "businessReviews"],
  coordinator: ["students", "sessions", "incidents", "anomalies", "quality", "analyses", "onboarding", "actions", "notifications", "communications", "imports", "reports", "collaboration", "privacy", "plans", "reconciliations", "serviceReviews", "attendanceRecords", "cancellations", "feedback", "transcripts", "evaluations", "datasets", "businessReviews"],
  analyst: ["kpis", "anomalies", "quality", "analyses", "actions", "reports", "collaboration", "plans", "dashboards", "explorations"],
};

function canMutate(role, entity) {
  return Boolean(rolePermissions[role]?.includes(entity));
}

module.exports = { canMutate, rolePermissions };
