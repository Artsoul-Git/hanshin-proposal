# kawai-dark-v1 テンプレート仕様

**バージョン:** v1.0  
**作成:** 2026-05-12  
**ベース案件:** 契約書AIチェックセミナー

---

## カラースキーム

| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--c-primary` | `#6F911D` | アクセント（グリーン） |
| `--c-primary-dark` | `#5E791A` | ホバー・押下時 |
| `--c-primary-mid` | `#A6BE54` | ライン・装飾 |
| `--c-primary-light` | `#C7D99B` | 薄いグリーン |
| `--c-primary-pale` | `#E8F1D8` | 背景ハイライト |
| `--c-accent` | `#FABE00` | 強調（イエロー） |
| `--c-accent-blue` | `#38B6FF` | 情報（ブルー） |
| `--c-dark` | `#333333` | 本文テキスト |
| `--c-base` | `#ffffff` | スライド背景 |
| `--c-risk-h` | `#c0392b` | リスク高 |
| `--c-risk-m` | `#e67e22` | リスク中 |
| `--c-risk-l` | `#27ae60` | リスク低 |

**ボディ背景（スライド外）:** `#111`  
**フォント:** Noto Sans JP / Hiragino Sans / Meiryo

---

## スライドタイプ

### `slide-cover` — タイトルスライド
```html
<section class="slide slide-cover" data-section="cover" data-title="タイトル" data-notes="スクリプト">
  <div class="slide-cover-bar">
    <div class="slide-cover-tag">有限会社アートソウル AI導入支援事業</div>
    <h1 class="slide-cover-title">セミナータイトル</h1>
  </div>
  <div class="slide-cover-body">
    <p class="slide-cover-sub">サブタイトル</p>
    <div class="slide-cover-meta">YYYY.MM ｜ 開催情報</div>
  </div>
</section>
```

### `slide-impact` — インパクト一言
```html
<section class="slide slide-impact" data-section="cover" data-title="タイトル" data-notes="スクリプト">
  <div class="slide-content slide-content-center">
    <div class="s-impact-tag">TODAY</div>
    <p class="s-impact-main">インパクトになる一文。<br>改行で強調。</p>
  </div>
</section>
```

### `slide-section` — セクション区切り
```html
<section class="slide slide-section" data-section="part1" data-title="パート名" data-notes="">
  <div class="slide-content">
    <div class="s-section-accent-bar"></div>
    <div class="s-section-chapter">PART 01</div>
    <h1 class="s-section-title">パートタイトル</h1>
    <p class="s-section-lead">サブタイトル</p>
  </div>
</section>
```

### `slide-metric` — 数字強調
```html
<section class="slide slide-metric" data-section="part1" data-title="タイトル" data-notes="スクリプト">
  <div class="slide-content slide-content-center">
    <p class="s-metric-lead">リード文</p>
    <div class="s-metric-value">数値</div>
    <p class="s-metric-desc">説明</p>
    <p class="s-metric-source">出典</p>
  </div>
</section>
```

### `slide-quote` — 引用・格言
```html
<section class="slide slide-quote" data-section="part1" data-title="タイトル" data-notes="">
  <div class="slide-content slide-content-center">
    <blockquote class="s-quote">引用文。<br>改行で強調。</blockquote>
  </div>
</section>
```

### 標準スライド — H() ヘッダー + コンテンツ
```html
<section class="slide" data-section="part1" data-title="タイトル" data-notes="スクリプト">
  H('スライドタイトル')
  <div class="slide-content">
    <!-- コンテンツコンポーネント -->
  </div>
</section>
```

---

## コンテンツコンポーネント

### 箇条書き `.s-list`
```html
<ul class="s-list">
  <li class="s-list-callout">重要事項（グリーン枠）</li>
  <li class="s-list-arrow">通常項目（→ アイコン）</li>
  <li class="s-list-head">見出し項目（太字）</li>
  <li class="s-list-sub">→ 補足説明</li>
</ul>
```

### ステップ `.s-steps`
```html
<div class="s-steps">
  <div class="s-step-row">
    <div class="s-step-num">①</div>
    <div><div class="s-step-text"><strong>ステップ名</strong>：説明</div></div>
  </div>
</div>
```

### リスク表 `.s-risk-list`
```html
<div class="s-risk-list">
  <div class="s-risk-item">
    <div class="s-risk-header">
      <span class="s-risk-badge high">高リスク</span>
      <span class="s-risk-title">タイトル</span>
    </div>
    <div class="s-risk-body">
      説明文
      <div class="s-risk-proposal">対策・確認ポイント</div>
    </div>
  </div>
</div>
```
バッジ: `high` / `medium` / `low`

### 比較 `.s-compare`
```html
<div class="s-compare">
  <div class="s-compare-col neutral">
    <div class="s-compare-badge">ラベル</div>
    <div class="s-compare-title">タイトル</div>
    <ul class="s-compare-items">
      <li>項目</li>
    </ul>
  </div>
  <div class="s-compare-col positive">
    <!-- 同上 -->
  </div>
</div>
```
カラム色: `positive`（グリーン）/ `neutral`（グレー）/ `negative`（レッド）

---

## ファイル構成

```
kawai-dark-v1/
├── css/
│   ├── style.css        ← スライドデザイン（変数あり）
│   └── presenter.css    ← プレゼンター画面
├── js/
│   ├── app.js           ← ビューア・操作ロジック
│   ├── presenter.js     ← プレゼンター機能
│   └── slides-template.js ← slides.js の骨格
├── viewer.html          ← 受講者用（公開URL）
├── presenter.html       ← プレゼンター用（パスワード保護）
├── admin.html           ← 管理画面（URL・パスワード設定）
├── index.html           ← フル操作画面
└── template-spec.md     ← この仕様書
```

---

## バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| v1.0 | 2026-05-12 | 契約書AIチェックセミナーから切り出し初版 |

---

## ブラッシュアップ時の注意

- `style.css` の CSS変数（`:root`）を変更するだけでカラースキームを変更可能
- スライドタイプ追加は `style.css` にクラス追加 → `slides-template.js` のコメントに追記
- `app.js` / `presenter.js` はスライドコンテンツに依存しないため基本的に変更不要
- バージョンアップ時は `template-spec.md` のバージョン履歴を更新すること
