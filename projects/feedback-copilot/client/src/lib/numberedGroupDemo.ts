import type { SubgroupAssessment } from "./collectiveGrading";
import { defaultRubricScores } from "./rubric";

export type NumberedSubgroup = {
  id: string;
  code: "A" | "B" | "C" | "D";
  name: string;
};

export type NumberedGroup = {
  id: string;
  number: number;
  name: string;
  subgroups: NumberedSubgroup[];
};

const subgroupCodes: NumberedSubgroup["code"][] = ["A", "B", "C", "D"];

export const numberedGroups: NumberedGroup[] = Array.from({ length: 1000 }, (_, index) => {
  const number = index + 1;
  return {
    id: `group-${number}`,
    number,
    name: `Group ${number}`,
    subgroups: subgroupCodes.map(code => ({ id: `group-${number}-${code.toLowerCase()}`, code, name: `Subgroup ${code}` })),
  };
});

export const initialNumberedAssessments: SubgroupAssessment[] = [
  { subgroupId: "group-1-a", scores: [5, 5, 3, 5, 3, 3, 3, 5, 3, 3, 5, 5, 5, 3, 3] },
  { subgroupId: "group-1-b", scores: [5, 5, 5, 5, 3, 5, 5, 3, 5, 3, 5, 5, 5, 5, 3] },
  { subgroupId: "group-1-c", scores: [3, 3, 3, 3, 3, 3, 3, 3, 5, 3, 3, 5, 3, 3, 3] },
  { subgroupId: "group-1-d", scores: [3, 5, 3, 3, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] },
];

export function assessmentsForGroup(group: NumberedGroup, assessments: SubgroupAssessment[]) {
  return group.subgroups.map(subgroup => assessments.find(assessment => assessment.subgroupId === subgroup.id) ?? {
    subgroupId: subgroup.id,
    scores: [...defaultRubricScores],
  });
}
