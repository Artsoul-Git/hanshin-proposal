# Rashinban Project TODO

## Phase 1: データベース設計
- [x] projectsテーブルの作成
- [x] hearingQuestionsテーブルの作成
- [x] hearingAnswersテーブルの作成
- [x] mandalaProposalsテーブルの作成
- [x] mandalaChartsテーブルの作成
- [x] mandalaItemsテーブルの作成
- [x] fourQuadrantMatricesテーブルの作成
- [x] flowDiagramsテーブルの作成

## Phase 2: tRPC APIルーター
- [x] project.create - プロジェクト作成
- [x] project.list - プロジェクト一覧取得
- [x] project.get - プロジェクト詳細取得
- [x] ai.generateHearingQuestions - ヒアリング質問生成
- [x] hearing.submitAnswers - 回答送信
- [x] ai.generateMandalaProposal - カテゴリ提案生成
- [x] mandalaProposal.approve - 提案承認
- [x] ai.generateMandalaChart - マンダラチャート第1層生成
- [x] ai.expandMandalaCategory - カテゴリ展開（第2層生成）
- [x] mandalaChart.updateItem - 項目編集
- [x] ai.generateMatrixFromMandala - 4象限マトリクス生成
- [x] ai.generateFlowDiagram - フロー図生成

## Phase 3: プロジェクト作成フローUI
- [x] ホームページ（ダッシュボード）
- [x] プロジェクト作成フォーム（テーマ・概要入力）
- [x] ヒアリング画面（質問表示・回答入力）
- [x] 提案確認画面（8カテゴリ表示・修正・承認）

## Phase 4: マンダラチャートUI
- [x] マンダラチャート表示コンポーネント
- [x] 第1層（8カテゴリ）の表示
- [x] オンデマンド展開（クリック時に第2層生成）
- [x] インライン編集機能（テキスト・説明・優先度）
- [x] ローディング状態の表示

## Phase 5: 4象限マトリクス・フロー図
- [x] 4象限マトリクス表示コンポーネント
- [x] マトリクス生成トリガー（項目クリック）
- [x] フロー図表示コンポーネント
- [x] フロー図生成トリガー（マトリクス項目クリック）

## Phase 6: エラーハンドリング
- [x] 指数バックオフによるリトライ戦略
- [x] JSON検証とフォールバック処理
- [x] 自動保存機能
- [x] ユーザーへのエラーメッセージ表示

## Bug Fixes
- [x] ヒアリングページのAPIエラー修正（Cannot read properties of undefined）
