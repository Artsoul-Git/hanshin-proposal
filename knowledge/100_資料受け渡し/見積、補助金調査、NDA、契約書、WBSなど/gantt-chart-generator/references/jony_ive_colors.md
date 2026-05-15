# Jony Ive Design System - カラー定義

## デザイン哲学

> "Simplicity is the ultimate sophistication"
> （シンプルさこそ究極の洗練）

## 原則

1. **極限までシンプルに** - 不要な装飾を徹底的に排除
2. **余白を贅沢に使う** - 情報に呼吸する空間を与える
3. **完璧な整列** - すべての要素を精密に配置
4. **色で騒がない** - グレースケール基調、アクセント色は1色のみ
5. **階層の明確化** - 濃淡と太さで情報の重要度を表現

## カラーパレット

### 基本カラー（グレースケール）

| 名称 | HEX | RGB | 用途 |
|------|-----|-----|------|
| ブラック | #000000 | 0, 0, 0 | タイトル、最重要テキスト |
| ダークグレー | #333333 | 51, 51, 51 | 本文、完了ステータス |
| ミディアムグレー | #666666 | 102, 102, 102 | 見出し、進行中ステータス |
| ライトグレー | #999999 | 153, 153, 153 | 補足情報 |
| ペールグレー | #CCCCCC | 204, 204, 204 | 未着手ステータス |
| セパレーター | #E0E0E0 | 224, 224, 224 | 区切り線 |
| 背景グレー | #F5F5F5 | 245, 245, 245 | フェーズ背景 |
| ホワイト | #FFFFFF | 255, 255, 255 | 基本背景、保留ステータス |

### アクセントカラー（1色のみ）

| 名称 | HEX | RGB | 用途 |
|------|-----|-----|------|
| アクセントブルー | #5B7B94 | 91, 123, 148 | マイルストーンのみ |

## ステータス表現

### グレー濃淡による意味付け

| ステータス | 色 | HEX | デザイン意図 |
|-----------|-----|-----|-------------|
| 未着手 | ペールグレー | #CCCCCC | 存在するが目立たない |
| 進行中 | ミディアムグレー | #666666 | 注目すべき |
| 完了 | ダークグレー | #333333 | 確定・安定 |
| 保留 | ホワイト＋枠線 | #FFFFFF | 「空」の状態 |

### マイルストーン

| 要素 | 色 | HEX | 理由 |
|------|-----|-----|------|
| マイルストーン | アクセントブルー | #5B7B94 | 唯一の色で特別感を演出 |

## Python定数

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
    'milestone': '5B7B94',         # マイルストーン
    
    # 構造
    'header_bg': '333333',         # ヘッダー背景
    'phase_bg': 'F5F5F5',          # フェーズ背景
}

FONT_NAME = 'メイリオ'
```

## openpyxlでの使用

### PatternFill

```python
from openpyxl.styles import PatternFill

# 塗りつぶし
fill = PatternFill(
    start_color='666666',
    end_color='666666',
    fill_type='solid'
)
```

### Font

```python
from openpyxl.styles import Font

# フォント色
font = Font(
    name='メイリオ',
    size=10,
    color='333333'
)
```

### Border

```python
from openpyxl.styles import Border, Side

# 枠線
border = Border(
    left=Side(style='thin', color='E0E0E0'),
    right=Side(style='thin', color='E0E0E0'),
    top=Side(style='thin', color='E0E0E0'),
    bottom=Side(style='thin', color='E0E0E0')
)
```

## アンチパターン（避けるべきこと）

### ❌ 使用禁止の色

| 色 | 理由 |
|----|------|
| 赤 (#FF0000) | 緊急性を煽る、攻撃的 |
| 緑 (#00FF00) | 安っぽい、派手 |
| オレンジ (#FFA500) | 注意を引きすぎる |
| 黄色 (#FFFF00) | 目に痛い |
| 紫 (#800080) | 一貫性がない |

### ❌ 避けるべきパターン

- 複数のアクセント色を使う
- グラデーション
- 影・ドロップシャドウ
- 派手な罫線
- 背景画像

## フォント階層

| レベル | サイズ | 太さ | 色 | 用途 |
|--------|--------|------|-----|------|
| H1 | 16pt | Bold | #000000 | ドキュメントタイトル |
| H2 | 11pt | Bold | #333333 | セクション見出し |
| H3 | 10pt | Bold | #666666 | サブ見出し |
| 本文 | 10pt | Regular | #333333 | 通常テキスト |
| 補足 | 9pt | Regular | #999999 | 注釈、フッター |

## 参照

- `/mnt/skills/user/jony-ive-design-system/SKILL.md`
- `/mnt/skills/user/jony-ive-design-system/references/colors.md`
