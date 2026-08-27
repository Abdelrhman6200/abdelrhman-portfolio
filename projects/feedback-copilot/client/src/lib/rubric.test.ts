import { describe, expect, it } from "vitest";
import { certificateCategories, prototypeCertification, rubricTotal } from "./rubric";

describe("prototype Level 1 certification", () => {
  it("sums all 15 rubric criteria out of 75", () => {
    expect(rubricTotal(Array.from({ length: 15 }, () => 5))).toBe(75);
  });

  it("uses clearly bounded prototype certification assumptions", () => {
    expect(prototypeCertification(65).label).toContain("Distinction");
    expect(prototypeCertification(50).label).toContain("Achieved");
    expect(prototypeCertification(49).label).toContain("progress");
  });

  it("assigns certificate title categories and identifies the best available title", () => {
    expect(certificateCategories.map(item => item.category)).toEqual(["best available", "achieved", "in progress"]);
    expect(prototypeCertification(65)).toMatchObject({ title: "Level 1 Certificate · Distinction", category: "best available", isBestAvailable: true });
    expect(prototypeCertification(50)).toMatchObject({ category: "achieved", isBestAvailable: false });
  });

  it("changes the prototype certification when a group’s rubric scores improve", () => {
    const developingScores = Array.from({ length: 15 }, () => 3);
    const improvedScores = [...developingScores.slice(0, 5), ...Array.from({ length: 10 }, () => 5)];

    expect(prototypeCertification(rubricTotal(developingScores)).label).toContain("progress");
    expect(prototypeCertification(rubricTotal(improvedScores)).label).toContain("Distinction");
  });
});
