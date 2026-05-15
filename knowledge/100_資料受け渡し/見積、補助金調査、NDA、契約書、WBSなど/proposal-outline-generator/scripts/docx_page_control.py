#!/usr/bin/env python3
"""
docx_page_control.py - python-docx用汎用ページ制御ユーティリティ

Word文書のページ折り返しを制御するためのユーティリティクラス。
python-docxでは直接サポートされていないOOXML属性を操作します。

使用例:
    from docx_page_control import PageControl
    
    # 見出しと本文を同一ページに
    heading = doc.add_paragraph("セクション見出し")
    PageControl.keep_with_next(heading)
    
    # テーブル全体を同一ページに
    table = doc.add_table(rows=5, cols=3)
    PageControl.keep_table_together(table)
    
    # 新ページから開始
    new_section = doc.add_paragraph("新しいセクション")
    PageControl.page_break_before(new_section)
"""

from docx.oxml.ns import qn
from docx.oxml import OxmlElement


class PageControl:
    """
    python-docxでのページ折り返し制御ユーティリティ
    
    主要メソッド:
        keep_with_next(paragraph)     - 次の段落と同一ページに保持
        keep_together(paragraph)      - 段落内で改ページ禁止
        page_break_before(paragraph)  - 段落前で改ページ
        widow_control(paragraph)      - 孤立行制御
        keep_table_together(table)    - テーブル全体を同一ページに
        prevent_table_row_break(table)- テーブル行の分割禁止
    """
    
    @staticmethod
    def keep_with_next(paragraph, enable=True):
        """
        次の段落と同一ページに保持（Keep with next）
        
        用途:
        - セクション見出しと最初の本文段落を一緒にする
        - 図表のキャプションと図表を一緒にする
        - 箇条書きの項目とその詳細を一緒にする
        
        Args:
            paragraph: python-docx Paragraphオブジェクト
            enable: True=有効, False=無効
        
        例:
            heading = doc.add_paragraph("見出し")
            PageControl.keep_with_next(heading)
            content = doc.add_paragraph("本文")  # 見出しと同じページに配置される
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
        段落内で改ページを禁止（Keep lines together）
        
        用途:
        - 長い段落が途中で切れないようにする
        - コードブロックを分割させない
        - 引用文を分割させない
        
        Args:
            paragraph: python-docx Paragraphオブジェクト
            enable: True=有効, False=無効
        
        注意:
            段落がページに収まらない場合は、段落全体が次のページに移動する
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
        段落前で改ページを挿入（Page break before）
        
        用途:
        - 章の開始を新ページから始める
        - 重要なセクションを新ページから始める
        - 付録を新ページから始める
        
        Args:
            paragraph: python-docx Paragraphオブジェクト
            enable: True=有効, False=無効
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
        
        用途:
        - 段落の最初の1行だけが前のページに残ることを防ぐ（Orphan）
        - 段落の最後の1行だけが次のページに残ることを防ぐ（Widow）
        
        Args:
            paragraph: python-docx Paragraphオブジェクト
            enable: True=有効, False=無効
        
        注意:
            Wordのデフォルトでは有効になっていることが多い
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
        
        用途:
        - 小さなテーブルが途中で分割されないようにする
        - 見出し行とデータ行を一緒にする
        
        Args:
            table: python-docx Tableオブジェクト
        
        注意:
            テーブルがページに収まらない場合は、テーブル全体が次のページに移動する
            大きなテーブルには使用しない方がよい
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
        テーブル行の途中での改ページを禁止（Can't split）
        
        用途:
        - 各行が途中で切れないようにする
        - 行の高さが大きい場合に特に有効
        
        Args:
            table: python-docx Tableオブジェクト
        """
        # 各行に対してcantSplitを設定
        for row in table.rows:
            trPr = row._tr.get_or_add_trPr()
            cantSplit = trPr.find(qn('w:cantSplit'))
            if cantSplit is None:
                cantSplit = OxmlElement('w:cantSplit')
                trPr.append(cantSplit)
    
    @staticmethod
    def repeat_table_header(table, header_rows=1):
        """
        テーブルヘッダーを各ページで繰り返す
        
        用途:
        - 長いテーブルで各ページにヘッダー行を表示する
        - データテーブルの可読性を向上させる
        
        Args:
            table: python-docx Tableオブジェクト
            header_rows: ヘッダーとして繰り返す行数（デフォルト: 1）
        """
        for i in range(header_rows):
            if i < len(table.rows):
                row = table.rows[i]
                trPr = row._tr.get_or_add_trPr()
                tblHeader = trPr.find(qn('w:tblHeader'))
                if tblHeader is None:
                    tblHeader = OxmlElement('w:tblHeader')
                    trPr.append(tblHeader)
    
    @staticmethod
    def set_section_properties(paragraph, keep_with_content=True):
        """
        セクション見出し用の総合設定
        
        以下の設定を一括で適用:
        - keep_with_next: 次のコンテンツと同一ページに
        - keep_together: 見出し自体を分割禁止
        - widow_control: 孤立行防止
        
        Args:
            paragraph: python-docx Paragraphオブジェクト
            keep_with_content: 次のコンテンツと同一ページに保持するか
        """
        PageControl.keep_with_next(paragraph, enable=keep_with_content)
        PageControl.keep_together(paragraph)
        PageControl.widow_control(paragraph)
    
    @staticmethod
    def apply_to_list(paragraphs, keep_together=True):
        """
        リスト（箇条書き）全体に対してページ制御を適用
        
        用途:
        - 箇条書きリストを同一ページに保持
        - 番号付きリストを同一ページに保持
        
        Args:
            paragraphs: Paragraphオブジェクトのリスト
            keep_together: リスト全体を同一ページに保持するか
        """
        for i, p in enumerate(paragraphs):
            PageControl.keep_together(p)
            # 最後の項目以外はkeep_with_next
            if i < len(paragraphs) - 1:
                PageControl.keep_with_next(p)
            else:
                PageControl.keep_with_next(p, enable=False)


# =============================================================================
# 便利な高レベル関数
# =============================================================================

def keep_section_together(heading_paragraph, content_paragraphs):
    """
    セクション（見出し＋コンテンツ）を同一ページに保持
    
    Args:
        heading_paragraph: 見出しのParagraph
        content_paragraphs: コンテンツのParagraphリスト
    """
    PageControl.set_section_properties(heading_paragraph)
    PageControl.apply_to_list(content_paragraphs)


def prepare_table_for_pagination(table, repeat_header=True, prevent_row_break=True):
    """
    テーブルのページネーション最適化
    
    Args:
        table: Tableオブジェクト
        repeat_header: ヘッダーを各ページで繰り返すか
        prevent_row_break: 行の途中での改ページを禁止するか
    """
    if repeat_header:
        PageControl.repeat_table_header(table)
    if prevent_row_break:
        PageControl.prevent_table_row_break(table)


# =============================================================================
# 使用例
# =============================================================================

if __name__ == "__main__":
    from docx import Document
    from docx.shared import Pt
    
    # テスト用ドキュメント作成
    doc = Document()
    
    # セクション見出し（次の段落と同一ページに）
    heading = doc.add_paragraph("セクション1: 概要")
    PageControl.set_section_properties(heading)
    
    # 本文
    content = doc.add_paragraph("これは本文です。見出しと同じページに表示されます。")
    
    # テーブル（全体を同一ページに）
    table = doc.add_table(rows=4, cols=3)
    table.cell(0, 0).text = "項目"
    table.cell(0, 1).text = "値"
    table.cell(0, 2).text = "備考"
    PageControl.keep_table_together(table)
    PageControl.prevent_table_row_break(table)
    
    # 新セクション（新ページから開始）
    new_section = doc.add_paragraph("セクション2: 詳細")
    PageControl.page_break_before(new_section)
    
    doc.save("/tmp/page_control_test.docx")
    print("テストドキュメントを生成しました: /tmp/page_control_test.docx")
