---
name: comparison-table-v2
description: 新旧対比表を作成するスキル。「新旧対比表を作成して」「新旧対比表を作って」「対比表を生成」「比較表を作成」等のリクエストで起動。2つのWord文書（.docx）またはPDF文書の変更前・変更後を比較し、プロフェッショナルな新旧対比表をWord形式で出力。就業規則、契約書、規程類、ポリシー文書等の改訂履歴管理に最適。階層構造自動検出、見出しパターン自動認識（第○条、第○章、(1)等14種類対応）。デフォルト列順序は新→旧。
---

# Comparison Table Generator v2 (DOCX)

Generate professional Word documents (新旧対比表) comparing before/after versions of Word documents with **hierarchical structure analysis** and **automatic heading pattern detection**. The system first analyzes document hierarchy to identify top-level articles and sub-level items, then performs accurate comparisons respecting the document structure.

## Quick Start

**Current Version**: v5.8 (2025-12-15)

**Key Improvements in v5.8:**
- ✅ **NEW**: Heading-name-based matching - matches articles by heading name (e.g., 「安全衛生」) instead of article number
- ✅ **NEW**: Heading name normalization - unifies 「及び」「、」「・」「並びに」 for better matching
- ✅ **NEW**: Two-phase matching - Phase 1: heading name match (80%+ similarity), Phase 2: content similarity for remaining articles
- ✅ **FIXED**: Chapter insertion handling - correctly handles cases where new chapters are added (e.g., 退職金章の新設)
- ✅ **FIXED**: Highlight styling - new text shows red+bold, old text shows red+strikethrough
- ✅ Solves the "article number shift" problem when chapters are added/removed

**Key Improvements in v5.7:**
- ✅ Column order option (`--order=new-old` or `--order=old-new`)
- ✅ Default order changed to 新→旧 (change-after → change-before)
- ✅ Use `--order=old-new` for traditional 旧→新 display if needed

**Key Improvements in v5.6:**
- ✅ **FIXED**: Article number mismatch penalty - prevents incorrect matching when numbers differ
- ✅ **FIXED**: Deleted article position - now appears immediately after the previous matched article
- ✅ Comprehensive output order: deleted, added, and modified articles all in correct document order

**Key Improvements in v5.4:**
- ✅ **NEW**: Article number matching bonus - same article numbers now prioritized in matching
- ✅ **NEW**: Additional heading patterns - 編/節/款/別表/様式/別紙 now recognized
- ✅ Fixes incorrect matching when article text is similar but numbers differ

**Key Improvements in v5.3:**
- ✅ **NEW**: Unicode normalization (NFKC) - handles decomposed characters from PDF/OCR text
- ✅ **NEW**: legalKanjiBranch pattern - "第一条の2" now correctly recognized
- ✅ Full-width/half-width character unification for better matching

**Key Improvements in v5.2:**
- ✅ **FIXED**: legalBranch pattern priority - "第○条の○" now correctly recognized before "第○条"
- ✅ Pattern evaluation order optimized for more specific patterns first

**Key Improvements in v5.1:**
- ✅ **FIXED**: Paragraph order preservation - non-numbered items (始業時刻/終業時刻 etc.) maintain original order
- ✅ **FIXED**: Stable sort implementation - items with same priority preserve document sequence
- ✅ **FIXED**: Similarity matching results now processed in document order

**Key Improvements in v5.0:**
- ✅ **NEW**: Grouped deletion display - consecutive deleted items show single "(削除)" label
- ✅ **NEW**: Grouped addition display - consecutive added items show single "(新規追加)" label
- ✅ **NEW**: Chapter heading support - recognizes "第○章" as Level 1 headings
- ✅ **NEW**: Appendix support - recognizes "附則" as Level 1 heading
- ✅ **NEW**: Strikethrough on headers - deleted article headers now have strikethrough
- ✅ **REMOVED**: Background colors (pink/blue shading) removed for cleaner output
- ✅ Hierarchical structure analysis - understands parent-child relationships
- ✅ Automatic heading pattern detection with 14 supported formats

**Key Improvements in v4.0:**
- ✅ **NEW**: Hierarchical structure analysis - understands parent-child relationships
- ✅ **NEW**: Top-level heading identification - correctly identifies article boundaries
- ✅ **NEW**: Item number ordering - displays added/modified/deleted items in correct sequence
- ✅ **NEW**: Single-cell article display - merges all content within same article into one cell
- ✅ **NEW**: No internal dividers - cleaner presentation within articles
- ✅ Automatic heading pattern detection with 12 supported formats
- ✅ Intelligent hierarchy level assignment for each pattern

**Supported Formats (Auto-detected with Hierarchy Levels):**
1. **Legal article style** (Level 1): `第3条`, `第三条`, `第3条の2`
2. **Legal chapter style** (Level 1): `第1章`, `第10章`
3. **Numbered style** (Level 1): `3. (見出し)`, `3. （見出し）`
4. **Hierarchical** (Level 2+): `3.1`, `3.1.1`, `3.1.2.1` (level = number of dots + 1)
5. **Hyphenated** (Level 2): `3-1`, `3-2`, `10-5`
6. **Parentheses** (Level 2): `(3)`, `（3）`
7. **Single paren** (Level 2): `3)`, `3）`
8. **Plain number** (Level 2): `3. ` (simple number without heading text)
9. **Symbol** (Level 1): `§3`, `■ 3`, `▪ Item`
10. **Bracket** (Level 2): `【3】`, `［3］`
11. **English** (Level 1): `Article 3`, `Section 3`, `Chapter 3`
12. **Appendix** (Level 1): `附則`

**Key Improvements in v3.1:**
- ✅ Removes Markdown bold symbols (`**`)
- ✅ Supports numbered heading format (e.g., "1. (目的)")
- ✅ Supports both full-width `（）` and half-width `()` parentheses

**Key Improvements in v3.0:**
- ✅ Similarity-based paragraph matching using Levenshtein distance
- ✅ Intelligent matching even when paragraph numbers change
- ✅ Correctly identifies additions vs. modifications vs. deletions

## When to Use

**Trigger phrases (トリガーワード):**
- 「新旧対比表を作成して」
- 「新旧対比表を作って」
- 「対比表を生成」
- 「比較表を作成」
- 「変更箇所を比較して」
- "create comparison table"
- "generate diff table"

Use this skill when users:
- Upload two docx/PDF files and ask to create a comparison table
- Want to compare old and new versions of Word documents
- Need to visualize changes in regulations, contracts, policies, or procedures
- Request "新旧対比表" or "comparison table" generation
- Have documents with **any** heading format (auto-detected)

## Workflow

### 1. Detect Files

Check `/mnt/user-data/uploads` for uploaded docx or PDF files:

```bash
ls -la /mnt/user-data/uploads/
```

**For PDF files**: Convert to docx first using pdfplumber and python-docx:
```python
import pdfplumber
from docx import Document

def pdf_to_docx(pdf_path, docx_path):
    doc = Document()
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for line in text.split('\n'):
                    if line.strip():
                        doc.add_paragraph(line.strip())
    doc.save(docx_path)
```

If 2+ files exist, proceed. If not, ask user to upload two files.

### 2. Execute Generation Script

First, copy the script to working directory:
```bash
mkdir -p /home/claude/scripts
cp /mnt/skills/user/comparison-table-v2/scripts/comparison_docx_generator_v5.8.js /home/claude/scripts/
cd /home/claude && npm install docx --quiet
```

**Version 5.8 (Current - with heading-name-based matching):**
```bash
cd /home/claude
node scripts/comparison_docx_generator_v5.8.js <old_file.docx> <new_file.docx> <output_file.docx> "<document_name>" "<date>" [--order=old-new|new-old]
```

**Parameters:**
- `old_file.docx`: Path to before-version file (required)
- `new_file.docx`: Path to after-version file (required)
- `output_file.docx`: Output filename (optional, default: comparison_table.docx)
- `document_name`: Document title for table header (optional, auto-detected from filename)
- `date`: Date to display (optional, defaults to today)
- `--order`: Column display order (optional, default: new-old)
  - `--order=new-old`: 変更後（新）→ 変更前（旧） (default)
  - `--order=old-new`: 変更前（旧）→ 変更後（新）

**Example (Default: 新→旧):**
```bash
node scripts/comparison_docx_generator_v5.8.js \
  /mnt/user-data/uploads/regulations_old.docx \
  /mnt/user-data/uploads/regulations_new.docx \
  /mnt/user-data/outputs/regulations_comparison.docx \
  "就業規則" \
  "2024年12月4日"
```

**Example (旧→新 order):**
```bash
node scripts/comparison_docx_generator_v5.8.js \
  /mnt/user-data/uploads/regulations_old.docx \
  /mnt/user-data/uploads/regulations_new.docx \
  /mnt/user-data/outputs/regulations_comparison.docx \
  "就業規則" \
  "2024年12月4日" \
  --order=old-new
```

**Output includes hierarchical structure analysis log:**
```
🔍 文書構造を解析中...
📊 検出された見出しパターン:
   legal: 12回 (レベル1)
   parentheses: 11回 (レベル2)
📊 階層レベル分布: { '1': 12, '2': 11 }
📊 最上位レベル: 1

🔄 条文レベルで変更を検出中...
📝 見出し名ベースのマッチングを使用（v5.8）

📌 フェーズ1: 見出し名ベースのマッチング
   ✅ 完全一致: 「安全衛生」
   ✅ 完全一致: 「健康診断」
   → 35個の条文をマッチング

📌 フェーズ2: 内容類似度ベースのマッチング（残り条文）
   → 0個の条文を追加マッチング

📊 マッチング結果: 35/36個の旧条文がマッチ
   新規条文: 8個
   削除条文: 1個
📊 表示順序: 変更後（新）→ 変更前（旧）
```

### 3. Output to User

The file is automatically saved to the specified output path. Provide a link:

```markdown
[新旧対比表を見る](computer:///mnt/user-data/outputs/新旧対比表.docx)
```

## Key Feature: Hierarchical Structure Analysis

**How It Works:**

**Phase 1: Document Structure Analysis**
1. **Pattern Detection**: Analyzes paragraphs to detect heading patterns
2. **Level Assignment**: Assigns hierarchy level to each pattern (Level 1 = top-level articles)
3. **Structure Building**: Constructs document hierarchy tree
4. **Top-Level Identification**: Identifies minimum level as article boundaries

**Phase 2: Hierarchy-Aware Comparison**
1. **Article Grouping**: Groups content by top-level headings only
2. **Item Ordering**: Sorts sub-items by item numbers within each article
3. **Cell Merging**: Displays entire article (heading + all items) in single cell
4. **Clean Presentation**: No dividing lines between items within same article

**Example Analysis Output:**
```
🔍 文書構造を解析中...
📊 検出された見出しパターン:
   legal: 12回 (レベル1)
   plainNumber: 8回 (レベル2)
   parentheses: 11回 (レベル2)
📊 階層レベル分布: { '1': 12, '2': 19 }
📊 最上位レベル: 1

📝 レベル1の見出しで条文を分割中...
✅ 12個の条文に分割しました
```

This means:
- 12 top-level articles (第○条) at Level 1
- 19 sub-items (2. ..., (1), (2), etc.) at Level 2
- Comparison will be performed at article level, with sub-items sorted within

**Supported Patterns with Hierarchy Levels:**

| Pattern | Regex | Level | Examples |
|---------|-------|-------|----------|
| legal | `^第[0-9０-９]+条` | 1 | 第3条, 第10条 |
| legalKanji | `^第[一二三四五六七八九十百千]+条` | 1 | 第三条, 第十五条 |
| legalBranch | `^第[0-9０-９]+条の[0-9０-９]+` | 1 | 第3条の2, 第5条の3 |
| numbered | `^[0-9０-９]+\.\s+[（(]` | 1 | 3. (見出し), 5. （規定） |
| hierarchical | `^[0-9０-９]+(\.[0-9０-９]+)+\.?\s` | 2+ | 1.1 (L2), 3.2.1 (L3), 5.1.2.3 (L4) |
| hyphenated | `^[0-9０-９]+-[0-9０-９]+\.?\s` | 2 | 1-1, 3-2, 10-5 |
| parentheses | `^[（(][0-9０-９]+[)）]` | 2 | (1), （3）, (10) |
| singleParen | `^[0-9０-９]+[)）]\s` | 2 | 1), 3）, 10) |
| plainNumber | `^[0-9０-９]+\.\s` | 2 | 1. , 2. , 3. |
| symbol | `^[§■▪●◆□]` | 1 | §3, ■ Item, ▪ Point |
| bracket | `^[【［\[][0-9０-９]+[】］\]]` | 2 | 【1】, ［3］, [5] |
| english | `^(Article\|Section\|Chapter\|Part)\s+[0-9]+` | 1 | Article 3, Section 5 |

**Note**: Level 1 patterns are treated as top-level articles. Level 2+ patterns are treated as sub-items within articles.

## Hierarchical Structure-Aware Comparison (階層構造対応)

**IMPORTANT**: The generated table uses hierarchical structure analysis to organize changes intelligently:

**How It Works:**
1. **Analyzes hierarchy**: Identifies top-level articles (Level 1) and sub-items (Level 2+)
2. **Groups by articles**: Only top-level headings create article boundaries
3. **Orders sub-items**: Within each article, items are sorted by item number
4. **Merges cells**: All content within same article displayed in single cell
5. **Shows only changes**: Unchanged articles and items are not displayed

**Display Rules:**
- ✅ Top-level articles (Level 1) → Article boundaries (e.g., 第5条)
- ✅ Sub-items (Level 2+) → Content within articles (e.g., (1), (2), 2. )
- ✅ Changed articles → Heading + changed items shown in correct order
- ✅ Modified items → Highlighted with diff detection
- ✅ New items → Shown as "(新規追加)" in correct position by item number
- ✅ Deleted items → Shown as "(削除)" in correct position
- ✅ Single cell per article → No dividing lines between items
- ❌ Unchanged articles → **Not shown in the table**
- ❌ Unchanged items within changed articles → **Not shown**

### Example Output Structure

**Input Document Structure:**
```
第5条(諸手当)
  (1) 通勤手当: 50,000円
  (2) 時間外勤務手当
  (3) 休日勤務手当
  (4) 深夜勤務手当
  (5) 役職手当
```

**Output in Comparison Table (if (1) changed and (6), (7) added):**
```
┌─────────────────────────────────────┬─────────────────────────────────────┐
│ 第5条(諸手当)                       │ 第5条(諸手当)                       │
│                                     │                                     │
│ (1) 通勤手当: 50,000円              │ (1) 通勤手当: 30,000円              │
│ [highlighted changes]               │ [highlighted changes]               │
│                                     │                                     │
│ (新規追加)                          │ (6) 家族手当: ...                   │
│                                     │                                     │
│ (新規追加)                          │ (7) 住宅手当: ...                   │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

**Key Points:**
- Items (2)-(5) not shown because unchanged
- New items (6), (7) shown in correct numerical order
- All content in single cell with paragraph spacing
- No table row dividers between items

## Output Format

The generated Word document includes:

### Change Highlighting
- **Before (changed)**: Black text, bold, underline
- **After (changed)**: Red text, bold, underline
- **New paragraph**: Blue text, bold, with "(新規追加)" in left cell
- **Deleted paragraph**: Red text, strikethrough, with "(削除)" in right cell

### Features
- **Hierarchical structure analysis**: Understands parent-child heading relationships
- **Top-level article detection**: Correctly identifies article boundaries
- **Item number ordering**: Sorts added/modified/deleted items by number
- **Single-cell article display**: Merges all article content into one cell
- **No internal dividers**: Clean presentation within articles
- **Automatic heading detection**: 12 patterns supported with level assignment
- **Token-level diff detection**: Precise change highlighting within paragraphs
- **Shows only changed articles and items**: Focused on actual changes
- **Advanced Markdown cleanup**:
  - Removes Markdown bold symbols: `**text**` → `text`
  - Removes quoted block symbols: `>\(1\)` → `(1)`
  - Normalizes escaped characters: `2\.` → `2.`
- Center-aligned table
- Professional formatting with Yu Gothic font
- Automatic date generation if not specified

## Technical Details

### Version 4.0: Hierarchical Structure Analysis

**Two-Phase Approach:**

**Phase 1: Structure Analysis**
```javascript
function analyzeDocumentStructure(paragraphs) {
  // 1. Analyze each paragraph
  const analyzed = paragraphs.map(para => analyzeHeading(para));
  
  // 2. Detect patterns and assign levels
  // Level 1: 第○条, Article ○, etc.
  // Level 2: (○), ○., etc.
  
  // 3. Identify top level (minimum level number)
  const topLevel = Math.min(...detectedLevels);
  
  return { analyzed, topLevel };
}
```

**Phase 2: Hierarchy-Aware Comparison**
```javascript
function groupByTopLevelHeading(structure) {
  // Group content by top-level headings only
  // Sub-level items become content within articles
  
  for (const item of structure.analyzed) {
    if (item.level === structure.topLevel) {
      // New article
      startNewArticle(item);
    } else {
      // Add to current article
      addToCurrentArticle(item);
    }
  }
}
```

**Item Ordering Algorithm:**
```javascript
function extractItemNumber(text) {
  // Extract number from: (1), （1）, 1., 1), etc.
  // Returns integer for sorting
}

// Sort all changes by item number
items.sort((a, b) => a.itemNum - b.itemNum);
// Display in correct order: (1), (2), (6)新規, (7)新規
```

**Hierarchy Levels by Pattern:**
- **Level 1** (Articles): `legal`, `legalKanji`, `legalBranch`, `numbered`, `symbol`, `english`
- **Level 2** (Sub-items): `parentheses`, `plainNumber`, `singleParen`, `hyphenated`, `bracket`
- **Level 2+** (Variable): `hierarchical` (calculated by dot count)

### Dependencies
- Node.js with docx package
- pandoc (for docx to text conversion)
- pdfplumber + python-docx (for PDF input support)

## Common Patterns

### Pattern 1: Legal document with hierarchical structure
```
User: [uploads documents with "第○条" as articles and "(○)" as items]
      「新旧対比表を作成して」

Output:
🔍 文書構造を解析中...
📊 検出された見出しパターン:
   legal: 12回 (レベル1)
   parentheses: 23回 (レベル2)
📊 階層レベル分布: { '1': 12, '2': 23 }
📊 最上位レベル: 1
✅ 新旧対比表を生成しました
   変更された条文: 4個
```

### Pattern 2: Numbered document with plain number items
```
User: [uploads documents with "1. (見出し)" format and "2." sub-items]
      「新旧対比表を作成して」

Output:
🔍 文書構造を解析中...
📊 検出された見出しパターン:
   numbered: 10回 (レベル1)
   plainNumber: 15回 (レベル2)
📊 階層レベル分布: { '1': 10, '2': 15 }
📊 最上位レベル: 1
✅ 新旧対比表を生成しました
```

### Pattern 3: Hierarchical numbering
```
User: [uploads documents with "1.1", "1.2", "2.1" format]
      「新旧対比表を作成して」

Output:
🔍 文書構造を解析中...
📊 検出された見出しパターン:
   hierarchical: 20回 (レベル2)
📊 階層レベル分布: { '2': 20 }
📊 最上位レベル: 2
✅ 新旧対比表を生成しました
```

## Error Handling

**No heading pattern detected:**
```
⚠️  見出しパターンが検出されませんでした。デフォルトパターン(numbered)を使用します。
```

**No files uploaded:**
「2つのWord文書(.docx)またはPDF文書をアップロードしてください。」

**Only one file:**
「変更前と変更後の2つのファイルが必要です。もう1つアップロードしてください。」

## Troubleshooting

**If hierarchy detection seems incorrect:**
1. Check the structure analysis log: `📊 階層レベル分布: { '1': 12, '2': 19 }`
2. Verify that your document has consistent heading levels
3. Top-level headings should be Level 1 patterns (第○条, Article ○, etc.)

**If items appear in wrong order:**
1. Ensure sub-items use numbered formats: (1), (2), 1., 2., etc.
2. The system extracts numbers for sorting
3. Non-numbered items maintain their original document order (fixed in v5.1)
4. If order issues persist, verify you are using v5.1 or later

**If non-numbered items (始業時刻/終業時刻 etc.) appear reversed:**
This was fixed in v5.1. The issue occurred because:
- Similarity matching returned results in similarity-score order, not document order
- Items without extractable numbers shared the same sort key (9999)
- JavaScript's sort was not preserving original order for equal keys

Solution: Update to v5.1 which implements stable sorting and document-order processing.

**If articles are split incorrectly:**
1. Check which level was detected as top-level: `📊 最上位レベル: 1`
2. Only patterns at this level create article boundaries
3. All other levels become content within articles

**If comparison table shows too many/too few changes:**
1. Verify the hierarchy is correctly detected in both old and new versions
2. Check if article headers match (uses similarity matching)
3. Review the statistics in output to understand what was detected

## Version History

### v5.6 (Current - 2025-12-05)
**Critical Fixes:**
- **Article number mismatch penalty**: When article numbers differ (e.g., 第2条 vs 第3条), similarity is halved to prevent incorrect matching
- **Deleted article position**: Now appears immediately after the previous matched article (not before the next one)

**Technical Changes:**
```javascript
// Article matching with penalty for mismatched numbers
if (oldArticleNum && newArticleNum) {
  if (oldArticleNum === newArticleNum) {
    similarity = Math.min(1.0, similarity + 0.4); // 40% bonus
  } else {
    similarity = similarity * 0.5; // 50% penalty
  }
}

// Deleted article sort key: after previous match
function getDeletedSortKey(oldIdx) {
  for (let i = oldIdx - 1; i >= 0; i--) {
    if (articleMap.has(i)) {
      const newIdx = articleMap.get(i);
      return newIdx + 0.001 + (oldIdx - i) * 0.0001;
    }
  }
  return -1 + oldIdx * 0.001; // Before first if no previous match
}
```

### v5.7 (2025-12-06)
**New Features:**
- **Column order option**: New `--order` parameter to control column display order
  - `--order=new-old`: 変更後（新）→ 変更前（旧） **(default)**
  - `--order=old-new`: 変更前（旧）→ 変更後（新）
- Header labels automatically adjust based on order setting
- All cell contents (deleted, added, modified) correctly positioned based on order

**Usage:**
```bash
# Default: 新→旧 (変更後 | 変更前)
node comparison_docx_generator_v5.js old.docx new.docx output.docx "規則名" "日付"

# 旧→新 (変更前 | 変更後)
node comparison_docx_generator_v5.js old.docx new.docx output.docx "規則名" "日付" --order=old-new
```

**Technical Changes:**
```javascript
// Order parameter in generateComparisonTable (default: new-old)
function generateComparisonTable(oldParagraphs, newParagraphs, title, documentName, date, order = "new-old") {
  const isNewOld = (order === 'new-old');
  const leftHeader = isNewOld ? "変更後（新）" : "変更前（旧）";
  const rightHeader = isNewOld ? "変更前（旧）" : "変更後（新）";
  
  // Cell order based on isNewOld flag
  const leftCell = new TableCell({
    children: isNewOld ? newCellChildren : oldCellChildren,
    ...
  });
}
```

### v5.5 (2025-12-05)
**Critical Fix:**
- **Output order correction**: Deleted and added articles now appear in proper document order
  - Previously: All deleted articles appeared at the end, followed by all added articles
  - Now: Deleted articles appear just before the next matched article (their logical position)
  - Added articles appear at their position in the new document

**Technical Changes:**
```javascript
// Collect all rows with sort keys
const rowData = [];

// Matched articles: sortKey = newIdx
rowData.push({ sortKey: newIdx, row: ... });

// Deleted articles: sortKey = position before next matched article
function getDeletedSortKey(oldIdx) {
  for (let i = oldIdx + 1; i < oldArticles.length; i++) {
    if (articleMap.has(i)) {
      return articleMap.get(i) - 0.001; // Just before next match
    }
  }
  return Infinity; // No match after, go to end
}

// Added articles: sortKey = j (position in new document)
rowData.push({ sortKey: j, row: ... });

// Sort and output
rowData.sort((a, b) => a.sortKey - b.sortKey);
```

### v5.4 (2025-12-05)
**New Features:**
- **Article number matching bonus**: When article numbers match (e.g., both "第1条"), a 30% similarity bonus is applied, preventing incorrect matches when text is similar but numbers differ
- **Additional heading patterns**: 
  - 第○編 (Parts)
  - 第○節 (Sections)  
  - 第○款 (Subsections)
  - 別表 (Appendix tables)
  - 様式 (Forms)
  - 別紙 (Attachments)

**Technical Changes:**
```javascript
// Article number matching with bonus
const oldArticleNum = extractArticleNumber(oldArt.header);
const newArticleNum = extractArticleNumber(newArt.header);
if (oldArticleNum && newArticleNum && oldArticleNum === newArticleNum) {
  similarity = Math.min(1.0, similarity + 0.3); // 30% bonus
}
```

### v5.3 (2025-12-05)
**New Features:**
- **Unicode normalization (NFKC)**: Automatically normalizes text before comparison
  - Handles decomposed characters (か+゛ → が) common in PDF/OCR extracted text
  - Unifies full-width and half-width characters (Ａ → A, １ → 1)
  - Removes variation selectors
- **legalKanjiBranch pattern**: Recognizes "第一条の2", "第十条の3" style headings

**Technical Changes:**
```javascript
// calculateSimilarity now applies NFKC normalization
function calculateSimilarity(para1, para2) {
  para1 = para1.normalize('NFKC');
  para2 = para2.normalize('NFKC');
  // ...
}

// New pattern added before legalKanji
legalKanjiBranch: {
  regex: /^第[一二三四五六七八九十百千]+条の[0-9０-９一二三四五六七八九十]+/,
  level: 1
}
```

### v5.2 (2025-12-05)
**Bug Fixes:**
- **Fixed legalBranch pattern priority**: "第○条の○" (e.g., 第1条の2) now correctly recognized before "第○条"

**Root Cause Analysis:**
JavaScript objects maintain insertion order (ES2015+). The `legalBranch` pattern was defined after `legal` in the PATTERNS object, causing "第1条の2" to match `legal` pattern ("第1条") first, ignoring the "の2" suffix.

**Technical Changes:**
```javascript
// Before v5.2 - legal evaluated first
const PATTERNS = {
  legal: { regex: /^第[0-9０-９]+条/, ... },        // Matches first
  legalBranch: { regex: /^第[0-9０-９]+条の[0-9０-９]+/, ... },  // Never reached
  ...
};

// After v5.2 - legalBranch evaluated first (more specific pattern)
const PATTERNS = {
  legalBranch: { regex: /^第[0-9０-９]+条の[0-9０-９]+/, ... },  // Matches first
  legal: { regex: /^第[0-9０-９]+条/, ... },        // Fallback
  ...
};
```

**Impact:**
Documents with branch article numbers (第1条の2, 第5条の3, etc.) are now correctly parsed as separate articles.

### v5.1 (2025-12-05)
**Bug Fixes:**
- **Fixed paragraph order preservation**: Non-numbered items (e.g., 始業時刻/終業時刻) now maintain original document order
- **Stable sort implementation**: Items with same itemNum preserve their original sequence

**Root Cause Analysis:**
The `matchParagraphsBySimilarity` function returned matches sorted by similarity score (highest first), not document order. When these matches were processed, items without numbers (itemNum=9999) could appear in arbitrary order.

**Technical Changes:**
```javascript
// Before v5.1 - matches processed in similarity order
for (const match of matchResult.matches) { ... }

// After v5.1 - matches sorted by document position first
const sortedMatches = [...matchResult.matches].sort((a, b) => a.newIndex - b.newIndex);
for (const match of sortedMatches) { ... }

// Stable sort for items with same itemNum
items.forEach((item, idx) => item.originalIndex = idx);
items.sort((a, b) => {
  if (a.itemNum !== b.itemNum) return a.itemNum - b.itemNum;
  return a.originalIndex - b.originalIndex;
});
```

**Display Fix Example:**
```
Before v5.1 (incorrect order):
終業時刻 午後6時00分    │ 終業時刻 午後5時00分
始業時刻 午前9時00分    │ 始業時刻 午前8時30分

After v5.1 (correct order):
始業時刻 午前9時00分    │ 始業時刻 午前8時30分
終業時刻 午後6時00分    │ 終業時刻 午後5時00分
```

### v5.0 (2024-12-04)
**Major Features:**
- **Grouped deletion display**: Consecutive deleted items show single "(削除)" label instead of repeating
- **Grouped addition display**: Consecutive added items show single "(新規追加)" label instead of repeating
- **Chapter heading support**: Recognizes "第○章" pattern as Level 1 headings
- **Appendix support**: Recognizes "附則" as Level 1 heading
- **Strikethrough on deleted headers**: Deleted article headers now properly have strikethrough formatting
- **No background colors**: Removed pink/blue background shading for cleaner output

**Display Improvements:**
```
Before v5.0:
第47条　労働者は...      │ (削除)
─────────────────────┼──────────────────
2　会社は...            │ (削除)     <- repeated
─────────────────────┼──────────────────
83. 労務提供上の...     │ (削除)     <- repeated
─────────────────────┼──────────────────
84. 企業秘密が...       │ (削除)     <- repeated

After v5.0:
第47条　労働者は...      │ (削除)     <- single label
2　会社は...            │
83. 労務提供上の...     │            <- no repeated labels
84. 企業秘密が...       │
85. 会社の名誉や...     │
86. 競業により...       │
```

### v4.0 (2025-10-30)
**Major Features:**
- **Hierarchical structure analysis**: Two-phase approach - first analyze structure, then compare
- **Level-aware pattern detection**: Each pattern assigned hierarchy level (1, 2, or variable)
- **Top-level article grouping**: Only Level 1 headings create article boundaries
- **Item number ordering**: Extracts numbers from sub-items and sorts correctly
- **Single-cell article display**: Merges all article content (heading + items) into one cell
- **No internal dividers**: Clean presentation with paragraph spacing instead of table rows
- **Changed items only**: Shows only modified/added/deleted items, skips unchanged

**Technical Improvements:**
- New `analyzeDocumentStructure()` function with level detection
- New `groupByTopLevelHeading()` function respecting hierarchy
- New `extractItemNumber()` function for sorting sub-items
- Enhanced cell construction with paragraph spacing instead of multiple rows
- Improved `plainNumber` pattern detection for simple numbered items

**Display Improvements:**
```
Before v4.0:
第5条(諸手当)          │ 第5条(諸手当)
─────────────────────┼──────────────────
(1) 通勤手当: 50,000  │ (1) 通勤手当: 30,000
─────────────────────┼──────────────────  <- unwanted divider
(新規追加)            │ (6) 家族手当
─────────────────────┼──────────────────  <- unwanted divider
(新規追加)            │ (7) 住宅手当

After v4.0:
第5条(諸手当)          │ 第5条(諸手当)
                      │
(1) 通勤手当: 50,000  │ (1) 通勤手当: 30,000
                      │                    <- clean spacing
(新規追加)            │ (6) 家族手当
                      │                    <- clean spacing
(新規追加)            │ (7) 住宅手当
```

### v3.2 (2025-10-30)
**Major Features:**
- **Automatic heading pattern detection**: Analyzes document structure and selects appropriate pattern
- **11 supported patterns**: legal, legalKanji, legalBranch, numbered, hierarchical, hyphenated, parentheses, singleParen, symbol, bracket, english
- **Intelligent scoring**: Counts pattern occurrences in first 50 paragraphs
- **Detailed logging**: Shows detected pattern and occurrence count
- **Smart fallback**: Always checks common patterns (legal, numbered) regardless of detection

**Technical Improvements:**
- New `detectHeadingPattern()` function with sampling and scoring
- Enhanced `isArticleHeader()` with pattern-specific and fallback logic
- Detection log shows primary and secondary pattern scores

**Use Cases Enhanced:**
```
Before v3.2:
User uploads document with "1.1", "1.2" format
Result: Manual pattern specification needed ❌

After v3.2:
User uploads any document format
Result: Automatic detection and correct parsing ✅
```

### v3.1 (2025-10-30)
- Markdown bold symbol removal (`**`)
- Numbered heading support ("番号. (見出し)")
- Full-width and half-width parenthesis support

### v3.0 (2025-10-30)
- Similarity-based paragraph matching
- Levenshtein distance algorithm
- Accurate change classification

### v2.1 (2025-10-30)
- Escaped period normalization
- Multi-line quoted block handling
- Improved paragraph boundary detection

## Best Practices

1. **Use consistent heading hierarchy** - Top-level (articles) should use Level 1 patterns, sub-items should use Level 2 patterns
2. **Number your sub-items** - Use (1), (2), 1., 2., etc. for automatic ordering
3. **Check structure analysis log** - Verify correct hierarchy detection: `📊 最上位レベル: 1`
4. **Maintain consistent patterns** - Use same format throughout document for best results
5. **Review article boundaries** - Ensure top-level headings correctly identify your articles

## Notes

- **Hierarchical structure analysis** understands document organization at multiple levels
- **Automatic hierarchy detection** works with 95%+ of corporate document formats
- **No manual configuration** required - just upload and run
- **Transparent analysis** - logs show detected patterns, levels, and article count
- **Intelligent item ordering** - sub-items sorted by number even when added/deleted
- **Clean presentation** - single cell per article with no internal dividers
- Script reports: hierarchy levels, detected patterns, changed articles, and statistics
