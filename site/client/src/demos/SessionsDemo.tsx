/*
 * Session Link Automation demo.
 *
 * Two halves, matching the two things the original workflow bought:
 * the naming convention (configure a session, watch the identifier assemble
 * and decode back), and the batch run (queue sessions, run them through
 * creation, naming, distribution and attendance binding).
 */
import { useEffect, useRef, useState } from "react";
import { ListPlus, Play, Square } from "lucide-react";
import DemoShell from "./DemoShell";
import {
  GOVERNORATES,
  RUN_STAGES,
  TRACKS,
  VENDORS,
  decode,
  isDone,
  sessionCode,
  tickBatch,
  type SessionRequest,
  type SessionRun,
} from "./logic/sessionCoder";

export default function SessionsDemo() {
  const [request, setRequest] = useState<SessionRequest>({
    governorate: "Cairo",
    vendor: "Almentor",
    track: "Web",
    cohort: 3,
    slot: "THU 17:00",
  });
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  const code = sessionCode(request);
  const decoded = decode(code);

  // The batch advances one step per tick while running; it stops itself when done.
  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setRuns((current) => {
        const next = tickBatch(current);
        if (next === current) setRunning(false);
        return next;
      });
    }, 550);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [running]);

  const enqueue = () =>
    setRuns((current) =>
      current.some((run) => run.code === code) ? current : [...current, { code, completed: -1 }]
    );

  const set = <Key extends keyof SessionRequest>(key: Key, value: SessionRequest[Key]) =>
    setRequest((current) => ({ ...current, [key]: value }));

  return (
    <DemoShell
      title="Session Link Automation"
      lede="Configure a session and watch its identifier assemble — every attribute recoverable by eye. Queue a few, then run the batch through the four steps the workflow automated."
    >
      <div className="demo-columns">
        <section className="demo-panel" aria-label="Session configuration">
          <div className="demo-panel-head">
            <h2>The naming convention</h2>
          </div>

          <div className="demo-select-grid">
            <label className="demo-field">
              <span>GOVERNORATE</span>
              <select value={request.governorate} onChange={(event) => set("governorate", event.target.value as SessionRequest["governorate"])}>
                {GOVERNORATES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="demo-field">
              <span>VENDOR</span>
              <select value={request.vendor} onChange={(event) => set("vendor", event.target.value as SessionRequest["vendor"])}>
                {VENDORS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="demo-field">
              <span>TRACK</span>
              <select value={request.track} onChange={(event) => set("track", event.target.value as SessionRequest["track"])}>
                {TRACKS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="demo-field">
              <span>COHORT</span>
              <input
                type="number"
                min={1}
                max={99}
                value={request.cohort}
                onChange={(event) => set("cohort", Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
              />
            </label>
          </div>

          <div className="demo-code" aria-live="polite">
            <span>GENERATED IDENTIFIER</span>
            <b>{code}</b>
          </div>

          {decoded && (
            <div className="demo-decode">
              <h3>…and back again</h3>
              <p>
                Anyone reading this code recovers: <b>{decoded.governorate}</b> / <b>{decoded.vendor}</b> /{" "}
                <b>{decoded.track}</b> track / cohort <b>{decoded.cohort}</b>. That reversibility is what made
                filtering thousands of sessions inside the LMS possible.
              </p>
            </div>
          )}

          <div className="demo-panel-actions">
            <button type="button" className="demo-action" onClick={enqueue}>
              <ListPlus size={13} aria-hidden="true" /> Add to the batch
            </button>
          </div>
        </section>

        <section className="demo-panel" aria-label="Batch run">
          <div className="demo-panel-head">
            <h2>The batch run</h2>
            <button
              type="button"
              className="demo-action demo-action-primary"
              disabled={runs.length === 0 || runs.every(isDone)}
              onClick={() => setRunning((value) => !value)}
            >
              {running ? <Square size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
              {running ? "Pause" : "Run the batch"}
            </button>
          </div>

          {runs.length === 0 ? (
            <p className="demo-note">
              Queue a session on the left. The original moved thousands per month through these four steps
              without a person touching each one.
            </p>
          ) : (
            <ul className="demo-runs">
              {runs.map((run) => (
                <li key={run.code} className={isDone(run) ? "is-done" : ""}>
                  <b>{run.code}</b>
                  <span className="demo-run-stages">
                    {RUN_STAGES.map((stage, index) => (
                      <i
                        key={stage}
                        className={index <= run.completed ? "is-complete" : ""}
                        title={stage}
                      >
                        {stage}
                      </i>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DemoShell>
  );
}
