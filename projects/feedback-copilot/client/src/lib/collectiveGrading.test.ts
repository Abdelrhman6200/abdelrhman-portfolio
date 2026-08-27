import { describe, expect, it } from "vitest";
import { bestAvailableGrade, collectivePercent, collectiveTotal, comparisonCohortPercent, replaceSubgroupAssessment, subgroupRank, visibleSubgroupOutcome } from "./collectiveGrading";
import { prototypeCertification, type RubricScores } from "./rubric";

const strongRubric: RubricScores = [5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3];
const standardRubric: RubricScores = Array(15).fill(3);
const excellentRubric: RubricScores = Array(15).fill(5);

describe("subgroup-only collective grading", () => {
  const assessments = [
    { subgroupId: "north", scores: strongRubric },
    { subgroupId: "south", scores: standardRubric },
  ];

  it("calculates rubric totals and comparison-cohort percentages across all 15 subgroup criteria", () => {
    expect(collectiveTotal(assessments[0]!.scores)).toBe(63);
    expect(collectivePercent(assessments[0]!.scores)).toBe(84);
    expect(comparisonCohortPercent(assessments)).toBe(72);
  });

  it("ranks a subgroup against the other subgroups in its comparison cohort", () => {
    expect(subgroupRank(assessments, "north")).toBe(1);
    expect(subgroupRank(assessments, "south")).toBe(2);
  });

  it("selects the strongest grade supported by subgroup and comparison-cohort evidence", () => {
    expect(bestAvailableGrade(100, 80, 1).grade).toBe("A");
    expect(bestAvailableGrade(60, 80, 2).grade).toBe("C");
  });

  it("updates the assessed subgroup total, certificate, rank, and grade without a parent-group evaluation", () => {
    const before = visibleSubgroupOutcome(assessments, "south");
    const afterAssessments = replaceSubgroupAssessment(assessments, {
      subgroupId: "south",
      scores: excellentRubric,
    });
    const after = visibleSubgroupOutcome(afterAssessments, "south");

    expect(before).toMatchObject({ subgroupTotal: 45, subgroupPercent: 60, cohortTotal: 54, cohortPercent: 72, rank: 2, grade: "C" });
    expect(prototypeCertification(before.subgroupTotal).label).toContain("evidence in progress");
    expect(after).toMatchObject({ subgroupTotal: 75, subgroupPercent: 100, cohortTotal: 69, cohortPercent: 92, rank: 1, grade: "A" });
    expect(prototypeCertification(after.subgroupTotal).label).toContain("Distinction");
  });
});
