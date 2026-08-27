import { describe, expect, it } from "vitest";

const { isTransitionAllowed, validateInput } = require("./rules.cjs");

describe("operational workflow business rules", () => {
  it("permits only defined incident transitions", () => {
    expect(isTransitionAllowed("incidents", "new", "triaged")).toBe(true);
    expect(isTransitionAllowed("incidents", "triaged", "investigating")).toBe(true);
    expect(isTransitionAllowed("incidents", "new", "escalated")).toBe(false);
    expect(isTransitionAllowed("incidents", "resolved", "investigating")).toBe(false);
  });

  it("rejects domain records missing required fields", () => {
    expect(() => validateInput("students", { name: "Ada", cohort: "Autumn 2026", status: "active" })).toThrow("program");
    expect(() => validateInput("kpis", { name: "Attendance", domain: "Students", unit: "%", target: -1, owner: "Maya" })).toThrow("target");
  });

  it("accepts complete and valid records", () => {
    expect(validateInput("students", { name: "Ada", cohort: "Autumn 2026", program: "Analytics", status: "active", progress: 0 })).toBe(true);
  });
});
