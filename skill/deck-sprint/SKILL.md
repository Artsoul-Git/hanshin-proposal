---
name: deck-sprint
description: >
  テーマ1つからリサーチ→レポート+プレゼン+アジェンダの3成果物を5分前後で高速生成。
  承認は計画の1回のみで完全自律実行。Kai Tasks連動・セッションログ自動記録・Knowledge参照対応。
  トリガー: 「[テーマ] をdeck-sprint」「高速デッキ作って」「/deck-sprint [テーマ]」
user-invocable: true
---

# deck-sprint — テーマ1つから高速でレポート・スライド・アジェンダを生成

## このスキルが守るルール

1. **承認ゲートはステップ2の1回のみ** — それ以外で AskUserQuestion を使わない
2. **承認後はエージェントが自律で動く** — 途中確認なし
3. **すべての成果物はタイムスタンプ付きサブフォルダに出力する**
4. **テンプレートをコピーしてから ds-deck を起動する（Write禁止のため必須）**
5. **完了時に Kai Tasks を更新し、セッションログを記録する**
6. **エラーが出ても止まらず、ベストエフォートで続行**

---

## 高速化の設計原則

| 要素 | 設計 |
|------|------|
| プレリサーチ | 省略（計画はテーマの一般知識から組み立てる） |
| リサーチ検索数 | 観点3点 × 1回ずつ = 合計3回固定 |
| スライド生成方式 | CSS/JS入り完全テンプレートをコピー後、Edit 2回のみで完成 |
| 後段エージェント | ds-analyst / ds-deck / ds-chair を3並列起動 |
| 目標完了時間 | 5分前後 |

---

## ワークフロー全体像

```
ステップ1: テーマ受信 + 出力フォルダ作成 + Kai Tasks プロジェクト作成
   ↓
ステップ2: 計画ドラフト提示 → ★承認ゲート（AskUserQuestion 1回）★
   ↓ 承認
ステップ3: ds-scout を起動（直列・先行）→ research-notes.md
ステップ4: テンプレートを出力フォルダにコピー（Python 1行）
ステップ5: 3エージェントを1メッセージで並列起動
           ds-analyst → report.md
           ds-deck    → presentation.html（Editで差し替え）
           ds-chair   → agenda.md
   ↓
ステップ6: 自己検証 → 完了報告 → Kai Tasks 更新 → セッションログ → ブラウザ起動
```

---

## ステップ1: テーマ受信・初期セットアップ

### 1-1: テーマ抽出
- 「〇〇をdeck-sprint」「/deck-sprint 〇〇」→ 〇〇部分
- 例：「AI採用戦略2026 をdeck-sprint」→「AI採用戦略2026」

### 1-2: 出力フォルダ生成
```bash
python3 -c "import datetime,os; ts=datetime.datetime.now().strftime('%Y%m%d_%H%M'); d='08_アプリ開発事業部/outputs/deck-sprint/run_'+ts; os.makedirs(d,exist_ok=True); print(d)"
```
取得したパスを `<outdir>` として以降の全操作で使用する。

### 1-3: Kai Tasks プロジェクト作成
```bash
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py ensure-server
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py create --name "deck-sprint：[テーマ]" --goal "レポート・スライド・アジェンダを5分で生成する"
```
プロジェクトIDを控える。

### 1-4: Knowledge 参照チェック
`knowledge/` 配下を確認し、テーマ関連のファイルがあれば読み込む。
ds-scout へのプロンプトに参照指示を追加する。

### 1-5: ユーザーへの中間報告（1〜2行）
```
テーマ受信：「[テーマ]」
リサーチ計画を構成中…
```

---

## ステップ2: 計画提示 → 承認ゲート

```markdown
## deck-sprint 計画

### テーマ
[テーマ]

### リサーチ観点（3項目固定）
1. [観点1]
2. [観点2]
3. [観点3]

### 生成する成果物
| ファイル | 内容 | 規模 |
|---------|------|------|
| research-notes.md | リサーチノート（中間） | — |
| report.md | 構造化レポート（深いインサイト重視） | 5,000〜8,000字 / 7〜9章 |
| presentation.html | HTMLプレゼンテーション | 基本7枚・6〜8枚 |
| agenda.md | 報告MTGアジェンダ（30分想定） | — |

### スライド構成案（基本7枚）
1. タイトル / 2. アジェンダ / 3. 背景・現状 / 4. 主要トピック /
5. データ・比較 / 6. インサイト・結論 / 7. クロージング

### レポート構成案（7〜9章）
エグゼクティブサマリー → 背景 → 現状分析 → 主要論点（複数章）→
比較・ベンチマーク → リスクと機会 → 将来展望 → 結論・次のアクション

### 出力フォルダ
`[<outdir>]`

### Knowledge 参照
[関連ファイルがあれば記載。なければ「なし」]
```

提示直後に **AskUserQuestion を1回だけ** 呼ぶ：

質問：「この計画でdeck-sprintを開始しますか？」
選択肢：
- 「開始する」（Recommended）
- 「計画を修正してから開始する（修正点を教えてください）」

### 承認後の分岐
- **「開始する」** → ステップ3へ即進行
- **「修正してから」** → 1回だけ更新 → 再承認なしでステップ3へ

---

## ステップ3: ds-scout（直列・先行）

`subagent_type: "ds-scout"` で呼び出す。

プロンプトには以下を含める：
- 確定した計画全文（テーマ + 観点3点）
- 出力先：`<outdir>`
- 「**高速版絶対制約**：観点3点 × WebSearch 1回ずつ = 合計3回で打ち切り。再検索もWebFetchも禁止」
- 「このノートは後段3エージェントが同時に読む。観点ごとに整理し、引用元URLを記載すること」
- Knowledge参照ファイルがあれば追記

ds-scout が完了するまで待つ。

---

## ステップ4: テンプレートコピー（Pythonワンライナー）

ds-scout 完了後、ステップ5の3並列起動の**直前**に以下を実行する：

```bash
python3 -c "import shutil; shutil.copy('08_アプリ開発事業部/outputs/deck-sprint/slide-base.html', '[<outdir>]/presentation.html')"
```

これにより `<outdir>/presentation.html` にCSS・JS・HTML骨格を含む完全テンプレートが配置され、
ds-deck は Edit 2回のプレースホルダ差し替えだけで完成できる。

---

## ステップ5: 3エージェントを1メッセージで並列起動

**1メッセージ内で3つの Agent ツールを同時に呼ぶ**こと。

**呼び出し1：ds-analyst**
「`<outdir>/research-notes.md` を読み、深いインサイトを持つビジネス向け構造化レポートを `<outdir>/report.md` に作成してください。
テーマ：[テーマ]。5,000〜8,000字・7〜9章。事実→解釈→示唆の3段構造で書くこと。
ds-analyst.md のフォーマットと原則を厳守すること。」

**呼び出し2：ds-deck**
「`<outdir>/research-notes.md` を読んでから、`<outdir>/presentation.html` を **Edit ツール 2回のみ** で完成させてください。
テーマ：[テーマ]。
- **重要**：CSS・JavaScript・HTML骨格はテンプレートが完成形です。**絶対に Write ツールを使わないこと**（テンプレートが消えます）。
- Edit 1回目：`__KAI_TITLE__` を実テーマ名に置換
- Edit 2回目：`<!-- [KAI_SLIDES_START] -->` から `<!-- [KAI_SLIDES_END] -->` のHTMLコメントブロック全体を、実際の `<section class="slide">...</section>` 群（基本7枚・6〜8枚）に置換
- 1枚目（タイトル）のみ `class="slide title-slide active"` を付ける
- KPIカード/カードグリッド/2カラム/アイコンリストのうち最低3種類のビジュアル要素を使う
- ds-deck.md のルールに従うこと。」

**呼び出し3：ds-chair**
「`<outdir>/research-notes.md` を読み、報告ミーティング（想定[MTG時間]分）のアジェンダを `<outdir>/agenda.md` に作成してください。
テーマ：[テーマ]。
- ds-analyst・ds-deck と並列実行中のため、`<outdir>/report.md` と `<outdir>/presentation.html` は Read を試みてエラーなら無視
- 取得できた場合は内容を参照してアジェンダの精度を上げる
- 想定質問は最低5問（うち懐疑・反対意見系を1〜2問含む）
- ds-chair.md のルールを厳守すること。」

3つすべての完了を待ってからステップ6へ。

---

## ステップ6: 後処理

### 6-1: 自己検証
- `<outdir>/research-notes.md` 存在確認
- `<outdir>/report.md` 存在確認（5,000字以上か）
- `<outdir>/presentation.html` 存在確認（テンプレートのみかコンテンツが差し替わっているか）
- `<outdir>/agenda.md` 存在確認

### 6-2: 完了報告
```
deck-sprint が完了しました。

テーマ：[テーマ]
出力フォルダ：[<outdir>]

生成結果：
- [✓/✗] リサーチノート: research-notes.md
- [✓/✗] 構造化レポート: report.md
- [✓/✗] HTMLプレゼン: presentation.html
- [✓/✗] 報告MTGアジェンダ: agenda.md

アジェンダ（agenda.md）を事前に確認してから報告MTGにお進みください。
```

### 6-3: Kai Tasks 更新
```bash
python 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py project-done [PROJECT_ID]
```

### 6-4: セッションログ記録
`memory/session-log.md` のINDEX表に1行追加する：
```
| [日付] | deck-sprint：[テーマ] | レポート+スライド+アジェンダ生成 | [<outdir>] |
```

### 6-5: ブラウザ自動オープン（単発コマンドのみ）
OS環境情報から判定し、1コマンドだけ実行：

| 環境 | コマンド |
|------|---------|
| macOS | `open <outdir>/presentation.html` |
| Linux | `xdg-open <outdir>/presentation.html` |
| Windows | `cmd.exe /c start "" <outdir>/presentation.html` |
| 判定不能 | コマンド実行せず、パスを案内 |

パス区切りは Bash での誤解釈を避けるため **必ずフォワードスラッシュ `/`** を使う。
失敗しても止めず、「`<outdir>/presentation.html` を直接ブラウザで開いてください」と案内する。

---

## エラーハンドリング方針

- **ds-scout が失敗した場合**：research-notes.md がないため後段3エージェントを起動できない。失敗を報告して終了。
- **テンプレートコピーが失敗した場合**：ds-deck は Write で完全な HTML を生成する（遅くなるが品質は維持する）。
- **ステップ5の1〜2つが失敗した場合**：成功したものだけ完了報告に含め、失敗を明示する。
- **Kai Tasks サーバーが起動できない場合**：スキップして続行、完了後に手動更新を案内。

---

## このスキルが「やってはいけない」こと

- ステップ2以外で AskUserQuestion を呼ぶ
- ステップ5の3エージェントを直列で呼ぶ（3並列起動が必須）
- ds-deck に Write ツールで presentation.html を上書きさせる（テンプレートが消える）
- 成果物を `<outdir>` 以外に保存する
- Kai Tasks・セッションログの更新をスキップする
- ブラウザ起動失敗をエラーとしてユーザーに見せて止める
