#!/usr/bin/env python3
"""
提案骨子生成スクリプト（改善版）
ヒアリング結果から提案骨子（1〜2ページ）をWord形式で自動生成

改善点:
- ページ折り返し制御（keep_with_next, keep_together）
- 汎用的なページ制御ユーティリティ
- 表紙余白の最適化
"""

import argparse
import re
from datetime import datetime
from pathlib import Path

from docx import Document
from docx.shared import Pt, Mm, RGBColor, Twips
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsmap
from docx.oxml import OxmlElement

# Jony Iveデザインシステム準拠カラー
COLORS = {
    "black": RGBColor(0x00, 0x00, 0x00),
    "dark_gray": RGBColor(0x33, 0x33, 0x33),
    "medium_gray": RGBColor(0x66, 0x66, 0x66),
    "accent": RGBColor(0x5B, 0x7B, 0x94),
    "separator": RGBColor(0xE0, 0xE0, 0xE0),
}

FONT_NAME = "メイリオ"


# =============================================================================
# 汎用ページ制御ユーティリティ
# =============================================================================

class PageControl:
    """
    python-docxでのページ折り返し制御ユーティリティ
    
    使用例:
        PageControl.keep_with_next(paragraph)  # 次の段落と同一ページに
        PageControl.keep_together(paragraph)   # 段落内で改ページ禁止
        PageControl.page_break_before(paragraph)  # 段落前で改ページ
        PageControl.widow_control(paragraph)   # 孤立行制御
        PageControl.keep_table_together(table) # テーブル全体を同一ページに
    """
    
    @staticmethod
    def keep_with_next(paragraph, enable=True):
        """
        次の段落と同一ページに保持
        セクション見出しと本文を一緒にする場合に使用
        """
        pPr = paragraph._p.get_or_add_pPr()
        keepNext = pPr.find(qn('w:keepNext'))
        if keepNext is None:
            keepNext = OxmlElement('w:keepNext')
            pPr.append(keepNext)
        keepNext.set(qn('w:val'), '1' if enable else '0')
    
    @staticmethod
    def keep_together(paragraph, enable=True):
        """
        段落内で改ページを禁止
        長い段落が途中で切れないようにする
        """
        pPr = paragraph._p.get_or_add_pPr()
        keepLines = pPr.find(qn('w:keepLines'))
        if keepLines is None:
            keepLines = OxmlElement('w:keepLines')
            pPr.append(keepLines)
        keepLines.set(qn('w:val'), '1' if enable else '0')
    
    @staticmethod
    def page_break_before(paragraph, enable=True):
        """
        段落前で改ページを挿入
        新しいセクションを新ページから始める場合に使用
        """
        pPr = paragraph._p.get_or_add_pPr()
        pageBreak = pPr.find(qn('w:pageBreakBefore'))
        if pageBreak is None:
            pageBreak = OxmlElement('w:pageBreakBefore')
            pPr.append(pageBreak)
        pageBreak.set(qn('w:val'), '1' if enable else '0')
    
    @staticmethod
    def widow_control(paragraph, enable=True):
        """
        孤立行（Widow/Orphan）制御
        段落の最初/最後の1行だけが別ページに残ることを防ぐ
        """
        pPr = paragraph._p.get_or_add_pPr()
        widowControl = pPr.find(qn('w:widowControl'))
        if widowControl is None:
            widowControl = OxmlElement('w:widowControl')
            pPr.append(widowControl)
        widowControl.set(qn('w:val'), '1' if enable else '0')
    
    @staticmethod
    def keep_table_together(table):
        """
        テーブル全体を同一ページに保持
        テーブルが途中で分割されないようにする
        """
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    PageControl.keep_together(paragraph)
                    PageControl.keep_with_next(paragraph)
        
        # 最後の行の最後の段落はkeep_with_nextを解除
        last_row = table.rows[-1]
        for cell in last_row.cells:
            if cell.paragraphs:
                PageControl.keep_with_next(cell.paragraphs[-1], enable=False)
    
    @staticmethod
    def prevent_table_row_break(table):
        """
        テーブル行の途中での改ページを禁止
        """
        tblPr = table._tbl.tblPr
        if tblPr is None:
            tblPr = OxmlElement('w:tblPr')
            table._tbl.insert(0, tblPr)
        
        # 各行に対してcantSplitを設定
        for row in table.rows:
            trPr = row._tr.get_or_add_trPr()
            cantSplit = trPr.find(qn('w:cantSplit'))
            if cantSplit is None:
                cantSplit = OxmlElement('w:cantSplit')
                trPr.append(cantSplit)
    
    @staticmethod
    def set_section_properties(paragraph, keep_with_content=True):
        """
        セクション見出し用の設定
        見出しと次のコンテンツを同一ページに保持
        """
        PageControl.keep_with_next(paragraph, enable=keep_with_content)
        PageControl.keep_together(paragraph)
        PageControl.widow_control(paragraph)


def set_font(run, size_pt, bold=False, color=None):
    """フォント設定"""
    run.font.name = FONT_NAME
    run._element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME)
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    if color:
        run.font.color.rgb = color


def add_bottom_border(paragraph, color_hex):
    """段落に下線を追加"""
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), color_hex)
    pBdr.append(bottom)
    pPr.append(pBdr)


def add_section_heading(doc, text, keep_with_content=True):
    """
    セクション見出しを追加
    
    Args:
        doc: Document
        text: 見出しテキスト
        keep_with_content: 次のコンテンツと同一ページに保持するか
    """
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    
    run = p.add_run(f"■ {text}")
    set_font(run, 11, bold=True, color=COLORS["dark_gray"])
    
    # アクセントカラーの下線
    add_bottom_border(p, "5B7B94")
    
    # ページ制御: 見出しと次のコンテンツを同一ページに
    if keep_with_content:
        PageControl.set_section_properties(p)
    
    return p


def create_proposal_outline(
    client_name: str,
    issues: list,
    proposal_type: str,
    approach: str,
    reasons: list,
    effects: list,
    next_steps: list,
    subsidy_info: dict = None,
    contract_amount: int = None,
    output_path: str = None
):
    """
    提案骨子を生成
    
    Args:
        client_name: クライアント名
        issues: 課題リスト [{"title": str, "detail": str}, ...]
        proposal_type: 提案タイプ ("AI/DX" or "IT導入")
        approach: 提案アプローチの概要
        reasons: アプローチの理由リスト
        effects: 期待効果リスト [{"item": str, "value": str}, ...]
        next_steps: 次のステップリスト
        subsidy_info: 補助金情報 {"name": str, "rate": str, "max_amount": str, "deadline": str} or None
        contract_amount: 契約金額（税別、補助金計算用）
        output_path: 出力パス（省略時は自動生成）
    """
    doc = Document()
    
    # ページ設定（1ページに確実に収めるため余白を最小化）
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.top_margin = Mm(15)
    section.bottom_margin = Mm(15)
    section.left_margin = Mm(20)
    section.right_margin = Mm(20)
    
    # === 表紙部分（コンパクト化）===
    # タイトル
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_before = Pt(12)
    title.paragraph_format.space_after = Pt(2)
    run = title.add_run("ご提案骨子")
    set_font(run, 20, bold=True, color=COLORS["black"])
    PageControl.keep_with_next(title)
    
    # 区切り線
    separator = doc.add_paragraph()
    separator.alignment = WD_ALIGN_PARAGRAPH.CENTER
    separator.paragraph_format.space_after = Pt(2)
    run = separator.add_run("─" * 10)
    set_font(run, 9, color=COLORS["separator"])
    PageControl.keep_with_next(separator)
    
    # クライアント名
    client = doc.add_paragraph()
    client.alignment = WD_ALIGN_PARAGRAPH.CENTER
    client.paragraph_format.space_before = Pt(4)
    client.paragraph_format.space_after = Pt(8)
    run = client.add_run(f"{client_name} 様")
    set_font(run, 12, color=COLORS["dark_gray"])
    PageControl.keep_with_next(client)
    
    # 日付・会社名（1行にまとめる）
    today = datetime.now().strftime("%Y年%m月%d日")
    info = doc.add_paragraph()
    info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info.paragraph_format.space_after = Pt(12)
    run = info.add_run(f"{today}　株式会社けんけん")
    set_font(run, 8, color=COLORS["medium_gray"])
    
    # === 現状課題の整理 ===
    add_section_heading(doc, "現状課題の整理")
    
    for i, issue in enumerate(issues[:5], 1):  # 最大5つ
        # 課題タイトル
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Mm(3)
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(1)
        run = p.add_run(f"{i}. {issue['title']}")
        set_font(run, 9, bold=True, color=COLORS["dark_gray"])
        PageControl.keep_with_next(p)  # 課題タイトルと詳細を一緒に
        
        # 詳細
        if issue.get("detail"):
            detail = doc.add_paragraph()
            detail.paragraph_format.left_indent = Mm(7)
            detail.paragraph_format.space_after = Pt(2)
            run = detail.add_run(f"└ {issue['detail']}")
            set_font(run, 8, color=COLORS["medium_gray"])
            # 最後の課題以外はkeep_with_next
            if i < len(issues[:5]):
                PageControl.keep_with_next(detail)
    
    # === ご提案の方向性 ===
    add_section_heading(doc, "ご提案の方向性")
    
    # アプローチ
    approach_label = doc.add_paragraph()
    approach_label.paragraph_format.left_indent = Mm(3)
    approach_label.paragraph_format.space_before = Pt(2)
    run = approach_label.add_run("【アプローチ】")
    set_font(run, 9, bold=True, color=COLORS["dark_gray"])
    PageControl.keep_with_next(approach_label)
    
    approach_text = doc.add_paragraph()
    approach_text.paragraph_format.left_indent = Mm(3)
    approach_text.paragraph_format.space_after = Pt(4)
    run = approach_text.add_run(f"{proposal_type}による {approach}")
    set_font(run, 9, color=COLORS["dark_gray"])
    PageControl.keep_together(approach_text)
    
    # なぜこのアプローチか
    reason_label = doc.add_paragraph()
    reason_label.paragraph_format.left_indent = Mm(3)
    run = reason_label.add_run("【なぜこのアプローチか】")
    set_font(run, 9, bold=True, color=COLORS["dark_gray"])
    PageControl.keep_with_next(reason_label)
    
    for idx, reason in enumerate(reasons[:3]):  # 最大3つ
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Mm(5)
        p.paragraph_format.space_after = Pt(1)
        run = p.add_run(f"・{reason}")
        set_font(run, 8, color=COLORS["dark_gray"])
        # 最後の理由以外はkeep_with_next
        if idx < len(reasons[:3]) - 1:
            PageControl.keep_with_next(p)
    
    # === 期待効果 ===
    heading = add_section_heading(doc, "期待効果")
    
    # テーブル作成
    table = doc.add_table(rows=len(effects) + 1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # ヘッダー行
    header_cells = table.rows[0].cells
    for cell, text in zip(header_cells, ["項目", "効果"]):
        cell.text = text
        for paragraph in cell.paragraphs:
            paragraph.paragraph_format.space_before = Pt(2)
            paragraph.paragraph_format.space_after = Pt(2)
            for run in paragraph.runs:
                set_font(run, 9, bold=True, color=COLORS["dark_gray"])
    
    # データ行
    for i, effect in enumerate(effects):
        row = table.rows[i + 1]
        row.cells[0].text = effect["item"]
        row.cells[1].text = effect["value"]
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                paragraph.paragraph_format.space_before = Pt(2)
                paragraph.paragraph_format.space_after = Pt(2)
                for run in paragraph.runs:
                    set_font(run, 8, color=COLORS["dark_gray"])
    
    # テーブルスタイル（シンプルな罫線）
    for row in table.rows:
        for cell in row.cells:
            cell.width = Mm(50)
            # セル内余白
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            tcMar = OxmlElement('w:tcMar')
            for margin_name in ['top', 'left', 'bottom', 'right']:
                margin = OxmlElement(f'w:{margin_name}')
                margin.set(qn('w:w'), '60')
                margin.set(qn('w:type'), 'dxa')
                tcMar.append(margin)
            tcPr.append(tcMar)
    
    # テーブルのページ制御
    PageControl.keep_table_together(table)
    PageControl.prevent_table_row_break(table)
    
    # === 補助金活用のご案内（補助金情報がある場合）===
    if subsidy_info:
        add_section_heading(doc, "補助金活用のご案内")
        
        # 説明文
        intro = doc.add_paragraph()
        intro.paragraph_format.left_indent = Mm(3)
        intro.paragraph_format.space_after = Pt(4)
        run = intro.add_run("本サービスは以下の補助金の対象となる可能性があります：")
        set_font(run, 8, color=COLORS["dark_gray"])
        PageControl.keep_with_next(intro)
        
        # 補助金情報テーブル
        subsidy_rows = [
            ("補助金名", subsidy_info.get("name", "－")),
            ("補助率", subsidy_info.get("rate", "－")),
            ("補助上限額", subsidy_info.get("max_amount", "－")),
        ]
        if subsidy_info.get("deadline"):
            subsidy_rows.append(("申請締切", subsidy_info.get("deadline")))
        
        subsidy_table = doc.add_table(rows=len(subsidy_rows), cols=2)
        subsidy_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        for i, (label, value) in enumerate(subsidy_rows):
            row = subsidy_table.rows[i]
            row.cells[0].text = label
            row.cells[1].text = value
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    paragraph.paragraph_format.space_before = Pt(2)
                    paragraph.paragraph_format.space_after = Pt(2)
                    for run in paragraph.runs:
                        set_font(run, 8, color=COLORS["dark_gray"])
        
        # セル幅調整
        for row in subsidy_table.rows:
            row.cells[0].width = Mm(30)
            row.cells[1].width = Mm(60)
        
        PageControl.keep_table_together(subsidy_table)
        
        # 実質負担額の計算（契約金額がある場合）
        if contract_amount and subsidy_info.get("rate"):
            rate_text = subsidy_info.get("rate", "")
            # 補助率を解析（例: "1/2", "2/3", "50%"）
            subsidy_rate = 0.5  # デフォルト
            if "1/2" in rate_text:
                subsidy_rate = 0.5
            elif "2/3" in rate_text:
                subsidy_rate = 0.67
            elif "3/4" in rate_text:
                subsidy_rate = 0.75
            elif "%" in rate_text:
                try:
                    subsidy_rate = float(rate_text.replace("%", "").split("〜")[-1].split("～")[-1]) / 100
                except:
                    subsidy_rate = 0.5
            
            subsidy_amount = int(contract_amount * subsidy_rate)
            net_amount = contract_amount - subsidy_amount
            
            calc = doc.add_paragraph()
            calc.paragraph_format.left_indent = Mm(3)
            calc.paragraph_format.space_before = Pt(6)
            calc.paragraph_format.space_after = Pt(2)
            run = calc.add_run("【補助金適用時の実質負担額（税別）】")
            set_font(run, 8, bold=True, color=COLORS["dark_gray"])
            PageControl.keep_with_next(calc)
            
            calc_detail = doc.add_paragraph()
            calc_detail.paragraph_format.left_indent = Mm(5)
            calc_detail.paragraph_format.space_after = Pt(2)
            calc_text = f"通常価格: {contract_amount:,}円\n"
            calc_text += f"補助額: △{subsidy_amount:,}円（補助率{rate_text}の場合）\n"
            calc_text += f"────────────\n"
            calc_text += f"実質負担: {net_amount:,}円"
            run = calc_detail.add_run(calc_text)
            set_font(run, 8, color=COLORS["dark_gray"])
        
        # 注記
        note = doc.add_paragraph()
        note.paragraph_format.left_indent = Mm(3)
        note.paragraph_format.space_before = Pt(4)
        note.paragraph_format.space_after = Pt(2)
        note_text = "※補助金の採択を保証するものではありません\n"
        note_text += "※出典：Jグランツ（https://www.jgrants-portal.go.jp/）"
        run = note.add_run(note_text)
        set_font(run, 7, color=COLORS["medium_gray"])
    
    # === 次のステップ ===
    add_section_heading(doc, "次のステップ")
    
    for idx, step in enumerate(next_steps):
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Mm(3)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(f"□ {step}")
        set_font(run, 9, color=COLORS["dark_gray"])
        # 最後のステップ以外はkeep_with_next
        if idx < len(next_steps) - 1:
            PageControl.keep_with_next(p)
    
    # 出力
    if output_path is None:
        date_str = datetime.now().strftime("%Y%m%d")
        safe_client = re.sub(r'[\\/*?:"<>|]', '', client_name)
        output_path = f"/mnt/user-data/outputs/提案骨子_{safe_client}_{date_str}.docx"
    
    doc.save(output_path)
    return output_path


def extract_issues_from_text(text: str) -> list:
    """
    テキストから課題を抽出
    
    Args:
        text: ヒアリングメモや文字起こし
    
    Returns:
        課題リスト [{"title": str, "detail": str}, ...]
    """
    issues = []
    
    # 課題パターン検出
    patterns = [
        (r'困っ(?:ている|てる)(?:こと|の)?[はが]?[、。]?(.+?)(?:[。\n]|$)', "困りごと"),
        (r'課題[はが]?[、。]?(.+?)(?:[。\n]|$)', "課題"),
        (r'問題[はが]?[、。]?(.+?)(?:[。\n]|$)', "問題"),
        (r'(.+?)(?:が|を)手作業(?:で|している)', "手作業"),
        (r'(.+?)に時間がかかっ(?:ている|てる)', "時間がかかる"),
        (r'毎月?(\d+)(?:時間|枚|件|回)', "定量データ"),
    ]
    
    for pattern, category in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            if isinstance(match, tuple):
                match = match[0]
            if len(match) > 5:  # 短すぎるものは除外
                issues.append({
                    "title": match.strip()[:50],
                    "detail": f"（{category}から抽出）"
                })
    
    # 重複除去
    seen = set()
    unique_issues = []
    for issue in issues:
        if issue["title"] not in seen:
            seen.add(issue["title"])
            unique_issues.append(issue)
    
    return unique_issues[:5]


def determine_proposal_type(text: str) -> str:
    """
    テキストから提案タイプを判定
    
    Returns:
        "AI/DXアドバイザリー" or "IT導入支援"
    """
    ai_keywords = ["AI", "生成AI", "ChatGPT", "自動化", "効率化", "DX", "デジタル化", "ペーパーレス"]
    it_keywords = ["システム導入", "ツール導入", "クラウド", "ソフトウェア"]
    
    text_upper = text.upper()
    ai_score = sum(1 for kw in ai_keywords if kw.upper() in text_upper)
    it_score = sum(1 for kw in it_keywords if kw.upper() in text_upper)
    
    if ai_score >= it_score:
        return "AI/DXアドバイザリー"
    else:
        return "IT導入支援"


def main():
    parser = argparse.ArgumentParser(description="提案骨子生成")
    parser.add_argument("--client", help="クライアント名（hearing-sheet指定時は省略可）")
    parser.add_argument("--input", help="入力ファイル（hearing-sheet.xlsx / 文字起こし.txt）")
    parser.add_argument("--type", choices=["auto", "ai-dx", "it"], default="auto",
                        help="提案タイプ（auto/ai-dx/it）")
    parser.add_argument("--subsidy-name", help="補助金名")
    parser.add_argument("--subsidy-rate", help="補助率（例: 1/2, 2/3, 50%）")
    parser.add_argument("--subsidy-max", help="補助上限額")
    parser.add_argument("--subsidy-deadline", help="申請締切")
    parser.add_argument("--contract-amount", type=int, help="契約金額（税別）")
    parser.add_argument("--output", help="出力ファイル名")
    
    args = parser.parse_args()
    
    # 補助金情報を構築
    subsidy_info = None
    if args.subsidy_name:
        subsidy_info = {
            "name": args.subsidy_name,
            "rate": args.subsidy_rate or "1/2",
            "max_amount": args.subsidy_max or "－",
            "deadline": args.subsidy_deadline,
        }
    
    # hearing-sheetからの自動抽出
    if args.input and args.input.endswith(".xlsx"):
        try:
            from hearing_sheet_extractor import extract_from_hearing_sheet, generate_proposal_data
            
            print(f"📊 ヒアリングシートから抽出中: {args.input}")
            hearing_data = extract_from_hearing_sheet(args.input)
            proposal_data = generate_proposal_data(hearing_data)
            
            client_name = args.client or proposal_data["client_name"]
            issues = proposal_data["issues"]
            proposal_type = proposal_data["proposal_type"] if args.type == "auto" else (
                "AI/DXアドバイザリー" if args.type == "ai-dx" else "IT導入支援"
            )
            approach = proposal_data["approach"]
            reasons = proposal_data["reasons"]
            effects = proposal_data["effects"]
            next_steps = proposal_data["next_steps"]
            
            print(f"  ✓ クライアント: {client_name}")
            print(f"  ✓ 課題: {len(issues)}件抽出")
            print(f"  ✓ 提案タイプ: {proposal_type}")
            
        except ImportError:
            print("⚠️ hearing_sheet_extractor.pyが見つかりません。デフォルトデータを使用します。")
            client_name, issues, proposal_type, approach, reasons, effects, next_steps = _get_default_data(args)
        except Exception as e:
            print(f"⚠️ ヒアリングシート読み込みエラー: {e}")
            print("  デフォルトデータを使用します。")
            client_name, issues, proposal_type, approach, reasons, effects, next_steps = _get_default_data(args)
    
    # テキストファイルからの抽出
    elif args.input and args.input.endswith(".txt"):
        print(f"📝 テキストファイルから抽出中: {args.input}")
        with open(args.input, "r", encoding="utf-8") as f:
            text = f.read()
        
        client_name = args.client or "クライアント名未設定"
        issues = extract_issues_from_text(text)
        proposal_type = determine_proposal_type(text) if args.type == "auto" else (
            "AI/DXアドバイザリー" if args.type == "ai-dx" else "IT導入支援"
        )
        approach = f"生成AIを活用した業務改善と効率化"
        reasons = [
            "手作業の削減による工数・コスト削減効果が大きい",
            "既存システムとの連携が容易",
            "段階的な導入でリスクを最小化できる",
        ]
        effects = [
            {"item": "工数削減", "value": "約50%削減"},
            {"item": "コスト", "value": "年間削減効果あり"},
            {"item": "品質向上", "value": "ミス・手戻り削減"},
        ]
        next_steps = [
            "詳細ヒアリング（来週候補日をご連絡）",
            "正式見積のご提示",
            "PoC（概念実証）のご相談",
        ]
        
        print(f"  ✓ 課題: {len(issues)}件抽出")
    
    # デフォルトデータ使用
    else:
        if not args.client:
            parser.error("--client または --input（hearing-sheet）が必要です")
        client_name, issues, proposal_type, approach, reasons, effects, next_steps = _get_default_data(args)
    
    # 補助金情報をログ出力
    if subsidy_info:
        print(f"  ✓ 補助金: {subsidy_info['name']}（補助率{subsidy_info['rate']}）")
    
    output_path = create_proposal_outline(
        client_name=client_name,
        issues=issues,
        proposal_type=proposal_type,
        approach=approach,
        reasons=reasons,
        effects=effects,
        next_steps=next_steps,
        subsidy_info=subsidy_info,
        contract_amount=args.contract_amount,
        output_path=args.output
    )
    
    print(f"✅ 提案骨子を生成しました: {output_path}")


def _get_default_data(args):
    """デフォルトのサンプルデータを返す"""
    client_name = args.client or "クライアント名未設定"
    issues = [
        {"title": "請求書の手入力が多い", "detail": "月100枚以上を手作業で入力"},
        {"title": "月次決算に時間がかかる", "detail": "締め後5日以上かかっている"},
        {"title": "部門間のデータ連携ができていない", "detail": "Excel転記が必要"},
    ]
    proposal_type = "AI/DXアドバイザリー" if args.type != "it" else "IT導入支援"
    approach = "生成AIを活用した請求書処理の自動化と業務フローの最適化"
    reasons = [
        "手作業の削減による工数・コスト削減効果が大きい",
        "既存システムとの連携が容易",
        "段階的な導入でリスクを最小化できる",
    ]
    effects = [
        {"item": "工数削減", "value": "約60%削減"},
        {"item": "コスト", "value": "年間約120万円"},
        {"item": "品質向上", "value": "入力ミスの大幅削減"},
    ]
    next_steps = [
        "詳細ヒアリング（来週候補日をご連絡）",
        "正式見積のご提示",
        "PoC（概念実証）のご相談",
    ]
    return client_name, issues, proposal_type, approach, reasons, effects, next_steps


if __name__ == "__main__":
    main()
