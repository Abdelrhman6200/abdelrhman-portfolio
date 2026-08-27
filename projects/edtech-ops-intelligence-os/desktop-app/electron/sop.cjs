function publishSopVersion(sop, payload, actorName, now) {
  if (!payload?.body?.trim()) throw new Error("A version body is required.");
  const version = (sop.versions?.length || 0) + 1;
  const entry = { version, body: payload.body.trim(), summary: payload.summary?.trim() || "Version update", createdAt: now(), createdBy: actorName };
  sop.versions = [...(sop.versions || []), entry];
  sop.activeVersion = version;
  sop.updatedAt = now();
  return entry;
}

module.exports = { publishSopVersion };
