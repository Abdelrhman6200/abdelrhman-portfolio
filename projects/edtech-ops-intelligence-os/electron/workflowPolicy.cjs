const governedEntities = new Set(["datasets", "evaluations", "analystRuns", "businessReviews"]);

function genericMutationError(entity, action, patch = {}) {
  if (action === "create" && governedEntities.has(entity)) return `${entity} must be created through its governed workflow.`;
  if (action === "delete" && governedEntities.has(entity)) return `${entity} retain durable operational history and cannot be deleted.`;
  if (entity === "analystRuns" && action === "update") return "Analyst runs are read-only evidence records and cannot be edited.";
  if (entity === "evaluations" && action === "update" && Object.keys(patch).some((key) => !["status", "calibratedBy", "calibratedAt", "calibrationNote"].includes(key))) return "Evaluation evidence, transcript, and rubric version are immutable after preparation.";
  if (entity === "businessReviews" && action === "update" && Object.keys(patch).some((key) => !["status", "approvedBy", "approvedAt"].includes(key))) return "Canonical metrics and review findings are immutable after generation.";
  return null;
}

module.exports = { genericMutationError };
