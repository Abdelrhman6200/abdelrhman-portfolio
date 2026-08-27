/*
 * Demo registry — the one place that knows which demos exist.
 *
 * `kinds` maps each demo to the project cards that should link to it (a demo
 * can serve both a shipped app and the operational case file it grew out of,
 * e.g. Feedback Copilot and its AI-Assisted Feedback precursor).
 */
import type { ComponentType } from "react";
import AgentDemo from "./AgentDemo";
import FeedbackDemo from "./FeedbackDemo";
import OpsDemo from "./OpsDemo";
import ReportDemo from "./ReportDemo";
import SessionsDemo from "./SessionsDemo";
import SuccessDemo from "./SuccessDemo";
import ValidationDemo from "./ValidationDemo";

export type DemoEntry = {
  slug: string;
  title: string;
  component: ComponentType;
  /** Project `kind`s whose cards link to this demo. */
  kinds: string[];
};

export const demos: DemoEntry[] = [
  { slug: "feedback", title: "Feedback Copilot", component: FeedbackDemo, kinds: ["feedback", "feedback-brief"] },
  { slug: "ops", title: "EdTech Ops Intelligence", component: OpsDemo, kinds: ["ops-intelligence"] },
  { slug: "success", title: "Community Success OS", component: SuccessDemo, kinds: ["success"] },
  { slug: "validation", title: "Smart Excel Validation", component: ValidationDemo, kinds: ["validation"] },
  { slug: "sessions", title: "Session Link Automation", component: SessionsDemo, kinds: ["session-links", "coding"] },
  { slug: "report", title: "Questionnaire to Report", component: ReportDemo, kinds: ["questionnaire"] },
  { slug: "agent", title: "AI Operational Agent", component: AgentDemo, kinds: ["agent"] },
];

export function demoBySlug(slug: string): DemoEntry | undefined {
  return demos.find((demo) => demo.slug === slug);
}

/** The demo route for a project kind, or null when that project has no demo. */
export function demoPathFor(kind: string): string | null {
  const entry = demos.find((demo) => demo.kinds.includes(kind));
  return entry ? `/demo/${entry.slug}` : null;
}
