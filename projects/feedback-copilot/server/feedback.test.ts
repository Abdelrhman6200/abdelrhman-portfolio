import { describe, expect, it } from "vitest";
import { buildFeedbackMessages, parseStructuredFeedback } from "./feedback";

describe("feedback contract", () => {
  it("keeps the three required feedback sections when parsing a draft", () => {
    const result = parseStructuredFeedback(`## Strengths\n- Explained the solution clearly.\n\n## Areas for Improvement\n- Needed a prompt to combine conditions.\n\n## Next Steps\n- Practise two-condition examples.`);

    expect(result).toEqual({
      strengths: "- Explained the solution clearly.",
      areasForImprovement: "- Needed a prompt to combine conditions.",
      nextSteps: "- Practise two-condition examples.",
    });
  });

  it("constrains generation to direct session evidence", () => {
    const messages = buildFeedbackMessages({
      studentName: "Sample learner",
      sessionTopic: "Conditionals",
      evidence: "The learner created an if statement after a prompt.",
    });

    expect(messages[0].content).toContain("Use only direct evidence");
    expect(messages[0].content).toContain("Strengths, Areas for Improvement, and Next Steps");
  });

  it("supplies a safe placeholder when a required section is omitted", () => {
    const result = parseStructuredFeedback(`## Strengths\n- Clear explanation.\n\n## Next Steps\n- Practise one further example.`);

    expect(result?.areasForImprovement).toBe("No area for improvement could be extracted from the generated draft.");
  });
});
