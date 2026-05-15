# Kaiスタイルガイド（上村フィードバック蓄積）

---

## 🟢 全成果物に適用する共通ライティングルール

> 詳細は `rules/seminar-talkscript-guide.md` §1・§7 を参照。  
> ここでは「他のスキルで参照するための概要」のみ記載する。

### 文体・トーン（すべての成果物に適用）

| 項目 | 設定 |
|------|------|
| フォーマリティ | カジュアル丁寧（礼儀正しいが肩の力は抜けている） |
| エネルギー | 標準ベース、要所でグッと上げる |
| 一人称 | 私 / 聴衆・読者呼称: 皆さま |
| 文末 | です・ます |
| 文の長さ | 一文短め。冗長禁止 |
| 語彙 | 専門用語あり（初出で短い注釈） |

### 共通禁則（すべての成果物に適用）

- **陳腐なAI表現禁止**：「AIの時代が来ました」「革新的な」「パラダイムシフト」
- **テンプレ比喩禁止**：「羅針盤」「エンジン」「地図」など使い古された比喩
- **過剰な決めつけ禁止**：「必ず〜できます」「絶対に変わります」
- **冗長・単調禁止**：同じ文型の繰り返し、体言止めの多用
- **固有名詞の無断使用禁止**：根拠のない企業名・人名・数値

### スキル別の適用範囲

| スキル・成果物 | 適用するルール |
|--------------|--------------|
| セミナースライド・トークスクリプト | 全ルール（`seminar-talkscript-guide.md` 参照） |
| アプリ操作説明書・マニュアル | 文体・トーン + 禁則 + ステップ説明ルール（下記） |
| 提案書・ドキュメント | 文体・トーン + 禁則 |
| Brain記事 | `rules/brain-article-rules.md` 参照（独自ルール） |

### アプリ操作説明書・マニュアルの追加ルール

通常のトークスクリプトと異なる部分のみ記載する。

- **ステップ説明**: 「やること → 何ができるか」の2点セットで書く
  - 良い例：「ボタンを押す → 音声ファイルが分割されます」
  - 悪い例：「ボタンを押してください」（結果が見えない）
- **スクリーンショット代替表現**: 画像がない場合、「画面上部の〇〇ボタン」のように場所を言語化
- **CTAは不要**: 説明書にセールス要素を入れない
- **ROI・今動く理由は不要**: マニュアルは中立な情報提供

---

## ビジュアル・図表化のルール（2026-05-15 追加）

### 方針

HTML成果物（マニュアル・提案書・ガイドブック・セミナースライド）では、テキストだけでは伝わりにくい概念・構造・フローを **SVG / XML / Mermaid 形式の図** で補完する。「読んでわかる」より「見てわかる」を優先する。

### いつ図を入れるか（判断基準）

| 状況 | 対応する図の種類 |
|------|---------------|
| 抽象的な概念の説明（「AとBの違い」「〇〇とは」） | 比較図・概念図 |
| 手順に初心者が迷うポイントがある | 画面モック・注釈付き矢印図 |
| 複数要素の関係性・流れを説明する | フロー図・層構造図 |
| タイムライン・進捗・順序を示す | 横型タイムライン図 |
| 成果物やファイルの保存場所を示す | フォルダツリー図 |

### 使う形式と適用場面

| 形式 | 適用場面 |
|------|---------|
| **インラインSVG** | HTML成果物内の図版。ファイル依存なし・レスポンシブ対応。原則これを使う |
| **Mermaid** | フロー図・ガントチャート・シーケンス図（slides.js系スライド） |
| **ASCII図** | プレーンテキスト・Markdown成果物 |

### インラインSVGの実装ルール

```html
<figure class="svg-fig">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H" width="W">
    <!-- 図の内容 -->
  </svg>
  <figcaption>図の説明（何を表しているか）</figcaption>
</figure>
```

必須CSS（HTML成果物の `<style>` に追加）：
```css
.svg-fig { margin: 22px 0; text-align: center; }
.svg-fig svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
.svg-fig figcaption { font-size: 12px; color: #718096; margin-top: 8px; font-style: italic; }
```

- `viewBox` を必ず設定し、`width="W"` + CSS `max-width:100%` でレスポンシブ対応
- フォント：`font-family="Yu Gothic UI,Meiryo,sans-serif"`
- カラーパレット：成果物の既存テーマカラーに合わせる
- 吹き出し・線・注釈で「どこを見ればいいか」を必ず明示する
- 外部画像ファイル（.png/.jpg）は使用しない。すべてコードで生成する
- 外部サイトのスクリーンショットは著作権の問題があるため使わない → SVGで画面モックとして再現する

### 配置の優先ポイント

1. セクション冒頭の概念説明の直後（「言葉で理解 → 図で確認」の流れ）
2. 「これが怖い・難しそう」と感じるポイントのトグル内
3. ステップ説明の前（完成形・全体像を先に見せてから手順を示す）

### コードブロックのコピーボタン（標準装備）

HTML成果物にコマンド・プロンプト例・設定コード・テンプレートなど**コピー対象のコードブロック（`<pre>`）が1つでもある場合**、すべての `<pre>` にコピーボタンを自動付与する。

**いつ付ける：** マニュアル・ガイド・セミナー補足資料・提案書補足など、読者が実際にコードや文章をコピーして使う想定のすべての成果物。

**CSS（`</style>` 直前に追加）：**
```css
  /* ── コードブロック コピーボタン ── */
  pre { position: relative; }
  .copy-btn { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.12);
    color: #A0AEC0; border: 1px solid rgba(255,255,255,0.18); border-radius: 5px;
    padding: 3px 11px; font-size: 12px; cursor: pointer; font-family: inherit;
    transition: all 0.2s; }
  .copy-btn:hover { background: rgba(255,255,255,0.22); color: white; }
  .copy-btn.copied { background: #38A169; border-color: #38A169; color: white; }
  /* プロンプト用（薄い背景の pre に使う場合） */
  .pre-prompt .copy-btn { background: rgba(0,0,0,0.06); color: #4A5568; border-color: rgba(0,0,0,0.12); }
  .pre-prompt .copy-btn:hover { background: rgba(0,0,0,0.12); }
```

**JavaScript（`</script>` 直前に追加、または末尾に新規 `<script>` ブロック）：**
```javascript
document.querySelectorAll('pre').forEach(function(pre) {
  var btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'コピー';
  btn.addEventListener('click', function() {
    var codeEl = pre.querySelector('code');
    var text = codeEl ? codeEl.innerText : pre.innerText;
    text = text.replace(/^コピー\n?|コピー完了！?\n?/g, '').trim();
    function onSuccess() {
      btn.textContent = 'コピー完了！'; btn.classList.add('copied');
      setTimeout(function() { btn.textContent = 'コピー'; btn.classList.remove('copied'); }, 2200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(function() { fallback(text, onSuccess); });
    } else { fallback(text, onSuccess); }
  });
  pre.appendChild(btn);
});
function fallback(text, cb) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); cb(); } catch(e) {}
  document.body.removeChild(ta);
}
```

**ボタンラベル：** 日本語で「コピー」→「コピー完了！」。英語ラベル禁止（[[feedback-language-options]] 参照）。

---

### ページナビゲーションの標準装備

HTML成果物にはページトップへ戻るボタンを必ず設置する（詳細は下記の実装パターンを参照）。

```css
/* ページトップへ戻るボタン（全HTML成果物に標準装備） */
.to-top { position:fixed; bottom:28px; right:28px; width:48px; height:48px;
  background:#1A365D; color:white; border:none; border-radius:50%;
  font-size:20px; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,0.18);
  opacity:0; transform:translateY(12px);
  transition:opacity .25s, transform .25s, background .2s; z-index:1000;
  display:flex; align-items:center; justify-content:center; line-height:1; }
.to-top.visible { opacity:1; transform:translateY(0); }
.to-top:hover { background:#2B6CB0; }
```

```html
<button class="to-top" id="toTop" title="ページトップへ戻る" aria-label="ページトップへ戻る">↑</button>
```

```javascript
var toTop = document.getElementById('toTop');
window.addEventListener('scroll', function() {
  toTop.classList.toggle('visible', window.scrollY > 300);
});
toTop.addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
```

---

上村からの修正・指摘を蓄積したKaiの学習記録。
修正が発生するたびに追記して「同じ間違いをしない」辞書にする。

最終更新：2026-05-16（コピーボタン・SVG・ページトップボタンルール追加）

---

## 記録フォーマット

```
### YYYY-MM-DD [カテゴリ] タイトル
**状況：** どんな成果物で・どんな修正が入ったか
**修正前：** 〜
**修正後：** 〜
**ルール：** 今後どう動くか（1文で）
```

**カテゴリ：** [スタイル] [事実] [判断] [構成] [トーン] [その他]

---

## フィードバックループの運用（Kai向け）

修正が入った時の手順：

1. 修正を受け取り、その場で反映する
2. 修正の種類を分類する（スタイル / 事実 / 判断 / 構成 / トーン）
3. 「このパターン、ルール化しますか？」と上村に確認する
4. YESなら上記フォーマットでこのファイルに追記する
5. 自律レベル記録の修正件数にカウントする

**月1回：** このファイルを見直し、類似ルールを統合・整理する。

---

## 蓄積ルール（記録なし → どんどん溜める）

記録が20件を超えたらカテゴリでセクション分けする。

---

## 記録

### 2026-05-10 [スタイル] AskUserQuestion の選択肢ラベルは必ず日本語
**状況：** 上村への確認ダイアログ（AskUserQuestion）で英語ラベルを使用した
**修正前：** `label: "Copy button in HTML manual"` など英語
**修正後：** `label: "HTMLマニュアルのコピーボタン"` など日本語
**ルール：** AskUserQuestion を呼ぶ際、`label` / `description` / `question` はすべて日本語で書く。英語にする技術的理由はない。
