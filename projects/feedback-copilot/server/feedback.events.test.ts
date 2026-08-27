/*
 * The transition log is the feature: every state change writes an event with
 * its actor, and reads are scoped by requester. These tests pin the router
 * layer — the right action string for the right transition, and the requester
 * identity forwarded to the scoped read.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createFeedbackEntry: vi.fn(async () => 7),
  createSessionRecord: vi.fn(),
  createStudent: vi.fn(),
  getFeedbackHistory: vi.fn(async () => []),
  getPendingReviewQueue: vi.fn(async () => []),
  getSessionsForStudent: vi.fn(async () => []),
  getStudentsForUser: vi.fn(async () => []),
  studentBelongsToTeacher: vi.fn(async () => true),
  updateFeedbackEntry: vi.fn(),
  updateTeacherFeedbackEntry: vi.fn(),
  recordFeedbackEvent: vi.fn(),
  getFeedbackEvents: vi.fn(async () => []),
}));

import * as db from "./db";

function contextFor(role: "teacher" | "coordinator", id = 14): TrpcContext {
  return {
    user: {
      id,
      name: `${role} user`,
      email: `${role}@example.com`,
      passwordHash: null,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as TrpcContext["user"],
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("feedback transition log", () => {
  it("records creation with the actor when a draft is saved", async () => {
    const caller = appRouter.createCaller(contextFor("teacher"));
    await caller.feedback.save({
      studentId: 1,
      sessionId: 2,
      sections: { strengths: "s", areasForImprovement: "a", nextSteps: "n" },
      status: "draft",
    });

    expect(db.recordFeedbackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ feedbackId: 7, actorId: 14, actorRole: "teacher", action: "created draft" })
    );
  });

  it("records submission", async () => {
    const caller = appRouter.createCaller(contextFor("teacher"));
    await caller.feedback.submit({ feedbackId: 5 });

    expect(db.recordFeedbackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ feedbackId: 5, actorRole: "teacher", action: "submitted for review" })
    );
  });

  it("records an approval and a return distinctly, with the comment attached", async () => {
    const caller = appRouter.createCaller(contextFor("coordinator", 22));

    await caller.feedback.review({ feedbackId: 5, decision: "approved" });
    expect(db.recordFeedbackEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({ actorId: 22, actorRole: "coordinator", action: "approved" })
    );

    await caller.feedback.review({ feedbackId: 5, decision: "draft", comment: "Cite the session." });
    expect(db.recordFeedbackEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: "returned to draft", comment: "Cite the session." })
    );
  });

  it("forwards the requester's identity to the scoped event read", async () => {
    const caller = appRouter.createCaller(contextFor("teacher", 31));
    await caller.feedback.events({ feedbackId: 9 });

    // Scoping happens in the data layer; the router must hand it who is asking.
    expect(db.getFeedbackEvents).toHaveBeenCalledWith(9, { id: 31, role: "teacher" });
  });

  it("writes no event when the underlying mutation fails", async () => {
    vi.mocked(db.updateTeacherFeedbackEntry).mockRejectedValueOnce(new Error("db down"));
    const caller = appRouter.createCaller(contextFor("teacher"));

    await expect(caller.feedback.submit({ feedbackId: 5 })).rejects.toThrow();
    expect(db.recordFeedbackEvent).not.toHaveBeenCalled();
  });
});
