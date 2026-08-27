export type CertificateCategory = {
  title: string;
  category: "best available" | "achieved" | "in progress";
  minimumScore: number;
  description: string;
  tone: string;
};

export type PrototypeCertification = CertificateCategory & {
  label: string;
  isBestAvailable: boolean;
};

export type RubricScore = 1 | 3 | 5;
export type RubricScores = RubricScore[];

export const rubricSections = [
  { section: "Business Concept", items: ["Clarity of Problem Statement", "Originality of the Idea", "Clarity of Proposed Solution"] },
  { section: "Value Proposition", items: ["Solution Fit", "Understanding of Target Market", "Differentiation"] },
  { section: "Scalability and Sustainability", items: ["Growth Strategy", "Market Size Potential", "Technology/Infrastructure Readiness"] },
  { section: "Team and Roles", items: ["Execution Capability", "Role Clarity", "Team Collaboration & Cohesion"] },
  { section: "Presentation Quality", items: ["Delivery and Confidence", "Visuals and Clarity", "Logical Structure & Flow"] },
] as const;

export const flatRubricCriteria = rubricSections.flatMap(section => section.items.map(item => ({ section: section.section, item })));
export const rubricMaximum = flatRubricCriteria.length * 5;
export const defaultRubricScores: RubricScores = Array<RubricScore>(flatRubricCriteria.length).fill(3);

/** Prototype-only certificate titles. The supplied rubric defines a total out of 75 but does not prescribe these category thresholds. */
export const certificateCategories: readonly CertificateCategory[] = [
  { title: "Level 1 Certificate · Distinction", category: "best available", minimumScore: 65, description: "Highest available certificate title for a subgroup with 65–75 points.", tone: "bg-[#e1f2ed] text-[#176f69]" },
  { title: "Level 1 Certificate · Achieved", category: "achieved", minimumScore: 50, description: "Certificate title for a subgroup with 50–64 points.", tone: "bg-[#eaf0fb] text-[#315d91]" },
  { title: "Certificate evidence in progress", category: "in progress", minimumScore: 0, description: "For a subgroup below 50 points; further rubric evidence is needed.", tone: "bg-[#fff3d9] text-[#996915]" },
];

export function prototypeCertification(total: number): PrototypeCertification {
  const category = certificateCategories.find(item => total >= item.minimumScore) ?? certificateCategories.at(-1)!;
  return {
    ...category,
    label: category.title,
    isBestAvailable: category.category === "best available",
  };
}

export function rubricTotal(scores: readonly number[]) {
  return scores.reduce((total, score) => total + score, 0);
}
