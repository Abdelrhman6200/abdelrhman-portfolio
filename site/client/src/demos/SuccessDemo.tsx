/*
 * Community Success OS demo.
 *
 * Four students with live signal sliders. Moving a slider re-scores the
 * student in front of the visitor, and the score always arrives with the
 * rules that produced it — the evidence-first behaviour the real product is
 * built around. Recording an intervention closes the loop.
 */
import { useMemo, useState } from "react";
import { HeartPulse, UserRoundCheck } from "lucide-react";
import DemoShell from "./DemoShell";
import {
  assess,
  seedStudents,
  type InterventionRecord,
  type StudentSignals,
} from "./logic/riskScore";

const bandLabel = { healthy: "HEALTHY", watch: "WATCH", "at-risk": "AT RISK" } as const;

export default function SuccessDemo() {
  const [students, setStudents] = useState<StudentSignals[]>(() => seedStudents.map((student) => ({ ...student })));
  const [selected, setSelected] = useState(2); // Dina, the seeded at-risk case
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);

  const student = students[selected];
  const result = useMemo(() => assess(student), [student]);

  const setSignal = <Key extends keyof StudentSignals>(key: Key, value: StudentSignals[Key]) =>
    setStudents((current) =>
      current.map((item, index) => (index === selected ? { ...item, [key]: value } : item))
    );

  const recordIntervention = () =>
    setInterventions((current) => [
      { student: student.name, action: result.recommendation, outcome: null },
      ...current,
    ]);

  const setOutcome = (index: number, outcome: InterventionRecord["outcome"]) =>
    setInterventions((current) =>
      current.map((record, i) => (i === index ? { ...record, outcome } : record))
    );

  return (
    <DemoShell
      title="Community Success OS"
      lede="Pick a student and move their signals — the risk score re-computes live, and it never appears without the evidence that produced it. That inseparability is the product."
      caseFileSlug="community-success-os"
    >
      <div className="demo-columns demo-columns-wide-right">
        <section className="demo-panel" aria-label="Students">
          <div className="demo-panel-head">
            <h2>Students</h2>
          </div>
          <div className="demo-student-list">
            {students.map((item, index) => {
              const assessment = assess(item);
              return (
                <button
                  key={item.name}
                  type="button"
                  className={`demo-student ${index === selected ? "is-active" : ""}`}
                  aria-pressed={index === selected}
                  onClick={() => setSelected(index)}
                >
                  <span className="demo-student-name">{item.name}</span>
                  <span className={`demo-band demo-band-${assessment.band}`}>
                    {bandLabel[assessment.band]} / {assessment.score}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="demo-signals">
            <h3>Signals for {student.name.split(" ")[0]}</h3>
            <label className="demo-slider">
              <span>
                Attendance — {student.attendedOfSix} of last 6
              </span>
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
                Renewal — {student.renewalInDays < 0 ? `${-student.renewalInDays}d overdue` : `in ${student.renewalInDays}d`}
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
        </section>

        <section className="demo-panel" aria-label="Assessment">
          <div className="demo-panel-head">
            <h2>
              <HeartPulse size={15} aria-hidden="true" /> Student 360 — {student.name}
            </h2>
            <span className={`demo-band demo-band-${result.band}`}>
              {bandLabel[result.band]} / {result.score}
            </span>
          </div>

          <div className="demo-evidence">
            <h3>Why this score — every rule that fired</h3>
            {result.reasons.length === 0 ? (
              <p className="demo-note demo-note-good">No risk rules fired. The score is 0 because nothing supports one.</p>
            ) : (
              <ul>
                {result.reasons.map((reason) => (
                  <li key={reason.rule}>
                    <b>+{reason.points}</b>
                    <span>
                      <i>{reason.rule}</i> — {reason.evidence}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="demo-recommendation">
            <h3>Suggested next step</h3>
            <p>{result.recommendation}</p>
            {result.band !== "healthy" && (
              <button type="button" className="demo-action demo-action-primary" onClick={recordIntervention}>
                <UserRoundCheck size={13} aria-hidden="true" /> Record this intervention
              </button>
            )}
          </div>

          {interventions.length > 0 && (
            <div className="demo-history">
              <h3>Interventions this session</h3>
              <ol>
                {interventions.map((record, index) => (
                  <li key={index} className="demo-intervention">
                    <span>
                      <b>{record.student}</b> — {record.action}
                    </span>
                    {record.outcome ? (
                      <i className={`demo-outcome demo-outcome-${record.outcome}`}>{record.outcome.replace("-", " ")}</i>
                    ) : (
                      <span className="demo-outcome-buttons">
                        {(["re-engaged", "no-response", "churned"] as const).map((outcome) => (
                          <button key={outcome} type="button" onClick={() => setOutcome(index, outcome)}>
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
    </DemoShell>
  );
}
