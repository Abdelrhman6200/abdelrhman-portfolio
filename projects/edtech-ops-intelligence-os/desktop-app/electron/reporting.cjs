function scopeIncludes(scope, term) {
  return String(scope || "").toLowerCase().includes(term);
}

function buildReportSnapshot(report, state, { createId, now }) {
  const sources = [
    ["students", "students", state.students || []],
    ["sessions", "sessions", state.sessions || []],
    ["incidents", "incidents", state.incidents || []],
    ["data quality", "quality", state.quality || []],
    ["anomalies", "anomalies", state.anomalies || []],
    ["actions", "actions", state.actions || []],
  ];
  const matched = sources.filter(([term]) => scopeIncludes(report.scope, term));
  const selected = matched.length ? matched : sources;
  const resultRows = selected.map(([, entity, rows]) => ({
    entity,
    count: rows.length,
    openCount: rows.filter((row) => ["new", "triaged", "investigating", "escalated", "flagged", "attention", "in_progress", "assigned"].includes(row.status)).length,
  }));
  const rowCount = resultRows.reduce((sum, row) => sum + row.count, 0);
  const openIncidents = (state.incidents || []).filter((record) => record.status !== "resolved").length;
  const activeAnomalies = (state.anomalies || []).filter((record) => !["resolved", "dismissed"].includes(record.status)).length;
  const sourceAttention = (state.quality || []).filter((record) => record.status !== "healthy").length;
  return {
    id: createId("snapshot"),
    generatedAt: now(),
    status: "generated",
    reportName: report.name,
    scope: report.scope,
    parameters: report.parameters || "",
    definition: report.definition || "",
    definitionRevision: Number(report.definitionRevision || 1),
    resultRows,
    rowCount,
    summary: `${openIncidents} open incident(s), ${activeAnomalies} actionable anomaly/anomalies, and ${sourceAttention} quality domain(s) requiring attention across ${rowCount} included records.`,
  };
}

module.exports = { buildReportSnapshot };
