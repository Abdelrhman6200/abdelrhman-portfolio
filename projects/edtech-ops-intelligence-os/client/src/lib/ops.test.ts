/*
 * The renderer's own data layer.
 *
 * Everything the console displays passes through these: labels are humanised,
 * timestamps are formatted, KPI rollups are averaged, and — when the desktop
 * bridge is absent — the whole workspace comes from `fallbackState()`. That
 * last one matters more than it looks: it is what renders in the browser
 * build, so a visitor who opens the web version sees this object and nothing
 * else. Until now none of it was covered; all the app's tests were in
 * server/ and electron/.
 */
import { describe, expect, it } from "vitest";
import { average, fallbackState, formatDate, humanize, numberFields } from "./ops";

describe("humanize", () => {
  it("turns a snake_case key into a readable label", () => {
    expect(humanize("root_cause")).toBe("Root Cause");
    expect(humanize("attendance_rate")).toBe("Attendance Rate");
  });

  it("capitalises a single word and leaves an already-readable one alone", () => {
    expect(humanize("students")).toBe("Students");
    expect(humanize("Students")).toBe("Students");
  });

  it("returns empty for empty, rather than throwing on a missing field", () => {
    expect(humanize("")).toBe("");
  });
});

describe("formatDate", () => {
  it("shows an em dash when there is no date, never 'undefined'", () => {
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
  });

  it("passes an unparseable value through instead of rendering 'Invalid Date'", () => {
    // Imported records carry whatever the source system had. Showing the raw
    // value tells an operator what is actually stored; "Invalid Date" does not.
    expect(formatDate("not a date")).toBe("not a date");
  });

  it("formats a real timestamp to something short and human", () => {
    const formatted = formatDate("2026-03-14T09:30:00.000Z");
    expect(formatted).not.toBe("—");
    expect(formatted).not.toContain("Invalid");
    expect(formatted.length).toBeLessThan(30);
  });
});

describe("average", () => {
  it("rounds to a whole number, since these are displayed as percentages", () => {
    expect(average([90, 95])).toBe(93);
    expect(average([1, 2])).toBe(2);
  });

  it("returns zero for an empty set rather than NaN", () => {
    // An empty cohort divides to NaN, which renders as "NaN%" on the tower.
    expect(average([])).toBe(0);
  });

  it("handles a single value and negative deltas", () => {
    expect(average([42])).toBe(42);
    expect(average([-10, -20])).toBe(-15);
  });
});

describe("numberFields", () => {
  it("marks the fields the record forms must coerce to numbers", () => {
    // A form posts strings; anything named here is parsed before it is stored,
    // so a value that should be numeric never lands as "78".
    for (const field of ["progress", "attendance", "completeness", "delta"]) {
      expect(numberFields.has(field)).toBe(true);
    }
    expect(numberFields.has("name")).toBe(false);
    expect(numberFields.has("status")).toBe(false);
  });
});

describe("fallbackState", () => {
  const state = fallbackState();

  it("fills every collection the console renders", () => {
    // A missing key here is a crash in the console, not an empty table: the
    // component maps over each of these without guarding.
    const collections = [
      "students",
      "instructors",
      "sessions",
      "incidents",
      "kpis",
      "anomalies",
      "quality",
      "sops",
      "analyses",
      "onboarding",
      "actions",
      "notifications",
      "communications",
      "imports",
      "reports",
      "datasets",
      "analystRuns",
      "businessReviews",
      "audit",
    ] as const;
    for (const key of collections) {
      expect(Array.isArray(state[key]), `${key} must be an array`).toBe(true);
    }
  });

  it("names a workspace and a signed-in user, which the header renders", () => {
    expect(state.workspace.name).toBeTruthy();
    expect(state.currentUser.name).toBeTruthy();
    expect(state.currentUser.role).toBeTruthy();
  });

  it("gives every record an id, since the tables key on it", () => {
    const records = Object.values(state).filter(Array.isArray).flat();
    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(record.id, JSON.stringify(record).slice(0, 80)).toBeTruthy();
    }
  });

  it("keeps ids unique within each collection", () => {
    for (const [key, value] of Object.entries(state)) {
      if (!Array.isArray(value)) continue;
      const ids = value.map((record) => record.id);
      expect(new Set(ids).size, `duplicate id in ${key}`).toBe(ids.length);
    }
  });

  it("stamps the workspace with a valid timestamp", () => {
    expect(Number.isNaN(new Date(state.workspace.updatedAt).getTime())).toBe(false);
  });
});
