# 今日のワーク — AI社員プロジェクト（高速版・5分目標）

このフォルダは セミナーで配布された「skillsとサブエージェント」体験キットの**高速版**です。
セミナーで学んだ「テーマを伝えるだけで、リサーチ→レポート→スライド→報告MTGアジェンダが全自動」を、
**5分前後で体験できる**よう調整したバージョンです。

## 通常版（presentations/）との違い

| 項目 | 通常版 | 高速版（このフォルダ） |
|---|---|---|
| 目標完了時間 | 〜30分 | 〜5分 |
| モデル | `model: inherit`（親=メインのClaude Codeセッションを継承） | 同じく `model: inherit`（明示指定なし） |
| researcher の観点・検索回数 | 観点3〜5個・WebSearch 最大15回・WebFetch 最大3回 | **観点3個固定・WebSearch 3回固定（再検索なし）・WebFetch 禁止** |
| reporter | 5,000〜8,000字 / 7〜9章 | 同じ（クオリティ維持） |
| slide-maker | 基本10枚（8〜14枚レンジ）／ HTML・CSS・JSを毎回フル生成 | 基本7枚（6〜8枚レンジ）／ **CSS・JS入りテンプレートを事前コピーし、Edit でプレースホルダだけ差し替え**（最大の時間短縮効果） |
| Phase 3 構成 | researcher → reporter+slide-maker 並列 → agenda-planner 直列 | researcher → **テンプレcp → reporter+slide-maker+agenda-planner 3並列** |
| HTMLテンプレ | slide-maker が毎回ゼロから生成（CSS約300行を含む） | `.claude/templates/presentation-template.html` に事前配置済み（CSS含む完全形）／ slide-maker は body 内のプレースホルダ2か所だけを Edit |

## このプロジェクトの目的
- ユーザーがテーマを1つ与えると、AI社員（ai-employee スキル＋4つのサブエージェント）が動き出す
- リサーチ計画を一度だけ確認 → 承認 → あとは完全自律で完了
- 成果物は「読む用のレポート」「見せる用のスライド」「話す用のアジェンダ」の3種に展開される

## 出力先のルール
- **すべての成果物は `output/` フォルダに保存する**
- 既存ファイルは上書きしてOK
- ファイル名:
  - リサーチノート: `output/research-notes.md`
  - レポート: `output/report.md`
  - スライド: `output/presentation.html`
  - 報告MTGアジェンダ: `output/agenda.md`

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
  - パス区切りは Bash 解釈ミスを避けるため **必ずフォワードスラッシュ `/`** を使う。Windows の `cmd.exe` `explorer.exe` も `output/presentation.html` 形式を受け付ける

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
cd ~/Desktop/今日のワーク
claude
```

### Windows (PowerShell)
```powershell
cd $HOME\Desktop\今日のワーク
claude
```

### WSL（Windows のデスクトップに置いた場合）
```bash
cd /mnt/c/Users/$USER/Desktop/今日のワーク
claude
```

起動後、Claude Code に：
- 「[自分のテーマ] でAI社員を動かして」
- または `/ai-employee [自分のテーマ]`

→ リサーチ計画を確認して「このまま進める」を選択 → 数分待つ → ブラウザでスライドが自動オープン → アジェンダ（output/agenda.md）を確認して報告MTGへ

詳しい手順は `README.md` を参照してください。

## 関連ファイル
- メインスキル: `.claude/skills/ai-employee/SKILL.md`
- リサーチ担当: `.claude/agents/researcher.md`
- レポート担当: `.claude/agents/reporter.md`
- スライド担当: `.claude/agents/slide-maker.md`
- アジェンダ担当: `.claude/agents/agenda-planner.md`
- 事前許可設定: `.claude/settings.json`
