/*
 * EdTech Ops Intelligence demo — a control tower, styled as one.
 *
 * The console is permanently dark (it uses the site's stable panel tokens, so
 * both themes and the contrast tests already cover it). AUTO advances a week
 * every two seconds until paused; reduced motion starts paused. A breach
 * raises an anomaly into the queue, the queue prescribes the next action, and
 * the audit feed grows append-only at the side — the three behaviours the
 * shipped application enforces at its storage boundary.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Pause, Play, Search, StepForward } from "lucide-react";
import DemoShell from "./DemoShell";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import AppWindow from "./AppWindow";
import {
  resolve,
  recordReading,
  seedOps,
  startInvestigation,
  statusOf,
  sweep,
  type OpsState,
} from "./logic/kpiMonitor";

/** Deterministic "next week" per KPI, so every run of the demo is identical. */
const NEXT_READING: Record<string, (latest: number, week: number) => number> = {
  attendance: (latest, week) => Math.min(96, latest + (week % 3 === 0 ? 6 : -2)),
  "data-freshness": (latest) => Math.max(88, latest - 1),
  "instructor-rating": (latest, week) => Math.max(74, latest + (week % 2 === 0 ? -3 : 1)),
};

const statusText = { "on-target": "ON TARGET", watch: "WATCH", breach: "BREACH" } as const;

export default function OpsDemo() {
  const [state, setState] = useState<OpsState>(() => sweep(seedOps));
  const [week, setWeek] = useState(6);
  const [auto, setAuto] = useState(false);
  const [rootCause, setRootCause] = useState("");
  const [resolveError, setResolveError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const weekRef = useRef(week);
  weekRef.current = week;

  const advanceWeek = () => {
    const current = weekRef.current;
    setState((prev) => {
      let next = prev;
      for (const kpi of prev.kpis) {
        const latest = kpi.readings[kpi.readings.length - 1];
        next = recordReading(next, kpi.key, NEXT_READING[kpi.key](latest, current), current);
      }
      return sweep(next, current);
    });
    setWeek((value) => value + 1);
  };

  // AUTO: one week every 2s. Never starts on its own under reduced motion.
  useEffect(() => {
    if (!auto || reducedMotion) return;
    const timer = window.setInterval(advanceWeek, 2000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, reducedMotion]);

  const investigating = state.anomalies.find((anomaly) => anomaly.status === "investigating");
  const open = state.anomalies.filter((anomaly) => anomaly.status === "open");
  const resolved = state.anomalies.filter((anomaly) => anomaly.status === "resolved");

  /** The queue tells the operator what the system wants next. */
  const nextActions = useMemo(() => {
    const actions: string[] = [];
    for (const anomaly of open) actions.push(`Investigate anomaly #${anomaly.id}`);
    if (investigating) actions.push(`Record a root cause for #${investigating.id} and resolve it`);
    if (actions.length === 0) actions.push("Nothing owed. Advance a week and watch the thresholds.");
    return actions;
  }, [open, investigating]);

  return (
    <DemoShell
      title="EdTech Ops Intelligence"
      lede="Run the clock and watch the tower work: a KPI crossing its threshold raises an anomaly, the queue prescribes the next action, and nothing resolves without a recorded root cause."
      caseFileSlug="edtech-ops-intelligence-os"
    >
      <AppWindow
        name="Ops Control Tower"
        tone="console"
        meta={
          <span className="ops-clock">
            <b>WEEK {week}</b>
            <button
              type="button"
              className={`ops-auto ${auto ? "is-on" : ""}`}
              aria-pressed={auto}
              onClick={() => setAuto((value) => !value)}
            >
              {auto ? <Pause size={11} aria-hidden="true" /> : <Play size={11} aria-hidden="true" />}
              AUTO
            </button>
            <button type="button" className="ops-step" onClick={advanceWeek} disabled={auto}>
              <StepForward size={11} aria-hidden="true" /> STEP
            </button>
          </span>
        }
      >
        <div className="ops-kpis">
          {state.kpis.map((kpi) => {
            const status = statusOf(kpi);
            const latest = kpi.readings[kpi.readings.length - 1];
            const window14 = kpi.readings.slice(-14);
            const min = Math.min(...window14, kpi.warnBelow) - 4;
            const max = Math.max(...window14, kpi.target) + 4;
            const y = (value: number) => 52 - ((value - min) / (max - min)) * 44;
            const step = 176 / Math.max(window14.length - 1, 1);
            const line = window14.map((value, index) => `${index * step + 2},${y(value)}`).join(" ");
            const area = `2,${y(window14[0])} ${line} ${(window14.length - 1) * step + 2},56 2,56`;
            return (
              <article key={kpi.key} className={`ops-kpi ops-kpi-${status}`}>
                <header>
                  <span>{kpi.name}</span>
                  <i className="ops-kpi-status">{statusText[status]}</i>
                </header>
                <div className="ops-kpi-value">
                  <b>
                    {latest}
                    <small>{kpi.unit}</small>
                  </b>
                  <span>
                    target {kpi.target} / warn &lt;{kpi.warnBelow}
                  </span>
                </div>
                <svg viewBox="0 0 180 58" aria-hidden="true" className="ops-spark">
                  <polygon points={area} className="ops-spark-area" />
                  <line x1="2" x2="178" y1={y(kpi.target)} y2={y(kpi.target)} className="ops-spark-target" />
                  <line x1="2" x2="178" y1={y(kpi.warnBelow)} y2={y(kpi.warnBelow)} className="ops-spark-warn" />
                  <polyline points={line} className="ops-spark-line" />
                  <circle
                    cx={(window14.length - 1) * step + 2}
                    cy={y(latest)}
                    r="3.4"
                    className={`ops-spark-dot ${status === "breach" ? "is-breach" : ""}`}
                  />
                </svg>
                <footer>{kpi.owner}</footer>
              </article>
            );
          })}
        </div>

        <div className="ops-lower">
          <section className="ops-panel" aria-label="Next actions and anomalies">
            <div className="ops-panel-head">
              <h2>Next actions</h2>
              <span>
                {open.length} open / {resolved.length} resolved
              </span>
            </div>
            <ol className="ops-queue">
              {nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>

            {state.anomalies.map((anomaly) => (
              <article key={anomaly.id} className={`ops-anomaly is-${anomaly.status}`}>
                <header>
                  <span>
                    #{anomaly.id} / {anomaly.status.toUpperCase()}
                  </span>
                  {anomaly.status === "open" && (
                    <button
                      type="button"
                      className="ops-action"
                      onClick={() =>
                        setState((current) => startInvestigation(current, anomaly.id, "you", weekRef.current))
                      }
                    >
                      <Search size={11} aria-hidden="true" /> Investigate
                    </button>
                  )}
                </header>
                <p>{anomaly.detail}</p>
                {anomaly.rootCause && <p className="ops-cause">Root cause: {anomaly.rootCause}</p>}
              </article>
            ))}

            {investigating && (
              <div className="ops-resolve">
                <label>
                  <span>ROOT CAUSE FOR #{investigating.id} — REQUIRED</span>
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
                {resolveError && <p className="ops-error">{resolveError}</p>}
                <button
                  type="button"
                  className="ops-action ops-action-primary"
                  onClick={() => {
                    try {
                      setState((current) =>
                        resolve(current, investigating.id, rootCause, "you", weekRef.current)
                      );
                      setRootCause("");
                      setResolveError(null);
                    } catch (error) {
                      setResolveError(error instanceof Error ? error.message : String(error));
                    }
                  }}
                >
                  <Activity size={12} aria-hidden="true" /> Resolve with this cause
                </button>
              </div>
            )}
          </section>

          <section className="ops-panel" aria-label="Audit feed">
            <div className="ops-panel-head">
              <h2>Audit feed</h2>
              <span>append-only</span>
            </div>
            {state.audit.length === 0 ? (
              <p className="ops-empty">Empty until something happens.</p>
            ) : (
              <ol className="ops-feed">
                {[...state.audit].reverse().map((entry, index) => (
                  <li key={state.audit.length - index}>
                    <span>W{entry.at || "0"}</span>
                    <b>{entry.actor}</b> {entry.action}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </AppWindow>

      {reducedMotion && (
        <p className="demo-hint">Reduced motion is on, so the clock only moves when you press STEP.</p>
      )}
    </DemoShell>
  );
}
