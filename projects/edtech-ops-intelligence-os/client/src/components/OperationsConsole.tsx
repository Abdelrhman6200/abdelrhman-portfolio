// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  Database,
  Download,
  FileClock,
  FileSearch,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Upload,
  Users,
  X,
  ClipboardCheck,
  UserRoundCog,
  CircleDotDashed,
  Clock3,
  Eye,
  Pencil,
  LifeBuoy,
  ListChecks,
  MessageSquare,
  SlidersHorizontal,
  LockKeyhole,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  OpsRecord,
  OpsState,
  average,
  fallbackState,
  formatDate,
  humanize,
  numberFields,
} from "@/lib/ops";
import {
  EnhancedDetailDrawer,
  EnhancedDomainWorkspace,
} from "./EnhancedWorkspaces";
import { PRDWorkflowDrawer } from "./PRDWorkflowDrawer";

type ModuleKey =
  | "tower"
  | "students"
  | "programs"
  | "cohorts"
  | "instructors"
  | "sessions"
  | "attendanceRecords"
  | "cancellations"
  | "feedback"
  | "transcripts"
  | "incidents"
  | "onboarding"
  | "actions"
  | "communications"
  | "kpis"
  | "anomalies"
  | "quality"
  | "notifications"
  | "imports"
  | "datasets"
  | "reports"
  | "businessReviews"
  | "analyst"
  | "sops"
  | "rubrics"
  | "evaluations"
  | "analyses"
  | "organization"
  | "integrations"
  | "automations"
  | "collaboration"
  | "privacy"
  | "plans"
  | "resilience"
  | "releases"
  | "reconciliations"
  | "security"
  | "dashboards"
  | "explorations"
  | "diagnostics"
  | "serviceReviews"
  | "settings"
  | "support"
  | "audit";
type FormField = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "datetime-local" | "select";
  options?: string[];
  required?: boolean;
};
type OpsDraft = { id?: string; [key: string]: any };

const navigation: {
  key: ModuleKey;
  label: string;
  icon: any;
  group: string;
}[] = [
  {
    key: "tower",
    label: "Control Tower",
    icon: LayoutDashboard,
    group: "Command center",
  },
  {
    key: "students",
    label: "Students",
    icon: GraduationCap,
    group: "Operations",
  },
  { key: "programs", label: "Programs", icon: BookOpen, group: "Operations" },
  { key: "cohorts", label: "Cohorts", icon: Users, group: "Operations" },
  {
    key: "instructors",
    label: "Instructors",
    icon: Users,
    group: "Operations",
  },
  {
    key: "sessions",
    label: "Sessions",
    icon: CalendarClock,
    group: "Operations",
  },
  {
    key: "attendanceRecords",
    label: "Attendance Records",
    icon: ClipboardCheck,
    group: "Operations",
  },
  {
    key: "cancellations",
    label: "Cancellations",
    icon: TriangleAlert,
    group: "Operations",
  },
  {
    key: "feedback",
    label: "Learner Feedback",
    icon: MessageSquare,
    group: "Operations",
  },
  {
    key: "transcripts",
    label: "Session Transcripts",
    icon: FileSearch,
    group: "Operations",
  },
  {
    key: "incidents",
    label: "Incidents",
    icon: TriangleAlert,
    group: "Operations",
  },
  {
    key: "onboarding",
    label: "Activation",
    icon: ClipboardCheck,
    group: "Operations",
  },
  {
    key: "actions",
    label: "Decision Queue",
    icon: ListChecks,
    group: "Operations",
  },
  {
    key: "communications",
    label: "Follow-up Log",
    icon: MessageSquare,
    group: "Operations",
  },
  {
    key: "collaboration",
    label: "Team Handoffs",
    icon: Users,
    group: "Operations",
  },
  { key: "kpis", label: "KPI Library", icon: BarChart3, group: "Intelligence" },
  {
    key: "anomalies",
    label: "Anomaly Feed",
    icon: Activity,
    group: "Intelligence",
  },
  {
    key: "quality",
    label: "Data Quality",
    icon: Database,
    group: "Intelligence",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
    group: "Intelligence",
  },
  {
    key: "imports",
    label: "Import Center",
    icon: Upload,
    group: "Intelligence",
  },
  { key: "datasets", label: "Datasets", icon: Database, group: "Intelligence" },
  {
    key: "reports",
    label: "Reports",
    icon: FileBarChart,
    group: "Intelligence",
  },
  {
    key: "businessReviews",
    label: "Business Reviews",
    icon: ClipboardCheck,
    group: "Intelligence",
  },
  { key: "analyst", label: "AI Analyst", icon: Bot, group: "Intelligence" },
  {
    key: "integrations",
    label: "Integrations",
    icon: Bot,
    group: "Intelligence",
  },
  {
    key: "reconciliations",
    label: "Reconciliation",
    icon: RefreshCw,
    group: "Intelligence",
  },
  {
    key: "automations",
    label: "Automation",
    icon: Sparkles,
    group: "Intelligence",
  },
  {
    key: "plans",
    label: "Capacity Plans",
    icon: FileBarChart,
    group: "Intelligence",
  },
  {
    key: "dashboards",
    label: "Dashboards",
    icon: LayoutDashboard,
    group: "Intelligence",
  },
  {
    key: "explorations",
    label: "Metric Explorer",
    icon: FileSearch,
    group: "Intelligence",
  },
  { key: "sops", label: "SOP Library", icon: BookOpen, group: "Knowledge" },
  {
    key: "rubrics",
    label: "Evaluation Rubrics",
    icon: ClipboardCheck,
    group: "Knowledge",
  },
  {
    key: "evaluations",
    label: "Session Evaluations",
    icon: FileSearch,
    group: "Knowledge",
  },
  {
    key: "analyses",
    label: "Saved Analyses",
    icon: FileSearch,
    group: "Knowledge",
  },
  { key: "audit", label: "Audit Log", icon: ShieldCheck, group: "Governance" },
  {
    key: "organization",
    label: "Organization",
    icon: Settings2,
    group: "Governance",
  },
  {
    key: "privacy",
    label: "Privacy & Compliance",
    icon: ShieldCheck,
    group: "Governance",
  },
  {
    key: "security",
    label: "Security Controls",
    icon: LockKeyhole,
    group: "Governance",
  },
  {
    key: "resilience",
    label: "Resilience",
    icon: AlertCircle,
    group: "Governance",
  },
  {
    key: "diagnostics",
    label: "Diagnostics",
    icon: Activity,
    group: "Governance",
  },
  {
    key: "serviceReviews",
    label: "Service Reviews",
    icon: ClipboardCheck,
    group: "Governance",
  },
  {
    key: "releases",
    label: "Release Controls",
    icon: CheckCircle2,
    group: "Governance",
  },
  {
    key: "settings",
    label: "Workspace Settings",
    icon: SlidersHorizontal,
    group: "Governance",
  },
  {
    key: "support",
    label: "Supportability",
    icon: LifeBuoy,
    group: "Governance",
  },
];

const moduleMeta: Record<
  Exclude<ModuleKey, "tower" | "audit">,
  {
    title: string;
    description: string;
    entity: string;
    createLabel: string;
    fields: FormField[];
  }
> = {
  students: {
    title: "Student lifecycle",
    description:
      "Enrollment, progress, risk, and cohort visibility with intervention-ready detail.",
    entity: "students",
    createLabel: "Add student",
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "email", label: "Email" },
      { key: "cohort", label: "Cohort", required: true },
      { key: "program", label: "Program", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["active", "at_risk", "paused", "completed"],
        required: true,
      },
      { key: "progress", label: "Progress (%)", type: "number" },
      { key: "attendance", label: "Attendance (%)", type: "number" },
      {
        key: "risk",
        label: "Risk",
        type: "select",
        options: ["low", "medium", "high"],
      },
      { key: "mentor", label: "Mentor" },
    ],
  },
  programs: {
    title: "Canonical programs",
    description:
      "Govern the durable program catalogue used by cohorts, learners, sessions, KPI interpretation, and operating reviews.",
    entity: "programs",
    createLabel: "Add program",
    fields: [
      { key: "name", label: "Program name", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["draft", "active", "retired"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "deliveryModel", label: "Delivery model" },
      { key: "durationWeeks", label: "Duration (weeks)", type: "number" },
    ],
  },
  cohorts: {
    title: "Canonical cohorts",
    description:
      "Maintain the operational cohort ledger, responsible owner, program relationship, start date, and learner count.",
    entity: "cohorts",
    createLabel: "Add cohort",
    fields: [
      { key: "name", label: "Cohort name", required: true },
      { key: "programId", label: "Program ID", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["planned", "active", "completed", "retired"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "startAt", label: "Start date", type: "datetime-local" },
      { key: "learnerCount", label: "Learner count", type: "number" },
    ],
  },
  instructors: {
    title: "Instructor overview",
    description:
      "Availability, load, performance signals, and instructor-linked incident history.",
    entity: "instructors",
    createLabel: "Add instructor",
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "email", label: "Email" },
      { key: "specialty", label: "Specialty", required: true },
      {
        key: "status",
        label: "Availability status",
        type: "select",
        options: ["active", "limited", "inactive"],
        required: true,
      },
      { key: "availability", label: "Availability schedule" },
      { key: "rating", label: "Performance rating", type: "number" },
      { key: "sessionLoad", label: "Session load", type: "number" },
    ],
  },
  sessions: {
    title: "Session operations",
    description:
      "Schedule delivery, attendance capture, and outcome logging without leaving the workspace.",
    entity: "sessions",
    createLabel: "Create session",
    fields: [
      { key: "title", label: "Session title", required: true },
      { key: "course", label: "Course", required: true },
      { key: "instructorId", label: "Instructor ID", required: true },
      {
        key: "startAt",
        label: "Starts",
        type: "datetime-local",
        required: true,
      },
      { key: "duration", label: "Duration (minutes)", type: "number" },
      { key: "room", label: "Room / delivery channel" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["planned", "confirmed", "completed", "cancelled"],
        required: true,
      },
      { key: "attendanceRate", label: "Attendance rate (%)", type: "number" },
      { key: "outcomes", label: "Outcome log", type: "textarea" },
    ],
  },
  attendanceRecords: {
    title: "Attendance evidence",
    description:
      "Inspect durable attendance records with source lineage, session relationship, learner relationship, and time of capture.",
    entity: "attendanceRecords",
    createLabel: "Record attendance",
    fields: [
      { key: "studentId", label: "Student ID", required: true },
      { key: "sessionId", label: "Session ID", required: true },
      {
        key: "status",
        label: "Attendance",
        type: "select",
        options: ["present", "absent", "late", "excused"],
        required: true,
      },
      {
        key: "recordedAt",
        label: "Recorded at",
        type: "datetime-local",
        required: true,
      },
      { key: "sourceId", label: "Dataset source ID" },
    ],
  },
  cancellations: {
    title: "Session cancellation ledger",
    description:
      "Retain cancellation reasons, review state, session linkage, timestamp, and source lineage as operational evidence.",
    entity: "cancellations",
    createLabel: "Record cancellation",
    fields: [
      { key: "sessionId", label: "Session ID", required: true },
      {
        key: "reason",
        label: "Cancellation reason",
        type: "textarea",
        required: true,
      },
      {
        key: "status",
        label: "Review state",
        type: "select",
        options: ["recorded", "reviewed", "resolved"],
        required: true,
      },
      {
        key: "recordedAt",
        label: "Recorded at",
        type: "datetime-local",
        required: true,
      },
      { key: "sourceId", label: "Dataset source ID" },
    ],
  },
  feedback: {
    title: "Learner feedback evidence",
    description:
      "Review feedback sources, delivery context, verification state, captured evidence, and source timestamps without conflating feedback with evaluation scores.",
    entity: "feedback",
    createLabel: "Record feedback",
    fields: [
      { key: "sessionId", label: "Session ID", required: true },
      { key: "source", label: "Feedback source", required: true },
      {
        key: "status",
        label: "Verification state",
        type: "select",
        options: ["received", "verified", "excluded"],
        required: true,
      },
      {
        key: "recordedAt",
        label: "Recorded at",
        type: "datetime-local",
        required: true,
      },
      { key: "rating", label: "Rating", type: "number" },
      { key: "evidence", label: "Feedback evidence", type: "textarea" },
    ],
  },
  transcripts: {
    title: "Session transcript evidence",
    description:
      "Maintain permitted session transcripts as durable evidence with explicit source, capture time, and evaluation-use boundary.",
    entity: "transcripts",
    createLabel: "Register transcript",
    fields: [
      { key: "sessionId", label: "Session ID", required: true },
      { key: "source", label: "Transcript source", required: true },
      {
        key: "status",
        label: "Verification state",
        type: "select",
        options: ["captured", "verified", "restricted"],
        required: true,
      },
      {
        key: "capturedAt",
        label: "Captured at",
        type: "datetime-local",
        required: true,
      },
      {
        key: "permittedForEvaluation",
        label: "Permitted for evaluation",
        type: "select",
        options: ["true", "false"],
      },
      { key: "text", label: "Transcript excerpt", type: "textarea" },
    ],
  },
  incidents: {
    title: "Incident management",
    description:
      "Triage, assignment, escalation, resolution, and accountability across operational exceptions.",
    entity: "incidents",
    createLabel: "Log incident",
    fields: [
      { key: "title", label: "Incident title", required: true },
      {
        key: "type",
        label: "Incident type",
        type: "select",
        options: [
          "engagement",
          "platform",
          "scheduling",
          "safeguarding",
          "data",
        ],
        required: true,
      },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: ["low", "medium", "high", "critical"],
        required: true,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["new", "triaged", "investigating", "escalated", "resolved"],
        required: true,
      },
      { key: "assignee", label: "Assignee" },
      {
        key: "description",
        label: "Observed facts",
        type: "textarea",
        required: true,
      },
      { key: "rootCause", label: "Root-cause notes", type: "textarea" },
      { key: "resolution", label: "Resolution", type: "textarea" },
    ],
  },
  kpis: {
    title: "KPI definition and tracking",
    description:
      "Governed metric definitions with targets, thresholds, accountable owners, and inspectable actuals.",
    entity: "kpis",
    createLabel: "Define KPI",
    fields: [
      { key: "name", label: "KPI name", required: true },
      { key: "domain", label: "Operational domain", required: true },
      { key: "unit", label: "Unit", required: true },
      { key: "target", label: "Target", type: "number", required: true },
      { key: "warningThreshold", label: "Warning threshold", type: "number" },
      { key: "owner", label: "Metric owner", required: true },
      { key: "definition", label: "Definition", type: "textarea" },
    ],
  },
  anomalies: {
    title: "Anomaly investigation",
    description:
      "Evidence-backed abnormal signals with drill-down context, root-cause notes, and resolution control.",
    entity: "anomalies",
    createLabel: "Log anomaly",
    fields: [
      { key: "title", label: "Anomaly title", required: true },
      { key: "domain", label: "Domain", required: true },
      { key: "metric", label: "Metric", required: true },
      { key: "expected", label: "Expected value", type: "number" },
      { key: "actual", label: "Actual value", type: "number" },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: ["low", "medium", "high", "critical"],
        required: true,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["flagged", "investigating", "resolved", "dismissed"],
        required: true,
      },
      { key: "context", label: "Drill-down context", type: "textarea" },
      { key: "rootCause", label: "Root-cause notes", type: "textarea" },
    ],
  },
  quality: {
    title: "Data quality monitoring",
    description:
      "Completeness, accuracy, freshness, issue records, and owners by operational domain.",
    entity: "quality",
    createLabel: "Add domain score",
    fields: [
      { key: "domain", label: "Domain", required: true },
      {
        key: "completeness",
        label: "Completeness (%)",
        type: "number",
        required: true,
      },
      {
        key: "accuracy",
        label: "Accuracy (%)",
        type: "number",
        required: true,
      },
      {
        key: "freshness",
        label: "Freshness (%)",
        type: "number",
        required: true,
      },
      { key: "owner", label: "Owner" },
      {
        key: "status",
        label: "Health status",
        type: "select",
        options: ["healthy", "attention", "critical"],
      },
    ],
  },
  sops: {
    title: "SOP library",
    description:
      "Searchable, versioned operating procedures linked to incident types and operational domains.",
    entity: "sops",
    createLabel: "Create SOP",
    fields: [
      { key: "title", label: "SOP title", required: true },
      { key: "domain", label: "Linked domain", required: true },
      { key: "incidentType", label: "Linked incident type" },
      { key: "body", label: "Procedure body", type: "textarea" },
    ],
  },
  rubrics: {
    title: "Versioned evaluation rubrics",
    description:
      "Maintain evidence-linked session evaluation criteria, version history, and human calibration boundaries without opaque instructor scoring.",
    entity: "rubrics",
    createLabel: "Create rubric",
    fields: [
      { key: "name", label: "Rubric name", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["draft", "active", "retired"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
    ],
  },
  evaluations: {
    title: "Evidence-linked session evaluations",
    description:
      "Prepare transcript-grounded rubric evidence, retain the active rubric version, expose limitations, and require human calibration before approval.",
    entity: "evaluations",
    createLabel: "Prepare evaluation",
    fields: [
      { key: "sessionId", label: "Session ID", required: true },
      { key: "rubricId", label: "Active rubric ID", required: true },
    ],
  },
  analyses: {
    title: "Saved analyses",
    description:
      "Reusable, named operational analyses with parameters, data range, results, and provenance.",
    entity: "analyses",
    createLabel: "Save analysis",
    fields: [
      { key: "name", label: "Analysis name", required: true },
      { key: "scope", label: "Scope", required: true },
      { key: "parameters", label: "Parameters", type: "textarea" },
      { key: "dataRange", label: "Data range" },
      {
        key: "summary",
        label: "Evidence-based summary",
        type: "textarea",
        required: true,
      },
    ],
  },
  onboarding: {
    title: "Role activation",
    description:
      "Role-based activation checklists ensure operators understand owned thresholds, handoffs, sources, and escalation obligations before working live queues.",
    entity: "onboarding",
    createLabel: "Create checklist",
    fields: [
      { key: "title", label: "Checklist title", required: true },
      {
        key: "role",
        label: "Assigned role",
        type: "select",
        options: ["admin", "manager", "coordinator", "analyst"],
        required: true,
      },
      {
        key: "status",
        label: "Activation state",
        type: "select",
        options: ["not_started", "in_progress", "complete"],
        required: true,
      },
      { key: "owner", label: "Checklist owner" },
    ],
  },
  actions: {
    title: "Decision and follow-through queue",
    description:
      "Assign accountable actions, manage due dates, capture approval states, and close the loop on operational signals.",
    entity: "actions",
    createLabel: "Create action",
    fields: [
      { key: "title", label: "Action title", required: true },
      { key: "owner", label: "Accountable owner", required: true },
      { key: "dueAt", label: "Due at", type: "datetime-local", required: true },
      {
        key: "status",
        label: "Workflow state",
        type: "select",
        options: [
          "new",
          "assigned",
          "in_progress",
          "awaiting_approval",
          "completed",
          "cancelled",
        ],
        required: true,
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: ["low", "medium", "high", "critical"],
      },
      { key: "linkedType", label: "Linked record type" },
      { key: "linkedId", label: "Linked record ID" },
      { key: "description", label: "Expected outcome", type: "textarea" },
    ],
  },
  communications: {
    title: "Communication and follow-up log",
    description:
      "Keep outreach, ownership, outcomes, and linked operational context visible for the next operator.",
    entity: "communications",
    createLabel: "Log communication",
    fields: [
      { key: "subject", label: "Subject", required: true },
      {
        key: "channel",
        label: "Channel",
        type: "select",
        options: ["email", "phone", "in_app", "meeting"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      {
        key: "outcome",
        label: "Outcome",
        type: "select",
        options: ["awaiting_reply", "completed", "escalated", "no_response"],
        required: true,
      },
      { key: "linkedType", label: "Linked record type" },
      { key: "linkedId", label: "Linked record ID" },
      { key: "summary", label: "Interaction summary", type: "textarea" },
    ],
  },
  notifications: {
    title: "Notification center",
    description:
      "Manage in-app operational reminders, approval prompts, source alerts, and their delivery state.",
    entity: "notifications",
    createLabel: "Create notification",
    fields: [
      { key: "title", label: "Notification title", required: true },
      {
        key: "channel",
        label: "Channel",
        type: "select",
        options: ["in_app", "email_ready"],
        required: true,
      },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["unread", "read", "dismissed"],
        required: true,
      },
      { key: "audience", label: "Audience" },
      { key: "dueAt", label: "Response due", type: "datetime-local" },
      { key: "body", label: "Message", type: "textarea" },
    ],
  },
  imports: {
    title: "Data import control center",
    description:
      "Register source exports, retain mapping and duplicate policy metadata, capture validation outcomes, and route remediation work.",
    entity: "imports",
    createLabel: "Register source",
    fields: [
      { key: "name", label: "Source name", required: true },
      { key: "sourceType", label: "Source type", required: true },
      {
        key: "status",
        label: "Source health",
        type: "select",
        options: ["healthy", "attention", "paused", "failed"],
        required: true,
      },
      { key: "mappingTemplate", label: "Mapping template" },
      { key: "duplicatePolicy", label: "Duplicate policy" },
      { key: "owner", label: "Source owner" },
      {
        key: "validationSummary",
        label: "Validation summary",
        type: "textarea",
      },
    ],
  },
  datasets: {
    title: "Governed datasets",
    description:
      "Profile source schemas, inspect required-field coverage, preserve source lineage, and commit normalized records only after mapping review.",
    entity: "datasets",
    createLabel: "Profile student CSV",
    fields: [
      { key: "name", label: "Dataset name", required: true },
      {
        key: "csvText",
        label: "Student CSV",
        type: "textarea",
        required: true,
      },
    ],
  },
  reports: {
    title: "Reporting center",
    description:
      "Maintain repeatable operational report definitions with scope, parameters, ownership, and generation state.",
    entity: "reports",
    createLabel: "Define report",
    fields: [
      { key: "name", label: "Report name", required: true },
      { key: "scope", label: "Scope", required: true },
      {
        key: "status",
        label: "Report state",
        type: "select",
        options: ["draft", "ready", "archived"],
        required: true,
      },
      { key: "owner", label: "Report owner" },
      { key: "parameters", label: "Parameter definition", type: "textarea" },
      { key: "definition", label: "Report definition", type: "textarea" },
    ],
  },
  businessReviews: {
    title: "Canonical business reviews",
    description:
      "Generate weekly or monthly reviews from published metric definitions, source records, action queues, and explicit approval state.",
    entity: "businessReviews",
    createLabel: "Generate business review",
    fields: [{ key: "period", label: "Review period", required: true }],
  },
  analyst: {
    title: "Grounded operations analyst",
    description:
      "Ask read-only questions over authorized operational evidence. Every run preserves scope, sources, observed facts, interpretations, hypotheses, limitations, and a recommended next step.",
    entity: "analystRuns",
    createLabel: "Request grounded run",
    fields: [
      { key: "question", label: "Question", required: true },
      { key: "scope", label: "Authorized scope", required: true },
    ],
  },
  organization: {
    title: "Organization and workspace governance",
    description:
      "Manage team directory, operating calendar, role matrix, reference data, and policy ownership for the operational workspace.",
    entity: "organizationSettings",
    createLabel: "Add organization setting",
    fields: [
      { key: "name", label: "Organization or workspace name", required: true },
      { key: "category", label: "Governance category", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["active", "draft", "retired"],
        required: true,
      },
      { key: "owner", label: "Policy owner" },
      { key: "operatingCalendar", label: "Operating calendar" },
      { key: "roleMatrix", label: "Role matrix", type: "textarea" },
      { key: "referenceData", label: "Reference data", type: "textarea" },
    ],
  },
  integrations: {
    title: "Integration control plane",
    description:
      "Register external systems, establish readiness evidence, govern mappings, document retries and lineage, and retain validation history before production connection.",
    entity: "integrations",
    createLabel: "Register integration",
    fields: [
      { key: "name", label: "Integration name", required: true },
      {
        key: "system",
        label: "System",
        type: "select",
        options: ["SIS", "LMS"],
        required: true,
      },
      {
        key: "status",
        label: "Lifecycle state",
        type: "select",
        options: ["draft", "ready", "paused", "retired"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "credentialRef", label: "Credential reference", required: true },
      {
        key: "credentialsConfigured",
        label: "Credential reference verified",
        type: "select",
        options: ["true", "false"],
      },
      {
        key: "mappingApproved",
        label: "Mapping approved",
        type: "select",
        options: ["true", "false"],
      },
      {
        key: "syncMode",
        label: "Sync mode",
        type: "select",
        options: ["offline_safe", "live"],
      },
      {
        key: "offlineSafe",
        label: "Offline-safe execution",
        type: "select",
        options: ["true", "false"],
      },
      { key: "retryPolicy", label: "Retry policy" },
      { key: "lineage", label: "Data lineage", type: "textarea" },
    ],
  },
  automations: {
    title: "Workflow automation",
    description:
      "Define governed operational triggers, conditions, actions, approval checkpoints, escalation behavior, and attributable run records.",
    entity: "automations",
    createLabel: "Create automation",
    fields: [
      { key: "name", label: "Automation name", required: true },
      { key: "trigger", label: "Trigger", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["active", "paused", "draft"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "condition", label: "Condition", type: "textarea" },
      { key: "actions", label: "Actions", type: "textarea" },
      {
        key: "approvalRequired",
        label: "Approval required",
        type: "select",
        options: ["true", "false"],
      },
    ],
  },
  collaboration: {
    title: "Collaboration and handoffs",
    description:
      "Link internal notes, mentions, accountability, due dates, handoff history, and evidence metadata to operational records.",
    entity: "collaboration",
    createLabel: "Log handoff",
    fields: [
      { key: "subject", label: "Subject", required: true },
      { key: "linkedType", label: "Linked record type", required: true },
      { key: "linkedId", label: "Linked record ID", required: true },
      { key: "owner", label: "Owner", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["open", "in_progress", "closed"],
        required: true,
      },
      { key: "handoffTo", label: "Handoff to" },
      { key: "mentions", label: "Mentions" },
      { key: "note", label: "Secure internal note", type: "textarea" },
      { key: "evidenceMetadata", label: "Evidence metadata", type: "textarea" },
    ],
  },
  privacy: {
    title: "Privacy and compliance operations",
    description:
      "Track consent context, retention review, subject export/delete requests, access reviews, control evidence, and accountable fulfilment.",
    entity: "privacy",
    createLabel: "Log privacy request",
    fields: [
      { key: "title", label: "Request or review title", required: true },
      {
        key: "requestType",
        label: "Request type",
        type: "select",
        options: [
          "access_request",
          "export_request",
          "delete_request",
          "retention_review",
          "access_review",
        ],
        required: true,
      },
      {
        key: "status",
        label: "Workflow state",
        type: "select",
        options: [
          "received",
          "verifying",
          "fulfilling",
          "awaiting_approval",
          "rejected",
          "closed",
        ],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "subjectReference", label: "Subject reference" },
      { key: "consentState", label: "Consent state" },
      { key: "evidence", label: "Control evidence", type: "textarea" },
    ],
  },
  plans: {
    title: "Operational planning and scenarios",
    description:
      "Capture forecast assumptions, capacity scenarios, plan-versus-actual comparisons, target reviews, and accountable operational planning.",
    entity: "plans",
    createLabel: "Create plan",
    fields: [
      { key: "name", label: "Plan name", required: true },
      { key: "domain", label: "Domain", required: true },
      { key: "horizon", label: "Planning horizon", required: true },
      { key: "owner", label: "Owner", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["draft", "active", "archived"],
        required: true,
      },
      { key: "assumptions", label: "Assumptions", type: "textarea" },
      { key: "forecast", label: "Forecast", type: "textarea" },
      { key: "actual", label: "Actual", type: "textarea" },
    ],
  },
  resilience: {
    title: "Reliability and resilience",
    description:
      "Record health monitoring, backup and restore evidence, diagnostic readiness, incident communications, and recurring service reviews.",
    entity: "resilience",
    createLabel: "Add resilience control",
    fields: [
      { key: "title", label: "Control title", required: true },
      { key: "control", label: "Control area", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["healthy", "attention", "critical", "open"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "cadence", label: "Review cadence" },
      { key: "evidence", label: "Evidence", type: "textarea" },
      { key: "nextReviewAt", label: "Next review", type: "datetime-local" },
    ],
  },
  releases: {
    title: "Release readiness controls",
    description:
      "Prepare configuration verification, test evidence, approval, rollback readiness, and release sign-off before distributing the desktop application.",
    entity: "releases",
    createLabel: "Create release control",
    fields: [
      { key: "name", label: "Release name", required: true },
      { key: "version", label: "Version", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: [
          "draft",
          "ready_for_review",
          "approved",
          "released",
          "cancelled",
        ],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      {
        key: "configurationCheck",
        label: "Configuration verification",
        type: "textarea",
      },
      { key: "testEvidence", label: "Test evidence", type: "textarea" },
      { key: "rollbackPlan", label: "Rollback plan", type: "textarea" },
    ],
  },
  reconciliations: {
    title: "Integration reconciliation",
    description:
      "Resolve failed or partial connector data safely through accountable mapping review, sample validation, approval, and evidence-backed closure.",
    entity: "reconciliations",
    createLabel: "Log reconciliation",
    fields: [
      { key: "title", label: "Reconciliation title", required: true },
      { key: "integrationId", label: "Integration ID", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: [
          "open",
          "investigating",
          "awaiting_approval",
          "resolved",
          "cancelled",
        ],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      {
        key: "issue",
        label: "Observed mapping or source issue",
        type: "textarea",
      },
      {
        key: "proposedResolution",
        label: "Proposed resolution",
        type: "textarea",
      },
    ],
  },
  security: {
    title: "Security and compliance controls",
    description:
      "Track access, audit, retention, and monitoring controls with evidence, cadence, accountable ownership, and auditable export readiness.",
    entity: "securityControls",
    createLabel: "Add security control",
    fields: [
      { key: "name", label: "Control name", required: true },
      { key: "domain", label: "Control domain", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["draft", "active", "attention", "retired"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "cadence", label: "Review cadence" },
      { key: "evidence", label: "Control evidence", type: "textarea" },
    ],
  },
  dashboards: {
    title: "Dashboard composer",
    description:
      "Define decision-focused dashboard views, audiences, shared access, and operational widgets across the command center's governed metrics.",
    entity: "dashboards",
    createLabel: "Create dashboard",
    fields: [
      { key: "name", label: "Dashboard name", required: true },
      { key: "audience", label: "Audience", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["draft", "active", "archived"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "widgets", label: "Widgets", type: "textarea" },
      { key: "sharedWith", label: "Shared with", type: "textarea" },
    ],
  },
  explorations: {
    title: "Metric exploration",
    description:
      "Persist metric questions, dimensions, assumptions, scope, evidence-led insight, and planning links for repeatable operational analysis.",
    entity: "explorations",
    createLabel: "Create exploration",
    fields: [
      { key: "name", label: "Exploration name", required: true },
      { key: "metric", label: "Metric", required: true },
      { key: "scope", label: "Scope", required: true },
      { key: "owner", label: "Owner", required: true },
      { key: "dimensions", label: "Dimensions" },
      { key: "insight", label: "Evidence-led insight", type: "textarea" },
    ],
  },
  diagnostics: {
    title: "Diagnostics bundles",
    description:
      "Prepare minimized operational diagnostics for support investigation without exposing raw learner data in the local desktop environment.",
    entity: "diagnostics",
    createLabel: "Create diagnostics bundle",
    fields: [
      { key: "name", label: "Bundle name", required: true },
      { key: "category", label: "Category", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["draft", "ready", "shared", "expired"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "summary", label: "Included metadata summary", type: "textarea" },
    ],
  },
  serviceReviews: {
    title: "Structured service reviews",
    description:
      "Prepare recurring operational reviews with agenda, resilience evidence, connector status, decision outcomes, and accountable follow-up.",
    entity: "serviceReviews",
    createLabel: "Schedule service review",
    fields: [
      { key: "title", label: "Review title", required: true },
      { key: "period", label: "Review period", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["scheduled", "in_progress", "completed", "cancelled"],
        required: true,
      },
      { key: "owner", label: "Owner", required: true },
      { key: "agenda", label: "Agenda", type: "textarea" },
      { key: "outcomes", label: "Outcomes", type: "textarea" },
      { key: "dueAt", label: "Due at", type: "datetime-local" },
    ],
  },
  settings: {
    title: "Workspace configuration",
    description:
      "Govern operating thresholds, source expectations, retention policy, and reference values outside application code.",
    entity: "configRecords",
    createLabel: "Add configuration",
    fields: [
      { key: "key", label: "Configuration name", required: true },
      { key: "category", label: "Category", required: true },
      { key: "value", label: "Configured value", required: true },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["active", "retired", "draft"],
        required: true,
      },
      { key: "owner", label: "Policy owner" },
      { key: "rationale", label: "Rationale", type: "textarea" },
    ],
  },
  support: {
    title: "Supportability console",
    description:
      "Track backup readiness, integration health, diagnostics, privacy-response intake, and known support obligations.",
    entity: "support",
    createLabel: "Log support check",
    fields: [
      { key: "title", label: "Check or request title", required: true },
      {
        key: "category",
        label: "Category",
        type: "select",
        options: [
          "Backup and recovery",
          "Integration health",
          "Privacy request",
          "Diagnostic",
          "Release readiness",
        ],
        required: true,
      },
      {
        key: "status",
        label: "State",
        type: "select",
        options: ["healthy", "attention", "open", "resolved"],
        required: true,
      },
      { key: "owner", label: "Owner" },
      { key: "detail", label: "Evidence and next step", type: "textarea" },
    ],
  },
};

function Badge({ value }: { value?: string }) {
  const label = String(value || "unknown").toLowerCase();
  const style =
    label.includes("high") ||
    label.includes("critical") ||
    label.includes("at_risk") ||
    label.includes("escalated")
      ? "border-rose-400/25 bg-rose-500/10 text-rose-300"
      : label.includes("medium") ||
          label.includes("attention") ||
          label.includes("flagged") ||
          label.includes("triaged") ||
          label.includes("limited")
        ? "border-amber-400/25 bg-amber-500/10 text-amber-200"
        : label.includes("resolved") ||
            label.includes("healthy") ||
            label.includes("active") ||
            label.includes("completed") ||
            label.includes("confirmed") ||
            label.includes("low")
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
          : "border-slate-500/25 bg-slate-500/10 text-slate-300";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize tracking-wide ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {humanize(label)}
    </span>
  );
}

function ActionButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={`h-9 rounded-lg text-xs font-semibold ${props.className || ""}`}
    >
      {children}
    </Button>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
}) {
  const id = `field-${field.key}`;
  return (
    <label
      className="grid gap-1.5 text-xs font-medium text-slate-300"
      htmlFor={id}
    >
      {field.label}
      {field.required ? <span className="ml-1 text-cyan-300">*</span> : null}
      {field.type === "textarea" ? (
        <Textarea
          id={id}
          value={value ?? ""}
          onChange={event => onChange(event.target.value)}
          className="min-h-24 border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-400"
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={value ?? ""}
          onChange={event => onChange(event.target.value)}
          className="h-10 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {!value ? <option value="">Select one</option> : null}
          {field.options?.map(option => (
            <option key={option} value={option}>
              {humanize(option)}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={id}
          type={field.type || "text"}
          value={
            field.type === "datetime-local" && value
              ? new Date(value).toISOString().slice(0, 16)
              : (value ?? "")
          }
          onChange={event =>
            onChange(
              field.type === "number"
                ? event.target.value
                : field.type === "datetime-local"
                  ? new Date(event.target.value).toISOString()
                  : event.target.value
            )
          }
          className="h-10 border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-400"
        />
      )}
    </label>
  );
}

function RecordDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  record,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fields: FormField[];
  record?: OpsRecord;
  onSubmit: (payload: OpsDraft) => Promise<void>;
}) {
  const [form, setForm] = useState<OpsDraft>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(record || {});
  }, [open, record]);
  const submit = async () => {
    setSaving(true);
    try {
      const payload: OpsDraft = { ...form };
      Object.keys(payload).forEach(key => {
        if (
          numberFields.has(key) &&
          payload[key] !== "" &&
          payload[key] !== undefined
        )
          payload[key] = Number(payload[key]);
      });
      await onSubmit(payload);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Could not save the record.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto border-slate-700 bg-[#101827] text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3 sm:grid-cols-2">
          {fields.map(field => (
            <div
              key={field.key}
              className={field.type === "textarea" ? "sm:col-span-2" : ""}
            >
              <Field
                field={field}
                value={form[field.key]}
                onChange={value =>
                  setForm(current => ({ ...current, [field.key]: value }))
                }
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
          <ActionButton
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </ActionButton>
          <ActionButton
            onClick={submit}
            disabled={saving}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            {record?.id ? "Save changes" : "Create record"}
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({
  label,
  value,
  note,
  trend,
  positive = true,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  trend?: string;
  positive?: boolean;
  icon: any;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#111b2e] p-5 shadow-[0_14px_45px_rgba(0,0,0,0.22)]">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-300/[0.05] blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
            {value}
          </p>
        </div>
        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/10 p-2.5 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-2 text-xs text-slate-400">
        {trend ? (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${positive ? "text-emerald-300" : "text-rose-300"}`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend}
          </span>
        ) : null}
        <span>{note}</span>
      </div>
    </div>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111b2e] shadow-[0_14px_45px_rgba(0,0,0,0.16)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}
function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-slate-800 bg-slate-950/30 text-[11px] uppercase tracking-[0.13em] text-slate-400">
      <tr>{children}</tr>
    </thead>
  );
}
function THead({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3.5 font-semibold">{children}</th>;
}

function DetailDrawer({
  record,
  module,
  state,
  onClose,
  onUpdate,
  onSopVersion,
}: {
  record: OpsRecord | null;
  module: ModuleKey;
  state: OpsState;
  onClose: () => void;
  onUpdate: (entity: string, id: string, patch: OpsDraft) => Promise<void>;
  onSopVersion: (id: string, payload: OpsDraft) => Promise<void>;
}) {
  if (
    record &&
    [
      "programs",
      "cohorts",
      "attendanceRecords",
      "cancellations",
      "feedback",
      "transcripts",
      "datasets",
      "evaluations",
      "businessReviews",
      "analyst",
    ].includes(module)
  )
    return (
      <PRDWorkflowDrawer
        record={record}
        module={module}
        state={state}
        onClose={onClose}
        onUpdate={onUpdate}
        onWorkflow={async (action: string, args: string[]) => {
          if (!window.desktopAPI)
            throw new Error(
              "Run the Windows desktop app to execute a governed workflow."
            );
          if (action === "profile")
            await window.desktopAPI.profileStudentDataset(args[0], args[1]);
          if (action === "commit")
            await window.desktopAPI.commitStudentDataset(args[0]);
          if (action === "prepareEvaluation")
            await window.desktopAPI.prepareSessionEvaluation(args[0], args[1]);
          if (action === "generateReview")
            await window.desktopAPI.generateBusinessReview(args[0]);
          window.dispatchEvent(new Event("ops-state-updated"));
          toast.success("Governed workflow completed and audited.");
        }}
      />
    );
  return (
    <EnhancedDetailDrawer
      record={record}
      module={module}
      state={state}
      onClose={onClose}
      onUpdate={onUpdate}
      onSopVersion={onSopVersion}
    />
  );
  const [rootCause, setRootCause] = useState("");
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState("");
  const [status, setStatus] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [versionSummary, setVersionSummary] = useState("");
  useEffect(() => {
    if (record) {
      setRootCause(record.rootCause || "");
      setNote(record.note || "");
      setResolution(record.resolution || "");
      setStatus(record.status || "");
      setNewVersion("");
      setVersionSummary("");
    }
  }, [record]);
  if (!record) return null;
  const isInvestigation = module === "anomalies" || module === "incidents";
  const saveInvestigation = async () => {
    await onUpdate(module, record.id, { status, rootCause, note, resolution });
    toast.success("Investigation record updated and audited.");
  };
  const students = state.students.filter(
    student => student.id === record.studentId
  );
  const instructor = state.instructors.find(
    item => item.id === record.instructorId
  );
  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-slate-700 bg-[#101827] shadow-[-22px_0_65px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
            {module === "anomalies"
              ? "Investigation workspace"
              : `${humanize(module)} detail`}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {record.name || record.title || record.domain}
          </h2>
          <div className="mt-2">
            <Badge value={record.status || record.severity || "active"} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Close detail panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <section className="grid gap-3 sm:grid-cols-2">
          {Object.entries(record)
            .filter(
              ([key, value]) =>
                ![
                  "id",
                  "rootCause",
                  "note",
                  "resolution",
                  "context",
                  "versions",
                  "actuals",
                  "issues",
                  "body",
                ].includes(key) && typeof value !== "object"
            )
            .map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-slate-800 bg-slate-950/25 p-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {humanize(key)}
                </p>
                <p className="mt-1.5 break-words text-sm text-slate-200">
                  {key.includes("At")
                    ? formatDate(String(value))
                    : String(value || "—")}
                </p>
              </div>
            ))}
        </section>
        {students.length || instructor ? (
          <section className="mt-5 rounded-xl border border-slate-800 bg-slate-950/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Linked operational records
            </p>
            {students.map(student => (
              <p key={student.id} className="mt-2 text-sm text-slate-200">
                Student:{" "}
                <span className="font-medium text-cyan-200">
                  {student.name}
                </span>
              </p>
            ))}
            {instructor ? (
              <p className="mt-2 text-sm text-slate-200">
                Instructor:{" "}
                <span className="font-medium text-cyan-200">
                  {instructor.name}
                </span>
              </p>
            ) : null}
          </section>
        ) : null}
        {record.context ? (
          <section className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">
              Drill-down evidence context
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {record.context}
            </p>
          </section>
        ) : null}
        {isInvestigation ? (
          <section className="mt-5 space-y-4 rounded-xl border border-slate-800 bg-slate-950/25 p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-300" />
              <p className="text-sm font-semibold text-slate-100">
                Investigation notes
              </p>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Record observed facts and analyst interpretation separately. The
              application retains the update in the audit trail.
            </p>
            <label className="grid gap-1.5 text-xs font-medium text-slate-300">
              Workflow state
              <select
                value={status}
                onChange={event => setStatus(event.target.value)}
                className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100"
              >
                <option value="flagged">Flagged</option>
                <option value="triaged">Triaged</option>
                <option value="investigating">Investigating</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-slate-300">
              Root-cause notes
              <Textarea
                value={rootCause}
                onChange={event => setRootCause(event.target.value)}
                className="min-h-20 border-slate-700 bg-slate-950 text-slate-100"
              />
            </label>
            {module === "anomalies" ? (
              <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                Evidence note
                <Textarea
                  value={note}
                  onChange={event => setNote(event.target.value)}
                  className="min-h-20 border-slate-700 bg-slate-950 text-slate-100"
                />
              </label>
            ) : null}
            <label className="grid gap-1.5 text-xs font-medium text-slate-300">
              Resolution or next action
              <Textarea
                value={resolution}
                onChange={event => setResolution(event.target.value)}
                className="min-h-20 border-slate-700 bg-slate-950 text-slate-100"
              />
            </label>
            <ActionButton
              onClick={saveInvestigation}
              className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Save investigation update
            </ActionButton>
          </section>
        ) : null}
        {module === "sops" ? (
          <section className="mt-5 space-y-4 rounded-xl border border-slate-800 bg-slate-950/25 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">
                Version history
              </p>
              <Badge value={`v${record.activeVersion}`} />
            </div>
            {(record.versions || [])
              .slice()
              .reverse()
              .map((version: any) => (
                <div
                  key={version.version}
                  className="rounded-lg border border-slate-800 p-3"
                >
                  <p className="text-xs font-semibold text-cyan-200">
                    Version {version.version} · {version.createdBy}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(version.createdAt)} · {version.summary}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {version.body}
                  </p>
                </div>
              ))}
            <div className="border-t border-slate-800 pt-4">
              <p className="mb-3 text-sm font-semibold text-slate-100">
                Publish a new version
              </p>
              <Textarea
                value={newVersion}
                onChange={event => setNewVersion(event.target.value)}
                placeholder="Enter the revised procedure…"
                className="min-h-24 border-slate-700 bg-slate-950 text-slate-100"
              />
              <Input
                value={versionSummary}
                onChange={event => setVersionSummary(event.target.value)}
                placeholder="Version change summary"
                className="mt-2 border-slate-700 bg-slate-950 text-slate-100"
              />
              <ActionButton
                onClick={async () => {
                  await onSopVersion(record.id, {
                    body: newVersion,
                    summary: versionSummary,
                  });
                  toast.success("New SOP version published.");
                  setNewVersion("");
                  setVersionSummary("");
                }}
                disabled={!newVersion.trim()}
                className="mt-2 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              >
                <FileClock className="mr-2 h-4 w-4" />
                Publish version
              </ActionButton>
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  );
}

export default function OperationsConsole() {
  const [state, setState] = useState<OpsState | null>(null);
  const [module, setModule] = useState<ModuleKey>("tower");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OpsRecord | undefined>();
  const [detail, setDetail] = useState<OpsRecord | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const isDesktop = Boolean(window.desktopAPI);
  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      setState(
        isDesktop ? await window.desktopAPI!.getState() : fallbackState()
      );
    } catch (cause: any) {
      setError(cause.message || "Could not open the operational workspace.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    const refreshWorkspace = () => {
      refresh();
    };
    window.addEventListener("ops-state-updated", refreshWorkspace);
    return () =>
      window.removeEventListener("ops-state-updated", refreshWorkspace);
  }, []);
  const execute = async (operation: () => Promise<any>, success: string) => {
    try {
      if (!isDesktop)
        throw new Error(
          "Run the Windows desktop app to persist workspace changes."
        );
      await operation();
      await refresh();
      toast.success(success);
    } catch (cause: any) {
      toast.error(cause.message || "Operation could not be completed.");
    }
  };
  const changeRole = async (role: string) =>
    execute(
      () => window.desktopAPI!.changeRole(role),
      `Role changed to ${role}.`
    );
  const create = async (entity: string, payload: OpsDraft) => {
    if (entity === "datasets")
      return execute(
        () =>
          window.desktopAPI!.profileStudentDataset(
            payload.name,
            payload.csvText
          ),
        "Dataset profiled and audit evidence recorded."
      );
    if (entity === "evaluations")
      return execute(
        () =>
          window.desktopAPI!.prepareSessionEvaluation(
            payload.sessionId,
            payload.rubricId
          ),
        "Evidence-linked evaluation prepared for human calibration."
      );
    if (entity === "businessReviews")
      return execute(
        () => window.desktopAPI!.generateBusinessReview(payload.period),
        "Canonical business review generated and audited."
      );
    if (entity === "analystRuns")
      return execute(
        () =>
          window.desktopAPI!.requestAnalystRun({
            question: payload.question,
            scope: payload.scope,
          }),
        "Read-only analyst run recorded with its authorized evidence scope."
      );
    return execute(
      () => window.desktopAPI!.create(entity, payload),
      "Record created and audited."
    );
  };
  const update = async (entity: string, id: string, patch: OpsDraft) =>
    execute(
      () => window.desktopAPI!.update(entity, id, patch),
      "Record updated and audited."
    );
  const remove = async (entity: string, id: string) =>
    execute(
      () => window.desktopAPI!.remove(entity, id),
      "Record deleted; immutable audit evidence retained."
    );
  const addSopVersion = async (id: string, payload: OpsDraft) =>
    execute(
      () => window.desktopAPI!.addSopVersion(id, payload),
      "SOP version published and audited."
    );
  const exportRows = async (entityType: string, rows: OpsRecord[]) =>
    execute(
      () =>
        window.desktopAPI!.exportCsv({
          entityType,
          filename: `${entityType}-export.csv`,
          rows,
        }),
      "CSV export saved and audited."
    );
  if (loading || !state)
    return (
      <div className="grid min-h-screen place-items-center bg-[#0a1020] text-slate-200">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          Loading the operations workspace…
        </div>
      </div>
    );
  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (record: OpsRecord) => {
    setEditing(record);
    setDialogOpen(true);
  };
  const filtered = (items: OpsRecord[]) =>
    items.filter(item =>
      JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
    );
  const currentNav = navigation.find(item => item.key === module)!;
  const metadata = moduleMeta[module as Exclude<ModuleKey, "tower" | "audit">];
  return (
    <div className="min-h-screen bg-[#0a1020] text-slate-100">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_92%_85%,rgba(99,102,241,0.10),transparent_27%)]" />
      <div className="relative flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-slate-800 bg-[#0d1526]/95 px-3 py-4 lg:flex">
          <div className="mb-6 flex items-center gap-3 px-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20">
              <CircleDotDashed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">
                Northstar
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                Operations OS
              </p>
            </div>
          </div>
          {[
            "Command center",
            "Operations",
            "Intelligence",
            "Knowledge",
            "Governance",
          ].map(group => (
            <div key={group} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {group}
              </p>
              <div className="space-y-0.5">
                {navigation
                  .filter(item => item.group === group)
                  .map(item => {
                    const Icon = item.icon;
                    const active = module === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setModule(item.key);
                          setSearch("");
                          setDetail(null);
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${active ? "bg-cyan-400/10 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.14)]" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"}`}
                      >
                        <Icon
                          className={`h-4 w-4 ${active ? "text-cyan-300" : ""}`}
                        />
                        {item.label}
                        {item.key === "anomalies" &&
                        state.anomalies.filter(
                          item =>
                            !["resolved", "dismissed"].includes(item.status)
                        ).length ? (
                          <span className="ml-auto rounded-full bg-rose-400/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-200">
                            {
                              state.anomalies.filter(
                                item =>
                                  !["resolved", "dismissed"].includes(
                                    item.status
                                  )
                              ).length
                            }
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
          <div className="mt-auto rounded-xl border border-slate-800 bg-slate-950/30 p-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-xs font-bold text-cyan-200">
                MC
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-200">
                  {state.currentUser.name}
                </p>
                <p className="text-[10px] capitalize text-slate-500">
                  {state.currentUser.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => setModule("audit")}
              className="mt-3 flex w-full items-center justify-between rounded-lg bg-slate-800/70 px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-800"
            >
              <span>Audit coverage</span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            </button>
          </div>
        </aside>
        <main id="main" className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-slate-800 bg-[#0a1020]/80 px-5 backdrop-blur-xl lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-slate-800 bg-[#111b2e] lg:hidden">
                <currentNav.icon className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {currentNav.label}
                </p>
                <p className="hidden text-xs text-slate-500 sm:block">
                  {state.workspace.name} · Local desktop workspace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-[#111b2e] px-2.5 py-1.5 text-xs text-slate-400 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Persistent local store
              </div>
              <select
                aria-label="Demo role selector"
                value={state.currentUser.role}
                onChange={event => changeRole(event.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-[#111b2e] px-2 text-xs font-medium capitalize text-slate-200 outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="coordinator">Coordinator</option>
                <option value="analyst">Analyst</option>
              </select>
              <ActionButton
                variant="outline"
                onClick={refresh}
                className="border-slate-700 bg-[#111b2e] text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </ActionButton>
            </div>
          </header>
          {error ? (
            <div className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100 lg:mx-8">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Workspace unavailable</p>
                <p className="mt-1 text-rose-200/80">{error}</p>
                <button
                  onClick={refresh}
                  className="mt-2 text-xs font-bold text-rose-100 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}
          <div className="p-5 lg:p-8">
            {module === "tower" ? (
              <ControlTower
                state={state}
                onNavigate={setModule}
                onOpen={record => {
                  setModule("anomalies");
                  setDetail(record);
                }}
              />
            ) : module === "audit" ? (
              <AuditWorkspace
                state={state}
                search={search}
                setSearch={setSearch}
                onExport={() => exportRows("audit-log", state.audit)}
              />
            ) : (
              <DomainWorkspace
                module={module}
                state={state}
                metadata={metadata}
                search={search}
                setSearch={setSearch}
                filtered={filtered}
                onCreate={openCreate}
                onEdit={openEdit}
                onDetail={setDetail}
                onDelete={id => remove(metadata.entity, id)}
                onExport={() =>
                  exportRows(
                    metadata.entity,
                    state[metadata.entity as keyof OpsState] as OpsRecord[]
                  )
                }
                onImport={() => setImportOpen(true)}
              />
            )}
          </div>
        </main>
      </div>
      <RecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          editing
            ? `Edit ${humanize(module.slice(0, -1))}`
            : metadata?.createLabel || "Create record"
        }
        description="Required fields are validated in the desktop process before they are persisted. Each approved change is auditable."
        fields={metadata?.fields || []}
        record={editing}
        onSubmit={async payload =>
          editing
            ? update(metadata.entity, editing.id, payload)
            : create(metadata.entity, payload)
        }
      />
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="border-slate-700 bg-[#101827] text-slate-100">
          <DialogHeader>
            <DialogTitle>Import student lifecycle records</DialogTitle>
            <DialogDescription className="text-slate-400">
              Paste CSV with headers: name, email, cohort, program, status,
              progress, attendance, risk, mentor. Duplicate email or name+cohort
              rows are skipped.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={csvText}
            onChange={event => setCsvText(event.target.value)}
            placeholder="name,email,cohort,program,status,progress,attendance,risk,mentor\nJordan Lee,jordan@example.edu,Autumn 2026,Data Analytics,active,45,92,low,Priya Nair"
            className="min-h-56 border-slate-700 bg-slate-950 text-slate-100"
          />
          <div className="flex justify-end gap-2">
            <ActionButton
              variant="ghost"
              onClick={() => setImportOpen(false)}
              className="text-slate-300"
            >
              Cancel
            </ActionButton>
            <ActionButton
              disabled={!csvText.trim()}
              onClick={async () => {
                try {
                  if (!isDesktop)
                    throw new Error(
                      "Run the Windows desktop app to import data."
                    );
                  const result =
                    await window.desktopAPI!.importStudents(csvText);
                  await refresh();
                  setImportOpen(false);
                  setCsvText("");
                  toast.success(
                    `Import completed: ${result.created} created, ${result.duplicates} duplicate(s) skipped.`
                  );
                  if (result.errors?.length)
                    toast.warning(
                      `${result.errors.length} row(s) need review.`
                    );
                } catch (cause: any) {
                  toast.error(cause.message || "Import failed.");
                }
              }}
              className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
            >
              <Upload className="mr-2 h-4 w-4" />
              Validate & import
            </ActionButton>
          </div>
        </DialogContent>
      </Dialog>
      <DetailDrawer
        record={detail}
        module={module}
        state={state}
        onClose={() => setDetail(null)}
        onUpdate={update}
        onSopVersion={addSopVersion}
      />
    </div>
  );
}

function ControlTower({
  state,
  onNavigate,
  onOpen,
}: {
  state: OpsState;
  onNavigate: (module: ModuleKey) => void;
  onOpen: (record: OpsRecord) => void;
}) {
  const activeStudents = state.students.filter(
    student => student.status === "active"
  ).length;
  const riskStudents = state.students.filter(
    student => student.risk === "high" || student.status === "at_risk"
  ).length;
  const openIncidents = state.incidents.filter(
    incident => incident.status !== "resolved"
  ).length;
  const quality = average(
    state.quality.flatMap(item => [
      Number(item.completeness),
      Number(item.accuracy),
      Number(item.freshness),
    ])
  );
  const attendance =
    state.kpis.find(item => item.id === "kpi-attendance") || state.kpis[0];
  const anomalyRows = state.anomalies.filter(
    item => !["resolved", "dismissed"].includes(item.status)
  );
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
            Operational command center
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Today’s operating picture
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Prioritized signals across learner progression, delivery capacity,
            incidents, data readiness, and governed KPIs. Drill into a signal
            before acting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton
            onClick={() => onNavigate("anomalies")}
            className="border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Review signals
          </ActionButton>
          <ActionButton
            onClick={() => onNavigate("students")}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add student
          </ActionButton>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active learners"
          value={activeStudents}
          note="across active cohorts"
          trend="4.2%"
          icon={GraduationCap}
        />
        <MetricCard
          label="Intervention queue"
          value={riskStudents}
          note="learners require follow-up"
          trend="2 high risk"
          positive={false}
          icon={TriangleAlert}
        />
        <MetricCard
          label="Open incidents"
          value={openIncidents}
          note="not yet resolved"
          trend={openIncidents ? "Needs triage" : "Clear"}
          positive={!openIncidents}
          icon={ClipboardList}
        />
        <MetricCard
          label="Data health"
          value={`${quality}%`}
          note="average completeness, accuracy, freshness"
          trend={quality >= 90 ? "Within control" : "Below control"}
          positive={quality >= 90}
          icon={Database}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="rounded-2xl border border-slate-800 bg-[#111b2e] p-5 shadow-[0_14px_45px_rgba(0,0,0,0.16)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Attendance trajectory
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Actual vs published target · governed KPI {attendance?.name}
              </p>
            </div>
            <Badge
              value={
                Number(attendance?.actuals?.at(-1)?.value) >=
                Number(attendance?.target)
                  ? "healthy"
                  : "attention"
              }
            />
          </div>
          <div className="mt-5 h-64">
            {attendance?.actuals?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendance.actuals.map((point: any) => ({
                    ...point,
                    target: attendance.target,
                  }))}
                  margin={{ top: 8, left: -18, right: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="attendanceFill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22d3ee"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="#22d3ee"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#243047"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#7d8aa5", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[70, 100]}
                    tick={{ fill: "#7d8aa5", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d1526",
                      border: "1px solid #334155",
                      borderRadius: 10,
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                    itemStyle={{ color: "#a5f3fc" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Actual"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    fill="url(#attendanceFill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#fbbf24"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No KPI history yet"
                description="Define a KPI and record actuals to visualize trend performance."
              />
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-[#111b2e] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Domain data health
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Quality score by operational area
              </p>
            </div>
            <button
              onClick={() => onNavigate("quality")}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              View all
            </button>
          </div>
          <div className="mt-6 space-y-5">
            {state.quality.map(item => {
              const score = average([
                item.completeness,
                item.accuracy,
                item.freshness,
              ]);
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate("quality")}
                  className="block w-full text-left"
                >
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">
                      {item.domain}
                    </span>
                    <span
                      className={
                        score >= 90 ? "text-emerald-300" : "text-amber-300"
                      }
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${score >= 90 ? "bg-emerald-400" : "bg-amber-400"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <section className="rounded-2xl border border-slate-800 bg-[#111b2e]">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Priority anomaly feed
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Evidence-linked operational exceptions requiring review
              </p>
            </div>
            <button
              onClick={() => onNavigate("anomalies")}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Open workspace
            </button>
          </div>
          <div className="divide-y divide-slate-800">
            {anomalyRows.length ? (
              anomalyRows.slice(0, 3).map(anomaly => (
                <button
                  key={anomaly.id}
                  onClick={() => onOpen(anomaly)}
                  className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-800/30"
                >
                  <div
                    className={`mt-0.5 rounded-lg p-2 ${anomaly.severity === "high" ? "bg-rose-500/10 text-rose-300" : "bg-amber-500/10 text-amber-300"}`}
                  >
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-100">
                        {anomaly.title}
                      </p>
                      <Badge value={anomaly.severity} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                      {anomaly.context}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-cyan-300">
                      Expected {anomaly.expected} · actual {anomaly.actual} ·{" "}
                      {humanize(anomaly.status)}
                    </p>
                  </div>
                  <ChevronRight className="mt-2 h-4 w-4 text-slate-500" />
                </button>
              ))
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No active anomalies"
                description="New anomalies will appear here when a defined threshold is breached."
              />
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-[#111b2e] p-5">
          <p className="text-sm font-semibold text-white">Next best actions</p>
          <p className="mt-1 text-xs text-slate-500">
            A deterministic queue assembled from visible operating state.
          </p>
          <div className="mt-4 space-y-3">
            <ActionCard
              icon={TriangleAlert}
              tint="rose"
              title="Complete attendance intervention"
              detail="Confirm learner contact for the high-risk attendance case."
              onClick={() => onNavigate("incidents")}
            />
            <ActionCard
              icon={Database}
              tint="amber"
              title="Restore instructor availability freshness"
              detail="The availability source is beyond the published refresh SLA."
              onClick={() => onNavigate("quality")}
            />
            <ActionCard
              icon={CalendarClock}
              tint="cyan"
              title="Confirm upcoming delivery"
              detail="Two sessions begin inside the next 48 hours."
              onClick={() => onNavigate("sessions")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  detail,
  onClick,
  tint,
}: {
  icon: any;
  title: string;
  detail: string;
  onClick: () => void;
  tint: "rose" | "amber" | "cyan";
}) {
  const color =
    tint === "rose"
      ? "bg-rose-500/10 text-rose-300"
      : tint === "amber"
        ? "bg-amber-500/10 text-amber-300"
        : "bg-cyan-400/10 text-cyan-300";
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border border-slate-800 p-3.5 text-left transition-all hover:border-slate-700 hover:bg-slate-800/40"
    >
      <span className={`rounded-lg p-2 ${color}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-200">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {detail}
        </span>
      </span>
      <ChevronRight className="mt-2 h-4 w-4 text-slate-600" />
    </button>
  );
}
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-44 place-items-center px-6 py-8 text-center">
      <div>
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-400">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-3 text-sm font-semibold text-slate-200">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function DomainWorkspace({
  module,
  state,
  metadata,
  search,
  setSearch,
  filtered,
  onCreate,
  onEdit,
  onDetail,
  onDelete,
  onExport,
  onImport,
}: {
  module: ModuleKey;
  state: OpsState;
  metadata: any;
  search: string;
  setSearch: (value: string) => void;
  filtered: (items: OpsRecord[]) => OpsRecord[];
  onCreate: () => void;
  onEdit: (record: OpsRecord) => void;
  onDetail: (record: OpsRecord) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
}) {
  return (
    <EnhancedDomainWorkspace
      module={module}
      state={state}
      metadata={metadata}
      search={search}
      setSearch={setSearch}
      onCreate={onCreate}
      onEdit={onEdit}
      onDetail={onDetail}
      onDelete={onDelete}
      onExport={onExport}
      onImport={onImport}
    />
  );
  const rows = filtered(
    state[metadata.entity as keyof OpsState] as OpsRecord[]
  );
  const isInvestigation = module === "anomalies" || module === "incidents";
  const columns: Record<string, { key: string; label: string }[]> = {
    students: [
      { key: "name", label: "Student" },
      { key: "cohort", label: "Cohort" },
      { key: "program", label: "Program" },
      { key: "progress", label: "Progress" },
      { key: "attendance", label: "Attendance" },
      { key: "risk", label: "Risk" },
      { key: "status", label: "Status" },
    ],
    instructors: [
      { key: "name", label: "Instructor" },
      { key: "specialty", label: "Specialty" },
      { key: "availability", label: "Availability" },
      { key: "sessionLoad", label: "Load" },
      { key: "rating", label: "Rating" },
      { key: "status", label: "Status" },
    ],
    sessions: [
      { key: "title", label: "Session" },
      { key: "course", label: "Course" },
      { key: "startAt", label: "Schedule" },
      { key: "duration", label: "Duration" },
      { key: "room", label: "Delivery" },
      { key: "status", label: "Status" },
    ],
    incidents: [
      { key: "title", label: "Incident" },
      { key: "type", label: "Type" },
      { key: "severity", label: "Severity" },
      { key: "assignee", label: "Assignee" },
      { key: "status", label: "Workflow" },
    ],
    kpis: [
      { key: "name", label: "KPI definition" },
      { key: "domain", label: "Domain" },
      { key: "target", label: "Target" },
      { key: "warningThreshold", label: "Warning" },
      { key: "owner", label: "Owner" },
    ],
    anomalies: [
      { key: "title", label: "Signal" },
      { key: "domain", label: "Domain" },
      { key: "metric", label: "Metric" },
      { key: "expected", label: "Expected" },
      { key: "actual", label: "Actual" },
      { key: "severity", label: "Severity" },
      { key: "status", label: "State" },
    ],
    quality: [
      { key: "domain", label: "Domain" },
      { key: "completeness", label: "Completeness" },
      { key: "accuracy", label: "Accuracy" },
      { key: "freshness", label: "Freshness" },
      { key: "owner", label: "Owner" },
      { key: "status", label: "Health" },
    ],
    sops: [
      { key: "title", label: "Procedure" },
      { key: "domain", label: "Linked domain" },
      { key: "incidentType", label: "Incident link" },
      { key: "activeVersion", label: "Active version" },
    ],
    analyses: [
      { key: "name", label: "Analysis" },
      { key: "scope", label: "Scope" },
      { key: "dataRange", label: "Data range" },
      { key: "createdBy", label: "Created by" },
    ],
  };
  const currentColumns = columns[metadata.entity] || [];
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
            {module === "kpis"
              ? "Metric governance"
              : module === "sops"
                ? "Operational knowledge"
                : isInvestigation
                  ? "Evidence and workflow"
                  : "Operational records"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {metadata.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {metadata.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {module === "students" ? (
            <ActionButton
              variant="outline"
              onClick={onImport}
              className="border-slate-700 bg-[#111b2e] text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </ActionButton>
          ) : null}
          <ActionButton
            variant="outline"
            onClick={onExport}
            className="border-slate-700 bg-[#111b2e] text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </ActionButton>
          <ActionButton
            onClick={onCreate}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            {metadata.createLabel}
          </ActionButton>
        </div>
      </div>
      {module === "kpis" ? <KpiVisuals kpis={state.kpis} /> : null}
      {module === "quality" ? (
        <QualityOverview entries={state.quality} />
      ) : null}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#111b2e] p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={`Search ${metadata.title.toLowerCase()}…`}
            className="h-10 border-slate-700 bg-slate-950/50 pl-9 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-400"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          {rows.length} visible record{rows.length === 1 ? "" : "s"}
        </div>
      </div>
      {module === "sops" ? (
        <SopCards items={rows} onDetail={onDetail} />
      ) : module === "analyses" ? (
        <AnalysisCards items={rows} onDetail={onDetail} />
      ) : (
        <TableShell>
          <TableHead>
            {currentColumns.map(column => (
              <THead key={column.key}>{column.label}</THead>
            ))}
            <THead>Actions</THead>
          </TableHead>
          <tbody className="divide-y divide-slate-800">
            {rows.length ? (
              rows.map(row => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-slate-800/25"
                >
                  {currentColumns.map(column => (
                    <td
                      key={column.key}
                      className="px-5 py-4 align-middle text-sm text-slate-300"
                    >
                      {["status", "risk", "severity"].includes(column.key) ? (
                        <Badge value={row[column.key]} />
                      ) : column.key === "startAt" ? (
                        formatDate(row[column.key])
                      ) : column.key === "progress" ||
                        column.key === "attendance" ||
                        column.key === "completeness" ||
                        column.key === "accuracy" ||
                        column.key === "freshness" ? (
                        <Progress value={Number(row[column.key])} />
                      ) : column.key === "rating" ? (
                        <span className="font-medium text-amber-200">
                          ★ {row[column.key]}
                        </span>
                      ) : column.key === "activeVersion" ? (
                        <span className="font-medium text-cyan-200">
                          v{row[column.key]}
                        </span>
                      ) : column.key === "target" ||
                        column.key === "warningThreshold" ? (
                        `${row[column.key]}${row.unit || ""}`
                      ) : (
                        <span className="max-w-56 truncate font-medium text-slate-200">
                          {row[column.key] || "—"}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDetail(row)}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-200"
                        aria-label="View record"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(row)}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-200"
                        aria-label="Edit record"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Delete this ${metadata.entity.slice(0, -1)}? This cannot remove its audit record.`
                            )
                          )
                            onDelete(row.id);
                        }}
                        className="rounded-md p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-200"
                        aria-label="Delete record"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentColumns.length + 1}>
                  <EmptyState
                    icon={Search}
                    title="No matching records"
                    description="Adjust the search term or create a new record for this operational domain."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}

function Progress({ value }: { value: number }) {
  const tone =
    value >= 90
      ? "bg-emerald-400"
      : value >= 75
        ? "bg-cyan-400"
        : value >= 60
          ? "bg-amber-400"
          : "bg-rose-400";
  return (
    <div className="flex min-w-28 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-slate-300">{value}%</span>
    </div>
  );
}
function KpiVisuals({ kpis }: { kpis: OpsRecord[] }) {
  const selected = kpis[0];
  const chartRows = (selected?.actuals || []).map((point: any) => ({
    ...point,
    target: selected.target,
  }));
  return (
    <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <section className="rounded-2xl border border-slate-800 bg-[#111b2e] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              Actuals vs target
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {selected?.name || "No KPI selected"} · owner:{" "}
              {selected?.owner || "—"}
            </p>
          </div>
          <Badge
            value={
              (chartRows.at(-1)?.value || 0) >= (selected?.target || 0)
                ? "healthy"
                : "attention"
            }
          />
        </div>
        <div className="mt-4 h-64">
          {chartRows.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartRows}
                margin={{ top: 8, left: -18, right: 10, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#243047"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#7d8aa5", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#7d8aa5", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d1526",
                    border: "1px solid #334155",
                    borderRadius: 10,
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar
                  dataKey="value"
                  name="Actual"
                  radius={[6, 6, 0, 0]}
                  fill="#22d3ee"
                />
                <Line
                  dataKey="target"
                  name="Target"
                  type="monotone"
                  stroke="#fbbf24"
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No actuals recorded"
              description="This KPI is defined but has no time-series records yet."
            />
          )}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-800 bg-[#111b2e] p-5">
        <p className="text-sm font-semibold text-white">KPI controls</p>
        <div className="mt-4 space-y-3">
          {kpis.map(item => {
            const latest = item.actuals?.at(-1)?.value ?? 0;
            const status =
              latest >= item.target
                ? "On target"
                : latest >= item.warningThreshold
                  ? "Watch"
                  : "Breached";
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950/25 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Target {item.target}
                      {item.unit} · owner {item.owner}
                    </p>
                  </div>
                  <Badge
                    value={
                      status === "On target"
                        ? "healthy"
                        : status === "Watch"
                          ? "attention"
                          : "high"
                    }
                  />
                </div>
                <div className="mt-3">
                  <Progress value={Number(latest)} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
function QualityOverview({ entries }: { entries: OpsRecord[] }) {
  const chart = entries.map(entry => ({
    name: entry.domain.split(" ")[0],
    completeness: entry.completeness,
    accuracy: entry.accuracy,
    freshness: entry.freshness,
  }));
  return (
    <section className="rounded-2xl border border-slate-800 bg-[#111b2e] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            Quality control profile
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Completeness, accuracy, and freshness by domain
          </p>
        </div>
        <Badge
          value={
            average(
              entries.flatMap(entry => [
                entry.completeness,
                entry.accuracy,
                entry.freshness,
              ])
            ) >= 90
              ? "healthy"
              : "attention"
          }
        />
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chart}
            margin={{ top: 8, left: -18, right: 10, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#243047"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#7d8aa5", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#7d8aa5", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0d1526",
                border: "1px solid #334155",
                borderRadius: 10,
              }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Bar
              dataKey="completeness"
              stackId="quality"
              fill="#22d3ee"
              radius={[0, 0, 4, 4]}
            />
            <Bar dataKey="accuracy" stackId="quality" fill="#60a5fa" />
            <Bar
              dataKey="freshness"
              stackId="quality"
              fill="#818cf8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
function SopCards({
  items,
  onDetail,
}: {
  items: OpsRecord[];
  onDetail: (record: OpsRecord) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.length ? (
        items.map(item => (
          <button
            key={item.id}
            onClick={() => onDetail(item)}
            className="group rounded-2xl border border-slate-800 bg-[#111b2e] p-5 text-left shadow-[0_14px_45px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5 hover:border-cyan-300/30"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-200">
                <BookOpen className="h-5 w-5" />
              </span>
              <Badge value={`v${item.activeVersion}`} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-100">
              {item.title}
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              Linked to {item.domain}
              {item.incidentType ? ` · ${item.incidentType} incidents` : ""}
            </p>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
              {item.versions?.at(-1)?.body || "No active procedure content."}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-cyan-300">
              Open version history{" "}
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))
      ) : (
        <div className="md:col-span-2 xl:col-span-3">
          <EmptyState
            icon={BookOpen}
            title="No SOPs found"
            description="Create a versioned procedure to support consistent operational decisions."
          />
        </div>
      )}
    </div>
  );
}
function AnalysisCards({
  items,
  onDetail,
}: {
  items: OpsRecord[];
  onDetail: (record: OpsRecord) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.length ? (
        items.map(item => (
          <button
            key={item.id}
            onClick={() => onDetail(item)}
            className="rounded-2xl border border-slate-800 bg-[#111b2e] p-5 text-left transition-colors hover:border-cyan-300/30 hover:bg-slate-800/35"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-indigo-400/10 p-2.5 text-indigo-200">
                <FileSearch className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-500">
                {formatDate(item.createdAt)}
              </span>
            </div>
            <p className="mt-4 text-base font-semibold text-slate-100">
              {item.name}
            </p>
            <p className="mt-1 text-xs font-medium text-cyan-300">
              {item.scope} · {item.dataRange || "Range not set"}
            </p>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
              {item.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {(item.provenance || []).map((source: string) => (
                <span
                  key={source}
                  className="rounded-md border border-slate-700 bg-slate-950/50 px-2 py-1 text-[10px] font-medium text-slate-400"
                >
                  {source}
                </span>
              ))}
            </div>
          </button>
        ))
      ) : (
        <div className="lg:col-span-2">
          <EmptyState
            icon={FileSearch}
            title="No saved analyses"
            description="Save a named evidence review to make it reusable and inspectable."
          />
        </div>
      )}
    </div>
  );
}
function AuditWorkspace({
  state,
  search,
  setSearch,
  onExport,
}: {
  state: OpsState;
  search: string;
  setSearch: (value: string) => void;
  onExport: () => void;
}) {
  const rows = state.audit.filter(entry =>
    JSON.stringify(entry).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
            Governance and evidence
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Immutable audit log
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Every approved create, update, delete, role change, export, import,
            and version publication is appended by the trusted desktop process.
            Audit entries have no edit or deletion controls.
          </p>
        </div>
        <ActionButton
          onClick={onExport}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
        >
          <Download className="mr-2 h-4 w-4" />
          Export evidence
        </ActionButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Logged events"
          value={state.audit.length}
          note="append-only records"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Covered domains"
          value={new Set(state.audit.map(item => item.entityType)).size}
          note="with attributable activity"
          icon={Database}
        />
        <MetricCard
          label="Current actor"
          value={state.currentUser.name.split(" ")[0]}
          note={`${humanize(state.currentUser.role)} desktop profile`}
          icon={UserRoundCog}
        />
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#111b2e] p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search audit event, entity, actor, or correlation ID…"
            className="h-10 border-slate-700 bg-slate-950/50 pl-9 text-slate-100 placeholder:text-slate-600"
          />
        </div>
        <ShieldCheck className="mr-2 h-5 w-5 text-emerald-300" />
      </div>
      <TableShell>
        <TableHead>
          <THead>Timestamp</THead>
          <THead>Actor</THead>
          <THead>Action</THead>
          <THead>Entity</THead>
          <THead>Audit summary</THead>
          <THead>Correlation</THead>
        </TableHead>
        <tbody className="divide-y divide-slate-800">
          {rows.length ? (
            rows.map(entry => (
              <tr key={entry.id} className="hover:bg-slate-800/25">
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                  {formatDate(entry.timestamp)}
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-200">
                    {entry.userName}
                  </p>
                  <p className="mt-1 text-[10px] capitalize text-slate-500">
                    {entry.userRole}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-md border border-cyan-300/15 bg-cyan-300/5 px-2 py-1 text-[10px] font-bold tracking-wide text-cyan-200">
                    {humanize(entry.action)}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">
                  {humanize(entry.entityType)}
                  <p className="mt-1 text-[10px] text-slate-600">
                    {entry.entityId}
                  </p>
                </td>
                <td className="max-w-sm px-5 py-4 text-sm leading-5 text-slate-300">
                  {entry.summary}
                </td>
                <td className="px-5 py-4 font-mono text-[10px] text-slate-500">
                  {entry.correlationId}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <EmptyState
                  icon={Search}
                  title="No matching audit entries"
                  description="Try another query. The audit log itself cannot be edited or cleared."
                />
              </td>
            </tr>
          )}
        </tbody>
      </TableShell>
    </div>
  );
}
