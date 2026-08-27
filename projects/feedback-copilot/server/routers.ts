import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createFeedbackEntry,
  createSessionRecord,
  createStudent,
  getFeedbackHistory,
  getPendingReviewQueue,
  getSessionsForStudent,
  getStudentsForUser,
  studentBelongsToTeacher,
  updateFeedbackEntry,
  updateTeacherFeedbackEntry,
} from "./db";
import { buildFeedbackMessages, feedbackJsonSchema, feedbackSectionsSchema, feedbackStatusValues } from "./feedback";
import { invokeLLM } from "./_core/llm";

const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "teacher") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only teacher users can create or edit feedback." });
  }
  return next();
});

const coordinatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "coordinator") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only coordinator users can review feedback." });
  }
  return next();
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  feedback: router({
    students: protectedProcedure.query(({ ctx }) =>
      getStudentsForUser(ctx.user.id, ctx.user.role)
    ),
    sessions: protectedProcedure
      .input(z.object({ studentId: z.number().int().positive() }))
      .query(({ ctx, input }) => getSessionsForStudent(input.studentId, ctx.user.id, ctx.user.role)),
    history: protectedProcedure
      .input(z.object({ studentId: z.number().int().positive(), status: z.enum(feedbackStatusValues).optional() }))
      .query(({ ctx, input }) => getFeedbackHistory(input.studentId, ctx.user.id, ctx.user.role, input.status)),
    pendingReviews: coordinatorProcedure.query(() => getPendingReviewQueue()),
    createStudent: teacherProcedure
      .input(z.object({ name: z.string().trim().min(2).max(160), className: z.string().trim().min(2).max(120), programme: z.string().trim().min(2).max(160), level: z.string().trim().max(80).optional(), learningGoals: z.string().trim().max(3000).optional() }))
      .mutation(({ ctx, input }) =>
        createStudent({ ...input, teacherId: ctx.user.id, activeStatus: "active" })
      ),
    createSession: teacherProcedure
      .input(z.object({ studentId: z.number().int().positive(), sessionDate: z.date(), sessionNumber: z.number().int().positive(), durationMinutes: z.number().int().positive().max(600), topic: z.string().trim().min(2).max(240), objectives: z.string().trim().max(5000).optional(), sessionNotes: z.string().trim().max(10000).optional(), observations: z.string().trim().max(10000).optional(), artifacts: z.string().trim().max(5000).optional() }))
      .mutation(async ({ ctx, input }) => {
        const ownsStudent = await studentBelongsToTeacher(input.studentId, ctx.user.id);
        if (!ownsStudent) throw new TRPCError({ code: "FORBIDDEN", message: "Teachers can only add sessions for their own students." });
        return createSessionRecord({ ...input, teacherId: ctx.user.id });
      }),
    generate: teacherProcedure
      .input(z.object({ studentName: z.string().min(1), sessionTopic: z.string().min(1), evidence: z.string().min(1).max(20000) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: buildFeedbackMessages(input),
          response_format: { type: "json_schema", json_schema: feedbackJsonSchema },
          max_tokens: 800,
        });
        return response.choices[0]?.message.content ?? "";
      }),
    save: teacherProcedure
      .input(z.object({ studentId: z.number().int().positive(), sessionId: z.number().int().positive(), sections: feedbackSectionsSchema, status: z.enum(feedbackStatusValues).default("draft") }))
      .mutation(async ({ ctx, input }) => {
        const feedbackId = await createFeedbackEntry({
          studentId: input.studentId,
          sessionId: input.sessionId,
          teacherId: ctx.user.id,
          strengths: input.sections.strengths,
          areasForImprovement: input.sections.areasForImprovement,
          nextSteps: input.sections.nextSteps,
          status: input.status,
        });
        return { feedbackId };
      }),
    edit: teacherProcedure
      .input(z.object({ feedbackId: z.number().int().positive(), sections: feedbackSectionsSchema }))
      .mutation(async ({ ctx, input }) => {
        await updateTeacherFeedbackEntry(input.feedbackId, ctx.user.id, {
          strengths: input.sections.strengths,
          areasForImprovement: input.sections.areasForImprovement,
          nextSteps: input.sections.nextSteps,
          status: "draft",
        });
        return { status: "draft" as const };
      }),
    submit: teacherProcedure
      .input(z.object({ feedbackId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await updateTeacherFeedbackEntry(input.feedbackId, ctx.user.id, { status: "pending review" });
        return { status: "pending review" as const };
      }),
    review: coordinatorProcedure
      .input(z.object({ feedbackId: z.number().int().positive(), decision: z.enum(["approved", "draft"]), comment: z.string().trim().max(3000).optional() }).superRefine((value, ctx) => {
        if (value.decision === "draft" && !value.comment) ctx.addIssue({ code: "custom", path: ["comment"], message: "A coordinator comment is required when returning feedback as a draft." });
      }))
      .mutation(async ({ ctx, input }) => {
        await updateFeedbackEntry(input.feedbackId, {
          status: input.decision,
          coordinatorId: ctx.user.id,
          coordinatorComment: input.comment || null,
        });
        return { status: input.decision };
      }),
    comment: coordinatorProcedure
      .input(z.object({ feedbackId: z.number().int().positive(), comment: z.string().trim().min(1).max(3000) }))
      .mutation(async ({ ctx, input }) => {
        await updateFeedbackEntry(input.feedbackId, {
          coordinatorId: ctx.user.id,
          coordinatorComment: input.comment,
        });
        return { saved: true as const };
      }),
  }),
});

export type AppRouter = typeof appRouter;
