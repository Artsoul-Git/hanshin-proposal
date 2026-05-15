# 動的ガントチャート 詳細仕様書

## 概要

本ドキュメントは、動的関数版ガントチャートの技術仕様を詳細に記載したものです。

## 1. 日数計算の仕組み

### Excel数式

```
F列（日数）= E列（終了日）- D列（開始日）+ 1
```

**例**: 
- 開始日: 2025/01/06
- 終了日: 2025/01/15
- 日数: `=E3-D3+1` → 10日

### Pythonでの実装

```python
days_cell = ws.cell(row=row, column=6)
days_cell.value = f'=E{row}-D{row}+1'
```

## 2. ガントバーの動的表示

### 原理

各週列（W1〜W26）にIF関数を埋め込み、タスクの開始日・終了日と週の期間を比較。
重複があれば「■」を表示、なければ空白。

### Excel数式

```
=IF(AND($D{row}<=週末日, $E{row}>=週開始日), "■", "")
```

**判定ロジック**:
- タスク開始日 <= 週末日 AND
- タスク終了日 >= 週開始日
- → 両方満たせばバー表示

### Pythonでの実装

```python
for w in range(WEEKS):
    week_start = project_start_date + timedelta(days=w * 7)
    week_end = week_start + timedelta(days=6)
    
    formula = f'=IF(AND($D{row}<=DATE({week_end.year},{week_end.month},{week_end.day}),' \
              f'$E{row}>=DATE({week_start.year},{week_start.month},{week_start.day})),"■","")'
    
    bar_cell = ws.cell(row=row, column=START_COL + w, value=formula)
```

### 動作確認

| 操作 | 結果 |
|------|------|
| 終了日を1週間後に変更 | バーが1週分伸びる |
| 開始日を1週間後に変更 | バーが1週分縮む |
| 開始日・終了日を同日に変更 | バーが1週分のみ表示 |

## 3. 条件付き書式によるステータス連動

### 適用範囲

各タスク行のガント列（H列〜AG列 = W1〜W26）

### 数式ルールの構造

```python
FormulaRule(
    formula=['AND($G${row}="ステータス名", セル参照<>"")'],
    fill=PatternFill(...),
    font=Font(...)
)
```

**ポイント**:
- `$G${row}`: ステータス列を絶対参照（行は固定、列も固定）
- `セル参照<>""`: バーが表示されているセルのみに適用

### 各ステータスの書式

#### 未着手（#CCCCCC）

```python
FormulaRule(
    formula=[f'AND($G${row}="未着手", {col_letter}{row}<>"")'],
    fill=PatternFill(start_color='CCCCCC', end_color='CCCCCC', fill_type='solid'),
    font=Font(color='CCCCCC')
)
```

#### 進行中（#666666）

```python
FormulaRule(
    formula=[f'AND($G${row}="進行中", {col_letter}{row}<>"")'],
    fill=PatternFill(start_color='666666', end_color='666666', fill_type='solid'),
    font=Font(color='666666')
)
```

#### 完了（#333333）

```python
FormulaRule(
    formula=[f'AND($G${row}="完了", {col_letter}{row}<>"")'],
    fill=PatternFill(start_color='333333', end_color='333333', fill_type='solid'),
    font=Font(color='333333')
)
```

#### 保留（#FFFFFF + 枠線）

```python
FormulaRule(
    formula=[f'AND($G${row}="保留", {col_letter}{row}<>"")'],
    fill=PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid'),
    font=Font(color='999999'),
    border=Border(
        left=Side(style='thin', color='999999'),
        right=Side(style='thin', color='999999'),
        top=Side(style='thin', color='999999'),
        bottom=Side(style='thin', color='999999')
    )
)
```

### 適用順序

条件付き書式は**後から追加されたものが優先**されるため、以下の順序で追加：

1. 未着手（最低優先度）
2. 進行中
3. 完了
4. 保留（最高優先度）

## 4. ドロップダウンリスト

### DataValidationの設定

```python
from openpyxl.worksheet.datavalidation import DataValidation

status_dv = DataValidation(
    type="list",
    formula1='"未着手,進行中,完了,保留"',
    allow_blank=True
)
ws.add_data_validation(status_dv)

# 各タスク行のステータスセルに適用
status_cell = ws.cell(row=row, column=7, value='未着手')
status_dv.add(status_cell)
```

## 5. マイルストーンの表示

### 特別扱い

マイルストーンは条件付き書式ではなく、**静的な塗りつぶし**で表示。

```python
ms_bar = ws.cell(row=row, column=milestone_col, value='◆')
ms_bar.font = Font(name='メイリオ', size=12, bold=True, color='FFFFFF')
ms_bar.fill = PatternFill(start_color='5B7B94', end_color='5B7B94', fill_type='solid')
ms_bar.alignment = Alignment(horizontal='center', vertical='center')
```

**理由**:
- マイルストーンはステータス変更の対象外
- 唯一のアクセントカラーで特別感を演出

## 6. 期間スケーリング

### 問題

タスク日数の合計 ≠ 契約期間 の場合、ガントが契約終了日を超える/届かない。

### 解決策

```python
total_task_days = sum(
    sum(task['days'] for task in phase['tasks'])
    for phase in phases
)
total_project_days = (end_date - start_date).days + 1
scale_factor = total_project_days / total_task_days * 0.85  # 85%で収める

# 各タスクの日数をスケーリング
adjusted_days = max(1, int(task['days'] * scale_factor))
```

## 7. 週列の計算

### 週番号と日付の対応

```python
WEEKS = 26  # 6ヶ月 ≒ 26週

for w in range(WEEKS):
    week_start = project_start_date + timedelta(days=w * 7)
    week_end = week_start + timedelta(days=6)
```

### 列番号との対応

```python
START_COL = 8  # H列から開始

# W1 = H列（8列目）
# W2 = I列（9列目）
# W26 = AG列（33列目）
```

## 8. 技術的注意点

### openpyxlの制限

1. **条件付き書式の数式参照**: `$`の使い方に注意
2. **日本語フォント**: `メイリオ`を明示的に指定
3. **色コード**: `#`なしの6桁HEX

### Excel互換性

- 条件付き書式はExcel 2010以降で動作
- LibreOffice Calcでは一部動作が異なる場合あり
- Google Sheetsにアップロードすると条件付き書式が失われる可能性あり

## 9. トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| バーが表示されない | 日付形式の不一致 | DATE関数で明示的に日付を指定 |
| 色が変わらない | 条件付き書式の優先順位 | 追加順序を確認 |
| 日数が#VALUE! | 日付セルがテキスト | 日付形式に変換 |
| ドロップダウンが出ない | DataValidation未適用 | add()で適用を確認 |
