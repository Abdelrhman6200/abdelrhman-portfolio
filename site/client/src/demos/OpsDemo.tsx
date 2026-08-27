/*
 * EdTech Ops Intelligence demo.
 *
 * Three KPIs with real targets and thresholds. The visitor advances time —
 * new readings arrive, a breach raises an anomaly, and the anomaly can only
 * be resolved through investigation with a recorded root cause. Every action
 * lands in an audit log that nothing in the UI (or the logic module) can edit.
 */
import { useState } from "react";
import { Activity, ClipboardList, PlayCircle, Search } from "lucide-react";
import DemoShell from "./DemoShell";
import {
  resolve,
  recordReading,
  seedOps,
  startInvestigation,
  statusOf,
  sweep,
  type OpsState,
} from "./logic/kpiMonitor";

/** Deterministic "next week" per KPI: drift downward slightly, attendance recovering last. */
const NEXT_READING: Record<string, (latest: number, week: number) => number> = {
  attendance: (latest, week) => Math.min(96, latest + (week % 3 === 0 ? 6 : -2)),
  "data-freshness": (latest) => Math.max(88, latest - 1),
  "instructor-rating": (latest, week) => Math.max(74, latest + (week % 2 === 0 ? -3 : 1)),
};

export default function OpsDemo() {
  const [state, setState] = useState<OpsState>(() => sweep(seedOps));
  const [week, setWeek] = useState(6);
  const [rootCause, setRootCause] = useState("");
  const [resolveError, setResolveError] = useState<string | null>(null);

  const advanceWeek = () => {
    setState((current) => {
      let next = current;
      for (const kpi of current.kpis) {
        const latest = kpi.readings[kpi.readings.length - 1];
        next = recordReading(next, kpi.key, NEXT_READING[kpi.key](latest, week), week);
      }
      return sweep(next, week);
    });
    setWeek((value) => value + 1);
  };

  const investigating = state.anomalies.find((anomaly) => anomaly.status === "investigating");
  const open = state.anomalies.filter((anomaly) => anomaly.status === "open");

  return (
    <DemoShell
      title="EdTech Ops Intelligence"
      lede="Advance a week and watch the monitor work: a KPI crossing its threshold raises an anomaly, resolution demands a recorded root cause, and every step lands in an audit log nothing can edit."
      caseFileSlug="edtech-ops-intelligence-os"
    >
      <div className="demo-toolbar">
        <button type="button" className="demo-action demo-action-primary" onClick={advanceWeek}>
          <PlayCircle size={13} aria-hidden="true" /> Advance one week
        </button>
        <span className="demo-hint">Week {week} — readings drift on a fixed schedule, so the demo is repeatable.</span>
      </div>

      <div className="demo-kpi-grid">
        {state.kpis.map((kpi) => {
          const status = statusOf(kpi);
          const latest = kpi.readings[kpi.readings.length - 1];
          const min = Math.min(...kpi.readings, kpi.warnBelow) - 4;
          const max = Math.max(...kpi.readings, kpi.target) + 4;
          const y = (value: number) => 44 - ((value - min) / (max - min)) * 40;
          const points = kpi.readings
            .map((value, index) => `${(index / (kpi.readings.length - 1)) * 132 + 4},${y(value)}`)
            .join(" ");
          return (
            <article key={kpi.key} className={`demo-kpi demo-kpi-${status}`}>
              <header>
                <span>{kpi.name}</span>
                <b>
                  {latest}
                  {kpi.unit}
                </b>
              </header>
              <svg viewBox="0 0 140 48" aria-hidden="true" className="demo-kpi-spark">
                <line x1="4" x2="136" y1={y(kpi.target)} y2={y(kpi.target)} className="spark-target" />
                <line x1="4" x2="136" y1={y(kpi.warnBelow)} y2={y(kpi.warnBelow)} className="spark-warn" />
                <polyline points={points} className="spark-line" />
              </svg>
              <footer>
                <span>
                  target {kpi.target}
                  {kpi.unit} / warn below {kpi.warnBelow}
                  {kpi.unit}
                </span>
                <span className="demo-kpi-owner">{kpi.owner}</span>
              </footer>
            </article>
          );
        })}
      </div>

      <div className="demo-columns">
        <section className="demo-panel" aria-label="Anomalies">
          <div className="demo-panel-head">
            <h2>Anomalies</h2>
            <span className="demo-hint">
              {open.length} open / {state.anomalies.filter((anomaly) => anomaly.status === "resolved").length}{" "}
              resolved
            </span>
          </div>

          {state.anomalies.length === 0 && (
            <p className="demo-note">Nothing raised yet — advance a week until a KPI crosses its threshold.</p>
          )}

          {state.anomalies.map((anomaly) => (
            <article key={anomaly.id} className={`demo-anomaly is-${anomaly.status}`}>
              <header>
                <span>
                  #{anomaly.id} / {anomaly.status.toUpperCase()}
                </span>
                {anomaly.status === "open" && (
                  <button
                    type="button"
                    className="demo-action"
                    onClick={() => setState((current) => startInvestigation(current, anomaly.id, "you", week))}
                  >
                    <Search size={12} aria-hidden="true" /> Investigate
                  </button>
                )}
              </header>
              <p>{anomaly.detail}</p>
              {anomaly.rootCause && <p className="demo-anomaly-cause">Root cause: {anomaly.rootCause}</p>}
            </article>
          ))}

          {investigating && (
            <div className="demo-resolve">
              <label className="demo-field">
                <span>ROOT CAUSE FOR #{investigating.id} — REQUIRED TO RESOLVE</span>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={(event) => {
                    setRootCause(event.target.value);
                    setResolveError(null);
                  }}
                  placeholder="e.g. Ramadan schedule shift — evening sessions moved without re-invites."
                />
              </label>
              {resolveError && <p className="demo-note demo-note-warn">{resolveError}</p>}
              <button
                type="button"
                className="demo-action demo-action-primary"
                onClick={() => {
                  try {
                    setState((current) => resolve(current, investigating.id, rootCause, "you", week));
                    setRootCause("");
                    setResolveError(null);
                  } catch (error) {
                    setResolveError(error instanceof Error ? error.message : String(error));
                  }
                }}
              >
                <Activity size={13} aria-hidden="true" /> Resolve with this cause
              </button>
            </div>
          )}
        </section>

        <section className="demo-panel" aria-label="Audit log">
          <div className="demo-panel-head">
            <h2>
              <ClipboardList size={15} aria-hidden="true" /> Audit log
            </h2>
            <span className="demo-hint">append-only — there is no edit or delete</span>
          </div>
          {state.audit.length === 0 ? (
            <p className="demo-note">Empty until something happens.</p>
          ) : (
            <ol className="demo-audit">
              {state.audit.map((entry, index) => (
                <li key={index}>
                  <span>W{entry.at || "0"}</span>
                  <b>{entry.actor}</b> {entry.action}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </DemoShell>
  );
}
