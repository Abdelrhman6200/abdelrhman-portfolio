/*
 * AI Operational Agent — the retrieval core, re-implemented for the demo.
 *
 * The original answered employee questions by retrieving the relevant SOP
 * rather than by generating text, so procedure stopped depending on tribal
 * memory. What made it trustworthy was that every answer carried its source.
 *
 * The demo keeps exactly that property with an honest, inspectable mechanism:
 * TF-IDF scoring over a small SOP corpus — no model, no embeddings, every
 * score reproducible by hand. When nothing scores, the agent says so instead
 * of improvising; a wrong-but-confident procedure is the failure mode the
 * original was built to avoid.
 */

export type Sop = {
  id: string;
  title: string;
  category: string;
  body: string;
};

export const sopCorpus: Sop[] = [
  {
    id: "SOP-001",
    title: "Recording session attendance",
    category: "Delivery",
    body: "Attendance must be recorded in the LMS within two hours of the session ending. Open the session by its code, mark each learner present or absent, and note technical dropouts separately. Attendance below 60 percent triggers a coordinator review. Never mark attendance before the session ends.",
  },
  {
    id: "SOP-002",
    title: "Rescheduling or cancelling a session",
    category: "Delivery",
    body: "A session may be rescheduled up to 24 hours before its start time. Notify the cohort through the official channel, update the calendar invite, and confirm the instructor's availability for the new slot. Cancellations inside 24 hours require operations-lead approval and a make-up session within two weeks.",
  },
  {
    id: "SOP-003",
    title: "Instructor onboarding checklist",
    category: "Workforce",
    body: "New instructors complete platform training, a shadowed session, and a reviewed solo session before taking a cohort. Provision LMS access on day one, add them to the instructor database with their specialty and availability, and schedule the first quality observation within three weeks.",
  },
  {
    id: "SOP-004",
    title: "Handling a learner complaint",
    category: "Quality",
    body: "Acknowledge every complaint within one business day. Log it against the session and instructor involved, gather the session recording where one exists, and route safety or conduct issues to the programme lead immediately. Close the loop with the learner once a resolution is recorded.",
  },
  {
    id: "SOP-005",
    title: "Issuing certificates",
    category: "Assessment",
    body: "Certificates are issued only after the project is graded against the rubric and attendance meets the 70 percent threshold. Generate the certificate from the dashboard record — never retype learner names by hand. Corrections re-issue under the same certificate number.",
  },
  {
    id: "SOP-006",
    title: "Escalating a data-quality issue",
    category: "Data",
    body: "When a report disagrees with the source sheet, freeze downstream use of the affected figures, log the discrepancy with both values and their timestamps, and assign remediation to the data owner. Do not correct records silently; every fix must be traceable to the issue log.",
  },
  {
    id: "SOP-007",
    title: "Weekly operations reporting",
    category: "Data",
    body: "The weekly report covers sessions delivered, attendance rate, open incidents, and instructor utilisation. Figures come from the dashboards, never from memory or side spreadsheets. Publish by end of day Sunday and flag any metric that crossed its threshold with a one-line cause.",
  },
  {
    id: "SOP-008",
    title: "Refund and withdrawal requests",
    category: "Finance",
    body: "Withdrawal requests inside the first two weeks qualify for a full refund. Verify the learner's attendance history and payment record, obtain finance approval for amounts above the standard threshold, and confirm the refund to the learner in writing with the expected settlement date.",
  },
];

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for",
  "how", "i", "in", "is", "it", "my", "of", "on", "or", "the", "to", "we",
  "what", "when", "where", "which", "who", "with",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((term) => term.length > 1 && !STOPWORDS.has(term));
}

/**
 * Prefix matching in place of a stemmer: "cancel" must find "cancelling" and
 * "cancellations", "record" must find "recorded". Four shared characters
 * keeps it honest — short enough to catch English inflection, long enough
 * that "not" never matches "notify".
 */
export function termMatches(term: string, token: string): boolean {
  if (term === token) return true;
  const shorter = Math.min(term.length, token.length);
  return shorter >= 4 && (token.startsWith(term) || term.startsWith(token));
}

export type Match = {
  sop: Sop;
  score: number;
  /** Query terms found in this document. */
  matched: string[];
  /** The sentence containing the most query terms — the citation. */
  snippet: string;
};

export type RetrievalResult = {
  /** "strong" cites confidently; "weak" hedges; "none" refuses to answer. */
  confidence: "strong" | "weak" | "none";
  matches: Match[];
};

/**
 * TF-IDF over the corpus. Rare terms weigh more than common ones — "refund"
 * should outrank "session", which appears everywhere — and title hits count
 * double, since SOP titles are written to be found.
 */
export function search(query: string, corpus: Sop[] = sopCorpus): RetrievalResult {
  const terms = Array.from(new Set(tokenize(query)));
  if (terms.length === 0) return { confidence: "none", matches: [] };

  const docTokens = corpus.map((sop) => ({
    sop,
    title: tokenize(sop.title),
    body: tokenize(sop.body),
  }));

  const idf = new Map<string, number>();
  for (const term of terms) {
    const df = docTokens.filter((doc) =>
      doc.title.some((token) => termMatches(term, token)) || doc.body.some((token) => termMatches(term, token))
    ).length;
    idf.set(term, Math.log(1 + corpus.length / (df || corpus.length)));
  }

  const matches: Match[] = [];
  for (const doc of docTokens) {
    let score = 0;
    const matched: string[] = [];
    for (const term of terms) {
      const titleHits = doc.title.filter((token) => termMatches(term, token)).length;
      const bodyHits = doc.body.filter((token) => termMatches(term, token)).length;
      if (titleHits + bodyHits === 0) continue;
      matched.push(term);
      score += (bodyHits + titleHits * 2) * (idf.get(term) ?? 0);
    }
    if (score > 0) {
      matches.push({ sop: doc.sop, score, matched, snippet: bestSnippet(doc.sop, matched) });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  const top = matches.slice(0, 3);

  // Confidence from coverage, not just score: a strong answer found most of
  // what was asked; a weak one found a fragment.
  const coverage = top.length ? top[0].matched.length / terms.length : 0;
  const confidence = top.length === 0 ? "none" : coverage >= 0.5 && top[0].score >= 1 ? "strong" : "weak";

  return { confidence, matches: top };
}

/** The sentence with the most matched terms — what the agent quotes. */
export function bestSnippet(sop: Sop, matched: string[]): string {
  const sentences = sop.body.split(/(?<=\.)\s+/);
  let best = sentences[0] ?? "";
  let bestCount = -1;
  for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    const count = matched.filter((term) => tokens.some((token) => termMatches(term, token))).length;
    if (count > bestCount) {
      bestCount = count;
      best = sentence;
    }
  }
  return best.trim();
}

export const suggestedQuestions = [
  "How do I record attendance?",
  "Can I cancel a session tomorrow?",
  "A learner wants a refund",
  "A report disagrees with the source sheet",
  "What does a new instructor need before teaching?",
];
