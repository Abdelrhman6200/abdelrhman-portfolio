/*
 * Feedback Copilot demo — an app-shaped workspace, not a form.
 *
 * Three students arrive in three different states (a blank draft, one waiting
 * in the review queue, one already approved), so the whole lifecycle is
 * visible on load. The visitor works both roles via the identity chip, and
 * the draft "streams" in — a presentation effect over an instant template
 * fill, labelled as such; the shipped app streams from an LLM.
 *
 * Every mutation goes through the same reducer the logic tests pin, so the
 * gate shown here is enforced by the machine, not by disabled buttons.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleUserRound, CornerDownLeft, Send, Sparkles } from "lucide-react";
import DemoShell from "./DemoShell";
import AppWindow from "./AppWindow";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  canSubmit,
  initialFeedback,
  permitted,
  reduce,
  type FeedbackState,
  type Role,
} from "./logic/feedbackMachine";

/* --- Seeded roster ---------------------------------------------------------
 * Built through the reducer itself, so the seeds cannot drift from what the
 * machine actually allows. */
type StudentFile = { name: string; className: string; evidence: string; state: FeedbackState };

function seedPending(name: string, evidence: string): FeedbackState {
  const drafted = reduce(initialFeedback, "teacher", { type: "generate", evidence, studentName: name }, 1);
  return reduce(drafted, "teacher", { type: "submit_for_review" }, 2);
}
function seedApproved(name: string, evidence: string): FeedbackState {
  return reduce(seedPending(name, evidence), "coordinator", { type: "approve" }, 3);
}

const seedRoster: StudentFile[] = [
  {
    name: "Mariam Hassan",
    className: "Web Development / C03",
    evidence:
      "Attended 5 of 6 sessions. Finished the flexbox exercises; the grid task was attempted but left incomplete.",
    state: initialFeedback,
  },
  {
    name: "Omar Khaled",
    className: "Data Analysis / C02",
    evidence: "Attended 4 of 6 sessions. Strong on the pivot-table work; the SQL joins exercise needs another pass.",
    state: seedPending("Omar Khaled", "the pivot-table work and the unfinished SQL joins exercise"),
  },
  {
    name: "Nour Adel",
    className: "AI Fundamentals / C01",
    evidence: "Attended 6 of 6. Completed the classification project early and helped two classmates debug theirs.",
    state: seedApproved("Nour Adel", "a completed classification project and peer debugging help"),
  },
];

const statusLabel: Record<FeedbackState["status"], string> = {
  draft: "DRAFT",
  pending_review: "PENDING REVIEW",
  approved: "APPROVED",
};
const rosterLabel: Record<FeedbackState["status"], string> = {
  draft: "draft",
  pending_review: "in review",
  approved: "approved",
};

/** Presentation-only reveal: the machine holds the full text immediately;
 *  the document displays a growing slice. Instant in tests and under
 *  prefers-reduced-motion. */
function useReveal() {
  const [progress, setProgress] = useState<number | null>(null); // chars revealed
  const timer = useRef<number | null>(null);

  const reduced = useReducedMotion();
  const instant = import.meta.env.MODE === "test" || reduced;

  const start = (totalChars: number) => {
    if (instant) return;
    setProgress(0);
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setProgress((current) => {
        if (current === null || current >= totalChars) {
          if (timer.current !== null) window.clearInterval(timer.current);
          return null;
        }
        return current + 4;
      });
    }, 16);
  };

  const cancel = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    setProgress(null);
  };

  useEffect(() => cancel, []);
  return { progress, start, cancel, streaming: progress !== null };
}

const SECTIONS = [
  ["strengths", "STRENGTHS"],
  ["improvements", "AREAS FOR IMPROVEMENT"],
  ["nextSteps", "NEXT STEPS"],
] as const;

export default function FeedbackDemo() {
  const [roster, setRoster] = useState<StudentFile[]>(seedRoster);
  const [selected, setSelected] = useState(0);
  const [role, setRole] = useState<Role>("teacher");
  const [returnComment, setReturnComment] = useState("");
  const reveal = useReveal();

  const student = roster[selected];
  const state = student.state;

  const may = (action: string) => permitted[state.status][role].includes(action as never);
  const apply = (action: Parameters<typeof reduce>[2]) =>
    setRoster((current) =>
      current.map((file, index) =>
        index === selected
          ? { ...file, state: reduce(file.state, role, action, file.state.history.length + 1) }
          : file
      )
    );

  const pendingCount = roster.filter((file) => file.state.status === "pending_review").length;

  /** During a reveal, each section shows its share of the growing slice. */
  const displayed = useMemo(() => {
    if (reveal.progress === null) return state;
    let budget = reveal.progress;
    const out = { ...state };
    for (const [field] of SECTIONS) {
      const full = state[field];
      out[field] = full.slice(0, Math.max(0, budget));
      budget -= full.length;
    }
    return out;
  }, [state, reveal.progress]);

  const generate = () => {
    apply({ type: "generate", evidence: student.evidence, studentName: student.name });
    // Length of what was just generated — recompute from the reducer's own output.
    const draft = reduce(state, "teacher", {
      type: "generate",
      evidence: student.evidence,
      studentName: student.name,
    });
    reveal.start(draft.strengths.length + draft.improvements.length + draft.nextSteps.length);
  };

  const selectStudent = (index: number) => {
    reveal.cancel();
    setSelected(index);
    setReturnComment("");
  };

  return (
    <DemoShell
      title="Feedback Copilot"
      lede="A working slice of the product: three students in three lifecycle states. Draft as the teacher, then switch identity and try to approve your own work — the machine holds the gate, not the buttons."
      caseFileSlug="feedback-copilot"
    >
      <AppWindow
        name="Feedback Copilot — workspace"
        meta={
          <span className="app-identity" role="group" aria-label="Signed in as">
            <CircleUserRound size={13} aria-hidden="true" />
            {(["teacher", "coordinator"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={role === option ? "is-active" : ""}
                aria-pressed={role === option}
                onClick={() => setRole(option)}
              >
                {option}
              </button>
            ))}
          </span>
        }
      >
        <div className="fb-layout">
          {/* --- Left rail: roster + evidence --------------------------------- */}
          <aside className="fb-rail">
            <div className="fb-rail-head">
              <span>STUDENTS</span>
              {role === "coordinator" && pendingCount > 0 && (
                <b className="fb-queue-badge">{pendingCount} in queue</b>
              )}
            </div>
            {roster.map((file, index) => (
              <button
                key={file.name}
                type="button"
                className={`fb-student ${index === selected ? "is-active" : ""}`}
                aria-pressed={index === selected}
                onClick={() => selectStudent(index)}
              >
                <span className="fb-avatar" aria-hidden="true">
                  {file.name.split(" ").map((part) => part[0]).join("")}
                </span>
                <span className="fb-student-copy">
                  <b>{file.name}</b>
                  <small>{file.className}</small>
                </span>
                <i className={`fb-chip fb-chip-${file.state.status}`}>{rosterLabel[file.state.status]}</i>
              </button>
            ))}

            <div className="fb-evidence">
              <span>SESSION EVIDENCE</span>
              <textarea
                rows={4}
                value={student.evidence}
                aria-label="Session evidence"
                onChange={(event) =>
                  setRoster((current) =>
                    current.map((file, index) =>
                      index === selected ? { ...file, evidence: event.target.value } : file
                    )
                  )
                }
                disabled={!may("generate")}
              />
              <p className="demo-hint">
                The draft is generated from this. In the demo it fills from a fixed template; the shipped app
                streams it from an LLM.
              </p>
            </div>
          </aside>

          {/* --- Document ------------------------------------------------------ */}
          <section className="fb-doc-wrap" aria-label="Feedback document">
            <header className="fb-doc-head">
              <div>
                <h2>{student.name}</h2>
                <small>{student.className}</small>
              </div>
              <span className={`demo-status demo-status-${state.status}`}>{statusLabel[state.status]}</span>
            </header>

            {state.coordinatorComment && state.status === "draft" && (
              <p className="demo-note demo-note-warn">
                <CornerDownLeft size={13} aria-hidden="true" /> Returned: “{state.coordinatorComment}”
              </p>
            )}

            <div className={`fb-doc ${reveal.streaming ? "is-streaming" : ""}`}>
              {SECTIONS.map(([field, label]) => (
                <label key={field} className="fb-doc-section">
                  <span>{label}</span>
                  <textarea
                    rows={field === "nextSteps" ? 4 : 3}
                    value={displayed[field]}
                    aria-label={label}
                    placeholder={may("edit") ? "Generate from the evidence, or write your own…" : "—"}
                    onChange={(event) => apply({ type: "edit", field, value: event.target.value })}
                    disabled={!may("edit") || reveal.streaming}
                  />
                </label>
              ))}
              {reveal.streaming && <span className="fb-caret" aria-hidden="true" />}
            </div>

            <footer className="fb-doc-actions">
              {state.status === "draft" && (
                <>
                  <button
                    type="button"
                    className="demo-action"
                    disabled={!may("generate") || reveal.streaming}
                    onClick={generate}
                  >
                    <Sparkles size={13} aria-hidden="true" /> Generate from evidence
                  </button>
                  <button
                    type="button"
                    className="demo-action demo-action-primary"
                    disabled={!may("submit_for_review") || !canSubmit(state) || reveal.streaming}
                    onClick={() => apply({ type: "submit_for_review" })}
                  >
                    <Send size={13} aria-hidden="true" /> Submit for review
                  </button>
                  {role === "coordinator" && (
                    <span className="demo-hint">
                      A coordinator cannot touch a draft — that boundary is the product.
                    </span>
                  )}
                </>
              )}

              {state.status === "pending_review" &&
                (role === "coordinator" ? (
                  <div className="fb-review-bar">
                    <input
                      value={returnComment}
                      aria-label="Return comment"
                      placeholder="Optional note if returning…"
                      onChange={(event) => setReturnComment(event.target.value)}
                    />
                    <button
                      type="button"
                      className="demo-action demo-action-primary"
                      onClick={() => apply({ type: "approve" })}
                    >
                      <Check size={13} aria-hidden="true" /> Approve
                    </button>
                    <button
                      type="button"
                      className="demo-action"
                      onClick={() => {
                        apply({ type: "return_to_draft", comment: returnComment });
                        setReturnComment("");
                      }}
                    >
                      <CornerDownLeft size={13} aria-hidden="true" /> Return
                    </button>
                  </div>
                ) : (
                  <span className="demo-hint">
                    Locked while in review. Switch identity to coordinator to act on it.
                  </span>
                ))}

              {state.status === "approved" && (
                <p className="demo-note demo-note-good">
                  <Check size={13} aria-hidden="true" /> Approved — only now could this be sent. No path skips
                  the review.
                </p>
              )}
            </footer>

            <div className="fb-timeline" aria-label="Transition history">
              {state.history.length === 0 ? (
                <span className="demo-hint">Every transition lands here with its actor — the shipped app persists these as append-only events.</span>
              ) : (
                state.history.map((entry, index) => (
                  <span key={index} className="fb-timeline-item">
                    <i className={`fb-dot fb-dot-${entry.actor}`} aria-hidden="true" />
                    <b>{entry.actor}</b> {entry.action}
                  </span>
                ))
              )}
            </div>
          </section>
        </div>
      </AppWindow>
    </DemoShell>
  );
}
