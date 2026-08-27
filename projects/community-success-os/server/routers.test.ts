import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getWorkspaceData: vi.fn(),
  createIntervention: vi.fn(),
  updateIntervention: vi.fn(),
  updateRenewal: vi.fn(),
  updateSignalState: vi.fn(),
  createContentIdea: vi.fn(),
  getStudent360: vi.fn(),
  searchCourse: vi.fn(),
  saveAiRun: vi.fn(),
}));

const llmMocks = vi.hoisted(() => ({
  listLLMModels: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/llm", () => llmMocks);

import { appRouter } from "./routers";

const user = {
  id: 1,
  openId: "test-user",
  name: "Test User",
  email: "test@example.com",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const context = {
  user,
  req: { protocol: "https", headers: {} },
  res: { clearCookie: vi.fn() },
} as never;

const memberContext = {
  user: { ...user, id: 2, openId: "standard-member", role: "user" as const },
  req: { protocol: "https", headers: {} },
  res: { clearCookie: vi.fn() },
} as never;

const anonymousContext = {
  user: null,
  req: { protocol: "https", headers: {} },
  res: { clearCookie: vi.fn() },
} as never;

const workspace = {
  organization: { name: "Eloquenta Academy" },
  stats: { activeStudents: 4, renewalDue: 2, openSignals: 1, sessionsToday: 1 },
  students: [{ id: 11, name: "Amara Bello", progressPercent: 78, renewal: { state: "planned", renewalDate: new Date() } }],
  signals: [{ id: 12, studentId: 11, type: "renewal_opportunity", state: "open", explanation: "Strong progress", evidence: { courseProgress: 78 } }],
  interventions: [{ id: 13, studentId: 11, type: "renewal", priority: "high", status: "open", reason: "Renewal due", nextAction: "Review context" }],
  dataQualityIssues: [{ id: 14 }],
};

describe("Community Success OS protected API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getWorkspaceData.mockResolvedValue(workspace);
    dbMocks.createIntervention.mockResolvedValue({ id: 91 });
    dbMocks.updateRenewal.mockResolvedValue({ id: 51 });
    dbMocks.updateIntervention.mockResolvedValue({ id: 13 });
    dbMocks.createContentIdea.mockResolvedValue({ id: 61 });
    llmMocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-mini" }] });
    llmMocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ observedFacts: ["4 active students"], signals: ["2 open renewals"], interpretation: "A review is warranted.", recommendedActions: ["Review Amara's next action."], limitations: ["No contact outcome supplied."], evidence: ["Course progress 78%"] }) } }] });
  });

  it("returns scoped workspace data for an authenticated user", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.workspace.data()).resolves.toEqual(workspace);
    expect(dbMocks.getWorkspaceData).toHaveBeenCalledWith(user);
  });

  it("rejects anonymous access before a protected workspace query reaches the data layer", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.workspace.data()).rejects.toThrow();
    expect(dbMocks.getWorkspaceData).not.toHaveBeenCalled();
  });

  it("permits the admin audit boundary only for an administrator", async () => {
    const adminCaller = appRouter.createCaller(context);
    await expect(adminCaller.admin.audit()).resolves.toEqual({ workspaceName: "Eloquenta Academy", openDataQualityIssues: 1, openInterventions: 1 });
    const memberCaller = appRouter.createCaller(memberContext);
    await expect(memberCaller.admin.audit()).rejects.toThrow();
  });

  it("rejects malformed intervention payloads before persistence", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.interventions.create({ studentId: 11, type: "support", priority: "medium", reason: "no", nextAction: "short" })).rejects.toThrow();
    expect(dbMocks.createIntervention).not.toHaveBeenCalled();
  });

  it("passes a valid human-owned intervention to the scoped persistence layer", async () => {
    const caller = appRouter.createCaller(context);
    const payload = { studentId: 11, type: "renewal" as const, priority: "high" as const, reason: "Renewal is due and evidence needs review.", nextAction: "Assign a human outreach owner." };
    await expect(caller.interventions.create(payload)).resolves.toEqual({ id: 91 });
    expect(dbMocks.createIntervention).toHaveBeenCalledWith(user, payload);
  });

  it("routes renewal, intervention status, and content changes through the authenticated persistence layer", async () => {
    const caller = appRouter.createCaller(context);
    const renewal = { id: 51, state: "contacted" as const, nextAction: "Send a context-led note." };
    const intervention = { id: 13, status: "completed" as const, outcome: "Support session booked." };
    const content = { title: "Feedback framework", source: "Lesson 04", audience: "Current learners", theme: "Peer review", objective: "Clarify how to give useful feedback." };
    await expect(caller.renewals.update(renewal)).resolves.toEqual({ id: 51 });
    await expect(caller.interventions.update(intervention)).resolves.toEqual({ id: 13 });
    await expect(caller.content.create(content)).resolves.toEqual({ id: 61 });
    expect(dbMocks.updateRenewal).toHaveBeenCalledWith(user, renewal);
    expect(dbMocks.updateIntervention).toHaveBeenCalledWith(user, intervention);
    expect(dbMocks.createContentIdea).toHaveBeenCalledWith(user, content);
  });

  it("records an explainable analyst response grounded in workspace metrics", async () => {
    const caller = appRouter.createCaller(context);
    const result = await caller.ai.analyze({ question: "Which renewal case needs a clearer next action?" });
    expect(result.observedFacts).toEqual(["4 active students"]);
    expect(result.evidence).toEqual(["Course progress 78%"]);
    expect(llmMocks.invokeLLM).toHaveBeenCalledTimes(1);
    expect(dbMocks.saveAiRun).toHaveBeenCalledWith(user, "gpt-5-mini", "Which renewal case needs a clearer next action?", result);
  });
});
