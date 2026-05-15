import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - stores user projects with theme and background
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  background: text("background").notNull(),
  targetPeriod: varchar("targetPeriod", { length: 100 }),
  constraints: text("constraints"),
  status: mysqlEnum("status", ["draft", "hearing", "proposal", "generating", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Hearing Questions - AI-generated questions for each project
 */
export const hearingQuestions = mysqlTable("hearingQuestions", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  question: text("question").notNull(),
  questionOrder: int("questionOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HearingQuestion = typeof hearingQuestions.$inferSelect;
export type InsertHearingQuestion = typeof hearingQuestions.$inferInsert;

/**
 * Hearing Answers - User responses to hearing questions
 */
export const hearingAnswers = mysqlTable("hearingAnswers", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  questionId: int("questionId").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HearingAnswer = typeof hearingAnswers.$inferSelect;
export type InsertHearingAnswer = typeof hearingAnswers.$inferInsert;

/**
 * Mandala Proposals - AI-generated category proposals
 */
export const mandalaProposals = mysqlTable("mandalaProposals", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  categories: json("categories").notNull(), // Array of 8 categories with name and description
  reasoning: text("reasoning"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MandalaProposal = typeof mandalaProposals.$inferSelect;
export type InsertMandalaProposal = typeof mandalaProposals.$inferInsert;

/**
 * Mandala Charts - Main chart container
 */
export const mandalaCharts = mysqlTable("mandalaCharts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  proposalId: int("proposalId").notNull(),
  centerTheme: varchar("centerTheme", { length: 200 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MandalaChart = typeof mandalaCharts.$inferSelect;
export type InsertMandalaChart = typeof mandalaCharts.$inferInsert;

/**
 * Mandala Items - Individual items in the chart (categories and sub-items)
 */
export const mandalaItems = mysqlTable("mandalaItems", {
  id: int("id").autoincrement().primaryKey(),
  mandalaChartId: int("mandalaChartId").notNull(),
  categoryIndex: int("categoryIndex").notNull(), // 0-7 for categories
  itemIndex: int("itemIndex").notNull(), // 0 for category itself, 1-8 for sub-items
  text: varchar("text", { length: 200 }).notNull(),
  description: text("description"),
  priority: int("priority").default(0),
  isCategory: boolean("isCategory").default(false).notNull(),
  isExpanded: boolean("isExpanded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MandalaItem = typeof mandalaItems.$inferSelect;
export type InsertMandalaItem = typeof mandalaItems.$inferInsert;

/**
 * Four Quadrant Matrices - Generated from mandala items
 */
export const fourQuadrantMatrices = mysqlTable("fourQuadrantMatrices", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  mandalaChartId: int("mandalaChartId").notNull(),
  sourceItemId: int("sourceItemId"), // The mandala item that triggered this matrix
  title: varchar("title", { length: 200 }).notNull(),
  xAxisLabel: varchar("xAxisLabel", { length: 100 }).notNull(),
  yAxisLabel: varchar("yAxisLabel", { length: 100 }).notNull(),
  quadrants: json("quadrants").notNull(), // Array of 4 quadrants with items
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FourQuadrantMatrix = typeof fourQuadrantMatrices.$inferSelect;
export type InsertFourQuadrantMatrix = typeof fourQuadrantMatrices.$inferInsert;

/**
 * Flow Diagrams - Step-by-step flow generated from matrix items
 */
export const flowDiagrams = mysqlTable("flowDiagrams", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  matrixId: int("matrixId").notNull(),
  sourceQuadrant: int("sourceQuadrant"), // Which quadrant triggered this
  title: varchar("title", { length: 200 }).notNull(),
  steps: json("steps").notNull(), // Array of steps with order, title, description
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FlowDiagram = typeof flowDiagrams.$inferSelect;
export type InsertFlowDiagram = typeof flowDiagrams.$inferInsert;
