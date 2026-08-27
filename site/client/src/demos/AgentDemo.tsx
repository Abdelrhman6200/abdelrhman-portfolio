/*
 * AI Operational Agent demo — an internal answering surface with its
 * retrieval pipeline exposed.
 *
 * Ask a question and the agent answers by citing a procedure — never without
 * one. The right rail shows exactly why: each retrieved source with its
 * score, the terms that matched, and the sentence being quoted. When nothing
 * scores, the agent says so; refusing beats improvising, because a confident
 * wrong procedure is the failure the original was built to prevent.
 */
import { useMemo, useRef, useState } from "react";
import { BookOpenText, CircleHelp, SearchCheck, Send } from "lucide-react";
import DemoShell from "./DemoShell";
import AppWindow from "./AppWindow";
import {
  search,
  sopCorpus,
  suggestedQuestions,
  termMatches,
  tokenize,
  type Sop,
} from "./logic/sopRetrieval";

/** Wraps every word a matched term covers in <mark>. */
function Highlighted({ text, matched }: { text: string; matched: string[] }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, index) => {
        const token = tokenize(part)[0];
        const hit = token !== undefined && matched.some((term) => termMatches(term, token));
        return hit ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default function AgentDemo() {
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [reading, setReading] = useState<Sop | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => (asked ? search(asked) : null), [asked]);
  const top = result?.matches[0];

  const ask = (question: string) => {
    setAsked(question);
    setQuery(question);
    setReading(null);
  };

  return (
    <DemoShell
      title="AI Operational Agent"
      lede="Ask an operational question and the agent answers by citing a procedure — with the whole retrieval pipeline visible beside it. When nothing scores, it says so: refusing beats improvising."
    >
      <AppWindow
        name="Ops assistant — SOP library"
        meta={
          <span className="ag-corpus-stat">
            <BookOpenText size={12} aria-hidden="true" />
            <b>{sopCorpus.length}</b> procedures indexed
          </span>
        }
      >
        <div className="ag-layout">
          {/* --- Ask + answer -------------------------------------------------- */}
          <section className="ag-main" aria-label="Ask the agent">
            <form
              className="ag-ask"
              onSubmit={(event) => {
                event.preventDefault();
                if (query.trim()) ask(query.trim());
              }}
            >
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask an operational question…"
                aria-label="Question for the agent"
              />
              <button type="submit" className="demo-action demo-action-primary" disabled={!query.trim()}>
                <Send size={13} aria-hidden="true" /> Ask
              </button>
            </form>

            <div className="ag-suggestions">
              {suggestedQuestions.map((question) => (
                <button key={question} type="button" onClick={() => ask(question)}>
                  {question}
                </button>
              ))}
            </div>

            {!result && (
              <p className="demo-note">
                <CircleHelp size={13} aria-hidden="true" /> This replaced the habit of interrupting a
                colleague. Ask something — or try a question the library cannot answer, and watch it refuse
                rather than guess.
              </p>
            )}

            {result && result.confidence === "none" && (
              <div className="ag-answer ag-answer-none" aria-live="polite">
                <span className="ag-answer-label">NO PROCEDURE FOUND</span>
                <p>
                  Nothing in the library covers that. The agent stops here on purpose — a confident answer
                  without a source is the failure mode this system exists to prevent. In the original, this
                  routed the question to a person and flagged the gap for the SOP owner.
                </p>
              </div>
            )}

            {result && result.confidence !== "none" && top && (
              <div className="ag-answer" aria-live="polite">
                <span className="ag-answer-label">
                  {result.confidence === "strong" ? "PROCEDURE FOUND" : "CLOSEST PROCEDURE — LOW CONFIDENCE"}
                </span>
                <h3>
                  {top.sop.id} — {top.sop.title}
                </h3>
                <blockquote>
                  <Highlighted text={top.snippet} matched={top.matched} />
                </blockquote>
                <div className="ag-answer-foot">
                  <span>
                    Cited from <b>{top.sop.category}</b> / matched{" "}
                    {top.matched.map((term) => `“${term}”`).join(", ")}
                  </span>
                  <button type="button" className="demo-action" onClick={() => setReading(top.sop)}>
                    <BookOpenText size={13} aria-hidden="true" /> Open the full procedure
                  </button>
                </div>
                {result.confidence === "weak" && (
                  <p className="demo-hint">
                    Low confidence: only part of the question matched. The agent shows its best source and
                    says so, rather than dressing a fragment up as an answer.
                  </p>
                )}
              </div>
            )}

            {reading && (
              <article className="ag-reader" aria-label={`${reading.id} full text`}>
                <header>
                  <span>
                    {reading.id} / {reading.category.toUpperCase()}
                  </span>
                  <button type="button" onClick={() => setReading(null)}>
                    close
                  </button>
                </header>
                <h4>{reading.title}</h4>
                <p>
                  <Highlighted text={reading.body} matched={top?.matched ?? []} />
                </p>
              </article>
            )}
          </section>

          {/* --- Retrieval trace ---------------------------------------------- */}
          <aside className="ag-trace" aria-label="Retrieval trace">
            <div className="ag-trace-head">
              <h2>
                <SearchCheck size={15} aria-hidden="true" /> Why this answer
              </h2>
              <span>TF-IDF over the library — every score reproducible by hand</span>
            </div>

            {!result || result.matches.length === 0 ? (
              <p className="demo-hint">
                The ranked sources land here with their scores and matched terms, so an answer can always be
                audited back to its retrieval.
              </p>
            ) : (
              <ol className="ag-sources">
                {result.matches.map((match, index) => {
                  const width = (match.score / result.matches[0].score) * 100;
                  return (
                    <li key={match.sop.id} className={index === 0 ? "is-top" : ""}>
                      <div className="ag-source-head">
                        <b>{match.sop.id}</b>
                        <span>{match.sop.title}</span>
                        <i>{match.score.toFixed(2)}</i>
                      </div>
                      <span className="ag-source-bar" aria-hidden="true">
                        <i style={{ width: `${width}%` }} />
                      </span>
                      <small>matched: {match.matched.join(" · ")}</small>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="ag-honesty">
              <p>
                Demo-scale retrieval: keyword TF-IDF with prefix matching, no model. The original used the
                same shape — retrieve first, answer from the source — with embeddings doing the matching at
                organisational scale.
              </p>
            </div>
          </aside>
        </div>
      </AppWindow>
    </DemoShell>
  );
}
