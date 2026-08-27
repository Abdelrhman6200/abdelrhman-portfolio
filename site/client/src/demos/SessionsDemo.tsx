/*
 * Session Link Automation demo — an automation console with a live log.
 *
 * The identifier assembles segment by segment as the visitor configures the
 * session, each segment traced to the field that produced it, and decodes
 * back. The runner drives queued sessions through the four automated steps
 * while a timestamped log narrates — the shape of the original Power Automate
 * run, at demo scale.
 */
import { useEffect, useRef, useState } from "react";
import { ListPlus, Play, Square, Zap } from "lucide-react";
import DemoShell from "./DemoShell";
import AppWindow from "./AppWindow";
import {
  GOVERNORATES,
  RUN_STAGES,
  TRACKS,
  VENDORS,
  decode,
  isDone,
  sessionCode,
  tickBatch,
  variedRequests,
  type SessionRequest,
  type SessionRun,
} from "./logic/sessionCoder";

const STAGE_LOG: Record<(typeof RUN_STAGES)[number], string> = {
  "Create meeting": "Teams meeting created",
  "Apply naming": "naming convention applied",
  "Distribute link": "link distributed to cohort",
  "Bind attendance": "attendance record bound",
};

/** The five segments of the code, each traced to the field that produced it. */
function segmentsOf(request: SessionRequest) {
  return [
    { text: request.governorate.slice(0, 3).toUpperCase(), from: "governorate" },
    { text: request.vendor.slice(0, 3).toUpperCase(), from: "vendor" },
    { text: request.track.slice(0, 3).toUpperCase(), from: "track" },
    { text: `C${String(request.cohort).padStart(2, "0")}`, from: "cohort" },
    { text: request.slot.toUpperCase().replace(/[^A-Z0-9]/g, ""), from: "slot" },
  ];
}

export default function SessionsDemo() {
  const [request, setRequest] = useState<SessionRequest>({
    governorate: "Cairo",
    vendor: "Almentor",
    track: "Web",
    cohort: 3,
    slot: "THU 17:00",
  });
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const tick = useRef(0);

  const code = sessionCode(request);
  const decoded = decode(code);
  const boundCount = runs.filter(isDone).length;

  // Each tick advances the first unfinished run one stage and narrates it.
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRuns((current) => {
        const index = current.findIndex((run) => !isDone(run));
        if (index < 0) {
          setRunning(false);
          return current;
        }
        const next = tickBatch(current);
        const stage = RUN_STAGES[next[index].completed];
        tick.current += 1;
        const stamp = `+${(tick.current * 0.4).toFixed(1)}s`;
        setLog((lines) => [`[${stamp}] ${next[index].code} — ${STAGE_LOG[stage]}`, ...lines].slice(0, 40));
        return next;
      });
    }, 420);
    return () => window.clearInterval(timer);
  }, [running]);

  const enqueue = (requests: SessionRequest[]) =>
    setRuns((current) => {
      const existing = new Set(current.map((run) => run.code));
      const added = requests
        .map(sessionCode)
        .filter((newCode) => !existing.has(newCode))
        .map((newCode) => ({ code: newCode, completed: -1 }));
      return [...current, ...added];
    });

  const set = <Key extends keyof SessionRequest>(key: Key, value: SessionRequest[Key]) =>
    setRequest((current) => ({ ...current, [key]: value }));

  return (
    <DemoShell
      title="Session Link Automation"
      lede="Configure a session and watch its identifier assemble segment by segment — then queue a handful and run the batch through the four steps the workflow automated, with the log narrating."
    >
      <AppWindow
        name="Session runner"
        tone="console"
        meta={
          <span className="sr-throughput">
            <Zap size={12} aria-hidden="true" />
            <b>{boundCount}</b> fully bound
          </span>
        }
      >
        <div className="sr-layout">
          {/* --- Composer ------------------------------------------------------ */}
          <section className="sr-panel" aria-label="Session composer">
            <div className="sr-panel-head">
              <h2>Composer</h2>
            </div>

            <div className="sr-fields">
              <label>
                <span>GOVERNORATE</span>
                <select
                  value={request.governorate}
                  onChange={(event) => set("governorate", event.target.value as SessionRequest["governorate"])}
                >
                  {GOVERNORATES.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>VENDOR</span>
                <select
                  value={request.vendor}
                  onChange={(event) => set("vendor", event.target.value as SessionRequest["vendor"])}
                >
                  {VENDORS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>TRACK</span>
                <select
                  value={request.track}
                  onChange={(event) => set("track", event.target.value as SessionRequest["track"])}
                >
                  {TRACKS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>COHORT</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={request.cohort}
                  onChange={(event) =>
                    set("cohort", Math.max(1, Math.min(99, Number(event.target.value) || 1)))
                  }
                />
              </label>
            </div>

            <div className="sr-code" aria-live="polite">
              <span>IDENTIFIER — EACH SEGMENT TRACED TO ITS FIELD</span>
              <div className="sr-code-segments">
                {segmentsOf(request).map((segment, index) => (
                  <span key={segment.from} className="sr-segment">
                    {index > 0 && <i className="sr-dash">-</i>}
                    <b>{segment.text}</b>
                    <small>{segment.from}</small>
                  </span>
                ))}
              </div>
            </div>

            {decoded && (
              <p className="sr-decode">
                Decodes back to <b>{decoded.governorate}</b> / <b>{decoded.vendor}</b> / <b>{decoded.track}</b>{" "}
                / cohort <b>{decoded.cohort}</b> — the reversibility that made filtering thousands of sessions
                in the LMS possible.
              </p>
            )}

            <div className="sr-actions">
              <button type="button" className="ops-action" onClick={() => enqueue([request])}>
                <ListPlus size={12} aria-hidden="true" /> Queue this session
              </button>
              <button type="button" className="ops-action" onClick={() => enqueue(variedRequests(5))}>
                <ListPlus size={12} aria-hidden="true" /> Queue 5 varied
              </button>
              <button
                type="button"
                className="ops-action ops-action-primary"
                disabled={runs.length === 0 || runs.every(isDone)}
                onClick={() => setRunning((value) => !value)}
              >
                {running ? <Square size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
                {running ? "Pause" : "Run the batch"}
              </button>
            </div>
          </section>

          {/* --- Runner -------------------------------------------------------- */}
          <section className="sr-panel" aria-label="Batch runner">
            <div className="sr-panel-head">
              <h2>Runner</h2>
              <span>
                {runs.length} queued / {boundCount} done
              </span>
            </div>

            {runs.length === 0 ? (
              <p className="ops-empty">
                Queue a session — the original moved thousands per month through these four steps untouched.
              </p>
            ) : (
              <ul className="sr-runs">
                {runs.map((run) => (
                  <li key={run.code} className={isDone(run) ? "is-done" : ""}>
                    <b>{run.code}</b>
                    <span
                      className="sr-progress"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={RUN_STAGES.length}
                      aria-valuenow={run.completed + 1}
                      aria-label={`${run.code} progress`}
                    >
                      <i style={{ width: `${((run.completed + 1) / RUN_STAGES.length) * 100}%` }} />
                    </span>
                    <small>
                      {run.completed < 0
                        ? "queued"
                        : isDone(run)
                          ? "bound"
                          : RUN_STAGES[run.completed + 1] ?? RUN_STAGES[run.completed]}
                    </small>
                  </li>
                ))}
              </ul>
            )}

            <div className="sr-log" aria-label="Run log" aria-live="polite">
              {log.length === 0 ? (
                <span className="sr-log-idle">— log idle —</span>
              ) : (
                log.map((line, index) => <span key={log.length - index}>{line}</span>)
              )}
            </div>
          </section>
        </div>
      </AppWindow>
    </DemoShell>
  );
}
