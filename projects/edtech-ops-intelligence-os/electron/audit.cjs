function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function appendAudit(draft, payload, { createId, now }) {
  if (!draft || !draft.currentUser) throw new Error("An attributable user is required to append an audit event.");
  const actor = draft.currentUser;
  const existing = Array.isArray(draft.audit) ? draft.audit : [];
  const event = {
    id: createId("audit"),
    timestamp: now(),
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId,
    summary: payload.summary,
    changes: clone(payload.changes),
    correlationId: payload.correlationId || createId("corr"),
  };
  draft.audit = [event, ...existing];
  return event;
}

module.exports = { appendAudit };
