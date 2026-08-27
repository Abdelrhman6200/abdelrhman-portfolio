/*
 * Demo registry — the one place that knows which demos exist.
 *
 * Components load lazily: the home page reads only this metadata, so the
 * seven demos (and everything they import) stay out of the initial bundle
 * and arrive as their own chunks when a demo is actually opened.
 *
 * `kinds` maps each demo to the project cards that should link to it (a demo
 * can serve both a shipped app and the operational case file it grew out of).
 */
import type { ComponentType } from "react";

export type DemoEntry = {
  slug: string;
  title: string;
  /** Dynamic import, so each demo becomes its own build chunk. */
  load: () => Promise<{ default: ComponentType }>;
  /** Project `kind`s whose cards link to this demo. */
  kinds: string[];
};

export const demos: DemoEntry[] = [
  { slug: "feedback", title: "Feedback Copilot", load: () => import("./FeedbackDemo"), kinds: ["feedback", "feedback-brief"] },
  { slug: "ops", title: "EdTech Ops Intelligence", load: () => import("./OpsDemo"), kinds: ["ops-intelligence"] },
  { slug: "success", title: "Community Success OS", load: () => import("./SuccessDemo"), kinds: ["success"] },
  { slug: "validation", title: "Smart Excel Validation", load: () => import("./ValidationDemo"), kinds: ["validation"] },
  { slug: "sessions", title: "Session Link Automation", load: () => import("./SessionsDemo"), kinds: ["session-links", "coding"] },
  { slug: "report", title: "Questionnaire to Report", load: () => import("./ReportDemo"), kinds: ["questionnaire"] },
  { slug: "agent", title: "AI Operational Agent", load: () => import("./AgentDemo"), kinds: ["agent"] },
];

export function demoBySlug(slug: string): DemoEntry | undefined {
  return demos.find((demo) => demo.slug === slug);
}

/** The demo route for a project kind, or null when that project has no demo. */
export function demoPathFor(kind: string): string | null {
  const entry = demos.find((demo) => demo.kinds.includes(kind));
  return entry ? `/demo/${entry.slug}` : null;
}
