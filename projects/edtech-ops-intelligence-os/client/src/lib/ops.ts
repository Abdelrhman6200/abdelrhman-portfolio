export type OpsRecord = { id: string; [key: string]: any };

export type OpsState = {
  workspace: { name: string; updatedAt: string };
  currentUser: { id: string; name: string; role: string };
  students: OpsRecord[];
  instructors: OpsRecord[];
  sessions: OpsRecord[];
  incidents: OpsRecord[];
  kpis: OpsRecord[];
  anomalies: OpsRecord[];
  quality: OpsRecord[];
  sops: OpsRecord[];
  analyses: OpsRecord[];
  onboarding: OpsRecord[];
  actions: OpsRecord[];
  notifications: OpsRecord[];
  communications: OpsRecord[];
  imports: OpsRecord[];
  reports: OpsRecord[];
  configRecords: OpsRecord[];
  support: OpsRecord[];
  organizationSettings: OpsRecord[];
  integrations: OpsRecord[];
  automations: OpsRecord[];
  collaboration: OpsRecord[];
  privacy: OpsRecord[];
  plans: OpsRecord[];
  resilience: OpsRecord[];
  releases: OpsRecord[];
  reconciliations: OpsRecord[];
  securityControls: OpsRecord[];
  dashboards: OpsRecord[];
  explorations: OpsRecord[];
  diagnostics: OpsRecord[];
  serviceReviews: OpsRecord[];
  programs: OpsRecord[];
  cohorts: OpsRecord[];
  attendanceRecords: OpsRecord[];
  cancellations: OpsRecord[];
  feedback: OpsRecord[];
  transcripts: OpsRecord[];
  rubrics: OpsRecord[];
  evaluations: OpsRecord[];
  datasets: OpsRecord[];
  analystRuns: OpsRecord[];
  businessReviews: OpsRecord[];
  audit: OpsRecord[];
};

export const numberFields = new Set([
  "progress",
  "attendance",
  "rating",
  "sessionLoad",
  "attendanceRate",
  "duration",
  "target",
  "warningThreshold",
  "completeness",
  "accuracy",
  "freshness",
  "expected",
  "actual",
  "delta",
]);

export function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function average(values: number[]) {
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
}

export function fallbackState(): OpsState {
  const now = new Date().toISOString();
  return {
    workspace: { name: "Northstar Learning Operations", updatedAt: now },
    currentUser: { id: "u-maya", name: "Maya Chen", role: "manager" },
    students: [
      {
        id: "stu-ada",
        name: "Ada Mensah",
        email: "ada.mensah@example.edu",
        cohort: "Autumn 2026",
        program: "Data Analytics",
        status: "active",
        progress: 78,
        attendance: 94,
        risk: "low",
        mentor: "Priya Nair",
      },
      {
        id: "stu-liam",
        name: "Liam Osei",
        email: "liam.osei@example.edu",
        cohort: "Autumn 2026",
        program: "Data Analytics",
        status: "at_risk",
        progress: 46,
        attendance: 68,
        risk: "high",
        mentor: "Priya Nair",
      },
      {
        id: "stu-sofia",
        name: "Sofia Marin",
        email: "sofia.marin@example.edu",
        cohort: "Autumn 2026",
        program: "Cloud Operations",
        status: "active",
        progress: 65,
        attendance: 90,
        risk: "low",
        mentor: "Darren Holt",
      },
      {
        id: "stu-mei",
        name: "Mei Tan",
        email: "mei.tan@example.edu",
        cohort: "Autumn 2026",
        program: "Product Design",
        status: "active",
        progress: 83,
        attendance: 97,
        risk: "low",
        mentor: "Elena Voss",
      },
    ],
    instructors: [
      {
        id: "ins-priya",
        name: "Priya Nair",
        specialty: "Data Analytics",
        status: "active",
        availability: "Mon–Thu · 09:00–17:00",
        rating: 4.8,
        sessionLoad: 14,
        incidents: 1,
      },
      {
        id: "ins-darren",
        name: "Darren Holt",
        specialty: "Cloud Operations",
        status: "active",
        availability: "Tue–Fri · 10:00–18:00",
        rating: 4.6,
        sessionLoad: 11,
        incidents: 0,
      },
      {
        id: "ins-elena",
        name: "Elena Voss",
        specialty: "Product Design",
        status: "limited",
        availability: "Mon–Wed · 08:00–13:00",
        rating: 4.9,
        sessionLoad: 8,
        incidents: 1,
      },
    ],
    sessions: [
      {
        id: "ses-sql",
        title: "SQL Performance Lab",
        course: "Data Analytics",
        instructorId: "ins-priya",
        startAt: now,
        duration: 90,
        room: "Studio A / Virtual",
        status: "confirmed",
        attendanceRate: 0,
        outcomes: "",
      },
      {
        id: "ses-cloud",
        title: "Cloud Incident Simulation",
        course: "Cloud Operations",
        instructorId: "ins-darren",
        startAt: now,
        duration: 120,
        room: "Lab 2",
        status: "planned",
        attendanceRate: 0,
        outcomes: "",
      },
      {
        id: "ses-crit",
        title: "Portfolio Critique",
        course: "Product Design",
        instructorId: "ins-elena",
        startAt: now,
        duration: 75,
        room: "Design Studio",
        status: "completed",
        attendanceRate: 100,
        outcomes: "Three actions confirmed.",
      },
    ],
    incidents: [
      {
        id: "inc-attendance",
        title: "Attendance decline: Autumn Data Analytics",
        type: "engagement",
        severity: "high",
        status: "investigating",
        assignee: "Maya Chen",
        description: "Attendance fell below the 75% intervention threshold.",
        rootCause: "Schedule conflict suspected.",
        resolution: "",
      },
      {
        id: "inc-access",
        title: "Lab access entitlement mismatch",
        type: "platform",
        severity: "medium",
        status: "triaged",
        assignee: "Darren Holt",
        description: "Cloud lab access unavailable.",
        rootCause: "",
        resolution: "",
      },
    ],
    kpis: [
      {
        id: "kpi-attendance",
        name: "Weekly attendance",
        domain: "Student lifecycle",
        unit: "%",
        target: 92,
        warningThreshold: 84,
        owner: "Priya Nair",
        actuals: [
          { date: "Aug 03", value: 94 },
          { date: "Aug 10", value: 93 },
          { date: "Aug 17", value: 91 },
          { date: "Aug 24", value: 88 },
          { date: "Aug 31", value: 86 },
          { date: "Sep 07", value: 89 },
        ],
      },
      {
        id: "kpi-completion",
        name: "Milestone completion",
        domain: "Student lifecycle",
        unit: "%",
        target: 80,
        warningThreshold: 72,
        owner: "Maya Chen",
        actuals: [
          { date: "Aug 03", value: 71 },
          { date: "Aug 10", value: 73 },
          { date: "Aug 17", value: 75 },
          { date: "Aug 24", value: 77 },
          { date: "Aug 31", value: 76 },
          { date: "Sep 07", value: 78 },
        ],
      },
      {
        id: "kpi-session",
        name: "Session delivery reliability",
        domain: "Sessions",
        unit: "%",
        target: 98,
        warningThreshold: 95,
        owner: "Darren Holt",
        actuals: [
          { date: "Aug 03", value: 99 },
          { date: "Aug 10", value: 98 },
          { date: "Aug 17", value: 97 },
          { date: "Aug 24", value: 99 },
          { date: "Aug 31", value: 98 },
          { date: "Sep 07", value: 98 },
        ],
      },
    ],
    anomalies: [
      {
        id: "ano-attendance",
        title: "Attendance variance exceeds tolerance",
        domain: "Student lifecycle",
        metric: "Weekly attendance",
        expected: 92,
        actual: 86,
        delta: -6,
        severity: "high",
        status: "investigating",
        detectedAt: now,
        context:
          "Autumn Data Analytics cohort is six points below the published weekly target.",
        rootCause: "Learner schedule conflict suspected.",
        note: "Attendance source freshness validated.",
        resolution: "",
      },
      {
        id: "ano-freshness",
        title: "Instructor availability source stale",
        domain: "Data quality",
        metric: "Source freshness",
        expected: 96,
        actual: 82,
        delta: -14,
        severity: "medium",
        status: "flagged",
        detectedAt: now,
        context:
          "Availability export is 18 hours old against an eight-hour SLA.",
        rootCause: "",
        note: "",
        resolution: "",
      },
    ],
    quality: [
      {
        id: "dq-students",
        domain: "Student lifecycle",
        completeness: 96,
        accuracy: 94,
        freshness: 98,
        owner: "Maya Chen",
        status: "healthy",
        issues: [
          {
            title: "Two mentor fields unassigned",
            severity: "low",
            state: "open",
            remediation: "Assign mentor in cohort review.",
          },
        ],
      },
      {
        id: "dq-instructors",
        domain: "Instructor management",
        completeness: 89,
        accuracy: 97,
        freshness: 82,
        owner: "Darren Holt",
        status: "attention",
        issues: [
          {
            title: "Availability export exceeds SLA",
            severity: "medium",
            state: "in_progress",
            remediation: "Validate export schedule.",
          },
        ],
      },
      {
        id: "dq-sessions",
        domain: "Sessions",
        completeness: 98,
        accuracy: 96,
        freshness: 95,
        owner: "Priya Nair",
        status: "healthy",
        issues: [],
      },
    ],
    sops: [
      {
        id: "sop-attendance",
        title: "Attendance intervention and escalation",
        domain: "Student lifecycle",
        incidentType: "engagement",
        activeVersion: 2,
        versions: [
          {
            version: 1,
            body: "Validate attendance source and contact the learner within one business day.",
            summary: "Initial intervention workflow",
            createdAt: now,
            createdBy: "Maya Chen",
          },
          {
            version: 2,
            body: "Validate attendance source, contact the learner within one business day, log the intervention, and escalate after two consecutive breaches.",
            summary: "Added two-breach escalation",
            createdAt: now,
            createdBy: "Maya Chen",
          },
        ],
      },
      {
        id: "sop-platform",
        title: "Learning platform access failure",
        domain: "Sessions",
        incidentType: "platform",
        activeVersion: 1,
        versions: [
          {
            version: 1,
            body: "Capture the error, validate entitlement, offer an alternate route, and update the incident.",
            summary: "Initial platform response",
            createdAt: now,
            createdBy: "Darren Holt",
          },
        ],
      },
    ],
    analyses: [
      {
        id: "ana-attendance",
        name: "Autumn attendance intervention review",
        scope: "Student lifecycle",
        parameters: "Cohort: Autumn 2026; last 14 days",
        dataRange: "Aug 25 – Sep 07",
        summary:
          "Attendance is below target. Evidence supports outreach but not a causal claim.",
        provenance: ["kpi-attendance", "ano-attendance"],
        createdBy: "Maya Chen",
        createdAt: now,
      },
    ],
    onboarding: [
      {
        id: "onb-manager",
        title: "Manager operational activation",
        role: "manager",
        status: "in_progress",
        owner: "Maya Chen",
        items: [
          {
            id: "onb-m-1",
            label: "Review workspace operating thresholds",
            required: true,
            completed: true,
            evidence: "Confirmed.",
          },
          {
            id: "onb-m-2",
            label: "Review integration readiness",
            required: true,
            completed: false,
            evidence: "",
          },
        ],
      },
    ],
    actions: [
      {
        id: "act-attendance",
        title: "Confirm learner attendance intervention",
        owner: "Maya Chen",
        dueAt: now,
        status: "in_progress",
        priority: "high",
        decisionRequired: true,
        linkedType: "incidents",
        linkedId: "inc-attendance",
        description: "Confirm intervention outcome before approval.",
      },
    ],
    notifications: [
      {
        id: "note-approval",
        title: "Approval required: attendance intervention",
        channel: "in_app",
        status: "unread",
        audience: "manager",
        body: "Review evidence and approve or return the action.",
        dueAt: now,
      },
    ],
    communications: [
      {
        id: "com-liam",
        subject: "Attendance support check-in",
        channel: "email",
        owner: "Maya Chen",
        outcome: "awaiting_reply",
        linkedType: "students",
        linkedId: "stu-liam",
        sentAt: now,
        summary: "Requested confirmation of the schedule conflict.",
      },
    ],
    imports: [
      {
        id: "imp-roster",
        name: "Learner roster daily export",
        sourceType: "CSV / Microsoft 365",
        status: "healthy",
        mappingTemplate: "Student lifecycle v1",
        owner: "Maya Chen",
        validationSummary: "0 blocking errors; duplicate policy applied.",
      },
    ],
    reports: [
      {
        id: "rep-weekly",
        name: "Weekly delivery health pack",
        scope: "Students, sessions, incidents, data quality",
        status: "ready",
        owner: "Maya Chen",
        parameters: "Autumn 2026; previous seven days",
        definitionRevision: 1,
        snapshots: [],
        runHistory: [],
      },
    ],
    configRecords: [
      {
        id: "cfg-attendance",
        key: "Attendance intervention threshold",
        category: "Threshold governance",
        value: "75% for two consecutive sessions",
        status: "active",
        owner: "Maya Chen",
      },
    ],
    support: [
      {
        id: "sup-backup",
        title: "Local workspace export readiness",
        category: "Backup and recovery",
        status: "healthy",
        owner: "Maya Chen",
        detail: "CSV export available; managed backup not configured in demo.",
      },
    ],
    organizationSettings: [
      {
        id: "org-main",
        name: "Northstar Learning Operations",
        category: "Workspace governance",
        status: "active",
        owner: "Maya Chen",
        operatingCalendar: "Autumn 2026",
      },
    ],
    integrations: [
      {
        id: "int-sis",
        name: "Student information system connector",
        system: "SIS",
        status: "draft",
        owner: "Maya Chen",
        readiness: "attention",
        credentialsConfigured: false,
        mappingApproved: true,
        syncRuns: [],
        syncQueue: [
          {
            id: "sync-queue-sis",
            status: "pending",
            purpose: "Validate readiness",
            enqueuedAt: now,
          },
        ],
      },
    ],
    automations: [
      {
        id: "auto-attendance",
        name: "Attendance intervention routing",
        trigger: "Attendance KPI warning",
        status: "active",
        owner: "Maya Chen",
        approvalRequired: true,
        runs: [],
      },
    ],
    collaboration: [
      {
        id: "collab-attendance",
        subject: "Attendance intervention handoff",
        linkedType: "incidents",
        linkedId: "inc-attendance",
        owner: "Priya Nair",
        status: "open",
        note: "Attach learner contact outcome before closure.",
      },
    ],
    privacy: [
      {
        id: "priv-retention",
        title: "Annual retention policy review",
        requestType: "retention_review",
        status: "verifying",
        owner: "Maya Chen",
        consentState: "synthetic demo data only",
      },
    ],
    plans: [
      {
        id: "plan-autumn",
        name: "Autumn delivery capacity plan",
        domain: "Sessions and instructors",
        horizon: "Autumn 2026",
        status: "active",
        owner: "Maya Chen",
        forecast: "160 learner seats",
        actual: "112 learner seats",
      },
    ],
    resilience: [
      {
        id: "res-backup",
        title: "Local export and restore rehearsal",
        control: "Backup/restore readiness",
        status: "healthy",
        owner: "Maya Chen",
      },
    ],
    releases: [
      {
        id: "rel-desktop",
        name: "Windows desktop operational release",
        version: "1.1.0",
        status: "ready_for_review",
        owner: "Maya Chen",
      },
    ],
    reconciliations: [
      {
        id: "recon-lms",
        title: "LMS activity mapping reconciliation",
        integrationId: "int-lms",
        status: "open",
        owner: "Priya Nair",
        issue: "Engagement identifier is not mapped to a student record.",
      },
    ],
    securityControls: [
      {
        id: "sec-access",
        name: "Quarterly privileged-access review",
        domain: "Access control",
        status: "active",
        owner: "Maya Chen",
        evidence: "Role matrix verified.",
      },
    ],
    dashboards: [
      {
        id: "dash-exec",
        name: "Executive delivery health",
        audience: "Operations leadership",
        status: "active",
        owner: "Maya Chen",
        widgets: ["KPI status", "Capacity plan"],
      },
    ],
    explorations: [
      {
        id: "explore-capacity",
        name: "Autumn capacity variance exploration",
        metric: "Scheduled learner seats",
        scope: "Autumn capacity plan",
        owner: "Maya Chen",
        insight: "Contingency remains positive.",
      },
    ],
    diagnostics: [
      {
        id: "diag-workspace",
        name: "Local workspace diagnostics bundle",
        category: "Desktop state",
        status: "ready",
        owner: "Maya Chen",
        summary: "No personal data payload.",
      },
    ],
    serviceReviews: [
      {
        id: "review-september",
        title: "September operational service review",
        period: "September 2026",
        status: "scheduled",
        owner: "Maya Chen",
      },
    ],
    programs: [
      {
        id: "prog-data",
        name: "Data Analytics",
        status: "active",
        owner: "Maya Chen",
        deliveryModel: "Hybrid",
      },
    ],
    cohorts: [
      {
        id: "cohort-autumn-data",
        name: "Autumn 2026 Data Analytics",
        programId: "prog-data",
        status: "active",
        owner: "Priya Nair",
      },
    ],
    attendanceRecords: [
      {
        id: "att-liam-sql",
        studentId: "stu-liam",
        sessionId: "ses-sql",
        status: "absent",
        recordedAt: now,
      },
    ],
    cancellations: [
      {
        id: "can-cloud",
        sessionId: "ses-cloud",
        reason: "Instructor availability change",
        status: "reviewed",
        recordedAt: now,
      },
    ],
    feedback: [
      {
        id: "fb-crit",
        sessionId: "ses-crit",
        source: "Synthetic learner pulse",
        status: "verified",
        recordedAt: now,
        rating: 5,
      },
    ],
    transcripts: [
      {
        id: "tr-crit",
        sessionId: "ses-crit",
        source: "Synthetic transcript",
        status: "verified",
        capturedAt: now,
        permittedForEvaluation: true,
      },
    ],
    rubrics: [
      {
        id: "rubric-session-quality",
        name: "Evidence-linked session coaching",
        status: "active",
        owner: "Maya Chen",
        activeVersion: 1,
        versions: [
          {
            version: 1,
            criteria: [
              { id: "criterion-evidence", label: "Uses learner evidence" },
            ],
          },
        ],
      },
    ],
    evaluations: [
      {
        id: "eval-crit",
        sessionId: "ses-crit",
        rubricId: "rubric-session-quality",
        rubricVersion: 1,
        status: "pending_calibration",
        owner: "Elena Voss",
        transcriptId: "tr-crit",
        findings: "Evidence prepared; human calibration required.",
      },
    ],
    datasets: [
      {
        id: "dataset-attendance",
        name: "Attendance roster sample",
        sourceType: "CSV",
        status: "committed",
        owner: "Maya Chen",
        profile: { rows: 2, missingRequired: 0 },
        mapping: { student_email: "student.email" },
      },
    ],
    analystRuns: [
      {
        id: "analyst-attendance",
        question: "What should the team do about attendance?",
        scope: "Autumn Data Analytics",
        status: "safe_failure",
        requestedBy: "Maya Chen",
        sourceIds: ["kpi-attendance"],
        limitations: ["Local provider not configured."],
        recommendation: "Validate learner contact outcome.",
      },
    ],
    businessReviews: [
      {
        id: "review-weekly-ops",
        title: "Weekly operational business review",
        period: "Aug 31 – Sep 07",
        status: "awaiting_approval",
        owner: "Maya Chen",
        metricSources: ["kpi-attendance"],
        canonicalMetrics: [{ id: "kpi-attendance", actual: 89, target: 92 }],
      },
    ],
    audit: [
      {
        id: "audit-1",
        timestamp: now,
        userName: "Maya Chen",
        userRole: "manager",
        action: "ANOMALY_FLAGGED",
        entityType: "anomalies",
        entityId: "ano-attendance",
        summary: "Flagged attendance variance for analyst review",
        changes: { expected: 92, actual: 86 },
        correlationId: "corr-demo",
      },
    ],
  };
}
