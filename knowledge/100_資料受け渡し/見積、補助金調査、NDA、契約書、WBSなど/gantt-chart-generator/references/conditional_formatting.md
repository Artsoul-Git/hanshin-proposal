# 条件付き書式（Conditional Formatting）実装詳細

## 概要

openpyxlを使用した条件付き書式の実装方法を解説します。

## 基本構文

```python
from openpyxl.formatting.rule import FormulaRule, CellIsRule
from openpyxl.styles import PatternFill, Font, Border, Side

# FormulaRule: 数式ベースの条件
rule = FormulaRule(
    formula=['条件式'],
    fill=PatternFill(...),
    font=Font(...),
    border=Border(...)
)

# 適用
ws.conditional_formatting.add('適用範囲', rule)
```

## ステータス連動の実装

### 1. 範囲の指定

```python
# 各タスク行のガント列範囲
gantt_range = f'H{row}:AG{row}'  # W1〜W26
```

### 2. ステータス参照

```python
status_ref = f'$G${row}'  # G列のステータスセルを絶対参照
```

### 3. 条件式の構築

```python
# バーが表示されているセル（空でない）かつ、ステータスが一致
formula = f'AND({status_ref}="未着手", H{row}<>"")'
```

### 4. 完全な実装例

```python
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import PatternFill, Font, Border, Side
from openpyxl.utils import get_column_letter

# 定数
START_COL = 8  # H列
WEEKS = 26
COLORS = {
    'status_pending': 'CCCCCC',
    'status_progress': '666666',
    'status_done': '333333',
    'status_hold': 'FFFFFF',
    'light_gray': '999999',
}

def apply_conditional_formatting(ws, task_rows):
    """タスク行にステータス連動の条件付き書式を適用"""
    
    for task_row in task_rows:
        # 適用範囲
        gantt_range = f'{get_column_letter(START_COL)}{task_row}:{get_column_letter(START_COL + WEEKS - 1)}{task_row}'
        status_ref = f'$G${task_row}'
        first_col = get_column_letter(START_COL)
        
        # 未着手
        ws.conditional_formatting.add(
            gantt_range,
            FormulaRule(
                formula=[f'AND({status_ref}="未着手", {first_col}{task_row}<>"")'],
                fill=PatternFill(start_color=COLORS['status_pending'], 
                               end_color=COLORS['status_pending'], fill_type='solid'),
                font=Font(color=COLORS['status_pending'])
            )
        )
        
        # 進行中
        ws.conditional_formatting.add(
            gantt_range,
            FormulaRule(
                formula=[f'AND({status_ref}="進行中", {first_col}{task_row}<>"")'],
                fill=PatternFill(start_color=COLORS['status_progress'], 
                               end_color=COLORS['status_progress'], fill_type='solid'),
                font=Font(color=COLORS['status_progress'])
            )
        )
        
        # 完了
        ws.conditional_formatting.add(
            gantt_range,
            FormulaRule(
                formula=[f'AND({status_ref}="完了", {first_col}{task_row}<>"")'],
                fill=PatternFill(start_color=COLORS['status_done'], 
                               end_color=COLORS['status_done'], fill_type='solid'),
                font=Font(color=COLORS['status_done'])
            )
        )
        
        # 保留
        ws.conditional_formatting.add(
            gantt_range,
            FormulaRule(
                formula=[f'AND({status_ref}="保留", {first_col}{task_row}<>"")'],
                fill=PatternFill(start_color=COLORS['status_hold'], 
                               end_color=COLORS['status_hold'], fill_type='solid'),
                font=Font(color=COLORS['light_gray']),
                border=Border(
                    left=Side(style='thin', color=COLORS['light_gray']),
                    right=Side(style='thin', color=COLORS['light_gray']),
                    top=Side(style='thin', color=COLORS['light_gray']),
                    bottom=Side(style='thin', color=COLORS['light_gray'])
                )
            )
        )
```

## 条件付き書式の優先順位

### ルール

- **後から追加されたルールが優先**される
- 複数のルールが同時に適用される場合、最後に追加されたものが表示される

### 推奨追加順序

```python
# 1. 未着手（デフォルト、最低優先度）
# 2. 進行中
# 3. 完了
# 4. 保留（最高優先度）
```

## 注意点

### 1. 数式内の参照

```python
# ❌ 相対参照（行がずれる）
formula=['AND(G3="未着手", H3<>"")']

# ✅ 行を変数化
formula=[f'AND($G${row}="未着手", H{row}<>"")']
```

### 2. 日本語文字列

```python
# ❌ エスケープ不要
formula=['AND($G$3="未着手", H3<>"")']  # そのまま日本語OK
```

### 3. 空文字判定

```python
# ❌ 空白セルに適用されてしまう
formula=['$G$3="未着手"']

# ✅ バーが表示されているセルのみ
formula=['AND($G$3="未着手", H3<>"")']
```

## デバッグ方法

### 1. 条件付き書式の確認

Excelで開いて「条件付き書式の管理」から確認。

### 2. 数式の検証

```python
# 数式をセルに直接入力してテスト
ws['Z1'] = f'=AND($G$3="未着手", H3<>"")'
```

### 3. ログ出力

```python
print(f"Applied rule to {gantt_range}: {formula}")
```

## よくあるエラー

| エラー | 原因 | 対処 |
|--------|------|------|
| ルールが適用されない | 範囲指定の誤り | A1形式で正確に指定 |
| 色が表示されない | fill_type未指定 | `fill_type='solid'`を追加 |
| 数式エラー | 日本語の引用符 | 半角ダブルクォートを使用 |
| 部分的に適用 | 範囲が狭い | 全ガント列を含める |
