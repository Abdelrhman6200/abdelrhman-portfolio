/*
 * Simulation specs — one per project.
 *
 * Each describes the pipeline the project actually implements: what unit of
 * work flows through it, and what each stage does to that unit. The stages here
 * mirror the `flow` on the matching project in `portfolio.ts`; the `detail`
 * lines are what the diagram cannot say on its own.
 *
 * `startCount` seeds the completed counter so a card never reads a flat zero.
 * It is a display seed for a simulated pipeline, not a claimed metric — no
 * figure here is presented anywhere as a real-world result.
 */
import type { SimulationSpec } from "@/components/SystemSimulation";

export const simulations: Record<string, SimulationSpec> = {
  /* -------- Built software -------- */
  "ops-intelligence": {
    unit: "signal",
    units: "signals",
    accent: "coral",
    tickMs: 1000,
    startCount: 148,
    stages: [
      { label: "Ingest", detail: "An operational record arrives — a session, an attendance mark, a KPI reading." },
      { label: "Monitor", detail: "Scored for completeness, accuracy and freshness before anyone reads it." },
      { label: "Detect", detail: "Compared against the KPI's target and threshold; a breach raises an anomaly." },
      { label: "Investigate", detail: "An analyst drills into the evidence behind the number and records a cause." },
      { label: "Resolve", detail: "Outcome written to the immutable audit trail, with the actor attached." },
    ],
  },
  feedback: {
    unit: "draft",
    units: "drafts",
    accent: "orange",
    tickMs: 1150,
    startCount: 92,
    stages: [
      { label: "Evidence", detail: "Session notes and observations for one learner are gathered as context." },
      { label: "Draft", detail: "The model returns Strengths, Areas for Improvement and Next Steps — structured, not freeform." },
      { label: "Edit", detail: "The teacher rewrites anything the model got wrong. Their words win." },
      { label: "Review", detail: "A coordinator reads it and can comment or return it to draft." },
      { label: "Approve", detail: "Only an approved draft can be sent. The gate is the product." },
    ],
  },
  success: {
    unit: "student",
    units: "students",
    accent: "yellow",
    tickMs: 1050,
    startCount: 216,
    stages: [
      { label: "Signal", detail: "Engagement, attendance and progress changes land as observable events." },
      { label: "Student 360", detail: "Signals are assembled into one view of the learner, not five dashboards." },
      { label: "Risk", detail: "The view is scored — but the evidence behind the score stays attached to it." },
      { label: "Intervene", detail: "A human picks the action. The system supplies the reasons, not the decision." },
      { label: "Renew", detail: "The outcome feeds back into which signals count as risk next time." },
    ],
  },

  /* -------- Operational case files -------- */
  "session-links": {
    unit: "session",
    units: "sessions",
    accent: "coral",
    tickMs: 850,
    startCount: 1284,
    stages: [
      { label: "Brief", detail: "A scheduled session enters the run with its cohort and timing." },
      { label: "Teams", detail: "The meeting is created through Power Automate rather than by hand." },
      { label: "Naming", detail: "The convention is applied automatically, so the link is findable later." },
      { label: "Distribute", detail: "The link reaches the right cohort without a manual send." },
      { label: "Attendance", detail: "The session is bound to its attendance record at creation, not after." },
    ],
  },
  validation: {
    unit: "record",
    units: "records",
    accent: "orange",
    tickMs: 780,
    startCount: 3960,
    stages: [
      { label: "Entry", detail: "A student record arrives from the field, in whatever shape it was typed." },
      { label: "Rules", detail: "Conditional logic checks required fields, formats and cross-field conflicts." },
      { label: "Exceptions", detail: "Anything that fails is flagged — the record is held, not silently corrected." },
      { label: "Review", detail: "A person decides. Automation finds the problem; judgment resolves it." },
      { label: "Clean", detail: "The record is released downstream only once it can be trusted." },
    ],
  },
  cgf: {
    unit: "learner",
    units: "learners",
    accent: "yellow",
    tickMs: 1000,
    startCount: 74,
    stages: [
      { label: "Landing", detail: "A prospective learner arrives and sees what the course actually contains." },
      { label: "Checkout", detail: "Payment completes and the account is created in the same step." },
      { label: "Enrollment", detail: "Access rights are granted immediately — no manual provisioning queue." },
      { label: "Dashboard", detail: "The learner lands somewhere that already knows who they are." },
      { label: "Content", detail: "Material unlocks according to entitlement, checked on every request." },
    ],
  },
  agent: {
    unit: "question",
    units: "questions",
    accent: "coral",
    tickMs: 900,
    startCount: 512,
    stages: [
      { label: "Question", detail: "An employee asks something a colleague would otherwise be interrupted for." },
      { label: "Understand", detail: "The request is interpreted against the organization's own vocabulary." },
      { label: "Retrieve", detail: "The relevant SOP is fetched — retrieval, so the answer has a source." },
      { label: "Answer", detail: "The procedure is returned with the document it came from." },
      { label: "Next action", detail: "The answer ends in something the person can actually do." },
    ],
  },
  dashboard: {
    unit: "project",
    units: "projects",
    accent: "orange",
    tickMs: 950,
    startCount: 640,
    stages: [
      { label: "Intake", detail: "A submitted student project enters the assessment queue." },
      { label: "Grade", detail: "Assessed against the shared rubric, so scores stay comparable." },
      { label: "Track", detail: "Status is visible to everyone who needs it, without asking." },
      { label: "Certify", detail: "A pass moves to certification with its evidence attached." },
      { label: "Issue", detail: "The certificate is generated from the record, not retyped." },
    ],
  },
  questionnaire: {
    unit: "report",
    units: "reports",
    accent: "yellow",
    tickMs: 900,
    startCount: 128,
    stages: [
      { label: "Questionnaire", detail: "Structured answers are collected instead of a blank document." },
      { label: "Validation", detail: "The form checks itself before anything is generated." },
      { label: "Template", detail: "Validated answers are merged into a maintained template." },
      { label: "PPTX", detail: "A deck is produced with consistent structure every time." },
      { label: "PDF", detail: "A distributable version comes out of the same source." },
    ],
  },
};

/** Projects without a bespoke simulation fall back to their documented flow. */
export function simulationFor(
  kind: string,
  flow: string[],
  accent: SimulationSpec["accent"]
): SimulationSpec {
  const existing = simulations[kind];
  if (existing) return existing;

  return {
    unit: "item",
    units: "items",
    accent,
    tickMs: 1000,
    startCount: 0,
    stages: flow.map((label) => ({
      label,
      detail: `${label} — one stage of this system's documented flow.`,
    })),
  };
}
