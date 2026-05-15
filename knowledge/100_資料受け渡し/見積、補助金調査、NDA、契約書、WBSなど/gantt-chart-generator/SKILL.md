---
name: gantt-chart-generator
description: プロジェクトのガントチャートをExcel形式で自動生成。【v3.0】動的関数版 - 開始日・終了日の変更でガントバーが自動伸縮、ステータス変更でバー色が自動変更（条件付き書式）。契約書/提案書（docx/PDF）からプロジェクト情報を抽出、または自然言語でのタスク説明から生成可能。契約期間から逆算してフェーズを自動配分、バッファ自動挿入。WBS形式の階層的タスク構造、Jony Iveデザイン（グレースケール＋アクセント1色）。「ガントチャートを作成」「プロジェクトスケジュールをExcelで」「この契約書からガントチャートを生成」等のリクエストで使用。
---

# Gantt Chart Generator v3.0（動的関数版）

## Overview

契約書/提案書または自然言語から、**動的関数によるステータス連動型ガントチャート**をExcelで生成するスキル。

### v2.0 → v3.0 主要改善点

| 項目 | v2.0 | v3.0 |
|------|------|------|
| ガントバー | 静的セル塗りつぶし | **関数で動的表示** |
| 日数計算 | 固定値 | **`=終了日-開始日+1`** |
| バー伸縮 | 手動再作成 | **日付変更で自動伸縮** |
| ステータス色 | 手動変更 | **条件付き書式で自動変更** |
| 色体系 | 任意 | **Jony Iveデザイン準拠** |

## 動的機能仕様

### 1. 日数の自動計算

```
F列（日数）= E列（終了日）- D列（開始日）+ 1
```

**Excel数式**: `=E{row}-D{row}+1`

### 2. ガントバーの動的表示

各週列（W1〜W26）に以下の数式を埋め込み：

```
=IF(AND($D{row}<=週末日, $E{row}>=週開始日), "■", "")
```

**動作**:
- 開始日・終了日を変更すると、バーが自動で伸縮
- タスク期間が週をまたぐ場合、複数週にバーが表示

### 3. ステータス連動の色変更

条件付き書式（FormulaRule）でステータス（G列）に応じてバー色を自動変更：

```python
# 条件付き書式の適用
FormulaRule(
    formula=['AND($G${row}="進行中", H{row}<>"")'],
    fill=PatternFill(start_color='666666', fill_type='solid')
)
```

## Jony Iveデザインシステム準拠

### カラーパレット（グレースケール＋1アクセント）

| 用途 | HEX | 使用場面 |
|------|-----|----------|
| ブラック | #000000 | タイトル、最重要テキスト |
| ダークグレー | #333333 | 本文、完了ステータス |
| ミディアムグレー | #666666 | 見出し、進行中ステータス |
| ライトグレー | #999999 | 補足情報 |
| ペールグレー | #CCCCCC | 未着手ステータス |
| セパレーター | #E0E0E0 | 区切り線 |
| 背景グレー | #F5F5F5 | フェーズ背景 |
| ホワイト | #FFFFFF | 基本背景、保留ステータス |
| アクセントブルー | #5B7B94 | マイルストーンのみ |

### ステータス色マッピング

| ステータス | 色 | HEX | デザイン意図 |
|-----------|-----|-----|-------------|
| 未着手 | ペールグレー | #CCCCCC | 存在するが目立たない |
| 進行中 | ミディアムグレー | #666666 | 注目すべき |
| 完了 | ダークグレー | #333333 | 確定・安定 |
| 保留 | ホワイト＋枠線 | #FFFFFF | 「空」の状態 |
| マイルストーン | アクセントブルー | #5B7B94 | 唯一の色、特別な意味 |

### Python定数

```python
COLORS = {
    # 基本グレースケール
    'black': '000000',
    'dark_gray': '333333',
    'medium_gray': '666666',
    'light_gray': '999999',
    'pale_gray': 'CCCCCC',
    'separator': 'E0E0E0',
    'bg_gray': 'F5F5F5',
    'white': 'FFFFFF',
    
    # アクセント（1色のみ）
    'accent': '5B7B94',
    
    # ステータス（グレー濃淡）
    'status_pending': 'CCCCCC',    # 未着手
    'status_progress': '666666',   # 進行中
    'status_done': '333333',       # 完了
    'status_hold': 'FFFFFF',       # 保留（枠線付き）
    'milestone': '5B7B94',
}

FONT_NAME = 'メイリオ'
```

## Input Requirements

### 必須パラメータ

| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| `project_name` | ○ | プロジェクト名 | "DXコンサルティング" |
| `start_date` | ○ | プロジェクト開始日 | datetime(2025, 1, 6) |
| `end_date` | ○ | 契約終了日 | datetime(2025, 6, 30) |
| `phases` | ○ | フェーズ定義（タスク含む） | 後述 |

### オプションパラメータ

| パラメータ | デフォルト | 説明 |
|-----------|-----------|------|
| `responsible` | "" | 担当会社名 |
| `client` | "" | クライアント名 |
| `buffer_ratio` | 0.10 | バッファ率（10%） |
| `phase_gap_days` | 3 | フェーズ間の移行日数 |

### フェーズ・タスク定義

```python
"phases": [
    {
        "name": "Phase 1: 現状分析",
        "tasks": [
            {"wbs": "1.1", "name": "キックオフ", "assignee": "全員", "days": 1},
            {"wbs": "1.2", "name": "ヒアリング", "assignee": "担当", "days": 10},
        ],
        "milestone": "現状分析完了"
    },
]
```

## Output Specification

### シート構成

| シート | 内容 |
|--------|------|
| 概要 | プロジェクト情報、動的機能説明、ステータス凡例 |
| WBS・ガントチャート | 動的ガントチャート本体 |
| 凡例・使い方 | 操作方法、色の意味 |

### WBS・ガントチャート列構成

| 列 | 内容 | 動的機能 |
|----|------|---------|
| A | WBS番号 | - |
| B | タスク名 | - |
| C | 担当 | - |
| D | 開始日 | **編集可能** |
| E | 終了日 | **編集可能** |
| F | 日数 | **関数: =E-D+1** |
| G | ステータス | **ドロップダウン選択** |
| H〜 | W1〜W26（週列） | **関数＋条件付き書式** |

### ステータスドロップダウン

```python
status_dv = DataValidation(
    type="list",
    formula1='"未着手,進行中,完了,保留"',
    allow_blank=True
)
```

## 条件付き書式の実装

### 適用範囲

各タスク行のガント列（H列〜AG列）に適用。

### 数式ルール

```python
from openpyxl.formatting.rule import FormulaRule

# 未着手
FormulaRule(
    formula=['AND($G${row}="未着手", H{row}<>"")'],
    fill=PatternFill(start_color='CCCCCC', fill_type='solid'),
    font=Font(color='CCCCCC')
)

# 進行中
FormulaRule(
    formula=['AND($G${row}="進行中", H{row}<>"")'],
    fill=PatternFill(start_color='666666', fill_type='solid'),
    font=Font(color='666666')
)

# 完了
FormulaRule(
    formula=['AND($G${row}="完了", H{row}<>"")'],
    fill=PatternFill(start_color='333333', fill_type='solid'),
    font=Font(color='333333')
)

# 保留
FormulaRule(
    formula=['AND($G${row}="保留", H{row}<>"")'],
    fill=PatternFill(start_color='FFFFFF', fill_type='solid'),
    font=Font(color='999999'),
    border=Border(...)
)
```

## 使用方法

### スクリプト実行

```bash
python scripts/create_dynamic_gantt.py
```

### カスタマイズ

`scripts/create_dynamic_gantt.py`の`PROJECT_DATA`セクションを編集：

```python
PROJECT_DATA = {
    "project_name": "プロジェクト名",
    "start_date": datetime(2025, 1, 6),
    "end_date": datetime(2025, 6, 30),
    "responsible": "担当会社",
    "client": "クライアント名",
    "phases": [...]
}
```

## Constraints & Boundaries

### DO（すること）
- 動的関数によるガントチャート生成
- 条件付き書式によるステータス連動色変更
- WBS構造化
- 契約期間に基づくフェーズ自動配分
- Jony Iveデザインシステム準拠

### DO NOT（しないこと）
- 契約書/提案書の作成（別スキルの役割）
- 議事録・進捗サマリーの生成（meeting-to-tasksheetの役割）
- 派手な色使い（赤・緑・オレンジ等）
- 複数のアクセント色

## バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| v3.0 | 2025-12 | 動的関数版、条件付き書式によるステータス連動、Jony Iveデザイン完全準拠 |
| v2.0 | 2025-12 | 契約期間から逆算、バッファ自動挿入、訪問頻度考慮 |
| v1.x | 2025-11 | 初期版、静的ガントチャート |

## Resources

### scripts/
- `create_dynamic_gantt.py`: 動的ガントチャート生成メインスクリプト

### references/
- `dynamic_gantt_spec.md`: 動的機能の詳細仕様
- `conditional_formatting.md`: 条件付き書式の実装詳細
- `jony_ive_colors.md`: Jony Iveデザインシステムの色定義
