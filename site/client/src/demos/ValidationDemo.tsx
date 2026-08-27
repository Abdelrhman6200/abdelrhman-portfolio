/*
 * Smart Excel Validation demo.
 *
 * An editable sheet seeded with one of each real failure mode. Every keystroke
 * re-runs the full rule engine, so the visitor can fix a duplicate ID and
 * watch the exception disappear — the surface-don't-silently-fix behaviour the
 * original system was built around.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import DemoShell from "./DemoShell";
import { seedRows, summarize, validate, type StudentRow } from "./logic/validationRules";

const COLUMNS: Array<{ field: keyof StudentRow; label: string; width?: string }> = [
  { field: "id", label: "STUDENT ID", width: "110px" },
  { field: "name", label: "NAME" },
  { field: "phone", label: "PHONE", width: "130px" },
  { field: "track", label: "TRACK" },
  { field: "slot", label: "SLOT", width: "110px" },
];

export default function ValidationDemo() {
  const [rows, setRows] = useState<StudentRow[]>(() => seedRows.map((row) => ({ ...row })));

  const findings = useMemo(() => validate(rows), [rows]);
  const summary = useMemo(() => summarize(rows, findings), [rows, findings]);

  const findingsFor = (rowIndex: number, field: keyof StudentRow) =>
    findings.filter((finding) => finding.rowIndex === rowIndex && finding.field === field);

  const edit = (rowIndex: number, field: keyof StudentRow, value: string) =>
    setRows((current) => current.map((row, index) => (index === rowIndex ? { ...row, [field]: value } : row)));

  return (
    <DemoShell
      title="Smart Excel Validation"
      lede="The sheet below is seeded with real failure modes — a duplicate ID, a malformed phone, a slot conflict. Fix a cell and watch its exception clear; the rules re-run on every keystroke."
    >
      <div className="demo-toolbar">
        <div className="demo-stats">
          <span>
            <b>{summary.total}</b> records
          </span>
          <span className="demo-stat-good">
            <b>{summary.clean}</b> clean
          </span>
          <span className="demo-stat-bad">
            <b>{summary.errorRows}</b> with errors
          </span>
          <span className="demo-stat-warn">
            <b>{summary.warningRows}</b> with warnings
          </span>
        </div>
        <button
          type="button"
          className="demo-action"
          onClick={() => setRows(seedRows.map((row) => ({ ...row })))}
        >
          <RotateCcw size={13} aria-hidden="true" /> Reset the sheet
        </button>
      </div>

      <div className="demo-sheet-wrap" role="region" aria-label="Editable student records">
        <table className="demo-sheet">
          <thead>
            <tr>
              <th scope="col" aria-label="Row status" />
              {COLUMNS.map((column) => (
                <th key={column.field} scope="col" style={column.width ? { width: column.width } : undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowFindings = findings.filter((finding) => finding.rowIndex === rowIndex);
              const worst = rowFindings.some((finding) => finding.severity === "error")
                ? "error"
                : rowFindings.length
                  ? "warning"
                  : "clean";
              return (
                <tr key={rowIndex} className={`sheet-row-${worst}`}>
                  <td className="sheet-status">
                    {worst === "clean" ? (
                      <CheckCircle2 size={14} aria-label="Row passes all rules" />
                    ) : (
                      <AlertTriangle size={14} aria-label={`Row has ${rowFindings.length} findings`} />
                    )}
                  </td>
                  {COLUMNS.map((column) => {
                    const cellFindings = findingsFor(rowIndex, column.field);
                    const severity = cellFindings.some((finding) => finding.severity === "error")
                      ? "error"
                      : cellFindings.length
                        ? "warning"
                        : null;
                    return (
                      <td key={column.field} className={severity ? `sheet-cell-${severity}` : undefined}>
                        <input
                          value={row[column.field]}
                          onChange={(event) => edit(rowIndex, column.field, event.target.value)}
                          aria-label={`${column.label}, row ${rowIndex + 1}`}
                          aria-invalid={severity === "error" || undefined}
                          title={cellFindings.map((finding) => finding.message).join(" ")}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="demo-panel" aria-label="Exception queue">
        <div className="demo-panel-head">
          <h2>Exception queue</h2>
          <span className="demo-hint">{findings.length} findings — held for review, never silently corrected</span>
        </div>
        {findings.length === 0 ? (
          <p className="demo-note demo-note-good">
            <CheckCircle2 size={13} aria-hidden="true" /> Every record passes. In the original system this is
            the point where data was released downstream.
          </p>
        ) : (
          <ul className="demo-exceptions">
            {findings.map((finding, index) => (
              <li key={index} className={`is-${finding.severity}`}>
                <span className="exception-rule">{finding.rule}</span>
                <span>
                  Row {finding.rowIndex + 1} / {finding.field.toUpperCase()} — {finding.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DemoShell>
  );
}
