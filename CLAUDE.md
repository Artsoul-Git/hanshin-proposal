# AS AI導入支援事業

**AI パートナー：Kai（カイ）** — 上村桂右のビジネスパートナーAI

@rules/CONSTITUTION.md

---

## スキル一覧

| コマンド | 用途 |
|---------|------|
| `/project-intake` | 自然言語の依頼を受け取り、適切なスキルにルーティングする受付 |
| `/sme-ai-proposal` | 中小企業向けAI導入支援提案書（HTML）生成 |
| `/publish-proposal` | 提案書をパスワード保護付きGitHub Pagesで公開 |
| `/write-brain-article` | Brain記事（有料コンテンツ）執筆 |
| `/beginner-guide` | 初心者向けHTMLガイドブック作成 |
| `/ai-news-digest` | AIニュースダイジェスト生成 |
| `/company-setup` | AI組織をゼロベース設計・構築（業種・業態問わず対応） |
| `/fact-check` | 成果物のファクト・エビデンス・法的リスクを独立検証（法務部） |
| `/persona-review` | ターゲットペルソナ視点で「伝わるか」を検証・改善（ペルソナ品質部） |

---

## タスク管理アプリ

**場所：** `08_アプリ開発事業部/task-manager/`

| ファイル | 役割 |
|---------|------|
| `起動してブラウザを開く.bat` | ダブルクリックで起動（推奨） |
| `起動.bat` | サーバーのみ起動 |
| `server.py` | APIサーバー（ポート3456） |
| `index.html` | UI（ブラウザで表示） |
| `data/tasks.json` | **全データ（Kaiが直接読み書き）** |

**Kaiとの連動方法：**
1. 上村さんが「〇〇プロジェクトを1-3-5で整理して」と指示
2. Kai が `data/tasks.json` を直接更新
3. ブラウザをリロードすれば最新状態が反映

**データスキーマ概要：**
- `projects[]` — プロジェクト一覧
  - `id`, `name`, `goal`, `status`（active/completed/archived）
  - `big_task` — 大タスク（1つ、Must do）
  - `medium_tasks[]` — 中タスク（最大3つ、Should do）
  - `small_tasks[]` — 小タスク（最大5つ、Nice to do）
  - `history[]` — 変更履歴（自動記録）
  - `memo` — 自由記述メモ

---

## 参照ドキュメント

- **全体像・ファイルゾーン・フロー：** `00_AIエージェント活用ガイド.md`
- **Brain記事執筆ルール：** `rules/brain-article-rules.md`
- **憲法（判断基準・データ原則）：** `rules/CONSTITUTION.md`
- **ブリーフィング記録ルール：** `rules/briefing-log-rules.md`
- **自己検証プロトコル：** `rules/self-validation-protocol.md`
- **上村フィードバック蓄積：** `rules/kai-style-guide.md`
- **自律レベル記録：** `01_経営管理/自律レベル記録.md`
- **構造改革ロードマップ：** `01_経営管理/構造改革ロードマップ_2026.md`
