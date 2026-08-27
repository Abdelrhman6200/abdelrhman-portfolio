import { COOKIE_NAME } from "../shared/const";
import {
  createContentIdea,
  createIntervention,
  getStudent360,
  getWorkspaceData,
  saveAiRun,
  searchCourse,
  updateIntervention,
  updateRenewal,
  updateSignalState,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";
import { z } from "zod";

const interventionInput = z.object({
  studentId: z.number().int().positive(),
  type: z.enum([
    "onboarding",
    "renewal",
    "disengagement",
    "support",
    "recognition",
    "content_followup",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  reason: z.string().min(6).max(1000),
  nextAction: z.string().min(6).max(1000),
  dueDate: z.date().optional(),
});

const analystSchema = {
  type: "json_schema" as const,
  json_schema: {
    name: "operations_analysis",
    strict: true,
    schema: {
      type: "object",
      properties: {
        observedFacts: { type: "array", items: { type: "string" } },
        signals: { type: "array", items: { type: "string" } },
        interpretation: { type: "string" },
        recommendedActions: { type: "array", items: { type: "string" } },
        limitations: { type: "array", items: { type: "string" } },
        evidence: { type: "array", items: { type: "string" } },
      },
      required: [
        "observedFacts",
        "signals",
        "interpretation",
        "recommendedActions",
        "limitations",
        "evidence",
      ],
      additionalProperties: false,
    },
  },
};

const analystOutputSchema = z.object({
  observedFacts: z.array(z.string()).max(12),
  signals: z.array(z.string()).max(12),
  interpretation: z.string().max(2000),
  recommendedActions: z.array(z.string()).max(12),
  limitations: z.array(z.string()).max(12),
  evidence: z.array(z.string()).max(18),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workspace: router({
    data: protectedProcedure.query(({ ctx }) => getWorkspaceData(ctx.user)),
  }),
  admin: router({
    audit: adminProcedure.query(async ({ ctx }) => {
      const workspace = await getWorkspaceData(ctx.user);
      return {
        workspaceName: workspace.organization?.name ?? null,
        openDataQualityIssues: workspace.dataQualityIssues.length,
        openInterventions: workspace.interventions.filter(
          intervention =>
            !["completed", "dismissed"].includes(intervention.status)
        ).length,
      };
    }),
  }),
  students: router({
    detail: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(({ ctx, input }) => getStudent360(ctx.user, input.id)),
  }),
  renewals: router({
    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          state: z.enum([
            "not_started",
            "planned",
            "contacted",
            "renewed",
            "churned",
            "dismissed",
          ]),
          nextAction: z.string().max(500).optional(),
          outcome: z.string().max(500).optional(),
        })
      )
      .mutation(({ ctx, input }) => updateRenewal(ctx.user, input)),
  }),
  interventions: router({
    create: protectedProcedure
      .input(interventionInput)
      .mutation(({ ctx, input }) => createIntervention(ctx.user, input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum([
            "open",
            "in_progress",
            "waiting",
            "completed",
            "dismissed",
          ]),
          outcome: z.string().max(1000).optional(),
        })
      )
      .mutation(({ ctx, input }) => updateIntervention(ctx.user, input)),
  }),
  signals: router({
    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          state: z.enum(["open", "snoozed", "dismissed", "resolved"]),
        })
      )
      .mutation(({ ctx, input }) => updateSignalState(ctx.user, input)),
  }),
  course: router({
    search: protectedProcedure
      .input(z.object({ query: z.string().min(2).max(240) }))
      .query(({ ctx, input }) => searchCourse(ctx.user, input.query)),
  }),
  content: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(4).max(320),
          source: z.string().min(4).max(240),
          audience: z.string().min(2).max(160),
          theme: z.string().min(2).max(160),
          objective: z.string().min(4).max(500),
        })
      )
      .mutation(({ ctx, input }) => createContentIdea(ctx.user, input)),
  }),
  ai: router({
    analyze: protectedProcedure
      .input(z.object({ question: z.string().min(8).max(500) }))
      .mutation(async ({ ctx, input }) => {
        const workspace = await getWorkspaceData(ctx.user);
        const { data: models } = await listLLMModels();
        const model =
          models.find(entry => entry.id === "gpt-5-mini")?.id ?? models[0]?.id;
        if (!model)
          throw new Error("No model is currently available for analysis");
        const metrics = {
          activeStudents: workspace.stats.activeStudents,
          renewalDue: workspace.stats.renewalDue,
          openSignals: workspace.stats.openSignals,
          sessionsToday: workspace.stats.sessionsToday,
          renewals: workspace.students.map(student => ({
            name: student.name,
            progress: student.progressPercent,
            state: student.renewal?.state ?? "none",
            renewalDate: student.renewal?.renewalDate ?? null,
          })),
          signals: workspace.signals
            .filter(signal => signal.state === "open")
            .map(signal => ({
              type: signal.type,
              explanation: signal.explanation,
              evidence: signal.evidence,
            })),
          openInterventions: workspace.interventions
            .filter(
              intervention =>
                !["completed", "dismissed"].includes(intervention.status)
            )
            .map(intervention => ({
              type: intervention.type,
              priority: intervention.priority,
              reason: intervention.reason,
              nextAction: intervention.nextAction,
            })),
        };
        const response = await invokeLLM({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are the AI operations analyst inside an EdTech Operations & Community OS. Use only the supplied workspace data. Never invent events, payment status, progress, outreach, or outcomes. Separate observed facts from interpretation. Do not predict churn or change any state. Recommend limited human actions and name the evidence used. If data is insufficient, state the limitation.",
            },
            {
              role: "user",
              content: `QUESTION\n${input.question}\n\nAUTHORIZED WORKSPACE DATA\n${JSON.stringify(metrics)}`,
            },
          ],
          response_format: analystSchema,
        });
        const content = response.choices[0]?.message.content;
        const analysisText = typeof content === "string" ? content : "";
        if (!analysisText) throw new Error("The analyst returned no content");
        let candidate: unknown;
        try {
          candidate = JSON.parse(analysisText);
        } catch {
          throw new Error(
            "The analyst returned an invalid structured response"
          );
        }
        const parsed = analystOutputSchema.safeParse(candidate);
        if (!parsed.success)
          throw new Error(
            "The analyst response did not meet the evidence contract"
          );
        const analysis = parsed.data;
        await saveAiRun(ctx.user, model, input.question, analysis);
        return analysis;
      }),
  }),
});

export type AppRouter = typeof appRouter;
