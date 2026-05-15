# AS AI導入支援事業

**AI パートナー：Kai（カイ）** — 上村桂右のビジネスパートナーAI

@rules/CONSTITUTION.md

---

## ファイル操作の制約（最優先ルール）

### 書き込み・削除は `C:\Users\kei\Dropbox\00_Antigravity` のみ（2026-05-15 更新）
- **自動編集・作成・削除してよいのは `C:\Users\kei\Dropbox\00_Antigravity` 配下のファイルのみ**
- それ以外のパス（Dドライブ・他のCドライブフォルダ等）への書き込みは上村の明示的な指示がない限り行わない
- 設定ファイル（`C:\Users\kei\.claude\` 等）はシステム的に必要な場合のみ例外とする
- **読み込み（Read）は状況確認のため原則OK。ただし機密性が高いと判断した場合はKaiが事前に確認する**

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
| `/marketing` | DRM戦略の壁打ち・LP設計・コピーライティング・USP開発・ファネル設計（神崎潤ペルソナ） |
| `/talk-script` | 既存スライド（PDF等）を読み込み、プレゼン用トークスクリプトを生成する |
| `/visualize` | 4象限マトリクス・マンダラチャート・フロー図・ガントチャートをブラウザ表示HTMLで生成。ドリルダウンモードで段階的深掘り（マンダラ→4象限→フロー→ガント）が可能 |
| `/profit-plan` | テーマと情報をもとに「儲けのプラン」を設計。EPDCARサイクル＋EOODARモデル（上村オリジナルフレームワーク）で短中長期の収益計画を構築する |
| `/research` | 業種・テーマ・競合をWebSearchで実調査し、市場規模・トレンド・競合分析レポートを生成。他スキルのインプットとして使う |
| `/finance` | 損益シミュレーション（3シナリオ）・DCF・損益分岐点・価格戦略・CF計画・リスク定量化。数字に裏付けられた意思決定を支援する |
| `/issue-tree` | ロジックツリー（Why/How/What）とイシューツリーの2フレームワークで問題を構造化。クリティカルイシュー特定・So What?連鎖・アクション優先度付けまで |
| `/stakeholder` | 意思決定者・抵抗勢力・支持者を影響力×関心度マトリクスで整理し、提案を通すための攻略シナリオを設計する |
| `/kpi-design` | KGI→CSF→KPI→KDI体系とOKR設計・ダッシュボード構築・レビューサイクル設計まで。AI導入効果の計測にも対応 |
| `/hr-transform` | AI導入・業務改革の人材マネジメントを5フェーズで設計。変革準備診断・AIマネージャー育成・役割再設計・研修・定着管理 |
| `/ma` | 取引額5,000万円以下のスモールM&Aを支援。企業価値評価（3手法）・DDチェックリスト・ストラクチャー比較・PMI・価格交渉・LOI骨子 |
| `/content-burst` | テーマ1つからリサーチレポート/ブログ/X投稿/YouTube台本/メルマガ/ビジュアルマップを並列生成。Kai Tasks連動・セッションログ自動記録 |
| `/deck-sprint` | テーマ1つからレポート+HTMLスライド+アジェンダを5分で高速生成。Kai Tasks連動・テンプレート差し替え方式でトークン効率最大化 |
| `/hearing-sheet` | 業種（14種）×部門（5種）に合わせたヒアリングシートをExcelで動的生成。文字起こしからの自動記入にも対応 |
| `/proposal-outline` | ヒアリング結果（Excel/文字起こし/メモ）から提案骨子（1〜2ページWord）を自動生成。AI/DX提案と汎用IT提案に対応 |
| `/billing-docs` | 見積書・請求書をExcelで自動生成。消費税10%自動計算・インボイス番号採番。月額顧問型・時間単価型・プロジェクト型に対応 |
| `/nda` | 機密保持契約書（NDA）をWord形式で自動生成。損害賠償上限・秘密保持期間明示のバランス型。生成AI利用条項含む |
| `/biz-contract` | コンサル・AI支援向け業務委託契約書をWord形式で自動生成。知財共有型・損害賠償上限設定の18条構成 |
| `/wbs-gantt` | WBS・ガントチャートをExcelで自動生成。日付変更でバー自動伸縮・ステータスで色自動変化の動的関数版 |
| `/daily-report` | 音声・自然文で話した業務内容を5列Excel日報に自動変換。月次レポートのデータ源として蓄積 |
| `/monthly-report` | 日報データからA4縦2ページの月次活動レポートをWord形式で自動生成。円グラフ付き |
| `/doc-compare` | 2つのWord/PDFを比較し、変更箇所を色分けした新旧対比表をWord形式で生成。14種の見出しパターンに自動対応 |

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
