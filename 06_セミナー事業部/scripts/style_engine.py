"""
Style Engine - スタイル定義書の読み込み＋装飾要素の適用

参考デザイン5スタイルの YAML を読み込み、各スライドに固有の
装飾を適用する。
"""

from pathlib import Path
import yaml
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR


def hex_to_rgb(hex_color):
    h = hex_color.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def load_style(style_name, styles_dir):
    """スタイル YAML を読み込む。見つからなければ corporate にフォールバック。"""
    # アンダースコア → ハイフン変換も試す（style-luminous_dark_modern → style-luminous-dark-modern）
    style_name_dashed = style_name.replace("_", "-")
    candidates = [
        Path(styles_dir) / f"style-{style_name}.yaml",
        Path(styles_dir) / f"style-{style_name_dashed}.yaml",
        Path(styles_dir) / f"theme-{style_name}.yaml",
        Path(styles_dir) / f"theme-{style_name_dashed}.yaml",
    ]
    for p in candidates:
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
    print(f"[警告] スタイル {style_name} が見つかりません。corporate にフォールバック。")
    fallback = Path(styles_dir).parent / "themes" / "theme-corporate.yaml"
    if fallback.exists():
        with open(fallback, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return get_default_style()


def get_default_style():
    """最低限のデフォルトスタイル"""
    return {
        "name": "default",
        "mode": "light",
        "colors": {
            "primary": "#1A365D",
            "accent": "#ED8936",
            "text_main": "#2D3748",
            "text_sub": "#718096",
            "background_default": "#FFFFFF",
            "background_sub": "#F7FAFC",
            "divider": "#E2E8F0",
        },
        "typography": {
            "ja_heading": "Yu Gothic UI",
            "ja_body": "Yu Gothic UI",
        },
        "font_sizes": {
            "slide_title": 44,
            "body": 28,
            "body_minimum": 24,
        },
        "layout": {
            "width_inches": 13.33,
            "height_inches": 7.5,
        },
        "decorations": {},
    }


# ===== 共通装飾要素 =====

def apply_background(slide, style, prs_w, prs_h, page_type=None):
    """背景色を適用"""
    bg_default = style.get("colors", {}).get("background_default", "#FFFFFF")

    # ページタイプ別の背景上書き
    pt_cfg = style.get("page_types", {}).get(page_type, {})
    bg = pt_cfg.get("background", bg_default)

    if bg and bg.upper() != "#FFFFFF":
        rect = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs_w, prs_h)
        rect.fill.solid()
        rect.fill.fore_color.rgb = hex_to_rgb(bg)
        rect.line.fill.background()
        return True
    return False


def apply_left_top_nav(slide, style, section_label, prs_w):
    """左上ナビゲーション："01. INTRODUCTION" 形式"""
    deco = style.get("decorations", {})
    if not deco.get("left_top_nav"):
        return

    nav_format = deco.get("nav_format", "01. INTRODUCTION")
    text = section_label or nav_format

    nav_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.25), Inches(4.0), Inches(0.3))
    tf = nav_box.text_frame
    tf.text = text
    p = tf.paragraphs[0]
    if p.runs:
        run = p.runs[0]
        font_size = style.get("font_sizes", {}).get("navigation", 11)
        run.font.size = Pt(font_size)
        run.font.bold = True
        run.font.name = style["typography"].get("en_heading", "Inter")
        # 文字色：背景がダークなら明るい色
        if style.get("mode") == "dark":
            run.font.color.rgb = hex_to_rgb(style["colors"].get("text_sub", "#94A3B8"))
        else:
            run.font.color.rgb = hex_to_rgb(style["colors"].get("text_sub", "#666666"))


def apply_giant_circle(slide, style, prs_w, prs_h, position="bottom_right"):
    """画面端に巨大円形オブジェクト（クリーン・サステナブル・サークル用）"""
    if not style.get("decorations", {}).get("giant_circle"):
        return

    color = style["colors"].get("accent", "#4BAA87")
    size = Inches(6.5)

    if position == "bottom_right":
        x = prs_w - size + Inches(2.5)  # 半分はみ出し
        y = prs_h - size + Inches(2.0)
    elif position == "top_left":
        x = -Inches(2.5)
        y = -Inches(2.0)
    else:
        x = prs_w - size + Inches(1.5)
        y = Inches(0.5)

    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, x, y, size, size)
    circle.fill.solid()
    circle.fill.fore_color.rgb = hex_to_rgb(color)
    circle.line.fill.background()


def apply_neon_strokes(slide, style, prs_w, prs_h):
    """ネオン縦線（ルミナス・ダーク・モダン用）"""
    if not style.get("decorations", {}).get("neon_strokes"):
        return

    accent = style["colors"].get("accent", "#00D2FF")

    # 左端：細いネオン縦線
    line1 = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
                                   Inches(0.3), Inches(2.0),
                                   Emu(40000), Inches(3.5))
    line1.fill.solid()
    line1.fill.fore_color.rgb = hex_to_rgb(accent)
    line1.line.fill.background()


def apply_gradient_band(slide, style, prs_w, prs_h):
    """グラデーション帯（ダイナミック・ビジネス・クリーン用）
    python-pptx ではグラデーション制限があるため、複数矩形で近似"""
    if not style.get("decorations", {}).get("gradient_band"):
        return

    accent = style["colors"].get("accent", "#E91E63")
    accent2 = style["colors"].get("accent_grad_to", "#FF6F00")

    # 上部に太い帯（単色で簡略化、実装は後続で改善余地）
    band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
                                  0, 0, prs_w, Inches(0.4))
    band.fill.solid()
    band.fill.fore_color.rgb = hex_to_rgb(accent)
    band.line.fill.background()


def apply_dot_pattern(slide, style, prs_w, prs_h):
    """ドットパターン背景（クリーン・サステナブル用）"""
    if not style.get("decorations", {}).get("dot_patterns"):
        return

    color_hex = style["colors"].get("accent2", "#C0D72F")

    # 右上にドットの集合
    rows, cols = 5, 8
    dot_size = Inches(0.08)
    spacing = Inches(0.3)
    start_x = prs_w - Inches(3.5)
    start_y = Inches(0.5)

    for r in range(rows):
        for c in range(cols):
            dot = slide.shapes.add_shape(
                MSO_SHAPE.OVAL,
                start_x + c * spacing,
                start_y + r * spacing,
                dot_size, dot_size
            )
            dot.fill.solid()
            dot.fill.fore_color.rgb = hex_to_rgb(color_hex)
            dot.line.fill.background()


def apply_brush_underline(slide, style, x, y, width):
    """タイトル下に手描き風アンダーライン（ラフ・シック・インク用）"""
    if not style.get("decorations", {}).get("brush_underline"):
        return

    accent = style["colors"].get("accent", "#D4A017")

    # 太めの線（ブラシ風）
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
                                  x, y, width, Emu(120000))
    line.fill.solid()
    line.fill.fore_color.rgb = hex_to_rgb(accent)
    line.line.fill.background()


def apply_scattered_marks(slide, style, prs_w, prs_h):
    """散らばったマーク（ラフ・シック・インク用）"""
    if not style.get("decorations", {}).get("scattered_marks"):
        return

    colors = [
        style["colors"].get("accent", "#D4A017"),
        style["colors"].get("accent2", "#1F6D5A"),
        style["colors"].get("accent3", "#A02828"),
    ]

    # 5箇所に小さな矩形/円をランダム配置（決定論的）
    positions = [
        (Inches(11.5), Inches(0.5), 0),
        (Inches(0.4), Inches(6.5), 1),
        (Inches(11.0), Inches(6.8), 2),
        (Inches(6.5), Inches(0.2), 0),
        (Inches(0.3), Inches(3.5), 1),
    ]
    for x, y, color_idx in positions:
        size = Inches(0.15)
        mark = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, x, y, size, size
        )
        mark.fill.solid()
        mark.fill.fore_color.rgb = hex_to_rgb(colors[color_idx])
        mark.line.fill.background()


def apply_thin_dividers(slide, style, prs_w, prs_h):
    """細い区切り線（ミニマル系用）"""
    if not style.get("decorations", {}).get("thin_dividers"):
        return

    divider = style["colors"].get("divider", "#999999")

    # 上部細線
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
                                  Inches(0.7), Inches(0.7),
                                  prs_w - Inches(1.4), Emu(15000))
    line.fill.solid()
    line.fill.fore_color.rgb = hex_to_rgb(divider)
    line.line.fill.background()


def apply_card_shadow(slide, style, x, y, w, h):
    """カードシャドウ（ルミナス・ダーク・モダン用）"""
    if not style.get("decorations", {}).get("card_shadows"):
        return

    bg_sub = style["colors"].get("background_sub", "#1E293B")

    # シャドウ用矩形（少しオフセット）
    shadow = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
                                    x + Emu(40000), y + Emu(40000), w, h)
    shadow.fill.solid()
    shadow.fill.fore_color.rgb = hex_to_rgb("#000000")
    shadow.line.fill.background()
    # 透明度 30%（python-pptx 制限あり、近似）

    # カード本体
    card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    card.fill.solid()
    card.fill.fore_color.rgb = hex_to_rgb(bg_sub)
    card.line.fill.background()


# ===== オールインワン装飾適用関数 =====

def apply_all_decorations(slide, style, prs_w, prs_h, page_type=None,
                          section_label=None, slide_index=None):
    """そのスライドに該当する全ての装飾を適用する。
    呼び出し順序が重要：背景 → 大型装飾 → 小型装飾 → ナビ
    """
    # 1. 背景
    apply_background(slide, style, prs_w, prs_h, page_type)

    # 2. 大型装飾
    apply_giant_circle(slide, style, prs_w, prs_h)

    # 3. パターン
    apply_dot_pattern(slide, style, prs_w, prs_h)

    # 4. ストロークライン
    apply_neon_strokes(slide, style, prs_w, prs_h)

    # 5. 帯
    apply_gradient_band(slide, style, prs_w, prs_h)

    # 6. 散らばりマーク
    apply_scattered_marks(slide, style, prs_w, prs_h)

    # 7. 細線
    apply_thin_dividers(slide, style, prs_w, prs_h)

    # 8. ナビ（最上位）
    apply_left_top_nav(slide, style, section_label, prs_w)


# ===== セクションラベル生成 =====

def generate_section_label(slide_spec, style):
    """章番号と章タイトルから "01. INTRODUCTION" 等の形式を生成"""
    chapter_num = slide_spec.get("章番号")
    chapter_title = slide_spec.get("章タイトル", "") or slide_spec.get("セクション", "")

    if not chapter_num and not chapter_title:
        return None

    nav_format = style.get("decorations", {}).get("nav_format", "01. INTRODUCTION")

    # フォーマットに応じて生成
    if "//" in nav_format:
        # コード風："// 01_INTRO"
        if chapter_num and chapter_title:
            return f"// {str(chapter_num).zfill(2)}_{chapter_title.upper()[:8]}"
        elif chapter_num:
            return f"// {str(chapter_num).zfill(2)}"
        else:
            return f"// {chapter_title.upper()[:12]}"
    else:
        # 標準："01. INTRODUCTION"
        if chapter_num and chapter_title:
            return f"{str(chapter_num).zfill(2)}. {chapter_title.upper()}"
        elif chapter_num:
            return f"{str(chapter_num).zfill(2)}."
        else:
            return chapter_title.upper()
