# デザインスタイル定義：blue_simple

**元ファイル：** ●白 青 シンプル 事業計画 ビジネス 製品 会社 プレゼンテーション.pptx  
**作成日：** 2026-05-10  
**用途：** 事業計画書・ビジネス提案書・企業プレゼンのスライド生成リファレンス

---

## 1. キャンバスサイズ

| 項目 | 値 |
|------|----|
| 横幅 | 50.8 cm（20インチ） |
| 縦幅 | 28.58 cm（11.25インチ） |
| アスペクト比 | 16:9（ワイドスクリーン） |
| EMU | cx=18,288,000 / cy=10,287,000 |

---

## 2. カラーパレット

### メインカラー（ブルー系）

| ロール | 色名 | HEX | 用途 |
|--------|------|-----|------|
| プライマリ | ネイビーブルー | `#1F5197` | ヘッダーバー・テキスト・バッジ・ラインアクセント |
| セカンダリ | ミッドブルー | `#3262AA` | 中間調のアクセント（ボタン・強調要素） |
| ライトブルー | ソフトブルー | `#8DA8D0` | 区切り線・非アクティブステップ・サブ要素 |

### ベースカラー

| ロール | 色名 | HEX | 用途 |
|--------|------|-----|------|
| 背景メイン | ホワイト | `#FFFFFF` | コンテンツエリア背景 |
| テキスト | チャコール | `#333333` | 本文テキスト |
| テキスト反転 | ホワイト | `#FFFFFF` | ヘッダーバー上のテキスト |

### カラー使用ルール

- **ネイビー（#1F5197）がすべての構造要素の軸**（ヘッダー・バッジ・ライン・強調テキスト）
- **コンテンツエリアは白背景一択**。シェイプ・テキストでネイビーを添える
- **ソフトブルー（#8DA8D0）は「非アクティブ」「補助」の表現のみ**
- グラデーションは使用しない（フラットカラーのみ）

---

## 3. フォント

### 使用フォント一覧

| 優先度 | フォント名 | 用途 |
|--------|-----------|------|
| 第1（日本語） | **Noto Sans JP Bold** | 日本語全般（見出し・本文） |
| 第1（英数字） | **Roboto Bold** | 英数字・番号・ラテン文字 |
| 特殊 | **Canva Sans Bold** | タイムライン・特殊レイアウト（散発的） |

### フォント運用

- **日本語：Noto Sans JP Bold**、**英数字：Roboto Bold** で統一
- 全フォントBold固定（Regular・Lightは使用しない）
- 斜体（Italic）は使用しない
- フォールバック：Noto Sans JP → Meiryo → ヒラギノ角ゴ

---

## 4. フォントサイズ体系

| 名称 | サイズ | 用途 |
|------|--------|------|
| 超特大（タイトルスライド） | 104 pt | タイトルスライドのメインタイトル |
| 特大（まとめ） | 88 pt | 最終スライド・インパクト文 |
| 大見出し | 67–68 pt | コンテンツスライドの主要メッセージ |
| 中大見出し | 60 pt | セクション内主役テキスト |
| 中見出し | 54 pt | リスト見出し・ステップ見出し |
| 小見出し | 46–48 pt | サブ見出し・タイムラインラベル |
| 本文大 | 40–44 pt | カードテキスト・ポイント本文 |
| 本文標準 | 36–37 pt | 一般的な本文 |
| 本文小 | 31–32 pt | 補足・サブテキスト・目次項目 |
| 小文字 | 24–30 pt | キャプション・日付・注記 |

---

## 5. 共通レイアウト構造（全スライド共通）

```
[キャンバス 50.8 × 28.58 cm]
┌─────────────────────────────────────────┐
│ [#] │ スライドタイトル ─────  会社名  │ ← ヘッダーバー（高さ2.9cm, 背景なし/線のみ）
│─────────────────────────────────────────│
│                                          │
│         コンテンツエリア（白背景）        │
│                                          │
│─────────────────────────────────────────│
│                                          │ ← ボトムライン（細線, 高さ0.4cm）
└─────────────────────────────────────────┘
```

### ヘッダーバー詳細

| 要素 | サイズ/位置 | スタイル |
|------|------------|---------|
| バー高さ | y=0, h=2.9cm | 背景色なし（透明 or 画像塗り） |
| ページ番号バッジ | 左上 2.3×2.3cm | #1F5197 塗り + 白数字（32pt Roboto Bold） |
| スライドタイトル | x=3.5cm, y=0.8cm | 白テキスト 32pt |
| セクション│小見出し | 同行、スラッシュ区切り | 例：「目的と背景 - 背景 \| 目的」 |
| 会社名 | 右端 x=35.8cm | 白テキスト 32pt, 右寄せ |

### ボトムライン

- y=28.2cm, h=0.4cm, 幅=全幅 50.8cm
- 塗り：画像または薄青（装飾的区切り線）

---

## 6. スライドタイプとレイアウトパターン

### タイプ A：タイトルスライド

```
┌─────────────────────────────────────────┐
│                                          │
│  [装飾的ジオメトリック図形×2]             │ ← 画像塗りのFreeform（回転あり）
│                                          │
│         メインタイトル（104pt, 白）       │ ← 中央〜右寄り
│         会社名（36pt, 白）               │ ← タイトル上部
│         サブタイトル（48pt）             │ ← タイトル直上
│                                          │
│         [画像背景 image1.png]             │
└─────────────────────────────────────────┘
```

- 背景：高解像度のアブストラクト青系画像（ジオメトリックパターン）
- 2つの大型Freeformシェイプ（回転 -6.1°）が対角に配置
- テキストはすべて白、ネイビー帯なし

---

### タイプ B：目次スライド

```
┌─────────────────────────────────────────┐
│ [ ] │ 目次 ──────────────── 会社名  │ ← ヘッダーバー
│─────────────────────────────────────────│
│                                          │
│   目次タイトル（56pt）                   │ ← 中央
│                                          │
│   O1 目的と背景   │  O6 事業戦略        │
│   O2 マーケット分析│  O7 収益モデル      │ ← 2カラム、各行32pt
│   O3 ターゲット顧客│  O8 リスクと対策    │
│   O4 製品/サービス │  O9 実行計画        │
│   O5 サービスフロー│  10 まとめ          │
│                                          │
└─────────────────────────────────────────┘
```

- 番号（O1〜O9, 10）：ネイビー（#1F5197）、幅2.6cm
- 項目テキスト：32pt、ネイビー（#1F5197）
- 2カラム均等配置（左x=8.4cm / 右x=28.4cm）
- 行間：約2.9cm間隔

---

### タイプ C：コンテンツ（本文）スライド

```
┌─────────────────────────────────────────┐
│ [n] │ セクション名 - 詳細タイトル  会社名│ ← ヘッダーバー
│─────────────────────────────────────────│
│                                          │
│   メインメッセージ（60–68pt, ネイビー）  │
│                                          │
│   ┌──────────┐  ┌──────────┐            │
│   │ カード①  │  │ カード②  │  ←写真等  │
│   │ テキスト  │  │ テキスト  │            │
│   └──────────┘  └──────────┘            │
│         本文（32–36pt, #333333）         │
│─────────────────────────────────────────│
└─────────────────────────────────────────┘
```

- ヘッダー内タイトル形式：「セクション名　- 詳細 | サブ詳細」（スペース+ハイフン+スペース）
- メインメッセージ：ネイビー（#1F5197）、60-68pt
- 本文：チャコール（#333333）、32-36pt
- 写真・図版を右半分に配置するパターン多用

---

### タイプ D：サービスフロースライド

```
┌─────────────────────────────────────────┐
│ [n] │ ヘッダー ──────────────  会社名  │
│─────────────────────────────────────────│
│                                          │
│   メインタイトル（67pt）                 │
│                                          │
│   ◆─────→◆─────→◆─────→◆─────→◆      │
│  訪問  登録  無料開始 決済  有料開始     │ ← ステップフロー
│  32pt テキスト                           │
│                                          │
│   [無料]           [有料]               │ ← ラベル（24pt）
└─────────────────────────────────────────┘
```

- ステップ：ネイビー（#1F5197）ダイヤモンド形Freeform + 白番号
- 非アクティブ区間：ライトブルー（#8DA8D0）
- 矢印ライン：水平（SVGアイコン使用）
- ラベル：白テキスト、テキストボックス内

---

### タイプ E：リスト/3カラムスライド

```
┌─────────────────────────────────────────┐
│ [n] │ ヘッダー ──────────────  会社名  │
│─────────────────────────────────────────│
│                                          │
│   [カード1]     [カード2]     [カード3]  │
│   競争激化      技術的課題    資金不足   │ ← 48pt ネイビー
│   ────────────────────────             │ ← #8DA8D0 区切り線
│   対策テキスト  対策テキスト  対策テキスト│ ← 32pt
│                                          │
│   追記テキスト（60pt, ネイビー）         │
└─────────────────────────────────────────┘
```

- 区切り線：#8DA8D0、幅=28575 EMU（≈2.25pt）
- カード見出し：48pt、#1F5197
- 本文：32pt、#333333

---

### タイプ F：タイムラインスライド

```
┌─────────────────────────────────────────┐
│ [n] │ 実行計画 ──────────────  会社名  │
│─────────────────────────────────────────│
│                                          │
│   メインメッセージ（60pt）               │
│                                          │
│   2025/4-5  2025/6-9  2025/10  2025/11 │ ← 日付（32pt）
│   ────────────────────────────          │
│   市場調査  製品開発  テスト   本格展開  │ ← タスク（46pt）
│                                          │
└─────────────────────────────────────────┘
```

- 月付きステップは横並びタイムライン
- フォント：Canva Sans Bold（特殊使用）

---

## 7. 共通デザイン要素

### ライン・区切り

| 要素 | カラー | 幅（pt換算） | 用途 |
|------|--------|------------|------|
| アクセントライン | `#1F5197` | 2.25pt | ターゲット分析の区切り |
| 補助ライン | `#8DA8D0` | 2.25pt | リスト・テーブルの区切り |
| ボトムバー | 画像塗り | 0.4cm高 | 全スライド下端 |

### シェイプ

- `prstGeom prst="rect"`（矩形）が基本 — 角丸は使用しない
- `custGeom`（カスタムFreeform）を装飾・ステップバッジに多用
- 画像塗り（blipFill）のFreeformで背景装飾

### 写真・画像の使用

- 人物・ビジネスシーンのストック写真を右ペインや背景に配置（JPEG形式）
- SVGアイコン（矢印・フロー記号）をフロー図で使用
- タイトルスライド背景：専用のアブストラクト画像（PNG）

---

## 8. HTML/CSS実装リファレンス

### CSS変数定義（blue_simple 用）

```css
:root {
  /* カラーパレット */
  --color-primary:      #1F5197;
  --color-primary-mid:  #3262AA;
  --color-primary-light:#8DA8D0;

  --color-bg:           #FFFFFF;
  --color-text:         #333333;
  --color-text-inv:     #FFFFFF;

  /* フォント */
  --font-ja:    'Noto Sans JP', Meiryo, sans-serif;
  --font-en:    'Roboto', Arial, sans-serif;
  --font-special: 'Canva Sans', 'Noto Sans JP', sans-serif;
  --font-weight: 700;

  /* フォントサイズ */
  --fs-title-xl:  6.5rem;    /* 104pt */
  --fs-title-lg:  5.5rem;    /* 88pt */
  --fs-h1:        4.25rem;   /* 68pt */
  --fs-h2:        3.75rem;   /* 60pt */
  --fs-h3:        3.375rem;  /* 54pt */
  --fs-h4:        2.875rem;  /* 46pt */
  --fs-body-lg:   2.375rem;  /* 38pt */
  --fs-body:      2.25rem;   /* 36pt */
  --fs-body-sm:   2rem;      /* 32pt */
  --fs-caption:   1.5rem;    /* 24pt */

  /* レイアウト */
  --header-height: 10.15%;   /* 2.9cm / 28.58cm */
  --badge-size:    8.05%;    /* 2.3cm / 28.58cm */
  --bottom-bar-h:  1.4%;     /* 0.4cm / 28.58cm */
  --slide-ratio:   16 / 9;
}
```

### ヘッダーバー骨格

```css
.slide-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  display: flex;
  align-items: center;
  background: transparent;
  border-bottom: 1px solid rgba(255,255,255,0.3);
}

.slide-page-badge {
  width: var(--badge-size);
  height: var(--header-height);
  background: var(--color-primary);
  color: var(--color-text-inv);
  font-family: var(--font-en);
  font-size: var(--fs-body-sm);
  font-weight: var(--font-weight);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.slide-header-title {
  flex: 1;
  padding: 0 1.5%;
  color: var(--color-text-inv);
  font-size: var(--fs-body-sm);
  font-weight: var(--font-weight);
}

.slide-header-company {
  padding: 0 2%;
  color: var(--color-text-inv);
  font-size: var(--fs-body-sm);
  font-weight: var(--font-weight);
  text-align: right;
  white-space: nowrap;
}

.slide-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--bottom-bar-h);
  background: var(--color-primary-light);
}
```

### スライドタイプ別CSS骨格

```css
/* タイプA: タイトルスライド */
.slide-title {
  background: var(--color-primary);
  background-image: url('title-bg.png');
  background-size: cover;
  position: relative;
  overflow: hidden;
}
.slide-title .main-title {
  color: var(--color-text-inv);
  font-size: var(--fs-title-xl);
  font-weight: var(--font-weight);
}
/* 装飾Freeform: 斜め矩形2枚を疑似要素で再現 */
.slide-title::before,
.slide-title::after {
  content: '';
  position: absolute;
  width: 50%;
  height: 60%;
  background-image: url('title-bg.png');
  background-size: cover;
  transform: rotate(-6.1deg);
}

/* タイプB: 目次 */
.slide-toc .toc-item {
  display: flex;
  gap: 1.5%;
  align-items: baseline;
  margin-bottom: 1%;
}
.slide-toc .toc-number {
  color: var(--color-primary);
  font-family: var(--font-en);
  font-size: var(--fs-body-sm);
  min-width: 3em;
}
.slide-toc .toc-text {
  color: var(--color-primary);
  font-size: var(--fs-body-sm);
}

/* タイプC: コンテンツ */
.slide-content {
  background: var(--color-bg);
}
.slide-content .main-message {
  color: var(--color-primary);
  font-size: var(--fs-h2);
}
.slide-content .body-text {
  color: var(--color-text);
  font-size: var(--fs-body);
}

/* タイプD: フロー */
.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5%;
}
.flow-badge {
  width: 8%;
  aspect-ratio: 1;
  background: var(--color-primary);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--fs-body-sm);
}
.flow-badge.inactive {
  background: var(--color-primary-light);
}
.flow-label {
  font-size: var(--fs-caption);
  color: var(--color-text-inv);
}

/* タイプE: 3カラム */
.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3%;
}
.col-heading {
  color: var(--color-primary);
  font-size: var(--fs-h4);
  border-bottom: 2.25pt solid var(--color-primary-light);
  padding-bottom: 3%;
}

/* タイプF: タイムライン */
.timeline {
  display: flex;
  align-items: flex-start;
  gap: 2%;
}
.timeline-step { flex: 1; }
.timeline-date {
  color: var(--color-text);
  font-family: var(--font-special);
  font-size: var(--fs-body-sm);
}
.timeline-label {
  color: var(--color-primary);
  font-family: var(--font-special);
  font-size: var(--fs-h4);
}
```

---

## 9. スライド生成時の指示テンプレート

```
このスライドは blue_simple スタイルで作成してください。

【基本仕様】
- キャンバス: 16:9 ワイドスクリーン (50.8 × 28.58cm)
- 背景: 白（#FFFFFF）
- フォント: Noto Sans JP Bold（日本語）、Roboto Bold（英数字）
- 全テキストBold、Italicなし

【カラー】
- メインカラー: ネイビーブルー #1F5197
- 補助カラー: ソフトブルー #8DA8D0
- 本文: チャコール #333333
- 背景: ホワイト #FFFFFF

【共通構造】
- ヘッダーバー（高さ2.9cm）: 左にページ番号バッジ(#1F5197) + スライドタイトル + 右に会社名（白テキスト）
- ボトムライン（高さ0.4cm）: ライトブルー (#8DA8D0) 細線

【スライドタイプ指定】
タイプA（タイトル）/ タイプB（目次）/ タイプC（コンテンツ）/ タイプD（フロー）/ タイプE（3カラム）/ タイプF（タイムライン）

【フォントサイズ】
スライドタイトル: 32pt（ヘッダー内）/ メインメッセージ: 60-68pt / 本文: 32-36pt
```

---

## 10. デザイン哲学（blue_simpleの特徴）

1. **ネイビーで統一感** — `#1F5197` が構造要素（ヘッダー・バッジ・ライン）すべてを貫く軸
2. **白背景で清潔感** — コンテンツエリアは白一択。情報の視認性を最大化
3. **写真でリアリティ** — ビジネスシーンのストック写真を右ペインに配置し、説得力を補強
4. **タイトルは画像背景で差別化** — 表紙だけ専用の背景画像を使いインパクトを出す
5. **シンプルな構造のくり返し** — ヘッダーバー＋コンテンツ＋ボトムラインを全スライドで統一
6. **情報階層は色で表現** — ネイビー→強調、ソフトブルー→補助、チャコール→本文の3段階
7. **角丸なし** — `rect`（矩形）のみ使用。シャープ・プロフェッショナルな印象
