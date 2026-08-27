/*
 * Community Success OS demo — a success workspace with a live gauge.
 *
 * The gauge is the argument: its needle position is exactly the sum of the
 * evidence rows beside it, and dragging any signal moves both together. A
 * score that cannot be separated from its reasons is the product.
 */
import { useMemo, useState } from "react";
import { HeartPulse, UserRoundCheck } from "lucide-react";
import DemoShell from "./DemoShell";
import AppWindow from "./AppWindow";
import {
  assess,
  seedStudents,
  type InterventionRecord,
  type StudentSignals,
} from "./logic/riskScore";

const bandLabel = { healthy: "HEALTHY", watch: "WATCH", "at-risk": "AT RISK" } as const;

/** Semi-circular gauge; the arc fills to score/100. */
function RiskGauge({ score, band }: { score: number; band: keyof typeof bandLabel }) {
  const radius = 54;
  const circumference = Math.PI * radius; // half circle
  const filled = (score / 100) * circumference;
  return (
    <svg viewBox="0 0 140 78" className={`sx-gauge sx-gauge-${band}`} role="img" aria-label={`Risk score ${score} of 100`}>
      <path d="M 16 70 A 54 54 0 0 1 124 70" className="sx-gauge-track" />
      <path
        d="M 16 70 A 54 54 0 0 1 124 70"
        className="sx-gauge-fill"
        strokeDasharray={`${filled} ${circumference}`}
      />
      <text x="70" y="58" textAnchor="middle" className="sx-gauge-score">
        {score}
      </text>
      <text x="70" y="72" textAnchor="middle" className="sx-gauge-label">
        {bandLabel[band]}
      </text>
    </svg>
  );
}

export default function SuccessDemo() {
  const [students, setStudents] = useState<StudentSignals[]>(() =>
    seedStudents.map((student) => ({ ...student }))
  );
  const [selected, setSelected] = useState(2); // Dina — the seeded at-risk case
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);

  const student = students[selected];
  const result = useMemo(() => assess(student), [student]);
  const atRiskCount = students.filter((item) => assess(item).band === "at-risk").length;

  const setSignal = <Key extends keyof StudentSignals>(key: Key, value: StudentSignals[Key]) =>
    setStudents((current) =>
      current.map((item, index) => (index === selected ? { ...item, [key]: value } : item))
    );

  return (
    <DemoShell
      title="Community Success OS"
      lede="Drag a signal and watch the gauge and the evidence move together — the score is literally the sum of the rules beside it, and it cannot appear without them."
      caseFileSlug="community-success-os"
    >
      <AppWindow
        name="Success workspace — cohort C03"
        meta={
          <span className="sx-cohort-stat">
            <b>{atRiskCount}</b> of {students.length} at risk
          </span>
        }
      >
        <div className="sx-layout">
          {/* --- Roster ------------------------------------------------------- */}
          <aside className="sx-rail">
            <span className="sx-rail-label">STUDENTS</span>
            {students.map((item, index) => {
              const assessment = assess(item);
              return (
                <button
                  key={item.name}
                  type="button"
                  className={`sx-student ${index === selected ? "is-active" : ""}`}
                  aria-pressed={index === selected}
                  onClick={() => setSelected(index)}
                >
                  <span className="sx-avatar" aria-hidden="true">
                    {item.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <span className="sx-student-copy">
                    <b>{item.name}</b>
                    <small>{item.progressPercent}% through the course</small>
                  </span>
                  <i className={`demo-band demo-band-${assessment.band}`}>{assessment.score}</i>
                </button>
              );
            })}

            <div className="sx-signals">
              <span className="sx-rail-label">SIGNALS — DRAG THEM</span>
              <label className="demo-slider">
                <span>Attendance — {student.attendedOfSix} of last 6</span>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={student.attendedOfSix}
                  onChange={(event) => setSignal("attendedOfSix", Number(event.target.value))}
                />
              </label>
              <label className="demo-slider">
                <span>Days inactive — {student.inactiveDays}</span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={student.inactiveDays}
                  onChange={(event) => setSignal("inactiveDays", Number(event.target.value))}
                />
              </label>
              <label className="demo-slider">
                <span>Progress — {student.progressPercent}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={student.progressPercent}
                  onChange={(event) => setSignal("progressPercent", Number(event.target.value))}
                />
              </label>
              <label className="demo-slider">
                <span>
                  Renewal —{" "}
                  {student.renewalInDays < 0
                    ? `${-student.renewalInDays}d overdue`
                    : `in ${student.renewalInDays}d`}
                </span>
                <input
                  type="range"
                  min={-30}
                  max={120}
                  value={student.renewalInDays}
                  onChange={(event) => setSignal("renewalInDays", Number(event.target.value))}
                />
              </label>
              <label className="demo-check">
                <input
                  type="checkbox"
                  checked={student.communityActive}
                  onChange={(event) => setSignal("communityActive", event.target.checked)}
                />
                <span>Active in the community this month</span>
              </label>
            </div>
          </aside>

          {/* --- Student 360 --------------------------------------------------- */}
          <section className="sx-main" aria-label={`Student 360 for ${student.name}`}>
            <header className="sx-main-head">
              <div>
                <h2>
                  <HeartPulse size={16} aria-hidden="true" /> {student.name}
                </h2>
                <small>Student 360 — one view, evidence attached</small>
              </div>
              <RiskGauge score={result.score} band={result.band} />
            </header>

            <div className="sx-evidence">
              <span className="sx-rail-label">WHY THIS SCORE — EVERY RULE THAT FIRED</span>
              {result.reasons.length === 0 ? (
                <p className="demo-note demo-note-good">
                  No risk rules fired. The score is 0 because nothing supports one.
                </p>
              ) : (
                <ul>
                  {result.reasons.map((reason) => (
                    <li key={reason.rule}>
                      <b className="sx-points">+{reason.points}</b>
                      <span className="sx-points-bar" aria-hidden="true">
                        <i style={{ width: `${(reason.points / 40) * 100}%` }} />
                      </span>
                      <span className="sx-reason">
                        <i>{reason.rule}</i> {reason.evidence}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="sx-next">
              <span className="sx-rail-label">SUGGESTED NEXT STEP</span>
              <p>{result.recommendation}</p>
              {result.band !== "healthy" && (
                <button
                  type="button"
                  className="demo-action demo-action-primary"
                  onClick={() =>
                    setInterventions((current) => [
                      { student: student.name, action: result.recommendation, outcome: null },
                      ...current,
                    ])
                  }
                >
                  <UserRoundCheck size={13} aria-hidden="true" /> Record this intervention
                </button>
              )}
            </div>

            {interventions.length > 0 && (
              <div className="sx-log">
                <span className="sx-rail-label">INTERVENTIONS THIS SESSION</span>
                <ol>
                  {interventions.map((record, index) => (
                    <li key={index} className="demo-intervention">
                      <span>
                        <b>{record.student}</b> — {record.action}
                      </span>
                      {record.outcome ? (
                        <i className={`demo-outcome demo-outcome-${record.outcome}`}>
                          {record.outcome.replace("-", " ")}
                        </i>
                      ) : (
                        <span className="demo-outcome-buttons">
                          {(["re-engaged", "no-response", "churned"] as const).map((outcome) => (
                            <button
                              key={outcome}
                              type="button"
                              onClick={() =>
                                setInterventions((current) =>
                                  current.map((item, i) => (i === index ? { ...item, outcome } : item))
                                )
                              }
                            >
                              {outcome.replace("-", " ")}
                            </button>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                <p className="demo-hint">
                  In the real product, recorded outcomes feed back into which signals count as risk.
                </p>
              </div>
            )}
          </section>
        </div>
      </AppWindow>
    </DemoShell>
  );
}
