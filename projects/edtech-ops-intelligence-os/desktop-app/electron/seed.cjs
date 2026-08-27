const crypto = require("crypto");

const isoNow = () => new Date().toISOString();
const createId = (prefix) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
const daysAgo = (days, hour = 9) => { const d = new Date(); d.setDate(d.getDate() - days); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
const daysFromNow = (days, hour = 9) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return d.toISOString(); };

function auditSeed(timestamp, action, entityType, entityId, summary, changes = {}) {
  return { id: createId("audit"), timestamp, userId: "u-maya", userName: "Maya Chen", userRole: "manager", action, entityType, entityId, summary, changes, correlationId: createId("corr") };
}

function createSeedState() {
  const students = [
    { id: "stu-ada", name: "Ada Mensah", email: "ada.mensah@example.edu", cohort: "Autumn 2026", program: "Data Analytics", status: "active", progress: 78, attendance: 94, risk: "low", mentor: "Priya Nair", enrollmentDate: daysAgo(84), milestones: ["Onboarding", "SQL Foundations", "Dashboard Project"], createdAt: daysAgo(84), updatedAt: daysAgo(1) },
    { id: "stu-liam", name: "Liam Osei", email: "liam.osei@example.edu", cohort: "Autumn 2026", program: "Data Analytics", status: "at_risk", progress: 46, attendance: 68, risk: "high", mentor: "Priya Nair", enrollmentDate: daysAgo(81), milestones: ["Onboarding", "SQL Foundations"], createdAt: daysAgo(81), updatedAt: daysAgo(0) },
    { id: "stu-sofia", name: "Sofia Marin", email: "sofia.marin@example.edu", cohort: "Autumn 2026", program: "Cloud Operations", status: "active", progress: 65, attendance: 90, risk: "low", mentor: "Darren Holt", enrollmentDate: daysAgo(79), milestones: ["Onboarding", "Linux Lab"], createdAt: daysAgo(79), updatedAt: daysAgo(2) },
    { id: "stu-jonah", name: "Jonah Reed", email: "jonah.reed@example.edu", cohort: "Summer 2026", program: "Cloud Operations", status: "paused", progress: 51, attendance: 73, risk: "medium", mentor: "Darren Holt", enrollmentDate: daysAgo(126), milestones: ["Onboarding", "Linux Lab"], createdAt: daysAgo(126), updatedAt: daysAgo(5) },
    { id: "stu-mei", name: "Mei Tan", email: "mei.tan@example.edu", cohort: "Autumn 2026", program: "Product Design", status: "active", progress: 83, attendance: 97, risk: "low", mentor: "Elena Voss", enrollmentDate: daysAgo(76), milestones: ["Onboarding", "Research Sprint", "Prototype Review"], createdAt: daysAgo(76), updatedAt: daysAgo(1) },
    { id: "stu-nora", name: "Nora Adeyemi", email: "nora.adeyemi@example.edu", cohort: "Summer 2026", program: "Data Analytics", status: "completed", progress: 100, attendance: 96, risk: "low", mentor: "Priya Nair", enrollmentDate: daysAgo(182), milestones: ["Onboarding", "SQL Foundations", "Dashboard Project", "Capstone"], createdAt: daysAgo(182), updatedAt: daysAgo(14) },
  ];
  const instructors = [
    { id: "ins-priya", name: "Priya Nair", email: "priya.nair@example.edu", specialty: "Data Analytics", status: "active", availability: "Mon–Thu · 09:00–17:00", rating: 4.8, sessionLoad: 14, incidents: 1, createdAt: daysAgo(230), updatedAt: daysAgo(1) },
    { id: "ins-darren", name: "Darren Holt", email: "darren.holt@example.edu", specialty: "Cloud Operations", status: "active", availability: "Tue–Fri · 10:00–18:00", rating: 4.6, sessionLoad: 11, incidents: 0, createdAt: daysAgo(206), updatedAt: daysAgo(2) },
    { id: "ins-elena", name: "Elena Voss", email: "elena.voss@example.edu", specialty: "Product Design", status: "limited", availability: "Mon–Wed · 08:00–13:00", rating: 4.9, sessionLoad: 8, incidents: 1, createdAt: daysAgo(194), updatedAt: daysAgo(0) },
  ];
  const sessions = [
    { id: "ses-sql", title: "SQL Performance Lab", course: "Data Analytics", instructorId: "ins-priya", studentIds: ["stu-ada", "stu-liam", "stu-nora"], startAt: daysFromNow(1, 10), duration: 90, room: "Studio A / Virtual", status: "confirmed", attendanceRate: 0, outcomes: "", createdAt: daysAgo(11), updatedAt: daysAgo(0) },
    { id: "ses-cloud", title: "Cloud Incident Simulation", course: "Cloud Operations", instructorId: "ins-darren", studentIds: ["stu-sofia", "stu-jonah"], startAt: daysFromNow(2, 14), duration: 120, room: "Lab 2", status: "planned", attendanceRate: 0, outcomes: "", createdAt: daysAgo(6), updatedAt: daysAgo(1) },
    { id: "ses-crit", title: "Portfolio Critique", course: "Product Design", instructorId: "ins-elena", studentIds: ["stu-mei"], startAt: daysAgo(2, 11), duration: 75, room: "Design Studio", status: "completed", attendanceRate: 100, outcomes: "Three portfolio actions confirmed; evidence attached to student milestones.", createdAt: daysAgo(21), updatedAt: daysAgo(2) },
    { id: "ses-onboard", title: "Cohort Onboarding", course: "Data Analytics", instructorId: "ins-priya", studentIds: ["stu-ada", "stu-liam"], startAt: daysAgo(36, 9), duration: 60, room: "Virtual", status: "completed", attendanceRate: 100, outcomes: "All mandatory onboarding checks completed.", createdAt: daysAgo(48), updatedAt: daysAgo(36) },
  ];
  const incidents = [
    { id: "inc-attendance", title: "Attendance decline: Autumn Data Analytics", type: "engagement", severity: "high", status: "investigating", studentId: "stu-liam", instructorId: "ins-priya", assignee: "Maya Chen", description: "Attendance fell below the 75% intervention threshold over two consecutive sessions.", rootCause: "Initial review indicates a schedule conflict; confirmation pending learner contact.", resolution: "", createdAt: daysAgo(1), updatedAt: daysAgo(0) },
    { id: "inc-access", title: "Lab access entitlement mismatch", type: "platform", severity: "medium", status: "triaged", studentId: "stu-sofia", instructorId: "ins-darren", assignee: "Darren Holt", description: "Cloud lab access was unavailable during scheduled practice time.", rootCause: "", resolution: "", createdAt: daysAgo(3), updatedAt: daysAgo(2) },
    { id: "inc-room", title: "Room conflict for critique session", type: "scheduling", severity: "low", status: "resolved", studentId: "stu-mei", instructorId: "ins-elena", assignee: "Elena Voss", description: "Design Studio was double-booked for a portfolio review.", rootCause: "Calendar sync lag from the facilities export.", resolution: "Session moved to virtual room and facilities escalation record created.", createdAt: daysAgo(10), updatedAt: daysAgo(7) },
  ];
  const kpis = [
    { id: "kpi-attendance", name: "Weekly attendance", domain: "Student lifecycle", unit: "%", definition: "Share of scheduled learner attendances recorded as present in the weekly cohort roster.", target: 92, warningThreshold: 84, owner: "Priya Nair", actuals: [{ date: "Aug 03", value: 94 }, { date: "Aug 10", value: 93 }, { date: "Aug 17", value: 91 }, { date: "Aug 24", value: 88 }, { date: "Aug 31", value: 86 }, { date: "Sep 07", value: 89 }], createdAt: daysAgo(100), updatedAt: daysAgo(0) },
    { id: "kpi-completion", name: "Milestone completion", domain: "Student lifecycle", unit: "%", definition: "Learners completing assigned milestones by the expected program cadence.", target: 80, warningThreshold: 72, owner: "Maya Chen", actuals: [{ date: "Aug 03", value: 71 }, { date: "Aug 10", value: 73 }, { date: "Aug 17", value: 75 }, { date: "Aug 24", value: 77 }, { date: "Aug 31", value: 76 }, { date: "Sep 07", value: 78 }], createdAt: daysAgo(100), updatedAt: daysAgo(1) },
    { id: "kpi-session", name: "Session delivery reliability", domain: "Sessions", unit: "%", definition: "Confirmed sessions delivered without cancellation or material delay.", target: 98, warningThreshold: 95, owner: "Darren Holt", actuals: [{ date: "Aug 03", value: 99 }, { date: "Aug 10", value: 98 }, { date: "Aug 17", value: 97 }, { date: "Aug 24", value: 99 }, { date: "Aug 31", value: 98 }, { date: "Sep 07", value: 98 }], createdAt: daysAgo(100), updatedAt: daysAgo(2) },
    { id: "kpi-quality", name: "Source freshness", domain: "Data quality", unit: "%", definition: "Operational records refreshed inside their published domain SLA.", target: 96, warningThreshold: 90, owner: "Maya Chen", actuals: [{ date: "Aug 03", value: 97 }, { date: "Aug 10", value: 96 }, { date: "Aug 17", value: 95 }, { date: "Aug 24", value: 94 }, { date: "Aug 31", value: 91 }, { date: "Sep 07", value: 93 }], createdAt: daysAgo(100), updatedAt: daysAgo(0) },
  ];
  const anomalies = [
    { id: "ano-attendance", title: "Attendance variance exceeds tolerance", domain: "Student lifecycle", metric: "Weekly attendance", expected: 92, actual: 86, delta: -6, severity: "high", status: "investigating", detectedAt: daysAgo(0), context: "Autumn 2026 Data Analytics cohort fell six points below its published weekly attendance target. Two of six learners are outside normal engagement bands.", rootCause: "Learner schedule conflict suspected; awaiting direct confirmation.", note: "Cross-checked against session schedule and validated attendance source freshness.", resolution: "" },
    { id: "ano-freshness", title: "Instructor availability source stale", domain: "Data quality", metric: "Source freshness", expected: 96, actual: 82, delta: -14, severity: "medium", status: "flagged", detectedAt: daysAgo(1), context: "Instructor availability export has not updated in 18 hours, exceeding the eight-hour SLA.", rootCause: "", note: "", resolution: "" },
    { id: "ano-load", title: "Instructor load concentration", domain: "Instructor management", metric: "Sessions per instructor", expected: 10, actual: 14, delta: 4, severity: "medium", status: "flagged", detectedAt: daysAgo(2), context: "Priya Nair holds 14 active sessions, four above the preferred distribution threshold.", rootCause: "", note: "", resolution: "" },
  ];
  const quality = [
    { id: "dq-students", domain: "Student lifecycle", completeness: 96, accuracy: 94, freshness: 98, owner: "Maya Chen", status: "healthy", issues: [{ title: "Two mentor fields unassigned", severity: "low", state: "open", remediation: "Assign mentor during next cohort review." }], updatedAt: daysAgo(0) },
    { id: "dq-instructors", domain: "Instructor management", completeness: 89, accuracy: 97, freshness: 82, owner: "Darren Holt", status: "attention", issues: [{ title: "Availability export exceeds SLA", severity: "medium", state: "in_progress", remediation: "Validate M365 export schedule and rerun connector." }], updatedAt: daysAgo(1) },
    { id: "dq-sessions", domain: "Sessions", completeness: 98, accuracy: 96, freshness: 95, owner: "Priya Nair", status: "healthy", issues: [], updatedAt: daysAgo(0) },
    { id: "dq-incidents", domain: "Incidents", completeness: 92, accuracy: 95, freshness: 97, owner: "Maya Chen", status: "healthy", issues: [{ title: "One resolved incident lacks closure code", severity: "low", state: "open", remediation: "Add resolution category in incident closeout." }], updatedAt: daysAgo(0) },
  ];
  const sops = [
    { id: "sop-attendance", title: "Attendance intervention and escalation", domain: "Student lifecycle", incidentType: "engagement", activeVersion: 2, versions: [{ version: 1, body: "Identify attendance variance, validate source data, contact learner, and log an intervention within one business day.", summary: "Initial attendance intervention workflow", createdAt: daysAgo(90), createdBy: "Maya Chen" }, { version: 2, body: "Identify attendance variance, validate the attendance source and session roster, contact the learner within one business day, log the intervention, and escalate to the operations manager after two consecutive breaches.", summary: "Added two-breach escalation control", createdAt: daysAgo(20), createdBy: "Maya Chen" }], createdAt: daysAgo(90), updatedAt: daysAgo(20) },
    { id: "sop-platform", title: "Learning platform access failure", domain: "Sessions", incidentType: "platform", activeVersion: 1, versions: [{ version: 1, body: "Confirm the learner identity, capture the access error, validate entitlement, offer a temporary alternate route, and update the incident record.", summary: "Initial platform access response", createdAt: daysAgo(75), createdBy: "Darren Holt" }], createdAt: daysAgo(75), updatedAt: daysAgo(75) },
    { id: "sop-kpi", title: "KPI definition governance", domain: "KPI library", incidentType: "", activeVersion: 1, versions: [{ version: 1, body: "All KPI definitions must specify a numerator, denominator where applicable, data source, refresh cadence, owner, target, and warning threshold before publication.", summary: "Baseline KPI governance standard", createdAt: daysAgo(64), createdBy: "Maya Chen" }], createdAt: daysAgo(64), updatedAt: daysAgo(64) },
  ];
  const analyses = [
    { id: "ana-attendance", name: "Autumn attendance intervention review", scope: "Student lifecycle", parameters: "Cohort: Autumn 2026; period: last 14 days", dataRange: "Aug 25 – Sep 07", summary: "Attendance is below target, driven by the Data Analytics cohort. Evidence is sufficient for a learner outreach intervention but not a causal claim.", provenance: ["kpi-attendance", "ano-attendance", "inc-attendance"], createdBy: "Maya Chen", createdAt: daysAgo(0), updatedAt: daysAgo(0) },
  ];
  const actions = [
    { id: "act-attendance", title: "Confirm learner attendance intervention", owner: "Maya Chen", dueAt: daysFromNow(1, 16), status: "in_progress", priority: "high", linkedType: "incidents", linkedId: "inc-attendance", decisionRequired: true, description: "Contact Liam, confirm the schedule conflict, and attach the intervention outcome before approving closure.", createdAt: daysAgo(0), updatedAt: daysAgo(0) },
    { id: "act-availability", title: "Restore instructor availability freshness", owner: "Darren Holt", dueAt: daysFromNow(0, 17), status: "assigned", priority: "medium", linkedType: "quality", linkedId: "dq-instructors", decisionRequired: false, description: "Validate the source export job and record the refreshed timestamp.", createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  ];
  const onboarding = [
    { id: "onb-manager", title: "Manager operational activation", role: "manager", status: "in_progress", owner: "Maya Chen", items: [{ id: "onb-m-1", label: "Review workspace operating thresholds", required: true, completed: true, evidence: "Attendance and source freshness policies confirmed." }, { id: "onb-m-2", label: "Confirm incident escalation owner", required: true, completed: true, evidence: "Maya Chen assigned as escalation approver." }, { id: "onb-m-3", label: "Review integration readiness", required: true, completed: false, evidence: "" }, { id: "onb-m-4", label: "Publish weekly report cadence", required: true, completed: false, evidence: "" }], createdAt: daysAgo(4), updatedAt: daysAgo(0) },
    { id: "onb-coordinator", title: "Coordinator operational activation", role: "coordinator", status: "not_started", owner: "Operations coordinator", items: [{ id: "onb-c-1", label: "Complete learner intervention workflow review", required: true, completed: false, evidence: "" }, { id: "onb-c-2", label: "Validate import duplicate handling", required: true, completed: false, evidence: "" }, { id: "onb-c-3", label: "Acknowledge communication logging standard", required: true, completed: false, evidence: "" }], createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  ];
  const notifications = [
    { id: "note-approval", title: "Approval required: attendance intervention", channel: "in_app", status: "unread", audience: "manager", actionId: "act-attendance", dueAt: daysFromNow(1, 16), body: "Review the evidence and approve or return the learner intervention action.", createdAt: daysAgo(0) },
    { id: "note-freshness", title: "Data freshness SLA breached", channel: "in_app", status: "read", audience: "owner", actionId: "act-availability", dueAt: daysFromNow(0, 17), body: "Instructor availability has exceeded the configured source freshness threshold.", createdAt: daysAgo(1) },
  ];
  const communications = [
    { id: "com-liam", subject: "Attendance support check-in", channel: "email", owner: "Maya Chen", outcome: "awaiting_reply", linkedType: "students", linkedId: "stu-liam", sentAt: daysAgo(0, 15), summary: "Asked the learner to confirm the reported schedule conflict and preferred support route." },
  ];
  const imports = [
    { id: "imp-roster", name: "Learner roster daily export", sourceType: "CSV / Microsoft 365", status: "healthy", mappingTemplate: "Student lifecycle v1", lastRunAt: daysAgo(0, 6), duplicatePolicy: "email_or_name_cohort", owner: "Maya Chen", validationSummary: "0 blocking errors; 2 duplicate rows skipped in last run.", runs: [{ id: "run-roster-1", startedAt: daysAgo(0, 6), status: "completed", received: 122, created: 4, duplicates: 2, failed: 0, preview: ["name → student.name", "email → student.email", "cohort → student.cohort"] }] },
    { id: "imp-instructor", name: "Instructor availability export", sourceType: "Microsoft 365", status: "attention", mappingTemplate: "Instructor availability v1", lastRunAt: daysAgo(1, 20), duplicatePolicy: "email", owner: "Darren Holt", validationSummary: "Source freshness exceeds eight-hour SLA; retry required.", runs: [{ id: "run-instructor-1", startedAt: daysAgo(1, 20), status: "validation_failed", received: 18, created: 0, duplicates: 0, failed: 3, preview: ["availability → instructor.availability", "owner → instructor.name", "3 rows missing email; remediation required"] }] },
  ];
  const reports = [
    { id: "rep-weekly", name: "Weekly delivery health pack", scope: "Students, sessions, incidents, data quality", status: "ready", parameters: "Autumn 2026; previous seven days", owner: "Maya Chen", definition: "Standard operational review with sources and exception appendix.", definitionRevision: 2, schedule: "Every Monday 08:00 local time — readiness checked", lastGeneratedAt: daysAgo(0, 8), snapshots: [{ id: "snap-weekly-1", generatedAt: daysAgo(0, 8), status: "generated", definitionRevision: 2, rowCount: 22, summary: "Two open incidents, two actionable anomalies, one source freshness breach." }], runHistory: [{ id: "report-run-weekly-1", snapshotId: "snap-weekly-1", generatedAt: daysAgo(0, 8), status: "generated", definitionRevision: 2, parameters: "Autumn 2026; previous seven days", rowCount: 22, summary: "Two open incidents, two actionable anomalies, one source freshness breach." }] },
    { id: "rep-risk", name: "Learner risk follow-up queue", scope: "Student lifecycle", status: "draft", parameters: "Risk: medium or high; current cohort", owner: "Priya Nair", definition: "Actionable cohort queue for learner support coordination.", definitionRevision: 1, schedule: "No schedule configured", lastGeneratedAt: daysAgo(2, 9), snapshots: [], runHistory: [] },
  ];
  const configRecords = [
    { id: "cfg-attendance", key: "Attendance intervention threshold", category: "Threshold governance", value: "75% for two consecutive sessions", status: "active", owner: "Maya Chen", rationale: "Controls timely learner-support intervention.", updatedAt: daysAgo(20) },
    { id: "cfg-freshness", key: "Instructor source freshness SLA", category: "Source governance", value: "8 hours", status: "active", owner: "Darren Holt", rationale: "Protects session scheduling accuracy.", updatedAt: daysAgo(30) },
    { id: "cfg-retention", key: "Demo workspace retention policy", category: "Privacy and retention", value: "Synthetic data; delete on workspace reset", status: "active", owner: "Maya Chen", rationale: "Keeps the demo environment free of real student data.", updatedAt: daysAgo(4) },
    { id: "cfg-integration", key: "Microsoft 365 availability adapter readiness", category: "Integration readiness", value: "Metadata registered; credentials and production sync disabled", status: "draft", owner: "Darren Holt", rationale: "Production connector requires approved service account, source SLA, retry policy, and privacy review.", updatedAt: daysAgo(1) },
  ];
  const support = [
    { id: "sup-backup", title: "Local workspace export readiness", category: "Backup and recovery", status: "healthy", owner: "Maya Chen", detail: "CSV export and release archive are available; managed backup is not configured for the local demo store.", checkedAt: daysAgo(0, 8) },
    { id: "sup-sync", title: "Instructor availability connector readiness", category: "Integration health", status: "attention", owner: "Darren Holt", detail: "Adapter metadata is registered; live connector credentials are intentionally not configured in the demo.", checkedAt: daysAgo(0, 8) },
  ];
  const organizationSettings = [
    { id: "org-main", name: "Northstar Learning Operations", category: "Workspace governance", status: "active", owner: "Maya Chen", operatingCalendar: "Autumn 2026", teamDirectory: ["Maya Chen — manager", "Priya Nair — coordinator", "Darren Holt — instructor lead"], roleMatrix: "Admin: governance; Manager: operating controls; Coordinator: delivery actions; Analyst: analysis", referenceData: "Cohort, programme, delivery channel, incident taxonomy", updatedAt: daysAgo(1) },
  ];
  const integrations = [
    { id: "int-sis", name: "Student information system connector", system: "SIS", status: "draft", owner: "Maya Chen", credentialsConfigured: false, mappingApproved: true, mappingDefinition: { source: "SIS roster", targets: ["student.name", "student.email", "student.cohort"] }, retryPolicy: "3 attempts with owner escalation", lineage: "SIS roster → student lifecycle", readiness: "attention", syncRuns: [], syncQueue: [{ id: "sync-queue-sis", enqueuedAt: daysAgo(0, 2), status: "pending", purpose: "Validate credentials, mapping approval, lineage, and retry policy", requestedBy: "Maya Chen" }] },
    { id: "int-lms", name: "Learning platform engagement connector", system: "LMS", status: "draft", owner: "Priya Nair", credentialsConfigured: false, mappingApproved: false, mappingDefinition: { source: "LMS activity", targets: ["student.name"] }, retryPolicy: "Manual reconcile before retry", lineage: "LMS activity → KPI and learner risk", readiness: "attention", syncRuns: [], syncQueue: [] },
  ];
  const automations = [
    { id: "auto-attendance", name: "Attendance intervention routing", trigger: "Attendance KPI breaches warning threshold", condition: "Two consecutive sessions below 75%", actions: ["Create action", "Notify coordinator", "Require manager approval to close"], escalationRule: "Create high-priority operational incident if no recorded intervention outcome within 24 hours.", approvalRequired: true, status: "active", owner: "Maya Chen", runs: [] },
    { id: "auto-source", name: "Source freshness escalation", trigger: "Integration freshness SLA breached", condition: "Age exceeds 8 hours", actions: ["Create data quality issue", "Notify source owner"], approvalRequired: false, status: "active", owner: "Darren Holt", runs: [] },
  ];
  const collaboration = [
    { id: "collab-attendance", subject: "Attendance intervention handoff", linkedType: "incidents", linkedId: "inc-attendance", owner: "Priya Nair", status: "open", mentions: ["Maya Chen"], note: "Coordinator to attach learner contact outcome before manager closure.", handoffTo: "Maya Chen", dueAt: daysFromNow(1, 16), evidenceMetadata: "No attachment stored; action evidence retained in audit timeline." },
  ];
  const privacy = [
    { id: "priv-retention", title: "Annual retention policy review", requestType: "retention_review", status: "verifying", owner: "Maya Chen", subjectReference: "Demo workspace", dueAt: daysFromNow(14), consentState: "synthetic demo data only", evidence: "Validate deletion/reset behavior and policy acknowledgement." },
  ];
  const plans = [
    { id: "plan-autumn", name: "Autumn delivery capacity plan", domain: "Sessions and instructors", horizon: "Autumn 2026", owner: "Maya Chen", status: "active", assumptions: "20 learners per session; 8 active instructors; 10% contingency", forecast: "Projected capacity 160 learner seats", actual: "112 scheduled learner seats", variance: "48 seats of contingency" },
  ];
  const resilience = [
    { id: "res-backup", title: "Local export and restore rehearsal", control: "Backup/restore readiness", status: "healthy", owner: "Maya Chen", cadence: "Quarterly", evidence: "CSV exports and release archive verified; managed backup is not configured in local-first mode.", nextReviewAt: daysFromNow(30) },
    { id: "res-incident-comms", title: "Incident communication template review", control: "Operational resilience", status: "attention", owner: "Priya Nair", cadence: "Termly", evidence: "Stakeholder communication templates require organization-specific approval.", nextReviewAt: daysFromNow(7) },
  ];
  const releases = [
    { id: "rel-desktop", name: "Windows desktop operational release", version: "1.1.0", status: "ready_for_review", owner: "Maya Chen", configurationCheck: "Local state, integration readiness, release archive", testEvidence: "Automated desktop rule tests and renderer build", rollbackPlan: "Restore the preceding application archive and local-state export", approvedBy: "", releasedAt: null },
  ];
  const reconciliations = [
    { id: "recon-lms", title: "LMS activity mapping reconciliation", integrationId: "int-lms", sourceRunId: "sync-queue-sis", status: "open", owner: "Priya Nair", issue: "Required learner engagement identifier is not mapped to a canonical student record.", proposedResolution: "Approve engagement-ID mapping and verify three sample records before enabling sync.", createdAt: daysAgo(0, 3) },
  ];
  const securityControls = [
    { id: "sec-access", name: "Quarterly privileged-access review", domain: "Access control", status: "active", owner: "Maya Chen", cadence: "Quarterly", evidence: "Role matrix and desktop role boundary verified in the local workspace.", auditExports: [] },
    { id: "sec-audit", name: "Audit evidence export control", domain: "Audit and monitoring", status: "active", owner: "Maya Chen", cadence: "Monthly", evidence: "Export process requires manager approval and stores the action in append-only audit history.", auditExports: [] },
  ];
  const dashboards = [
    { id: "dash-exec", name: "Executive delivery health", audience: "Operations leadership", status: "active", owner: "Maya Chen", widgets: ["KPI status", "Capacity plan", "Open incidents", "Data health"], sharedWith: ["Maya Chen", "Priya Nair"] },
  ];
  const explorations = [
    { id: "explore-capacity", name: "Autumn capacity variance exploration", metric: "Scheduled learner seats", scope: "Autumn delivery capacity plan", owner: "Maya Chen", dimensions: "Cohort, programme, instructor load", insight: "Capacity contingency remains positive; availability freshness is the limiting leading signal.", createdAt: daysAgo(1) },
  ];
  const diagnostics = [
    { id: "diag-workspace", name: "Local workspace diagnostics bundle", category: "Desktop state", status: "ready", owner: "Maya Chen", createdAt: daysAgo(0, 1), summary: "Record counts, operational health states, integration readiness, and recent audit metadata; no personal data payload is included." },
  ];
  const serviceReviews = [
    { id: "review-september", title: "September operational service review", period: "September 2026", status: "scheduled", owner: "Maya Chen", agenda: "Delivery capacity, data quality, connector readiness, incidents, and resilience control evidence.", outcomes: "", dueAt: daysFromNow(7) },
  ];
  const programs = [
    { id: "prog-data", name: "Data Analytics", status: "active", owner: "Maya Chen", deliveryModel: "Hybrid", durationWeeks: 16, createdAt: daysAgo(210) },
    { id: "prog-cloud", name: "Cloud Operations", status: "active", owner: "Maya Chen", deliveryModel: "Hybrid", durationWeeks: 16, createdAt: daysAgo(210) },
    { id: "prog-design", name: "Product Design", status: "active", owner: "Maya Chen", deliveryModel: "Studio", durationWeeks: 14, createdAt: daysAgo(210) },
  ];
  const cohorts = [
    { id: "cohort-autumn-data", name: "Autumn 2026 Data Analytics", programId: "prog-data", status: "active", owner: "Priya Nair", startAt: daysAgo(84), learnerCount: 2 },
    { id: "cohort-autumn-cloud", name: "Autumn 2026 Cloud Operations", programId: "prog-cloud", status: "active", owner: "Darren Holt", startAt: daysAgo(79), learnerCount: 2 },
  ];
  const attendanceRecords = [
    { id: "att-liam-sql", studentId: "stu-liam", sessionId: "ses-sql", status: "absent", recordedAt: daysAgo(1), sourceId: "dataset-attendance" },
    { id: "att-ada-sql", studentId: "stu-ada", sessionId: "ses-sql", status: "present", recordedAt: daysAgo(1), sourceId: "dataset-attendance" },
  ];
  const cancellations = [
    { id: "can-cloud", sessionId: "ses-cloud", reason: "Instructor availability change", status: "reviewed", recordedAt: daysAgo(9), sourceId: "dataset-sessions" },
  ];
  const feedback = [
    { id: "fb-crit", sessionId: "ses-crit", source: "Anonymous learner pulse", status: "verified", recordedAt: daysAgo(1), rating: 5, evidence: "Clear portfolio feedback and concrete next steps." },
  ];
  const transcripts = [
    { id: "tr-crit", sessionId: "ses-crit", source: "Synthetic transcript", status: "verified", capturedAt: daysAgo(2), text: "Instructor: Let us review the portfolio evidence. Learner: I will revise the case-study outcome statement. Instructor: Please connect the outcome to the research evidence and return it by Friday.", permittedForEvaluation: true },
  ];
  const rubrics = [
    { id: "rubric-session-quality", name: "Evidence-linked session coaching", status: "active", owner: "Maya Chen", activeVersion: 1, versions: [{ version: 1, criteria: [{ id: "criterion-evidence", label: "Uses learner evidence", description: "Instructor anchors coaching in visible learner work or stated goals." }, { id: "criterion-next-step", label: "Defines next step", description: "Instructor and learner agree an observable follow-up action." }], createdAt: daysAgo(30), createdBy: "Maya Chen" }] },
  ];
  const evaluations = [
    { id: "eval-crit", sessionId: "ses-crit", rubricId: "rubric-session-quality", rubricVersion: 1, status: "pending_calibration", owner: "Elena Voss", transcriptId: "tr-crit", evidence: [{ criterionId: "criterion-evidence", quote: "Let us review the portfolio evidence.", sourceId: "tr-crit" }, { criterionId: "criterion-next-step", quote: "return it by Friday.", sourceId: "tr-crit" }], findings: "Evidence is present for both active rubric criteria; human calibration is required before approval.", limitations: "Synthetic transcript excerpt only; no recording quality signal is available.", createdAt: daysAgo(1) },
  ];
  const datasets = [
    { id: "dataset-attendance", name: "Attendance roster sample", sourceType: "CSV", status: "committed", owner: "Maya Chen", schema: ["student_email", "session_title", "attendance_status", "recorded_at"], mapping: { student_email: "student.email", session_title: "session.title", attendance_status: "attendance.status", recorded_at: "attendance.recordedAt" }, profile: { rows: 2, duplicateRows: 0, missingRequired: 0 }, lineage: "Synthetic roster → attendance records", committedAt: daysAgo(1) },
    { id: "dataset-sessions", name: "Session delivery sample", sourceType: "CSV", status: "profiled", owner: "Maya Chen", schema: ["session_title", "cancel_reason"], mapping: { session_title: "session.title", cancel_reason: "cancellation.reason" }, profile: { rows: 1, duplicateRows: 0, missingRequired: 0 }, lineage: "Synthetic delivery export → cancellations", committedAt: null },
  ];
  const analystRuns = [
    { id: "analyst-attendance", question: "What should the team do about Autumn attendance?", scope: "Autumn 2026 Data Analytics; previous 14 days", status: "safe_failure", requestedBy: "Maya Chen", provider: "local-qwen-adapter", sourceIds: ["kpi-attendance", "ano-attendance", "inc-attendance"], observedFacts: ["Weekly attendance is 89% against a 92% target.", "One learner has a documented attendance incident."], interpretation: "The cohort is below the published weekly target.", hypotheses: ["A schedule conflict may be contributing; this is not confirmed causality."], limitations: ["Local inference provider is not configured in this demo."], recommendation: "Validate the learner contact outcome before approving an intervention action.", createdAt: daysAgo(0) },
  ];
  const businessReviews = [
    { id: "review-weekly-ops", title: "Weekly operational business review", period: "Aug 31 – Sep 07", status: "awaiting_approval", owner: "Maya Chen", metricSources: ["kpi-attendance", "kpi-session", "kpi-quality"], canonicalMetrics: [{ id: "kpi-attendance", actual: 89, target: 92 }, { id: "kpi-session", actual: 98, target: 98 }, { id: "kpi-quality", actual: 93, target: 96 }], findings: "Attendance and source freshness require follow-through; session delivery reliability remains on target.", actionIds: ["act-attendance", "act-availability"], generatedAt: daysAgo(0, 8), approvedBy: "" },
  ];
  const audit = [
    auditSeed(daysAgo(0), "ANOMALY_FLAGGED", "anomalies", "ano-attendance", "Flagged attendance variance for analyst review", { expected: 92, actual: 86 }),
    auditSeed(daysAgo(1), "INCIDENT_CREATED", "incidents", "inc-attendance", "Created attendance decline incident", { severity: "high" }),
    auditSeed(daysAgo(2), "SESSION_COMPLETED", "sessions", "ses-crit", "Logged portfolio critique outcomes", { attendanceRate: 100 }),
    auditSeed(daysAgo(20), "SOP_VERSION_PUBLISHED", "sops", "sop-attendance", "Published SOP version 2", { version: 2 }),
  ];
  return { version: 1, workspace: { name: "Northstar Learning Operations", updatedAt: isoNow() }, currentUser: { id: "u-maya", name: "Maya Chen", role: "manager" }, students, instructors, sessions, incidents, kpis, anomalies, quality, sops, analyses, onboarding, actions, notifications, communications, imports, reports, configRecords, support, organizationSettings, integrations, automations, collaboration, privacy, plans, resilience, releases, reconciliations, securityControls, dashboards, explorations, diagnostics, serviceReviews, programs, cohorts, attendanceRecords, cancellations, feedback, transcripts, rubrics, evaluations, datasets, analystRuns, businessReviews, audit };
}

function normalizeState(input) {
  const baseline = createSeedState();
  return { ...baseline, ...input, audit: Array.isArray(input?.audit) ? input.audit : baseline.audit };
}

module.exports = { createSeedState, createId, isoNow, normalizeState };
