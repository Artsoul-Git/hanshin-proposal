"""
Diagram Engine v2 - SVG（絵のみ）+ テキストオーバーレイ分離アーキテクチャ

文字化け問題の根本解決：
- SVG は装飾要素（円・矩形・矢印・線・グラデーション等）のみを生成
- テキストは text_overlays として座標情報付きで返却
- python-pptx 側で Yu Gothic / Noto Sans JP 等で別レイヤーとして配置

各図解関数の戻り値：
{
    "png_path": "...",         # SVG → PNG ファイルパス
    "svg_width": 1600,          # SVGのキャンバス幅
    "svg_height": 800,          # SVGのキャンバス高
    "text_overlays": [
        {
            "x": 100, "y": 200, "w": 400, "h": 60,
            "text": "...",
            "font_size": 28,
            "color": "#FFFFFF",
            "bold": True,
            "align": "center",  # left/center/right
            "anchor": "middle", # top/middle/bottom
            "font_key": "ja_heading"
        },
        ...
    ]
}
"""

from pathlib import Path
import math
try:
    import cairosvg
    _CAIRO_AVAILABLE = True
except (ImportError, OSError):
    cairosvg = None
    _CAIRO_AVAILABLE = False


# ===== カラーパレット解決 =====

def get_colors_from_style(style):
    colors = style.get("colors", {})
    return {
        "primary": colors.get("primary", "#1A365D"),
        "secondary": colors.get("secondary", "#3182CE"),
        "accent": colors.get("accent", "#ED8936"),
        "accent2": colors.get("accent2", colors.get("accent", "#ED8936")),
        "positive": colors.get("positive", "#38A169"),
        "negative": colors.get("negative", "#E53E3E"),
        "text_main": colors.get("text_main", "#2D3748"),
        "text_sub": colors.get("text_sub", "#718096"),
        "bg": colors.get("background_default", "#FFFFFF"),
        "bg_sub": colors.get("background_sub", "#F7FAFC"),
        "divider": colors.get("divider", "#E2E8F0"),
    }


# ===== SVG ヘルパー =====

def svg_header(width, height, bg_color="#FFFFFF"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
<rect width="{width}" height="{height}" fill="{bg_color}"/>
<defs>
  <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="3" orient="auto">
    <polygon points="0,0 10,3 0,6" fill="currentColor"/>
  </marker>
  <marker id="arrow_lg" markerWidth="20" markerHeight="20" refX="18" refY="5" orient="auto">
    <polygon points="0,0 18,5 0,10" fill="currentColor"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.15"/>
  </filter>
</defs>'''


def svg_to_png(svg_content, output_path, width=1600):
    if not _CAIRO_AVAILABLE:
        return None
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    png_data = cairosvg.svg2png(
        bytestring=svg_content.encode("utf-8"),
        output_width=width
    )
    with open(output_path, "wb") as f:
        f.write(png_data)
    return str(output_path)


# ===== 各種図解関数 =====

def make_process_flow(steps, style, output_path, accent_in_middle=True):
    """プロセスフロー図"""
    c = get_colors_from_style(style)
    n = len(steps)
    box_w, box_h, gap = 280, 160, 60
    width = n * box_w + (n - 1) * gap + 80
    height = 280

    svg = svg_header(width, height, c["bg"])
    box_y = (height - box_h) // 2
    overlays = []

    for i, step in enumerate(steps):
        x = 40 + i * (box_w + gap)

        if accent_in_middle and i == n // 2:
            fill_color = c["accent"]
            text_color = "#FFFFFF"
            number_color = "#FFFFFF"
        else:
            fill_color = c["primary"]
            text_color = "#FFFFFF"
            number_color = c["accent"]

        svg += f'<rect x="{x}" y="{box_y}" width="{box_w}" height="{box_h}" fill="{fill_color}" rx="12" filter="url(#shadow)"/>\n'

        # ステップ番号（テキストオーバーレイ）
        overlays.append({
            "x": x + 20, "y": box_y + 20, "w": 80, "h": 60,
            "text": f"{i + 1:02d}", "font_size": 48, "color": number_color,
            "bold": True, "align": "left", "anchor": "top", "font_key": "en_heading"
        })

        # ラベル
        overlays.append({
            "x": x + 10, "y": box_y + 90, "w": box_w - 20, "h": 36,
            "text": step["label"], "font_size": 22, "color": text_color,
            "bold": True, "align": "center", "anchor": "middle", "font_key": "ja_heading"
        })

        # 説明
        if step.get("desc"):
            overlays.append({
                "x": x + 10, "y": box_y + 125, "w": box_w - 20, "h": 30,
                "text": step["desc"], "font_size": 14, "color": text_color,
                "bold": False, "align": "center", "anchor": "middle", "font_key": "ja_body"
            })

        # 矢印
        if i < n - 1:
            ax_start = x + box_w + 6
            ax_end = ax_start + gap - 16
            mid_y = box_y + box_h // 2
            svg += f'<g style="color:{c["accent"]}">\n'
            svg += f'<line x1="{ax_start}" y1="{mid_y}" x2="{ax_end}" y2="{mid_y}" stroke="{c["accent"]}" stroke-width="6" marker-end="url(#arrow_lg)"/>\n'
            svg += '</g>\n'

    svg += "</svg>"
    svg_to_png(svg, output_path, width=1600)

    return {
        "png_path": str(output_path),
        "svg_width": width,
        "svg_height": height,
        "text_overlays": overlays,
    }


def make_comparison_visual(left_data, right_data, style, output_path):
    """視覚的比較"""
    c = get_colors_from_style(style)
    width, height = 1600, 700

    svg = svg_header(width, height, c["bg"])
    overlays = []

    # 左
    left_color = c.get(left_data.get("color", "negative"), c["text_sub"])
    svg += f'<rect x="60" y="60" width="660" height="580" fill="{c["bg_sub"]}" stroke="{c["divider"]}" stroke-width="2" rx="20"/>\n'
    svg += f'<rect x="60" y="60" width="660" height="80" fill="{left_color}" rx="20"/>\n'
    svg += f'<rect x="60" y="120" width="660" height="20" fill="{left_color}"/>\n'

    overlays.append({
        "x": 60, "y": 75, "w": 660, "h": 50,
        "text": left_data["label"], "font_size": 32, "color": "#FFFFFF",
        "bold": True, "align": "center", "anchor": "middle", "font_key": "en_heading"
    })
    overlays.append({
        "x": 60, "y": 170, "w": 660, "h": 50,
        "text": left_data["title"], "font_size": 26, "color": c["text_main"],
        "bold": True, "align": "center", "anchor": "middle", "font_key": "ja_heading"
    })

    for i, item in enumerate(left_data.get("items", [])):
        y = 270 + i * 70
        svg += f'<circle cx="120" cy="{y + 20}" r="8" fill="{left_color}"/>\n'
        overlays.append({
            "x": 145, "y": y, "w": 560, "h": 40,
            "text": item, "font_size": 20, "color": c["text_main"],
            "bold": False, "align": "left", "anchor": "middle", "font_key": "ja_body"
        })

    # 矢印
    arrow_color = c["accent"]
    svg += f'<g style="color:{arrow_color}">\n'
    svg += f'<line x1="760" y1="350" x2="840" y2="350" stroke="{arrow_color}" stroke-width="10" marker-end="url(#arrow_lg)"/>\n'
    svg += '</g>\n'

    # 右
    right_color = c.get(right_data.get("color", "positive"), c["accent"])
    svg += f'<rect x="880" y="60" width="660" height="580" fill="{right_color}" rx="20" filter="url(#shadow)"/>\n'

    overlays.append({
        "x": 880, "y": 75, "w": 660, "h": 50,
        "text": right_data["label"], "font_size": 32, "color": "#FFFFFF",
        "bold": True, "align": "center", "anchor": "middle", "font_key": "en_heading"
    })
    svg += f'<rect x="900" y="160" width="620" height="3" fill="#FFFFFF" opacity="0.5"/>\n'
    overlays.append({
        "x": 880, "y": 195, "w": 660, "h": 50,
        "text": right_data["title"], "font_size": 26, "color": "#FFFFFF",
        "bold": True, "align": "center", "anchor": "middle", "font_key": "ja_heading"
    })

    for i, item in enumerate(right_data.get("items", [])):
        y = 290 + i * 70
        svg += f'<circle cx="940" cy="{y + 20}" r="8" fill="#FFFFFF"/>\n'
        overlays.append({
            "x": 965, "y": y, "w": 555, "h": 40,
            "text": item, "font_size": 20, "color": "#FFFFFF",
            "bold": False, "align": "left", "anchor": "middle", "font_key": "ja_body"
        })

    svg += "</svg>"
    svg_to_png(svg, output_path, width=width)

    return {
        "png_path": str(output_path),
        "svg_width": width,
        "svg_height": height,
        "text_overlays": overlays,
    }


def make_stat_highlight(number, label, context, style, output_path, sub_stat=None):
    """統計強調図"""
    c = get_colors_from_style(style)
    width, height = 1600, 800

    svg = svg_header(width, height, c["bg"])
    overlays = []

    # 装飾：シンプルにアクセントライン1本だけ
    svg += f'<line x1="100" y1="180" x2="280" y2="180" stroke="{c["accent"]}" stroke-width="6"/>\n'

    # コンテキスト
    if context:
        overlays.append({
            "x": 100, "y": 210, "w": 1400, "h": 50,
            "text": context, "font_size": 24, "color": c["text_sub"],
            "bold": False, "align": "left", "anchor": "top", "font_key": "ja_body"
        })

    # 巨大数字
    overlays.append({
        "x": 100, "y": 280, "w": 1400, "h": 230,
        "text": str(number), "font_size": 200, "color": c["accent"],
        "bold": True, "align": "left", "anchor": "top", "font_key": "en_heading"
    })

    # ラベル
    overlays.append({
        "x": 100, "y": 540, "w": 1400, "h": 80,
        "text": label, "font_size": 40, "color": c["primary"],
        "bold": True, "align": "left", "anchor": "top", "font_key": "ja_heading"
    })

    # サブ
    if sub_stat:
        svg += f'<rect x="100" y="660" width="700" height="80" fill="{c["primary"]}" rx="8"/>\n'
        overlays.append({
            "x": 120, "y": 660, "w": 660, "h": 80,
            "text": sub_stat, "font_size": 22, "color": "#FFFFFF",
            "bold": False, "align": "left", "anchor": "middle", "font_key": "ja_body"
        })

    svg += "</svg>"
    svg_to_png(svg, output_path, width=width)

    return {
        "png_path": str(output_path),
        "svg_width": width,
        "svg_height": height,
        "text_overlays": overlays,
    }


def make_concept_diagram(center, related, style, output_path):
    """概念図"""
    c = get_colors_from_style(style)
    width, height = 1600, 800

    svg = svg_header(width, height, c["bg"])
    overlays = []
    cx, cy = width // 2, height // 2

    # 中心円
    svg += f'<circle cx="{cx}" cy="{cy}" r="160" fill="{c["primary"]}" filter="url(#shadow)"/>\n'
    overlays.append({
        "x": cx - 150, "y": cy - 30, "w": 300, "h": 60,
        "text": center, "font_size": 36, "color": "#FFFFFF",
        "bold": True, "align": "center", "anchor": "middle", "font_key": "ja_heading"
    })

    # 周辺
    n = len(related)
    radius = 320
    for i, item in enumerate(related):
        angle = -math.pi / 2 + (2 * math.pi * i / n)
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)

        # 線
        ls_x = cx + 160 * math.cos(angle)
        ls_y = cy + 160 * math.sin(angle)
        le_x = x - 100 * math.cos(angle)
        le_y = y - 100 * math.sin(angle)
        svg += f'<line x1="{ls_x:.0f}" y1="{ls_y:.0f}" x2="{le_x:.0f}" y2="{le_y:.0f}" stroke="{c["accent"]}" stroke-width="4"/>\n'

        # 円
        svg += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="100" fill="{c["accent"]}" opacity="0.9"/>\n'

        overlays.append({
            "x": int(x - 95), "y": int(y - 25), "w": 190, "h": 50,
            "text": item, "font_size": 18, "color": "#FFFFFF",
            "bold": True, "align": "center", "anchor": "middle", "font_key": "ja_body"
        })

    svg += "</svg>"
    svg_to_png(svg, output_path, width=width)

    return {
        "png_path": str(output_path),
        "svg_width": width,
        "svg_height": height,
        "text_overlays": overlays,
    }


def make_timeline(events, style, output_path):
    """タイムライン"""
    c = get_colors_from_style(style)
    width, height = 1600, 500
    n = len(events)

    svg = svg_header(width, height, c["bg"])
    overlays = []

    line_y = height // 2
    margin = 100
    line_start, line_end = margin, width - margin
    svg += f'<line x1="{line_start}" y1="{line_y}" x2="{line_end}" y2="{line_y}" stroke="{c["divider"]}" stroke-width="6"/>\n'
    svg += f'<line x1="{line_start}" y1="{line_y}" x2="{line_end}" y2="{line_y}" stroke="{c["accent"]}" stroke-width="8" stroke-linecap="round" opacity="0.7"/>\n'

    for i, event in enumerate(events):
        x = line_start + (line_end - line_start) * i / max(n - 1, 1)
        is_last = i == n - 1
        node_color = c["accent"] if is_last else c["primary"]
        node_radius = 22 if is_last else 16
        svg += f'<circle cx="{x:.0f}" cy="{line_y}" r="{node_radius}" fill="{node_color}" filter="url(#shadow)"/>\n'

        # 日付
        overlays.append({
            "x": int(x - 200), "y": line_y + 40, "w": 400, "h": 40,
            "text": event["date"], "font_size": 20, "color": c["text_sub"],
            "bold": True, "align": "center", "anchor": "top", "font_key": "ja_body"
        })

        # 値
        if event.get("value"):
            value_size = 56 if is_last else 42
            value_color = c["accent"] if is_last else c["primary"]
            overlays.append({
                "x": int(x - 200), "y": line_y - 100, "w": 400, "h": 70,
                "text": event["value"], "font_size": value_size, "color": value_color,
                "bold": True, "align": "center", "anchor": "middle", "font_key": "en_heading"
            })

        # ラベル
        if event.get("label"):
            overlays.append({
                "x": int(x - 200), "y": line_y - 150, "w": 400, "h": 30,
                "text": event["label"], "font_size": 18, "color": c["text_main"],
                "bold": False, "align": "center", "anchor": "top", "font_key": "ja_body"
            })

    svg += "</svg>"
    svg_to_png(svg, output_path, width=width)

    return {
        "png_path": str(output_path),
        "svg_width": width,
        "svg_height": height,
        "text_overlays": overlays,
    }


def make_progress_steps(steps, current, style, output_path):
    """進行ステップ図"""
    c = get_colors_from_style(style)
    width, height = 1600, 350
    n = len(steps)

    svg = svg_header(width, height, c["bg"])
    overlays = []

    margin = 80
    step_w = (width - 2 * margin) // n
    cy = height // 2

    for i, step in enumerate(steps):
        cx = margin + i * step_w + step_w // 2

        if i < current:
            color = c["positive"]
            text_color = "#FFFFFF"
        elif i == current:
            color = c["accent"]
            text_color = "#FFFFFF"
        else:
            color = c["divider"]
            text_color = c["text_sub"]

        if i < n - 1:
            line_color = c["positive"] if i < current else c["divider"]
            svg += f'<line x1="{cx + 60}" y1="{cy}" x2="{cx + step_w - 60}" y2="{cy}" stroke="{line_color}" stroke-width="6"/>\n'

        svg += f'<circle cx="{cx}" cy="{cy}" r="60" fill="{color}" filter="url(#shadow)"/>\n'

        overlays.append({
            "x": cx - 60, "y": cy - 30, "w": 120, "h": 60,
            "text": str(i + 1), "font_size": 42, "color": text_color,
            "bold": True, "align": "center", "anchor": "middle", "font_key": "en_heading"
        })

        overlays.append({
            "x": cx - 200, "y": cy + 75, "w": 400, "h": 40,
            "text": step, "font_size": 20, "color": c["text_main"],
            "bold": True, "align": "center", "anchor": "top", "font_key": "ja_body"
        })

    svg += "</svg>"
    svg_to_png(svg, output_path, width=width)

    return {
        "png_path": str(output_path),
        "svg_width": width,
        "svg_height": height,
        "text_overlays": overlays,
    }


def make_icon_grid(icons, style, output_path, cols=3):
    """アイコングリッド"""
    c = get_colors_from_style(style)
    n = len(icons)
    rows = (n + cols - 1) // cols

    cell_w, cell_h = 400, 300
    width = cols * cell_w + 80
    height = rows * cell_h + 80

    svg = svg_header(width, height, c["bg"])
    overlays = []
    palette = [c["primary"], c["accent"], c["secondary"], c["positive"], c["accent2"]]

    for i, icon in enumerate(icons):
        col = i % cols
        row = i // cols
        x = 40 + col * cell_w
        y = 40 + row * cell_h
        cx = x + cell_w // 2
        cy = y + 100

        color = palette[i % len(palette)]
        shape = icon.get("shape", "circle")

        if shape == "circle":
            svg += f'<circle cx="{cx}" cy="{cy}" r="60" fill="{color}" filter="url(#shadow)"/>\n'
        elif shape == "square":
            svg += f'<rect x="{cx - 60}" y="{cy - 60}" width="120" height="120" fill="{color}" rx="12" filter="url(#shadow)"/>\n'
        elif shape == "triangle":
            svg += f'<polygon points="{cx},{cy - 60} {cx - 60},{cy + 50} {cx + 60},{cy + 50}" fill="{color}" filter="url(#shadow)"/>\n'
        elif shape == "hexagon":
            pts = []
            for k in range(6):
                angle = math.pi / 3 * k - math.pi / 2
                pts.append(f"{cx + 60 * math.cos(angle):.0f},{cy + 60 * math.sin(angle):.0f}")
            svg += f'<polygon points="{" ".join(pts)}" fill="{color}" filter="url(#shadow)"/>\n'

        overlays.append({
            "x": cx - 180, "y": cy + 90, "w": 360, "h": 50,
            "text": icon.get("label", ""), "font_size": 22, "color": c["text_main"],
            "bold": True, "align": "center", "anchor": "top", "font_key": "ja_heading"
        })

        if icon.get("desc"):
            overlays.append({
                "x": cx - 180, "y": cy + 140, "w": 360, "h": 40,
                "text": icon["desc"], "font_size": 16, "color": c["text_sub"],
                "bold": False, "align": "center", "anchor": "top", "font_key": "ja_body"
            })

    svg += "</svg>"
    svg_to_png(svg, output_path, width=width)

    return {
        "png_path": str(output_path),
        "svg_width": width,
        "svg_height": height,
        "text_overlays": overlays,
    }


def make_diagram_for_slide(slide_spec, style, tmp_dir):
    """slide_spec の '図解' フィールドから図解を生成"""
    if not _CAIRO_AVAILABLE:
        return None
    diagram_spec = slide_spec.get("図解")
    if not diagram_spec:
        return None

    diagram_type = diagram_spec.get("タイプ")
    output_path = Path(tmp_dir) / f"diagram_{slide_spec.get('番号', 0)}_{diagram_type}.png"

    if diagram_type == "プロセスフロー":
        return make_process_flow(diagram_spec.get("ステップ", []), style, output_path,
                                  accent_in_middle=diagram_spec.get("中央強調", True))
    elif diagram_type == "比較":
        return make_comparison_visual(diagram_spec.get("左", {}), diagram_spec.get("右", {}),
                                       style, output_path)
    elif diagram_type == "統計強調":
        return make_stat_highlight(diagram_spec.get("数字", ""), diagram_spec.get("ラベル", ""),
                                    diagram_spec.get("コンテキスト", ""), style, output_path,
                                    sub_stat=diagram_spec.get("サブ"))
    elif diagram_type == "概念図":
        return make_concept_diagram(diagram_spec.get("中心", ""), diagram_spec.get("関連", []),
                                     style, output_path)
    elif diagram_type == "タイムライン":
        return make_timeline(diagram_spec.get("イベント", []), style, output_path)
    elif diagram_type == "ステップ":
        return make_progress_steps(diagram_spec.get("ステップ", []),
                                    diagram_spec.get("現在", 0), style, output_path)
    elif diagram_type == "アイコン":
        return make_icon_grid(diagram_spec.get("アイコン", []), style, output_path,
                               cols=diagram_spec.get("列数", 3))
    return None
