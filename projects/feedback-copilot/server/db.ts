import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  feedbackEntries,
  InsertUser,
  sessionRecords,
  students,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/** Create an account with a password. Returns the new `users.id`. */
export async function createUserWithPassword(values: {
  email: string;
  name: string;
  role: InsertUser["role"];
  passwordHash: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(users).values({
    email: values.email,
    name: values.name,
    role: values.role,
    passwordHash: values.passwordHash,
    lastSignedIn: new Date(),
  });

  return Number((result as { insertId: number }).insertId);
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function touchLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export async function getStudentsForUser(userId: number, role: "teacher" | "coordinator") {
  const db = await getDb();
  if (!db) return [];
  return role === "coordinator"
    ? db.select().from(students).orderBy(students.className, students.name)
    : db.select().from(students).where(eq(students.teacherId, userId)).orderBy(students.name);
}

export async function getSessionsForStudent(studentId: number, userId: number, role: "teacher" | "coordinator") {
  const db = await getDb();
  if (!db) return [];
  const scope = role === "coordinator"
    ? eq(sessionRecords.studentId, studentId)
    : and(eq(sessionRecords.studentId, studentId), eq(sessionRecords.teacherId, userId));
  return db.select().from(sessionRecords).where(scope).orderBy(desc(sessionRecords.sessionDate));
}

export async function getFeedbackHistory(
  studentId: number,
  userId: number,
  role: "teacher" | "coordinator",
  status?: "draft" | "pending review" | "approved"
) {
  const db = await getDb();
  if (!db) return [];
  const roleScope = role === "coordinator"
    ? eq(feedbackEntries.studentId, studentId)
    : and(eq(feedbackEntries.studentId, studentId), eq(feedbackEntries.teacherId, userId));
  const scope = status ? and(roleScope, eq(feedbackEntries.status, status)) : roleScope;
  return db.select().from(feedbackEntries).where(scope).orderBy(desc(feedbackEntries.updatedAt));
}

export async function getPendingReviewQueue() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: feedbackEntries.id,
      studentId: feedbackEntries.studentId,
      studentName: students.name,
      className: students.className,
      sessionId: feedbackEntries.sessionId,
      topic: sessionRecords.topic,
      updatedAt: feedbackEntries.updatedAt,
      strengths: feedbackEntries.strengths,
      areasForImprovement: feedbackEntries.areasForImprovement,
      nextSteps: feedbackEntries.nextSteps,
      coordinatorComment: feedbackEntries.coordinatorComment,
    })
    .from(feedbackEntries)
    .innerJoin(students, eq(feedbackEntries.studentId, students.id))
    .innerJoin(sessionRecords, eq(feedbackEntries.sessionId, sessionRecords.id))
    .where(eq(feedbackEntries.status, "pending review"))
    .orderBy(desc(feedbackEntries.updatedAt));
}

export async function createStudent(values: typeof students.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(students).values(values);
  return result[0].insertId;
}

export async function createSessionRecord(values: typeof sessionRecords.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(sessionRecords).values(values);
  return result[0].insertId;
}

export async function studentBelongsToTeacher(studentId: number, teacherId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, studentId), eq(students.teacherId, teacherId)))
    .limit(1);
  return result.length === 1;
}

export async function createFeedbackEntry(values: typeof feedbackEntries.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(feedbackEntries).values(values);
  return result[0].insertId;
}

export async function updateFeedbackEntry(
  feedbackId: number,
  values: Partial<typeof feedbackEntries.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(feedbackEntries).set(values).where(eq(feedbackEntries.id, feedbackId));
}

export async function updateTeacherFeedbackEntry(
  feedbackId: number,
  teacherId: number,
  values: Partial<typeof feedbackEntries.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(feedbackEntries)
    .set(values)
    .where(and(eq(feedbackEntries.id, feedbackId), eq(feedbackEntries.teacherId, teacherId)));
}
