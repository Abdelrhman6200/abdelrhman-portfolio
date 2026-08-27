import { z } from "zod";

export const feedbackStatusValues = [
  "draft",
  "pending review",
  "approved",
] as const;

export type FeedbackStatus = (typeof feedbackStatusValues)[number];

export const feedbackSectionsSchema = z.object({
  strengths: z.string().trim().min(1).max(3000),
  areasForImprovement: z.string().trim().min(1).max(3000),
  nextSteps: z.string().trim().min(1).max(3000),
});

export type FeedbackSections = z.infer<typeof feedbackSectionsSchema>;

export const feedbackJsonSchema = {
  name: "structured_student_feedback",
  strict: true,
  schema: {
    type: "object",
    properties: {
      strengths: { type: "string" },
      areasForImprovement: { type: "string" },
      nextSteps: { type: "string" },
    },
    required: ["strengths", "areasForImprovement", "nextSteps"],
    additionalProperties: false,
  },
} as const;

type FeedbackContext = {
  studentName: string;
  sessionTopic: string;
  evidence: string;
};

export function buildFeedbackMessages(context: FeedbackContext) {
  return [
    {
      role: "system" as const,
      content:
        "You are a controlled feedback copilot for teachers. Use only direct evidence supplied in the session record. Do not invent facts, diagnose a student, compare students, predict outcomes, or state unsupported claims. Write concise, warm, parent-facing feedback. Always use exactly these three headings: Strengths, Areas for Improvement, and Next Steps.",
    },
    {
      role: "user" as const,
      content: `Student: ${context.studentName}\nSession topic: ${context.sessionTopic}\n\nSession evidence:\n${context.evidence}`,
    },
  ];
}

function sectionAfter(
  content: string,
  heading: string,
  otherHeadings: string[]
) {
  const matcher = new RegExp(
    `(?:^|\\n)\\s*(?:#{1,3}\\s*)?\\**${heading}\\**\\s*:?[\\s\\r\\n]*`,
    "i"
  );
  const startMatch = matcher.exec(content);
  if (!startMatch || startMatch.index === undefined) return "";

  const start = startMatch.index + startMatch[0].length;
  const tail = content.slice(start);
  const nextMatcher = new RegExp(
    `(?:^|\\n)\\s*(?:#{1,3}\\s*)?\\**(?:${otherHeadings.join("|")})\\**\\s*:?[\\s\\r\\n]*`,
    "i"
  );
  const endMatch = nextMatcher.exec(tail);
  return tail.slice(0, endMatch?.index ?? tail.length).trim();
}

export function parseStructuredFeedback(content: string): FeedbackSections {
  const strengths = sectionAfter(content, "Strengths", [
    "Areas for Improvement",
    "Next Steps",
  ]);
  const areasForImprovement = sectionAfter(content, "Areas for Improvement", [
    "Strengths",
    "Next Steps",
  ]);
  const nextSteps = sectionAfter(content, "Next Steps", [
    "Strengths",
    "Areas for Improvement",
  ]);

  return {
    strengths: strengths || "No strength could be extracted from the generated draft.",
    areasForImprovement:
      areasForImprovement ||
      "No area for improvement could be extracted from the generated draft.",
    nextSteps:
      nextSteps ||
      "No next step could be extracted from the generated draft.",
  };
}
