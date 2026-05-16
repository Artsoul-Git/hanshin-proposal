---
name: eval-daily
description: >
  今日（または指定日）の作業を自動評価。git履歴・セッションログ・kai-tasksを読み込み、
  ロードマップ5本柱との整合性スコアを算出してJSONに保存する。追加コスト0。
  トリガー: 「今日の評価」「/eval-daily」「日次評価を実行」
user-invocable: true
---

# eval-daily — 日次作業評価

## このスキルのルール

1. **承認不要で即時実行** — 確認ゲートなし
2. **追加コスト0** — 純Python処理。API呼び出しなし
3. **完了後にKai Tasks を更新しない**（日次評価はログ目的）

---

## 実行手順

### Step 1: スクリプト実行

```bash
python 08_アプリ開発事業部/outputs/kai-review/kai-review.py daily
```

特定日を指定する場合:
```bash
python 08_アプリ開発事業部/outputs/kai-review/kai-review.py daily --date 2026-05-15
```

### Step 2: 結果を読み取る

出力されたJSONファイルを確認する:
```
08_アプリ開発事業部/outputs/kai-review/reviews/daily/YYYY-MM-DD.json
```

### Step 3: Kai によるコメント

スコアリング結果をもとに、以下を1〜2文ずつ添える:

1. **本日の一言評価**（スコアと整合性から）
2. **明日への一点アドバイス**（最も効果的な次アクション）

---

## スコアの読み方

| スコア | 評価 |
|--------|------|
| 5〜6   | 優秀。ゴール直結の高品質アウトプット |
| 3〜4   | 良好。価値はあるが柱との整合を高める余地あり |
| 1〜2   | 要注意。脱線傾向。週次レビューで検討を |
| 0      | 警告。ロードマップと無関係な作業が続いている |

---

## 出力ファイル

`reviews/daily/YYYY-MM-DD.json`

```json
{
  "date": "2026-05-16",
  "summary": {
    "commits": 5,
    "avg_score": 4.2,
    "on_track": 3,
    "value_add": 1,
    "off_track": 1,
    "tasks_completed": 2
  },
  "commits": [...],
  "tasks": {...}
}
```
