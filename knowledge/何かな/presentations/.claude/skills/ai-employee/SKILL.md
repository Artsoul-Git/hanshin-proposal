---
name: ai-employee
description: >
  テーマを1つ与えると、リサーチ→レポート／スライド／アジェンダの3並列生成までを5分前後で完了する高速版AI社員ワークフロー。
  承認はリサーチ計画の1回のみで、それ以降は完全自律で完了まで進む。
  トリガー: 「[テーマ] でAI社員を動かして」「AI社員に任せる」「ai-employee」「テーマ: [...] でリサーチからアジェンダまで」「/ai-employee [テーマ]」など。
user-invocable: true
---

# AI社員 — テーマ1つから全自動でリサーチ・レポート・スライド・アジェンダを生成

## このスキルが守るルール

1. **承認ゲートは Phase 2 の1回のみ**。それ以外で AskUserQuestion を使ってはいけない。
2. **承認後はサブエージェントが自動で動く**。途中で確認を挟まない。
3. **すべての成果物は `output/` 配下に出力する**。既存ファイルは上書き。
4. **完了時にブラウザでスライドを開く**。OSを判定して適切なコマンドを実行。失敗してもエラーで止めず、ファイルパスを案内する。
5. **エラーが出ても止まらず、ベストエフォートで続行**。最後に何ができて何が失敗したか報告。

## 配布パッケージ前提

- このスキルは「今日のワーク」フォルダ配下で動作する前提
- `.claude/settings.json` で `output/` への書き込み・ブラウザ起動コマンドを事前許可済み
- そのため、参加者は許可ダイアログをほぼ目にせずに進む想定
- それでも許可が出た場合は参加者に「許可」を選んでもらう（READMEに記載済み）

## ワークフロー全体像（高速版・目標完了時間 5分前後）

```
Phase 1: テーマ受領（プレリサーチは省略）
   ↓
Phase 2: リサーチ計画ドラフトを提示 → ★承認ゲート（AskUserQuestion 1回）★
   ↓ 承認
Phase 3: サブエージェント実行
   Step A: researcher を呼ぶ（直列）→ output/research-notes.md
   Step B-pre: Bash で .claude/templates/presentation-template.html を
               output/presentation.html にコピー（CSS・JS事前用意）
   Step B: reporter / slide-maker / agenda-planner を1メッセージで★3並列起動★
       → output/report.md ＋ output/presentation.html ＋ output/agenda.md
   ↓
Phase 4: 完了報告 ＋ OS判定でブラウザ自動オープン
```

**高速化のポイント**:
- サブエージェントのモデルは `inherit`（親=メインの Claude Code セッションのモデルを継承）
- researcher は **観点3個固定・WebSearch 3回固定**（観点1個につき1回のみ。WebFetch は使わない）
- slide-maker は HTML テンプレート（CSS・JSを含む完全形）を事前コピー済みなので、**Edit でプレースホルダ部分だけ差し替える**（CSS・JSの再生成不要 = トークン消費を大幅削減）
- reporter は5,000〜8,000字・7〜9章を維持（クオリティ優先）
- slide-maker は基本7枚・6〜8枚レンジ
- agenda-planner は research-notes.md を主入力にして reporter / slide-maker と並列実行

## Phase 1: テーマ受領（プレリサーチは省略）

1. ユーザーのプロンプトから「テーマ」を抽出する
   - 「〇〇でAI社員を動かして」の〇〇部分
   - 「/ai-employee 〇〇」の〇〇部分
   - 例: 「2026年のAIエージェント市場 でAI社員を動かして」→ テーマは「2026年のAIエージェント市場」
2. **高速版ではプレリサーチは行わない**（時間短縮のため）。テーマの一般知識から計画を組み立てる
3. ユーザーへの中間報告は1〜2行のみ：
   ```
   テーマを受け取りました：「[テーマ]」
   リサーチ計画を考えています…
   ```

## Phase 2: リサーチ計画ドラフト提示

以下のフォーマットで計画をMarkdown1ブロックで提示する：

```markdown
## リサーチ計画

### テーマ
[抽出したテーマ]

### リサーチ観点（**3項目固定**）
1. [観点1]
2. [観点2]
3. [観点3]

### 想定する成果物
- リサーチノート: output/research-notes.md
- 構造化レポート: output/report.md（詳細・インサイト重視、5,000〜8,000字、7〜9章）
- HTMLプレゼン: output/presentation.html（要点・グラフィック重視、**高速版: 基本7枚・内容に応じて6〜8枚で柔軟**）
- 報告MTGアジェンダ: output/agenda.md

### レポート構成案（詳細・インサイト重視）
1. エグゼクティブサマリー
2. 背景・市場環境
3. 現状分析
4. 主要トピック（複数章に分割）
5. 比較分析・ベンチマーク
6. データ分析と示唆
7. リスクと機会
8. 将来展望・シナリオ
9. 結論・次のアクション

### スライド構成案（要点・グラフィック重視 / 基本7枚）
1. タイトル
2. アジェンダ（アイコンリスト or カードグリッド）
3. 背景・現状（KPIカード or 巨大数値）
4. 主要トピック（カードグリッド / 2カラム / バーチャート / タイムライン / 引用 のいずれか1つ）
5. データ・比較（KPIカード群 or HTML+CSS製の横棒グラフ）
6. インサイト・結論（hero-numberスライド or キーメッセージ＋アイコンリスト）
7. クロージング

### アジェンダ構成案（報告MTG用 / 標準30分）
1. オープニング・MTG目的共有
2. 議題と時間配分
3. 報告内容サマリー
4. 議論ポイント
5. 想定質問と回答方針
6. 決定事項候補
7. 次のアクション
```

提示直後に **AskUserQuestion を1回だけ** 呼ぶ：

質問: 「この計画で進めてOKですか？」
選択肢:
- 「このまま進める」（Recommended）
- 「修正して進める（修正点を教えてください）」

### 承認後の分岐
- **「このまま進める」** → Phase 3 へ即進行
- **「修正して進める」** → ユーザーから修正点を受け取り、計画を1回だけ更新してから Phase 3 へ進行（**再承認は求めない**）

## Phase 3: サブエージェント実行

### Step A: researcher を呼ぶ（直列・先行）

Agent ツールを呼び出す。subagent_type は `"researcher"`。

プロンプトには以下を含める：
- 確定したリサーチ計画の全文
- 出力先: `output/research-notes.md`
- 「このノートは後段で reporter と slide-maker と agenda-planner が同時に読むため、観点ごとに整理し、引用元URLを必ず記載すること」
- 「**高速版の絶対制約**: 観点3個 × WebSearch 1回ずつ = 合計3回で打ち切り。再検索もWebFetchも禁止」
- 「検索が弱いテーマでも諦めず、薄ければ不確実性を明示した最小構成で出力すること」

researcher が完了するまで待つ。完了したら次へ。

### Step B-pre: テンプレートHTMLを output/ にコピー（Bash 1回）

slide-maker が CSS・JavaScript を毎回再生成するのを避けるため、**Step B の3並列起動の直前に** Bash で次のコマンドを1回だけ実行する：

```bash
cp .claude/templates/presentation-template.html output/presentation.html
```

これにより `output/presentation.html` には CSS・JS・HTML骨格を含む完全テンプレートが配置され、slide-maker は Edit ツールでプレースホルダ（`__TITLE__` と `<!-- ===== SLIDES_PLACEHOLDER ===== -->` ブロック）を差し替えるだけで完了する。

このコマンドは `.claude/settings.json` で事前許可済みなので、ダイアログは出ない。

### Step B: reporter / slide-maker / agenda-planner を3並列起動

**1メッセージ内で3つの Agent ツールを同時に呼ぶ**こと。これが高速化の最重要ポイント。

呼び出し1: subagent_type `"reporter"`
- プロンプト: 「`output/research-notes.md` を読み、**詳細かつインサイト豊富な**ビジネス向け構造化レポートを `output/report.md` に作成してください。テーマ: [テーマ]。事実の羅列ではなく『事実→解釈→示唆』の3段構造で書き、5,000〜8,000字・7〜9章を目安に、比較分析・リスクと機会・将来シナリオまで深掘りすること。reporter.md のフォーマットと原則を必ず守ること。」

呼び出し2: subagent_type `"slide-maker"`
- プロンプト: 「`output/research-notes.md` を読んでから、`output/presentation.html` を **Edit ツールで2回編集** してプレゼンを完成させてください。テーマ: [テーマ]。
  - **重要**: `output/presentation.html` は ai-employee 側でテンプレートをコピー済みです。CSS・JavaScript・HTML骨格は完成形なので、絶対に書き換えないでください。Write ツールも使わないでください（テンプレを上書きしてしまう）。
  - Edit 1回目: `__TITLE__` を実テーマに置換
  - Edit 2回目: `<!-- ===== SLIDES_PLACEHOLDER ===== -->` から `<!-- ===== END SLIDES_PLACEHOLDER ===== -->` までのHTMLコメントブロック全体を、実際の `<section class="slide">...</section>` 群（**基本7枚**、内容に応じて6〜8枚）に置換
  - 1枚目（タイトル）には `class="slide title-slide active"` を付ける（初期表示用）。それ以外は `class="slide"` のみ
  - KPIカード／カードグリッド／2カラム／バーチャート／タイムライン／引用／アイコンリスト／巨大数値のうち最低3種類のビジュアル要素を組み合わせる
  - 詳細は slide-maker.md のルールに従うこと。」

呼び出し3: subagent_type `"agenda-planner"`
- プロンプト: 「`output/research-notes.md` を読み、上司・クライアントへの報告ミーティング（標準30分想定）で発表者が事前準備に使うアジェンダを `output/agenda.md` に作成してください。テーマ: [テーマ]。**reporter と slide-maker と並列実行されているため、`output/report.md` と `output/presentation.html` は Read 試行してエラーなら無視、取れたら参照してアジェンダの精度を上げる**。議題と時間配分、議論ポイント、想定質問（最低5つ、うち反対意見・懸念系を1〜2含む）、決定事項候補、次のアクションまで事前整理すること。agenda-planner.md のルールを必ず守ること。」

3つすべての完了を待ってから Phase 4 へ。

## Phase 4: 完了報告＋ブラウザでスライドを自動オープン

### 1. 完了報告

```
AI社員のワークフローが完了しました。

成果物（すべて output/ フォルダ内）:
- リサーチノート: output/research-notes.md
- 構造化レポート: output/report.md
- HTMLプレゼン: output/presentation.html
- 報告MTGアジェンダ: output/agenda.md

ブラウザでスライドを開きます。
アジェンダ（output/agenda.md）も事前に目を通してから報告MTGにお進みください。
```

### 2. ブラウザ自動オープン（単発コマンドのみ実行）

**重要**: `.claude/settings.json` で許可されているのは **単発コマンド** のみ。`if/case` などの複合 Bash スクリプトは許可リストにマッチせず、ダイアログが出てしまう。
そのため、OS 判定は Claude Code 自身がセッション開始時に渡されている環境情報（`Platform: darwin` 等）から行い、**該当する単発コマンドを Bash ツールで1回だけ実行する**。

OSと実行コマンドの対応表（このうち1つだけ実行）:

| OS / 環境 | 実行する単発コマンド |
|---|---|
| macOS | `open output/presentation.html` |
| Linux (デスクトップ環境あり) | `xdg-open output/presentation.html` |
| WSL | `explorer.exe output/presentation.html`（`wslview` の存在は事前判定できないため、Windows ネイティブで確実な `explorer.exe` に統一） |
| Windows (Git Bash等) | `cmd.exe /c start "" output/presentation.html` |
| 判定不能 | コマンドを実行せず、案内メッセージのみ出力 |

**ルール**:
- Bash ツールには **1つのコマンドだけ** を渡す（`&&`、`||`、`;`、改行で繋がない）
- パス区切りは **必ずフォワードスラッシュ `/`** を使う。Bash ではバックスラッシュ `\` がエスケープ扱いで消えてしまうため（`output\presentation.html` → `outputpresentation.html`）。Windows の `cmd.exe` `explorer.exe` `start` はいずれもフォワードスラッシュを受け付ける
- 実行が失敗（exit code != 0）してもエラーで止めない。最後の案内メッセージで「自動で開けなかった場合は output/presentation.html をダブルクリックで開いてください」と伝える
- macOS / Windows がほとんどの想定。判定に迷ったら macOS 想定で `open` を試す

## エラーハンドリング方針

- **researcher が失敗した場合**: research-notes.md がないため、後段3つは起動できない。失敗を報告して終了。
- **Step B の3並列のうち1〜2つが失敗した場合**: 成功した分は出力されている。完了報告でどれが生成できたか明示する。
- **agenda-planner が report.md / presentation.html を読めなかった場合**: 仕様通り。research-notes.md ベースでアジェンダを作る（並列実行のため取れない可能性は想定済み）。
- **AskUserQuestion は Phase 2 の1回のみ**。それ以外で確認を取りたくなっても絶対に使わない。困ったらベストエフォートで進める。
- **EnterPlanMode は使わない**。このスキルは即実行が前提。
- **ブラウザ自動オープンが失敗してもエラーにしない**。手動で開ける案内を最後に出すだけ。

## このスキルが「やってはいけない」こと

- Phase 2 以外で AskUserQuestion を呼ぶ
- 計画修正のループを2回以上回す
- ユーザーに「次は何をしますか？」と聞く
- 成果物を `output/` 以外に保存する
- スライドの形式を Markdown や PowerPoint に変える（HTML固定）
- 参加者のローカル環境を変更する操作（npm install 等）を提案する
- ブラウザ自動オープンの失敗をエラーとしてユーザーに見せて止める
