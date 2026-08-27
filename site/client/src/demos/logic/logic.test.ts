/*
 * The demos claim to run each project's real logic in the browser. That claim
 * only holds if the logic is pinned — these tests are what make the demos
 * demonstrations rather than animations.
 */
import { describe, expect, it } from "vitest";
import {
  ForbiddenTransition,
  canSubmit,
  draftFromEvidence,
  initialFeedback,
  reduce,
} from "./feedbackMachine";
import { seedRows, summarize, validate } from "./validationRules";
import {
  InvalidTransition,
  recordReading,
  resolve,
  seedOps,
  startInvestigation,
  statusOf,
  sweep,
} from "./kpiMonitor";
import { assess, seedStudents } from "./riskScore";
import { RUN_STAGES, decode, isDone, sessionCode, tickBatch } from "./sessionCoder";
import { InvalidAnswers, buildReport, exampleAnswers, validateAnswers } from "./reportBuilder";

/* ------------------------------------------------------------------------- */
describe("feedback approval machine", () => {
  const drafted = reduce(initialFeedback, "teacher", {
    type: "generate",
    evidence: "session notes",
    studentName: "Mariam Hassan",
  });

  it("generates a structured draft a teacher can submit", () => {
    expect(canSubmit(drafted)).toBe(true);
    expect(drafted.strengths).toContain("Mariam");
  });

  it("refuses to let a teacher approve", () => {
    const pending = reduce(drafted, "teacher", { type: "submit_for_review" });
    expect(() => reduce(pending, "teacher", { type: "approve" })).toThrow(ForbiddenTransition);
  });

  it("refuses to let a coordinator edit a draft", () => {
    expect(() =>
      reduce(drafted, "coordinator", { type: "edit", field: "strengths", value: "x" })
    ).toThrow(ForbiddenTransition);
  });

  it("only reaches approved through review", () => {
    // There is no action a teacher can take that lands on approved.
    const pending = reduce(drafted, "teacher", { type: "submit_for_review" });
    const approved = reduce(pending, "coordinator", { type: "approve" });
    expect(approved.status).toBe("approved");
    expect(approved.history.map((entry) => entry.action)).toContain("submitted for review");
  });

  it("return-to-draft carries the coordinator's comment back", () => {
    const pending = reduce(drafted, "teacher", { type: "submit_for_review" });
    const returned = reduce(pending, "coordinator", { type: "return_to_draft", comment: "Cite the session." });
    expect(returned.status).toBe("draft");
    expect(returned.coordinatorComment).toBe("Cite the session.");
  });

  it("blocks submitting an empty draft", () => {
    expect(canSubmit(initialFeedback)).toBe(false);
  });

  it("keeps the draft deterministic for the same inputs", () => {
    expect(draftFromEvidence("notes", "Omar")).toEqual(draftFromEvidence("notes", "Omar"));
  });
});

/* ------------------------------------------------------------------------- */
describe("validation rule engine", () => {
  const findings = validate(seedRows);

  it("catches every seeded failure mode", () => {
    const rules = new Set(findings.map((finding) => finding.rule));
    for (const expected of ["duplicate-id", "id-format", "phone-format", "unknown-track", "slot-format", "required", "slot-conflict"]) {
      expect(rules.has(expected), expected).toBe(true);
    }
  });

  it("passes a fully clean sheet", () => {
    const clean = [
      { id: "ST-2001", name: "A B", phone: "01012345678", track: "Web Development", slot: "MON 18:00" },
      { id: "ST-2002", name: "C D", phone: "01087654321", track: "Data Analysis", slot: "TUE 18:00" },
    ];
    expect(validate(clean)).toEqual([]);
    expect(summarize(clean, []).clean).toBe(2);
  });

  it("flags duplicates on every occurrence, not only the second", () => {
    const dupes = findings.filter((finding) => finding.rule === "duplicate-id");
    expect(dupes.length).toBeGreaterThanOrEqual(2);
  });

  it("does not double-count a row in the summary", () => {
    const summary = summarize(seedRows, findings);
    expect(summary.clean + summary.errorRows + summary.warningRows).toBe(summary.total);
  });
});

/* ------------------------------------------------------------------------- */
describe("KPI monitor and audit trail", () => {
  it("classifies readings against target and threshold", () => {
    expect(statusOf(seedOps.kpis[0])).toBe("breach"); // attendance at 72
    expect(statusOf(seedOps.kpis[1])).toBe("on-target"); // freshness at 96
    expect(statusOf(seedOps.kpis[2])).toBe("watch"); // rating at 83
  });

  it("raises one anomaly per breach, and never a duplicate", () => {
    const once = sweep(seedOps);
    const twice = sweep(once);
    expect(once.anomalies).toHaveLength(1);
    expect(twice.anomalies).toHaveLength(1);
  });

  it("requires investigation before resolution, and a root cause to resolve", () => {
    const state = sweep(seedOps);
    const id = state.anomalies[0].id;
    expect(() => resolve(state, id, "long enough root cause", "analyst")).toThrow(InvalidTransition);
    const investigating = startInvestigation(state, id, "analyst");
    expect(() => resolve(investigating, id, "short", "analyst")).toThrow(InvalidTransition);
    const resolved = resolve(investigating, id, "Ramadan schedule shift; sessions moved.", "analyst");
    expect(resolved.anomalies[0].status).toBe("resolved");
  });

  it("appends to the audit log and never mutates prior entries", () => {
    const before = sweep(seedOps);
    const frozen = [...before.audit];
    const after = startInvestigation(before, before.anomalies[0].id, "analyst", 5);
    expect(after.audit.length).toBe(frozen.length + 1);
    expect(after.audit.slice(0, frozen.length)).toEqual(frozen);
  });

  it("re-raises after a new breach following resolution", () => {
    let state = sweep(seedOps);
    const id = state.anomalies[0].id;
    state = startInvestigation(state, id, "analyst");
    state = resolve(state, id, "Schedule conflict resolved with vendor.", "analyst");
    state = recordReading(state, "attendance", 70);
    state = sweep(state);
    expect(state.anomalies.filter((anomaly) => anomaly.kpiKey === "attendance")).toHaveLength(2);
  });
});

/* ------------------------------------------------------------------------- */
describe("risk scoring", () => {
  it("never returns a score without reasons behind it", () => {
    for (const student of seedStudents) {
      const result = assess(student);
      if (result.score > 0) expect(result.reasons.length).toBeGreaterThan(0);
      const sum = result.reasons.reduce((total, reason) => total + reason.points, 0);
      expect(result.score).toBe(Math.min(100, sum));
    }
  });

  it("bands the seeded students plausibly", () => {
    expect(assess(seedStudents[0]).band).toBe("healthy"); // Salma
    expect(assess(seedStudents[2]).band).toBe("at-risk"); // Dina
  });

  it("caps the score at 100", () => {
    const worst = assess({
      name: "X",
      attendedOfSix: 0,
      inactiveDays: 60,
      progressPercent: 5,
      renewalInDays: -30,
      communityActive: false,
    });
    expect(worst.score).toBe(100);
  });

  it("targets the recommendation at the biggest contributor", () => {
    const attendance = assess({ ...seedStudents[0], attendedOfSix: 1 });
    expect(attendance.recommendation.toLowerCase()).toContain("schedule");
  });
});

/* ------------------------------------------------------------------------- */
describe("session coding", () => {
  const request = { governorate: "Cairo", vendor: "Almentor", track: "Web", cohort: 3, slot: "THU 17:00" } as const;

  it("encodes every attribute into the identifier", () => {
    expect(sessionCode(request)).toBe("CAI-ALM-WEB-C03-THU1700");
  });

  it("round-trips: the code decodes back to its parts", () => {
    const decoded = decode(sessionCode(request));
    expect(decoded).toMatchObject({ governorate: "Cairo", vendor: "Almentor", track: "Web", cohort: "03" });
  });

  it("rejects a malformed code", () => {
    expect(decode("NOT-A-CODE")).toBeNull();
    expect(decode("XXX-ALM-WEB-C03-THU1700")).toBeNull();
  });

  it("drives a batch to completion one step at a time", () => {
    let runs = [
      { code: "A", completed: -1 },
      { code: "B", completed: -1 },
    ];
    const totalSteps = RUN_STAGES.length * runs.length;
    for (let i = 0; i < totalSteps; i++) runs = tickBatch(runs);
    expect(runs.every(isDone)).toBe(true);
    expect(tickBatch(runs)).toEqual(runs); // a finished batch stays put
  });
});

/* ------------------------------------------------------------------------- */
describe("report builder", () => {
  it("accepts the example answers", () => {
    expect(validateAnswers(exampleAnswers)).toEqual([]);
    const report = buildReport(exampleAnswers);
    expect(report.title).toContain("Systems Thinking Lab");
    expect(report.sections).toHaveLength(3);
  });

  it("refuses to build from invalid answers", () => {
    const bad = { ...exampleAnswers, completionPercent: "140" };
    expect(validateAnswers(bad).map((error) => error.field)).toContain("completionPercent");
    expect(() => buildReport(bad)).toThrow(InvalidAnswers);
  });

  it("reports every invalid field at once, not just the first", () => {
    const bad = { ...exampleAnswers, studentName: "", mentorName: "" };
    expect(validateAnswers(bad)).toHaveLength(2);
  });
});

/* ------------------------------------------------------------------------- */
describe("demo batch helpers", () => {
  it("messyBatch carries fresh failure modes and creates a cross-batch duplicate", async () => {
    const { messyBatch } = await import("./validationRules");
    const combined = validate([...seedRows, ...messyBatch]);
    // Findings in the appended rows…
    expect(combined.some((finding) => finding.rowIndex >= seedRows.length)).toBe(true);
    // …including the duplicate created against the original sheet (ST-1046).
    const dupRows = combined.filter((finding) => finding.rule === "duplicate-id").map((finding) => finding.rowIndex);
    expect(dupRows.some((row) => row >= seedRows.length)).toBe(true);
    expect(dupRows.some((row) => row < seedRows.length)).toBe(true);
  });

  it("variedRequests is deterministic and produces unique codes", async () => {
    const { variedRequests } = await import("./sessionCoder");
    const a = variedRequests(5);
    expect(a).toEqual(variedRequests(5));
    const codes = a.map(sessionCode);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
