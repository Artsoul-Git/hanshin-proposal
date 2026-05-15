import { eq, and, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  projects, InsertProject, Project,
  hearingQuestions, InsertHearingQuestion, HearingQuestion,
  hearingAnswers, InsertHearingAnswer, HearingAnswer,
  mandalaProposals, InsertMandalaProposal, MandalaProposal,
  mandalaCharts, InsertMandalaChart, MandalaChart,
  mandalaItems, InsertMandalaItem, MandalaItem,
  fourQuadrantMatrices, InsertFourQuadrantMatrix, FourQuadrantMatrix,
  flowDiagrams, InsertFlowDiagram, FlowDiagram
} from "../drizzle/schema";
import { ENV } from './_core/env';

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

// User functions
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Project functions
export async function createProject(data: InsertProject): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projects).values(data);
  const insertId = result[0].insertId;
  const [project] = await db.select().from(projects).where(eq(projects.id, insertId));
  return project;
}

export async function getProjectsByUserId(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(asc(projects.createdAt));
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  return project;
}

export async function updateProjectStatus(id: number, status: Project["status"]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projects).set({ status }).where(eq(projects.id, id));
}

// Hearing Questions functions
export async function createHearingQuestions(questions: InsertHearingQuestion[]): Promise<HearingQuestion[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(hearingQuestions).values(questions);
  return db.select().from(hearingQuestions)
    .where(eq(hearingQuestions.projectId, questions[0].projectId))
    .orderBy(asc(hearingQuestions.questionOrder));
}

export async function getHearingQuestionsByProjectId(projectId: number): Promise<HearingQuestion[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(hearingQuestions)
    .where(eq(hearingQuestions.projectId, projectId))
    .orderBy(asc(hearingQuestions.questionOrder));
}

// Hearing Answers functions
export async function createHearingAnswers(answers: InsertHearingAnswer[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(hearingAnswers).values(answers);
}

export async function getHearingAnswersByProjectId(projectId: number): Promise<HearingAnswer[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(hearingAnswers).where(eq(hearingAnswers.projectId, projectId));
}

// Mandala Proposals functions
export async function createMandalaProposal(data: InsertMandalaProposal): Promise<MandalaProposal> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mandalaProposals).values(data);
  const insertId = result[0].insertId;
  const [proposal] = await db.select().from(mandalaProposals).where(eq(mandalaProposals.id, insertId));
  return proposal;
}

export async function getMandalaProposalByProjectId(projectId: number): Promise<MandalaProposal | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [proposal] = await db.select().from(mandalaProposals)
    .where(eq(mandalaProposals.projectId, projectId))
    .orderBy(asc(mandalaProposals.createdAt));
  return proposal;
}

export async function updateMandalaProposalStatus(id: number, status: MandalaProposal["status"]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(mandalaProposals).set({ status }).where(eq(mandalaProposals.id, id));
}

// Mandala Charts functions
export async function createMandalaChart(data: InsertMandalaChart): Promise<MandalaChart> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mandalaCharts).values(data);
  const insertId = result[0].insertId;
  const [chart] = await db.select().from(mandalaCharts).where(eq(mandalaCharts.id, insertId));
  return chart;
}

export async function getMandalaChartByProjectId(projectId: number): Promise<MandalaChart | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [chart] = await db.select().from(mandalaCharts).where(eq(mandalaCharts.projectId, projectId));
  return chart;
}

// Mandala Items functions
export async function createMandalaItems(items: InsertMandalaItem[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(mandalaItems).values(items);
}

export async function getMandalaItemsByChartId(chartId: number): Promise<MandalaItem[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(mandalaItems)
    .where(eq(mandalaItems.mandalaChartId, chartId))
    .orderBy(asc(mandalaItems.categoryIndex), asc(mandalaItems.itemIndex));
}

export async function getMandalaItemById(id: number): Promise<MandalaItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [item] = await db.select().from(mandalaItems).where(eq(mandalaItems.id, id));
  return item;
}

export async function updateMandalaItem(id: number, data: Partial<InsertMandalaItem>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(mandalaItems).set(data).where(eq(mandalaItems.id, id));
}

export async function markCategoryExpanded(chartId: number, categoryIndex: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(mandalaItems)
    .set({ isExpanded: true })
    .where(and(
      eq(mandalaItems.mandalaChartId, chartId),
      eq(mandalaItems.categoryIndex, categoryIndex),
      eq(mandalaItems.isCategory, true)
    ));
}

// Four Quadrant Matrices functions
export async function createFourQuadrantMatrix(data: InsertFourQuadrantMatrix): Promise<FourQuadrantMatrix> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(fourQuadrantMatrices).values(data);
  const insertId = result[0].insertId;
  const [matrix] = await db.select().from(fourQuadrantMatrices).where(eq(fourQuadrantMatrices.id, insertId));
  return matrix;
}

export async function getFourQuadrantMatricesByProjectId(projectId: number): Promise<FourQuadrantMatrix[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(fourQuadrantMatrices).where(eq(fourQuadrantMatrices.projectId, projectId));
}

export async function getFourQuadrantMatrixById(id: number): Promise<FourQuadrantMatrix | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [matrix] = await db.select().from(fourQuadrantMatrices).where(eq(fourQuadrantMatrices.id, id));
  return matrix;
}

// Flow Diagrams functions
export async function createFlowDiagram(data: InsertFlowDiagram): Promise<FlowDiagram> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(flowDiagrams).values(data);
  const insertId = result[0].insertId;
  const [diagram] = await db.select().from(flowDiagrams).where(eq(flowDiagrams.id, insertId));
  return diagram;
}

export async function getFlowDiagramsByMatrixId(matrixId: number): Promise<FlowDiagram[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(flowDiagrams).where(eq(flowDiagrams.matrixId, matrixId));
}

export async function getFlowDiagramById(id: number): Promise<FlowDiagram | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [diagram] = await db.select().from(flowDiagrams).where(eq(flowDiagrams.id, id));
  return diagram;
}
