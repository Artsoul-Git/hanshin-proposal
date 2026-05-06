"""
Chart Native - python-pptx ネイティブチャートでグラフを生成

matplotlib を使わず、PowerPoint側で描画されるチャートを使う。
これにより：
- フォント文字化けゼロ（PowerPointが描画するため）
- ファイルサイズ削減（画像埋め込み不要）
- PowerPointで編集可能
"""

from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_LABEL_POSITION
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor


def hex_to_rgb(hex_color):
    h = hex_color.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


CHART_TYPE_MAP = {
    "棒": XL_CHART_TYPE.BAR_CLUSTERED,
    "縦棒": XL_CHART_TYPE.COLUMN_CLUSTERED,
    "bar": XL_CHART_TYPE.COLUMN_CLUSTERED,
    "横棒": XL_CHART_TYPE.BAR_CLUSTERED,
    "horizontal_bar": XL_CHART_TYPE.BAR_CLUSTERED,
    "折れ線": XL_CHART_TYPE.LINE,
    "line": XL_CHART_TYPE.LINE,
    "円": XL_CHART_TYPE.PIE,
    "pie": XL_CHART_TYPE.PIE,
    "ドーナツ": XL_CHART_TYPE.DOUGHNUT,
    "donut": XL_CHART_TYPE.DOUGHNUT,
    "面": XL_CHART_TYPE.AREA,
    "area": XL_CHART_TYPE.AREA,
    "散布": XL_CHART_TYPE.XY_SCATTER,
}


def add_native_chart(slide, chart_spec, style, x, y, width, height):
    """ネイティブチャートをスライドに追加"""
    chart_type_str = chart_spec.get("タイプ", "棒")
    chart_type = CHART_TYPE_MAP.get(chart_type_str, XL_CHART_TYPE.COLUMN_CLUSTERED)

    x_data = chart_spec.get("X軸", [])
    y_data = chart_spec.get("Y軸", [])

    if not x_data or not y_data:
        return None

    chart_data = CategoryChartData()
    chart_data.categories = [str(c) for c in x_data]

    series_name = chart_spec.get("シリーズ名", chart_spec.get("Y軸ラベル", "値"))
    chart_data.add_series(series_name, y_data)

    chart_shape = slide.shapes.add_chart(
        chart_type, x, y, width, height, chart_data
    )
    chart = chart_shape.chart

    # スタイル適用
    apply_chart_style(chart, chart_spec, style, chart_type)

    return chart_shape


def apply_chart_style(chart, chart_spec, style, chart_type):
    """チャートにスタイルを適用"""
    colors = style.get("colors", {})
    accent_color = colors.get("accent", "#ED8936")
    primary_color = colors.get("primary", "#1A365D")
    text_main = colors.get("text_main", "#2D3748")

    # シリーズの色をアクセント色で
    color_key = chart_spec.get("色", "accent")
    bar_color = colors.get(color_key, accent_color)

    try:
        for series in chart.series:
            fill = series.format.fill
            fill.solid()
            fill.fore_color.rgb = hex_to_rgb(bar_color)
            series.format.line.fill.background()
    except Exception:
        pass

    # 凡例：シリーズ1つだけなら非表示
    chart.has_legend = False

    # データラベル表示（数字を直接表示）
    if chart_type in [XL_CHART_TYPE.COLUMN_CLUSTERED, XL_CHART_TYPE.BAR_CLUSTERED]:
        try:
            plot = chart.plots[0]
            plot.has_data_labels = True
            data_labels = plot.data_labels
            data_labels.font.size = Pt(14)
            data_labels.font.bold = True
            data_labels.font.color.rgb = hex_to_rgb(text_main)
        except Exception:
            pass

    # タイトル
    title = chart_spec.get("タイトル", "")
    if title:
        try:
            chart.has_title = True
            chart.chart_title.text_frame.text = title
            for para in chart.chart_title.text_frame.paragraphs:
                for run in para.runs:
                    run.font.size = Pt(20)
                    run.font.bold = True
                    run.font.name = style.get("typography", {}).get("ja_heading", "Yu Gothic UI")
                    run.font.color.rgb = hex_to_rgb(primary_color)
        except Exception:
            pass

    # 軸ラベルのフォント
    try:
        for axis in [chart.value_axis, chart.category_axis]:
            tick_labels = axis.tick_labels
            tick_labels.font.size = Pt(14)
            tick_labels.font.name = style.get("typography", {}).get("ja_body", "Yu Gothic UI")
            tick_labels.font.color.rgb = hex_to_rgb(text_main)
    except Exception:
        pass


def add_simple_native_chart(slide, chart_spec, style, x, y, width, height):
    """エラーがあってもクラッシュしない安全版"""
    try:
        return add_native_chart(slide, chart_spec, style, x, y, width, height)
    except Exception as e:
        print(f"[警告] ネイティブチャート生成失敗: {e}")
        # フォールバック：単純な矩形プレースホルダー
        from pptx.enum.shapes import MSO_SHAPE
        rect = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, width, height)
        rect.fill.solid()
        rect.fill.fore_color.rgb = hex_to_rgb(style["colors"].get("background_sub", "#F0F0F0"))
        rect.line.color.rgb = hex_to_rgb(style["colors"].get("divider", "#CCCCCC"))
        return rect
