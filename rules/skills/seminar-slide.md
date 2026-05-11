# /seminar-slide スキル

**用途:** テーマを受け取り、ヒアリング → slides.js生成 → GitHubデプロイまで一気通貫で仕上げる

---

## 発動条件

ユーザーが `/seminar-slide` を入力したとき、または「セミナースライドを作って」と依頼があったとき。

---

## フロー

### STEP 1: ヒアリング（最大8問、1回で聞き切る）

以下の形式でまとめて質問する。

```
セミナースライドを作ります。以下を教えてください。

1. セミナータイトル（例：採用担当者向けAI活用セミナー）
2. ターゲット受講者（例：中小企業の経営者・採用担当 10〜20名）
3. 所要時間（例：60分）
4. セミナーの核心メッセージ（例：AIで採用コストを半分にできる）
5. パート構成（例：座学20分→実演20分→Q&A20分）または「おまかせ」
6. スライド枚数の目安（例：25〜35枚）または「おまかせ」
7. 強調したいポイント・盛り込みたいコンテンツ（箇条書きで）
8. GitHubスラッグ（例：sales-ai-seminar）または「おまかせ」（自動生成）
```

ユーザーの回答を受けたら STEP 2 へ。

---

### STEP 2: ブリーフィング確認

回答内容を以下の形式でまとめ、承認を取る。

```
[ブリーフィング]
タイトル    : 〇〇
スラッグ    : 〇〇
対象        : 〇〇
時間        : 〇〇分
スライド数  : 〇〇枚
構成        : ①〇〇 ②〇〇 ③〇〇 ④Q&A
キーポイント: 〇〇

これで進めます。よいですか？
```

---

### STEP 3: slides.js 生成

承認後、以下のルールで slides.js を生成する。

#### slides.js の必須ルール

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
   - 冒頭: `slide-cover` → `slide-impact` → ゴール → 流れ
   - 各パート冒頭: `slide-section`
   - 数字強調: `slide-metric`
   - 格言・名言: `slide-quote`
   - 通常: `H()` + `.slide-content`

6. **コンテンツコンポーネントの使い方**（`template-spec.md` 参照）
   - 箇条書き: `.s-list` + `.s-list-callout` / `.s-list-arrow`
   - 手順: `.s-steps` + `.s-step-row`
   - リスク表: `.s-risk-list` + `.s-risk-badge high/medium/low`
   - 比較: `.s-compare` + `.s-compare-col positive/neutral/negative`

7. **data-notes（トークスクリプト）のルール**
   - 話し言葉で書く（箇条書き禁止）
   - 読み上げ時間が30秒〜2分になる量
   - `'`（シングルクォート）は `&#39;` にエスケープする

8. **時間表記は含めない**
   - 「（20分）」「60分」などの所要時間は本文・タイトルに入れない

#### 構成テンプレート（標準60分・30枚）

```
slide01: cover（タイトル）
slide02: impact（インパクトメッセージ）
slide03: ゴール説明
slide04: 本日の流れ
slide05: PART 01 section
slide06〜: PART 01 コンテンツ（6〜8枚）
slideXX: PART 02 section
slideXX〜: PART 02 コンテンツ（6〜8枚）
slideXX: PART 03 section（実演等）
slideXX〜: PART 03 コンテンツ（4〜6枚）
slideXX: Q&A / まとめ section
slideXX〜: まとめ・次のアクション・CTA
```

---

### STEP 4: プロジェクト生成

slides.js を生成したら、以下を実行する。

```bash
# 1. テンプレートから新規プロジェクトを作成
python 08_アプリ開発事業部/slide-builder/new-seminar.py \
  --slug "{スラッグ}" \
  --title "{タイトル}"

# 2. slides.js を書き込む
# Write ツールで 08_アプリ開発事業部/slide-builder/projects/{スラッグ}/js/slides.js に書き込む
```

---

### STEP 5: GitHub デプロイ

```bash
$slug = "{スラッグ}"
$projDir = "D:\Google Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\slide-builder\projects\$slug"

cd $projDir
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

### STEP 6: 完了報告

```
[完了]
タイトル    : 〇〇
スライド数  : 〇〇枚

受講者URL   : https://artsoul-git.github.io/{スラッグ}/viewer.html
管理画面    : https://artsoul-git.github.io/{スラッグ}/admin.html
プレゼンター: https://artsoul-git.github.io/{スラッグ}/presenter.html

⚠ 初回のみ: admin.html を開いてパスワードを設定してください。
  初期パスワードは manual.html（ローカル保管）を確認。
```

---

## テンプレート参照先

- **テンプレートファイル:** `08_アプリ開発事業部/slide-builder/templates/kawai-dark-v1/`
- **デザイン仕様:** `08_アプリ開発事業部/slide-builder/templates/kawai-dark-v1/template-spec.md`
- **slides.js 骨格:** `08_アプリ開発事業部/slide-builder/templates/kawai-dark-v1/js/slides-template.js`

---

## 品質チェックリスト（生成後に確認）

- [ ] 全スライドに `data-section`, `data-title`, `data-notes` が設定されている
- [ ] `data-notes` 内の `'` がエスケープされている（`&#39;`）
- [ ] IIFE で包まれている
- [ ] `window.SLIDES = [...]` が最後に定義されている
- [ ] 時間表記（60分・20分など）が本文に含まれていない
- [ ] スライド数が依頼に近い枚数になっている
