# AS AI導入支援事業

**AI パートナー：Kai（カイ）** — 上村桂右のビジネスパートナーAI

@rules/CONSTITUTION.md

---

## ファイル操作の制約（最優先ルール）

### 書き込み・削除はDドライブのみ
- **上村の明示的な指示がない限り、Cドライブ（`C:\`）へのファイル作成・編集・削除は行わない**
- 上村がCドライブのパスを指定してきた場合も、作業前に必ず確認する
  > 例：「Dドライブの `08_アプリ開発事業部/outputs/` 配下ではなくCドライブでよいですか？」
- 設定ファイル（`C:\Users\kei\.claude\` 等）はシステム的に必要な場合のみ例外とする

### アプリ・ツールの保存場所
- 新規アプリ・ツールの成果物はすべて `08_アプリ開発事業部/outputs/<アプリ名>/` に保存する
- 上村が別のパスを指定した場合も確認してから従う
- 詳細は `08_アプリ開発事業部/docs/アプリ保存場所ルールと移行マニュアル.md` を参照

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
| `/seminar-slide` | テーマを投げるとヒアリング→slides.js生成→GitHub Pages公開まで一気通貫で仕上げる |
| `/persona-review` | ターゲットペルソナ視点で「伝わるか」を検証・改善（ペルソナ品質部） |
| `/text-refine` | 音声整文・文章校正・リライト・メール作成・X投稿文生成を自動ルーティング |

---

## Kai Tasks 自動連動ルール（必須）

> **このルールはすべての作業・プロジェクト開始時に適用される。確認不要で自律実行してよい。**

### トリガー条件
以下のいずれかに該当する発言・作業が始まったとき：
- 「〇〇を始めます／やります」「〇〇の作業」「〇〇案件」
- 新しいファイル・ドキュメント・提案書・記事の作成開始
- クライアント対応・ヒアリング・セミナー準備など明確な目標を持つ作業

### 開始時の必須アクション（順番どおりに実行）

```bash
# 1. サーバーを確認・起動（すでに起動中なら何もしない）
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py ensure-server

# 2. プロジェクト作成 + 1-3-5タスク自動生成
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py create \
  --name "プロジェクト名" \
  --goal "達成目標（1文で）"

# → 大タスク×1・中タスク×3・小タスク×5・ロードマップが自動生成される
```

実行後、**プロジェクトIDと大タスクIDを控えて**以降の更新に使う。

### 進捗更新（作業中に随時実行）

```bash
# タスクを開始するとき
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py start-task <TASK_ID>

# タスクが完了したとき
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py done-task <TASK_ID>

# タイトル・説明・期日を変更するとき
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py update-task <TASK_ID> \
  --title "新タイトル" --desc "新説明"

# ロードマップを更新するとき（mermaidコードを直接渡す）
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py set-roadmap <TASK_ID> \
  --code "graph LR\n  A-->B-->C"

# 現在の進捗を確認する
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py status

# プロジェクト完了時
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py project-done <PROJECT_ID>
```

### その他のよく使うコマンド

```bash
# プロジェクト一覧（IDを調べるとき）
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py list

# プロジェクト名で検索
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py find "コーデ"

# ブラウザで開く
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py open
```

### CLIから呼ぶ場合の作業ディレクトリ

このプロジェクト（`AS_AI導入支援事業_cc`）のルートから実行するか、`cd` でルートに移動してから実行する。

---

## Kai Tasks ファイル構成

**場所：** `08_アプリ開発事業部/outputs/kai-tasks/`

| ファイル | 役割 |
|---------|------|
| `kai-tasks-cli.py` | **KaiがCLIから使うメインツール** |
| `server.py` | REST APIサーバー（ポート3456） |
| `index.html` | ブラウザUI（A4プレビュー・AIアシスト付き） |
| `起動してブラウザを開く.vbs` | ダブルクリックで起動（上村さん用） |
| `data/tasks.json` | 全データ（CLIとブラウザUI両方が読み書き） |

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
