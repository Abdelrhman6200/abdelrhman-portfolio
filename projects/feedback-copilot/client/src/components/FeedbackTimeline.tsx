/*
 * The transition log, rendered.
 *
 * Purely presentational: it takes the rows `feedback.events` returns and
 * draws them, so it can be unit-tested with fixtures and reused anywhere the
 * trail needs showing. The server has persisted these events per transition
 * since the log shipped; this is the first surface that displays them.
 */
import type { FeedbackEvent } from "../../../drizzle/schema";

const actorTone: Record<FeedbackEvent["actorRole"], string> = {
  teacher: "bg-primary",
  coordinator: "bg-accent",
};

export default function FeedbackTimeline({ events }: { events: FeedbackEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No transitions recorded yet. Every save, submission, approval and return lands here with its actor.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-3" aria-label="Transition history">
      {events.map((event) => (
        <li key={event.id} className="grid grid-cols-[10px_minmax(0,1fr)] items-baseline gap-3">
          <span
            className={`h-2.5 w-2.5 translate-y-px rounded-full ${actorTone[event.actorRole]}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {event.actorRole}
              </span>{" "}
              {event.action}
            </p>
            {event.comment ? (
              <p className="mt-0.5 text-sm italic text-muted-foreground">“{event.comment}”</p>
            ) : null}
            <time
              className="font-mono text-[11px] text-muted-foreground"
              dateTime={new Date(event.createdAt).toISOString()}
            >
              {new Date(event.createdAt).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
