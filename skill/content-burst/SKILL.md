---
name: content-burst
description: >
  テーマ1つから「リサーチレポート / ブログ記事 / X投稿スレッド / YouTube台本 / メルマガ / ビジュアルマップ」の6種類を並列生成。
  承認は展開計画の1回のみで完全自律実行。Kai Tasks連動・セッションログ自動記録・Knowledge参照対応。
  トリガー: 「[テーマ] をcontent-burst」「コンテンツ展開して」「/content-burst [テーマ]」
user-invocable: true
---

# content-burst — テーマ1つから6チャネルの発信物を並列生成

## このスキルが守るルール

1. **承認ゲートはフェーズBの1回のみ** — それ以外で AskUserQuestion を使わない
2. **承認後はエージェントが自律で動く** — 途中確認なし
3. **すべての成果物はタイムスタンプ付きサブフォルダに出力する**
4. **完了時に Kai Tasks を更新し、セッションログを記録する**
5. **エラーが出ても止まらず、ベストエフォートで続行** — 最後に結果を報告
6. **Knowledgeフォルダを参照してクライアント文脈を使えるか確認する**

---

## ワークフロー全体像

```
フェーズA: テーマ受信 + 出力フォルダ作成 + Kai Tasks プロジェクト作成
   ↓
フェーズB: 展開計画ドラフト提示 → ★承認ゲート（AskUserQuestion 1回）★
   ↓ 承認
フェーズC:
   ステップ1: cb-scout を起動（直列・先行）→ research-notes.md
   ステップ2: 6エージェントを1メッセージで並列起動
       cb-ink / cb-pen / cb-spark / cb-lens / cb-post / cb-canvas
   ↓
フェーズD: 自己検証 → 完了報告 → Kai Tasks 更新 → セッションログ記録 → ブラウザ起動
```

---

## フェーズA: テーマ受信・初期セットアップ

### A-1: テーマ抽出
ユーザーのプロンプトから「テーマ」を抽出する。
- 「〇〇をcontent-burst」「/content-burst 〇〇」→ 〇〇部分
- 例：「2026年のエージェントAI市場 をcontent-burst」→「2026年のエージェントAI市場」

### A-2: 出力フォルダ生成
以下のPythonワンライナーでタイムスタンプ付きフォルダを作成し、パスを取得する：

```bash
python3 -c "import datetime,os,sys; ts=datetime.datetime.now().strftime('%Y%m%d_%H%M'); d='08_アプリ開発事業部/outputs/content-burst/run_'+ts; os.makedirs(d,exist_ok=True); print(d)"
```

取得したパスを `<outdir>` として以降の全操作で使用する。

### A-3: Kai Tasks プロジェクト作成
```bash
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py ensure-server
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py create --name "content-burst：[テーマ]" --goal "6チャネルの発信物を生成して公開素材を確保する"
```
返ってきたプロジェクトIDを控える。

### A-4: Knowledge 参照チェック
`knowledge/` 配下のファイル一覧を確認し、テーマに関連する情報があれば読み込む。
関連ファイルがあった場合は、後段エージェントのプロンプトにその参照を含める。

### A-5: ユーザーへの中間報告（1〜2行）
```
テーマ受信：「[テーマ]」
展開計画を作成しています…
```

---

## フェーズB: 展開計画提示 → 承認ゲート

以下のフォーマットで計画を提示する：

```markdown
## content-burst 展開計画

### テーマ
[テーマ]

### リサーチ観点（3〜5項目）
1. [観点1]
2. [観点2]
3. [観点3]
（必要なら〜5）

### 生成する発信物（6種類）
| ファイル | 内容 | 文字数目安 |
|---------|------|-----------|
| report.html | リサーチレポート（HTML形式） | 3,000〜5,000字 |
| blog-post.html | ブログ記事（WordPress Gutenberg対応） | 2,500〜4,000字 |
| x-thread.md | Xスレッド | 140字×6〜9投稿 |
| youtube-script.md | YouTube台本 | 約10分尺・2,800〜3,200字 |
| newsletter.md | メルマガ | 800〜1,500字 |
| visual-map.html | ビジュアルマップ（HTML形式）| 3〜6枚 |

### 共通トーン
[プロンプトで指定されたトーン。未指定の場合：端的・実務寄り・丁寧語]

### デザイン（HTML成果物）
Kaiカラー（ネイビー #1A365D / スチールブルー #3182CE）統一

### 出力フォルダ
`[<outdir>]`

### Knowledge 参照
[関連ファイルがあれば記載。なければ「なし」]
```

提示直後に **AskUserQuestion を1回だけ** 呼ぶ：

質問：「この計画でcontent-burstを開始しますか？」
選択肢：
- 「開始する」（Recommended）
- 「計画を修正してから開始する（修正点を教えてください）」

### 承認後の分岐
- **「開始する」** → フェーズCへ即進行
- **「修正してから」** → 修正点を反映して計画を1回更新 → 再承認なしでフェーズCへ

---

## フェーズC: エージェント実行

### ステップ1: cb-scout を起動（直列・先行）

Agent ツールを呼び出す。`subagent_type: "cb-scout"`

プロンプトには以下を含める：
- 確定した展開計画の全文（テーマ + 観点リスト）
- 出力先：`<outdir>`
- 「このノートは後段6エージェントが共有するため、観点ごとに整理し、引用元URLを必ず記載すること」
- Knowledge参照ファイルがあれば「[ファイルパス] も参照して関連情報を補強すること」

cb-scout が完了するまで待つ。

### ステップ2: 6エージェントを1メッセージで並列起動

**1メッセージ内で6つの Agent ツールを同時に呼ぶ**こと（並列性がこのスキルの核心）。

全エージェントのプロンプトには以下の共通指示を含める：
- テーマ名
- `<outdir>/research-notes.md` を Read して参照すること
- 共通トーン
- 出力先 `<outdir>`

**呼び出し1：cb-ink**
「`<outdir>/research-notes.md` を読み、HTMLリサーチレポートを `<outdir>/report.html` に作成。
テーマ：[テーマ]。Kaiカラー（#1A365D / #3182CE）使用。cb-ink.md のルール厳守。
共通トーン：[トーン]」

**呼び出し2：cb-pen**
「`<outdir>/research-notes.md` を読み、WordPress Gutenberg形式のSEO記事を `<outdir>/blog-post.html` に作成。
テーマ：[テーマ]。2,500〜4,000字。H2ナンバリングなし。参考資料セクション不要（インラインリンクで代替）。
cb-pen.md のルール厳守。共通トーン：[トーン]」

**呼び出し3：cb-spark**
「`<outdir>/research-notes.md` を読み、Xスレッドを `<outdir>/x-thread.md` に作成。
テーマ：[テーマ]。140字×6〜9投稿。cb-spark.md のルール厳守。共通トーン：[トーン]（Xらしい切れ味も加える）」

**呼び出し4：cb-lens**
「`<outdir>/research-notes.md` を読み、約10分尺のYouTube台本を `<outdir>/youtube-script.md` に作成。
テーマ：[テーマ]。2,800〜3,200字。話し言葉・ト書きあり。cb-lens.md のルール厳守。共通トーン：[トーン]（話し言葉化）」

**呼び出し5：cb-post**
「`<outdir>/research-notes.md` を読み、メルマガを `<outdir>/newsletter.md` に作成。
テーマ：[テーマ]。800〜1,500字。件名+本文+CTA+署名プレースホルダー。cb-post.md のルール厳守。共通トーン：[トーン]」

**呼び出し6：cb-canvas**
「`<outdir>/research-notes.md` を読み、ビジュアルマップを `<outdir>/visual-map.html` に作成。
テーマ：[テーマ]。3〜6枚、縦スクロール型HTML。Kaiカラー（#1A365D / #3182CE / #0EA5E9）使用。
cb-canvas.md のルール厳守。」

6つすべての完了を待ってからフェーズDへ。

---

## フェーズD: 自己検証 → 完了報告 → 後処理

### D-1: 自己検証
以下を確認する：
- `<outdir>/research-notes.md` が存在するか
- 6つの成果物ファイルが存在するか（存在しないものは「生成失敗」として記録）
- 各HTMLファイルの容量が 1KB 以上か（空ファイルでないか）

### D-2: 完了報告
```
content-burst が完了しました。

テーマ：[テーマ]
出力フォルダ：[<outdir>]

生成結果：
- [✓/✗] リサーチノート: research-notes.md
- [✓/✗] リサーチレポート（HTML）: report.html
- [✓/✗] ブログ記事（Gutenberg）: blog-post.html
- [✓/✗] Xスレッド: x-thread.md
- [✓/✗] YouTube台本: youtube-script.md
- [✓/✗] メルマガ: newsletter.md
- [✓/✗] ビジュアルマップ（HTML）: visual-map.html

各ファイルをコピーして各媒体に投稿・公開してください。
```

### D-3: Kai Tasks 更新
```bash
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py project-done [PROJECT_ID]
```

### D-4: セッションログ記録
`memory/session-log.md` のINDEX表に1行追加する：
```
| [日付] | content-burst：[テーマ] | 6チャネル発信物生成 | [<outdir>] |
```

### D-5: ブラウザ自動オープン（単発コマンドのみ）
OS判定は環境情報（Platform）から行い、該当する1コマンドだけ実行：

| 環境 | コマンド |
|------|---------|
| macOS | `open <outdir>/visual-map.html` |
| Linux | `xdg-open <outdir>/visual-map.html` |
| Windows | `cmd.exe /c start "" <outdir>/visual-map.html` |
| 判定不能 | コマンド実行せず、ファイルパスを案内 |

失敗してもエラーにせず、最後に「`<outdir>/visual-map.html` を直接ブラウザで開いてください」と案内する。

---

## エラーハンドリング方針

- **cb-scout が失敗した場合**：research-notes.md がないため6エージェントを起動できない。失敗を報告して終了。
- **ステップ2の一部エージェントが失敗した場合**：成功分だけ完了報告に記載し、失敗チャネルを明示。ブラウザは visual-map.html > report.html の優先順で開く。
- **Kai Tasksサーバーが起動できない場合**：スキップして作業を続行。完了後にユーザーに手動更新を案内。

---

## このスキルが「やってはいけない」こと

- フェーズB以外で AskUserQuestion を呼ぶ
- ステップ2の6エージェントを直列で呼ぶ（並列起動が必須）
- 成果物を `<outdir>` 以外に保存する
- Kai Tasks・セッションログの更新をスキップする
- ブラウザ起動失敗をエラーとしてユーザーに見せて止める
