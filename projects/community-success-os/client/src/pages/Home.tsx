/** DESIGN CONTEXT — The Learning Ledger control tower turns stored student signals into concise, traceable next actions. */
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CircleCheck,
  FileText,
  HeartPulse,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useLocation } from "wouter";
import { WorkspaceLoading } from "./OperationsPages";

const initials = (name: string) =>
  name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2);
const dateLabel = (value?: Date | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";

export default function Home() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  const [, setLocation] = useLocation();
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data)
    return (
      <div className="error-panel">
        <AlertCircle />
        <div>
          <h2>Workspace data is unavailable.</h2>
          <p>Please refresh the page or sign in again.</p>
        </div>
      </div>
    );
  const studentById = new Map(
    data.students.map(student => [student.id, student])
  );
  const prioritySignals = data.signals
    .filter(signal => signal.state === "open")
    .slice(0, 3);
  const topStudents = data.achievements
    .slice(0, 3)
    .map(achievement => ({
      achievement,
      student: studentById.get(achievement.studentId),
    }))
    .filter(item => item.student);
  const activeRenewals = data.renewals
    .filter(
      renewal => !["renewed", "churned", "dismissed"].includes(renewal.state)
    )
    .slice(0, 4);
  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">TODAY’S CONTROL TOWER</p>
          <h1>Keep the learning loop moving.</h1>
          <p>
            Stored activity, human follow-up, and renewal context are visible
            together—so the team can choose the next step with evidence.
          </p>
        </div>
        <button
          className="ledger-button secondary"
          onClick={() => setLocation("/review")}
        >
          <FileText size={15} />
          Open weekly review
        </button>
      </section>
      <section className="metrics-grid">
        <Metric
          label="Active students"
          value={data.stats.activeStudents}
          detail="Across active cohorts"
          icon={<UsersRound />}
        />
        <Metric
          label="Renewal cases"
          value={data.stats.renewalDue}
          detail="Open or in progress"
          icon={<HeartPulse />}
          accent
        />
        <Metric
          label="Open signals"
          value={data.stats.openSignals}
          detail="Needs human review"
          icon={<Sparkles />}
        />
        <Metric
          label="Sessions today"
          value={data.stats.sessionsToday}
          detail="Current program schedule"
          icon={<CalendarDays />}
        />
      </section>
      <section className="dashboard-columns">
        <div className="page-stack">
          <section className="ledger-panel priority-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">PRIORITY QUEUE</p>
                <h2>What needs a deliberate next step?</h2>
              </div>
              <button
                className="text-action"
                onClick={() => setLocation("/engagement")}
              >
                Review signals <ArrowRight size={14} />
              </button>
            </div>
            <div className="priority-list">
              {prioritySignals.map(signal => {
                const student = studentById.get(signal.studentId);
                return (
                  <article
                    key={signal.id}
                    className={`priority-row priority-${signal.type}`}
                  >
                    <span className="priority-rule" />
                    <div className="priority-copy">
                      <small>{signal.type.replaceAll("_", " ")}</small>
                      <h3>{student?.name ?? "Student"}</h3>
                      <p>{signal.explanation}</p>
                    </div>
                    <button
                      className="ledger-button compact secondary"
                      onClick={() =>
                        student && setLocation(`/students/${student.id}`)
                      }
                    >
                      See evidence <ArrowRight size={13} />
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="ledger-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">RENEWAL PIPELINE</p>
                <h2>Opportunity needs context before outreach.</h2>
              </div>
              <button
                className="text-action"
                onClick={() => setLocation("/renewals")}
              >
                Open queue <ArrowRight size={14} />
              </button>
            </div>
            <div className="data-table renewal-table">
              <div className="data-head">
                <span>STUDENT</span>
                <span>RENEWS</span>
                <span>STATE</span>
                <span />
              </div>
              {activeRenewals.map(renewal => {
                const student = studentById.get(renewal.studentId);
                return (
                  <div className="data-row" key={renewal.id}>
                    <div className="name-cell">
                      <span className="initial-avatar">
                        {initials(student?.name ?? "Student")}
                      </span>
                      <div>
                        <b>{student?.name}</b>
                        <small>
                          {student?.progressPercent}% course progress
                        </small>
                      </div>
                    </div>
                    <span>{dateLabel(renewal.renewalDate)}</span>
                    <span className={`state-chip state-${renewal.state}`}>
                      {renewal.state.replaceAll("_", " ")}
                    </span>
                    <button
                      className="icon-action"
                      onClick={() =>
                        student && setLocation(`/students/${student.id}`)
                      }
                    >
                      <ArrowRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
        <aside className="page-stack">
          <section className="analyst-callout">
            <img src="/brand/evidence-field.svg" alt="Abstract evidence map" />
            <div>
              <p className="eyebrow">AI OPERATIONS ANALYST</p>
              <h2>Ask what changed, then inspect the evidence.</h2>
              <p>
                The analyst works only from stored workspace records and names
                data limits alongside recommendations.
              </p>
              <button onClick={() => setLocation("/ai")}>
                Open analyst <ArrowRight size={14} />
              </button>
            </div>
          </section>
          <section className="ledger-panel small-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">TALENT WATCHLIST</p>
                <h2>Recognition with reasons.</h2>
              </div>
            </div>
            <div className="watch-list">
              {topStudents.map(
                ({ achievement, student }) =>
                  student && (
                    <button
                      key={achievement.id}
                      className="watch-row"
                      onClick={() => setLocation(`/students/${student.id}`)}
                    >
                      <span className="initial-avatar green">
                        {initials(student.name)}
                      </span>
                      <span>
                        <b>{student.name}</b>
                        <small>{achievement.type.replaceAll("_", " ")}</small>
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  )
              )}
            </div>
          </section>
          <section className="ledger-panel small-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">TODAY’S SESSIONS</p>
                <h2>One room needs a closer look.</h2>
              </div>
              <button
                className="icon-action"
                onClick={() => setLocation("/sessions")}
              >
                <ArrowRight size={14} />
              </button>
            </div>
            {data.sessions.slice(0, 2).map(session => (
              <div className="session-line" key={session.id}>
                <strong>
                  {new Date(session.startsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
                <span>
                  <b>{session.title}</b>
                  <small>
                    {session.attendeeCount} / {session.capacity} attendees ·{" "}
                    {session.notes}
                  </small>
                </span>
              </div>
            ))}
          </section>
        </aside>
      </section>
    </div>
  );
}
function Metric({
  label,
  value,
  detail,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section className={`metric-ledger ${accent ? "metric-accent" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
      <i>{icon}</i>
    </section>
  );
}
