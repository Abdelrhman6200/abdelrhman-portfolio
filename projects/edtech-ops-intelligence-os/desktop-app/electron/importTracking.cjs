const requiredColumns = ["name", "cohort", "program"];

function buildValidationPreview(columns) {
  return requiredColumns.map((column) => ({ source: column, target: `student.${column}`, status: columns.includes(column) ? "mapped" : "missing_required" }));
}

function buildImportRun({ id, now, columns, outcomes }) {
  const counts = outcomes.reduce((acc, outcome) => ({ ...acc, [outcome.status]: (acc[outcome.status] || 0) + 1 }), {});
  const failed = counts.failed || 0;
  return {
    id,
    startedAt: now,
    status: failed ? "completed_with_errors" : "completed",
    received: outcomes.length,
    created: counts.created || 0,
    duplicates: counts.duplicate || 0,
    failed,
    preview: buildValidationPreview(columns),
    rowOutcomes: outcomes,
    remediationStatus: failed ? "required" : "not_required",
  };
}

module.exports = { buildImportRun, buildValidationPreview };
