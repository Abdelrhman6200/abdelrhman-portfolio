/*
 * A running miniature of a system.
 *
 * Each project on this site is a pipeline: work enters, passes through stages,
 * and leaves as a finished unit. Rather than draw that as a static diagram,
 * this component runs it — tokens of work move through the stages on a clock,
 * stages light up as they take work, and a counter records what has completed.
 *
 * Three rules govern it:
 *
 *   1. It never runs unseen. An IntersectionObserver stops the clock when the
 *      simulation scrolls out of view, so a page of these costs nothing idle.
 *   2. It respects `prefers-reduced-motion`. Under that setting no clock starts
 *      at all and a representative still frame is shown instead — the
 *      information survives, the motion does not.
 *   3. It is decorative, not informational. Everything the animation conveys is
 *      also written in the text beside it, and the figure is hidden from
 *      assistive technology.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type SimulationStage = {
  /** Short stage name, shown under the rail. */
  label: string;
  /** What this stage does to a unit of work. Shown when the stage is active. */
  detail: string;
};

export type SimulationSpec = {
  /** What flows through — "session", "record", "draft". Used in the caption. */
  unit: string;
  /** Plural of `unit`, for the completed counter. */
  units: string;
  stages: SimulationStage[];
  /** Milliseconds per stage advance. */
  tickMs?: number;
  /** Where the counter starts, so a card does not always read zero. */
  startCount?: number;
  accent?: "coral" | "orange" | "yellow";
};

type Token = { id: number; stage: number };

/** Tokens in flight at once. Enough to read as a flow, few enough to stay calm. */
const MAX_TOKENS = 4;

export default function SystemSimulation({ spec, label }: { spec: SimulationSpec; label: string }) {
  const { stages, tickMs = 1100, startCount = 0, accent = "coral" } = spec;
  const lastStage = stages.length - 1;

  // Live, not frozen: turning the OS setting on mid-session stops the clock.
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(startCount);
  const [tokens, setTokens] = useState<Token[]>(() =>
    // Under reduced motion, show a filled pipeline as the still frame; otherwise
    // start empty and let work flow in.
    reduced ? stages.map((_, index) => ({ id: index, stage: index })) : [{ id: 0, stage: 0 }]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(stages.length + 1);

  // Only run while on screen.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || reduced) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const running = visible && !paused && !reduced;

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setTokens((current) => {
        let finished = 0;
        const advanced: Token[] = [];

        for (const token of current) {
          if (token.stage >= lastStage) {
            finished += 1;
            continue;
          }
          advanced.push({ ...token, stage: token.stage + 1 });
        }

        // Feed new work in while there is room, so the pipeline stays busy.
        if (advanced.length < MAX_TOKENS && !advanced.some((token) => token.stage === 0)) {
          advanced.push({ id: nextId.current++, stage: 0 });
        }

        if (finished > 0) setCompleted((value) => value + finished);
        return advanced;
      });
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [running, lastStage, tickMs]);

  const activeStages = useMemo(() => new Set(tokens.map((token) => token.stage)), [tokens]);

  // The furthest-along token drives the detail caption, so the text tracks the
  // leading edge of the work rather than flickering between stages.
  const leadStage = tokens.length ? Math.max(...tokens.map((token) => token.stage)) : 0;

  const togglePaused = useCallback(() => setPaused((value) => !value), []);

  return (
    <div ref={containerRef} className={`sim sim-${accent}`} data-running={running || undefined}>
      <div className="sim-head">
        <span className="sim-title">{label}</span>
        {reduced ? (
          <span className="sim-static-note">STILL FRAME / REDUCED MOTION</span>
        ) : (
          <button
            type="button"
            className="sim-toggle"
            onClick={togglePaused}
            aria-label={paused ? `Play the ${label} simulation` : `Pause the ${label} simulation`}
          >
            {paused ? <Play size={11} aria-hidden="true" /> : <Pause size={11} aria-hidden="true" />}
            {paused ? "RUN" : "RUNNING"}
          </button>
        )}
      </div>

      {/* Decorative: the stage names, the active detail and the completed count
          are all rendered as real text below. */}
      <div className="sim-rail" aria-hidden="true">
        <div className="sim-track">
          {stages.map((stage, index) => (
            <span
              key={stage.label}
              className={`sim-node ${activeStages.has(index) ? "is-active" : ""}`}
              style={{ left: `${(index / lastStage) * 100}%` }}
            />
          ))}
          {tokens.map((token) => (
            <span
              key={token.id}
              className="sim-token"
              style={{
                left: `${(token.stage / lastStage) * 100}%`,
                transitionDuration: `${Math.round(tickMs * 0.8)}ms`,
              }}
            />
          ))}
        </div>
        <div className="sim-labels">
          {stages.map((stage, index) => (
            <span key={stage.label} className={activeStages.has(index) ? "is-active" : ""}>
              {stage.label}
            </span>
          ))}
        </div>
      </div>

      <p className="sim-detail">{stages[leadStage]?.detail}</p>

      <div className="sim-meter">
        <span>
          <b>{completed.toLocaleString()}</b> {spec.units} completed
        </span>
        <span className="sim-inflight">
          {tokens.length} {tokens.length === 1 ? spec.unit : spec.units} in flight
        </span>
      </div>
    </div>
  );
}
