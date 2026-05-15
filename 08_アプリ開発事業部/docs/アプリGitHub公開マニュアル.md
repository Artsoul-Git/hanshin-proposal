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
$stage = "C:\Users\kei\Dropbox\00_Antigravity\_publish-staging\$repo"
New-Item -ItemType Directory -Force -Path $stage | Out-Null
```

### STEP 2：公開ファイルをコピー

```powershell
# アプリの HTML を index.html としてコピー
Copy-Item `
  "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\<アプリ名>\index.html" `
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
  "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\<アプリ名>\index.html" `
  -Destination "C:\Users\kei\Dropbox\00_Antigravity\_publish-staging\<repo-name>\index.html"
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
| 契約書AIチェックセミナー（新ルール版） | `keiyakusho-ai-check` | `https://artsoul-git.github.io/keiyakusho-ai-check/` | 2026-05-13 | 公開中 |

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

- 場所：`C:\Users\kei\Dropbox\00_Antigravity\_publish-staging\`
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
$projDir = "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\slide-builder\projects\$slug"

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
  "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\slide-builder\projects\$slug" `
  "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\06_セミナー事業部\outputs\$slug"
```

### セミナーの公開URL パターン

| URL | 用途 | 共有可否 |
|-----|------|---------|
| `https://artsoul-git.github.io/{slug}/` | 受講者用ビューア（`index.html`） | ✅ 受講者に共有 |
| `https://artsoul-git.github.io/{slug}/presenter.html` | プレゼンターモード（パスワード保護） | 🔒 登壇者のみ |
| `https://artsoul-git.github.io/{slug}/admin.html` | パスワード設定・管理 | 🔒 管理者のみ |
| `https://artsoul-git.github.io/{slug}/editor.html` | Canvaエディター（スライド編集） | 🔒 社内のみ |

> **注意：** セミナー公開は必ずオーナー（上村）の確認後に実行すること（CONSTITUTION.md §3）

---

## 10. セミナースライドの編集（editor.html）

### ファイル構成（2026-05-14 改訂後）

```
{slug}/
├── index.html       ← 受講者用ビューア（旧 viewer.html に相当）
├── editor.html      ← スライド編集エディター（旧 index.html を拡張）
├── presenter.html   ← プレゼンターモード
├── admin.html       ← パスワード管理
├── css/
│   ├── style.css    ← 共通スライドスタイル
│   └── editor.css   ← エディター専用スタイル
└── js/
    ├── slides.js    ← スライドデータ（コンテンツ本体）
    ├── app.js       ← ナビ・エクスポート・既存編集モード
    └── editor.js    ← Canvaエディターロジック
```

### editor.html の使い方

#### 基本操作

1. ブラウザで `editor.html` を開く（またはローカルファイルとして直接開く）
2. 右下の **「✏️ 編集」** ボタンをクリック → 編集モード ON
3. 左サイドバーが展開し、スライドが右にシフトする

#### 左サイドバーの構成

| タブ | 機能 |
|------|------|
| **T テキスト** | テキストボックス追加 / フォントサイズ・色・太字・斜体・揃え |
| **▭ 図形** | 矩形・楕円・直線・矢印を配置（クリックで種類選択→スライドをクリックで配置） |
| **⬚ 画像** | JPG/PNG/GIF/SVG を挿入（スライド中央に配置、ドラッグ移動可） |

#### オブジェクト操作

| 操作 | 方法 |
|------|------|
| 選択 | オブジェクトをクリック（青枠 + ハンドルが表示） |
| 移動 | 選択状態でドラッグ |
| リサイズ | 四隅・辺中央の8ハンドルをドラッグ |
| テキスト編集 | テキストボックスの内部をクリック（カーソルが入る） |
| 削除 | 選択後「×」ボタン または `Delete` キー |
| 選択解除 | `Esc` キー |
| ポインターに戻す | `V` キー または 選択ツールアイコン |

#### 既存テキストの編集（スライド本文）

左サイドバーの「テキスト」タブ下部のヒントにある通り、**スライド内の既存テキストは直接クリックして編集できる**（app.js の contentEditable モード）。テキストボックスを追加しなくても、見出し・本文・箇条書きをその場で修正可能。

#### 保存・出力

- **自動保存**：入力後500ms で `localStorage` に保存される
- **Ctrl+S**：その場で保存
- **「保存」ボタン**：編集モード終了時に保存（右下の「保存」）
- **PDF出力**：右下バーの「PDF出力」→ ブラウザ印刷ダイアログ
- **PPTX出力**：右下バーの「PPTX出力」→ 全スライドをキャプチャして `.pptx` 生成

#### 注意事項

- オブジェクト（図形・画像・テキストボックス）のデータは **ブラウザの `localStorage` に保存**される。別のブラウザ・PCでは表示されない
- スライドコンテンツ（既存テキストの変更）も同様に `localStorage` 保存。**GitHubにpushしないと他端末に反映されない**
- 公開URLの `index.html` にオブジェクトを表示させたい場合は、`editor.html` でPPTXエクスポート後、スライドの内容を `js/slides.js` に直接反映させること

---

## 改訂履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-05-14 | §10 editor.html 使い方追加。§9 URLパターン表を更新（viewer.html→index.html, editor.html追加）。§6 keiyakusho-ai-check の公開URLを更新 |
| 2026-05-13 | §9 セミナースライド専用フロー追加。公開済み一覧に morai-prompt・m2 を追記 |
| 2026-05-12 | 初版作成。音源トリミング公開を初適用 |
