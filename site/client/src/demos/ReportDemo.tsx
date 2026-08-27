/*
 * Questionnaire to Report demo — a form on the left, an actual document on
 * the right.
 *
 * The preview is styled as paper and has a second mode showing the raw
 * template with its placeholders, so the mechanism — validated answers
 * flowing into slots — is visible, not just the result. The template refuses
 * to fill until every answer validates; that ordering is the product.
 */
import { useMemo, useState } from "react";
import { FileText, Wand2 } from "lucide-react";
import DemoShell from "./DemoShell";
import AppWindow from "./AppWindow";
import {
  buildReport,
  emptyAnswers,
  exampleAnswers,
  validateAnswers,
  type Answers,
} from "./logic/reportBuilder";

const FIELDS: Array<{ field: keyof Answers; label: string; kind: "input" | "textarea" }> = [
  { field: "studentName", label: "STUDENT NAME", kind: "input" },
  { field: "courseTitle", label: "COURSE TITLE", kind: "input" },
  { field: "completionPercent", label: "COMPLETION %", kind: "input" },
  { field: "mentorName", label: "MENTOR", kind: "input" },
  { field: "highlight", label: "SESSION HIGHLIGHT", kind: "textarea" },
];

export default function ReportDemo() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [touched, setTouched] = useState<Set<keyof Answers>>(new Set());
  const [view, setView] = useState<"filled" | "template">("filled");

  const errors = useMemo(() => validateAnswers(answers), [answers]);
  const report = useMemo(() => (errors.length === 0 ? buildReport(answers) : null), [answers, errors]);
  const validCount = FIELDS.length - new Set(errors.map((error) => error.field)).size;

  const errorFor = (field: keyof Answers) =>
    touched.has(field) ? errors.find((error) => error.field === field)?.message : undefined;

  const set = (field: keyof Answers, value: string) =>
    setAnswers((current) => ({ ...current, [field]: value }));
  const touch = (field: keyof Answers) => setTouched((current) => new Set(current).add(field));

  return (
    <DemoShell
      title="Questionnaire to Report"
      lede="Fill the questionnaire — or load the example — and watch the paper on the right assemble the moment the answers validate. Flip to the template view to see the slots the answers flow into."
    >
      <AppWindow
        name="report-builder — progress_report.template"
        meta={
          <span className="rp-progress" role="status">
            <b>
              {validCount}/{FIELDS.length}
            </b>{" "}
            fields valid
          </span>
        }
      >
        <div className="rp-layout">
          <section className="rp-form" aria-label="Questionnaire">
            <div className="rp-form-head">
              <h2>Questionnaire</h2>
              <button
                type="button"
                className="demo-action"
                onClick={() => {
                  setAnswers(exampleAnswers);
                  setTouched(new Set(FIELDS.map((item) => item.field)));
                }}
              >
                <Wand2 size={13} aria-hidden="true" /> Load the example
              </button>
            </div>

            {FIELDS.map(({ field, label, kind }) => {
              const message = errorFor(field);
              const valid = !errors.some((error) => error.field === field) && answers[field].trim() !== "";
              return (
                <label key={field} className={`demo-field ${valid ? "is-valid" : ""}`}>
                  <span>
                    {label}
                    {valid && <i className="rp-tick" aria-hidden="true">✓</i>}
                  </span>
                  {kind === "textarea" ? (
                    <textarea
                      rows={3}
                      value={answers[field]}
                      onChange={(event) => set(field, event.target.value)}
                      onBlur={() => touch(field)}
                      aria-invalid={Boolean(message) || undefined}
                    />
                  ) : (
                    <input
                      value={answers[field]}
                      onChange={(event) => set(field, event.target.value)}
                      onBlur={() => touch(field)}
                      aria-invalid={Boolean(message) || undefined}
                    />
                  )}
                  {message && <em className="demo-field-error">{message}</em>}
                </label>
              );
            })}
          </section>

          <section className="rp-preview" aria-label="Report preview">
            <div className="rp-preview-head">
              <h2>
                <FileText size={15} aria-hidden="true" /> Preview
              </h2>
              <div className="rp-view-switch" role="group" aria-label="Preview mode">
                {(["filled", "template"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={view === option ? "is-active" : ""}
                    aria-pressed={view === option}
                    onClick={() => setView(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {view === "template" ? (
              <article className="rp-paper rp-paper-template" aria-live="polite">
                <h3>
                  <mark>{"{{course_title}}"}</mark> — Progress Report
                </h3>
                <p className="rp-paper-sub">
                  Prepared for <mark>{"{{student_name}}"}</mark>
                </p>
                <section>
                  <h4>Completion</h4>
                  <p>
                    <mark>{"{{student_name}}"}</mark> has completed <mark>{"{{completion}}"}</mark>% of{" "}
                    <mark>{"{{course_title}}"}</mark>, <mark>{"{{standing}}"}</mark> position at this point in
                    the programme.
                  </p>
                </section>
                <section>
                  <h4>Highlight</h4>
                  <p>
                    <mark>{"{{highlight}}"}</mark>
                  </p>
                </section>
                <section>
                  <h4>Next review</h4>
                  <p>
                    Progress will be reviewed with <mark>{"{{mentor}}"}</mark> at the next scheduled session.
                  </p>
                </section>
                <footer>
                  The slots only ever fill from validated answers — <mark>{"{{standing}}"}</mark> is derived
                  from the completion figure.
                </footer>
              </article>
            ) : report ? (
              <article className="rp-paper" aria-live="polite">
                <h3>{report.title}</h3>
                <p className="rp-paper-sub">{report.subtitle}</p>
                {report.sections.map((section) => (
                  <section key={section.heading}>
                    <h4>{section.heading}</h4>
                    <p>{section.body}</p>
                  </section>
                ))}
                <footer>{report.footer}</footer>
              </article>
            ) : (
              <div className="rp-paper rp-paper-empty" aria-live="polite">
                <p>
                  {FIELDS.length - validCount} field{FIELDS.length - validCount === 1 ? "" : "s"} still failing
                  validation — the template will not fill until zero. The original exported PPTX and PDF from
                  here, under the same rule.
                </p>
              </div>
            )}
          </section>
        </div>
      </AppWindow>
    </DemoShell>
  );
}
