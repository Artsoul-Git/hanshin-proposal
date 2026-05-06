"""
Slide Builder v4 - プロデザインシステム統合版

主要改善点：
- 5つのプロデザインスタイル対応（rough_chic_ink, dynamic_business_clean,
  refined_minimal_portfolio, clean_sustainable_circle, luminous_dark_modern）
- Auto-layout engine（コンテンツから自動レイアウト判定）
- ネイティブチャート（文字化けゼロ）
- セミナー構造の適切な実装
- 装飾エンジン（左上ナビ・巨大円・ネオン線・ドットパターン等）
- スピーカーノートに台本完全埋め込み

Usage:
    python build_slides.py \\
        --spec outputs/PILOT-001/slide-spec.json \\
        --style luminous_dark_modern \\
        --output outputs/PILOT-001/seminar.pptx \\
        --styles-dir templates/design-styles \\
        --script outputs/PILOT-001/07_script.md
"""

import argparse
import json
import re
import sys
from pathlib import Path

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

# 同ディレクトリのモジュールを追加
sys.path.insert(0, str(Path(__file__).parent))
from style_engine import (
    load_style, hex_to_rgb,
    apply_all_decorations, apply_brush_underline,
    apply_card_shadow, generate_section_label,
)
from chart_native import add_simple_native_chart
from diagram_engine import make_diagram_for_slide


# ===== ユーティリティ =====

def load_spec(spec_path):
    with open(spec_path, "r", encoding="utf-8") as f:
        return json.load(f)


def calc_dynamic_font_size(text, base_size, max_chars_at_base=20, min_size=20):
    """テキスト長に応じて動的にフォントサイズを縮小"""
    if not text:
        return base_size
    text_len = len(text)
    if text_len <= max_chars_at_base:
        return base_size
    new_size = int(base_size * max_chars_at_base / text_len)
    return max(new_size, min_size)


def add_text_box(slide, x, y, w, h, text, font_size, color_hex, style,
                 bold=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
                 font_key="ja_body"):
    """テキストボックスを追加"""
    box = slide.shapes.add_textbox(x, y, w, h)
    box.text_frame.vertical_anchor = anchor
    box.text_frame.word_wrap = True
    box.text_frame.text = text
    p = box.text_frame.paragraphs[0]
    p.alignment = align
    if p.runs:
        run = p.runs[0]
        run.font.size = Pt(font_size)
        run.font.bold = bold
        run.font.name = style.get("typography", {}).get(font_key, "Yu Gothic UI")
        run.font.color.rgb = hex_to_rgb(color_hex)
    return box


def add_multiline(slide, x, y, w, h, lines, font_size, color_hex, style,
                  bold=False, line_spacing=1.5, font_key="ja_body"):
    """複数行テキスト"""
    box = slide.shapes.add_textbox(x, y, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = line
        p.line_spacing = line_spacing
        for run in p.runs:
            run.font.size = Pt(font_size)
            run.font.bold = bold
            run.font.name = style.get("typography", {}).get(font_key, "Yu Gothic UI")
            run.font.color.rgb = hex_to_rgb(color_hex)
    return box


def add_solid_rect(slide, x, y, w, h, color_hex, no_line=True):
    """単色矩形"""
    rect = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    rect.fill.solid()
    rect.fill.fore_color.rgb = hex_to_rgb(color_hex)
    if no_line:
        rect.line.fill.background()
    return rect


# ===== セクション情報の追跡（左上ナビ用）=====

class SectionTracker:
    """各スライドに対して章番号・章タイトルを管理"""
    def __init__(self):
        self.current_chapter = 0
        self.current_chapter_title = ""

    def update(self, slide_spec):
        """章扉スライドなら章情報を更新"""
        slide_type = slide_spec.get("タイプ", "")
        if "章扉" in slide_type or "section" in slide_type:
            self.current_chapter += 1
            # タイトルから「第X章：」を除去
            title = slide_spec.get("タイトル", "")
            title = re.sub(r"^第\d+章[：:]\s*", "", title)
            title = re.sub(r"^Chapter\s+\d+[：:]\s*", "", title, flags=re.I)
            self.current_chapter_title = title

    def get_label(self):
        """現在のセクションラベルを返す"""
        if self.current_chapter == 0:
            return None
        return f"{str(self.current_chapter).zfill(2)}. {self.current_chapter_title.upper()}"


# ===== 各レイアウトビルダー =====

def build_title_slide(prs, slide_spec, style, tracker):
    """Type A: タイトルスライド"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="title")

    pt_cfg = style.get("page_types", {}).get("title", {})
    is_dark = style.get("mode") == "dark"
    title_color = pt_cfg.get("text_color") or pt_cfg.get("title_color") or \
                  (style["colors"].get("text_main") if is_dark else style["colors"]["primary"])
    sub_color = pt_cfg.get("subtitle_color") or style["colors"].get("accent")

    title_text = slide_spec.get("タイトル", "")
    base_size = pt_cfg.get("title_size") or style.get("font_sizes", {}).get("slide_title", 54)
    actual_size = calc_dynamic_font_size(title_text, base_size, max_chars_at_base=18, min_size=32)

    add_text_box(slide, Inches(1.0), Inches(2.5),
                 prs_w - Inches(2.0), Inches(1.8),
                 title_text, actual_size, title_color, style,
                 bold=True, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="ja_heading")

    # ブラシアンダーライン（rough chic ink）
    apply_brush_underline(slide, style, Inches(1.0), Inches(4.4), Inches(2.5))

    # サブタイトル
    if slide_spec.get("サブタイトル"):
        sub_size = pt_cfg.get("subtitle_size") or 32
        add_text_box(slide, Inches(1.0), Inches(4.7),
                     prs_w - Inches(2.0), Inches(1.0),
                     slide_spec["サブタイトル"], sub_size, sub_color, style,
                     align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP)

    # フッター
    footer_parts = [slide_spec.get("日付", ""), slide_spec.get("登壇者", "")]
    footer = " ".join(p for p in footer_parts if p).strip()
    if footer:
        add_text_box(slide, Inches(1.0), Inches(6.5),
                     prs_w - Inches(2.0), Inches(0.5),
                     footer, 16, style["colors"].get("text_sub", "#666"), style)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_section_slide(prs, slide_spec, style, tracker):
    """Type B: 章扉"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="section",
                          section_label=tracker.get_label())

    pt_cfg = style.get("page_types", {}).get("section", {})
    accent_color = pt_cfg.get("accent_color") or style["colors"].get("accent", "#ED8936")
    text_color = pt_cfg.get("text_color") or style["colors"].get("text_main", "#1A202C")

    # 章番号（巨大）
    chapter_num = str(tracker.current_chapter).zfill(2) if tracker.current_chapter else "01"
    add_text_box(slide, Inches(0.5), Inches(1.5),
                 Inches(5.5), Inches(4.5),
                 chapter_num, 220, accent_color, style,
                 bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="en_heading")

    # CHAPTER ラベル
    add_text_box(slide, Inches(0.5), Inches(5.8),
                 Inches(5.5), Inches(0.4),
                 "CHAPTER", 14, accent_color, style,
                 bold=True, align=PP_ALIGN.CENTER, font_key="en_heading")

    # 章タイトル（右側）
    title_text = re.sub(r"^第\d+章[：:]\s*", "", slide_spec.get("タイトル", ""))
    title_size = calc_dynamic_font_size(title_text, 52, max_chars_at_base=14, min_size=28)
    add_text_box(slide, Inches(6.0), Inches(2.5),
                 prs_w - Inches(6.5), Inches(2.5),
                 title_text, title_size, text_color, style,
                 bold=True, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
                 font_key="ja_heading")

    # アクセントバー
    add_solid_rect(slide, Inches(6.0), Inches(5.0), Inches(2.0), Emu(80000),
                   accent_color)

    # リード文
    if slide_spec.get("リード"):
        add_text_box(slide, Inches(6.0), Inches(5.4),
                     prs_w - Inches(6.5), Inches(2.0),
                     slide_spec["リード"], 22,
                     style["colors"].get("text_sub", "#94A3B8"), style)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_content_slide(prs, slide_spec, style, tracker):
    """Type C: コンテンツ（タイトル＋本文）"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    # 図解スライドは画像が主役なので、装飾は背景色＋上端バー＋左上ナビのみに限定
    from style_engine import apply_background, apply_left_top_nav
    apply_background(slide, style, prs_w, prs_h, page_type="content")

    # 上端の薄いアクセントバー（タイトル直下感を出す）
    accent = style["colors"].get("accent", "#ED8936")
    add_solid_rect(slide, 0, 0, prs_w, Inches(0.15), accent)

    apply_left_top_nav(slide, style, tracker.get_label(), prs_w)
    # 抑制：すべての大型装飾（giant_circle, dot_pattern, scattered_marks, neon, gradient_band, thin_dividers）

    is_dark = style.get("mode") == "dark"
    primary_color = style["colors"].get("text_main") if is_dark else style["colors"]["primary"]
    text_color = style["colors"].get("text_main", "#2D3748")
    accent = style["colors"].get("accent", "#ED8936")

    # タイトル
    title_text = slide_spec.get("タイトル", "") or slide_spec.get("メッセージ", "")
    base_size = style.get("font_sizes", {}).get("section_header", 36)
    actual_size = calc_dynamic_font_size(title_text, base_size, max_chars_at_base=24, min_size=22)

    add_text_box(slide, Inches(0.8), Inches(0.85),
                 prs_w - Inches(1.6), Inches(1.5),
                 title_text, actual_size, primary_color, style,
                 bold=True, anchor=MSO_ANCHOR.TOP, font_key="ja_heading")

    # アクセントバー
    add_solid_rect(slide, Inches(0.8), Inches(2.3), Inches(1.5), Emu(70000), accent)

    # 本文
    body_text = slide_spec.get("本文", "")
    body_size = style.get("font_sizes", {}).get("body", 26)

    if body_text:
        max_line = max(len(line) for line in body_text.split(chr(10))) if body_text else 0
        if max_line > 30:
            body_size = max(int(body_size * 30 / max_line), 22)

    lines = body_text.split(chr(10)) if body_text else []
    if lines:
        add_multiline(slide, Inches(1.0), Inches(2.8),
                      prs_w - Inches(2.0), Inches(4.0),
                      lines, body_size, text_color, style, line_spacing=1.6)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_data_slide(prs, slide_spec, style, tracker):
    """Type D: データ・グラフ（ネイティブチャート）"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    is_dark = style.get("mode") == "dark"
    primary_color = style["colors"].get("text_main") if is_dark else style["colors"]["primary"]
    accent = style["colors"].get("accent", "#ED8936")

    # タイトル
    title_text = slide_spec.get("タイトル", "")
    title_size = calc_dynamic_font_size(title_text, 32, max_chars_at_base=22, min_size=22)
    add_text_box(slide, Inches(0.8), Inches(0.85),
                 prs_w - Inches(1.6), Inches(0.8),
                 title_text, title_size, primary_color, style,
                 bold=True, font_key="ja_heading")

    add_solid_rect(slide, Inches(0.8), Inches(1.7), Inches(1.5), Emu(60000), accent)

    # ネイティブチャート
    if slide_spec.get("グラフ"):
        add_simple_native_chart(slide, slide_spec["グラフ"], style,
                                Inches(1.0), Inches(2.0),
                                prs_w - Inches(2.0), Inches(4.3))

    # キーインサイト（強調バー内に白文字）
    if slide_spec.get("キーインサイト"):
        add_solid_rect(slide, Inches(0.8), Inches(6.4),
                       prs_w - Inches(1.6), Inches(0.55), primary_color)
        add_text_box(slide, Inches(1.0), Inches(6.45),
                     prs_w - Inches(2.0), Inches(0.45),
                     slide_spec["キーインサイト"], 20, "#FFFFFF", style,
                     bold=True, anchor=MSO_ANCHOR.MIDDLE)

    # 出典
    if slide_spec.get("出典"):
        add_text_box(slide, Inches(0.8), Inches(7.05),
                     prs_w - Inches(1.6), Inches(0.3),
                     "出典：" + slide_spec["出典"], 11,
                     style["colors"].get("text_sub", "#666"), style)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_three_column_slide(prs, slide_spec, style, tracker):
    """Type E: 3カラム"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")
    text_main = style["colors"].get("text_main", "#2D3748")

    # タイトル
    add_text_box(slide, Inches(0.8), Inches(0.85),
                 prs_w - Inches(1.6), Inches(0.8),
                 slide_spec.get("タイトル", ""), 30, primary, style,
                 bold=True, font_key="ja_heading")
    add_solid_rect(slide, Inches(0.8), Inches(1.7), Inches(1.5), Emu(60000), accent)

    # 3カラム
    columns = slide_spec.get("カラム", [])[:3]
    col_width = (prs_w - Inches(2.4)) / 3
    col_x_start = Inches(0.8)
    col_y = Inches(2.3)
    col_h = Inches(4.5)

    for i, col in enumerate(columns):
        x = col_x_start + (col_width + Inches(0.3)) * i

        # カラム枠
        rect = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                      x, col_y, col_width, col_h)
        rect.fill.solid()
        rect.fill.fore_color.rgb = hex_to_rgb(style["colors"].get("background_sub", "#F7FAFC"))
        rect.line.color.rgb = hex_to_rgb(style["colors"].get("divider", "#E2E8F0"))
        rect.line.width = Pt(1)
        try:
            rect.adjustments[0] = 0.05
        except Exception:
            pass

        # 番号バッジ
        badge_size = Inches(0.7)
        badge_x = x + (col_width - badge_size) / 2
        badge = slide.shapes.add_shape(MSO_SHAPE.OVAL,
                                       badge_x, col_y + Inches(0.3),
                                       badge_size, badge_size)
        badge.fill.solid()
        badge.fill.fore_color.rgb = hex_to_rgb(accent)
        badge.line.fill.background()

        num_box = slide.shapes.add_textbox(badge_x, col_y + Inches(0.3),
                                          badge_size, badge_size)
        nf = num_box.text_frame
        nf.vertical_anchor = MSO_ANCHOR.MIDDLE
        nf.text = str(i + 1)
        np = nf.paragraphs[0]
        np.alignment = PP_ALIGN.CENTER
        if np.runs:
            np.runs[0].font.size = Pt(28)
            np.runs[0].font.bold = True
            np.runs[0].font.color.rgb = hex_to_rgb("#FFFFFF")

        # カラムタイトル
        add_text_box(slide, x + Inches(0.2), col_y + Inches(1.2),
                     col_width - Inches(0.4), Inches(0.7),
                     col.get("タイトル", ""), 22, primary, style,
                     bold=True, align=PP_ALIGN.CENTER, font_key="ja_heading")

        # カラム本文
        body_lines = col.get("本文", "").split(chr(10)) if col.get("本文") else []
        if body_lines:
            add_multiline(slide, x + Inches(0.3), col_y + Inches(2.0),
                          col_width - Inches(0.6), Inches(2.3),
                          body_lines, 16, text_main, style, line_spacing=1.4)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_before_after_slide(prs, slide_spec, style, tracker):
    """Type F: Before/After"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")
    text_main = style["colors"].get("text_main", "#2D3748")
    divider = style["colors"].get("divider", "#E2E8F0")
    positive = "#38A169"

    add_text_box(slide, Inches(0.8), Inches(0.85),
                 prs_w - Inches(1.6), Inches(0.8),
                 slide_spec.get("タイトル", ""), 30, primary, style,
                 bold=True, font_key="ja_heading")
    add_solid_rect(slide, Inches(0.8), Inches(1.7), Inches(1.5), Emu(60000), accent)

    # Before
    bx, bw = Inches(0.8), Inches(5.5)
    add_solid_rect(slide, bx, Inches(2.3), bw, Inches(4.5), divider)
    add_text_box(slide, bx, Inches(2.5), bw, Inches(0.5),
                 "BEFORE", 22, "#666666", style,
                 bold=True, align=PP_ALIGN.CENTER, font_key="en_heading")
    before_lines = slide_spec.get("Before", "").split(chr(10)) if slide_spec.get("Before") else []
    if before_lines:
        add_multiline(slide, bx + Inches(0.3), Inches(3.2),
                      bw - Inches(0.6), Inches(3.3),
                      before_lines, 20, text_main, style, line_spacing=1.5)

    # 矢印
    arrow = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW,
                                   Inches(6.5), Inches(4.0),
                                   Inches(0.6), Inches(1.0))
    arrow.fill.solid()
    arrow.fill.fore_color.rgb = hex_to_rgb(accent)
    arrow.line.fill.background()

    # After
    ax, aw = Inches(7.3), Inches(5.5)
    add_solid_rect(slide, ax, Inches(2.3), aw, Inches(4.5), positive)
    add_text_box(slide, ax, Inches(2.5), aw, Inches(0.5),
                 "AFTER", 22, "#FFFFFF", style,
                 bold=True, align=PP_ALIGN.CENTER, font_key="en_heading")
    after_lines = slide_spec.get("After", "").split(chr(10)) if slide_spec.get("After") else []
    if after_lines:
        add_multiline(slide, ax + Inches(0.3), Inches(3.2),
                      aw - Inches(0.6), Inches(3.3),
                      after_lines, 20, "#FFFFFF", style, line_spacing=1.5)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_big_number_slide(prs, slide_spec, style, tracker):
    """Type G: 強調数字"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")
    text_main = style["colors"].get("text_main", "#2D3748")

    if slide_spec.get("リード"):
        add_text_box(slide, Inches(0.8), Inches(1.2),
                     prs_w - Inches(1.6), Inches(0.7),
                     slide_spec["リード"], 22, text_main, style,
                     align=PP_ALIGN.CENTER)

    # 強調数字
    big_size = style.get("font_sizes", {}).get("emphasis_number", 160)
    add_text_box(slide, Inches(0.5), Inches(2.3),
                 prs_w - Inches(1.0), Inches(3.0),
                 slide_spec.get("数字", ""), big_size, accent, style,
                 bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="en_heading")

    # 説明
    if slide_spec.get("説明"):
        add_text_box(slide, Inches(0.8), Inches(5.5),
                     prs_w - Inches(1.6), Inches(0.9),
                     slide_spec["説明"], 28, primary, style,
                     bold=True, align=PP_ALIGN.CENTER, font_key="ja_heading")

    if slide_spec.get("出典"):
        add_text_box(slide, Inches(0.8), Inches(6.7),
                     prs_w - Inches(1.6), Inches(0.3),
                     "出典：" + slide_spec["出典"], 11,
                     style["colors"].get("text_sub", "#666"), style,
                     align=PP_ALIGN.CENTER)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_case_study_slide(prs, slide_spec, style, tracker):
    """Type H: 事例"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")
    text_main = style["colors"].get("text_main", "#2D3748")
    positive = "#38A169"

    # 上部バナー
    add_solid_rect(slide, 0, 0, prs_w, Inches(1.3), primary)
    add_text_box(slide, Inches(0.8), Inches(0.25),
                 prs_w - Inches(1.6), Inches(0.4),
                 "CASE STUDY", 13, accent, style,
                 bold=True, font_key="en_heading")
    add_text_box(slide, Inches(0.8), Inches(0.55),
                 prs_w - Inches(1.6), Inches(0.7),
                 slide_spec.get("企業情報", ""), 24, "#FFFFFF", style,
                 bold=True, font_key="ja_heading")

    # 課題
    add_text_box(slide, Inches(0.8), Inches(1.7),
                 Inches(5.5), Inches(0.5),
                 "課題", 16, "#666666", style, bold=True)
    challenge = slide_spec.get("課題", "").split(chr(10))
    if challenge:
        add_multiline(slide, Inches(0.8), Inches(2.2),
                      Inches(5.5), Inches(2.5),
                      challenge, 18, text_main, style, line_spacing=1.5)

    # 結果（右）
    add_text_box(slide, Inches(6.5), Inches(1.7),
                 Inches(6.0), Inches(0.5),
                 "結果", 16, accent, style, bold=True)

    if slide_spec.get("指標"):
        add_text_box(slide, Inches(6.5), Inches(2.2),
                     Inches(6.0), Inches(1.5),
                     slide_spec["指標"], 56, positive, style,
                     bold=True, align=PP_ALIGN.LEFT, font_key="en_heading")

    if slide_spec.get("結果説明"):
        add_multiline(slide, Inches(6.5), Inches(3.9),
                      Inches(6.0), Inches(2.5),
                      slide_spec["結果説明"].split(chr(10)),
                      18, text_main, style, line_spacing=1.5)

    # 学び
    if slide_spec.get("学び"):
        add_solid_rect(slide, Inches(0.8), Inches(6.4),
                       prs_w - Inches(1.6), Inches(0.6),
                       style["colors"].get("background_sub", "#F0F0F0"))
        add_text_box(slide, Inches(1.0), Inches(6.45),
                     prs_w - Inches(2.0), Inches(0.5),
                     "学び：" + slide_spec["学び"], 16, primary, style,
                     bold=True, anchor=MSO_ANCHOR.MIDDLE)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_key_message_slide(prs, slide_spec, style, tracker):
    """Type I: キーメッセージ"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")

    # 全面プライマリ色背景
    add_solid_rect(slide, 0, 0, prs_w, prs_h, primary)

    # 装飾線
    add_solid_rect(slide, Inches(5.0), Inches(2.0), Inches(3.33), Emu(80000), accent)

    # メッセージ
    msg = slide_spec.get("メッセージ", "") or slide_spec.get("フレーズ", "")
    msg_size = calc_dynamic_font_size(msg, 56, max_chars_at_base=18, min_size=32)
    add_text_box(slide, Inches(0.5), Inches(2.5),
                 prs_w - Inches(1.0), Inches(3.0),
                 msg, msg_size, "#FFFFFF", style,
                 bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="ja_heading")

    if slide_spec.get("サブメッセージ"):
        add_text_box(slide, Inches(0.5), Inches(5.7),
                     prs_w - Inches(1.0), Inches(0.8),
                     slide_spec["サブメッセージ"], 24, accent, style,
                     align=PP_ALIGN.CENTER)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_quick_question_slide(prs, slide_spec, style, tracker):
    """問いかけ"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")

    add_solid_rect(slide, Inches(5.5), Inches(2.0), Inches(2.33), Emu(80000), accent)

    add_text_box(slide, Inches(0.5), Inches(2.4),
                 prs_w - Inches(1.0), Inches(0.6),
                 "QUESTION", 22, accent, style,
                 bold=True, align=PP_ALIGN.CENTER, font_key="en_heading")

    q = slide_spec.get("質問", "")
    q_size = calc_dynamic_font_size(q, 40, max_chars_at_base=18, min_size=24)
    add_text_box(slide, Inches(0.8), Inches(3.2),
                 prs_w - Inches(1.6), Inches(2.5),
                 q, q_size, primary, style,
                 bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="ja_heading")

    if slide_spec.get("サブテキスト"):
        add_text_box(slide, Inches(0.8), Inches(5.9),
                     prs_w - Inches(1.6), Inches(0.6),
                     slide_spec["サブテキスト"], 18,
                     style["colors"].get("text_sub", "#666"), style,
                     align=PP_ALIGN.CENTER)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_catchphrase_slide(prs, slide_spec, style, tracker):
    """決め台詞"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")

    add_solid_rect(slide, 0, 0, prs_w, prs_h, primary)
    add_solid_rect(slide, Inches(1.5), Inches(2.5), Emu(60000), Inches(2.5), accent)
    add_solid_rect(slide, prs_w - Inches(1.55), Inches(2.5),
                   Emu(60000), Inches(2.5), accent)

    phrase = slide_spec.get("フレーズ", "")
    phrase_size = calc_dynamic_font_size(phrase, 56, max_chars_at_base=14, min_size=32)
    add_text_box(slide, Inches(0.5), Inches(2.5),
                 prs_w - Inches(1.0), Inches(2.5),
                 phrase, phrase_size, "#FFFFFF", style,
                 bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="ja_heading")

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_quote_slide(prs, slide_spec, style, tracker):
    """引用"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")
    text_sub = style["colors"].get("text_sub", "#666666")

    # 引用記号風装飾
    add_solid_rect(slide, Inches(0.7), Inches(0.9), Inches(0.8), Inches(0.15), accent)
    add_solid_rect(slide, Inches(0.7), Inches(1.15), Inches(0.4), Inches(0.15), accent)

    quote = "「" + slide_spec.get("引用", "") + "」"
    q_size = calc_dynamic_font_size(quote, 36, max_chars_at_base=22, min_size=24)
    add_text_box(slide, Inches(1.0), Inches(2.0),
                 prs_w - Inches(2.0), Inches(3.5),
                 quote, q_size, primary, style,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="ja_heading")

    add_solid_rect(slide, Inches(5.5), Inches(5.8), Inches(2.33), Emu(40000), accent)

    if slide_spec.get("発言者"):
        add_text_box(slide, Inches(1.0), Inches(6.0),
                     prs_w - Inches(2.0), Inches(0.5),
                     "— " + slide_spec["発言者"], 20, text_sub, style,
                     align=PP_ALIGN.CENTER)

    if slide_spec.get("文脈"):
        add_text_box(slide, Inches(1.0), Inches(6.6),
                     prs_w - Inches(2.0), Inches(0.4),
                     slide_spec["文脈"], 14, text_sub, style,
                     align=PP_ALIGN.CENTER)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_number_compare_slide(prs, slide_spec, style, tracker):
    """数値対比"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")
    text_main = style["colors"].get("text_main", "#2D3748")
    text_sub = style["colors"].get("text_sub", "#666")
    positive = "#38A169"

    if slide_spec.get("タイトル"):
        add_text_box(slide, Inches(0.8), Inches(0.8),
                     prs_w - Inches(1.6), Inches(0.8),
                     slide_spec["タイトル"], 26, primary, style,
                     bold=True, align=PP_ALIGN.CENTER, font_key="ja_heading")

    # 左
    lx, lw = Inches(0.8), Inches(5.5)
    add_text_box(slide, lx, Inches(2.2), lw, Inches(0.6),
                 slide_spec.get("左ラベル", "BEFORE"), 22, text_sub, style,
                 bold=True, align=PP_ALIGN.CENTER, font_key="en_heading")
    add_text_box(slide, lx, Inches(3.0), lw, Inches(2.5),
                 slide_spec.get("左", ""), 110, text_main, style,
                 bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="en_heading")

    # 矢印
    arrow = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW,
                                   Inches(6.5), Inches(3.8),
                                   Inches(0.6), Inches(1.0))
    arrow.fill.solid()
    arrow.fill.fore_color.rgb = hex_to_rgb(accent)
    arrow.line.fill.background()

    # 右
    rx, rw = Inches(7.3), Inches(5.5)
    add_text_box(slide, rx, Inches(2.2), rw, Inches(0.6),
                 slide_spec.get("右ラベル", "AFTER"), 22, accent, style,
                 bold=True, align=PP_ALIGN.CENTER, font_key="en_heading")
    add_text_box(slide, rx, Inches(3.0), rw, Inches(2.5),
                 slide_spec.get("右", ""), 110, positive, style,
                 bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
                 font_key="en_heading")

    if slide_spec.get("補足"):
        add_text_box(slide, Inches(0.8), Inches(6.5),
                     prs_w - Inches(1.6), Inches(0.5),
                     slide_spec["補足"], 16, text_sub, style,
                     align=PP_ALIGN.CENTER)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_cta_slide(prs, slide_spec, style, tracker):
    """CTA（QRコード付き）"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    apply_all_decorations(slide, style, prs_w, prs_h, page_type="content",
                          section_label=tracker.get_label())

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")
    text_main = style["colors"].get("text_main", "#2D3748")
    text_sub = style["colors"].get("text_sub", "#666")

    add_text_box(slide, Inches(0.8), Inches(0.8),
                 prs_w - Inches(1.6), Inches(1.0),
                 slide_spec.get("タイトル", ""), 32, primary, style,
                 bold=True, align=PP_ALIGN.CENTER, font_key="ja_heading")
    add_solid_rect(slide, Inches(5.5), Inches(1.85), Inches(2.0), Emu(60000), accent)

    qr_size = Inches(3.2)
    qr_x = (prs_w - qr_size) / 2

    if slide_spec.get("URL"):
        try:
            import qrcode
            qr = qrcode.QRCode(version=1, box_size=10, border=2)
            qr.add_data(slide_spec["URL"])
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_path = Path(__file__).parent / "tmp" / f"qr_{id(slide_spec)}.png"
            qr_path.parent.mkdir(parents=True, exist_ok=True)
            qr_img.save(qr_path)
            slide.shapes.add_picture(str(qr_path), qr_x, Inches(2.3),
                                     width=qr_size, height=qr_size)
        except Exception as e:
            print(f"[警告] QRコード生成失敗: {e}")

    if slide_spec.get("アクション"):
        add_text_box(slide, Inches(0.8), Inches(5.8),
                     prs_w - Inches(1.6), Inches(0.7),
                     slide_spec["アクション"], 22, text_main, style,
                     bold=True, align=PP_ALIGN.CENTER)

    if slide_spec.get("補足"):
        add_text_box(slide, Inches(0.8), Inches(6.6),
                     prs_w - Inches(1.6), Inches(0.5),
                     slide_spec["補足"], 16, text_sub, style,
                     align=PP_ALIGN.CENTER)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_visual_punch_slide(prs, slide_spec, style, tracker):
    """画像パンチ"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    primary = style["colors"].get("primary", "#1A365D")
    accent = style["colors"].get("accent", "#ED8936")

    add_solid_rect(slide, 0, 0, prs_w, prs_h, primary)

    img_x, img_y = Inches(0.5), Inches(1.0)
    img_w, img_h = Inches(6.0), Inches(5.5)

    if slide_spec.get("画像パス"):
        try:
            slide.shapes.add_picture(slide_spec["画像パス"], img_x, img_y,
                                     width=img_w, height=img_h)
        except Exception:
            pass
    else:
        ph = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
                                    img_x, img_y, img_w, img_h)
        ph.fill.solid()
        ph.fill.fore_color.rgb = hex_to_rgb(accent)
        ph.line.fill.background()
        if slide_spec.get("画像プロンプト"):
            add_text_box(slide, img_x + Inches(0.3), img_y + Inches(2.5),
                         img_w - Inches(0.6), Inches(1.0),
                         "[画像]\n" + slide_spec["画像プロンプト"], 14,
                         "#FFFFFF", style, align=PP_ALIGN.CENTER,
                         anchor=MSO_ANCHOR.MIDDLE)

    text_x, text_w = Inches(7.0), Inches(6.0)
    add_text_box(slide, text_x, Inches(2.5), text_w, Inches(2.5),
                 slide_spec.get("短文", ""), 46, "#FFFFFF", style,
                 bold=True, anchor=MSO_ANCHOR.MIDDLE, font_key="ja_heading")
    add_solid_rect(slide, text_x, Inches(5.2), Inches(1.0), Emu(80000), accent)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide


def build_diagram_slide(prs, slide_spec, style, tracker):
    """Type X: 図解スライド（SVG装飾＋テキストオーバーレイ分離）"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    prs_w, prs_h = prs.slide_width, prs.slide_height

    # 図解スライドは画像が主役。装飾は背景＋上端バー＋ナビのみに限定
    from style_engine import apply_background, apply_left_top_nav
    apply_background(slide, style, prs_w, prs_h, page_type="content")

    # 上端の細いアクセントバー
    _accent_for_bar = style["colors"].get("accent", "#ED8936")
    add_solid_rect(slide, 0, 0, prs_w, Inches(0.15), _accent_for_bar)

    apply_left_top_nav(slide, style, tracker.get_label(), prs_w)

    is_dark = style.get("mode") == "dark"
    primary_color = style["colors"].get("text_main") if is_dark else style["colors"]["primary"]
    accent = style["colors"].get("accent", "#ED8936")

    # タイトル
    title_text = slide_spec.get("タイトル", "")
    if title_text:
        title_size = calc_dynamic_font_size(title_text, 30, max_chars_at_base=24, min_size=22)
        add_text_box(slide, Inches(0.8), Inches(0.6),
                     prs_w - Inches(1.6), Inches(0.8),
                     title_text, title_size, primary_color, style,
                     bold=True, font_key="ja_heading")
        add_solid_rect(slide, Inches(0.8), Inches(1.4), Inches(1.5), Emu(60000), accent)

    # 図解生成
    if slide_spec.get("図解"):
        try:
            tmp_dir = Path(__file__).parent / "tmp_diagrams"
            result = make_diagram_for_slide(slide_spec, style, tmp_dir)

            if result and result.get("png_path"):
                from PIL import Image
                img = Image.open(result["png_path"])
                aspect = img.width / img.height

                max_w = prs_w - Inches(1.6)
                max_h = Inches(5.2)

                if max_w / aspect <= max_h:
                    actual_w = int(max_w)
                    actual_h = int(max_w / aspect)
                else:
                    actual_h = int(max_h)
                    actual_w = int(max_h * aspect)

                img_x = int((prs_w - actual_w) / 2)
                img_y = int(Inches(1.7))

                # 1. SVG画像を埋込
                slide.shapes.add_picture(result["png_path"], img_x, img_y,
                                        width=actual_w, height=actual_h)

                # 2. テキストオーバーレイをスライド絶対座標に変換して配置
                svg_w = result["svg_width"]
                svg_h = result["svg_height"]
                scale_x = actual_w / svg_w
                scale_y = actual_h / svg_h

                for overlay in result.get("text_overlays", []):
                    abs_x = int(img_x + overlay["x"] * scale_x)
                    abs_y = int(img_y + overlay["y"] * scale_y)
                    abs_w = int(overlay["w"] * scale_x)
                    abs_h = int(overlay["h"] * scale_y)

                    # フォントサイズの正しいスケール
                    # actual_w (EMU) を inch に: /914400
                    # svg_w を inch に（SVGは96DPI仮定）: /96
                    # 比率
                    actual_w_inch = actual_w / 914400.0
                    svg_w_inch = svg_w / 96.0
                    display_ratio = actual_w_inch / svg_w_inch
                    scaled_font_size = max(int(overlay["font_size"] * display_ratio), 10)

                    align_map = {
                        "left": PP_ALIGN.LEFT,
                        "center": PP_ALIGN.CENTER,
                        "right": PP_ALIGN.RIGHT,
                    }
                    anchor_map = {
                        "top": MSO_ANCHOR.TOP,
                        "middle": MSO_ANCHOR.MIDDLE,
                        "bottom": MSO_ANCHOR.BOTTOM,
                    }

                    add_text_box(
                        slide, abs_x, abs_y, abs_w, abs_h,
                        overlay["text"], scaled_font_size, overlay["color"], style,
                        bold=overlay.get("bold", False),
                        align=align_map.get(overlay.get("align", "left"), PP_ALIGN.LEFT),
                        anchor=anchor_map.get(overlay.get("anchor", "top"), MSO_ANCHOR.TOP),
                        font_key=overlay.get("font_key", "ja_body")
                    )

        except Exception as e:
            sn = slide_spec.get("番号")
            print(f"[警告] 図解生成失敗（スライド{sn}）: {e}")
            import traceback
            traceback.print_exc()

    # キャプション
    if slide_spec.get("キャプション"):
        add_text_box(slide, Inches(0.8), Inches(7.0),
                     prs_w - Inches(1.6), Inches(0.4),
                     slide_spec["キャプション"], 14,
                     style["colors"].get("text_sub", "#666"), style,
                     align=PP_ALIGN.CENTER)

    add_speaker_notes(slide, slide_spec.get("スピーカーノート", ""))
    return slide



# ===== ページタイプ → ビルダーマッピング =====

PAGE_BUILDERS = {
    "タイトル": build_title_slide,
    "title": build_title_slide,
    "章扉": build_section_slide,
    "section": build_section_slide,
    "コンテンツ": build_content_slide,
    "content": build_content_slide,
    "メッセージ": build_content_slide,
    "データ": build_data_slide,
    "data": build_data_slide,
    "グラフ": build_data_slide,
    "3カラム": build_three_column_slide,
    "three_column": build_three_column_slide,
    "Before/After": build_before_after_slide,
    "before_after": build_before_after_slide,
    "BeforeAfter": build_before_after_slide,
    "強調数字": build_big_number_slide,
    "big_number": build_big_number_slide,
    "事例": build_case_study_slide,
    "case_study": build_case_study_slide,
    "キーメッセージ": build_key_message_slide,
    "key_message": build_key_message_slide,
    "CTA": build_cta_slide,
    "cta": build_cta_slide,
    "問いかけ": build_quick_question_slide,
    "quick_question": build_quick_question_slide,
    "決め台詞": build_catchphrase_slide,
    "catchphrase": build_catchphrase_slide,
    "引用": build_quote_slide,
    "quote": build_quote_slide,
    "数値対比": build_number_compare_slide,
    "number_compare": build_number_compare_slide,
    "画像パンチ": build_visual_punch_slide,
    "visual_punch": build_visual_punch_slide,
    # v4.1：図解レイアウト
    "図解": build_diagram_slide,
    "diagram": build_diagram_slide,
}


# ===== 台本パーサー（Phase A 機能継承）=====

def parse_script_md(script_path):
    if not script_path:
        return {}
    p = Path(script_path)
    if not p.exists():
        print(f"[警告] 台本ファイル {script_path} が見つかりません")
        return {}

    notes = {}
    current_slide = None
    current_section = None
    sections = {"speech": [], "pause": [], "intonation": []}

    def finalize():
        nonlocal current_slide
        if current_slide is None:
            return
        speech = chr(10).join(s.rstrip() for s in sections["speech"] if s.strip()).strip()
        pause = " ".join(s.strip() for s in sections["pause"] if s.strip()).strip()
        intonation = " ".join(s.strip() for s in sections["intonation"] if s.strip()).strip()
        text = ""
        if speech:
            text += speech
        if pause or intonation:
            text += chr(10) + chr(10) + "──── 演出 ────"
            if pause:
                text += chr(10) + f"間：{pause}"
            if intonation:
                text += chr(10) + f"抑揚：{intonation}"
        notes[current_slide] = text.strip()

    section_patterns = [
        ("speech", re.compile(r"^\*\*話す内容[^*]*\*\*\s*(.*)$")),
        ("pause", re.compile(r"^\*\*間指示[^*]*\*\*\s*(.*)$")),
        ("intonation", re.compile(r"^\*\*抑揚指示[^*]*\*\*\s*(.*)$")),
    ]
    slide_pattern = re.compile(r"^###\s+スライド(\d+)")

    with open(p, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.rstrip("\n")
            m = slide_pattern.match(line)
            if m:
                finalize()
                current_slide = int(m.group(1))
                current_section = None
                sections = {"speech": [], "pause": [], "intonation": []}
                continue
            matched = False
            for sec_name, pattern in section_patterns:
                m = pattern.match(line)
                if m:
                    current_section = sec_name
                    inline = m.group(1).strip()
                    if inline:
                        sections[sec_name].append(inline)
                    matched = True
                    break
            if matched:
                continue
            if line.strip() == "---":
                current_section = None
                continue
            if current_section and current_slide is not None:
                if line.strip():
                    sections[current_section].append(line)

    finalize()
    return notes





def add_speaker_notes(slide, notes_text):
    if not notes_text:
        return
    notes_slide = slide.notes_slide
    notes_slide.notes_text_frame.text = notes_text


# ===== バリデーション =====

CLICHE_PATTERNS = [
    "が変わる日", "正解は", "最初の一歩", "決断した日",
    "変える日", "未来は今日", "あなたならできる",
    "まず1つ試してみよう",
]


def validate_slide(slide_spec, style):
    issues = []
    minimum_body = style.get("font_sizes", {}).get("body_minimum", 22)

    body = slide_spec.get("本文", "") or ""
    if isinstance(body, str) and body:
        if body.count(chr(10)) + 1 > 5:
            issues.append(f"スライド{slide_spec.get('番号')}: 本文6行以上")

    title = slide_spec.get("タイトル", "")
    if isinstance(title, str) and len(title) > 30:
        issues.append(f"スライド{slide_spec.get('番号')}: タイトル{len(title)}文字>30（自動縮小）")

    full_text = title + " " + body
    for c in CLICHE_PATTERNS:
        if c in full_text:
            issues.append(f"スライド{slide_spec.get('番号')}: クリシェ '{c}' 検出")

    return issues


# ===== メインビルド =====

def build_presentation(spec, style, output_path, script_notes=None):
    if script_notes is None:
        script_notes = {}

    prs = Presentation()
    prs.slide_width = Inches(style["layout"]["width_inches"])
    prs.slide_height = Inches(style["layout"]["height_inches"])

    log = {
        "案件ID": spec.get("案件ID", "UNKNOWN"),
        "スタイル": style.get("name", "?"),
        "スライド数": len(spec.get("スライド", [])),
        "ビルド成功": 0, "ビルド失敗": 0,
        "ノート上書き": 0,
        "警告": [], "エラー": [],
    }

    tracker = SectionTracker()
    notes_overridden = 0

    for slide_spec in spec.get("スライド", []):
        # 章番号を tracker に反映
        tracker.update(slide_spec)

        # 台本ノート上書き
        slide_num = slide_spec.get("番号")
        if slide_num in script_notes and script_notes[slide_num]:
            slide_spec = dict(slide_spec)
            slide_spec["スピーカーノート"] = script_notes[slide_num]
            notes_overridden += 1

        slide_type = slide_spec.get("タイプ", "コンテンツ")
        builder = PAGE_BUILDERS.get(slide_type, build_content_slide)

        issues = validate_slide(slide_spec, style)
        if issues:
            log["警告"].extend(issues)

        try:
            builder(prs, slide_spec, style, tracker)
            log["ビルド成功"] += 1
        except Exception as e:
            log["ビルド失敗"] += 1
            log["エラー"].append(f"スライド{slide_spec.get('番号')}: {e}")
            print(f"[エラー] スライド{slide_spec.get('番号')}: {e}")

    log["ノート上書き"] = notes_overridden
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    prs.save(output_path)
    return log


def write_build_log(log, output_dir):
    log_path = Path(output_dir) / "slide-build-log.md"
    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"# Slide Build Log v4\n\n")
        f.write(f"## 案件ID：{log['案件ID']}\n")
        f.write(f"## スタイル：{log['スタイル']}\n")
        f.write(f"## スライド数：{log['スライド数']}枚\n")
        f.write(f"## ビルド成功：{log['ビルド成功']}枚 / 失敗：{log['ビルド失敗']}枚\n")
        f.write(f"## スピーカーノート上書き：{log.get('ノート上書き', 0)}枚\n\n")
        if log["警告"]:
            f.write("## 警告\n")
            for w in log["警告"]:
                f.write(f"- {w}\n")
            f.write("\n")
        if log["エラー"]:
            f.write("## エラー\n")
            for e in log["エラー"]:
                f.write(f"- {e}\n")
            f.write("\n")
        if not log["警告"] and not log["エラー"]:
            f.write("## チェック結果\n- クリーンビルド完了。\n")
    return log_path


def main():
    parser = argparse.ArgumentParser(description="Slide Builder v4")
    parser.add_argument("--spec", required=True)
    parser.add_argument("--style", default="luminous_dark_modern",
                        help="スタイル名（rough_chic_ink/dynamic_business_clean/refined_minimal_portfolio/clean_sustainable_circle/luminous_dark_modern または旧来の corporate/industrial/warm）")
    parser.add_argument("--output", required=True)
    parser.add_argument("--styles-dir", default="templates/design-styles")
    parser.add_argument("--script", default=None)
    args = parser.parse_args()

    script_dir = Path(__file__).parent
    sys.path.insert(0, str(script_dir))

    styles_dir = Path(args.styles_dir)
    if not styles_dir.is_absolute():
        styles_dir = script_dir.parent / args.styles_dir

    print(f"[INFO] スタイル: {args.style}")
    style = load_style(args.style, styles_dir)

    print(f"[INFO] スペック: {args.spec}")
    spec = load_spec(args.spec)

    script_notes = {}
    if args.script:
        print(f"[INFO] 台本: {args.script}")
        script_notes = parse_script_md(args.script)
        print(f"[INFO] {len(script_notes)} スライド分の台本を取得")

    print(f"[INFO] ビルド開始（{len(spec.get('スライド', []))}枚）...")
    log = build_presentation(spec, style, args.output, script_notes=script_notes)
    log_path = write_build_log(log, Path(args.output).parent)

    print(f"[完了] {args.output}")
    print(f"  成功: {log['ビルド成功']}/{log['スライド数']}")
    print(f"  ノート上書き: {log.get('ノート上書き', 0)}")
    print(f"  警告: {len(log['警告'])} / エラー: {len(log['エラー'])}")
    return 0 if log["ビルド失敗"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
