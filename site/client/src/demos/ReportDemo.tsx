/*
 * Questionnaire to Report demo.
 *
 * The form validates on every keystroke and the report preview assembles
 * itself only once the answers are clean — the same ordering the original
 * tool enforced, so a report can never be produced from bad inputs.
 */
import { useMemo, useState } from "react";
import { FileText, Wand2 } from "lucide-react";
import DemoShell from "./DemoShell";
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

  const errors = useMemo(() => validateAnswers(answers), [answers]);
  const report = useMemo(() => (errors.length === 0 ? buildReport(answers) : null), [answers, errors]);

  const errorFor = (field: keyof Answers) =>
    touched.has(field) ? errors.find((error) => error.field === field)?.message : undefined;

  const set = (field: keyof Answers, value: string) =>
    setAnswers((current) => ({ ...current, [field]: value }));
  const touch = (field: keyof Answers) => setTouched((current) => new Set(current).add(field));

  return (
    <DemoShell
      title="Questionnaire to Report"
      lede="Fill the questionnaire — or load the example — and watch the report assemble itself the moment the answers validate. Invalid answers produce nothing, by design."
    >
      <div className="demo-columns">
        <section className="demo-panel" aria-label="Questionnaire">
          <div className="demo-panel-head">
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
            return (
              <label key={field} className="demo-field">
                <span>{label}</span>
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

          <p className="demo-hint">
            {errors.length === 0
              ? "All answers valid — the report on the right is live."
              : `${errors.length} field${errors.length === 1 ? "" : "s"} still failing validation. The template will not fill until zero.`}
          </p>
        </section>

        <section className="demo-panel demo-report-panel" aria-label="Report preview">
          <div className="demo-panel-head">
            <h2>
              <FileText size={15} aria-hidden="true" /> Report preview
            </h2>
          </div>

          {report ? (
            <article className="demo-report" aria-live="polite">
              <h3>{report.title}</h3>
              <p className="demo-report-subtitle">{report.subtitle}</p>
              {report.sections.map((section) => (
                <section key={section.heading}>
                  <h4>{section.heading}</h4>
                  <p>{section.body}</p>
                </section>
              ))}
              <footer>{report.footer}</footer>
            </article>
          ) : (
            <div className="demo-report demo-report-empty" aria-live="polite">
              <p>
                Nothing to show. The original tool exported PPTX and PDF from this template — but only ever
                from validated answers, and the demo keeps that rule.
              </p>
            </div>
          )}
        </section>
      </div>
    </DemoShell>
  );
}
