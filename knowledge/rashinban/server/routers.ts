import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  createProject,
  getProjectsByUserId,
  getProjectById,
  updateProjectStatus,
  createHearingQuestions,
  getHearingQuestionsByProjectId,
  createHearingAnswers,
  getHearingAnswersByProjectId,
  createMandalaProposal,
  getMandalaProposalByProjectId,
  updateMandalaProposalStatus,
  createMandalaChart,
  getMandalaChartByProjectId,
  createMandalaItems,
  getMandalaItemsByChartId,
  getMandalaItemById,
  updateMandalaItem,
  markCategoryExpanded,
  createFourQuadrantMatrix,
  getFourQuadrantMatricesByProjectId,
  getFourQuadrantMatrixById,
  createFlowDiagram,
  getFlowDiagramsByMatrixId,
  getFlowDiagramById,
} from "./db";
import { TRPCError } from "@trpc/server";

// Helper function for exponential backoff retry
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// Helper function to parse JSON from LLM response
function parseJsonResponse<T>(content: string | unknown): T {
  if (typeof content !== 'string') {
    console.error('[parseJsonResponse] Invalid content type:', typeof content, content);
    throw new Error('Invalid content type');
  }
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
    console.log('[parseJsonResponse] Parsing JSON:', jsonStr.substring(0, 200));
    const result = JSON.parse(jsonStr) as T;
    console.log('[parseJsonResponse] Parsed result:', JSON.stringify(result).substring(0, 200));
    return result;
  } catch (error) {
    console.error('[parseJsonResponse] Failed to parse JSON:', error, 'Content:', content.substring(0, 500));
    throw error;
  }
}

// Category type for proposals
interface Category {
  name: string;
  description: string;
}

// Quadrant item type
interface QuadrantItem {
  text: string;
  description?: string;
}

// Quadrant type
interface Quadrant {
  label: string;
  items: QuadrantItem[];
}

// Flow step type
interface FlowStep {
  order: number;
  title: string;
  description: string;
}

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

  // Project management
  project: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(100),
        background: z.string().min(10).max(2000),
        targetPeriod: z.string().max(100).optional(),
        constraints: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await createProject({
          userId: ctx.user.id,
          title: input.title,
          background: input.background,
          targetPeriod: input.targetPeriod || null,
          constraints: input.constraints || null,
          status: "draft",
        });
        return project;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getProjectsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        return project;
      }),

    getFullData: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        
        const questions = await getHearingQuestionsByProjectId(input.id);
        const answers = await getHearingAnswersByProjectId(input.id);
        const proposal = await getMandalaProposalByProjectId(input.id);
        const chart = await getMandalaChartByProjectId(input.id);
        const items = chart ? await getMandalaItemsByChartId(chart.id) : [];
        const matrices = await getFourQuadrantMatricesByProjectId(input.id);
        
        return {
          project,
          questions,
          answers,
          proposal,
          chart,
          items,
          matrices,
        };
      }),
  }),

  // AI-powered features
  ai: router({
    generateHearingQuestions: protectedProcedure
      .input(z.object({
        projectId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }

        let response;
        try {
          response = await withRetry(async () => {
            return invokeLLM({
              messages: [
                {
                  role: "system",
                  content: `あなたはマンダラチャート作成を支援するAIアシスタントです。
ユーザーの目標達成を支援するため、テーマと概要から適切なヒアリング質問を生成してください。
質問は3〜5個で、以下の観点を含めてください：
- テーマの具体的な定義や範囲
- ターゲット・対象者
- 成功指標・KPI
- 制約条件・リソース
- 優先順位

JSON形式で回答してください。`
                },
                {
                  role: "user",
                  content: `テーマ: ${project.title}\n\n概要: ${project.background}${project.targetPeriod ? `\n\n目標期間: ${project.targetPeriod}` : ""}${project.constraints ? `\n\n制約条件: ${project.constraints}` : ""}`
                }
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "hearing_questions",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      questions: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["questions"],
                    additionalProperties: false
                  }
                }
              }
            });
          });
        } catch (llmError) {
          console.error('[generateHearingQuestions] LLM error:', llmError);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI質問生成に失敗しました。しばらく待ってから再度お試しください。" });
        }

        console.log('[generateHearingQuestions] LLM response:', JSON.stringify(response).substring(0, 1000));
        
        if (!response || !response.choices || !response.choices[0]) {
          console.error('[generateHearingQuestions] Invalid response structure:', response);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AIからの応答が不正です" });
        }

        const content = response.choices[0]?.message?.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        console.log('[generateHearingQuestions] LLM response content:', contentStr?.substring(0, 500));
        if (!content) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate questions" });
        }

        const parsed = parseJsonResponse<{ questions: string[] }>(content);
        console.log('[generateHearingQuestions] Parsed questions:', parsed.questions);
        
        if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No questions generated" });
        }
        
        const questionsToInsert = parsed.questions.map((q, idx) => ({
          projectId: input.projectId,
          question: q,
          questionOrder: idx,
        }));
        console.log('[generateHearingQuestions] Questions to insert:', questionsToInsert);

        const questions = await createHearingQuestions(questionsToInsert);
        console.log('[generateHearingQuestions] Inserted questions:', questions);
        await updateProjectStatus(input.projectId, "hearing");

        return { questions };
      }),

    generateMandalaProposal: protectedProcedure
      .input(z.object({
        projectId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }

        const questions = await getHearingQuestionsByProjectId(input.projectId);
        const answers = await getHearingAnswersByProjectId(input.projectId);

        const qaContext = questions.map(q => {
          const answer = answers.find(a => a.questionId === q.id);
          return `Q: ${q.question}\nA: ${answer?.answer || "未回答"}`;
        }).join("\n\n");

        const response = await withRetry(async () => {
          return invokeLLM({
            messages: [
              {
                role: "system",
                content: `あなたはマンダラチャート作成を支援するAIアシスタントです。
ユーザーの目標とヒアリング回答をもとに、マンダラチャートの8つのカテゴリを提案してください。
各カテゴリは目標達成に必要な主要な領域を表します。

必ず以下のJSON形式で回答してください：
{
  "categories": [
    { "name": "カテゴリ名1", "description": "このカテゴリの説明" },
    { "name": "カテゴリ名2", "description": "このカテゴリの説明" },
    ...（8つ）
  ],
  "reasoning": "この8つのカテゴリを選んだ理由の説明"
}`
              },
              {
                role: "user",
                content: `テーマ: ${project.title}\n\n概要: ${project.background}\n\n【ヒアリング回答】\n${qaContext}`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "mandala_proposal",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    categories: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" }
                        },
                        required: ["name", "description"],
                        additionalProperties: false
                      },
                      minItems: 8,
                      maxItems: 8
                    },
                    reasoning: { type: "string" }
                  },
                  required: ["categories", "reasoning"],
                  additionalProperties: false
                }
              }
            }
          });
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate proposal" });
        }

        const parsed = parseJsonResponse<{ categories: Category[]; reasoning: string }>(content);

        const proposal = await createMandalaProposal({
          projectId: input.projectId,
          categories: parsed.categories,
          reasoning: parsed.reasoning,
          status: "pending",
        });

        await updateProjectStatus(input.projectId, "proposal");

        return { proposal };
      }),

    generateMandalaChart: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        proposalId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }

        const proposal = await getMandalaProposalByProjectId(input.projectId);
        if (!proposal || proposal.id !== input.proposalId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
        }

        // Create the chart
        const chart = await createMandalaChart({
          projectId: input.projectId,
          proposalId: input.proposalId,
          centerTheme: project.title,
        });

        // Create category items (first layer only)
        const categories = proposal.categories as Category[];
        const categoryItems = categories.map((cat, idx) => ({
          mandalaChartId: chart.id,
          categoryIndex: idx,
          itemIndex: 0,
          text: cat.name,
          description: cat.description,
          priority: 0,
          isCategory: true,
          isExpanded: false,
        }));

        await createMandalaItems(categoryItems);
        await updateMandalaProposalStatus(input.proposalId, "approved");
        await updateProjectStatus(input.projectId, "completed");

        return { chart };
      }),

    expandMandalaCategory: protectedProcedure
      .input(z.object({
        mandalaChartId: z.number(),
        categoryIndex: z.number().min(0).max(7),
      }))
      .mutation(async ({ ctx, input }) => {
        const items = await getMandalaItemsByChartId(input.mandalaChartId);
        const categoryItem = items.find(
          i => i.categoryIndex === input.categoryIndex && i.isCategory
        );

        if (!categoryItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
        }

        // Check if already expanded
        const existingSubItems = items.filter(
          i => i.categoryIndex === input.categoryIndex && !i.isCategory
        );
        if (existingSubItems.length > 0) {
          return { items: existingSubItems };
        }

        // Get project context
        const chart = await getMandalaChartByProjectId(categoryItem.mandalaChartId);
        if (!chart) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Chart not found" });
        }

        const project = await getProjectById(chart.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const response = await withRetry(async () => {
          return invokeLLM({
            messages: [
              {
                role: "system",
                content: `あなたはマンダラチャート作成を支援するAIアシスタントです。
指定されたカテゴリに対して、具体的な8つのアクション項目を生成してください。
各項目は実行可能で具体的なものにしてください。

必ず以下のJSON形式で回答してください：
{
  "items": [
    { "text": "項目1", "description": "詳細説明" },
    { "text": "項目2", "description": "詳細説明" },
    ...（8つ）
  ]
}`
              },
              {
                role: "user",
                content: `テーマ: ${project.title}\n\nカテゴリ: ${categoryItem.text}\nカテゴリの説明: ${categoryItem.description || ""}\n\nこのカテゴリを達成するための具体的な8つのアクション項目を生成してください。`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "mandala_items",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          text: { type: "string" },
                          description: { type: "string" }
                        },
                        required: ["text", "description"],
                        additionalProperties: false
                      },
                      minItems: 8,
                      maxItems: 8
                    }
                  },
                  required: ["items"],
                  additionalProperties: false
                }
              }
            }
          });
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate items" });
        }

        const parsed = parseJsonResponse<{ items: { text: string; description: string }[] }>(content);

        const newItems = parsed.items.map((item, idx) => ({
          mandalaChartId: input.mandalaChartId,
          categoryIndex: input.categoryIndex,
          itemIndex: idx + 1,
          text: item.text,
          description: item.description,
          priority: 0,
          isCategory: false,
          isExpanded: false,
        }));

        await createMandalaItems(newItems);
        await markCategoryExpanded(input.mandalaChartId, input.categoryIndex);

        const updatedItems = await getMandalaItemsByChartId(input.mandalaChartId);
        return { items: updatedItems.filter(i => i.categoryIndex === input.categoryIndex && !i.isCategory) };
      }),

    generateMatrixFromMandala: protectedProcedure
      .input(z.object({
        mandalaChartId: z.number(),
        sourceItemId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sourceItem = await getMandalaItemById(input.sourceItemId);
        if (!sourceItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        const items = await getMandalaItemsByChartId(input.mandalaChartId);
        const chart = await getMandalaChartByProjectId(sourceItem.mandalaChartId);
        if (!chart) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Chart not found" });
        }

        const project = await getProjectById(chart.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        // Get related items for context
        const relatedItems = items
          .filter(i => i.categoryIndex === sourceItem.categoryIndex)
          .map(i => i.text)
          .join(", ");

        const response = await withRetry(async () => {
          return invokeLLM({
            messages: [
              {
                role: "system",
                content: `あなたは目標達成を支援するAIアシスタントです。
指定された項目に対して、4象限マトリクス（重要度×緊急度）を生成してください。

必ず以下のJSON形式で回答してください：
{
  "title": "マトリクスのタイトル",
  "xAxisLabel": "X軸ラベル（例：緊急度）",
  "yAxisLabel": "Y軸ラベル（例：重要度）",
  "quadrants": [
    {
      "label": "第1象限（高重要・高緊急）",
      "items": [
        { "text": "項目1", "description": "説明" },
        { "text": "項目2", "description": "説明" }
      ]
    },
    {
      "label": "第2象限（高重要・低緊急）",
      "items": [...]
    },
    {
      "label": "第3象限（低重要・高緊急）",
      "items": [...]
    },
    {
      "label": "第4象限（低重要・低緊急）",
      "items": [...]
    }
  ]
}`
              },
              {
                role: "user",
                content: `テーマ: ${project.title}\n\n対象項目: ${sourceItem.text}\n説明: ${sourceItem.description || ""}\n\n関連項目: ${relatedItems}\n\nこの項目を達成するためのタスクを4象限マトリクスに分類してください。`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "four_quadrant_matrix",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    xAxisLabel: { type: "string" },
                    yAxisLabel: { type: "string" },
                    quadrants: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          items: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                text: { type: "string" },
                                description: { type: "string" }
                              },
                              required: ["text", "description"],
                              additionalProperties: false
                            }
                          }
                        },
                        required: ["label", "items"],
                        additionalProperties: false
                      },
                      minItems: 4,
                      maxItems: 4
                    }
                  },
                  required: ["title", "xAxisLabel", "yAxisLabel", "quadrants"],
                  additionalProperties: false
                }
              }
            }
          });
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate matrix" });
        }

        const parsed = parseJsonResponse<{
          title: string;
          xAxisLabel: string;
          yAxisLabel: string;
          quadrants: Quadrant[];
        }>(content);

        const matrix = await createFourQuadrantMatrix({
          projectId: project.id,
          mandalaChartId: input.mandalaChartId,
          sourceItemId: input.sourceItemId,
          title: parsed.title,
          xAxisLabel: parsed.xAxisLabel,
          yAxisLabel: parsed.yAxisLabel,
          quadrants: parsed.quadrants,
        });

        return { matrix };
      }),

    generateFlowDiagram: protectedProcedure
      .input(z.object({
        matrixId: z.number(),
        quadrantIndex: z.number().min(0).max(3),
        itemText: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const matrix = await getFourQuadrantMatrixById(input.matrixId);
        if (!matrix) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Matrix not found" });
        }

        const project = await getProjectById(matrix.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const quadrants = matrix.quadrants as Quadrant[];
        const quadrant = quadrants[input.quadrantIndex];

        const response = await withRetry(async () => {
          return invokeLLM({
            messages: [
              {
                role: "system",
                content: `あなたは目標達成を支援するAIアシスタントです。
指定されたタスクを実行するためのステップバイステップのフロー図を生成してください。

必ず以下のJSON形式で回答してください：
{
  "title": "フロー図のタイトル",
  "steps": [
    { "order": 1, "title": "ステップ1のタイトル", "description": "詳細な説明" },
    { "order": 2, "title": "ステップ2のタイトル", "description": "詳細な説明" },
    ...
  ]
}`
              },
              {
                role: "user",
                content: `テーマ: ${project.title}\n\nマトリクス: ${matrix.title}\n象限: ${quadrant.label}\n\n対象タスク: ${input.itemText}\n\nこのタスクを完了するための具体的なステップを5〜8個生成してください。`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "flow_diagram",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    steps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          order: { type: "integer" },
                          title: { type: "string" },
                          description: { type: "string" }
                        },
                        required: ["order", "title", "description"],
                        additionalProperties: false
                      },
                      minItems: 5,
                      maxItems: 8
                    }
                  },
                  required: ["title", "steps"],
                  additionalProperties: false
                }
              }
            }
          });
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate flow diagram" });
        }

        const parsed = parseJsonResponse<{ title: string; steps: FlowStep[] }>(content);

        const diagram = await createFlowDiagram({
          projectId: project.id,
          matrixId: input.matrixId,
          sourceQuadrant: input.quadrantIndex,
          title: parsed.title,
          steps: parsed.steps,
        });

        return { diagram };
      }),
  }),

  // Hearing management
  hearing: router({
    submitAnswers: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        answers: z.array(z.object({
          questionId: z.number(),
          answer: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }

        const answersToInsert = input.answers.map(a => ({
          projectId: input.projectId,
          questionId: a.questionId,
          answer: a.answer,
        }));

        await createHearingAnswers(answersToInsert);
        return { success: true };
      }),

    getQuestions: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        return getHearingQuestionsByProjectId(input.projectId);
      }),
  }),

  // Mandala proposal management
  mandalaProposal: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        return getMandalaProposalByProjectId(input.projectId);
      }),

    reject: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .mutation(async ({ input }) => {
        await updateMandalaProposalStatus(input.proposalId, "rejected");
        return { success: true };
      }),
  }),

  // Mandala chart management
  mandalaChart: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        const chart = await getMandalaChartByProjectId(input.projectId);
        if (!chart) return null;
        const items = await getMandalaItemsByChartId(chart.id);
        return { chart, items };
      }),

    updateItem: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        text: z.string().optional(),
        description: z.string().optional(),
        priority: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const item = await getMandalaItemById(input.itemId);
        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        const updateData: Record<string, unknown> = {};
        if (input.text !== undefined) updateData.text = input.text;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.priority !== undefined) updateData.priority = input.priority;

        await updateMandalaItem(input.itemId, updateData);
        return { success: true };
      }),
  }),

  // Four quadrant matrix management
  matrix: router({
    getByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        return getFourQuadrantMatricesByProjectId(input.projectId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const matrix = await getFourQuadrantMatrixById(input.id);
        if (!matrix) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Matrix not found" });
        }
        const project = await getProjectById(matrix.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return matrix;
      }),
  }),

  // Flow diagram management
  flowDiagram: router({
    getByMatrix: protectedProcedure
      .input(z.object({ matrixId: z.number() }))
      .query(async ({ ctx, input }) => {
        const matrix = await getFourQuadrantMatrixById(input.matrixId);
        if (!matrix) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Matrix not found" });
        }
        const project = await getProjectById(matrix.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return getFlowDiagramsByMatrixId(input.matrixId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const diagram = await getFlowDiagramById(input.id);
        if (!diagram) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Flow diagram not found" });
        }
        const matrix = await getFourQuadrantMatrixById(diagram.matrixId);
        if (!matrix) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Matrix not found" });
        }
        const project = await getProjectById(matrix.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return diagram;
      }),
  }),
});

export type AppRouter = typeof appRouter;
