# AI編集部のワーク — AI編集部プロジェクト

このフォルダは セミナーで配布された「skillsとサブエージェント」体験キットです。
セミナーで学んだ「テーマを伝えるだけで、リサーチ → ブログ / X / YouTube / メルマガ / インフォグラフィック が全自動」を、自分のテーマで体験できます。

## このプロジェクトの目的
- ユーザーがテーマを1つ与えると、AI編集部（`ai-editorial` スキル＋7つのサブエージェント）が動き出す
- リサーチ計画を一度だけ確認 → 承認 → あとは完全自律で6種類の発信物が並列生成される
- 成果物は**1本のリサーチ → 5チャネル分の発信物 + インフォグラフィック**に展開される

## 出力先のルール
- **すべての成果物は `output/` フォルダに保存する**
- 既存ファイルは上書きしてOK
- ファイル名:
  - リサーチノート（中間成果物）: `output/research-notes.md`
  - リサーチレポート（a / HTML形式）: `output/report.html`
  - ブログ記事（b / WordPress Gutenberg形式 / SEO記事構成）: `output/blog-post.html`
  - Xスレッド（c）: `output/x-thread.md`
  - YouTube台本（d / 約10分尺）: `output/youtube-script.md`
  - メルマガ（e）: `output/newsletter.md`
  - インフォグラフィック（f / 複数枚を1ファイル内に）: `output/infographic.html`

## トーン統一ルール
- 全ての発信物は **「企業ブログ風（硬めと柔らかめの中間）」** のトーンで統一する
- 具体的には:
  - 語尾は基本「です・ます調」
  - 専門用語は使ってよいが、初出で短く補足する
  - 読み手を突き放さず、かといってフランクすぎない（「〜しましょう」「〜が大切です」などのビジネス文調）
  - 絵文字・顔文字は原則使わない（Xスレッドでも最小限）
  - 1段落3〜5行を目安に読みやすさを確保
- チャネルごとの最適化（字数・構成・話し言葉化）は必要に応じて行うが、トーンの芯はぶれさせない

## 命名規約
- 日本語タイトル可
- ファイル名は英数字＋ハイフンを基本とし、上記の固定パスを守る

## 自動実行のルール（Claude Code への指示）
- このプロジェクトでは **AskUserQuestion はリサーチ計画の承認時の1回のみ** 使ってよい
- それ以外で確認を求めない（途中の判断はAIが自律で行う）
- EnterPlanMode は使わない（このスキルは即実行が前提）
- ブラウザ自動オープンに失敗してもエラーで止めない（手動オープンを案内）

## 事前許可設定
このプロジェクトでは `.claude/settings.json` で以下を事前許可（allow）しています:
- `WebSearch` / `WebFetch`（リサーチ用、researcher エージェント向け）
- `output/` 配下への Write / Edit / Read
- ブラウザ起動コマンド（Mac: `open`、Windows: `cmd.exe /c start` `explorer.exe`、Linux: `xdg-open`、WSL: `wslview` または `explorer.exe`）
  - パス区切りは Bash 解釈ミスを避けるため **必ずフォワードスラッシュ `/`** を使う。Windows の `cmd.exe` `explorer.exe` も `output/infographic.html` 形式を受け付ける

同時に、以下の破壊的操作・機密読み取りは明示的に拒否（deny）しています（`deny` は `allow` より優先されます）:
- 再帰削除 `rm -rf` / `rm -r` / `rm -R`（全パターン）
- 特権昇格 `sudo` / `su`
- ディスクフォーマット・破壊 `mkfs` / `dd` / `fdisk` / `parted`
- 再帰権限変更 `chmod -R` / `chown -R`
- 電源操作 `shutdown` / `reboot` / `halt` / `poweroff` / `init 0` / `init 6`
- 外部スクリプト取得 `curl` / `wget`（`curl ... | sh` 対策）
- プロセス強制終了 `kill -9` / `killall`
- 機密ファイル読み取り（`.env` 系、`~/.ssh/**`、`~/.aws/**`）
- `.claude/**` への Write / Edit（設定ファイル自己改変の防止）

これにより、参加者は安全な範囲で許可ダイアログをほぼ目にせずに体験できます。

## 使い方（参加者向け短縮版）

### Mac / Linux
```bash
cd ~/Desktop/AI編集部のワーク
claude
```

### Windows (PowerShell)
```powershell
cd $HOME\Desktop\AI編集部のワーク
claude
```

### WSL（Windows のデスクトップに置いた場合）
```bash
cd /mnt/c/Users/$USER/Desktop/AI編集部のワーク
claude
```

起動後、Claude Code に：
- 「[自分のテーマ] でAI編集部を動かして」
- または `/ai-editorial [自分のテーマ]`

→ リサーチ計画を確認して「このまま進める」を選択 → 数分待つ → ブラウザでインフォグラフィックが自動オープン → 各発信物を `output/` フォルダから取り出して各媒体にコピペ

詳しい手順は `README.md` を参照してください。

## 関連ファイル
- メインスキル: `.claude/skills/ai-editorial/SKILL.md`
- リサーチ担当: `.claude/agents/researcher.md`
- レポート担当: `.claude/agents/report-writer.md`
- ブログ担当: `.claude/agents/blog-writer.md`
- Xスレッド担当: `.claude/agents/x-thread-writer.md`
- YouTube台本担当: `.claude/agents/youtube-script-writer.md`
- メルマガ担当: `.claude/agents/newsletter-writer.md`
- インフォグラフィック担当: `.claude/agents/infographic-maker.md`
- 事前許可設定: `.claude/settings.json`
