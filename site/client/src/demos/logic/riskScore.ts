/*
 * Community Success OS — risk scoring with attached evidence, re-implemented
 * for the demo.
 *
 * The property being demonstrated is the one the real product is built around:
 * a risk score is never shown without the evidence it was derived from. The
 * scoring here is a transparent weighted rule set — each triggered rule
 * contributes points and an explanation, and the UI renders both.
 */

export type StudentSignals = {
  name: string;
  /** Sessions attended out of the last 6. */
  attendedOfSix: number;
  /** Days since the student last did anything observable. */
  inactiveDays: number;
  /** Course progress, percent. */
  progressPercent: number;
  /** Days until the renewal date. Negative means overdue. */
  renewalInDays: number;
  /** Whether the student has posted in the community in the last 30 days. */
  communityActive: boolean;
};

export type RiskReason = {
  rule: string;
  points: number;
  evidence: string;
};

export type RiskBand = "healthy" | "watch" | "at-risk";

export type RiskAssessment = {
  score: number;
  band: RiskBand;
  reasons: RiskReason[];
  recommendation: string;
};

/** Each rule fires independently; the assessment is the sum plus the trace. */
export function assess(signals: StudentSignals): RiskAssessment {
  const reasons: RiskReason[] = [];

  if (signals.attendedOfSix <= 2) {
    reasons.push({
      rule: "attendance-collapse",
      points: 35,
      evidence: `Attended ${signals.attendedOfSix} of the last 6 sessions.`,
    });
  } else if (signals.attendedOfSix <= 4) {
    reasons.push({
      rule: "attendance-dip",
      points: 15,
      evidence: `Attended ${signals.attendedOfSix} of the last 6 sessions.`,
    });
  }

  if (signals.inactiveDays >= 14) {
    reasons.push({
      rule: "gone-quiet",
      points: 30,
      evidence: `No observable activity for ${signals.inactiveDays} days.`,
    });
  } else if (signals.inactiveDays >= 7) {
    reasons.push({
      rule: "quiet-week",
      points: 12,
      evidence: `No observable activity for ${signals.inactiveDays} days.`,
    });
  }

  if (signals.progressPercent < 30) {
    reasons.push({
      rule: "progress-stall",
      points: 20,
      evidence: `Course progress at ${signals.progressPercent}%.`,
    });
  }

  if (signals.renewalInDays <= 14 && signals.renewalInDays >= 0) {
    reasons.push({
      rule: "renewal-window",
      points: 15,
      evidence: `Renewal due in ${signals.renewalInDays} days.`,
    });
  } else if (signals.renewalInDays < 0) {
    reasons.push({
      rule: "renewal-overdue",
      points: 25,
      evidence: `Renewal overdue by ${-signals.renewalInDays} days.`,
    });
  }

  if (!signals.communityActive) {
    reasons.push({
      rule: "community-silent",
      points: 8,
      evidence: "No community activity in the last 30 days.",
    });
  }

  const score = Math.min(100, reasons.reduce((sum, reason) => sum + reason.points, 0));
  const band: RiskBand = score >= 55 ? "at-risk" : score >= 25 ? "watch" : "healthy";

  return { score, band, reasons, recommendation: recommend(band, reasons) };
}

function recommend(band: RiskBand, reasons: RiskReason[]): string {
  if (band === "healthy") return "No intervention needed. Keep the loop as it is.";
  const top = [...reasons].sort((a, b) => b.points - a.points)[0];
  switch (top?.rule) {
    case "attendance-collapse":
    case "attendance-dip":
      return "Personal check-in about the session schedule — the pattern points at a timing problem, not motivation.";
    case "gone-quiet":
    case "quiet-week":
      return "Light-touch re-engagement message referencing their last completed work.";
    case "renewal-overdue":
    case "renewal-window":
      return "Renewal conversation with their progress evidence in hand.";
    case "progress-stall":
      return "Offer a working session on the module where progress stopped.";
    default:
      return "Invite back into the community with a concrete prompt.";
  }
}

export type InterventionOutcome = "re-engaged" | "no-response" | "churned";

/** Interventions taken during the demo session, newest first. */
export type InterventionRecord = {
  student: string;
  action: string;
  outcome: InterventionOutcome | null;
};

export const seedStudents: StudentSignals[] = [
  { name: "Salma Ibrahim", attendedOfSix: 6, inactiveDays: 1, progressPercent: 72, renewalInDays: 90, communityActive: true },
  { name: "Karim Mostafa", attendedOfSix: 3, inactiveDays: 9, progressPercent: 41, renewalInDays: 30, communityActive: false },
  { name: "Dina Farouk", attendedOfSix: 1, inactiveDays: 18, progressPercent: 22, renewalInDays: 6, communityActive: false },
  { name: "Ahmed Tarek", attendedOfSix: 5, inactiveDays: 3, progressPercent: 58, renewalInDays: -4, communityActive: true },
];
