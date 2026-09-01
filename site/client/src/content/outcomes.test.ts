/*
 * The outcome band under the hero.
 *
 * These are the four biggest numbers on the site, in the largest type, above
 * everything else. That makes them the easiest thing to quietly get wrong —
 * a project's reported figure gets edited and the headline keeps the old one,
 * and the page contradicts itself in a place nobody re-reads.
 *
 * So each band figure must still appear in the `result` line of the project
 * it names. Promoted, not invented.
 */
import { describe, expect, it } from "vitest";
import { allProjects, outcomes } from "./portfolio";

describe("reported outcomes", () => {
  it("names a project that exists", () => {
    for (const outcome of outcomes) {
      const project = allProjects.find((item) => item.title === outcome.source);
      expect(project, `no project titled "${outcome.source}"`).toBeDefined();
    }
  });

  it("quotes a figure that project actually states", () => {
    // Two kinds of figure appear here: outcomes, which live in a project's
    // `result` line ("90% fewer errors"), and scale, which belongs in the
    // `summary` because it describes what the system covered rather than what
    // changed ("across 500+ instructors"). Either counts as substantiation;
    // what must not happen is a headline number appearing nowhere else.
    //
    // "40K+" is the band's shorthand for the project's "40,000+", so the
    // comparison is on digits rather than formatting.
    const digitsOf = (value: string) => value.replace(/[^0-9]/g, "");

    for (const outcome of outcomes) {
      const project = allProjects.find((item) => item.title === outcome.source);
      const stated = `${project?.summary ?? ""} ${project?.result ?? ""}`;
      expect(
        digitsOf(stated).includes(digitsOf(outcome.value)),
        `"${outcome.value}" appears nowhere in ${outcome.source}: "${stated.trim()}"`
      ).toBe(true);
    }
  });

  it("only promotes figures from brief-tier work, which is what the band says", () => {
    // The band is captioned "reported by the organizations the work ran
    // inside". A code-tier figure promoted here would be mislabelled.
    for (const outcome of outcomes) {
      const project = allProjects.find((item) => item.title === outcome.source);
      expect(project?.evidence, outcome.source).toBe("brief");
    }
  });

  it("says something different in each slot", () => {
    expect(new Set(outcomes.map((outcome) => outcome.label)).size).toBe(outcomes.length);
  });
});
