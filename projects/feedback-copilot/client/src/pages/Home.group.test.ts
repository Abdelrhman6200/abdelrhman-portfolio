import { describe, expect, it } from "vitest";
import { visibleSubgroupOutcome } from "../lib/collectiveGrading";
import { prototypeCertification, type RubricScores } from "../lib/rubric";

describe("unified subgroup assessment entry point", () => {
  it("calculates a subgroup certificate and strongest grade without any manual parent-group score", () => {
    const excellent: RubricScores = Array(15).fill(5);
    const developing: RubricScores = Array(15).fill(3);
    const outcome = visibleSubgroupOutcome([
      { subgroupId: "product", scores: excellent },
      { subgroupId: "insight", scores: developing },
    ], "product");

    expect(outcome).toMatchObject({ subgroupTotal: 75, cohortTotal: 60, rank: 1, grade: "A" });
    expect(prototypeCertification(outcome.subgroupTotal).label).toContain("Distinction");
  });

  it("keeps certification attached to the assessed subgroup, not the comparison cohort", () => {
    const achieved: RubricScores = [5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    const outcome = visibleSubgroupOutcome([{ subgroupId: "insight", scores: achieved }], "insight");

    expect(outcome.subgroupTotal).toBe(55);
    expect(prototypeCertification(outcome.subgroupTotal).label).toContain("Achieved");
    expect(outcome.cohortTotal).toBe(55);
  });
});
