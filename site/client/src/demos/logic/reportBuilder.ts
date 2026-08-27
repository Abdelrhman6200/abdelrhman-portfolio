/*
 * Questionnaire to Report — validation and template fill, re-implemented for
 * the demo.
 *
 * The original tool's point was that the questionnaire validates itself before
 * anything is generated, so the report can never be produced from bad inputs.
 * That ordering is preserved: `buildReport` refuses to assemble until
 * `validateAnswers` returns clean.
 */

export type Answers = {
  studentName: string;
  courseTitle: string;
  completionPercent: string;
  highlight: string;
  mentorName: string;
};

export type FieldError = { field: keyof Answers; message: string };

export function validateAnswers(answers: Answers): FieldError[] {
  const errors: FieldError[] = [];

  if (answers.studentName.trim().length < 3) {
    errors.push({ field: "studentName", message: "Student name needs at least 3 characters." });
  }
  if (answers.courseTitle.trim().length < 3) {
    errors.push({ field: "courseTitle", message: "Course title needs at least 3 characters." });
  }

  const completion = Number(answers.completionPercent);
  if (answers.completionPercent.trim() === "" || Number.isNaN(completion)) {
    errors.push({ field: "completionPercent", message: "Completion must be a number." });
  } else if (completion < 0 || completion > 100) {
    errors.push({ field: "completionPercent", message: "Completion must be between 0 and 100." });
  }

  if (answers.highlight.trim().length < 12) {
    errors.push({ field: "highlight", message: "Give the highlight at least a full sentence." });
  }
  if (answers.mentorName.trim().length < 3) {
    errors.push({ field: "mentorName", message: "Mentor name needs at least 3 characters." });
  }

  return errors;
}

export type Report = {
  title: string;
  subtitle: string;
  sections: Array<{ heading: string; body: string }>;
  footer: string;
};

export class InvalidAnswers extends Error {}

/** Fills the template. Throws if the answers have not passed validation. */
export function buildReport(answers: Answers): Report {
  if (validateAnswers(answers).length > 0) {
    throw new InvalidAnswers("Report generation requires validated answers.");
  }

  const completion = Number(answers.completionPercent);
  const standing =
    completion >= 90 ? "an outstanding" : completion >= 70 ? "a strong" : completion >= 40 ? "a developing" : "an early-stage";

  return {
    title: `${answers.courseTitle.trim()} — Progress Report`,
    subtitle: `Prepared for ${answers.studentName.trim()}`,
    sections: [
      {
        heading: "Completion",
        body: `${answers.studentName.trim()} has completed ${completion}% of ${answers.courseTitle.trim()}, ${standing} position at this point in the programme.`,
      },
      {
        heading: "Highlight",
        body: answers.highlight.trim(),
      },
      {
        heading: "Next review",
        body: `Progress will be reviewed with ${answers.mentorName.trim()} at the next scheduled session.`,
      },
    ],
    footer: `Generated from a validated questionnaire · Mentor: ${answers.mentorName.trim()}`,
  };
}

export const emptyAnswers: Answers = {
  studentName: "",
  courseTitle: "",
  completionPercent: "",
  highlight: "",
  mentorName: "",
};

export const exampleAnswers: Answers = {
  studentName: "Mariam Hassan",
  courseTitle: "Systems Thinking Lab",
  completionPercent: "78",
  highlight: "Mariam led her group's process-mapping exercise and turned it into a working checklist the whole cohort now uses.",
  mentorName: "A. Shoman",
};
