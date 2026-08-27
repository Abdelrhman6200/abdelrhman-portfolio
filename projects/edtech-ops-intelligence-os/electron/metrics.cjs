function averageQuality(entry) {
  const values = [entry.completeness, entry.accuracy, entry.freshness].map(Number);
  if (values.some((value) => !Number.isFinite(value))) throw new Error("Quality dimensions must be numeric.");
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function kpiStatus(kpi) {
  const actual = Number(kpi.actuals?.at(-1)?.value);
  if (!Number.isFinite(actual)) return "no_data";
  if (actual >= Number(kpi.target)) return "on_target";
  if (actual >= Number(kpi.warningThreshold)) return "watch";
  return "breached";
}

module.exports = { averageQuality, kpiStatus };
