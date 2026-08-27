/*
 * The feedback workspace — the first routed UI over the app's own API.
 *
 * The server workflow (save → submit → review, every transition logged to
 * feedbackEvents) has been implemented and tested since the log shipped, but
 * the routed pages were self-contained demos that never called it. This page
 * closes that gap: students → history → entry → transition timeline, with the
 * actions each role is allowed. Role enforcement stays server-side — the UI
 * only decides what to show; the API decides what is permitted.
 */
import { useState } from "react";
import { CheckCircle2, ClipboardList, CornerDownLeft, Send, Users } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import FeedbackTimeline from "@/components/FeedbackTimeline";
import { trpc } from "@/lib/trpc";

const statusTone: Record<string, string> = {
  draft: "text-muted-foreground border-border",
  "pending review": "text-accent-foreground bg-accent border-transparent",
  approved: "text-primary-foreground bg-primary border-transparent",
};

export default function Workspace() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [studentId, setStudentId] = useState<number | null>(null);
  const [entryId, setEntryId] = useState<number | null>(null);
  const [returnComment, setReturnComment] = useState("");
  const utils = trpc.useUtils();

  const students = trpc.feedback.students.useQuery(undefined, { enabled: Boolean(user) });
  const history = trpc.feedback.history.useQuery(
    { studentId: studentId ?? 0 },
    { enabled: studentId !== null }
  );
  const events = trpc.feedback.events.useQuery(
    { feedbackId: entryId ?? 0 },
    { enabled: entryId !== null }
  );

  const refresh = () => {
    void utils.feedback.history.invalidate();
    void utils.feedback.events.invalidate();
  };
  const submit = trpc.feedback.submit.useMutation({ onSuccess: refresh });
  const review = trpc.feedback.review.useMutation({
    onSuccess: () => {
      setReturnComment("");
      refresh();
    },
  });

  if (loading || !user) {
    return (
      <main id="main" className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Opening the workspace…
      </main>
    );
  }

  const entry = history.data?.find((item) => item.id === entryId) ?? null;

  return (
    <main id="main" className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <h1 className="text-lg font-semibold tracking-tight">Feedback workspace</h1>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground" aria-label="Workspace">
          <span className="font-mono text-xs uppercase">{user.role}</span>
          <Link href="/" className="underline underline-offset-4 hover:no-underline">
            Grading demo
          </Link>
        </nav>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-16 md:grid-cols-[240px_minmax(0,1fr)]">
        {/* --- Students ------------------------------------------------------ */}
        <aside aria-label="Students">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4" aria-hidden="true" /> Students
          </h2>
          {students.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : students.data?.length ? (
            <ul className="flex flex-col gap-1">
              {students.data.map((student) => (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentId(student.id);
                      setEntryId(null);
                    }}
                    aria-pressed={studentId === student.id}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      studentId === student.id ? "border-primary bg-card" : "border-transparent hover:bg-card"
                    }`}
                  >
                    <span className="block font-medium">{student.name}</span>
                    <span className="block text-xs text-muted-foreground">{student.className}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No students yet.</p>
          )}
        </aside>

        {/* --- History + the transition log ---------------------------------- */}
        <section aria-label="Feedback history">
          {studentId === null ? (
            <p className="text-sm text-muted-foreground">Select a student to see their feedback history.</p>
          ) : history.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading history…</p>
          ) : (
            <>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4" aria-hidden="true" /> Feedback entries
              </h2>
              {history.data?.length ? (
                <ul className="mb-6 flex flex-col gap-2">
                  {history.data.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setEntryId(item.id)}
                        aria-pressed={entryId === item.id}
                        className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm ${
                          entryId === item.id ? "border-primary bg-card" : "border-border hover:bg-card"
                        }`}
                      >
                        <span className="truncate">{item.strengths.slice(0, 80) || "Untitled entry"}</span>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${statusTone[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-6 text-sm text-muted-foreground">No feedback recorded for this student yet.</p>
              )}

              {entry ? (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">Transition history</h3>
                    <div className="flex items-center gap-2">
                      {user.role === "teacher" && entry.status === "draft" ? (
                        <Button
                          size="sm"
                          disabled={submit.isPending}
                          onClick={() => submit.mutate({ feedbackId: entry.id })}
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Submit for review
                        </Button>
                      ) : null}
                      {user.role === "coordinator" && entry.status === "pending review" ? (
                        <>
                          <input
                            value={returnComment}
                            onChange={(event) => setReturnComment(event.target.value)}
                            placeholder="Note if returning…"
                            aria-label="Return comment"
                            className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                          />
                          <Button
                            size="sm"
                            disabled={review.isPending}
                            onClick={() => review.mutate({ feedbackId: entry.id, decision: "approved" })}
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={review.isPending || !returnComment.trim()}
                            onClick={() =>
                              review.mutate({ feedbackId: entry.id, decision: "draft", comment: returnComment })
                            }
                          >
                            <CornerDownLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Return
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {events.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading the log…</p>
                  ) : (
                    <FeedbackTimeline events={events.data ?? []} />
                  )}
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
