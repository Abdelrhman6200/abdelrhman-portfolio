/*
 * Feedback Copilot — the approval state machine, re-implemented for the demo.
 *
 * This is the same contract the real application enforces server-side: a draft
 * cannot be sent until a coordinator approves it, and each role can only take
 * the actions that belong to it. The demo runs the machine in the browser so a
 * visitor can feel the gate working; the shipped app enforces it in tRPC
 * procedures with automated tests.
 *
 * The "generate" step here is template-based. The real application streams the
 * draft from an LLM; a canned template keeps the demo honest about what it is
 * (no model behind this page) while preserving the workflow being shown.
 */

export type FeedbackStatus = "draft" | "pending_review" | "approved";
export type Role = "teacher" | "coordinator";

export type FeedbackState = {
  status: FeedbackStatus;
  /** The three sections the real product structures a draft into. */
  strengths: string;
  improvements: string;
  nextSteps: string;
  coordinatorComment: string | null;
  /** Every transition that happened, oldest first. The real app persists this. */
  history: Array<{ actor: Role; action: string; at: number }>;
};

export type FeedbackAction =
  | { type: "generate"; evidence: string; studentName: string }
  | { type: "edit"; field: "strengths" | "improvements" | "nextSteps"; value: string }
  | { type: "submit_for_review" }
  | { type: "approve" }
  | { type: "return_to_draft"; comment: string };

/** Which actions each role may take in each status. The demo UI reads this to
 *  disable controls; `reduce` enforces it regardless, like the real server. */
export const permitted: Record<FeedbackStatus, Record<Role, FeedbackAction["type"][]>> = {
  draft: {
    teacher: ["generate", "edit", "submit_for_review"],
    coordinator: [],
  },
  pending_review: {
    teacher: [],
    coordinator: ["approve", "return_to_draft"],
  },
  approved: {
    teacher: [],
    coordinator: [],
  },
};

export const initialFeedback: FeedbackState = {
  status: "draft",
  strengths: "",
  improvements: "",
  nextSteps: "",
  coordinatorComment: null,
  history: [],
};

/** Deterministic template draft, standing in for the streamed LLM draft. */
export function draftFromEvidence(evidence: string, studentName: string) {
  const first = studentName.trim().split(/\s+/)[0] || "The student";
  const observed = evidence.trim() || "the recorded session activity";
  return {
    strengths: `${first} engaged consistently through the session. Based on ${observed}, participation and completed work both show clear effort.`,
    improvements: `${first} would benefit from more structured practice on the areas flagged in the session notes, particularly where tasks were attempted but not finished.`,
    nextSteps: `1. Review the flagged exercises together next session.\n2. Set one concrete practice goal for the week.\n3. Re-check the same skill in two weeks to confirm the gap is closing.`,
  };
}

export class ForbiddenTransition extends Error {}

/**
 * Applies one action, enforcing role and status exactly the way the real
 * server does — an action outside `permitted` throws rather than no-ops, so
 * the demo cannot drift from the contract it claims to show.
 */
export function reduce(state: FeedbackState, role: Role, action: FeedbackAction, at = 0): FeedbackState {
  if (!permitted[state.status][role].includes(action.type)) {
    throw new ForbiddenTransition(
      `${role} may not ${action.type} while feedback is ${state.status.replace("_", " ")}`
    );
  }

  const log = (actionLabel: string): FeedbackState["history"] => [
    ...state.history,
    { actor: role, action: actionLabel, at },
  ];

  switch (action.type) {
    case "generate": {
      const draft = draftFromEvidence(action.evidence, action.studentName);
      return { ...state, ...draft, history: log("generated a structured draft") };
    }
    case "edit":
      return { ...state, [action.field]: action.value, history: state.history };
    case "submit_for_review":
      return { ...state, status: "pending_review", history: log("submitted for review") };
    case "approve":
      return { ...state, status: "approved", coordinatorComment: null, history: log("approved") };
    case "return_to_draft":
      return {
        ...state,
        status: "draft",
        coordinatorComment: action.comment || "Please revise before resubmitting.",
        history: log("returned to draft"),
      };
  }
}

/** True when the draft has enough substance to submit. */
export function canSubmit(state: FeedbackState): boolean {
  return [state.strengths, state.improvements, state.nextSteps].every(
    (section) => section.trim().length >= 20
  );
}
