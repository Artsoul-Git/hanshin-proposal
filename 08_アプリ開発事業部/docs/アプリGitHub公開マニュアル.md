# アプリ・ツール GitHub Pages 公開マニュアル

作成：2026-05-12  
対象：Kai（AI）および上村桂右  
関連：`クライアント提案書作成〜GitHub公開_手順書.md`（クライアント提案書版）

---

## 0. 設計思想とセキュリティモデル

### なぜ「別リポジトリ・別公開」なのか

```
AS-AI-support（プライベートリポジトリ）
  └── 08_アプリ開発事業部/outputs/音源トリミング/index.html  ← 業務内データと同居
                                                              ← 絶対に公開してはいけない

Artsoul-Git/audio-trimmer（パブリックリポジトリ）
  └── index.html     ← 公開するファイルのみ。これだけ。
  └── robots.txt     ← 検索エンジンのインデックスを拒否
  └── .nojekyll      ← GitHub の Jekyll 処理を無効化
```

メインリポジトリはプライベートのまま。公開用に「何も入っていない新しい箱」を用意して、そこにHTMLだけ入れる。

### 閲覧者が見えるもの・見えないもの

| 見えるもの | 見えないもの |
|-----------|------------|
| 公開したアプリの画面（URL直打ち） | メインリポジトリの中身 |
| HTMLのソースコード（View Source） | 他のクライアント案件・財務データ |
| robots.txt の内容 | プライベートリポジトリの存在 |

> **補足：HTML ソースコードについて**  
> ブラウザの「ページのソースを表示」でアプリのコードは見られます。  
> これは一般的なウェブサービスすべてで同じです。  
> **音声ファイルはブラウザ内のみで処理され、一切外部に送信されません。**

### URL のみアクセス設計

- robots.txt により検索エンジン（Google 等）にインデックスされない
- URL を知っている人だけがアクセスできる（≒ 「限定公開」）
- ディレクトリ一覧表示は GitHub Pages では無効（`/`にアクセスしても `index.html` が返るだけ）
- 存在しないファイルへのアクセスは 404 エラー

### コスト

| 項目 | 費用 |
|------|------|
| GitHub Pages | **無料**（パブリックリポジトリ） |
| 独自ドメイン | 任意（なければ `artsoul-git.github.io/リポジトリ名/`） |
| API コスト | **なし**（静的ファイル配信のみ） |
| サーバー維持費 | **なし** |

---

## 1. 公開できるアプリの条件チェックリスト

公開前に必ず確認する。

- [ ] アプリに個人情報・クライアント名・財務データが含まれていないか
- [ ] 外部API呼び出しがない、またはAPIキーをソースに直書きしていないか
- [ ] `08_アプリ開発事業部/outputs/<アプリ名>/` に正規ファイルがあるか
- [ ] アプリ内に利用ポリシー・免責事項が記載されているか（推奨）
- [ ] 上村の公開承認を得たか（CONSTITUTION.md §3 の原則）

---

## 2. Kai への指示方法

### 新規公開（初回）

```
「音源トリミングアプリを GitHub Pages で公開して」
```

または

```
「08_アプリ開発事業部/outputs/音源トリミング/ を公開して。
 リポジトリ名は audio-trimmer で。」
```

### 更新（コンテンツ変更後）

```
「audio-trimmer を最新版に更新して」
```

### 非公開化（削除）

```
「audio-trimmer の公開を停止して（リポジトリを削除して）」
```

---

## 3. 公開手順（Kai 実行フロー）

### STEP 1：ステージングディレクトリを作成

```powershell
# D ドライブ内にステージング領域を作成（C ドライブは使わない）
$repo = "audio-trimmer"  # リポジトリ名
$stage = "D:\Google Antigravity\_publish-staging\$repo"
New-Item -ItemType Directory -Force -Path $stage | Out-Null
```

### STEP 2：公開ファイルをコピー

```powershell
# アプリの HTML を index.html としてコピー
Copy-Item `
  "D:\Google Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\<アプリ名>\index.html" `
  -Destination "$stage\index.html"
```

### STEP 3：必須ファイルを作成

**robots.txt**（検索エンジン拒否 — 常に作成する）
```
User-agent: *
Disallow: /
```

**.nojekyll**（Jekyll 処理無効化 — 空ファイルでOK）
```
（空ファイル）
```

### STEP 4：Git 初期化 → コミット

```bash
cd "D:/Google Antigravity/_publish-staging/<repo-name>"

git init
git config user.email "uemura@artsoul.jp"
git config user.name "Kei Uemura"

git add index.html robots.txt .nojekyll
git commit -m "公開：<アプリ名> v1.0"
```

### STEP 5：GitHub にパブリックリポジトリを作成

```bash
gh repo create Artsoul-Git/<repo-name> \
  --public \
  --description "<アプリ名>（有限会社アートソウル）"

git remote add origin https://github.com/Artsoul-Git/<repo-name>.git
git branch -M main
git push -u origin main
```

### STEP 6：GitHub Pages を有効化

```bash
gh api repos/Artsoul-Git/<repo-name>/pages \
  --method POST \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

### STEP 7：URL を確認・報告

```
公開URL：https://artsoul-git.github.io/<repo-name>/
```

1〜3分後にアクセス可能になる。

---

## 4. 更新手順（コンテンツ変更後）

```powershell
# 1. D ドライブの正規ファイルを修正済みのものに更新
Copy-Item `
  "D:\Google Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\<アプリ名>\index.html" `
  -Destination "D:\Google Antigravity\_publish-staging\<repo-name>\index.html"
```

```bash
cd "D:/Google Antigravity/_publish-staging/<repo-name>"
git add index.html
git commit -m "更新：<変更内容の概要>"
git push origin main
```

→ 2〜3分で反映。URL は変わらない。

---

## 5. 非公開化（リポジトリ削除）

```bash
# ⚠️ 削除前に上村に確認すること（CONSTITUTION.md §3）
gh api repos/Artsoul-Git/<repo-name> --method DELETE
```

削除後はURLにアクセスしても 404 になる。  
ステージングディレクトリも不要なら削除してよい。

---

## 6. 公開済みアプリ一覧

| アプリ名 | リポジトリ名 | 公開URL | 公開日 | 状態 |
|---------|------------|--------|--------|------|
| 音源トリミング | `audio-trimmer` | `https://artsoul-git.github.io/audio-trimmer/` | 2026-05-12 | 公開中 |
| もらったプロンプトを使い倒そう！（kawai版） | `morai-prompt` | `https://artsoul-git.github.io/morai-prompt/viewer.html` | 2026-05-13 | 公開中 |
| もらったプロンプトを使い倒そう！（画像版） | `m2` | `https://artsoul-git.github.io/m2/viewer.html` | 2026-05-13 | 公開中 |

---

## 7. トラブルシューティング

### Pages が 404 になる

```bash
# ビルド状態確認
gh api repos/Artsoul-Git/<repo-name>/pages

# push 後 1〜3 分待つ。それでも表示されない場合：
gh api repos/Artsoul-Git/<repo-name>/pages \
  --method POST \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

### gh コマンドで認証エラー

```bash
gh auth login
# → GitHub.com → HTTPS → Personal Access Token を貼り付け
```

### ブランチ名エラー

```bash
git branch -M main
git push -u origin main
```

---

## 8. ステージングディレクトリの管理

- 場所：`D:\Google Antigravity\_publish-staging\`
- 役割：公開用リポジトリのローカルクローン置き場
- **ここには公開ファイルのみ。他のデータは絶対に置かない**
- gitignore 対象ではないため、誤ってメインリポジトリに含めないよう注意

---

---

## 9. セミナースライドの公開（専用フロー）

セミナースライドは通常アプリとは異なる公開フローを使う。
`_publish-staging/` を経由せず、プロジェクトフォルダを直接 git リポジトリとして公開する。

### 公開フロー（`/seminar-slide` スキル内 STEP 5 に記載）

```powershell
$slug = "seminar-slug-here"
$projDir = "D:\Google Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\slide-builder\projects\$slug"

Set-Location $projDir
git init
git config user.email "uemura@artsoul.jp"
git config user.name "Kei Uemura"
git add .
git commit -m "初期公開: $slug"

gh repo create "Artsoul-Git/$slug" --public --description "{タイトル}"
git remote add origin "https://github.com/Artsoul-Git/$slug.git"
git push -u origin master
git checkout -b gh-pages
git push origin gh-pages
git checkout master
```

### 公開後の移動

GitHub デプロイ後、ローカルのプロジェクトフォルダを移動する：

```powershell
Move-Item `
  "D:\Google Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\slide-builder\projects\$slug" `
  "D:\Google Antigravity\AS_AI導入支援事業_cc\06_セミナー事業部\outputs\$slug"
```

### セミナーの公開URL パターン

| URL | 用途 |
|-----|------|
| `https://artsoul-git.github.io/{slug}/viewer.html` | 受講者用（閲覧のみ） |
| `https://artsoul-git.github.io/{slug}/presenter.html` | プレゼンターモード（パスワード） |
| `https://artsoul-git.github.io/{slug}/admin.html` | パスワード設定・管理 |
| `https://artsoul-git.github.io/{slug}/index.html` | 編集・PDF/PPTX出力 |

> **注意：** セミナー公開は必ずオーナー（上村）の確認後に実行すること（CONSTITUTION.md §3）

---

## 改訂履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-05-13 | §9 セミナースライド専用フロー追加。公開済み一覧に morai-prompt・m2 を追記 |
| 2026-05-12 | 初版作成。音源トリミング公開を初適用 |
