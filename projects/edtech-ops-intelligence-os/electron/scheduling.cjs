function toWindow(record) {
  const start = Date.parse(record.startAt);
  const duration = Number(record.duration || 60) * 60 * 1000;
  if (!Number.isFinite(start) || duration <= 0) throw new Error("Session start time and duration must be valid.");
  return { start, end: start + duration };
}

function findSessionConflicts(existingSessions, candidate, excludeId) {
  if (candidate.status === "cancelled") return [];
  const candidateWindow = toWindow(candidate);
  return existingSessions.filter((existing) => {
    if (existing.id === excludeId || existing.status === "cancelled") return false;
    const window = toWindow(existing);
    const overlaps = candidateWindow.start < window.end && window.start < candidateWindow.end;
    if (!overlaps) return false;
    const sameInstructor = candidate.instructorId && existing.instructorId === candidate.instructorId;
    const sameRoom = candidate.room && existing.room && candidate.room.trim().toLowerCase() === existing.room.trim().toLowerCase();
    const candidateStudents = new Set(candidate.studentIds || []);
    const sharedLearner = (existing.studentIds || []).some((id) => candidateStudents.has(id));
    return sameInstructor || sameRoom || sharedLearner;
  });
}

function assertNoSessionConflicts(existingSessions, candidate, excludeId) {
  const conflicts = findSessionConflicts(existingSessions, candidate, excludeId);
  if (conflicts.length) {
    throw new Error(`Scheduling conflict with ${conflicts.map((session) => session.title).join(", ")}. Change the instructor, room, learner roster, or time.`);
  }
}

module.exports = { assertNoSessionConflicts, findSessionConflicts };
