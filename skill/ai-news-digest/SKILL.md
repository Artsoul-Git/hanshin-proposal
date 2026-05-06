---
name: ai-news-digest
description: AI関連ニュースをHackerNewsから自動収集→3行要約→Markdownレポート生成。「今日のAIニュース」「AI情報まとめて」「ai-news-digest」で発動。毎朝のルーティンに組み込み可能。
---

# AI News Digest

AI関連ニュースを自動収集し、3行要約付きのMarkdownレポートを生成するスキル。

## トリガー
- 「今日のAIニュース」
- 「AI情報まとめて」
- 「ai-news-digest」
- 「最新のAI動向」

## 実行手順

### Step 1: HackerNews APIから記事取得
以下のエンドポイントで過去24時間のトップストーリーIDを取得:
https://hacker-news.firebaseio.com/v0/topstories.json

各IDの詳細は:
https://hacker-news.firebaseio.com/v0/item/{id}.json

### Step 2: AI関連フィルタリング
以下のキーワードを含むタイトル/URLのみ抽出:
- AI / LLM / GPT / Claude / Gemini / Llama
- machine learning / deep learning / transformer
- agent / RAG / fine-tuning / prompt
- Anthropic / OpenAI / DeepMind / Mistral

### Step 3: 各記事を3行要約
各記事について、リンク先を WebFetch で取得し、以下のフォーマットで要約:
- 何が起きたか（1行）
- なぜ重要か（1行）
- わどの一手（1行・自分の運用にどう活かすか）

### Step 4: Markdownレポート生成
### Step 5: 保存先: 04_Memory/ai-news/ai-news-YYYY-MM-DD.md

## 出力後のアクション
- 「気になった記事はある？深掘りする？」
- 「note記事のネタになりそうな話題は？」
- 「Xに投稿するならどの角度で？」
