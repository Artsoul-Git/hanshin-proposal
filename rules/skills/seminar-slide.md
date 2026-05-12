# /seminar-slide スキル

**用途:** テーマを受け取り、ヒアリング → slides.js生成 → GitHubデプロイまで一気通貫で仕上げる

**トークスクリプト設計:** `rules/seminar-talkscript-guide.md` を必ず参照すること

---

## 発動条件

ユーザーが `/seminar-slide` を入力したとき、または「セミナースライドを作って」と依頼があったとき。

---

## フロー

### STEP 1: ヒアリング（1回で聞き切る）

以下の形式でまとめて質問する。

```
セミナースライドを作ります。以下を教えてください。

■ 基本設計
1. セミナータイトル（例：採用担当者向けAI活用セミナー）
2. ターゲット受講者（例：中小企業の経営者・採用担当 10〜20名）
3. 所要時間（例：60分）
4. セミナーの核心メッセージ（例：AIで採用コストを半分にできる）
5. パート構成（例：座学20分→実演20分→Q&A20分）または「おまかせ」
6. スライド枚数（例：30枚）または「おまかせ」

■ 内容設計（ここが肝心）
7. 参加者の内訳：現場担当者 vs 経営者・意思決定者の比率は？
   （例：現場8割・経営者2割 / 経営者のみ / 混在）
8. その場で参加者に作ってもらいたい成果物は？
   （例：販促チラシの文案、SNS投稿、メール文）
   なければ「おまかせ」
9. セミナー後に参加者に取ってほしいアクション1つは？
   （例：無料相談に申し込む、テンプレを試す）
10. 継続支援・フォローの仕組みはあるか？
    （例：LINEグループ、月次勉強会、テンプレ資産配布）
    なければ「なし」

■ 技術設定
11. GitHubスラッグ（例：sales-ai-seminar）または「おまかせ」
12. 参考資料（PDF・画像・URLなど）があれば添付または共有
```

ユーザーの回答を受けたら STEP 2 へ。

---

### STEP 2: ブリーフィング確認

回答内容を以下の形式でまとめ、承認を取る。

```
[ブリーフィング]
タイトル      : 〇〇
スラッグ      : 〇〇
対象          : 〇〇（現場：〇割 / 経営者：〇割）
時間          : 〇〇分 / スライド数：〇〇枚
核心メッセージ: 〇〇
構成          : ①〇〇 ②〇〇 ③〇〇 ④まとめ
体験ワーク    : 〇〇（3種類設計）
CTA           : 〇〇
継続支援      : 〇〇

トークタイプ  : ストーリーテリング型 / 課題解決型 / 理論解説型（※Kaiが推定）
理由          : 〇〇

これで進めます。よいですか？
```

**トークタイプの選択基準：**
- **ストーリーテリング型**: 感情移入させたい、エンタメ要素が強い
- **課題解決型**: 現場の痛みを解決する、実務直結の内容
- **理論解説型**: 概念・背景理解が必要、知識習得が主目的

---

### STEP 3: slides.js 生成

承認後、以下のルールで slides.js を生成する。

---

#### 3-1. slides.js の必須ルール（技術）

1. **ファイル全体を IIFE（即時実行関数）で包む**
   ```javascript
   (function () { ... window.SLIDES = [slide01, slide02, ...]; })();
   ```

2. **H() ヘルパーは冒頭で定義**
   ```javascript
   function H(title) {
     return '<header class="slide-header"><h2 class="slide-h2">' + title + '</h2></header>';
   }
   ```

3. **各スライドは `slideNN()` 関数（ゼロ埋め2桁）**

4. **各スライドに必須の data 属性**
   - `data-section`: セクションID（サイドバーのグループ化）
   - `data-title`: スライドタイトル（サイドバー表示）
   - `data-notes`: トークスクリプト（プレゼンター画面）

5. **スライドタイプの使い分け**（`template-spec.md` 参照）
   - 表紙: `slide-cover`
   - 核心メッセージ: `slide-impact`
   - セクション扉: `slide-section`
   - 数字強調: `slide-metric`
   - 格言・名言: `slide-quote`
   - 通常: `H()` + `.slide-content`

6. **コンテンツコンポーネントの使い方**（`template-spec.md` 参照）
   - 箇条書き: `.s-list` + `.s-list-callout` / `.s-list-arrow`
   - 手順: `.s-steps` + `.s-step-row`
   - リスク表: `.s-risk-list` + `.s-risk-badge high/medium/low`
   - 比較: `.s-compare` + `.s-compare-col positive/neutral/negative`

7. **時間表記は含めない**
   - 「（20分）」「60分」などの所要時間は本文・タイトルに入れない

---

#### 3-2. 構成テンプレート（標準60分・30〜35枚）

この構成は最低限の骨格。パート数・枚数はブリーフィングに応じて調整する。

```
【つかみ・導入】
slide01: cover       タイトル・登壇者
slide02: impact      核心メッセージ（1文で刺す）
slide03: Before      今の状況・共感・課題（"あるある"で引き込む）
slide04: After       理想像・ゴール（数字で対比）
slide05: 流れ        本日のアジェンダ

【本編 PART 01〜N】
slideXX: section     PART タイトル
slideXX〜: content   PART 本編（6〜8枚）
slideXX: ワーク①    体験ワーク（その場で成果物が完成する設計）

slideXX: section     PART 02 タイトル
slideXX〜: content   PART 02 本編
slideXX: ワーク②    体験ワーク

slideXX: section     PART 03 タイトル
slideXX〜: content   PART 03 本編
slideXX: ワーク③    体験ワーク

【クロージング】
slideXX: metric      ROI試算（時間削減 × 人数 → 金額換算）
slideXX: 継続支援   フォロー・コミュニティ・次回案内
slideXX: 今動く理由 期限・特典・ハードルを下げる一言
slideXX: CTA         今すぐできること1つ（行動を絞る）
slideXX: まとめ      核心メッセージの再提示
```

**ワークスライドの必須要件：**
- その場で成果物が「完成する」体験を設計する
- 手順は「やること → なぜやるか → 何ができるか」の順
- テンプレート（コピペ可）を必ず提供する

**ROIスライドの必須要件：**
- 「1人あたりの時間削減 → チーム規模 → 年間金額換算」の積み上げ形式
- 数字はブリーフィングの条件（人数・短縮時間）を使う
- なければ例示値（月5時間削減 × 10名 = 年600時間）で設計

---

#### 3-3. data-notes（トークスクリプト）の書き方ルール

**`rules/seminar-talkscript-guide.md` のルールをすべて適用する。**

以下は slides.js 実装上の必須事項：

**フォーマット**
- 話し言葉で書く（箇条書き禁止）
- 一文を短く。段落間に `（少し間）` を入れる
- 読み上げ時間は `rules/seminar-talkscript-guide.md` の「役割別目安秒数」に従う

**内容設計（スライドごと）**
- 構造: `フック → 本題 → 接続` の3要素で組む
- 冒頭スライド: 「身近な観察 → 一歩深い気づき → 安心の一言」
- Before スライド: 現場担当者向け"あるある" + 経営者向けコスト提示
- ワーク説明: 「やること → なぜ → 何ができるか」
- CTA: 行動は1つに絞る

**レトリック（必須）**
- 重要キーワードは最大3回繰り返す（言い換え含む）
- Before→After の数字対比を使う
- 問いかけ（答えを求めないもの）を差し込む

**エスケープ**
- `'`（シングルクォート）は `&#39;` にエスケープする
- `"` はHTMLアトリビュート内では `&quot;` にエスケープする

**禁則（`rules/seminar-talkscript-guide.md` セクション7参照）**
- 陳腐なAI表現・テンプレ比喩・過剰な決めつけ禁止
- 複数のCTAを入れない

---

### STEP 3.5: ペルソナレビュー（任意・推奨）

slides.js 生成後、プロジェクト作成の前に実行できる品質確認ステップ。

上村から「ペルソナ視点で確認して」または「Q&A準備したい」と言われた場合、
もしくは Kai が構成の説得力に不安を感じた場合に実行する。

```
→ /persona-review を実行
  （rules/skills/persona-review.md 参照）
```

レポートを見て修正が必要であれば slides.js を修正してから STEP 4 へ進む。

---

### STEP 4: プロジェクト生成

slides.js を生成したら、以下を実行する。

```bash
# 1. テンプレートから新規プロジェクトを作成
python 08_アプリ開発事業部/outputs/slide-builder/new-seminar.py \
  --slug "{スラッグ}" \
  --title "{タイトル}"

# 2. slides.js を書き込む
# Write ツールで 08_アプリ開発事業部/outputs/slide-builder/projects/{スラッグ}/js/slides.js に書き込む
```

---

### STEP 5: GitHub デプロイ

```powershell
$slug = "{スラッグ}"
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

---

### STEP 5.5: 成果物をセミナー事業部に移動

GitHub デプロイ完了後、ステージングからセミナー事業部の outputs へ移動する。

```powershell
$slug = "{スラッグ}"
$staging = "D:\Google Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\outputs\slide-builder\projects\$slug"
$seminar  = "D:\Google Antigravity\AS_AI導入支援事業_cc\06_セミナー事業部\outputs\$slug"

Move-Item $staging $seminar
```

移動後の確認先: `06_セミナー事業部/outputs/{スラッグ}/`

---

### STEP 6: 完了報告

```
[完了]
タイトル    : 〇〇
スライド数  : 〇〇枚
ワーク数    : 〇〇種類
CTA         : 〇〇

受講者URL   : https://artsoul-git.github.io/{スラッグ}/viewer.html
管理画面    : https://artsoul-git.github.io/{スラッグ}/admin.html
プレゼンター: https://artsoul-git.github.io/{スラッグ}/presenter.html

⚠ 初回のみ: admin.html を開いてパスワードを設定してください。
  初期パスワードは 06_セミナー事業部/outputs/{スラッグ}/manual.html（ローカル保管）を確認。
```

---

## テンプレート参照先

- **テンプレートファイル:** `08_アプリ開発事業部/outputs/slide-builder/templates/kawai-dark-v1/`
- **デザイン仕様:** `08_アプリ開発事業部/outputs/slide-builder/templates/kawai-dark-v1/template-spec.md`
- **slides.js 骨格:** `08_アプリ開発事業部/outputs/slide-builder/templates/kawai-dark-v1/js/slides-template.js`
- **トークスクリプト設計:** `rules/seminar-talkscript-guide.md`
- **ペルソナ評価・Q&A想定:** `rules/skills/persona-review.md`

---

## 品質チェックリスト（生成後に確認）

### 技術チェック
- [ ] 全スライドに `data-section`, `data-title`, `data-notes` が設定されている
- [ ] `data-notes` 内の `'` が `&#39;` にエスケープされている
- [ ] IIFE で包まれている
- [ ] `window.SLIDES = [...]` が最後に定義されている
- [ ] 時間表記（60分・20分など）が本文に含まれていない
- [ ] スライド数が依頼に近い枚数になっている

### 構成チェック
- [ ] Before スライドがある（共感・課題提示）
- [ ] After スライドがある（理想像・ゴール）
- [ ] 体験ワークが最低3種類ある（成果物が完成する設計）
- [ ] ROI試算スライドがある（数字で積み上げ）
- [ ] 今動く理由スライドがある（期限・特典）
- [ ] CTA が最後の1つに絞られている

### トークスクリプトチェック
- [ ] 冒頭30秒が「観察→気づき→安心」の3ステップになっている
- [ ] 各スライドに「フック→本題→接続」の3要素がある
- [ ] 重要キーワードが最大3回繰り返されている
- [ ] Before→After の数字対比が使われている
- [ ] 陳腐なAI表現・テンプレ比喩が入っていない
- [ ] 禁則事項（`seminar-talkscript-guide.md` §7）を違反していない
