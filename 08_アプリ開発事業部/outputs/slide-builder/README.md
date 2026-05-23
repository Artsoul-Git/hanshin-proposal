# Seminar Slide Builder

セミナースライドシステムを新規作成・管理するツール群。

---

## 全体構成

```
08_アプリ開発事業部/outputs/slide-builder/   ← ツール本体（ここ）
├── index.html              ← ブラウザ補助ツール（プロンプト生成・コマンド確認）
├── new-seminar.py          ← CLI: テンプレートから新規プロジェクト生成
├── slide-server.py         ← ローカル開発サーバー（localhost:8765）
├── templates/              ← デザインテンプレート（3種類）
│   ├── ascolor-minimal/    ← ASコーポレートカラー（緑）+ 編集可能PPTX付き
│   ├── kawai-dark-v1/      ← 黒背景グリーンアクセント（デフォルト）
│   └── monotone-minimal/   ← モノトーン
├── projects/               ← 作業中ステージング（完成後は06_セミナー事業部に移動）
└── README.md               ← このファイル

06_セミナー事業部/outputs/                   ← セミナー成果物（GitHub Pages公開済み）
├── 契約書AIチェックセミナー/
├── morai-prompt/           ← もらったプロンプトを使い倒そう！
└── m2/                     ← 同セミナー 画像版
```

---

## テンプレートの選び方

| テンプレート名 | 外観 | 用途 | 編集可能PPTX |
|--------------|------|------|:-----------:|
| `ascolor-minimal` | ASコーポレートグリーン（#6F911D）、白ベース | AS主催・よろず・公式セミナー | **あり** |
| `kawai-dark-v1` | 黒背景グリーンアクセント、Canvaライク | カジュアル・一般向け（デフォルト） | なし |
| `monotone-minimal` | モノトーン | 印刷・資料配布向け | なし |

```powershell
# テンプレートを指定して生成
python new-seminar.py --slug "my-seminar" --title "マイセミナー" --template ascolor-minimal
```

---

## セミナーを新規作成する（2つの方法）

### 方法A：Kai に依頼する（推奨）

Claude Code で以下を入力するだけ：

```
/seminar-slide
```

Kai がヒアリング → slides.js 生成 → GitHub デプロイまで自動で実行します。

### 方法B：手動で作成する

**ステップ1: ブラウザ補助ツールを開く**

`index.html` をブラウザで直接開く（またはダブルクリック）。

**ステップ2: 情報を入力してプロンプトを生成**

- セミナータイトル・ターゲット・時間などを入力
- PDF/PPTX があればドロップしてテキスト抽出
- 「プロンプト生成」ボタン → Claude に貼り付け

**ステップ3: プロジェクトフォルダを生成**

```powershell
python 08_アプリ開発事業部/outputs/slide-builder/new-seminar.py `
  --slug "my-seminar" `
  --title "マイセミナー" `
  --template ascolor-minimal
```

生成先（ステージング）: `outputs/slide-builder/projects/my-seminar/`

**ステップ4: slides.js を配置**

Kai が生成した slides.js を `outputs/slide-builder/projects/my-seminar/js/slides.js` に保存。

**ステップ5: GitHub にデプロイ**

```powershell
cd "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\slide-builder\projects\my-seminar"
git init
git config user.email "uemura@artsoul.jp"
git config user.name "Kei Uemura"
git add .
git commit -m "初期公開: マイセミナー"
gh repo create Artsoul-Git/my-seminar --public --description "マイセミナー"
git remote add origin https://github.com/Artsoul-Git/my-seminar.git
git push -u origin master
git checkout -b gh-pages && git push origin gh-pages && git checkout master
```

**ステップ5.5: 成果物をセミナー事業部に移動**

GitHub デプロイ完了後、ステージングから正規の保存場所へ移動する。

```powershell
Move-Item "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\slide-builder\projects\my-seminar" `
          "C:\Users\kei\Dropbox\00_Antigravity\AS_AI導入支援事業_cc\06_セミナー事業部\outputs\my-seminar"
```

**ステップ6: 初回設定**

1. `https://artsoul-git.github.io/my-seminar/admin.html` を開く
2. パスワードを設定（初期パスワードは `06_セミナー事業部/outputs/my-seminar/manual.html` を参照）
3. 受講者用URLをコピーして共有

---

## PPTX出力の種類（ascolor-minimal）

`ascolor-minimal` テンプレートには PPTX 出力が **2種類** あります。

### PPTX出力（通常版）

| 項目 | 内容 |
|------|------|
| 方式 | html2canvas でスライドを画像キャプチャ → PPTX に貼り付け |
| 編集 | ❌ PowerPoint でテキスト編集不可（画像として埋め込み） |
| 品質 | ◎ ブラウザの見た目を完全再現（フォント・CSS効果含む） |
| 用途 | そのまま配布・印刷用途 |

### 編集可能PPTX（テキスト編集可能版）

| 項目 | 内容 |
|------|------|
| 方式 | slides.js のHTMLを解析 → PptxGenJS ネイティブAPIで図形・テキストを配置 |
| 編集 | ✅ PowerPoint でテキスト・図形を自由に編集可能 |
| 品質 | △ レイアウトは近似再現（CSSエフェクト・画像は非対応） |
| フォント | Noto Sans JP / Noto Sans JP Black（要インストール） |
| 用途 | 研修後の参加者配布・内容のカスタマイズ |
| ファイル | `js/export-text.js` |

#### 対応スライドタイプ

| スライドクラス | 種別 | 再現精度 |
|--------------|------|---------|
| `slide-cover` | カバー | ◎ |
| `slide-impact` | インパクト | ◎ |
| `slide-section` | セクション区切り | ◎ |
| `slide-ending` | エンディング | ◎ |
| コンテンツ：`s-list` | 箇条書き | ◎ |
| コンテンツ：`s-num-list` | 番号付きリスト | ◎ |
| コンテンツ：`s-steps` | ステップ | ◎ |
| コンテンツ：`s-flow` | フロー図 | ◎ |
| コンテンツ：`s-point-list` | ポイントリスト | ◎ |
| コンテンツ：`s-compare` | 比較表 | ◎ |
| コンテンツ：`s-prompt-box` | プロンプトボックス | ◎ |
| コンテンツ：複合（callout+prompt+list） | 複合レイアウト | ◎ |
| 挿入画像（`<img>`タグ） | 画像 | ❌ 非対応 |

#### フォントのインストール（初回のみ）

PowerPoint で正しく表示するには Noto Sans JP のインストールが必要。

```
Google Fonts から "Noto Sans JP" をダウンロードしてインストール
https://fonts.google.com/noto/specimen/Noto+Sans+JP
ウェイト: Regular (400), Black (900) を必ずインストール
```

#### 使い方

1. ブラウザで `index.html` を開く
2. エクスポートバーの「**編集可能PPTX**」ボタンをクリック
3. `{スラッグ名}_editable.pptx` がダウンロードされる
4. PowerPoint で開いてテキストを編集

---

## ファイル・フォルダ名のルール

GitHub Pages で正常に動くよう、以下のルールを守ること。

| 対象 | ルール | 例 |
|------|--------|-----|
| GitHubスラッグ | 英数字＋ハイフンのみ、小文字 | `sales-ai-seminar` |
| プロジェクトフォルダ名 | スラッグと同じ | `projects/sales-ai-seminar/` |
| ファイル名 | 英数字＋ハイフン＋ドット | `slides.js`, `style.css` |
| 日本語ファイル名 | 禁止（URLエンコードが汚くなる） | NG: `スライド.js` |

---

## テンプレートを追加・更新する

### 新しいテンプレートを追加

1. `templates/` に新しいフォルダを作成（例: `light-blue-v1/`）
2. 既存テンプレートをベースにコピー
3. CSS変数・カラーを変更
4. `template-spec.md` を更新（バージョン・説明）
5. `new-seminar.py` の `--template` で指定できるようになる

### 既存テンプレートをブラッシュアップ

1. `templates/{テンプレート名}/css/style.css` を編集
2. `template-spec.md` のバージョン履歴を更新
3. 変更は次回以降の `new-seminar.py` 実行から反映される
4. 既存プロジェクトには影響なし（各プロジェクトが独立コピーを持つ）

### 編集可能PPTXを他テンプレートに展開する方法

`export-text.js` は ascolor-minimal のカラーパレット・コンポーネント構造に対応している。
他テンプレートに展開する場合は以下を修正する：

1. `js/export-text.js` をテンプレートの `js/` フォルダにコピー
2. ファイル冒頭の `var C = { ... }` でカラーパレットをそのテンプレートに合わせる
3. `index.html` にボタンとスクリプト読み込みを追加：
   ```html
   <!-- export-bar 内 -->
   <button class="export-pptx-text" onclick="exportTextPptx()" title="テキスト編集可能なPPTX">編集可能PPTX</button>

   <!-- </body> 直前 -->
   <script src="js/export-text.js"></script>
   ```

---

## 各ページの役割

| ファイル | 用途 | 公開設定 |
|---------|------|---------|
| `viewer.html` | 受講者用（閲覧専用） | 公開URL |
| `presenter.html` | プレゼンター用（パスワード必要） | URLを知っていれば開ける |
| `admin.html` | 管理画面（パスワード設定・URL共有） | URLを知っていれば開ける |
| `index.html` | フル操作画面（編集・PDF/PPTX出力） | URLを知っていれば開ける |
| `manual.html` | 初期パスワード・運用マニュアル | ローカル専用（.gitignore） |

---

## パスワードのしくみ

- プレゼンターパスワードは **ブラウザのlocalStorage** に保存される
- `admin.html` でパスワードを設定 → 同じデバイス・ブラウザで `presenter.html` が開ける
- 別デバイスで使う場合は、そのデバイスでも `admin.html` でパスワードを設定する
- パスワードはソースコードに書かれていない（セキュリティ設計）

---

## よくある操作

```powershell
# テンプレート一覧を確認
python 08_アプリ開発事業部/outputs/slide-builder/new-seminar.py --list-templates

# ヘルプ
python 08_アプリ開発事業部/outputs/slide-builder/new-seminar.py --help

# 作業中プロジェクト一覧（ステージング）
ls 08_アプリ開発事業部/outputs/slide-builder/projects/

# 完成済みセミナー一覧
ls 06_セミナー事業部/outputs/

# ローカル開発サーバー起動（localhost:8765）
python 08_アプリ開発事業部/outputs/slide-builder/slide-server.py
```
