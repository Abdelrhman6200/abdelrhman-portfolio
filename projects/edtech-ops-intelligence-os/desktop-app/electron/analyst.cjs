function normalize(value) {
  return String(value || "").toLowerCase();
}

function matchesScope(record, query) {
  const text = normalize(JSON.stringify(record));
  return query.split(/\s+/).filter((token) => token.length > 3).some((token) => text.includes(token));
}

function latestKpiFact(kpi) {
  const actual = Number(kpi.actuals?.at(-1)?.value || 0);
  return `${kpi.name} is ${actual}${kpi.unit || ""} against a published target of ${kpi.target}${kpi.unit || ""}.`;
}

function buildSafeFailureAnalystRun({ question, scope, state, createId, now, requestedBy }) {
  const normalizedQuestion = String(question || "").trim();
  const normalizedScope = String(scope || "").trim();
  if (!normalizedQuestion || !normalizedScope) throw new Error("A question and authorized scope are required for an analyst run.");

  const search = `${normalizedQuestion} ${normalizedScope}`;
  const candidates = [
    ...(state.kpis || []).map((record) => ({ type: "kpi", record, fact: latestKpiFact(record) })),
    ...(state.anomalies || []).map((record) => ({ type: "anomaly", record, fact: `${record.title}: expected ${record.expected}, observed ${record.actual}. ${record.context || ""}` })),
    ...(state.incidents || []).map((record) => ({ type: "incident", record, fact: `${record.title}: ${record.description || "No observed-fact description recorded."}` })),
    ...(state.quality || []).map((record) => ({ type: "quality", record, fact: `${record.domain} data quality is ${record.status}; completeness ${record.completeness}%, accuracy ${record.accuracy}%, freshness ${record.freshness}%.` })),
  ];
  const scoped = candidates.filter((candidate) => matchesScope(candidate.record, search));
  const selected = (scoped.length ? scoped : candidates).slice(0, 6);
  const observedFacts = selected.map((candidate) => candidate.fact);
  const sourceIds = selected.map((candidate) => candidate.record.id);

  return {
    id: createId("analyst-run"),
    question: normalizedQuestion,
    scope: normalizedScope,
    status: "safe_failure",
    requestedBy,
    provider: "local-qwen-3.5-9b",
    sourceIds,
    observedFacts,
    interpretation: "No model interpretation was produced because the configured local inference provider is unavailable.",
    hypotheses: [],
    limitations: ["Local Qwen 3.5 9B inference is not configured in this desktop workspace.", "No inference was executed; do not treat the evidence list as an automated conclusion."],
    recommendation: sourceIds.length ? "Review the cited operational records and record a human decision or follow-through action." : "No authorized evidence was found in the requested scope; refine the scope before requesting another run.",
    createdAt: now(),
  };
}

module.exports = { buildSafeFailureAnalystRun };
