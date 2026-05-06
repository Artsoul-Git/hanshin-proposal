---
name: beginner-guide-creator
description: PC操作が苦手な完全初心者向けのHTML技術ガイドブックを作成する。Antigravity・Claude Code・各種ITツールの操作手順、業務フロー、設定方法などを「専門用語ゼロ」「クリックする場所まで明示」「フロー図と画面レイアウト付き」で丁寧に解説する。Word/HTML形式の長文マニュアル、初心者向け取扱説明書、操作手順書、研修資料、業務マニュアル、新人向けオンボーディング資料、ITツールの導入ガイドが必要なときに使用する。Triggers：「初心者向けマニュアル」「ガイドブック作成」「操作手順書」「専門用語使わずに説明」「画像なしでも分かるガイド」「フロー図入りマニュアル」「新人向け資料」など。
---

# 初心者向けHTMLガイドブック作成スキル

## このスキルの目的

PC操作・IT知識ゼロの完全初心者でも一人で読み進められる、保存・印刷可能なHTML形式のガイドブックを生成する。

「Antigravityって何？」「エクスプローラーってどこ？」「右クリックって？」レベルの読者を想定する。専門用語は全て噛み砕き、クリックする場所まで明示する。

## 起動条件（このスキルを使うとき）

- 「初心者向け○○ガイド」「○○の使い方マニュアル」と依頼があった時
- 「専門用語使わないで」「絵がなくても分かるように」「ステップバイステップで」と要望があった時
- 業務フロー、ITツール導入手順、新人研修資料、オンボーディング資料を頼まれた時
- WordかHTMLどちらか選べるなら基本HTMLで作る（フロー図・色分け枠・SVGが綺麗に出るため）

---

## 作成プロセス（必ず守る順序）

### Step 1：読者像の特定（5問の自問）

ファイル作成前に以下を自問・確認する：

1. **読者の知識レベル：** 完全初心者か、ある程度PC使えるか
2. **読者の目的：** 何ができるようになれば成功か（最終ゴール）
3. **使用環境：** Windows / Mac / モニタ枚数 / 必要なソフト
4. **詰まりやすいポイント：** 経験上どこで挫折しがちか
5. **想定所要時間：** 30分で読める？1時間？

不明確な点があればユーザーに確認を取る。

### Step 2：章構成の設計

以下のテンプレートに沿って章構成を作る（足し引きOKだが、この順序を崩さない）：

```
1. このガイドで何ができるようになるか（ゴール提示）
2. 必要なもの（チェックリスト）
3. 使う言葉を超ざっくり説明（用語の事前説明）
4. 全体の流れ（フロー図）← SVGで作成
5〜N. 操作の各ステップ（章ごとに区切る）
N+1. こんな時どうする（トラブルシューティング8〜10件）
N+2. 用語集（再掲・詳細版）
付録A〜C. 効率化Tips、比較表、応用設定
```

### Step 3：HTMLファイル作成

下記の「HTMLテンプレート」をコピーして本文を埋めていく。

### Step 4：完成後の自己レビュー

3つのチェックを実施：

- [ ] 専門用語を使ってない or 全て初出時に定義してある
- [ ] 各ステップに「クリックする場所」「打つ文字」が明示されている
- [ ] フロー図・ASCII画面・色分け枠が章ごとに最低1個入っている

---

## 文体・トーン（最重要）

### やる

- **二人称で話しかける：** 「〜してください」「〜です」「〜してみよう」
- **ですます調＋たまにフラット：** 堅苦しくない実用書のトーン
- **クリックする場所を物理的に明示：** 「左上の」「右下の」「ファイルメニューの中の」
- **数値で示す：** 「数十秒かかる」「1〜2分で終わる」「文字サイズは14→18に」
- **複数の方法を併記：** 「方法A：メニューから」「方法B：ショートカット」
- **挫折ポイントを先回り：** 「ここで詰まりがち」「うまくいかない場合は」

### やらない

- **業界用語の連発：** 「IDE」「リポジトリ」「コミット」「デプロイ」を定義なしで使わない
- **「簡単です」「すぐできます」：** 初心者には全然簡単じゃない。これ言うと萎える
- **自慢気な口調：** 「○○すれば解決！」みたいなノリ
- **過度な絵文字：** 必要な箇所のみ最小限。基本ゼロでもOK
- **長い前置き：** 各章の冒頭で哲学を語らない。すぐ手順に入る
- **画像前提の説明：** 「下の図のように」だけでは不可。文章＋ASCII＋SVGで補完

---

## HTMLテンプレート（全文）

以下を雛形としてコピーし、本文を入れ替える。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>【ここにタイトル】</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Yu Gothic UI", "Hiragino Sans", "Meiryo", sans-serif;
    line-height: 1.8;
    color: #2D3748;
    background: #FAFBFC;
    padding: 40px 20px;
  }
  .container { max-width: 900px; margin: 0 auto; background: white; padding: 60px 70px; box-shadow: 0 2px 30px rgba(0,0,0,0.08); border-radius: 12px; }
  .cover { text-align: center; padding: 80px 0 60px; border-bottom: 4px solid #1A365D; margin-bottom: 50px; }
  .cover h1 { font-size: 36px; color: #1A365D; margin-bottom: 20px; line-height: 1.4; }
  .cover .sub { font-size: 20px; color: #ED8936; font-weight: bold; margin-bottom: 40px; }
  .cover .meta { color: #718096; font-size: 14px; }
  h2 { font-size: 28px; color: #1A365D; padding: 50px 0 15px; margin-top: 40px; border-bottom: 3px solid #ED8936; line-height: 1.4; }
  h2:first-of-type { margin-top: 0; }
  h2 .num { display: inline-block; background: #1A365D; color: white; padding: 6px 16px; border-radius: 6px; font-size: 18px; margin-right: 12px; vertical-align: middle; }
  h3 { font-size: 22px; color: #2D3748; margin: 30px 0 15px; padding-left: 16px; border-left: 6px solid #ED8936; line-height: 1.5; }
  h4 { font-size: 18px; color: #1A365D; margin: 25px 0 10px; }
  p { margin: 15px 0; }
  .lead { font-size: 18px; color: #1A365D; background: #EDF2F7; padding: 20px 25px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #1A365D; }
  .tip { background: #FFFAF0; padding: 20px 25px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ED8936; }
  .tip .label { font-weight: bold; color: #C05621; display: block; margin-bottom: 8px; }
  .warn { background: #FFF5F5; padding: 20px 25px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #E53E3E; }
  .warn .label { font-weight: bold; color: #C53030; display: block; margin-bottom: 8px; }
  .ok { background: #F0FFF4; padding: 20px 25px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #38A169; }
  .ok .label { font-weight: bold; color: #2F855A; display: block; margin-bottom: 8px; }
  code { background: #2D3748; color: #F6AD55; padding: 2px 8px; border-radius: 4px; font-family: "Consolas", "SF Mono", monospace; font-size: 14px; }
  pre { background: #1A202C; color: #E2E8F0; padding: 20px 25px; border-radius: 8px; overflow-x: auto; margin: 20px 0; font-family: "Consolas", "SF Mono", monospace; font-size: 14px; line-height: 1.6; }
  pre code { background: none; color: inherit; padding: 0; }
  ul, ol { padding-left: 30px; margin: 15px 0; }
  li { margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #1A365D; color: white; padding: 12px; text-align: left; }
  td { padding: 12px; border-bottom: 1px solid #E2E8F0; }
  tr:nth-child(even) { background: #F7FAFC; }
  .step { background: #EDF2F7; padding: 25px 30px; border-radius: 8px; margin: 25px 0; border-top: 4px solid #1A365D; }
  .step-num { display: inline-block; background: #ED8936; color: white; width: 36px; height: 36px; border-radius: 50%; text-align: center; line-height: 36px; font-weight: bold; margin-right: 12px; }
  .toc { background: #F7FAFC; padding: 30px 40px; border-radius: 8px; margin: 30px 0; }
  .toc h3 { border: none; padding-left: 0; }
  .toc ul { list-style: none; padding-left: 0; }
  .toc li { padding: 6px 0; }
  .toc a { color: #1A365D; text-decoration: none; }
  .toc a:hover { color: #ED8936; }
  .flow-diagram { background: #FAFBFC; padding: 30px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #E2E8F0; }
  .ascii-screen { background: #1A202C; color: #E2E8F0; padding: 25px; border-radius: 8px; font-family: "Consolas", monospace; font-size: 13px; line-height: 1.5; margin: 20px 0; overflow-x: auto; white-space: pre; }
  .check-list { background: #F0FFF4; padding: 25px 30px; border-radius: 8px; margin: 25px 0; }
  .check-list li { list-style: none; padding-left: 30px; position: relative; }
  .check-list li::before { content: "□"; position: absolute; left: 0; color: #2F855A; font-size: 20px; }
  .glossary dt { font-weight: bold; color: #1A365D; margin-top: 15px; font-size: 16px; }
  .glossary dd { padding-left: 20px; color: #4A5568; margin: 5px 0; }
  .quote { background: #FFF8DC; padding: 20px 25px; border-left: 5px solid #B7791F; margin: 20px 0; font-style: italic; color: #744210; }
  hr { border: none; border-top: 2px dashed #E2E8F0; margin: 50px 0; }
</style>
</head>
<body>
<div class="container">

<!-- 表紙 -->
<div class="cover">
  <h1>【メインタイトル】<br>【サブタイトル】</h1>
  <div class="sub">【一言キャッチコピー】</div>
  <div class="meta">【発行年月】 / 【対象読者】</div>
</div>

<!-- 目次 -->
<div class="toc">
  <h3>もくじ</h3>
  <ul>
    <li><a href="#ch1">第1章　【章タイトル】</a></li>
    <!-- 章数分繰り返し -->
  </ul>
</div>

<hr>

<!-- 各章本文（h2 ＋ 本文 を章数分繰り返す）-->
<h2 id="ch1"><span class="num">1</span>【章タイトル】</h2>

<div class="lead">
【この章で何ができるようになるかの一文】
</div>

<p>【本文】</p>

<!-- 必要に応じて以下の要素を組み合わせる -->

<!-- ステップ -->
<div class="step">
<h3><span class="step-num">1</span>【手順タイトル】</h3>
<p>【手順詳細】</p>
</div>

<!-- ヒント -->
<div class="tip">
<span class="label">ポイント</span>
【ヒント本文】
</div>

<!-- 警告 -->
<div class="warn">
<span class="label">注意</span>
【注意事項】
</div>

<!-- 成功確認 -->
<div class="ok">
<span class="label">ここまで完了</span>
【完了状態の説明】
</div>

<!-- コードブロック -->
<pre><code>cd "D:\example\path"</code></pre>

<!-- ASCIIスクリーン -->
<div class="ascii-screen">┌─────────┐
│ 画面例    │
└─────────┘</div>

<!-- チェックリスト -->
<div class="check-list">
<ul>
  <li>【項目1】</li>
  <li>【項目2】</li>
</ul>
</div>

<!-- 比較表 -->
<table>
<tr><th>項目</th><th>説明</th></tr>
<tr><td>A</td><td>解説</td></tr>
</table>

<!-- 用語集 -->
<dl class="glossary">
<dt>用語1</dt>
<dd>解説</dd>
</dl>

<!-- 引用 -->
<div class="quote">
【まとめの一言】
</div>

</div>
</body>
</html>
```

---

## SVGフロー図テンプレート

縦並びのフロー図を作りたい時はこれをベースに編集する。1ステップあたり高さ100px。

```html
<div class="flow-diagram">
<svg viewBox="0 0 700 800" width="100%" style="max-width:600px">
  <defs>
    <marker id="arr" markerWidth="12" markerHeight="12" refX="10" refY="3" orient="auto">
      <polygon points="0,0 10,3 0,6" fill="#1A365D"/>
    </marker>
  </defs>

  <!-- ステップ1 -->
  <rect x="200" y="20" width="300" height="60" fill="#1A365D" rx="8"/>
  <text x="350" y="58" fill="white" text-anchor="middle" font-size="18" font-weight="bold">① 【ステップ名】</text>
  <line x1="350" y1="85" x2="350" y2="115" stroke="#1A365D" stroke-width="3" marker-end="url(#arr)"/>

  <!-- ステップ2（色を段々変える）-->
  <rect x="200" y="120" width="300" height="60" fill="#2C5282" rx="8"/>
  <text x="350" y="158" fill="white" text-anchor="middle" font-size="18" font-weight="bold">② 【ステップ名】</text>
  <line x1="350" y1="185" x2="350" y2="215" stroke="#1A365D" stroke-width="3" marker-end="url(#arr)"/>

  <!-- 以下、必要なステップ数分繰り返し。色は #1A365D → #2C5282 → #3182CE → #2F855A → #C05621 のグラデーションが見やすい -->
</svg>
</div>
```

---

## 並列構成図テンプレート

「3つの作業が並列で進む」みたいな絵に使う：

```html
<div class="flow-diagram">
<svg viewBox="0 0 800 350" width="100%" style="max-width:700px">
  <!-- 画面1（ネイビー）-->
  <rect x="20" y="20" width="240" height="280" fill="#1A365D" rx="10"/>
  <text x="140" y="60" fill="white" text-anchor="middle" font-size="20" font-weight="bold">画面1</text>
  <text x="140" y="90" fill="#ED8936" text-anchor="middle" font-size="18" font-weight="bold">【ラベル1】</text>

  <!-- 画面2（グリーン）-->
  <rect x="280" y="20" width="240" height="280" fill="#2F855A" rx="10"/>
  <text x="400" y="60" fill="white" text-anchor="middle" font-size="20" font-weight="bold">画面2</text>
  <text x="400" y="90" fill="#F6AD55" text-anchor="middle" font-size="18" font-weight="bold">【ラベル2】</text>

  <!-- 画面3（オレンジ）-->
  <rect x="540" y="20" width="240" height="280" fill="#C05621" rx="10"/>
  <text x="660" y="60" fill="white" text-anchor="middle" font-size="20" font-weight="bold">画面3</text>
  <text x="660" y="90" fill="#FED7AA" text-anchor="middle" font-size="18" font-weight="bold">【ラベル3】</text>

  <text x="400" y="335" fill="#2D3748" text-anchor="middle" font-size="14">↑ 【3つの状態の説明】</text>
</svg>
</div>
```

---

## ASCII画面レイアウトの作り方

操作対象アプリの画面レイアウトを文章で表すときに使う。罫線文字を使う：

```
┌─────────────────────────────────────────────┐
│  [メニューバー]                                │
├──────┬──────────────────────────┬─────────┤
│ 左   │       中央エリア            │  右      │
│ サイド│                            │  サイド  │
│ バー  │                            │  パネル  │
│      ├──────────────────────────┤         │
│      │   下のターミナル              │         │
└──────┴──────────────────────────┴─────────┘
```

罫線文字一覧：`┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ─ │`

---

## 章ごとの内容パターン集

### パターンA：「これは何？」章（全体の0章目）

```html
<h2 id="ch1"><span class="num">1</span>このガイドで何ができるようになるか</h2>

<div class="lead">
このガイドを最後まで読むと、【最終的にできること】が一人でできるようになります。
</div>

<p>「【最終ゴール】」とは、こういうイメージです：</p>

【ここに並列構成図or完成形SVG】

<p>【最終ゴールを実現する手段の一文補足】</p>
```

### パターンB：「必要なもの」章

```html
<h2 id="ch2"><span class="num">2</span>まず必要なもの（チェックリスト）</h2>

<div class="check-list">
<ul>
  <li>【必要な物1】</li>
  <li>【必要な物2】</li>
</ul>
</div>

<div class="tip">
<span class="label">まだ何かが揃ってない場合</span>
【代替案や入手方法】
</div>
```

### パターンC：「用語の事前説明」章（後で詳細用語集と二段構え）

```html
<h2 id="ch3"><span class="num">3</span>使う言葉を超ざっくり説明</h2>

<p>難しい言葉を全部かみ砕きます。</p>

<dl class="glossary">
<dt>用語1</dt>
<dd>【小学生でも分かる説明】</dd>

<dt>用語2</dt>
<dd>【小学生でも分かる説明】</dd>
</dl>
```

### パターンD：「ステップ手順」章（メインの操作章）

```html
<h2 id="chN"><span class="num">N</span>【操作タイトル】</h2>

<div class="step">
<h3><span class="step-num">1</span>【手順タイトル】</h3>
<p>【1〜2文で説明。具体的なクリック場所・キー操作を含める】</p>
<p>例：左下の <strong>Windowsマーク</strong> をクリック → 「antigravity」と入力 → 検索結果の <strong>「Google Antigravity」</strong> をクリック</p>
</div>

<div class="step">
<h3><span class="step-num">2</span>【次の手順】</h3>
<p>【操作内容】</p>
<pre><code>具体的なコマンドや入力文字</code></pre>
</div>

<div class="ok">
<span class="label">ここまで完了</span>
<strong>【ここまでで何が達成されたか】</strong>
</div>
```

### パターンE：「トラブルシューティング」章

```html
<h2 id="chTrouble"><span class="num">N</span>こんな時どうする（よくあるトラブル）</h2>

<h3>困りごと1：【症状】</h3>
<p>【原因の説明】</p>
<p>【対処法】</p>
<pre><code>【コマンドなど】</code></pre>

<h3>困りごと2：【症状】</h3>
<p>【対処法】</p>
```

### パターンF：「比較表」付録章

```html
<h2 id="chAppendix"><span class="num">付録A</span>【比較対象】の比較</h2>

<table>
<tr><th>方式</th><th>メリット</th><th>デメリット</th><th>こんな人向け</th></tr>
<tr>
<td><strong>方式A（推奨）</strong></td>
<td>【メリット】</td>
<td>【デメリット】</td>
<td>【向いてる人】</td>
</tr>
<tr>
<td>方式B</td>
<td>【メリット】</td>
<td>【デメリット】</td>
<td>【向いてる人】</td>
</tr>
</table>

<div class="tip">
<span class="label">迷ったら</span>
【選択指針】
</div>
```

### パターンG：「ショートカット集」付録章

```html
<h2 id="chShortcut"><span class="num">付録B</span>効率を上げる超基本ショートカット集</h2>

<p>覚えなくても作業は進みますが、覚えるだけで <strong>1日30分</strong> は浮きます。</p>

<h3>1. 【カテゴリ名】</h3>

<table>
<tr><th>キー</th><th>効果</th><th>使いどころ</th></tr>
<tr><td><code>Ctrl + S</code></td><td>保存</td><td>定期的に</td></tr>
</table>

<div class="tip">
<span class="label">最初に覚えるべき5つ</span>
全部覚える必要はありません。<strong>これだけ覚えれば十分</strong>：
<ol>
<li><code>Ctrl + S</code>：保存</li>
</ol>
</div>
```

---

## カラーパレット（変えるときの参考）

| 用途 | カラーコード | 名前 |
|------|------------|------|
| メインカラー（h2、ボタン） | `#1A365D` | ネイビー |
| アクセント（h3罫線、tip） | `#ED8936` | オレンジ |
| 警告（warn） | `#E53E3E` | レッド |
| 成功（ok） | `#38A169` | グリーン |
| 引用（quote） | `#B7791F` | アンバー |
| 本文文字 | `#2D3748` | ダークグレー |
| サブテキスト | `#718096` | グレー |
| 背景 | `#FAFBFC` | オフホワイト |
| 強調背景（lead） | `#EDF2F7` | ライトブルー |

業界によって変えても良い：
- 製造・建設 → ネイビー＋オレンジ＋グリーン（このまま）
- 医療・教育 → ベージュ＋ピンク＋ブラウン（warm系）
- 金融・コンサル → ネイビー＋ゴールド＋シルバー
- IT・テック → ダークグレー＋ティール＋イエロー

---

## 完成チェックリスト

最終出力する前に、以下を確認：

```
構造
- [ ] 表紙（cover）に大きいタイトル + サブ + 発行情報
- [ ] 目次（toc）が章番号付きで全章リストアップされている
- [ ] 各h2に <span class="num">N</span> で章番号バッジ
- [ ] フロー図（SVG）が最低1個入っている
- [ ] ASCII画面図が最低1個入っている

内容
- [ ] 1章目で「最終ゴール」を明示している
- [ ] 用語の事前説明が3〜10個ある
- [ ] 各操作ステップで「クリックする場所」が具体的
- [ ] トラブルシューティングが5〜10件
- [ ] 用語集が再掲・詳細版で章末にある

スタイル
- [ ] tip/warn/ok の3色callout boxを使い分けている
- [ ] step（番号付きカード）で手順を区切っている
- [ ] code, pre, ascii-screen を適切に使い分けている
- [ ] 比較が必要な箇所で表（table）を使っている

トーン
- [ ] 専門用語は全て初出時に定義している
- [ ] 「簡単」「すぐ」を多用していない
- [ ] 二人称（〜してください）で話しかけている
- [ ] 複数の方法（A/B/C）を併記している箇所がある
```

---

## 出力先のルール

完成したHTMLは以下に保存する：

```
{outputs_dir}/{ガイド名}.html
```

例：
- `outputs/Antigravity並列運用ガイド.html`
- `outputs/Slack設定マニュアル_新人向け.html`

ファイルを保存したら、computer:// 形式のリンクをユーザーに提示する：

```
[ガイドを開く](computer://{絶対パス})
```

---

## 想定される派生ガイド例

このスキルで作れるガイドの例：

- ITツール導入：Slack / Notion / Asana / Microsoft 365 の新人向け使い方
- 開発環境構築：VS Code / Antigravity / Git のセットアップ手順
- 業務フロー：経費精算 / 有給申請 / 出張手配 の社内マニュアル
- AI活用：Claude / ChatGPT / Gemini を業務で使うコツ
- セキュリティ：パスワード管理 / 二段階認証 / VPN の使い方
- リモートワーク：Zoom / Teams / Google Meet の操作と TIPS
- 経理・法務系：請求書発行 / 契約書チェック / 確定申告の手順

業界・読者層に応じてカラーパレットや用語難易度を調整する。

---

## このスキルを実行する時のメッセージ例

ユーザーから依頼があった時、最初にこう確認する：

```
ガイド作成、了解です。事前に5点だけ確認させてください：

1. 読者の知識レベル：完全初心者？ある程度PC使える？
2. 読者のゴール：何ができるようになれば成功？
3. 使用環境：Windows / Mac / 必要なソフト
4. 想定ボリューム：30分で読める / 1時間 / 辞書的に使える
5. 業界・トーン：堅め / カジュアル / どちらでも

未確定なら推測で進めますが、教えてもらえると精度上がります。
```

回答後、章構成案を箇条書きで先に提示してユーザーに確認、OKなら本文生成へ。
