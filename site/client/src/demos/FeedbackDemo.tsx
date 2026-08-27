/*
 * Feedback Copilot demo.
 *
 * The visitor plays both roles. As the teacher: generate a draft, edit it,
 * submit. As the coordinator: approve or return it. The point the demo makes
 * is the gate — switch to coordinator while the draft is unsubmitted and
 * every control is dead, because the machine (not the UI) forbids it.
 */
import { useState } from "react";
import { Check, CornerDownLeft, Send, Sparkles } from "lucide-react";
import DemoShell from "./DemoShell";
import {
  canSubmit,
  initialFeedback,
  permitted,
  reduce,
  type FeedbackState,
  type Role,
} from "./logic/feedbackMachine";

const statusLabel: Record<FeedbackState["status"], string> = {
  draft: "DRAFT",
  pending_review: "PENDING REVIEW",
  approved: "APPROVED",
};

export default function FeedbackDemo() {
  const [state, setState] = useState<FeedbackState>(initialFeedback);
  const [role, setRole] = useState<Role>("teacher");
  const [evidence, setEvidence] = useState(
    "Attended 5 of 6 sessions. Finished the flexbox exercises; the grid task was attempted but left incomplete."
  );
  const [returnComment, setReturnComment] = useState("");

  const may = (action: string) => permitted[state.status][role].includes(action as never);
  const apply = (action: Parameters<typeof reduce>[2]) =>
    setState((current) => reduce(current, role, action, current.history.length + 1));

  return (
    <DemoShell
      title="Feedback Copilot"
      lede="Generate a draft as the teacher, then switch roles and try to approve your own work — the machine won't let the same gate be skipped."
      caseFileSlug="feedback-copilot"
    >
      <div className="demo-toolbar">
        <div className="demo-role-switch" role="group" aria-label="Act as">
          <span>ACTING AS</span>
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
        </div>
        <span className={`demo-status demo-status-${state.status}`}>{statusLabel[state.status]}</span>
      </div>

      <div className="demo-columns">
        <section className="demo-panel" aria-label="Draft">
          <div className="demo-panel-head">
            <h2>Structured draft</h2>
            {may("generate") && (
              <button
                type="button"
                className="demo-action"
                onClick={() => apply({ type: "generate", evidence, studentName: "Mariam Hassan" })}
              >
                <Sparkles size={13} aria-hidden="true" /> Generate from evidence
              </button>
            )}
          </div>

          <label className="demo-field">
            <span>SESSION EVIDENCE</span>
            <textarea
              rows={2}
              value={evidence}
              onChange={(event) => setEvidence(event.target.value)}
              disabled={!may("generate")}
            />
          </label>

          {(
            [
              ["strengths", "STRENGTHS"],
              ["improvements", "AREAS FOR IMPROVEMENT"],
              ["nextSteps", "NEXT STEPS"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="demo-field">
              <span>{label}</span>
              <textarea
                rows={3}
                value={state[field]}
                placeholder={may("edit") ? "Generate a draft, or write your own…" : "—"}
                onChange={(event) => apply({ type: "edit", field, value: event.target.value })}
                disabled={!may("edit")}
              />
            </label>
          ))}

          {state.coordinatorComment && state.status === "draft" && (
            <p className="demo-note demo-note-warn">
              <CornerDownLeft size={13} aria-hidden="true" /> Returned by the coordinator: “
              {state.coordinatorComment}”
            </p>
          )}

          <div className="demo-panel-actions">
            <button
              type="button"
              className="demo-action demo-action-primary"
              disabled={!may("submit_for_review") || !canSubmit(state)}
              onClick={() => apply({ type: "submit_for_review" })}
            >
              <Send size={13} aria-hidden="true" /> Submit for review
            </button>
            {role === "teacher" && state.status === "draft" && !canSubmit(state) && (
              <span className="demo-hint">Each section needs substance before it can be submitted.</span>
            )}
            {role === "coordinator" && state.status === "draft" && (
              <span className="demo-hint">
                A coordinator cannot touch a draft — that is the boundary, not a missing feature.
              </span>
            )}
          </div>
        </section>

        <section className="demo-panel" aria-label="Review">
          <div className="demo-panel-head">
            <h2>Coordinator review</h2>
          </div>

          {state.status === "pending_review" ? (
            <>
              <p className="demo-note">
                The draft is locked for the teacher while it sits here. Approve it, or send it back with a
                reason.
              </p>
              <label className="demo-field">
                <span>RETURN COMMENT (OPTIONAL)</span>
                <textarea
                  rows={2}
                  value={returnComment}
                  onChange={(event) => setReturnComment(event.target.value)}
                  disabled={!may("return_to_draft")}
                />
              </label>
              <div className="demo-panel-actions">
                <button
                  type="button"
                  className="demo-action demo-action-primary"
                  disabled={!may("approve")}
                  onClick={() => apply({ type: "approve" })}
                >
                  <Check size={13} aria-hidden="true" /> Approve
                </button>
                <button
                  type="button"
                  className="demo-action"
                  disabled={!may("return_to_draft")}
                  onClick={() => {
                    apply({ type: "return_to_draft", comment: returnComment });
                    setReturnComment("");
                  }}
                >
                  <CornerDownLeft size={13} aria-hidden="true" /> Return to draft
                </button>
              </div>
              {role === "teacher" && (
                <span className="demo-hint">Switch to the coordinator role to act on this review.</span>
              )}
            </>
          ) : state.status === "approved" ? (
            <p className="demo-note demo-note-good">
              <Check size={13} aria-hidden="true" /> Approved. Only now could this feedback be sent — there is
              no path here that skips the review.
            </p>
          ) : (
            <p className="demo-note">Nothing to review yet. The queue fills when a teacher submits.</p>
          )}

          <div className="demo-history">
            <h3>Transition history</h3>
            {state.history.length === 0 ? (
              <p className="demo-hint">Every action lands here, with its actor — the real app persists this.</p>
            ) : (
              <ol>
                {state.history.map((entry, index) => (
                  <li key={index}>
                    <b>{entry.actor}</b> {entry.action}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </DemoShell>
  );
}
