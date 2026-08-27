import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Login identity. Unique, stored lowercase. */
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  /**
   * scrypt digest produced by `server/_core/password.ts`. Nullable so an account
   * can exist before a password is set (invite flows); such an account cannot
   * sign in, because verification against a null hash always fails.
   */
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["teacher", "coordinator"]).default("teacher").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  className: varchar("className", { length: 120 }).notNull(),
  programme: varchar("programme", { length: 160 }).notNull(),
  level: varchar("level", { length: 80 }),
  learningGoals: text("learningGoals"),
  activeStatus: mysqlEnum("activeStatus", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const sessionRecords = mysqlTable("sessionRecords", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  teacherId: int("teacherId").notNull(),
  sessionDate: timestamp("sessionDate").notNull(),
  sessionNumber: int("sessionNumber").notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  topic: varchar("topic", { length: 240 }).notNull(),
  objectives: text("objectives"),
  sessionNotes: text("sessionNotes"),
  observations: text("observations"),
  artifacts: text("artifacts"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const feedbackEntries = mysqlTable("feedbackEntries", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  sessionId: int("sessionId").notNull(),
  teacherId: int("teacherId").notNull(),
  strengths: text("strengths").notNull(),
  areasForImprovement: text("areasForImprovement").notNull(),
  nextSteps: text("nextSteps").notNull(),
  status: mysqlEnum("status", ["draft", "pending review", "approved"]).default("draft").notNull(),
  coordinatorId: int("coordinatorId"),
  coordinatorComment: text("coordinatorComment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const feedbackComments = mysqlTable("feedbackComments", {
  id: int("id").autoincrement().primaryKey(),
  feedbackId: int("feedbackId").notNull(),
  authorId: int("authorId").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type SessionRecord = typeof sessionRecords.$inferSelect;
export type FeedbackEntry = typeof feedbackEntries.$inferSelect;
