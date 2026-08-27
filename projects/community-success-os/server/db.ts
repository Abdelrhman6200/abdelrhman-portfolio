import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  achievements,
  aiRuns,
  auditEvents,
  businessReviews,
  cohorts,
  communityEvents,
  contentIdeas,
  dataQualityIssues,
  enrollments,
  instructors,
  interventions,
  lessonEvents,
  lessons,
  organizationMembers,
  organizations,
  programs,
  renewalCases,
  sessions,
  studentSignals,
  students,
  subscriptions,
  type InsertUser,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

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
  openId: string;
  email: string;
  name: string;
  role: InsertUser["role"];
  passwordHash: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(users).values({
    openId: values.openId,
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
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, id));
}

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000);
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

async function createDemoWorkspace(db: Db, userId: number, isOwner: boolean) {
  const [organization] = await db
    .insert(organizations)
    .values({
      name: "Eloquenta Academy",
      timezone: "Europe/Istanbul",
      settings: { demoWorkspace: true, renewalWindowDays: 30 },
    })
    .$returningId();
  await db
    .insert(organizationMembers)
    .values({
      organizationId: organization.id,
      userId,
      role: isOwner ? "admin" : "manager",
    });
  const [program] = await db
    .insert(programs)
    .values({
      organizationId: organization.id,
      name: "Foundations of Creative Practice",
      type: "recorded",
      durationWeeks: 12,
      renewalWindowDays: 30,
    })
    .$returningId();
  const cohortIds = await db
    .insert(cohorts)
    .values([
      {
        programId: program.id,
        name: "Foundations · May",
        startDate: daysAgo(96),
        endDate: daysFromNow(12),
        status: "active",
      },
      {
        programId: program.id,
        name: "Accelerator · June",
        startDate: daysAgo(68),
        endDate: daysFromNow(40),
        status: "active",
      },
    ])
    .$returningId();
  const [mayCohort, juneCohort] = cohortIds;
  const studentIds = await db
    .insert(students)
    .values([
      {
        organizationId: organization.id,
        externalId: "ST-1001",
        name: "Amara Bello",
        email: "amara@example.edu",
        timezone: "Africa/Lagos",
        lifecycleState: "renewal_due",
        engagementState: "healthy",
        progressPercent: 78,
        lastLesson: "Lesson 08 · Preparing the next cycle",
        lastActivityAt: daysAgo(1),
        lastContactAt: daysAgo(9),
        source: "Imported CSV",
      },
      {
        organizationId: organization.id,
        externalId: "ST-1002",
        name: "Jonas Reid",
        email: "jonas@example.edu",
        timezone: "Europe/London",
        lifecycleState: "declining",
        engagementState: "declining",
        progressPercent: 61,
        lastLesson: "Lesson 05 · Feedback loops",
        lastActivityAt: daysAgo(11),
        lastContactAt: daysAgo(16),
        source: "Imported CSV",
      },
      {
        organizationId: organization.id,
        externalId: "ST-1003",
        name: "Lina Hsu",
        email: "lina@example.edu",
        timezone: "Asia/Taipei",
        lifecycleState: "active",
        engagementState: "healthy",
        progressPercent: 92,
        lastLesson: "Lesson 10 · Final reflection",
        lastActivityAt: daysAgo(0),
        lastContactAt: daysAgo(3),
        source: "Community sync",
      },
      {
        organizationId: organization.id,
        externalId: "ST-1004",
        name: "Celia Morgan",
        email: "celia@example.edu",
        timezone: "America/New_York",
        lifecycleState: "onboarding",
        engagementState: "watch",
        progressPercent: 43,
        lastLesson: "Lesson 02 · Joining the practice",
        lastActivityAt: daysAgo(3),
        lastContactAt: daysAgo(4),
        source: "Checkout",
      },
      {
        organizationId: organization.id,
        externalId: "ST-1005",
        name: "Omar Nasser",
        email: "omar@example.edu",
        timezone: "Asia/Dubai",
        lifecycleState: "active",
        engagementState: "healthy",
        progressPercent: 84,
        lastLesson: "Lesson 09 · Sharing your work",
        lastActivityAt: daysAgo(0),
        lastContactAt: daysAgo(8),
        source: "Community sync",
      },
      {
        organizationId: organization.id,
        externalId: "ST-1006",
        name: "Jun Park",
        email: "jun@example.edu",
        timezone: "Asia/Seoul",
        lifecycleState: "renewal_due",
        engagementState: "watch",
        progressPercent: 51,
        lastLesson: "Lesson 06 · Collaboration",
        lastActivityAt: daysAgo(5),
        lastContactAt: null,
        source: "Imported CSV",
      },
    ])
    .$returningId();
  const [amara, jonas, lina, celia, omar, jun] = studentIds;
  await db.insert(enrollments).values([
    {
      studentId: amara.id,
      programId: program.id,
      cohortId: mayCohort.id,
      enrolledAt: daysAgo(96),
    },
    {
      studentId: jonas.id,
      programId: program.id,
      cohortId: mayCohort.id,
      enrolledAt: daysAgo(96),
    },
    {
      studentId: omar.id,
      programId: program.id,
      cohortId: mayCohort.id,
      enrolledAt: daysAgo(95),
    },
    {
      studentId: jun.id,
      programId: program.id,
      cohortId: mayCohort.id,
      enrolledAt: daysAgo(94),
    },
    {
      studentId: lina.id,
      programId: program.id,
      cohortId: juneCohort.id,
      enrolledAt: daysAgo(67),
    },
    {
      studentId: celia.id,
      programId: program.id,
      cohortId: juneCohort.id,
      enrolledAt: daysAgo(4),
    },
  ]);
  await db.insert(subscriptions).values([
    {
      studentId: amara.id,
      plan: "Annual community",
      status: "active",
      startDate: daysAgo(364),
      renewalDate: daysFromNow(12),
    },
    {
      studentId: jun.id,
      plan: "Annual community",
      status: "active",
      startDate: daysAgo(360),
      renewalDate: daysFromNow(14),
    },
    {
      studentId: lina.id,
      plan: "Annual community",
      status: "active",
      startDate: daysAgo(341),
      renewalDate: daysFromNow(29),
    },
    {
      studentId: celia.id,
      plan: "Annual community",
      status: "active",
      startDate: daysAgo(4),
      renewalDate: daysFromNow(361),
    },
  ]);
  const lessonIds = await db
    .insert(lessons)
    .values([
      {
        programId: program.id,
        title: "Finding a practice rhythm",
        chapter: "Start here",
        orderIndex: 1,
        durationMinutes: 21,
        transcript:
          "A steady practice begins with a small, repeatable commitment. Notice what makes participation easy and make the next step visible.",
      },
      {
        programId: program.id,
        title: "Joining the practice",
        chapter: "Community foundations",
        orderIndex: 2,
        durationMinutes: 18,
        transcript:
          "The community is a working space. Introduce your current focus, respond to two peers, and book the first office-hour session that supports your learning.",
      },
      {
        programId: program.id,
        title: "Feedback loops",
        chapter: "Critique framework",
        orderIndex: 5,
        durationMinutes: 26,
        transcript:
          "Peer feedback works when it is specific, actionable, and connected to the creator's stated goal. Use a notice, question, suggestion sequence before you offer an opinion.",
      },
      {
        programId: program.id,
        title: "Preparing the next cycle",
        chapter: "Reflection",
        orderIndex: 8,
        durationMinutes: 22,
        transcript:
          "Before a new cycle, name what changed, choose a stronger question, and decide which practice you want peers to help you sustain.",
      },
    ])
    .$returningId();
  await db.insert(lessonEvents).values([
    {
      studentId: amara.id,
      lessonId: lessonIds[3].id,
      eventType: "progressed",
      occurredAt: daysAgo(1),
      metadata: { progress: 78 },
    },
    {
      studentId: jonas.id,
      lessonId: lessonIds[2].id,
      eventType: "progressed",
      occurredAt: daysAgo(11),
      metadata: { progress: 61 },
    },
    {
      studentId: lina.id,
      lessonId: lessonIds[3].id,
      eventType: "completed",
      occurredAt: daysAgo(0),
      metadata: { progress: 92 },
    },
    {
      studentId: celia.id,
      lessonId: lessonIds[1].id,
      eventType: "started",
      occurredAt: daysAgo(3),
      metadata: { progress: 43 },
    },
  ]);
  await db.insert(communityEvents).values([
    {
      studentId: amara.id,
      eventType: "workshop",
      source: "Circle",
      summary: "Registered for the September peer workshop.",
      occurredAt: daysAgo(1),
    },
    {
      studentId: omar.id,
      eventType: "comment",
      source: "Circle",
      summary: "Shared constructive feedback in the portfolio critique thread.",
      occurredAt: daysAgo(0),
    },
    {
      studentId: lina.id,
      eventType: "submission",
      source: "Circle",
      summary: "Submitted a final challenge reflection.",
      occurredAt: daysAgo(0),
    },
    {
      studentId: jonas.id,
      eventType: "post",
      source: "Circle",
      summary: "Last community contribution before the recent activity gap.",
      occurredAt: daysAgo(8),
    },
  ]);
  await db.insert(studentSignals).values([
    {
      studentId: amara.id,
      type: "renewal_opportunity",
      value: 88,
      periodLabel: "30-day renewal window",
      explanation:
        "Strong learning progress and current community participation indicate an opportunity for evidence-led outreach.",
      evidence: { daysToRenewal: 12, courseProgress: 78, communityEvents7d: 2 },
      state: "open",
    },
    {
      studentId: jonas.id,
      type: "engagement_drop",
      value: -31,
      periodLabel: "14-day activity window",
      explanation:
        "Course and community activity are both below Jonas's personal baseline; review the underlying events before labelling risk.",
      evidence: {
        daysSinceCourse: 11,
        daysSinceCommunity: 8,
        baselineDelta: -31,
      },
      state: "open",
    },
    {
      studentId: lina.id,
      type: "top_performer",
      value: 94,
      periodLabel: "Current program cycle",
      explanation:
        "High completion, assessed output, and reliable participation support a top-performer review.",
      evidence: { courseProgress: 92, submissions: 4, improvement: 18 },
      state: "open",
    },
    {
      studentId: celia.id,
      type: "onboarding_gap",
      value: 1,
      periodLabel: "First 7 days",
      explanation:
        "The first support session is still unbooked after enrollment.",
      evidence: { daysSinceEnrollment: 4, bookingCompleted: false },
      state: "open",
    },
    {
      studentId: omar.id,
      type: "community_contributor",
      value: 16,
      periodLabel: "30-day community window",
      explanation:
        "Consistent constructive peer contribution supports a community-contributor recognition review.",
      evidence: { helpfulComments: 16, workshopAttendance: 3 },
      state: "open",
    },
  ]);
  await db.insert(renewalCases).values([
    {
      studentId: amara.id,
      renewalDate: daysFromNow(12),
      state: "planned",
      ownerUserId: userId,
      nextAction:
        "Review evidence and draft a respectful renewal conversation.",
    },
    {
      studentId: jun.id,
      renewalDate: daysFromNow(14),
      state: "not_started",
      ownerUserId: userId,
      nextAction:
        "Confirm last-contact data before selecting an outreach angle.",
    },
    {
      studentId: lina.id,
      renewalDate: daysFromNow(29),
      state: "not_started",
      ownerUserId: userId,
      nextAction: "Invite a reflection on next-cycle goals.",
    },
  ]);
  await db.insert(interventions).values([
    {
      studentId: celia.id,
      type: "onboarding",
      priority: "high",
      ownerUserId: userId,
      reason: "First support session is not booked after enrollment.",
      nextAction:
        "Offer two support-session times and confirm the setup checklist.",
      status: "open",
      dueDate: daysFromNow(1),
    },
    {
      studentId: amara.id,
      type: "renewal",
      priority: "high",
      ownerUserId: userId,
      reason:
        "Renewal is due in 12 days with active learning and community signals.",
      nextAction:
        "Prepare a value-led conversation using the current cycle evidence.",
      status: "in_progress",
      dueDate: daysFromNow(3),
    },
    {
      studentId: jonas.id,
      type: "disengagement",
      priority: "medium",
      ownerUserId: userId,
      reason: "Activity drop across both course and community windows.",
      nextAction:
        "Ask whether scheduling, clarity, or access is blocking the next lesson.",
      status: "open",
      dueDate: daysFromNow(2),
    },
  ]);
  await db.insert(achievements).values([
    {
      studentId: lina.id,
      type: "top_performer",
      source: "Current program evidence",
      evidence: { completion: 92, submissions: 4, mentorAssessment: "strong" },
    },
    {
      studentId: omar.id,
      type: "community_contributor",
      source: "30-day community activity",
      evidence: { helpfulComments: 16, workshops: 3 },
    },
  ]);
  const instructorIds = await db
    .insert(instructors)
    .values([
      {
        organizationId: organization.id,
        name: "Maya Chen",
        email: "maya@eloquenta.example",
      },
      {
        organizationId: organization.id,
        name: "Noah Patel",
        email: "noah@eloquenta.example",
      },
      {
        organizationId: organization.id,
        name: "Ava Moss",
        email: "ava@eloquenta.example",
      },
    ])
    .$returningId();
  const start = new Date();
  start.setHours(10, 0, 0, 0);
  await db.insert(sessions).values([
    {
      programId: program.id,
      cohortId: mayCohort.id,
      instructorId: instructorIds[0].id,
      title: "Office hours · Foundations",
      startsAt: start,
      endsAt: new Date(start.getTime() + 60 * 60 * 1000),
      capacity: 18,
      attendeeCount: 14,
      status: "scheduled",
      notes: "4 late check-ins",
    },
    {
      programId: program.id,
      cohortId: mayCohort.id,
      instructorId: instructorIds[1].id,
      title: "Portfolio feedback",
      startsAt: new Date(start.getTime() + 3.5 * 60 * 60 * 1000),
      endsAt: new Date(start.getTime() + 4.5 * 60 * 60 * 1000),
      capacity: 6,
      attendeeCount: 6,
      status: "scheduled",
      notes: "Ready",
    },
    {
      programId: program.id,
      cohortId: juneCohort.id,
      instructorId: instructorIds[2].id,
      title: "Community critique",
      startsAt: new Date(start.getTime() + 6 * 60 * 60 * 1000),
      endsAt: new Date(start.getTime() + 7 * 60 * 60 * 1000),
      capacity: 14,
      attendeeCount: 11,
      status: "scheduled",
      notes: "1 cancellation",
    },
  ]);
  await db.insert(contentIdeas).values([
    {
      organizationId: organization.id,
      title: "How to give feedback that moves a project forward",
      source: "8 related course questions · Lesson 05",
      audience: "Current learners",
      theme: "Peer feedback",
      objective: "Turn a recurring question into a usable critique framework.",
      evidence: { lessonId: lessonIds[2].id, recurringQuestions: 8 },
      status: "backlog",
    },
    {
      organizationId: organization.id,
      title: "A first-week checklist for community participation",
      source: "New entrant setup signals",
      audience: "New students",
      theme: "Onboarding",
      objective:
        "Reduce first-week uncertainty and improve early participation.",
      evidence: { onboardingGaps: 1 },
      status: "approved",
    },
    {
      organizationId: organization.id,
      title: "What growth looks like after the first course cycle",
      source: "Renewal evidence review",
      audience: "Renewal window",
      theme: "Progress reflection",
      objective: "Support a respectful conversation about the next cycle.",
      evidence: { renewalCandidates: 3 },
      status: "backlog",
    },
  ]);
  await db
    .insert(dataQualityIssues)
    .values({
      organizationId: organization.id,
      source: "Imported CSV",
      issueType: "Missing last-contact date",
      severity: "medium",
      status: "open",
      details:
        "Jun Park has a renewal date but no imported last-contact event.",
    });
  await db.insert(businessReviews).values({
    organizationId: organization.id,
    periodStart: daysAgo(7),
    periodEnd: new Date(),
    metrics: {
      activeStudents: 5,
      engagementChange: 6.4,
      renewalDue: 3,
      dataQualityOpen: 1,
    },
    narrative:
      "Observed change: community participation and active learning improved in the current window. Hypothesis: this may be linked to the recent critique workshop; confirm with attendance and content data before making a causal claim.",
    actions: [
      {
        owner: "Operations",
        action: "Review Amara's evidence-led renewal plan.",
      },
      {
        owner: "Coordinator",
        action: "Confirm Jun's missing last-contact data.",
      },
      { owner: "Mentor", action: "Review Jonas's activity context." },
    ],
  });
  return organization.id;
}

export async function ensureWorkspace(user: {
  id: number;
  openId: string;
  role: "user" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const memberships = await db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, user.id))
    .limit(1);
  if (memberships[0]) return memberships[0].organizationId;
  return createDemoWorkspace(db, user.id, user.role === "admin");
}

async function assertStudentScope(
  db: Db,
  organizationId: number,
  studentId: number
) {
  const result = await db
    .select()
    .from(students)
    .where(
      and(
        eq(students.id, studentId),
        eq(students.organizationId, organizationId)
      )
    )
    .limit(1);
  if (!result[0]) throw new Error("Student is outside the current workspace");
  return result[0];
}

export async function getWorkspaceData(user: {
  id: number;
  openId: string;
  role: "user" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  const workspaceStudents = await db
    .select()
    .from(students)
    .where(eq(students.organizationId, organizationId))
    .orderBy(asc(students.name));
  const studentIds = workspaceStudents.map(student => student.id);
  const [
    workspacePrograms,
    workspaceCohorts,
    workspaceContent,
    workspaceSessions,
    workspaceInstructors,
    reviews,
    issues,
  ] = await Promise.all([
    db
      .select()
      .from(programs)
      .where(eq(programs.organizationId, organizationId)),
    db.select().from(cohorts),
    db
      .select()
      .from(contentIdeas)
      .where(eq(contentIdeas.organizationId, organizationId))
      .orderBy(desc(contentIdeas.createdAt)),
    db.select().from(sessions).orderBy(asc(sessions.startsAt)),
    db
      .select()
      .from(instructors)
      .where(eq(instructors.organizationId, organizationId)),
    db
      .select()
      .from(businessReviews)
      .where(eq(businessReviews.organizationId, organizationId))
      .orderBy(desc(businessReviews.createdAt))
      .limit(1),
    db
      .select()
      .from(dataQualityIssues)
      .where(
        and(
          eq(dataQualityIssues.organizationId, organizationId),
          eq(dataQualityIssues.status, "open")
        )
      ),
  ]);
  if (studentIds.length === 0)
    return {
      organization,
      programs: workspacePrograms,
      cohorts: [],
      students: [],
      signals: [],
      renewals: [],
      interventions: [],
      achievements: [],
      lessons: [],
      communityEvents: [],
      contentIdeas: workspaceContent,
      sessions: workspaceSessions,
      instructors: workspaceInstructors,
      review: reviews[0] ?? null,
      dataQualityIssues: issues,
      stats: {
        activeStudents: 0,
        renewalDue: 0,
        openSignals: 0,
        sessionsToday: 0,
      },
    };
  const [
    workspaceEnrollments,
    workspaceSignals,
    workspaceRenewals,
    workspaceInterventions,
    workspaceAchievements,
    workspaceCommunity,
    workspaceLessonEvents,
    workspaceSubscriptions,
  ] = await Promise.all([
    db
      .select()
      .from(enrollments)
      .where(inArray(enrollments.studentId, studentIds)),
    db
      .select()
      .from(studentSignals)
      .where(inArray(studentSignals.studentId, studentIds))
      .orderBy(desc(studentSignals.createdAt)),
    db
      .select()
      .from(renewalCases)
      .where(inArray(renewalCases.studentId, studentIds))
      .orderBy(asc(renewalCases.renewalDate)),
    db
      .select()
      .from(interventions)
      .where(inArray(interventions.studentId, studentIds))
      .orderBy(desc(interventions.updatedAt)),
    db
      .select()
      .from(achievements)
      .where(inArray(achievements.studentId, studentIds))
      .orderBy(desc(achievements.awardedAt)),
    db
      .select()
      .from(communityEvents)
      .where(inArray(communityEvents.studentId, studentIds))
      .orderBy(desc(communityEvents.occurredAt)),
    db
      .select()
      .from(lessonEvents)
      .where(inArray(lessonEvents.studentId, studentIds))
      .orderBy(desc(lessonEvents.occurredAt)),
    db
      .select()
      .from(subscriptions)
      .where(inArray(subscriptions.studentId, studentIds)),
  ]);
  const programIds = workspacePrograms.map(program => program.id);
  const workspaceLessons = programIds.length
    ? await db
        .select()
        .from(lessons)
        .where(inArray(lessons.programId, programIds))
        .orderBy(asc(lessons.orderIndex))
    : [];
  const enrichedStudents = workspaceStudents.map(student => ({
    ...student,
    enrollment:
      workspaceEnrollments.find(
        enrollment => enrollment.studentId === student.id
      ) ?? null,
    subscription:
      workspaceSubscriptions.find(
        subscription => subscription.studentId === student.id
      ) ?? null,
    renewal:
      workspaceRenewals.find(renewal => renewal.studentId === student.id) ??
      null,
    signals: workspaceSignals.filter(signal => signal.studentId === student.id),
    interventions: workspaceInterventions.filter(
      intervention => intervention.studentId === student.id
    ),
  }));
  return {
    organization,
    programs: workspacePrograms,
    cohorts: workspaceCohorts.filter(cohort =>
      programIds.includes(cohort.programId)
    ),
    students: enrichedStudents,
    signals: workspaceSignals,
    renewals: workspaceRenewals,
    interventions: workspaceInterventions,
    achievements: workspaceAchievements,
    lessons: workspaceLessons,
    communityEvents: workspaceCommunity,
    lessonEvents: workspaceLessonEvents,
    contentIdeas: workspaceContent,
    sessions: workspaceSessions.filter(session =>
      programIds.includes(session.programId)
    ),
    instructors: workspaceInstructors,
    review: reviews[0] ?? null,
    dataQualityIssues: issues,
    stats: {
      activeStudents: workspaceStudents.filter(student =>
        ["active", "renewal_due", "declining", "onboarding"].includes(
          student.lifecycleState
        )
      ).length,
      renewalDue: workspaceRenewals.filter(renewal =>
        ["not_started", "planned", "contacted"].includes(renewal.state)
      ).length,
      openSignals: workspaceSignals.filter(signal => signal.state === "open")
        .length,
      sessionsToday: workspaceSessions.filter(
        session =>
          new Date(session.startsAt).toDateString() ===
          new Date().toDateString()
      ).length,
    },
  };
}

export async function getStudent360(
  user: { id: number; openId: string; role: "user" | "admin" },
  studentId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  const student = await assertStudentScope(db, organizationId, studentId);
  const [
    enrollment,
    subscription,
    signals,
    studentInterventions,
    renewal,
    community,
    learningEvents,
    studentAchievements,
  ] = await Promise.all([
    db
      .select()
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId))
      .limit(1),
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.studentId, studentId))
      .limit(1),
    db
      .select()
      .from(studentSignals)
      .where(eq(studentSignals.studentId, studentId))
      .orderBy(desc(studentSignals.createdAt)),
    db
      .select()
      .from(interventions)
      .where(eq(interventions.studentId, studentId))
      .orderBy(desc(interventions.updatedAt)),
    db
      .select()
      .from(renewalCases)
      .where(eq(renewalCases.studentId, studentId))
      .limit(1),
    db
      .select()
      .from(communityEvents)
      .where(eq(communityEvents.studentId, studentId))
      .orderBy(desc(communityEvents.occurredAt)),
    db
      .select()
      .from(lessonEvents)
      .where(eq(lessonEvents.studentId, studentId))
      .orderBy(desc(lessonEvents.occurredAt)),
    db
      .select()
      .from(achievements)
      .where(eq(achievements.studentId, studentId))
      .orderBy(desc(achievements.awardedAt)),
  ]);
  return {
    student,
    enrollment: enrollment[0] ?? null,
    subscription: subscription[0] ?? null,
    signals,
    interventions: studentInterventions,
    renewal: renewal[0] ?? null,
    community,
    learningEvents,
    achievements: studentAchievements,
  };
}

export async function createIntervention(
  user: { id: number; openId: string; role: "user" | "admin" },
  input: {
    studentId: number;
    type:
      | "onboarding"
      | "renewal"
      | "disengagement"
      | "support"
      | "recognition"
      | "content_followup";
    priority: "low" | "medium" | "high" | "urgent";
    reason: string;
    nextAction: string;
    dueDate?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  await assertStudentScope(db, organizationId, input.studentId);
  const [result] = await db
    .insert(interventions)
    .values({ ...input, ownerUserId: user.id, status: "open" })
    .$returningId();
  await db
    .insert(auditEvents)
    .values({
      organizationId,
      actorUserId: user.id,
      action: "intervention.created",
      objectType: "intervention",
      objectId: result.id,
      details: { studentId: input.studentId, type: input.type },
    });
  return result;
}

/**
 * The outcome-loop rule, pure so it can be pinned by tests directly: only a
 * terminal status (completed/dismissed) with an explicit outcome produces a
 * signal. An in-progress note is not evidence yet; a bare status change says
 * nothing about what happened.
 */
export function outcomeSignalFor(
  existing: { id: number; studentId: number; type: string },
  input: {
    status: "open" | "in_progress" | "waiting" | "completed" | "dismissed";
    outcome?: string;
  }
): typeof studentSignals.$inferInsert | null {
  const finished = input.status === "completed" || input.status === "dismissed";
  const outcome = input.outcome?.trim();
  if (!finished || !outcome) return null;
  return {
    studentId: existing.studentId,
    type: "intervention_outcome",
    value: 0,
    periodLabel: "intervention follow-up",
    explanation:
      `${existing.type.replaceAll("_", " ")} intervention ${input.status}: ${outcome}`.slice(
        0,
        500
      ),
    evidence: { interventionId: existing.id, status: input.status, outcome },
    state: "open",
  };
}

export async function updateIntervention(
  user: { id: number; openId: string; role: "user" | "admin" },
  input: {
    id: number;
    status: "open" | "in_progress" | "waiting" | "completed" | "dismissed";
    outcome?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  const existing = await db
    .select()
    .from(interventions)
    .where(eq(interventions.id, input.id))
    .limit(1);
  if (!existing[0]) throw new Error("Intervention not found");
  await assertStudentScope(db, organizationId, existing[0].studentId);
  await db
    .update(interventions)
    .set({
      status: input.status,
      outcome: input.outcome ?? existing[0].outcome,
    })
    .where(eq(interventions.id, input.id));
  await db
    .insert(auditEvents)
    .values({
      organizationId,
      actorUserId: user.id,
      action: "intervention.updated",
      objectType: "intervention",
      objectId: input.id,
      details: { status: input.status },
    });

  // A finished intervention with a recorded outcome re-enters the signal
  // stream, so the next triage pass sees what was tried and how it ended.
  const outcomeSignal = outcomeSignalFor(existing[0], input);
  if (outcomeSignal) await db.insert(studentSignals).values(outcomeSignal);

  return { success: true };
}

export async function updateRenewal(
  user: { id: number; openId: string; role: "user" | "admin" },
  input: {
    id: number;
    state:
      | "not_started"
      | "planned"
      | "contacted"
      | "renewed"
      | "churned"
      | "dismissed";
    nextAction?: string;
    outcome?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  const existing = await db
    .select()
    .from(renewalCases)
    .where(eq(renewalCases.id, input.id))
    .limit(1);
  if (!existing[0]) throw new Error("Renewal case not found");
  await assertStudentScope(db, organizationId, existing[0].studentId);
  await db
    .update(renewalCases)
    .set({
      state: input.state,
      nextAction: input.nextAction ?? existing[0].nextAction,
      outcome: input.outcome ?? existing[0].outcome,
    })
    .where(eq(renewalCases.id, input.id));
  await db
    .insert(auditEvents)
    .values({
      organizationId,
      actorUserId: user.id,
      action: "renewal.updated",
      objectType: "renewal_case",
      objectId: input.id,
      details: { state: input.state },
    });
  return { success: true };
}

export async function updateSignalState(
  user: { id: number; openId: string; role: "user" | "admin" },
  input: { id: number; state: "open" | "snoozed" | "dismissed" | "resolved" }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  const existing = await db
    .select()
    .from(studentSignals)
    .where(eq(studentSignals.id, input.id))
    .limit(1);
  if (!existing[0]) throw new Error("Signal not found");
  await assertStudentScope(db, organizationId, existing[0].studentId);
  await db
    .update(studentSignals)
    .set({ state: input.state })
    .where(eq(studentSignals.id, input.id));
  await db
    .insert(auditEvents)
    .values({
      organizationId,
      actorUserId: user.id,
      action: "signal.updated",
      objectType: "student_signal",
      objectId: input.id,
      details: { state: input.state },
    });
  return { success: true };
}

export async function createContentIdea(
  user: { id: number; openId: string; role: "user" | "admin" },
  input: {
    title: string;
    source: string;
    audience: string;
    theme: string;
    objective: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  const [result] = await db
    .insert(contentIdeas)
    .values({ organizationId, ...input, evidence: { origin: "manual" } })
    .$returningId();
  await db
    .insert(auditEvents)
    .values({
      organizationId,
      actorUserId: user.id,
      action: "content_idea.created",
      objectType: "content_idea",
      objectId: result.id,
      details: { title: input.title },
    });
  return result;
}

export async function searchCourse(
  user: { id: number; openId: string; role: "user" | "admin" },
  query: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  const workspacePrograms = await db
    .select()
    .from(programs)
    .where(eq(programs.organizationId, organizationId));
  const programIds = workspacePrograms.map(program => program.id);
  if (!programIds.length) return [];
  const allLessons = await db
    .select()
    .from(lessons)
    .where(inArray(lessons.programId, programIds))
    .orderBy(asc(lessons.orderIndex));
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return allLessons
    .filter(lesson =>
      terms.every(term =>
        `${lesson.title} ${lesson.chapter ?? ""} ${lesson.transcript ?? ""}`
          .toLowerCase()
          .includes(term)
      )
    )
    .slice(0, 5);
}

export async function saveAiRun(
  user: { id: number; openId: string; role: "user" | "admin" },
  model: string,
  inputSummary: string,
  output: object
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organizationId = await ensureWorkspace(user);
  await db
    .insert(aiRuns)
    .values({
      organizationId,
      userId: user.id,
      taskType: "operations_analysis",
      model,
      inputSummary,
      output,
    });
}
