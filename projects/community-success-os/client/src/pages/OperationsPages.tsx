/** DESIGN CONTEXT — Operational modules retain the Learning Ledger’s warm hierarchy while reading and writing persistent workspace data. */
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleCheck,
  Clock3,
  FileText,
  Loader2,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useRoute } from "wouter";

const fmtDate = (value?: Date | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";
const initials = (name: string) =>
  name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2);
const titleCase = (value: string) => value.replaceAll("_", " ");

export function WorkspaceLoading() {
  return (
    <div className="module-loading">
      <Loader2 className="animate-spin" />
      <span>Loading your operational workspace…</span>
    </div>
  );
}
function PageHeader({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="page-hero">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </section>
  );
}
function ErrorState() {
  return (
    <div className="error-panel">
      <AlertCircle />
      <div>
        <h2>The workspace could not be loaded.</h2>
        <p>Refresh the page to try again.</p>
      </div>
    </div>
  );
}
function StudentAvatar({ name, tone = "" }: { name: string; tone?: string }) {
  return <span className={`initial-avatar ${tone}`}>{initials(name)}</span>;
}

export function StudentsPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  const filtered = data.students.filter(student =>
    `${student.name} ${student.email} ${student.lifecycleState} ${student.engagementState}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="STUDENT 360"
        title="Every student, in context."
        copy="Learning, community, renewal, and operational follow-up live in one coherent evidence record."
        action={
          <div className="search-field">
            <Search size={15} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Find a student"
            />
          </div>
        }
      />
      <section className="ledger-panel table-panel">
        <div className="data-table student-table">
          <div className="data-head">
            <span>STUDENT</span>
            <span>LEARNING</span>
            <span>STATE</span>
            <span>SIGNALS</span>
            <span />
          </div>
          {filtered.map(student => (
            <div className="data-row" key={student.id}>
              <div className="name-cell">
                <StudentAvatar
                  name={student.name}
                  tone={student.engagementState === "healthy" ? "green" : ""}
                />
                <div>
                  <b>{student.name}</b>
                  <small>{student.email}</small>
                </div>
              </div>
              <div className="progress-cell">
                <b>{student.progressPercent}%</b>
                <span>
                  <i style={{ width: `${student.progressPercent}%` }} />
                </span>
                <small>{student.lastLesson ?? "No lesson activity"}</small>
              </div>
              <span className={`state-chip state-${student.lifecycleState}`}>
                {titleCase(student.lifecycleState)}
              </span>
              <small>
                {
                  student.signals.filter(signal => signal.state === "open")
                    .length
                }{" "}
                open
              </small>
              <button
                className="icon-action"
                onClick={() => setLocation(`/students/${student.id}`)}
              >
                <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function StudentDetailPage() {
  const [, params] = useRoute("/students/:id");
  const id = Number(params?.id);
  const { data, isLoading, error } = trpc.students.detail.useQuery(
    { id },
    { enabled: Number.isFinite(id) && id > 0 }
  );
  const utils = trpc.useUtils();
  const updateSignal = trpc.signals.update.useMutation({
    onSuccess: () => utils.students.detail.invalidate({ id }),
  });
  const updateIntervention = trpc.interventions.update.useMutation({
    onSuccess: () => utils.students.detail.invalidate({ id }),
  });
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  const student = data.student;
  const timeline = [
    ...data.community.map(item => ({
      type: "Community",
      copy: item.summary,
      date: item.occurredAt,
    })),
    ...data.learningEvents.map(item => ({
      type: "Learning",
      copy: `${titleCase(item.eventType)} course activity`,
      date: item.occurredAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className="page-stack">
      <Link href="/students" className="back-link">
        <ArrowLeft size={15} />
        Students
      </Link>
      <section className="student-banner">
        <StudentAvatar
          name={student.name}
          tone={student.engagementState === "healthy" ? "green" : ""}
        />
        <div>
          <p className="eyebrow">STUDENT 360 · {student.externalId}</p>
          <h1>{student.name}</h1>
          <p>
            {student.email} · {student.timezone} ·{" "}
            {student.source ?? "Manual record"}
          </p>
        </div>
        <span className={`state-chip state-${student.lifecycleState}`}>
          {titleCase(student.lifecycleState)}
        </span>
      </section>
      <section className="detail-grid">
        <div className="page-stack">
          <section className="ledger-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">CURRENT CONTEXT</p>
                <h2>Learning and renewal context.</h2>
              </div>
            </div>
            <div className="detail-stats">
              <div>
                <span>Course progress</span>
                <strong>{student.progressPercent}%</strong>
                <small>{student.lastLesson}</small>
              </div>
              <div>
                <span>Renewal date</span>
                <strong>{fmtDate(data.renewal?.renewalDate)}</strong>
                <small>
                  {data.renewal?.state
                    ? titleCase(data.renewal.state)
                    : "No renewal case"}
                </small>
              </div>
              <div>
                <span>Last contact</span>
                <strong>{fmtDate(student.lastContactAt)}</strong>
                <small>{student.engagementState} engagement</small>
              </div>
            </div>
          </section>
          <section className="ledger-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">SIGNALS & EVIDENCE</p>
                <h2>Observed, calculated, and reviewable.</h2>
              </div>
            </div>
            {data.signals.map(signal => (
              <article className="evidence-row" key={signal.id}>
                <span className="evidence-dot" />
                <div>
                  <b>{titleCase(signal.type)}</b>
                  <p>{signal.explanation}</p>
                  <small>
                    {signal.periodLabel} · State: {signal.state}
                  </small>
                </div>
                {signal.state === "open" && (
                  <button
                    className="ledger-button compact secondary"
                    onClick={() =>
                      updateSignal.mutate({ id: signal.id, state: "resolved" })
                    }
                  >
                    Resolve
                  </button>
                )}
              </article>
            ))}
          </section>
          <section className="ledger-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">TIMELINE</p>
                <h2>Imported and recorded activity.</h2>
              </div>
            </div>
            {timeline.map((event, index) => (
              <div className="timeline-row" key={`${event.type}-${index}`}>
                <span />
                <div>
                  <small>
                    {event.type} · {fmtDate(event.date)}
                  </small>
                  <p>{event.copy}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
        <aside className="page-stack">
          <section className="ledger-panel small-panel">
            <p className="eyebrow">INTERVENTIONS</p>
            <h2>Follow-through with ownership.</h2>
            {data.interventions.map(intervention => (
              <div className="intervention-line" key={intervention.id}>
                <span className={`state-chip state-${intervention.status}`}>
                  {titleCase(intervention.status)}
                </span>
                <b>{titleCase(intervention.type)}</b>
                <p>{intervention.nextAction}</p>
                {!["completed", "dismissed"].includes(intervention.status) && (
                  <button
                    className="text-action"
                    onClick={() =>
                      updateIntervention.mutate({
                        id: intervention.id,
                        status: "completed",
                        outcome: "Completed in workspace",
                      })
                    }
                  >
                    Mark complete <Check size={13} />
                  </button>
                )}
              </div>
            ))}
          </section>
          <section className="ledger-panel small-panel">
            <p className="eyebrow">RECOGNITION</p>
            <h2>Supported categories.</h2>
            {data.achievements.length ? (
              data.achievements.map(achievement => (
                <div className="recognition-line" key={achievement.id}>
                  <CircleCheck size={15} />
                  <span>
                    <b>{titleCase(achievement.type)}</b>
                    <small>{achievement.source}</small>
                  </span>
                </div>
              ))
            ) : (
              <p className="muted-copy">
                No recognition category has been recorded.
              </p>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}

export function RenewalsPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  const utils = trpc.useUtils();
  const update = trpc.renewals.update.useMutation({
    onSuccess: () => {
      utils.workspace.data.invalidate();
      toast.success("Renewal case updated");
    },
  });
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  const byId = new Map(data.students.map(student => [student.id, student]));
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="RENEWAL INTELLIGENCE"
        title="Follow up with a reason."
        copy="Renewal cases are prioritised by observable learning and community context, not a date alone."
      />
      <section className="ledger-panel table-panel">
        <div className="data-table renewal-table">
          <div className="data-head">
            <span>STUDENT</span>
            <span>RENEWS</span>
            <span>EVIDENCE</span>
            <span>STATE</span>
            <span />
          </div>
          {data.renewals.map(renewal => {
            const student = byId.get(renewal.studentId);
            const signal = data.signals.find(
              entry =>
                entry.studentId === renewal.studentId &&
                entry.type === "renewal_opportunity"
            );
            return (
              <div className="data-row" key={renewal.id}>
                <div className="name-cell">
                  <StudentAvatar name={student?.name ?? "Student"} />
                  <div>
                    <b>{student?.name}</b>
                    <small>{student?.progressPercent}% course progress</small>
                  </div>
                </div>
                <span>{fmtDate(renewal.renewalDate)}</span>
                <small>
                  {signal?.explanation ?? "Review recent student context."}
                </small>
                <select
                  value={renewal.state}
                  onChange={event =>
                    update.mutate({
                      id: renewal.id,
                      state: event.target.value as
                        | "not_started"
                        | "planned"
                        | "contacted"
                        | "renewed"
                        | "churned"
                        | "dismissed",
                    })
                  }
                >
                  <option value="not_started">Not started</option>
                  <option value="planned">Planned</option>
                  <option value="contacted">Contacted</option>
                  <option value="renewed">Renewed</option>
                  <option value="churned">Churned</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                <Link
                  href={`/students/${renewal.studentId}`}
                  className="icon-action"
                >
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function InterventionsPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.interventions.create.useMutation({
    onSuccess: () => {
      utils.workspace.data.invalidate();
      toast.success(
        "Intervention drafted and assigned to the workspace queue."
      );
    },
  });
  const update = trpc.interventions.update.useMutation({
    onSuccess: () => utils.workspace.data.invalidate(),
  });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    studentId: 0,
    type: "support" as const,
    priority: "medium" as const,
    reason: "",
    nextAction: "",
  });
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  const byId = new Map(data.students.map(student => [student.id, student]));
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="INTERVENTION & FOLLOW-UP"
        title="Make the next step explicit."
        copy="Interventions are human-owned, evidence-led, and persistent. They create the feedback loop for measuring what helped."
        action={
          <button
            className="ledger-button"
            onClick={() => {
              setOpen(!open);
              if (!draft.studentId && data.students[0])
                setDraft(current => ({
                  ...current,
                  studentId: data.students[0].id,
                }));
            }}
          >
            <Plus size={15} />
            New intervention
          </button>
        }
      />
      {open && (
        <form
          className="ledger-panel intervention-form"
          onSubmit={event => {
            event.preventDefault();
            create.mutate(draft, {
              onSuccess: () => {
                setOpen(false);
                setDraft({
                  studentId: data.students[0]?.id ?? 0,
                  type: "support",
                  priority: "medium",
                  reason: "",
                  nextAction: "",
                });
              },
            });
          }}
        >
          <select
            value={draft.studentId}
            onChange={event =>
              setDraft({ ...draft, studentId: Number(event.target.value) })
            }
          >
            {data.students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          <select
            value={draft.type}
            onChange={event =>
              setDraft({
                ...draft,
                type: event.target.value as typeof draft.type,
              })
            }
          >
            <option value="support">Support</option>
            <option value="onboarding">Onboarding</option>
            <option value="renewal">Renewal</option>
            <option value="disengagement">Disengagement</option>
            <option value="recognition">Recognition</option>
            <option value="content_followup">Content follow-up</option>
          </select>
          <select
            value={draft.priority}
            onChange={event =>
              setDraft({
                ...draft,
                priority: event.target.value as typeof draft.priority,
              })
            }
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
            <option value="urgent">Urgent</option>
          </select>
          <textarea
            required
            value={draft.reason}
            onChange={event =>
              setDraft({ ...draft, reason: event.target.value })
            }
            placeholder="Evidence-based reason"
          />
          <textarea
            required
            value={draft.nextAction}
            onChange={event =>
              setDraft({ ...draft, nextAction: event.target.value })
            }
            placeholder="Human-approved next action"
          />
          <button className="ledger-button" disabled={create.isPending}>
            Save intervention
          </button>
        </form>
      )}
      <section className="ledger-panel table-panel">
        <div className="data-table interventions-table">
          <div className="data-head">
            <span>STUDENT</span>
            <span>TYPE</span>
            <span>REASON</span>
            <span>STATE</span>
            <span />
          </div>
          {data.interventions.map(intervention => (
            <div className="data-row" key={intervention.id}>
              <div className="name-cell">
                <StudentAvatar
                  name={byId.get(intervention.studentId)?.name ?? "Student"}
                />
                <b>{byId.get(intervention.studentId)?.name}</b>
              </div>
              <span className={`state-chip state-${intervention.priority}`}>
                {titleCase(intervention.type)}
              </span>
              <small>{intervention.reason}</small>
              <select
                value={intervention.status}
                onChange={event =>
                  update.mutate({
                    id: intervention.id,
                    status: event.target.value as
                      | "open"
                      | "in_progress"
                      | "waiting"
                      | "completed"
                      | "dismissed",
                  })
                }
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="waiting">Waiting</option>
                <option value="completed">Completed</option>
                <option value="dismissed">Dismissed</option>
              </select>
              <Link
                href={`/students/${intervention.studentId}`}
                className="icon-action"
              >
                <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function EngagementPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  const utils = trpc.useUtils();
  const update = trpc.signals.update.useMutation({
    onSuccess: () => utils.workspace.data.invalidate(),
  });
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  const byId = new Map(data.students.map(student => [student.id, student]));
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ENGAGEMENT INTELLIGENCE"
        title="See change before it hardens."
        copy="Each activity signal is compared with stored learning and community events, then kept reviewable by the team."
      />
      <section className="engagement-board">
        {data.signals
          .filter(signal =>
            [
              "engagement_drop",
              "onboarding_gap",
              "community_contributor",
            ].includes(signal.type)
          )
          .map(signal => (
            <article className="ledger-panel signal-card" key={signal.id}>
              <p className="eyebrow">{titleCase(signal.type)}</p>
              <h2>{byId.get(signal.studentId)?.name}</h2>
              <p>{signal.explanation}</p>
              <div>
                <span className={`state-chip state-${signal.state}`}>
                  {signal.state}
                </span>
                {signal.state === "open" && (
                  <button
                    className="text-action"
                    onClick={() =>
                      update.mutate({ id: signal.id, state: "snoozed" })
                    }
                  >
                    Snooze <Clock3 size={13} />
                  </button>
                )}
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}

export function CommunityPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  const byId = new Map(data.students.map(student => [student.id, student]));
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="COMMUNITY INTELLIGENCE"
        title="Participation is a useful signal."
        copy="Stored posts, workshops, challenges, and submissions are connected back to the student record without exposing raw private data beyond the workspace."
      />
      <section className="community-grid">
        <section className="ledger-panel activity-feed-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RECENT ACTIVITY</p>
              <h2>What learners are doing.</h2>
            </div>
          </div>
          {data.communityEvents.map(event => (
            <article className="activity-row" key={event.id}>
              <StudentAvatar
                name={byId.get(event.studentId)?.name ?? "Student"}
                tone="green"
              />
              <div>
                <b>{byId.get(event.studentId)?.name}</b>
                <p>{event.summary}</p>
                <small>
                  {titleCase(event.eventType)} · {fmtDate(event.occurredAt)}
                </small>
              </div>
            </article>
          ))}
        </section>
        <section className="ledger-panel small-panel">
          <p className="eyebrow">CONNECTED INSIGHT</p>
          <h2>
            Community contributors are also visible to recognition workflows.
          </h2>
          <p className="muted-copy">
            The current workspace has{" "}
            {
              data.signals.filter(
                signal => signal.type === "community_contributor"
              ).length
            }{" "}
            contributor signal ready for human review.
          </p>
        </section>
      </section>
    </div>
  );
}

export function CoursePage() {
  const [query, setQuery] = useState("peer feedback");
  const search = trpc.course.search.useQuery(
    { query },
    { enabled: query.trim().length >= 2 }
  );
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="RECORDED PROGRAM"
        title="Find the moment that helps."
        copy="Search is grounded in the stored lesson transcript and returns the source lesson rather than an invented answer."
      />
      <section className="course-search">
        <img
          src="/brand/course-threads.svg"
          alt="Abstract course knowledge artwork"
        />
        <div>
          <p className="eyebrow">COURSE KNOWLEDGE</p>
          <h2>Ask the recorded course.</h2>
          <label className="search-field">
            <Search size={15} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search lessons and transcripts"
            />
          </label>
        </div>
      </section>
      <section className="page-stack">
        {search.isLoading ? (
          <WorkspaceLoading />
        ) : (
          search.data?.map(lesson => (
            <article className="ledger-panel lesson-result" key={lesson.id}>
              <span className="state-chip state-active">
                Lesson {lesson.orderIndex}
              </span>
              <div>
                <h2>{lesson.title}</h2>
                <p>
                  {lesson.chapter} · {lesson.durationMinutes} minutes
                </p>
                <blockquote>
                  {lesson.transcript?.slice(0, 260)}
                  {(lesson.transcript?.length ?? 0) > 260 ? "…" : ""}
                </blockquote>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export function SessionsPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  const instructorById = new Map(
    data.instructors.map(instructor => [instructor.id, instructor])
  );
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="INSTRUCTOR & SESSION OPERATIONS"
        title="Run today’s rooms with context."
        copy="Attendance, capacity, instructor ownership, and exceptions are visible without turning one missed session into a student label."
      />
      <section className="ledger-panel table-panel">
        <div className="data-table sessions-table">
          <div className="data-head">
            <span>TIME</span>
            <span>SESSION</span>
            <span>INSTRUCTOR</span>
            <span>ATTENDANCE</span>
            <span>STATUS</span>
          </div>
          {data.sessions.map(session => (
            <div className="data-row" key={session.id}>
              <b>
                {new Date(session.startsAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </b>
              <div>
                <b>{session.title}</b>
                <small>{fmtDate(session.startsAt)}</small>
              </div>
              <span>{instructorById.get(session.instructorId)?.name}</span>
              <span>
                {session.attendeeCount} / {session.capacity}
              </span>
              <span className={`state-chip state-${session.status}`}>
                {session.notes ?? session.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ContentPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.content.create.useMutation({
    onSuccess: () => {
      utils.workspace.data.invalidate();
      toast.success("Content idea created");
    },
  });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    source: "",
    audience: "Current learners",
    theme: "",
    objective: "",
  });
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CONTENT INTELLIGENCE"
        title="Plan from a real learner question."
        copy="Ideas remain editable and approval-led, with a visible source for the student, course, or program evidence behind them."
        action={
          <button className="ledger-button" onClick={() => setOpen(!open)}>
            <Plus size={15} />
            New idea
          </button>
        }
      />
      {open && (
        <form
          className="ledger-panel inline-form"
          onSubmit={event => {
            event.preventDefault();
            create.mutate(draft, {
              onSuccess: () => {
                setOpen(false);
                setDraft({
                  title: "",
                  source: "",
                  audience: "Current learners",
                  theme: "",
                  objective: "",
                });
              },
            });
          }}
        >
          <input
            required
            placeholder="Idea title"
            value={draft.title}
            onChange={event =>
              setDraft({ ...draft, title: event.target.value })
            }
          />
          <input
            required
            placeholder="Evidence source"
            value={draft.source}
            onChange={event =>
              setDraft({ ...draft, source: event.target.value })
            }
          />
          <input
            required
            placeholder="Audience"
            value={draft.audience}
            onChange={event =>
              setDraft({ ...draft, audience: event.target.value })
            }
          />
          <input
            required
            placeholder="Theme"
            value={draft.theme}
            onChange={event =>
              setDraft({ ...draft, theme: event.target.value })
            }
          />
          <textarea
            required
            placeholder="Objective"
            value={draft.objective}
            onChange={event =>
              setDraft({ ...draft, objective: event.target.value })
            }
          />
          <button className="ledger-button" disabled={create.isPending}>
            Save evidence-led idea
          </button>
        </form>
      )}
      <section className="content-grid">
        {data.contentIdeas.map(idea => (
          <article className="ledger-panel content-card" key={idea.id}>
            <span className={`state-chip state-${idea.status}`}>
              {idea.status}
            </span>
            <h2>{idea.title}</h2>
            <p>{idea.objective}</p>
            <small>
              {idea.source} · {idea.audience}
            </small>
          </article>
        ))}
      </section>
    </div>
  );
}

export function AIAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const analyze = trpc.ai.analyze.useMutation({
    onSuccess: analysis =>
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: `### Observed facts\n${analysis.observedFacts.map(item => `- ${item}`).join("\n")}\n\n### Signals\n${analysis.signals.map(item => `- ${item}`).join("\n")}\n\n### Interpretation\n${analysis.interpretation}\n\n### Recommended human actions\n${analysis.recommendedActions.map(item => `- ${item}`).join("\n")}\n\n### Evidence used\n${analysis.evidence.map(item => `- ${item}`).join("\n")}\n\n### Limitations\n${analysis.limitations.map(item => `- ${item}`).join("\n")}`,
        },
      ]),
    onError: error => {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: `### Analysis unavailable\nThe analyst could not produce a validated response. No student or workflow state was changed.\n\n**Detail:** ${error.message}`,
        },
      ]);
      toast.error(error.message);
    },
  });
  const send = (content: string) => {
    setMessages(current => [...current, { role: "user", content }]);
    analyze.mutate({ question: content });
  };
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="AI OPERATIONS ANALYST"
        title="Ask, inspect, decide."
        copy="The analyst uses authorized workspace records only. It separates observations, signals, interpretations, and recommended human actions—and never changes a student state."
      />
      <AIChatBox
        messages={messages}
        onSendMessage={send}
        isLoading={analyze.isPending}
        height="560px"
        className="analyst-chat"
        emptyStateMessage="Ask a question about the current workspace."
        suggestedPrompts={[
          "Which renewal cases need a clearer next action?",
          "Which students show the largest activity decline?",
          "What should the team investigate this week?",
        ]}
      />
    </div>
  );
}

export function BusinessReviewPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  const review = data.review;
  const actions = Array.isArray(review?.actions)
    ? (review.actions as { owner: string; action: string }[])
    : [];
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="WEEKLY BUSINESS REVIEW"
        title="Read the system, not just the numbers."
        copy="The review is built from stored metrics; observations stay separate from interpretations so the team can act without over-claiming."
      />
      {review ? (
        <section className="review-grid">
          <section className="review-banner">
            <p className="eyebrow">
              {fmtDate(review.periodStart)} – {fmtDate(review.periodEnd)}
            </p>
            <h2>Current review</h2>
            <p>{review.narrative}</p>
          </section>
          <section className="ledger-panel small-panel">
            <p className="eyebrow">ASSIGNED NEXT ACTIONS</p>
            {actions.map((item, index) => (
              <div className="action-line" key={index}>
                <span>{item.owner.slice(0, 2).toUpperCase()}</span>
                <p>{item.action}</p>
              </div>
            ))}
          </section>
        </section>
      ) : (
        <section className="ledger-panel small-panel">
          <p>No review has been generated yet.</p>
        </section>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { data, isLoading, error } = trpc.workspace.data.useQuery();
  if (isLoading) return <WorkspaceLoading />;
  if (error || !data) return <ErrorState />;
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="WORKSPACE SETTINGS"
        title="Keep the operating model legible."
        copy="Configuration and governance protect a human-led process: imports are traceable, AI output is reviewable, and actions remain auditable."
      />
      <section className="settings-grid">
        <section className="ledger-panel small-panel">
          <p className="eyebrow">WORKSPACE</p>
          <h2>{data.organization?.name}</h2>
          <p className="muted-copy">
            Timezone: {data.organization?.timezone}. The initial workspace is
            supported by database-backed data and can later be connected to
            approved integrations.
          </p>
        </section>
        <section className="ledger-panel small-panel">
          <p className="eyebrow">DATA QUALITY</p>
          <h2>
            {data.dataQualityIssues.length} open issue
            {data.dataQualityIssues.length === 1 ? "" : "s"}
          </h2>
          {data.dataQualityIssues.map(issue => (
            <p className="muted-copy" key={issue.id}>
              {issue.details}
            </p>
          ))}
        </section>
      </section>
    </div>
  );
}
