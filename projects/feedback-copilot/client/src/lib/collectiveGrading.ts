import { rubricMaximum, rubricTotal, type RubricScores } from "./rubric";

export type DomainScores = RubricScores;

export type SubgroupAssessment = {
  subgroupId: string;
  scores: RubricScores;
};

export function collectiveTotal(scores: RubricScores) {
  return rubricTotal(scores);
}

export function collectivePercent(scores: RubricScores) {
  return Math.round((collectiveTotal(scores) / rubricMaximum) * 100);
}

/** A parent group is a comparison cohort only; it is never independently assessed. */
export function comparisonCohortTotal(assessments: SubgroupAssessment[]) {
  if (assessments.length === 0) return 0;
  return Math.round(assessments.reduce((total, assessment) => total + collectiveTotal(assessment.scores), 0) / assessments.length);
}

export function comparisonCohortPercent(assessments: SubgroupAssessment[]) {
  if (assessments.length === 0) return 0;
  return Math.round((comparisonCohortTotal(assessments) / rubricMaximum) * 100);
}

export function subgroupRank(assessments: SubgroupAssessment[], subgroupId: string) {
  const ranked = [...assessments].sort((a, b) => collectivePercent(b.scores) - collectivePercent(a.scores));
  return ranked.findIndex(assessment => assessment.subgroupId === subgroupId) + 1;
}

export function replaceSubgroupAssessment(assessments: SubgroupAssessment[], submission: SubgroupAssessment) {
  return [...assessments.filter(assessment => assessment.subgroupId !== submission.subgroupId), submission];
}

/** Prototype-only grade rules: the strongest grade must be supported by subgroup evidence and performance within its comparison cohort. */
export function bestAvailableGrade(subgroupPercent: number, cohortPercent: number, rank: number) {
  if (subgroupPercent >= 85 && cohortPercent >= 80 && rank === 1) return { grade: "A", label: "Collective excellence" };
  if (subgroupPercent >= 70 && cohortPercent >= 65 && rank <= 2) return { grade: "B", label: "Strong collective performance" };
  if (subgroupPercent >= 55) return { grade: "C", label: "Collective standard met" };
  return { grade: "D", label: "Developing collective evidence" };
}

export function visibleSubgroupOutcome(assessments: SubgroupAssessment[], subgroupId: string) {
  const assessment = assessments.find(item => item.subgroupId === subgroupId);
  if (!assessment) throw new Error(`Assessment not found for ${subgroupId}`);
  const subgroupTotal = collectiveTotal(assessment.scores);
  const subgroupPercent = collectivePercent(assessment.scores);
  const cohortTotal = comparisonCohortTotal(assessments);
  const cohortPercent = comparisonCohortPercent(assessments);
  const rank = subgroupRank(assessments, subgroupId);
  return { subgroupTotal, subgroupPercent, cohortTotal, cohortPercent, rank, ...bestAvailableGrade(subgroupPercent, cohortPercent, rank) };
}
