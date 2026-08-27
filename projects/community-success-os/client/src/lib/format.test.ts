/*
 * Every name, date and status label the workspace renders passes through
 * these three functions, and until now none of the client had any coverage at
 * all — the whole suite was server-side. The cases worth pinning are the ugly
 * inputs, because student and cohort data arrives from imports and other
 * systems, not from a form that validated it.
 */
import { describe, expect, it } from "vitest";
import { fmtDate, initials, titleCase } from "./format";

describe("fmtDate", () => {
  it("shows an em dash for a missing date rather than 'undefined'", () => {
    expect(fmtDate(undefined)).toBe("—");
    expect(fmtDate(null)).toBe("—");
  });

  it("shows an em dash for an unparseable value, never 'Invalid Date'", () => {
    // Imported records carry whatever the source system had; "Invalid Date"
    // next to a student's name reads as a broken product.
    expect(fmtDate("not a date")).toBe("—");
  });

  it("formats a real date short, for a dense timeline row", () => {
    const formatted = fmtDate(new Date("2026-03-14T00:00:00.000Z"));
    expect(formatted).not.toBe("—");
    expect(formatted.length).toBeLessThan(16);
  });

  it("accepts an ISO string as well as a Date, which is what the API returns", () => {
    expect(fmtDate("2026-03-14T00:00:00.000Z")).not.toBe("—");
  });
});

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("Ada Mensah")).toBe("AM");
  });

  it("caps at two, however many names someone has", () => {
    expect(initials("Maria del Carmen Rodriguez")).toBe("MD");
  });

  it("handles a single name without trailing whitespace artefacts", () => {
    expect(initials("Prince")).toBe("P");
  });

  it("survives extra spacing instead of emitting 'undefined'", () => {
    // "Ada  Mensah".split(" ") yields an empty segment, and part[0] on it is
    // undefined — which used to render as the string "undefined" in a chip.
    expect(initials("Ada  Mensah")).toBe("AM");
    expect(initials("  Ada Mensah ")).toBe("AM");
  });

  it("returns empty for an empty name rather than throwing", () => {
    expect(initials("")).toBe("");
    expect(initials("   ")).toBe("");
  });

  it("upper-cases, so a lower-case record still reads as an avatar", () => {
    expect(initials("ada mensah")).toBe("AM");
  });
});

describe("titleCase", () => {
  it("turns a stored enum value into something readable", () => {
    expect(titleCase("at_risk")).toBe("at risk");
    expect(titleCase("renewal_opportunity")).toBe("renewal opportunity");
  });

  it("leaves a single-word value alone", () => {
    expect(titleCase("active")).toBe("active");
  });
});
