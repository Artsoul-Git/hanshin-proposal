# クライアント提案書 作成〜GitHub Pages公開 手順書

**作成：AS株式会社 / 植村ケイ**  
**作成日：2026年5月7日**  
**対象：AS_AI導入支援事業（まる様案件を例に解説）**

---

## 目次

1. [全体フローの概要](#1-全体フローの概要)
2. [使用ツール・前提条件](#2-使用ツール前提条件)
3. [STEP 1 事前アンケート（INTAKE）](#step-1-事前アンケートintake)
4. [STEP 2 訪問ヒアリング・ロードマップ策定（MAPPER）](#step-2-訪問ヒアリングロードマップ策定mapper)
5. [STEP 3 現状フロー分析（ANALYST）](#step-3-現状フロー分析analyst)
6. [STEP 4 改善フロー・計画設計（PLANNER）](#step-4-改善フロー計画設計planner)
7. [STEP 5 手順書作成（COACH）](#step-5-手順書作成coach)
8. [STEP 6 スペシャル資料生成（BLUEPRINT）](#step-6-スペシャル資料生成blueprint)
9. [STEP 7 HTMLファイルの完成と品質確認](#step-7-htmlファイルの完成と品質確認)
10. [STEP 8 バージョン管理（Git）](#step-8-バージョン管理git)
11. [STEP 9 GitHub Pages 公開](#step-9-github-pages-公開)
12. [STEP 10 URLをクライアントに共有](#step-10-urlをクライアントに共有)
13. [GitHub Pages のセキュリティについて](#github-pages-のセキュリティについて)
14. [更新・修正の手順](#更新修正の手順)
15. [トラブルシューティング](#トラブルシューティング)

---

## 1. 全体フローの概要

```
営業（DEAL）
  ↓
事前アンケート（INTAKE） ← 本手順書のスタート
  ↓
提案・見積（DEAL）
  ↓
受注
  ↓
ヒアリングシート作成（INTAKE）
  ↓
訪問ヒアリング・ロードマップ策定（MAPPER）
  ↓
現状フロー図作成（ANALYST）
  ↓
改善フロー・実施計画設計（PLANNER）
  ↓
手順書作成（COACH）
  ↓
スペシャル資料＝提案パッケージHTML生成（BLUEPRINT）
  ↓
Gitでバージョン管理
  ↓
GitHub Pages でWeb公開 ← 本手順書の終点
```

---

## 2. 使用ツール・前提条件

### 必須ツール

| ツール | 用途 | 確認方法 |
|--------|------|----------|
| Claude Code（CLI） | エージェントの操作・ファイル生成 | `claude --version` |
| Git | バージョン管理 | `git --version` |
| GitHub CLI（gh） | リポジトリ操作・Pages有効化 | `gh --version` |
| VS Code（任意） | HTMLファイルのプレビュー確認 | — |

### 前提条件

- `C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\` が作業ディレクトリ
- `git config user.email` と `user.name` が設定済み（メインリポジトリは設定済み）
- `gh auth login` でGitHubにログイン済み（`gh auth status` で確認）
- GitHub アカウント：Artsoul-Git

### リポジトリ構成

```
AS-AI-support（プライベート）  ← 社内業務データ・エージェント設計
  └── 05_クライアント案件\
      └── YYYYMMDD_クライアント名\  ← 案件ごとのフォルダ
          └── AI導入支援_完全提案パッケージ_クライアント名_v2.html

maru-proposal（パブリック）    ← まる様に公開するページのみ
  └── index.html               ← 上記 v2.html のコピー
```

---

## STEP 1 事前アンケート（INTAKE）

### 目的
訪問前にクライアントの業務概要・課題を把握し、ヒアリング効率を上げる。

### 手順

1. **Claude Code を起動**してプロジェクトディレクトリに移動

2. **INTAKEエージェントを起動**
   ```
   03_コンサル・実務支援/agents/intake.md のロールで動いてください。
   新規クライアント：[クライアント名]の事前アンケートを作成します。
   業種：就労継続支援B型事業所
   ```

3. 生成されたアンケートをGoogleフォームまたはメールで送付

4. 回答データを `05_クライアント案件\YYYYMMDD_クライアント名\Knowledge\` に保存

### 出力ファイル例
```
Knowledge\事前アンケート回答.txt
Knowledge\初回ヒアリングメモ.md
```

---

## STEP 2 訪問ヒアリング・ロードマップ策定（MAPPER）

### 目的
現地訪問で業務の実態を把握し、6ヶ月ロードマップの骨子を設計する。

### 手順

1. **MAPPERエージェントを起動**
   ```
   03_コンサル・実務支援/agents/mapper.md のロールで動いてください。
   事前アンケートの回答をもとにヒアリングシートを作成します。
   ```

2. 訪問時に文字起こし（スマホ録音 → Gemini文字起こし）

3. 文字起こしデータを `Knowledge\` フォルダに保存

4. **MAPPERで分析・ロードマップ策定**
   ```
   以下の文字起こしデータをもとにロードマップを策定してください。
   [文字起こし全文を貼り付け]
   ```

### 出力ファイル例
```
Knowledge\訪問ヒアリング文字起こし.txt
Knowledge\ロードマップ骨子.md
```

---

## STEP 3 現状フロー分析（ANALYST）

### 目的
現在の業務フローを「受入れ段階から月次業務まで」可視化し、コスト・ボトルネックを定量化する。

### 手順

1. **ANALYSTエージェントを起動**
   ```
   03_コンサル・実務支援/agents/analyst.md のロールで動いてください。
   以下のヒアリングデータから現状業務フロー図と損失コスト計算表を作成します。
   ```

2. ヒアリングデータ・既存書類（PDF等）を参照させる

3. 現状フロー図（SVG）とコスト表を確認・修正

### チェックポイント
- [ ] 受入れ（問い合わせ〜契約〜台帳登録）が含まれているか
- [ ] 日常業務（出退勤・サービス記録・特記事項）が含まれているか
- [ ] 月次業務（実績集計・国保連請求・個別支援計画更新）が含まれているか
- [ ] 月間コスト（時間 × 単価）が計算されているか

---

## STEP 4 改善フロー・計画設計（PLANNER）

### 目的
「Googleベース + ライモBizカスタムアプリ」の改善後フローを設計する。

### 手順

1. **PLANNERエージェントを起動**
   ```
   03_コンサル・実務支援/agents/planner.md のロールで動いてください。
   現状フロー図をもとに改善後フロー図と実施計画を設計します。
   ```

2. 設計原則を指示
   ```
   設計原則：
   - ベースツールはGoogle（Drive/Sheets/Docs/Meet/Gemini）
   - ライモBizはカスタムアプリが必要な現場接点のみ
   - GWSアカウントはAIマネージャー3名のみ
   - 他職員はスマホブラウザから操作
   ```

### チェックポイント
- [ ] Google Sheetsを中心としたデータ一元化が設計されているか
- [ ] 現場スタッフ（非AIユーザー）の操作が簡単か
- [ ] 国保連書類の現実的なシステム化レベルが示されているか（レベル1〜3）
- [ ] 個別支援計画のGemini×Sheets自動化フローが含まれているか

---

## STEP 5 手順書作成（COACH）

### 目的
AIマネージャーが実際に操作できる手順書・プロンプトテンプレートを作成する。

### 手順

1. **COACHエージェントを起動**
   ```
   03_コンサル・実務支援/agents/coach.md のロールで動いてください。
   改善後フローをもとに業務手順書を作成します。
   ```

2. 各業務（出退勤・記録入力・個別支援計画）の操作手順書を生成

3. Geminiプロンプトテンプレートを作成

---

## STEP 6 スペシャル資料生成（BLUEPRINT）

### 目的
STEP 1〜5の成果物を統合し、クライアントに納品する完全提案パッケージHTMLを生成する。

### 手順

1. **BLUEPRINTエージェントを起動**
   ```
   03_コンサル・実務支援/agents/blueprint.md のロールで動いてください。
   以下の情報をもとにAI導入支援_完全提案パッケージHTMLを作成します。
   ```

2. 必要情報を指示（以下を貼り付け）
   ```
   【クライアント情報】
   社名：〇〇株式会社
   業種：就労継続支援B型
   スタッフ数：〇名（¥〇,000/h）
   管理者：〇名（¥〇,500/h）
   利用者数：〇名 / 拠点数：〇拠点
   
   【月間損失コスト】
   出退勤管理：〇時間 × ¥〇,000 = ¥〇〇,000
   サービス記録：〇時間 × ¥〇,000 = ¥〇〇,000
   個別支援計画：〇時間 × ¥〇,000 = ¥〇〇,000
   合計：〇時間 ¥〇〇〇,000/月
   
   【プランニング】
   フェーズ1（基盤構築期）：¥300,000/月 × 3ヶ月
   フェーズ2（定着・自走化期）：¥150,000/月 × 3ヶ月
   フェーズ3（顧問期）：¥50,000/月
   ```

3. 生成されたHTMLを確認・修正

4. ファイルを保存
   ```
   05_クライアント案件\YYYYMMDD_クライアント名\AI導入支援_完全提案パッケージ_クライアント名_v1.html
   ```

### ⚠️ 注意：バージョン管理
修正が入った場合は `_v2.html`、`_v3.html` と番号を上げて別ファイルとして保存。旧バージョンは削除しない。

---

## STEP 7 HTMLファイルの完成と品質確認

### チェックリスト（必須）
- [ ] ブラウザでHTMLを開いて表示確認（ファイルをダブルクリック）
- [ ] 現状フロー図：受入れ段階から始まっているか
- [ ] 改善後フロー図：Googleベース + ライモBiz2本が正確か
- [ ] GWSアカウント数：3アカウント ¥5,616/月 になっているか
- [ ] フェーズ表記：「Phase」でなく「フェーズ」になっているか
- [ ] 各フェーズに説明文があるか（基盤構築期・定着自走化期・顧問期）
- [ ] 伴走プラン：必須（研修）+ オプション3択の構成になっているか
- [ ] ROI計算：数値が正確か（GWS費用・ライモBiz費用・顧問料が差し引かれているか）
- [ ] 表紙のバージョン番号・日付が正しいか

---

## STEP 8 バージョン管理（Git）

> メインリポジトリ `AS-AI-support`（プライベート）への保存手順

### 手順

```powershell
# プロジェクトディレクトリに移動（Claude Code 内の場合は自動）
cd "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc"

# 状態確認
git status

# ファイルをステージング（新しいファイルを指定）
git add "05_クライアント案件\YYYYMMDD_クライアント名\"

# コミット（内容を簡潔に説明）
git commit -m "クライアント名：提案パッケージv2作成 — 主な変更点を記述"

# リモートにプッシュ
git push origin master
```

### コミットメッセージの書き方
```
クライアント名：変更内容の要約

- 変更点1
- 変更点2
- 変更点3

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### ⚠️ 注意
- `git add .` や `git add -A` は使わない（意図しないファイルが含まれる可能性）
- ファイルを指定してステージングする

---

## STEP 9 GitHub Pages 公開

> クライアントに共有するための**別の公開リポジトリ**を作成する手順

### なぜ別リポジトリが必要か
メインリポジトリ `AS-AI-support` はプライベート設定。利用者記録・財務データが含まれるため公開できない。HTMLファイルのみを入れた小さな公開リポジトリを別途作成する。

### 手順

**1. 一時作業ディレクトリを作成・HTMLをコピー**

```powershell
# 一時ディレクトリを作成
New-Item -ItemType Directory -Path "C:\temp\[repo-name]" -Force

# HTMLファイルを index.html としてコピー
# （index.html にするとURLにファイル名が不要になる）
Copy-Item "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\05_クライアント案件\YYYYMMDD_クライアント名\AI導入支援_完全提案パッケージ_クライアント名_v2.html" `
  -Destination "C:\temp\[repo-name]\index.html"
```

**2. Gitリポジトリを初期化してコミット**

```bash
cd C:/temp/[repo-name]

# Git初期化
git init

# ユーザー情報を設定（この一時リポジトリ用）
git config user.email "uemura@artsoul.jp"
git config user.name "Kei Uemura"

# ファイルをコミット
git add index.html
git commit -m "初回公開：AI導入支援 完全提案パッケージ v2.0 [クライアント名]"
```

**3. GitHubに公開リポジトリを作成してプッシュ**

```bash
# 公開リポジトリを作成（[repo-name] は英数字・ハイフンのみ）
gh repo create Artsoul-Git/[repo-name] --public \
  --description "AI導入支援 提案パッケージ - [クライアント名]（AS株式会社）"

# リモートを設定してプッシュ
git remote add origin https://github.com/Artsoul-Git/[repo-name].git
git branch -M main
git push -u origin main
```

**4. GitHub Pages を有効化**

```bash
gh api repos/Artsoul-Git/[repo-name]/pages \
  --method POST \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

**5. URLを確認（1〜2分後にアクセス可能）**

```
https://artsoul-git.github.io/[repo-name]/
```

### まる様の実例
| 項目 | 値 |
|------|-----|
| repo-name | `maru-proposal` |
| 公開URL | `https://artsoul-git.github.io/maru-proposal/` |
| 作成日 | 2026年5月7日 |

---

## STEP 10 URLをクライアントに共有

### 共有方法
- メール・LINEでURLを直接送付
- URLを知っている人だけアクセス可能（検索エンジンには表示されにくい）
- 必要に応じて「有効期限」を口頭で伝える（例：「ご確認後はURLを削除します」）

### メール文例
```
[クライアント名] ご担当者様

先日ご提案したAI導入支援の完全提案パッケージをWebページでご確認いただけます。

▼ 提案ページURL
https://artsoul-git.github.io/[repo-name]/

スマートフォン・PCどちらでもご覧いただけます。
ご質問・ご不明点はお気軽にお声がけください。

AS株式会社 植村ケイ
```

---

## GitHub Pages のセキュリティについて

### 結論：通常のWebページ公開と同じ

GitHub Pages は静的ファイル（HTML/CSS/JS）をホスティングするサービスです。

```
【リスクなし】
✅ データベースへの不正アクセス → HTMLにDBなし
✅ サーバー側コード実行の脆弱性 → 静的ファイルのみ
✅ メインリポジトリのデータ流出 → プライベートリポジトリは非公開のまま
✅ 利用者個人情報の流出 → 公開HTMLには個人情報を含めない設計

【認識しておくべき点】
⚠️ HTMLの内容は誰でも閲覧可能（パスワードなし）
⚠️ URLを知っていれば誰でもアクセスできる
⚠️ Googleなどの検索エンジンにインデックスされる可能性がある
```

### リスクを下げたい場合の対策

**対策1：robots.txt を追加して検索エンジンに表示されないようにする**

`C:\temp\[repo-name]\robots.txt` を作成：
```
User-agent: *
Disallow: /
```
→ これで検索エンジンにインデックスされなくなる（URLを直接知っている人は見られる）

**対策2：ページを非公開にしたい場合（契約終了後）**

```bash
cd C:/temp/[repo-name]
gh api repos/Artsoul-Git/[repo-name] --method DELETE
```
→ リポジトリごと削除。URLにアクセス不可になる。

**対策3：公開HTMLに含めないもの**
- 利用者個人の氏名・住所・生年月日
- 具体的な財務データ（法人の詳細な収支）
- スタッフ個人名

---

## 更新・修正の手順

HTMLの内容を修正してページを更新する場合：

```powershell
# 1. メインリポジトリのHTMLを修正
# （Claude Code で編集 or VS Code で直接編集）

# 2. メインリポジトリにコミット
cd "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc"
git add "05_クライアント案件\..."
git commit -m "まる様：提案パッケージv2 修正 — 〇〇を更新"
git push origin master

# 3. 公開リポジトリを更新
Copy-Item "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\05_クライアント案件\...\AI導入支援_完全提案パッケージ_クライアント名_v2.html" `
  -Destination "C:\temp\maru-proposal\index.html"

cd "C:/temp/maru-proposal"
git add index.html
git commit -m "提案パッケージ更新：〇〇を修正"
git push origin main
```

→ 2〜3分でページに反映される。URLは変わらない。

---

## トラブルシューティング

### GitHub Pages が表示されない（404エラー）

**原因1：ビルド待ち**
→ push後1〜3分待ってから再アクセス

**原因2：ブランチ名が `main` でない**
```bash
git branch  # ブランチ名を確認
# `master` だった場合：
git branch -M main
git push -u origin main
```

**原因3：Pages が有効化されていない**
```bash
# 状態確認
gh api repos/Artsoul-Git/[repo-name]/pages

# 再有効化
gh api repos/Artsoul-Git/[repo-name]/pages \
  --method POST \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

### git commit でエラー「Author identity unknown」

```bash
git config user.email "uemura@artsoul.jp"
git config user.name "Kei Uemura"
git commit -m "メッセージ"
```

### gh コマンドで「Not logged in」エラー

```bash
gh auth login
# → GitHub.com を選択
# → HTTPS を選択
# → Paste an authentication token → GitHubからPersonal Access Token を貼り付け
```

### 日本語ファイル名が `\343\202\...` のように表示される

git status や git log での表示の問題。動作には影響なし。以下で修正可能：
```bash
git config --global core.quotepath false
```

---

*このドキュメントは AS株式会社 社内利用のみを目的としています。*  
*最終更新：2026年5月7日*
