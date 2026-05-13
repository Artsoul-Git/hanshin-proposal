# /visualize スキル

**用途:** テーマ・目標を受け取り、4種類の図（4象限マトリクス・マンダラチャート・フロー図・ガントチャート）でブラウザで直接表示できるHTMLを生成する。draw.ioへのコピペ不要。ドリルダウン（マンダラ→4象限→フロー→ガント）で思考を段階的に深掘りできる。

---

## 発動条件

- 「4象限マトリクスで整理して」「マトリクス分析して」「優先順位を図にして」
- 「マンダラチャートを作って」「9×9で展開して」「目標を分解して」
- 「フロー図にして」「業務フローを図にして」「プロセスを可視化して」
- 「ガントチャートを作って」「スケジュールを図にして」「タイムラインを作って」
- 「図で可視化したい」「思考を構造化して」
- 「深掘りして」「ドリルダウンで」

---

## 4つのチャートモード

| モード | 技術 | 用途 |
|--------|------|------|
| A: 4象限マトリクス | HTML/CSS + SVG | 2軸で項目を優先度整理 |
| B: マンダラチャート | HTML/CSS Grid | 目標を9×9（64タスク）に展開 |
| C: フロー図 | Mermaid.js | プロセス・業務フローの図解 |
| D: ガントチャート | Mermaid.js | 実行タイムラインの設計 |

---

## 出力仕様（全チャート共通）

生成するHTMLに必ず含める要素：

```
1. ブラウザで直接開ける自己完結HTML（外部ファイル依存なし）
2. チャートはブラウザ内でレンダリング（draw.io不要）
3. コピーボタン：該当コード（Mermaid or SVG/JSON）をクリップボードにコピー
4. draw.io XMLボタン：draw.io用XMLも取得できる（オプション）
5. タイトル・作成日・テーマを上部に表示
6. 全体をカードUIでラップ（白背景・シャドウ・max-width: 1200px・中央寄せ）
```

### コピーボタン実装（JS）

全チャートのHTMLに必ず含めるJavaScript：

```javascript
function copyCode(type) {
  let code = '';
  const sources = {
    mermaid: () => document.getElementById('mermaid-source').textContent.trim(),
    svg:     () => document.querySelector('.chart-area svg').outerHTML,
    xml:     () => document.getElementById('drawio-xml').textContent.trim(),
    data:    () => JSON.stringify(window.chartData, null, 2)
  };
  code = sources[type] ? sources[type]() : '';
  navigator.clipboard.writeText(code).then(() => {
    const btn = event.currentTarget;
    const orig = btn.textContent;
    btn.textContent = '✅ コピーしました';
    setTimeout(() => btn.textContent = orig, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}
```

### ツールバーHTML（全チャート共通）

```html
<div class="toolbar">
  <button onclick="copyCode('mermaid')">📋 Mermaidコードをコピー</button>
  <!-- またはSVGの場合 -->
  <button onclick="copyCode('svg')">📋 SVGをコピー</button>
  <button onclick="copyCode('xml')">📐 draw.io XMLをコピー</button>
</div>
```

### ファイル命名・保存先

```
保存先：08_アプリ開発事業部/outputs/visualize-outputs/
ファイル名：{テーマ}_{チャート種別}_{YYYYMMDD}.html
例：
  AI導入推進_マンダラ_20260514.html
  AI導入推進_4象限_20260514.html
  AI導入推進_フロー_20260514.html
  AI導入推進_ガント_20260514.html
```

---

## モードA：4象限マトリクス

### 分析ステップ

1. 分析目的を1文で定義
2. 対象項目をMECEにリストアップ（10〜20項目目安）
3. X軸・Y軸をカスタム設計（例：影響度×実現可能性）
4. 各象限の戦略的意味を定義（例：即着手 / 計画的推進 / 委任 / 保留）
5. 項目を論理的根拠を持ってプロット
6. HTML生成

### HTML構造仕様

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>[テーマ] 4象限マトリクス</title>
<style>
body { font-family: 'Hiragino Sans', sans-serif; background: #f0f2f5; margin: 0; padding: 24px; }
.card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.1);
        max-width: 1100px; margin: 0 auto; padding: 32px; }
h1 { font-size: 22px; color: #222; margin-bottom: 4px; }
.meta { font-size: 13px; color: #888; margin-bottom: 24px; }
.matrix-wrap { position: relative; width: 100%; }
.axis-x-label { text-align: center; font-size: 13px; font-weight: bold; margin: 4px 0; }
.axis-y-wrap { display: flex; align-items: stretch; gap: 8px; }
.axis-y-label { writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);
                font-size: 13px; font-weight: bold; display: flex; align-items: center;
                justify-content: center; min-width: 20px; }
.matrix { flex: 1; display: grid; grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr; gap: 3px; min-height: 480px;
          border: 3px solid #333; position: relative; }
.matrix::before { /* 中央の十字線 */
  content: ''; position: absolute; left: 50%; top: 0; bottom: 0;
  width: 1px; background: #666; z-index: 1; }
.matrix::after {
  content: ''; position: absolute; top: 50%; left: 0; right: 0;
  height: 1px; background: #666; z-index: 1; }
.quadrant { padding: 16px; display: flex; flex-wrap: wrap;
            gap: 6px; align-content: flex-start; position: relative; }
.q-label { position: absolute; top: 8px; right: 10px;
           font-size: 11px; font-weight: bold; color: #666; opacity: .8; }
.q1 { background: #e8f5e9; } /* 高Y高X：最優先 */
.q2 { background: #e3f2fd; } /* 高Y低X：長期投資 */
.q3 { background: #fff3e0; } /* 低Y低X：保留 */
.q4 { background: #fce4ec; } /* 低Y高X：委任 */
.item { background: white; border-radius: 20px; padding: 4px 12px;
        font-size: 12px; border: 1px solid #ddd;
        box-shadow: 1px 1px 4px rgba(0,0,0,.08); cursor: default; }
.item:hover { box-shadow: 2px 2px 8px rgba(0,0,0,.15); transform: translateY(-1px); }
.x-ends { display: flex; justify-content: space-between;
          font-size: 12px; color: #666; margin-top: 4px; padding: 0 4px; }
.toolbar { margin-top: 24px; display: flex; gap: 10px; flex-wrap: wrap; }
.toolbar button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px;
                  cursor: pointer; font-size: 13px; background: #f8f9fa; }
.toolbar button:hover { background: #e9ecef; }
</style>
</head>
<body>
<div class="card">
  <h1>[テーマ] 4象限マトリクス</h1>
  <div class="meta">X軸：[X軸名] ／ Y軸：[Y軸名]　作成日：YYYY-MM-DD</div>
  <div class="matrix-wrap">
    <div class="axis-x-label">[X軸 高値ラベル] →</div>
    <div class="axis-y-wrap">
      <div class="axis-y-label">↑ [Y軸 高値ラベル]</div>
      <div class="matrix">
        <div class="quadrant q2">
          <span class="q-label">🔷 [象限2名称]</span>
          <span class="item">[項目]</span>
        </div>
        <div class="quadrant q1">
          <span class="q-label">🔴 [象限1名称]</span>
          <span class="item">[項目]</span>
        </div>
        <div class="quadrant q3">
          <span class="q-label">⚪ [象限3名称]</span>
          <span class="item">[項目]</span>
        </div>
        <div class="quadrant q4">
          <span class="q-label">🟡 [象限4名称]</span>
          <span class="item">[項目]</span>
        </div>
      </div>
      <div class="axis-y-label">↓ [Y軸 低値ラベル]</div>
    </div>
    <div class="x-ends"><span>← [X軸 低値ラベル]</span><span></span></div>
  </div>
  <div class="toolbar">
    <button onclick="copyCode('svg')">📋 SVGをコピー</button>
    <button onclick="copyCode('xml')">📐 draw.io XMLをコピー</button>
  </div>
</div>
<!-- draw.io XML（非表示） -->
<pre id="drawio-xml" style="display:none">[draw.io XML文字列]</pre>
<script>
window.chartData = { /* 項目データ */ };
/* copyCode関数を上記共通仕様から埋め込む */
</script>
</body>
</html>
```

---

## モードB：マンダラチャート

### 分析ステップ

1. 中心テーマを確定
2. 8つの主要テーマを導出（MECE・目標達成の柱）
3. 各主要テーマから8つのタスク/アクションを展開（計64個）
4. HTML生成

### HTML構造仕様

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>[テーマ] マンダラチャート</title>
<style>
body { font-family: 'Hiragino Sans', sans-serif; background: #f0f2f5; margin: 0; padding: 24px; }
.card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.1);
        max-width: 1200px; margin: 0 auto; padding: 32px; }
h1 { font-size: 22px; color: #222; margin-bottom: 4px; }
.meta { font-size: 13px; color: #888; margin-bottom: 24px; }
.mandala { display: grid; grid-template-columns: repeat(9, 1fr);
           grid-template-rows: repeat(9, 1fr); gap: 3px; min-height: 720px; }
.cell { display: flex; align-items: center; justify-content: center;
        text-align: center; font-size: 11px; line-height: 1.3;
        border-radius: 4px; padding: 4px; cursor: default;
        transition: transform .15s, box-shadow .15s; }
.cell:hover { transform: scale(1.05); box-shadow: 0 2px 8px rgba(0,0,0,.2); z-index: 10; }
.center  { background: #5c9bd6; color: white; font-weight: bold; font-size: 12px; }
.theme-1 { background: #ff8a80; color: white; font-weight: bold; }
.theme-2 { background: #69f0ae; color: #1a1a1a; font-weight: bold; }
.theme-3 { background: #ffd740; color: #1a1a1a; font-weight: bold; }
.theme-4 { background: #40c4ff; color: white; font-weight: bold; }
.theme-5 { background: #e040fb; color: white; font-weight: bold; }
.theme-6 { background: #ff6d00; color: white; font-weight: bold; }
.theme-7 { background: #00bfa5; color: white; font-weight: bold; }
.theme-8 { background: #8d6e63; color: white; font-weight: bold; }
.task-1  { background: #ffe8e8; }
.task-2  { background: #e8fff4; }
.task-3  { background: #fffde8; }
.task-4  { background: #e8f8ff; }
.task-5  { background: #f8e8ff; }
.task-6  { background: #fff3e8; }
.task-7  { background: #e8fffc; }
.task-8  { background: #f5f0ee; }
.empty   { background: transparent; }
.toolbar { margin-top: 24px; display: flex; gap: 10px; }
.toolbar button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px;
                  cursor: pointer; font-size: 13px; background: #f8f9fa; }
.toolbar button:hover { background: #e9ecef; }
</style>
</head>
<body>
<div class="card">
  <h1>[テーマ] マンダラチャート</h1>
  <div class="meta">中心目標：[テーマ]　作成日：YYYY-MM-DD</div>
  <div class="mandala">
    <!-- 81セル。配置ルール：
         中央グリッド（row4-6, col4-6）に中心テーマ+8主要テーマ
         外周8グリッドの中心セルに対応する主要テーマ（同色）
         外周グリッドの残り8セルに対応タスク
         空セルは class="cell empty" -->
    [81個の<div class="cell [クラス]">[内容]</div>を展開]
  </div>
  <div class="toolbar">
    <button onclick="copyCode('data')">📋 データをコピー（JSON）</button>
    <button onclick="copyCode('xml')">📐 draw.io XMLをコピー</button>
  </div>
</div>
<pre id="drawio-xml" style="display:none">[draw.io XML文字列]</pre>
<script>
window.chartData = {
  center: "[テーマ]",
  themes: [
    { name: "[主要テーマ1]", tasks: ["[T1]","[T2]","[T3]","[T4]","[T5]","[T6]","[T7]","[T8]"] },
    /* ... × 8 */
  ]
};
/* copyCode関数を埋め込む */
</script>
</body>
</html>
```

#### 81セルの座標ルール

```
9×9グリッドの座標（row=0〜8, col=0〜8）

中央グリッド（row3〜5, col3〜5）：
  row=4, col=4 → center（メインテーマ）
  他8マス → theme-1〜8（主要テーマ、時計回りに配置）

外周8グリッドの座標とテーマ対応：
  top-left    (row0-2, col0-2)   → theme-1のサブグリッド
  top-center  (row0-2, col3-5)   → theme-2のサブグリッド
  top-right   (row0-2, col6-8)   → theme-3のサブグリッド
  mid-right   (row3-5, col6-8)   → theme-4のサブグリッド
  bot-right   (row6-8, col6-8)   → theme-5のサブグリッド
  bot-center  (row6-8, col3-5)   → theme-6のサブグリッド
  bot-left    (row6-8, col0-2)   → theme-7のサブグリッド
  mid-left    (row3-5, col0-2)   → theme-8のサブグリッド

各サブグリッド内：
  中央セル（row+1, col+1）→ 対応する主要テーマ（同色クラス）
  周囲8セル → 対応するタスク（task-Nクラス）
```

---

## モードC：フロー図

### 分析ステップ

1. フローのスコープ（開始〜終了）を定義
2. ステップを順序だてリストアップ（5〜15ステップ目安）
3. 分岐・判断ポイントを特定
4. Mermaid flowchartシンタックスで記述
5. HTML生成

### Mermaid記法ガイド

```
flowchart TD                     ← 上から下（LRで左から右）
  A([開始])                      ← 角丸（開始・終了）
  B[ステップ名]                  ← 四角（処理）
  C{判断ポイント}                ← ひし形（条件分岐）
  D[(データ/ファイル)]           ← データベース型
  A --> B --> C
  C -->|Yes| D1[処理A]
  C -->|No|  D2[処理B]
  D1 & D2 --> E([終了])
  style A fill:#4CAF50,color:white
  style C fill:#FF9800,color:white
```

### HTML構造仕様

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>[テーマ] フロー図</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>
body { font-family: 'Hiragino Sans', sans-serif; background: #f0f2f5; margin: 0; padding: 24px; }
.card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.1);
        max-width: 1100px; margin: 0 auto; padding: 32px; }
h1 { font-size: 22px; color: #222; margin-bottom: 4px; }
.meta { font-size: 13px; color: #888; margin-bottom: 24px; }
.chart-area { overflow: auto; padding: 16px; background: #fafafa;
              border-radius: 8px; border: 1px solid #eee; }
.toolbar { margin-top: 24px; display: flex; gap: 10px; }
.toolbar button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px;
                  cursor: pointer; font-size: 13px; background: #f8f9fa; }
</style>
</head>
<body>
<div class="card">
  <h1>[テーマ] フロー図</h1>
  <div class="meta">作成日：YYYY-MM-DD</div>
  <div class="chart-area">
    <div class="mermaid">
flowchart TD
  [Mermaidコードをここに展開]
    </div>
  </div>
  <div class="toolbar">
    <button onclick="copyCode('mermaid')">📋 Mermaidコードをコピー</button>
  </div>
</div>
<pre id="mermaid-source" style="display:none">
[Mermaidコードをここにも格納（コピー用）]
</pre>
<script>
mermaid.initialize({ startOnLoad: true, theme: 'default', flowchart: { htmlLabels: true } });
/* copyCode関数を埋め込む */
</script>
</body>
</html>
```

---

## モードD：ガントチャート

### 分析ステップ

1. プロジェクト期間・フェーズを定義
2. タスクと期間をリストアップ
3. タスク間の依存関係を確認
4. Mermaid ganttシンタックスで記述
5. HTML生成

### Mermaid記法ガイド

```
gantt
  dateFormat  YYYY-MM-DD
  title [プロジェクト名]
  excludes weekends
  section フェーズ1：準備
    タスクA  :a1, 2026-06-01, 7d
    タスクB  :a2, after a1, 14d
  section フェーズ2：実行
    タスクC  :crit, 2026-06-15, 21d    ← crit = クリティカルパス
    タスクD  :after a2, 7d
  section フェーズ3：定着
    タスクE  :milestone, 2026-07-15, 0d  ← milestone
```

### HTML構造仕様

フロー図と同構造。`mermaid` ブロック内を `gantt` 記法に変更。

---

## ドリルダウンモード（段階的深掘り）

**起動：** 「深掘りして」「ドリルダウンで」または `/visualize 深掘り [テーマ]`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1：マンダラチャート（全体像の展開）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  KaiがテーマをMECEに分解 → マンダラチャートHTML生成
  → 「8つの主要テーマのうち、どれを深掘りしますか？
     1〜8の番号または名前で指定してください。
     複数選択・追加・名称変更も可能です。」

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2：4象限マトリクス（優先度整理）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  選ばれた主要テーマの8タスクを2軸で優先度整理 → 4象限HTML生成
  → 「配置した項目について：
     ・修正したい項目はありますか？
     ・追加したい項目はありますか？
     どの象限（例：左上・右上）の課題から実行しますか？」

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3：フロー図（実行プロセスの設計）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  選ばれた課題の実行ステップを図解 → フロー図HTML生成
  → 「このフローについて：
     ・追加・変更したいステップはありますか？
     このフローをガントチャートにしてスケジュール化しますか？」

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4：ガントチャート（実行タイムライン）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  フローをタイムラインに変換 → ガントチャートHTML生成
  → 「このガントチャートを提案資料に組み込みますか？
     → /sme-ai-proposal で提案書に統合できます」
```

---

## 単独モードの起動例

```
/visualize 4象限 [テーマ]     → モードAのみ実行
/visualize マンダラ [テーマ]  → モードBのみ実行
/visualize フロー [テーマ]    → モードCのみ実行
/visualize ガント [テーマ]    → モードDのみ実行
/visualize 深掘り [テーマ]    → ドリルダウンモード（A→B→C→D）
```

---

## 関連スキル

- 分析結果を提案書に落とし込む → `/sme-ai-proposal`
- マーケティング戦略の思考整理 → `/marketing`（壁打ち後に本スキルで可視化）
- 問題構造の整理 → `/issue-tree`（分解後に本スキルでマンダラ/4象限化）
- KPI体系の可視化 → `/kpi-design`（設計後にガントチャートでロードマップ化）
- M&A PMI計画 → `/ma`（100日プラン後にガントチャートで工程管理）
