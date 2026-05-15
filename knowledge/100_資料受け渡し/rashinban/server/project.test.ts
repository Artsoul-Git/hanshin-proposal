import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  createProject: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    title: "Test Project",
    background: "This is a test project background with more than 10 characters",
    targetPeriod: "6 months",
    constraints: null,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getProjectsByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      title: "Test Project",
      background: "This is a test project background",
      targetPeriod: "6 months",
      constraints: null,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getProjectById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    title: "Test Project",
    background: "This is a test project background",
    targetPeriod: "6 months",
    constraints: null,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateProjectStatus: vi.fn().mockResolvedValue(undefined),
  createHearingQuestions: vi.fn().mockResolvedValue([
    { id: 1, projectId: 1, question: "Test question 1", questionOrder: 0, createdAt: new Date() },
    { id: 2, projectId: 1, question: "Test question 2", questionOrder: 1, createdAt: new Date() },
    { id: 3, projectId: 1, question: "Test question 3", questionOrder: 2, createdAt: new Date() },
  ]),
  getHearingQuestionsByProjectId: vi.fn().mockResolvedValue([]),
  createHearingAnswers: vi.fn().mockResolvedValue(undefined),
  getHearingAnswersByProjectId: vi.fn().mockResolvedValue([]),
  createMandalaProposal: vi.fn().mockResolvedValue({
    id: 1,
    projectId: 1,
    categories: [],
    reasoning: "Test reasoning",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getMandalaProposalByProjectId: vi.fn().mockResolvedValue(null),
  updateMandalaProposalStatus: vi.fn().mockResolvedValue(undefined),
  createMandalaChart: vi.fn().mockResolvedValue({
    id: 1,
    projectId: 1,
    proposalId: 1,
    centerTheme: "Test Theme",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getMandalaChartByProjectId: vi.fn().mockResolvedValue(null),
  createMandalaItems: vi.fn().mockResolvedValue(undefined),
  getMandalaItemsByChartId: vi.fn().mockResolvedValue([]),
  getMandalaItemById: vi.fn().mockResolvedValue(null),
  updateMandalaItem: vi.fn().mockResolvedValue(undefined),
  markCategoryExpanded: vi.fn().mockResolvedValue(undefined),
  createFourQuadrantMatrix: vi.fn().mockResolvedValue({
    id: 1,
    projectId: 1,
    mandalaChartId: 1,
    sourceItemId: 1,
    title: "Test Matrix",
    xAxisLabel: "Urgency",
    yAxisLabel: "Importance",
    quadrants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getFourQuadrantMatricesByProjectId: vi.fn().mockResolvedValue([]),
  getFourQuadrantMatrixById: vi.fn().mockResolvedValue(null),
  createFlowDiagram: vi.fn().mockResolvedValue({
    id: 1,
    projectId: 1,
    matrixId: 1,
    sourceQuadrant: 0,
    title: "Test Flow",
    steps: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getFlowDiagramsByMatrixId: vi.fn().mockResolvedValue([]),
  getFlowDiagramById: vi.fn().mockResolvedValue(null),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("project.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a project for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.create({
      title: "Test Project",
      background: "This is a test project background with more than 10 characters",
      targetPeriod: "6 months",
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Test Project");
    expect(result.status).toBe("draft");
  });

  it("rejects unauthenticated requests", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.project.create({
        title: "Test Project",
        background: "This is a test project background with more than 10 characters",
      })
    ).rejects.toThrow();
  });
});

describe("project.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns projects for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("Test Project");
  });

  it("rejects unauthenticated requests", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.project.list()).rejects.toThrow();
  });
});

describe("project.get", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns project details for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.get({ id: 1 });

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Test Project");
  });

  it("rejects unauthenticated requests", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.project.get({ id: 1 })).rejects.toThrow();
  });
});
