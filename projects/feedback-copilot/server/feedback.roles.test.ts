import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "teacher" | "coordinator"): TrpcContext {
  return {
    user: {
      id: 14,
      openId: `${role}-user`,
      name: `${role} user`,
      email: null,
      loginMethod: null,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("feedback role enforcement", () => {
  it("does not allow a coordinator to generate a teacher feedback draft", async () => {
    const caller = appRouter.createCaller(createContext("coordinator"));

    await expect(
      caller.feedback.generate({
        studentName: "Sample learner",
        sessionTopic: "Conditional statements",
        evidence: "The learner created an if statement.",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not allow a teacher to make a coordinator review decision", async () => {
    const caller = appRouter.createCaller(createContext("teacher"));

    await expect(
      caller.feedback.review({
        feedbackId: 1,
        decision: "approved",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not allow a teacher to access the coordinator review queue", async () => {
    const caller = appRouter.createCaller(createContext("teacher"));

    await expect(caller.feedback.pendingReviews()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("does not allow a teacher to add a coordinator comment", async () => {
    const caller = appRouter.createCaller(createContext("teacher"));

    await expect(
      caller.feedback.comment({ feedbackId: 1, comment: "Please clarify the next step." })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
