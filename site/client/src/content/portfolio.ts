/*
 * Single source of truth for portfolio content.
 *
 * Presentation lives in the page components; everything a visitor reads lives
 * here. Two rules govern this file:
 *
 *   1. Every project carries an explicit `evidence` tier. A visitor should
 *      never have to guess whether they are looking at shipped software or a
 *      described outcome.
 *   2. Numbers are only stated when they are either verifiable from source in
 *      this repository's sibling projects (`code`) or explicitly attributed as
 *      reported by the operator (`brief`). Nothing is invented.
 */

/** How strongly a claim is backed. Drives the badge shown on every card. */
export type EvidenceTier = "code" | "brief";

export const evidenceLabels: Record<EvidenceTier, { label: string; note: string }> = {
  code: {
    label: "SOURCE AVAILABLE",
    note: "Source you can read — in this bundle, or a public repository.",
  },
  brief: {
    label: "REPORTED OUTCOME",
    note: "Operator-supplied project record. Figures are as reported, not independently measured.",
  },
};

export type Domain = "OPERATIONS" | "AUTOMATION" | "AI" | "DATA" | "RESEARCH";

export type Project = {
  number: string;
  kind: string;
  title: string;
  subtitle: string;
  summary: string;
  /** The system's stages, left to right. Rendered as the flow rail. */
  flow: string[];
  tags: string[];
  domains: Domain[];
  evidence: EvidenceTier;
  group: string;
  accent: "coral" | "orange" | "yellow";
  /** Outcome line. For `brief` projects this is reported, not measured. */
  result?: string;
  /** Facts a reader can check for themselves — only set on `code` projects. */
  verifiable?: string[];
  /** Three hard numbers for the feature row. Only claims checkable in source. */
  stats?: Array<{ value: string; label: string }>;
  /**
   * Real screenshots of the running application. Drop images into
   * client/public/screens/<slug>/ and list them here — the case file renders
   * a gallery only when this is non-empty, so the seam costs nothing until
   * genuine captures exist. Same rule as linkedin/cv: left empty, not faked.
   */
  screenshots?: Array<{ src: string; alt: string; caption: string }>;
  repo?: string;
};

/* ---------------------------------------------------------------------------
 * The method — the spine of the site.
 *
 * The site's claim is "different problems, same approach". Rather than assert
 * that, each stage below carries instances drawn from unrelated domains, so a
 * visitor can read one stage across three problems and watch the approach
 * repeat. That is the argument the rest of the page rests on.
 * ------------------------------------------------------------------------- */

export type MethodStage = {
  number: string;
  name: string;
  question: string;
  body: string;
  /** The same stage, applied in three unrelated problem spaces. */
  instances: Array<{ domain: string; project: string; what: string }>;
};

export const methodStages: MethodStage[] = [
  {
    number: "01",
    name: "Problem",
    question: "What is actually going wrong?",
    body: "The stated problem is rarely the real one. A request for a dashboard is usually a request to stop being surprised. I start by separating the symptom people report from the failure underneath it.",
    instances: [
      {
        domain: "Operations",
        project: "Session Link Automation",
        what: "Setup is slow really meant: link creation, naming and attendance lived in three places with no shared state.",
      },
      {
        domain: "AI",
        project: "Feedback Copilot",
        what: "Writing feedback takes too long really meant: no shared structure, so every teacher re-invented the format.",
      },
      {
        domain: "Data",
        project: "Smart Excel Validation",
        what: "The data is messy really meant: errors surfaced downstream, after decisions had already been made on them.",
      },
    ],
  },
  {
    number: "02",
    name: "Understand",
    question: "Who does this work, and what does it cost them?",
    body: "Before any tooling decision, I follow the work as it is actually performed — including the workarounds people are quietly maintaining. Those workarounds are the specification.",
    instances: [
      {
        domain: "Operations",
        project: "Instructor & Coordinator Database",
        what: "Traced how onboarding, assignment and evaluation data was really being kept before centralising any of it.",
      },
      {
        domain: "AI",
        project: "AI Operational Agent",
        what: "Found that answers existed in SOPs, but were retrieved by asking a colleague rather than by reading them.",
      },
      {
        domain: "Education",
        project: "Community Success OS",
        what: "Modelled the full learner lifecycle before deciding which signals actually justify an intervention.",
      },
    ],
  },
  {
    number: "03",
    name: "Map",
    question: "Where does the work break?",
    body: "I draw the handoffs — every point where responsibility, format or ownership changes. Failures cluster at boundaries, not inside steps, so the map is where the real design decisions get made.",
    instances: [
      {
        domain: "Operations",
        project: "Centralized Department Sync",
        what: "Mapped update paths between operations, marketing, sales, product and HR to locate the disconnects.",
      },
      {
        domain: "Data",
        project: "Session Coding & LMS",
        what: "Encoded governorate, area and vendor into the identifier so traceability survived the handoff into Docebo.",
      },
      {
        domain: "Operations",
        project: "EdTech Ops Intelligence OS",
        what: "Made cross-domain data quality — completeness, accuracy, freshness — a first-class visible surface.",
      },
    ],
  },
  {
    number: "04",
    name: "Design",
    question: "What is the smallest system that fixes this?",
    body: "The goal is the smallest coherent system, not the most capable one. I decide what stays human, what becomes structure, and what is deliberately left out — unbuilt scope is the cheapest scope to maintain.",
    instances: [
      {
        domain: "AI",
        project: "Feedback Copilot",
        what: "AI drafts, the coordinator approves. The approval gate is the design, not a limitation of the model.",
      },
      {
        domain: "Operations",
        project: "SOP Library & Policy",
        what: "One reference layer with clear owners, instead of a separate procedure document per team.",
      },
      {
        domain: "Quality",
        project: "Quality Control Framework",
        what: "One shared standard across instructors, students and content, so scores stay comparable.",
      },
    ],
  },
  {
    number: "05",
    name: "Build",
    question: "Does it hold up under real conditions?",
    body: "I build the thin path end to end first, then harden it. Role boundaries, validation and audit trails belong in the first version — retrofitting trust into a running system costs far more than designing it in.",
    instances: [
      {
        domain: "Operations",
        project: "EdTech Ops Intelligence OS",
        what: "Role-aware authorization and immutable audit events enforced at the application boundary, with tests.",
      },
      {
        domain: "AI",
        project: "Feedback Copilot",
        what: "Role enforcement lives server-side, not merely hidden in the UI, and is covered by automated tests.",
      },
      {
        domain: "Automation",
        project: "Certification Dashboard",
        what: "Intake, grading, tracking and issuance built as one traceable path instead of four disconnected tools.",
      },
    ],
  },
  {
    number: "06",
    name: "Automate",
    question: "What should stop needing a person?",
    body: "Automation comes after the process is understood, never before — automating an unexamined process only makes the wrong outcome arrive faster. I automate the mechanical and keep judgment with people.",
    instances: [
      {
        domain: "Automation",
        project: "Session Link Automation",
        what: "Creation, naming, distribution and attendance linkage collapsed into one repeatable run.",
      },
      {
        domain: "Data",
        project: "Smart Excel Validation",
        what: "Rules surface exceptions automatically; a person still reviews every exception that is raised.",
      },
      {
        domain: "AI",
        project: "Automated Instructor Review",
        what: "Scoring and weakness flagging automated; the improvement conversation stays human.",
      },
    ],
  },
  {
    number: "07",
    name: "Measure",
    question: "How do we know it worked?",
    body: "A system that cannot be observed cannot be improved. I instrument the outcome that mattered back in stage 01 — not vanity throughput — and keep the measurement honest enough to show failure.",
    instances: [
      {
        domain: "Operations",
        project: "EdTech Ops Intelligence OS",
        what: "KPI definitions carry explicit targets, thresholds and owners, so a miss has an address.",
      },
      {
        domain: "Quality",
        project: "Quality Control Framework",
        what: "A consistent benchmark that makes performance comparable across people and across time.",
      },
      {
        domain: "Data",
        project: "Data Quality Monitoring",
        what: "Completeness, accuracy and freshness tracked as scores, with logged and assignable remediation.",
      },
    ],
  },
  {
    number: "08",
    name: "Improve",
    question: "What does the next version need?",
    body: "The loop closes here and reopens at 01. Every system produces evidence about its own weak points; the discipline is scheduling the revisit instead of waiting for the next escalation.",
    instances: [
      {
        domain: "Operations",
        project: "DECI Operational Cycle Manual",
        what: "Documented the cycle so improvements changed the standard, not just one team's habit.",
      },
      {
        domain: "AI",
        project: "Feedback Copilot",
        what: "Coordinator comments and return-to-draft decisions become the signal for the next revision.",
      },
      {
        domain: "Education",
        project: "Community Success OS",
        what: "Intervention outcomes feed back into which signals get treated as risk in the first place.",
      },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * Built software. These lead the work section because they are the strongest
 * evidence available: the architecture and the tests can be read directly.
 * ------------------------------------------------------------------------- */

export const builtSystems: Project[] = [
  {
    number: "S1",
    kind: "ops-intelligence",
    title: "EdTech Ops Intelligence OS",
    subtitle: "Operations control tower",
    summary:
      "A role-aware operations console for education delivery: KPI tracking against explicit targets, anomaly investigation with drill-down evidence, cross-domain data-quality scoring, a versioned SOP library, and an immutable audit trail behind every state change.",
    flow: ["Ingest", "Monitor", "Detect", "Investigate", "Resolve"],
    tags: ["React", "tRPC", "Drizzle", "Recharts", "Electron"],
    domains: ["OPERATIONS", "DATA", "AI"],
    evidence: "code",
    group: "Built software",
    accent: "coral",
    stats: [
      { value: "69", label: "automated tests" },
      { value: "4", label: "authorization roles" },
      { value: "append-only", label: "audit trail" },
    ],
    verifiable: [
      "Four authorization roles — analyst, coordinator, manager, administrator — enforced at the application boundary",
      "Immutable audit events recorded for create, update, delete, approval, export and status transitions",
      "69 automated tests covering authorization, SOP version publication, KPI calculation, session-conflict detection, auth hardening, and the operations console rendering without the desktop bridge",
      "Login rate-limited per identity; sessions are httpOnly, SameSite-Lax signed JWTs",
      "Ships as a packaged Windows desktop application via an Electron shell",
    ],
  },
  {
    number: "S2",
    kind: "feedback",
    title: "Feedback Copilot",
    subtitle: "Human-in-the-loop AI",
    summary:
      "AI drafts structured student feedback — Strengths, Areas for Improvement, Next Steps — and a coordinator approves it. The approval gate is the point of the product: the model accelerates the writing, a person still owns what gets sent.",
    flow: ["Evidence", "Draft", "Edit", "Review", "Approve"],
    tags: ["React", "tRPC", "Streaming LLM", "Drizzle", "RBAC"],
    domains: ["AI", "OPERATIONS"],
    evidence: "code",
    group: "Built software",
    accent: "orange",
    stats: [
      { value: "55", label: "automated tests" },
      { value: "2", label: "enforced roles" },
      { value: "3-state", label: "approval machine" },
    ],
    verifiable: [
      "Every status transition persisted as an append-only event with its actor, and rendered as a timeline in the workspace — nothing updates or deletes log rows",
      "Explicit status machine — draft to pending review to approved, with return-to-draft",
      "Teacher and coordinator roles enforced server-side, not only hidden in the UI",
      "55 automated tests across the approval machine, role boundaries, auth hardening and the transition log",
      "Streaming generation failures surface to the teacher rather than silently falling back to fabricated output",
    ],
  },
  {
    number: "S3",
    kind: "success",
    title: "Community Success OS",
    subtitle: "Lifecycle & retention",
    summary:
      "A learner-success workspace built around Student 360: engagement signals, renewal state and intervention workflows in one place, with AI assistance that returns the evidence behind a recommendation rather than only the recommendation.",
    flow: ["Signal", "Student 360", "Risk", "Intervene", "Renew"],
    tags: ["React", "tRPC", "Drizzle", "Recharts", "Postgres"],
    domains: ["OPERATIONS", "DATA", "AI"],
    evidence: "code",
    group: "Built software",
    accent: "yellow",
    stats: [
      { value: "58", label: "automated tests" },
      { value: "4", label: "persisted workflows" },
      { value: "evidence-first", label: "AI assistance" },
    ],
    verifiable: [
      "Renewal, engagement, intervention and business-review workflows backed by persistent storage",
      "A completed intervention with a recorded outcome writes an intervention_outcome signal back onto the student",
      "AI recommendations are returned together with the evidence they were derived from",
      "Protected procedures verified to reject unauthenticated callers",
      "Admin-only operational audit boundary tested for both admin and non-admin users",
      "Login rate-limited per identity; sessions are httpOnly, SameSite-Lax signed JWTs",
    ],
  },
];

/* ---------------------------------------------------------------------------
 * Operator-supplied project record. Reported outcomes, clearly labelled.
 * ------------------------------------------------------------------------- */

export const featuredProjects: Project[] = [
  {
    number: "01",
    kind: "session-links",
    title: "Session Link Automation",
    subtitle: "High-volume operations",
    summary:
      "A Power Automate workflow that turns session setup, naming, link distribution and attendance connection into one repeatable run instead of four manual ones.",
    flow: ["Session brief", "Teams", "Naming", "Distribution", "Attendance"],
    tags: ["Power Automate", "Microsoft Teams", "Attendance", "Operations"],
    domains: ["OPERATIONS", "AUTOMATION"],
    evidence: "brief",
    group: "Operational infrastructure",
    accent: "coral",
    result: "Reported: a days-long process reduced to hours, at a scale of thousands of sessions per month.",
  },
  {
    number: "02",
    kind: "validation",
    title: "Smart Excel Validation",
    subtitle: "Data quality framework",
    summary:
      "Custom Excel functions and conditional logic that surface duplicates, missing fields, conflicts and exceptions for staff review — before the data reaches a decision.",
    flow: ["Data entry", "Rules", "Exceptions", "Staff review", "Clean record"],
    tags: ["Excel", "Validation", "Conditional logic", "Data quality"],
    domains: ["OPERATIONS", "DATA"],
    evidence: "brief",
    group: "Operational infrastructure",
    accent: "orange",
    result: "Reported: 90% fewer errors and 70% faster review across 40,000+ student records.",
  },
  {
    number: "03",
    kind: "cgf",
    title: "CG Foundry",
    subtitle: "Enrollment & access",
    summary:
      "A course enrollment and access flow covering landing, checkout, enrollment, dashboard and content delivery as one continuous path rather than five disconnected screens.",
    flow: ["Landing", "Checkout", "Enrollment", "Dashboard", "Content"],
    tags: ["Enrollment", "Access control", "Product flow"],
    domains: ["OPERATIONS", "AUTOMATION"],
    evidence: "code",
    group: "Operational infrastructure",
    accent: "yellow",
    repo: "https://github.com/Abdelrhman6200/CGF",
  },
  {
    number: "04",
    kind: "agent",
    title: "AI Operational Agent",
    subtitle: "Knowledge retrieval",
    summary:
      "An internal answering surface for employee questions that retrieves the relevant SOP or organizational knowledge, so procedure stops depending on tribal memory.",
    flow: ["Question", "Understand", "Retrieve", "Answer", "Next action"],
    tags: ["AI agent", "RAG", "SOPs", "Internal automation"],
    domains: ["OPERATIONS", "AI"],
    evidence: "brief",
    group: "AI transformation",
    accent: "coral",
    result: "Reported: significantly reduced response time for operational questions.",
  },
  {
    number: "05",
    kind: "dashboard",
    title: "Certification Dashboard",
    subtitle: "Assessment automation",
    summary:
      "An assessment and certification workflow that moves project intake through grading, status tracking and certificate issuance as one traceable path.",
    flow: ["Project intake", "Grade", "Track", "Certify", "Issue"],
    tags: ["Dashboard", "Assessment", "Automation", "Certification"],
    domains: ["OPERATIONS", "AUTOMATION", "DATA"],
    evidence: "brief",
    group: "Operational infrastructure",
    accent: "orange",
    result: "Reported: certificate issuance within 24 hours across 5,000+ student projects.",
  },
];

export const projectArchive: Project[] = [
  {
    number: "06",
    kind: "questionnaire",
    title: "Questionnaire to Report",
    subtitle: "Document generation",
    summary: "A questionnaire that validates its own inputs and fills a template to produce a finished PPTX or PDF report.",
    flow: ["Questionnaire", "Validation", "Template", "PPTX", "PDF"],
    tags: ["Templating", "Validation", "Reporting"],
    domains: ["AUTOMATION", "DATA"],
    evidence: "code",
    group: "Operational infrastructure",
    accent: "yellow",
    repo: "https://github.com/Abdelrhman6200/question-template-fill",
  },
  {
    number: "07",
    kind: "coding",
    title: "Session Coding & LMS Integration",
    subtitle: "Traceability layer",
    summary: "Session identifiers encode governorate, area and vendor attributes before the logic enters Docebo.",
    flow: ["Attributes", "Code", "Docebo", "Filter", "Trace"],
    tags: ["Docebo", "Data architecture", "LMS"],
    domains: ["OPERATIONS", "DATA"],
    evidence: "brief",
    group: "Operational infrastructure",
    accent: "yellow",
    result: "Reported: faster filtering and clearer session traceability.",
  },
  {
    number: "08",
    kind: "workforce",
    title: "Instructor & Coordinator Database",
    subtitle: "Workforce visibility",
    summary: "A centralized view of onboarding, assigned sessions, progress, performance, quality scores and evaluations.",
    flow: ["People", "Assignments", "Progress", "Quality", "Intervene"],
    tags: ["Database", "Workforce", "Performance"],
    domains: ["OPERATIONS", "DATA"],
    evidence: "brief",
    group: "Operational infrastructure",
    accent: "coral",
    result: "Reported: full operational visibility across the delivery workforce.",
  },
  {
    number: "09",
    kind: "quality",
    title: "Company-Wide Quality Control",
    subtitle: "Quality framework",
    summary: "A Session Quality Control Framework evaluating instructors, students and content against one shared standard.",
    flow: ["Standards", "Observe", "Score", "Compare", "Improve"],
    tags: ["Quality", "Framework", "Performance"],
    domains: ["OPERATIONS", "DATA"],
    evidence: "brief",
    group: "Organizational control",
    accent: "orange",
    result: "Reported: a 90%+ quality performance benchmark.",
  },
  {
    number: "10",
    kind: "sop",
    title: "SOP Library & Policy Framework",
    subtitle: "Knowledge system",
    summary: "Operational, marketing and HR procedures made consistent and findable through one shared reference layer.",
    flow: ["Task", "Procedure", "Owner", "Reference", "Repeat"],
    tags: ["SOPs", "Policy", "Knowledge management"],
    domains: ["OPERATIONS", "RESEARCH"],
    evidence: "brief",
    group: "Organizational control",
    accent: "yellow",
    result: "Reported: shorter onboarding and more unified processes.",
  },
  {
    number: "11",
    kind: "sync",
    title: "Centralized Department Sync",
    subtitle: "Shared information layer",
    summary: "Interconnected sheets and dashboards connect operations, marketing, sales, product and HR around shared state.",
    flow: ["Update", "Sync", "Share", "Dashboard", "Coordinate"],
    tags: ["Synchronization", "Dashboards", "BI"],
    domains: ["OPERATIONS", "AUTOMATION", "DATA"],
    evidence: "brief",
    group: "Organizational control",
    accent: "coral",
    result: "Reported: fewer bottlenecks caused by disconnected information.",
  },
  {
    number: "12",
    kind: "review",
    title: "Automated Instructor Review",
    subtitle: "AI quality assurance",
    summary: "An AI-assisted review layer that evaluates sessions, assigns quality scores and flags areas for improvement.",
    flow: ["Session", "Evaluate", "Score", "Flag", "Improve"],
    tags: ["AI", "QA", "Evaluation"],
    domains: ["AI", "DATA"],
    evidence: "brief",
    group: "AI transformation",
    accent: "orange",
    result: "Reported: 90%+ consistency in performance evaluation.",
  },
  {
    number: "13",
    kind: "feedback-brief",
    title: "AI-Assisted Feedback Management",
    subtitle: "Human-AI workflow",
    summary:
      "The operational precursor to Feedback Copilot: structured drafts, templates and tone suggestions, with the human owning the final message.",
    flow: ["Context", "Draft", "Tone", "Review", "Send"],
    tags: ["AI assistance", "Feedback", "Human review"],
    domains: ["AI", "OPERATIONS"],
    evidence: "brief",
    group: "AI transformation",
    accent: "coral",
    result: "Reported: 60% faster feedback creation. Later rebuilt as shipped software — see Feedback Copilot.",
  },
  {
    number: "14",
    kind: "manual",
    title: "DECI Operational Cycle Manual",
    subtitle: "Process reference",
    summary: "A full operational reference covering preparation, execution, quality assurance and reporting.",
    flow: ["Prepare", "Execute", "Assure", "Report", "Repeat"],
    tags: ["Process mapping", "Documentation", "Standardization"],
    domains: ["OPERATIONS", "RESEARCH"],
    evidence: "brief",
    group: "Organizational control",
    accent: "yellow",
    result: "Reported: standardized processes and an official operational reference.",
  },
  {
    number: "15",
    kind: "camp",
    title: "AI Camp UAE",
    subtitle: "National event coordination",
    summary: "A regional AI education initiative run with institutional stakeholders, focused on immersive youth training.",
    flow: ["Partners", "Program", "Cohorts", "Delivery", "Reach"],
    tags: ["Program coordination", "Stakeholders", "AI education"],
    domains: ["AI", "RESEARCH"],
    evidence: "brief",
    group: "Strategic execution",
    accent: "orange",
    result: "Reported: strengthened iSkyTech regional presence.",
  },
];

/**
 * The shared application core.
 *
 * These four modules are byte-identical across all three applications — one
 * standalone auth core, applied to three unrelated problems. It is the site's
 * thesis demonstrated in code rather than in operations anecdotes, and unlike
 * most claims here a reader can check it with a checksum.
 */
export const sharedCore = {
  files: ["password.ts", "session.ts", "rateLimit.ts", "cookies.ts"],
  lines: 288,
  appCount: 3,
  path: "server/_core/",
  claim:
    "scrypt password hashing, stateless session JWTs, a sliding-window rate limiter and the cookie policy — 288 lines, byte-identical in all three applications.",
} as const;

export const allProjects: Project[] = [...builtSystems, ...featuredProjects, ...projectArchive];

export const services = [
  {
    key: "operations",
    short: "01",
    label: "Operations",
    title: "Make the work legible.",
    body: "I map people, decisions, handoffs, constraints and quality checks before deciding where technology should enter the loop.",
    tools: ["Process design", "SOPs", "Coordination", "Reporting"],
  },
  {
    key: "automation",
    short: "02",
    label: "Automation",
    title: "Remove repetitive work.",
    body: "I connect the fragmented steps that make operations slow, so the right action happens with less friction and more visibility.",
    tools: ["n8n", "Power Automate", "Zapier", "APIs", "Webhooks"],
  },
  {
    key: "ai",
    short: "03",
    label: "AI systems",
    title: "Put intelligence in the loop.",
    body: "I use AI where it improves a real workflow: structured inputs, clear evaluation, useful outputs, and human judgment kept where it belongs.",
    tools: ["RAG", "LLMs", "Prompt design", "Evaluation"],
  },
  {
    key: "data",
    short: "04",
    label: "Data",
    title: "Turn information into decisions.",
    body: "Tracking is only valuable when it changes what someone does next. I build the surfaces that make that next step obvious.",
    tools: ["Analytics", "KPIs", "Reporting", "Decision systems"],
  },
] as const;

export type ServiceKey = (typeof services)[number]["key"];

export const experiences = [
  {
    number: "01",
    name: "DECI",
    role: "Senior Project Coordinator",
    period: "",
    body: "Education operations, coordination, quality and reporting — where complex delivery first became a systems problem rather than a staffing one.",
    accent: "coral",
  },
  {
    number: "02",
    name: "iSkyTech",
    role: "Operational Systems",
    period: "",
    body: "Microsoft 365, process design, automation, data and reporting connected into a single operating picture.",
    accent: "orange",
  },
  {
    number: "03",
    name: "Independent",
    role: "Systems & Software",
    period: "",
    body: "Designing and shipping the operations, AI-assist and learner-success applications listed above, end to end.",
    accent: "yellow",
  },
] as const;

export const contact = {
  email: "abdelrhman.shoman62@gmail.com",
  github: "https://github.com/Abdelrhman6200",
  githubHandle: "Abdelrhman6200",
  /**
   * Drop the real URL in and it renders automatically — the contact card and
   * footer already read this field and simply omit the link while it is empty.
   * Left blank rather than guessed.
   */
  linkedin: "",
  /**
   * The CV is a route, not a file: /cv renders from this module and prints to
   * PDF from the browser, so it can never fall out of step with the site.
   */
  cv: "/cv",
  location: "Cairo, Egypt",
  availability: "Available for selected opportunities",
} as const;
