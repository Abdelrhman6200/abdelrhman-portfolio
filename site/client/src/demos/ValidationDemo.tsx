/*
 * Smart Excel Validation demo — a spreadsheet, styled as one.
 *
 * Column letters, row numbers, and a formula-bar strip that explains the
 * focused cell. The sheet re-validates on every keystroke; every exception in
 * the queue has a "locate" control that jumps focus to the offending cell.
 * "Import batch" appends four more records mid-session — including one that
 * collides with a row already in the sheet, which is the point: the rules are
 * cross-row, not per-cell.
 */
import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Crosshair, FileInput, RotateCcw } from "lucide-react";
import DemoShell from "./DemoShell";
import AppWindow from "./AppWindow";
import { messyBatch, seedRows, summarize, validate, type StudentRow } from "./logic/validationRules";

const COLUMNS: Array<{ field: keyof StudentRow; label: string; letter: string; width?: string }> = [
  { field: "id", label: "STUDENT ID", letter: "A", width: "112px" },
  { field: "name", label: "NAME", letter: "B" },
  { field: "phone", label: "PHONE", letter: "C", width: "138px" },
  { field: "track", label: "TRACK", letter: "D" },
  { field: "slot", label: "SLOT", letter: "E", width: "112px" },
];

export default function ValidationDemo() {
  const [rows, setRows] = useState<StudentRow[]>(() => seedRows.map((row) => ({ ...row })));
  const [imported, setImported] = useState(false);
  const [focused, setFocused] = useState<{ row: number; field: keyof StudentRow } | null>(null);
  const cellRefs = useRef(new Map<string, HTMLInputElement>());

  const findings = useMemo(() => validate(rows), [rows]);
  const summary = useMemo(() => summarize(rows, findings), [rows, findings]);
  const cleanPercent = Math.round((summary.clean / summary.total) * 100);

  const findingsAt = (row: number, field: keyof StudentRow) =>
    findings.filter((finding) => finding.rowIndex === row && finding.field === field);

  const focusedFindings = focused ? findingsAt(focused.row, focused.field) : [];
  const focusedRef = focused
    ? `${COLUMNS.find((column) => column.field === focused.field)?.letter}${focused.row + 1}`
    : null;

  const edit = (rowIndex: number, field: keyof StudentRow, value: string) =>
    setRows((current) => current.map((row, index) => (index === rowIndex ? { ...row, [field]: value } : row)));

  const locate = (rowIndex: number, field: keyof StudentRow) => {
    const cell = cellRefs.current.get(`${rowIndex}:${field}`);
    cell?.focus();
    // Not implemented in jsdom; focus alone is enough there.
    cell?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  };

  const reset = () => {
    setRows(seedRows.map((row) => ({ ...row })));
    setImported(false);
    setFocused(null);
  };

  return (
    <DemoShell
      title="Smart Excel Validation"
      lede="A live sheet running the full rule engine on every keystroke. Use “locate” on any exception to jump to the cell, fix it, and watch the finding clear — then import the second batch and see the cross-row rules catch a collision with data already in the sheet."
    >
      <AppWindow
        name={`enrollment_2024.xlsx — ${summary.total} records`}
        meta={
          <span className="vx-meter" role="status">
            <i style={{ width: `${cleanPercent}%` }} aria-hidden="true" />
            <b>{cleanPercent}% clean</b>
          </span>
        }
      >
        {/* Formula-bar strip: explains the focused cell. */}
        <div className="vx-formula" aria-live="polite">
          <span className="vx-cellref">{focusedRef ?? "—"}</span>
          {focused === null ? (
            <span className="vx-formula-idle">Select a cell — its findings appear here.</span>
          ) : focusedFindings.length === 0 ? (
            <span className="vx-formula-ok">
              <CheckCircle2 size={12} aria-hidden="true" /> Passes every rule.
            </span>
          ) : (
            <span className="vx-formula-bad">
              <AlertTriangle size={12} aria-hidden="true" />
              {focusedFindings.map((finding) => finding.message).join(" ")}
            </span>
          )}
        </div>

        <div className="vx-sheet-wrap" role="region" aria-label="Editable student records">
          <table className="vx-sheet">
            <thead>
              <tr>
                <th scope="col" className="vx-corner" aria-label="Row number" />
                {COLUMNS.map((column) => (
                  <th key={column.field} scope="col" style={column.width ? { width: column.width } : undefined}>
                    <i>{column.letter}</i>
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
                  <tr key={rowIndex} className={`vx-row-${worst}`}>
                    <td className="vx-rownum">{rowIndex + 1}</td>
                    {COLUMNS.map((column) => {
                      const cellFindings = findingsAt(rowIndex, column.field);
                      const severity = cellFindings.some((finding) => finding.severity === "error")
                        ? "error"
                        : cellFindings.length
                          ? "warning"
                          : null;
                      return (
                        <td key={column.field} className={severity ? `vx-cell-${severity}` : undefined}>
                          <input
                            ref={(node) => {
                              if (node) cellRefs.current.set(`${rowIndex}:${column.field}`, node);
                              else cellRefs.current.delete(`${rowIndex}:${column.field}`);
                            }}
                            value={row[column.field]}
                            onChange={(event) => edit(rowIndex, column.field, event.target.value)}
                            onFocus={() => setFocused({ row: rowIndex, field: column.field })}
                            aria-label={`${column.label}, row ${rowIndex + 1}`}
                            aria-invalid={severity === "error" || undefined}
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

        <div className="vx-toolbar">
          <button
            type="button"
            className="demo-action"
            disabled={imported}
            onClick={() => {
              setRows((current) => [...current, ...messyBatch.map((row) => ({ ...row }))]);
              setImported(true);
            }}
          >
            <FileInput size={13} aria-hidden="true" /> Import batch (4 records)
          </button>
          <button type="button" className="demo-action" onClick={reset}>
            <RotateCcw size={13} aria-hidden="true" /> Reset sheet
          </button>
          <span className="vx-counts">
            <b className="is-bad">{summary.errorRows}</b> error rows · <b className="is-warn">{summary.warningRows}</b>{" "}
            warning rows · <b className="is-good">{summary.clean}</b> clean
          </span>
        </div>
      </AppWindow>

      <section className="demo-panel" aria-label="Exception queue">
        <div className="demo-panel-head">
          <h2>Exception queue</h2>
          <span className="demo-hint">
            {findings.length} findings — held for a person, never silently corrected
          </span>
        </div>
        {findings.length === 0 ? (
          <p className="demo-note demo-note-good">
            <CheckCircle2 size={13} aria-hidden="true" /> Every record passes. This is the point where the
            original released data downstream.
          </p>
        ) : (
          <ul className="demo-exceptions">
            {findings.map((finding, index) => (
              <li key={index} className={`is-${finding.severity}`}>
                <span className="exception-rule">{finding.rule}</span>
                <span className="exception-body">
                  Row {finding.rowIndex + 1} / {finding.field.toUpperCase()} — {finding.message}
                </span>
                <button
                  type="button"
                  className="exception-locate"
                  onClick={() => locate(finding.rowIndex, finding.field)}
                  aria-label={`Locate row ${finding.rowIndex + 1} ${finding.field}`}
                >
                  <Crosshair size={12} aria-hidden="true" /> locate
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DemoShell>
  );
}
