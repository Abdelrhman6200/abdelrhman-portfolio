/*
 * The outcome loop: a finished intervention with a recorded outcome produces
 * an intervention_outcome signal on the student, so the next triage pass sees
 * what was tried and how it ended. The rule lives in the pure
 * `outcomeSignalFor`, consumed by `updateIntervention` — pinning the pure
 * function pins the boundary that IS the feature.
 */
import { describe, expect, it } from "vitest";
import { outcomeSignalFor } from "./db";

const existing = { id: 9, studentId: 3, type: "renewal" };

describe("intervention outcomes re-enter the signal stream", () => {
  it("produces an intervention_outcome signal when completed with an outcome", () => {
    const signal = outcomeSignalFor(existing, {
      status: "completed",
      outcome: "Student re-engaged after the schedule change.",
    });

    expect(signal).toMatchObject({
      studentId: 3,
      type: "intervention_outcome",
      state: "open",
      evidence: {
        interventionId: 9,
        status: "completed",
        outcome: "Student re-engaged after the schedule change.",
      },
    });
    expect(String(signal?.explanation)).toContain("renewal intervention completed");
  });

  it("produces the signal for a dismissal too — a failed attempt is also evidence", () => {
    const signal = outcomeSignalFor(existing, {
      status: "dismissed",
      outcome: "No response after three attempts.",
    });
    expect(signal?.type).toBe("intervention_outcome");
    expect(String(signal?.explanation)).toContain("dismissed");
  });

  it("produces nothing without an explicit outcome — a bare status change is not evidence", () => {
    expect(outcomeSignalFor(existing, { status: "completed" })).toBeNull();
    expect(outcomeSignalFor(existing, { status: "completed", outcome: "   " })).toBeNull();
  });

  it("produces nothing for a non-terminal move, even with a note attached", () => {
    expect(outcomeSignalFor(existing, { status: "in_progress", outcome: "Called; waiting on reply." })).toBeNull();
    expect(outcomeSignalFor(existing, { status: "waiting", outcome: "Escalated." })).toBeNull();
  });

  it("keeps the explanation inside the column limit however long the outcome is", () => {
    const signal = outcomeSignalFor(existing, { status: "completed", outcome: "x".repeat(900) });
    expect(String(signal?.explanation).length).toBeLessThanOrEqual(500);
  });

  it("humanises the intervention type in the explanation", () => {
    const signal = outcomeSignalFor({ ...existing, type: "content_followup" }, { status: "completed", outcome: "Done." });
    expect(String(signal?.explanation)).toContain("content followup intervention");
  });
});
