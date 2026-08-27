import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Stable public identifier, minted locally at registration. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  /** Login identity. Unique, stored lowercase. */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** scrypt digest from server/_core/password.ts. Null until a password is set. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
  settings: json("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const organizationMembers = mysqlTable("organizationMembers", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["admin", "manager", "coordinator", "content", "mentor", "viewer"]).default("manager").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const programs = mysqlTable("programs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  type: varchar("type", { length: 64 }).default("recorded").notNull(),
  durationWeeks: int("durationWeeks").default(12).notNull(),
  renewalWindowDays: int("renewalWindowDays").default(30).notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const cohorts = mysqlTable("cohorts", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["planned", "active", "completed"]).default("active").notNull(),
});

export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  externalId: varchar("externalId", { length: 128 }),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
  locale: varchar("locale", { length: 32 }).default("en").notNull(),
  lifecycleState: mysqlEnum("lifecycleState", ["prospect", "new", "onboarding", "active", "declining", "at_risk", "renewal_due", "renewed", "completed", "churned"]).default("new").notNull(),
  engagementState: mysqlEnum("engagementState", ["healthy", "watch", "declining", "unknown"]).default("unknown").notNull(),
  progressPercent: int("progressPercent").default(0).notNull(),
  lastLesson: varchar("lastLesson", { length: 240 }),
  lastActivityAt: timestamp("lastActivityAt"),
  lastContactAt: timestamp("lastContactAt"),
  source: varchar("source", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  programId: int("programId").notNull(),
  cohortId: int("cohortId"),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "paused", "completed", "churned"]).default("active").notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  plan: varchar("plan", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["active", "past_due", "cancelled", "unknown"]).default("unknown").notNull(),
  startDate: timestamp("startDate"),
  renewalDate: timestamp("renewalDate"),
  metadata: json("metadata"),
});

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  chapter: varchar("chapter", { length: 160 }),
  orderIndex: int("orderIndex").notNull(),
  durationMinutes: int("durationMinutes").default(0).notNull(),
  transcript: text("transcript"),
  status: mysqlEnum("status", ["draft", "published"]).default("published").notNull(),
});

export const lessonEvents = mysqlTable("lessonEvents", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  lessonId: int("lessonId").notNull(),
  eventType: mysqlEnum("eventType", ["started", "progressed", "completed", "revisited"]).notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  metadata: json("metadata"),
});

export const communityEvents = mysqlTable("communityEvents", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  eventType: mysqlEnum("eventType", ["post", "comment", "reaction", "workshop", "challenge", "submission"]).notNull(),
  source: varchar("source", { length: 80 }).default("internal").notNull(),
  summary: varchar("summary", { length: 500 }).notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  metadata: json("metadata"),
});

export const studentSignals = mysqlTable("studentSignals", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  type: mysqlEnum("type", ["engagement_drop", "renewal_opportunity", "top_performer", "community_contributor", "onboarding_gap", "data_quality", "intervention_outcome"]).notNull(),
  value: int("value").default(0).notNull(),
  periodLabel: varchar("periodLabel", { length: 64 }).notNull(),
  explanation: varchar("explanation", { length: 500 }).notNull(),
  evidence: json("evidence"),
  state: mysqlEnum("state", ["open", "snoozed", "dismissed", "resolved"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const renewalCases = mysqlTable("renewalCases", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  renewalDate: timestamp("renewalDate").notNull(),
  state: mysqlEnum("state", ["not_started", "planned", "contacted", "renewed", "churned", "dismissed"]).default("not_started").notNull(),
  ownerUserId: int("ownerUserId"),
  nextAction: varchar("nextAction", { length: 500 }),
  outcome: varchar("outcome", { length: 500 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const interventions = mysqlTable("interventions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  type: mysqlEnum("type", ["onboarding", "renewal", "disengagement", "support", "recognition", "content_followup"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  ownerUserId: int("ownerUserId"),
  reason: varchar("reason", { length: 1000 }).notNull(),
  nextAction: varchar("nextAction", { length: 1000 }).notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "waiting", "completed", "dismissed"]).default("open").notNull(),
  dueDate: timestamp("dueDate"),
  outcome: varchar("outcome", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  type: mysqlEnum("type", ["top_performer", "most_improved", "consistent", "community_contributor", "challenge_leader", "potential_ambassador", "emerging_talent"]).notNull(),
  source: varchar("source", { length: 200 }).notNull(),
  evidence: json("evidence"),
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
});

export const instructors = mysqlTable("instructors", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  availability: json("availability"),
});

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull(),
  cohortId: int("cohortId"),
  instructorId: int("instructorId").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  capacity: int("capacity").default(20).notNull(),
  attendeeCount: int("attendeeCount").default(0).notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  notes: varchar("notes", { length: 1000 }),
});

export const contentIdeas = mysqlTable("contentIdeas", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  title: varchar("title", { length: 320 }).notNull(),
  source: varchar("source", { length: 240 }).notNull(),
  audience: varchar("audience", { length: 160 }).notNull(),
  theme: varchar("theme", { length: 160 }).notNull(),
  objective: varchar("objective", { length: 500 }).notNull(),
  evidence: json("evidence"),
  status: mysqlEnum("status", ["backlog", "approved", "scheduled", "published", "archived"]).default("backlog").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const businessReviews = mysqlTable("businessReviews", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  metrics: json("metrics").notNull(),
  narrative: text("narrative").notNull(),
  actions: json("actions").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const dataQualityIssues = mysqlTable("dataQualityIssues", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  source: varchar("source", { length: 120 }).notNull(),
  issueType: varchar("issueType", { length: 200 }).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "resolved", "ignored"]).default("open").notNull(),
  details: varchar("details", { length: 1000 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const aiRuns = mysqlTable("aiRuns", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId").notNull(),
  taskType: varchar("taskType", { length: 100 }).notNull(),
  model: varchar("model", { length: 120 }).notNull(),
  inputSummary: varchar("inputSummary", { length: 1000 }).notNull(),
  output: json("output"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  actorUserId: int("actorUserId"),
  action: varchar("action", { length: 160 }).notNull(),
  objectType: varchar("objectType", { length: 120 }).notNull(),
  objectId: int("objectId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
