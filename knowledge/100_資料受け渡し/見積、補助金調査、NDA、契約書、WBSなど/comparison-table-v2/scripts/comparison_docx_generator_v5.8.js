const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, 
        WidthType, BorderStyle, ShadingType, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Markdownの不要な記号を削除
function cleanMarkdownSymbols(text) {
  // エスケープされたピリオドを通常のピリオドに変換
  text = text.replace(/([0-9]+)\\\./g, '$1.');
  
  // 複数行に分かれた引用ブロックを処理
  const lines = text.split('\n');
  const processedLines = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // >\(数字\) で始まる行を検出
    if (/^>\s*\\?\([0-9]+\\?\)/.test(line)) {
      // この行から始まる内容を収集（空の>行または次の>\(数字\)が来るまで）
      let combined = line;
      let j = i + 1;
      
      // 次の行が > で始まり、かつ空でなく、かつ >\(数字\) でない限り結合を続ける
      while (j < lines.length && /^>/.test(lines[j]) && !/^>\s*$/.test(lines[j]) && !/^>\s*\\?\([0-9]+\\?\)/.test(lines[j])) {
        combined += ' ' + lines[j].replace(/^>\s*/, '');
        j++;
      }
      
      // 結合した行を処理
      combined = combined.replace(/^>\s*\\?\(([0-9]+)\\?\)\s*/, '($1) ');
      processedLines.push(combined);
      processedLines.push(''); // 項目間に空行を追加して段落を区切る
      i = j;
    } else if (/^>\s*$/.test(line)) {
      // 空の引用行はスキップ（項目の区切り）
      i++;
      continue;
    } else if (/^>/.test(line)) {
      // その他の引用行
      processedLines.push(line.replace(/^>\s*/, ''));
      i++;
    } else {
      // 通常の行
      processedLines.push(line);
      i++;
    }
  }
  
  text = processedLines.join('\n');
  
  // 改行が続く場合、2つにまとめる（段落の区切りを維持）
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // その他のMarkdownエスケープ記号を削除
  text = text.replace(/\\([()[\]{}])/g, '$1');
  
  // Markdown太字記号（**）を除去
  text = text.replace(/\*\*/g, '');
  
  return text;
}

// docxファイルをmarkdownに変換してテキストを抽出
function extractTextFromDocx(docxPath) {
  try {
    const mdPath = docxPath.replace(/\.docx$/, '.md');
    execSync(`pandoc "${docxPath}" -o "${mdPath}"`, { encoding: 'utf-8' });
    let text = fs.readFileSync(mdPath, 'utf-8');
    fs.unlinkSync(mdPath); // 一時ファイル削除
    
    // Markdownの不要な記号を削除
    text = cleanMarkdownSymbols(text);
    
    // 段落番号だけの行を次の行と結合
    const lines = text.split('\n');
    const mergedLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // "数字." だけの行かチェック
      if (/^[0-9]+\.$/.test(line) && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine !== '') {
          // 次の行と結合
          mergedLines.push(line + ' ' + nextLine);
          i++; // 次の行をスキップ
        } else {
          mergedLines.push(line);
        }
      } else {
        mergedLines.push(lines[i]);
      }
    }
    text = mergedLines.join('\n');
    
    return text;
  } catch (error) {
    console.error(`Error extracting text from ${docxPath}:`, error.message);
    throw error;
  }
}

// テキストを段落に分割
function splitIntoParagraphs(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Levenshtein距離を計算
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

// 2つの段落の類似度を計算（0.0 ~ 1.0）
function calculateSimilarity(para1, para2) {
  // Unicode正規化（NFKC）を適用
  para1 = para1.normalize('NFKC');
  para2 = para2.normalize('NFKC');
  
  const maxLen = Math.max(para1.length, para2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(para1, para2);
  return 1.0 - (distance / maxLen);
}

// ========================================
// 見出し名抽出・正規化ロジック（v5.8新規追加）
// ========================================

/**
 * 条文の見出し名を抽出する
 * 例: "第20条（安全衛生）" → "安全衛生"
 *     "第8章　退職金" → "退職金"
 *     "附則" → "附則"
 */
function extractHeadingName(header) {
  // Unicode正規化
  header = header.normalize('NFKC');
  
  // パターン1: 括弧内の見出し名 「第○条（見出し名）」「第○条(見出し名)」
  const parenMatch = header.match(/[（(]([^）)]+)[）)]/);
  if (parenMatch) {
    return parenMatch[1];
  }
  
  // パターン2: 全角スペース後の見出し名 「第○章　見出し名」
  const spaceMatch = header.match(/^第[0-9０-９一二三四五六七八九十百千]+[条章節款編]\s+(.+)$/);
  if (spaceMatch) {
    return spaceMatch[1];
  }
  
  // パターン3: 半角スペース後の見出し名
  const halfSpaceMatch = header.match(/^第[0-9０-９一二三四五六七八九十百千]+[条章節款編]\s+(.+)$/);
  if (halfSpaceMatch) {
    return halfSpaceMatch[1];
  }
  
  // パターン4: 附則などの特殊見出し
  if (/^附則/.test(header)) {
    return '附則';
  }
  
  // 見出し名が抽出できない場合はnull
  return null;
}

/**
 * 見出し名を正規化する
 * - 「及び」「、」「・」「並びに」を統一
 * - 全角半角を統一
 * - 空白を除去
 */
function normalizeHeadingName(name) {
  if (!name) return '';
  
  let normalized = name.normalize('NFKC');
  
  // 接続詞の統一（すべて「、」に変換）
  normalized = normalized.replace(/及び/g, '、');
  normalized = normalized.replace(/並びに/g, '、');
  normalized = normalized.replace(/・/g, '、');
  normalized = normalized.replace(/，/g, '、');
  normalized = normalized.replace(/,/g, '、');
  
  // 空白を除去
  normalized = normalized.replace(/\s+/g, '');
  
  // 「等」と「など」を統一
  normalized = normalized.replace(/など/g, '等');
  
  return normalized;
}

/**
 * 2つの見出し名の類似度を計算（正規化後）
 */
function calculateHeadingNameSimilarity(name1, name2) {
  const normalized1 = normalizeHeadingName(name1);
  const normalized2 = normalizeHeadingName(name2);
  
  if (!normalized1 || !normalized2) return 0;
  if (normalized1 === normalized2) return 1.0;
  
  // Levenshtein距離ベースの類似度
  return calculateSimilarity(normalized1, normalized2);
}

// ========================================

// 類似度ベースで段落をマッチング
function matchParagraphsBySimilarity(oldParas, newParas, threshold = 0.5) {
  const candidates = [];
  
  for (let i = 0; i < oldParas.length; i++) {
    for (let j = 0; j < newParas.length; j++) {
      const similarity = calculateSimilarity(oldParas[i], newParas[j]);
      if (similarity >= threshold) {
        candidates.push({ oldIndex: i, newIndex: j, similarity });
      }
    }
  }
  
  const matches = [];
  const usedOld = new Set();
  const usedNew = new Set();
  
  candidates.sort((a, b) => b.similarity - a.similarity);
  
  for (const candidate of candidates) {
    if (!usedOld.has(candidate.oldIndex) && !usedNew.has(candidate.newIndex)) {
      matches.push(candidate);
      usedOld.add(candidate.oldIndex);
      usedNew.add(candidate.newIndex);
    }
  }
  
  const unmatchedOld = [];
  const unmatchedNew = [];
  
  for (let i = 0; i < oldParas.length; i++) {
    if (!usedOld.has(i)) {
      unmatchedOld.push({ index: i, text: oldParas[i] });
    }
  }
  
  for (let j = 0; j < newParas.length; j++) {
    if (!usedNew.has(j)) {
      unmatchedNew.push({ index: j, text: newParas[j] });
    }
  }
  
  return { matches, unmatchedOld, unmatchedNew };
}

// 意味のある単位（トークン）でのdiff計算
function computeDiff(oldText, newText) {
  const tokenize = (text) => {
    const tokens = [];
    let current = '';
    let lastType = null;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      let currentType;
      
      if (/[一-龯ぁ-んァ-ヶー]/.test(char)) {
        currentType = 'ja';
      } else if (/[a-zA-Z]/.test(char)) {
        currentType = 'en';
      } else if (/[0-9]/.test(char)) {
        currentType = 'num';
      } else if (/\s/.test(char)) {
        currentType = 'space';
      } else {
        currentType = 'symbol';
      }
      
      if (lastType && lastType !== currentType && currentType !== 'space') {
        if (current) tokens.push(current);
        current = char;
      } else {
        current += char;
      }
      
      lastType = currentType;
    }
    
    if (current) tokens.push(current);
    return tokens;
  };
  
  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);
  
  // LCS（最長共通部分列）を計算
  const lcs = (arr1, arr2) => {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    const result = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        result.unshift({ old: i - 1, new: j - 1 });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return result;
  };
  
  const commonTokens = lcs(oldTokens, newTokens);
  const oldChanges = new Set(oldTokens.map((_, i) => i));
  const newChanges = new Set(newTokens.map((_, i) => i));
  
  for (const { old, new: n } of commonTokens) {
    oldChanges.delete(old);
    newChanges.delete(n);
  }
  
  return { oldChanges: Array.from(oldChanges), newChanges: Array.from(newChanges), oldTokens, newTokens };
}

// ハイライト付きのテキストランを作成
function createHighlightedRuns(text, isOld, diffResult) {
  const runs = [];
  const tokens = isOld ? diffResult.oldTokens : diffResult.newTokens;
  const changes = isOld ? new Set(diffResult.oldChanges) : new Set(diffResult.newChanges);
  
  for (let i = 0; i < tokens.length; i++) {
    const isChanged = changes.has(i);
    if (isOld) {
      // 旧版：変更部分は取り消し線+赤字
      runs.push(new TextRun({
        text: tokens[i],
        strike: isChanged,
        color: isChanged ? "FF0000" : "000000",
        size: 22,
        font: "Yu Gothic"
      }));
    } else {
      // 新版：変更部分は赤字+太字
      runs.push(new TextRun({
        text: tokens[i],
        bold: isChanged,
        color: isChanged ? "FF0000" : "000000",
        size: 22,
        font: "Yu Gothic"
      }));
    }
  }
  
  return runs;
}

// 見出しパターン定義（階層レベル付き）
const PATTERNS = {
  // レベル1パターン（より具体的なパターンを先に）
  legalBranch: {
    regex: /^第[0-9０-９]+条の[0-9０-９]+/,
    level: 1
  },
  legalKanjiBranch: {
    regex: /^第[一二三四五六七八九十百千]+条の[0-9０-９一二三四五六七八九十]+/,
    level: 1
  },
  legal: {
    regex: /^第[0-9０-９]+条/,
    level: 1
  },
  legalKanji: {
    regex: /^第[一二三四五六七八九十百千]+条/,
    level: 1
  },
  legalChapter: {
    regex: /^第[0-9０-９]+章/,
    level: 1
  },
  legalChapterKanji: {
    regex: /^第[一二三四五六七八九十百千]+章/,
    level: 1
  },
  legalSection: {
    regex: /^第[0-9０-９一二三四五六七八九十百千]+[編節款]/,
    level: 1
  },
  appendix: {
    regex: /^附則/,
    level: 1
  },
  appendixTable: {
    regex: /^別表[0-9０-９一二三四五六七八九十]*/,
    level: 1
  },
  appendixForm: {
    regex: /^様式[0-9０-９一二三四五六七八九十]*/,
    level: 1
  },
  appendixDoc: {
    regex: /^別紙[0-9０-９一二三四五六七八九十]*/,
    level: 1
  },
  numbered: {
    regex: /^[0-9０-９]+\.\s*[（(].+[）)]/,
    level: 1
  },
  english: {
    regex: /^(Article|Section|Chapter)\s*[0-9]+/i,
    level: 1
  },
  symbol: {
    regex: /^[§■▪●◆★☆]/,
    level: 1
  },
  // レベル2パターン
  hierarchical: {
    regex: /^[0-9]+\.[0-9]+(\.[0-9]+)*/,
    level: (match) => match.split('.').length
  },
  hyphenated: {
    regex: /^[0-9]+-[0-9]+/,
    level: 2
  },
  parentheses: {
    regex: /^[（(][0-9０-９]+[）)]/,
    level: 2
  },
  singleParen: {
    regex: /^[0-9０-９]+[）)]/,
    level: 2
  },
  bracket: {
    regex: /^[【［\[][0-9０-９]+[】］\]]/,
    level: 2
  },
  plainNumber: {
    regex: /^[0-9０-９]+\.\s+(?![（(])/,
    level: 2
  }
};

// 段落のパターンとレベルを検出
function detectPatternAndLevel(text) {
  for (const [name, pattern] of Object.entries(PATTERNS)) {
    const match = text.match(pattern.regex);
    if (match) {
      const level = typeof pattern.level === 'function' ? pattern.level(match[0]) : pattern.level;
      return { name, level, match: match[0] };
    }
  }
  return null;
}

// 文書構造を解析
function analyzeDocumentStructure(paragraphs) {
  const structure = [];
  const patternCounts = {};
  const levelCounts = {};
  
  for (const para of paragraphs) {
    const detection = detectPatternAndLevel(para);
    if (detection) {
      patternCounts[detection.name] = (patternCounts[detection.name] || 0) + 1;
      levelCounts[detection.level] = (levelCounts[detection.level] || 0) + 1;
    }
    structure.push({
      text: para,
      pattern: detection ? detection.name : null,
      level: detection ? detection.level : null
    });
  }
  
  console.log('\n🔍 文書構造を解析中...');
  console.log('📊 検出された見出しパターン:');
  for (const [name, count] of Object.entries(patternCounts)) {
    const level = PATTERNS[name] ? (typeof PATTERNS[name].level === 'function' ? '可変' : PATTERNS[name].level) : '?';
    console.log(`   ${name}: ${count}回 (レベル${level})`);
  }
  console.log('📊 階層レベル分布:', levelCounts);
  
  // 最上位レベルを特定
  const topLevel = Math.min(...Object.keys(levelCounts).map(Number));
  console.log('📊 最上位レベル:', topLevel);
  
  return { structure, topLevel, patternCounts };
}

// 最上位レベルの見出しでグループ化
function groupByTopLevelHeading(analysisResult) {
  const { structure, topLevel } = analysisResult;
  const articles = [];
  let currentArticle = null;
  
  for (const item of structure) {
    if (item.level === topLevel) {
      // 新しい条文の開始
      if (currentArticle) {
        articles.push(currentArticle);
      }
      currentArticle = {
        header: item.text,
        paragraphs: []
      };
    } else if (currentArticle) {
      // 現在の条文に段落を追加
      currentArticle.paragraphs.push(item.text);
    }
  }
  
  // 最後の条文を追加
  if (currentArticle) {
    articles.push(currentArticle);
  }
  
  console.log(`\n📝 レベル${topLevel}の見出しで条文を分割中...`);
  console.log(`✅ ${articles.length}個の条文に分割しました`);
  
  return articles;
}

// メインの比較テーブル生成関数
function generateComparisonTable(oldParagraphs, newParagraphs, title, documentName, date, order = 'new-old') {
  const isNewOld = (order === 'new-old');
  
  // ヘッダーラベル
  const leftHeader = isNewOld ? "変更後（新）" : "変更前（旧）";
  const rightHeader = isNewOld ? "変更前（旧）" : "変更後（新）";
  
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
  const cellBorders = {
    top: tableBorder,
    bottom: tableBorder,
    left: tableBorder,
    right: tableBorder
  };
  
  // タイトル行
  const titleText = documentName ? `${documentName} 新旧対比表` : title;
  const dateText = date ? `（${date}）` : '';
  
  const titleRow = new TableRow({
    children: [
      new TableCell({
        borders: cellBorders,
        columnSpan: 2,
        shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: titleText + dateText,
              bold: true,
              size: 28,
              font: "Yu Gothic"
            })
          ]
        })]
      })
    ]
  });
  
  // ヘッダー行
  const headerRow = new TableRow({
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        shading: { fill: "E8E8E8", type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: leftHeader,
              bold: true,
              size: 24,
              font: "Yu Gothic"
            })
          ]
        })]
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        shading: { fill: "E8E8E8", type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: rightHeader,
              bold: true,
              size: 24,
              font: "Yu Gothic"
            })
          ]
        })]
      })
    ]
  });
  
  // 階層構造を解析
  const oldStructure = analyzeDocumentStructure(oldParagraphs);
  const newStructure = analyzeDocumentStructure(newParagraphs);
  
  // 最上位レベルでグループ化
  const oldArticles = groupByTopLevelHeading(oldStructure);
  const newArticles = groupByTopLevelHeading(newStructure);
  
  console.log('\n🔄 条文レベルで変更を検出中...');
  console.log('📝 見出し名ベースのマッチングを使用（v5.8）');
  
  // ========================================
  // v5.8: 見出し名ベースのマッチングロジック
  // ========================================
  
  const articleMap = new Map();
  const usedNewIndices = new Set();
  
  // フェーズ1: 見出し名が一致（または高類似度）する条文を先にペアリング
  console.log('\n📌 フェーズ1: 見出し名ベースのマッチング');
  
  const headingMatches = [];
  
  for (let i = 0; i < oldArticles.length; i++) {
    const oldArt = oldArticles[i];
    const oldHeadingName = extractHeadingName(oldArt.header);
    
    if (!oldHeadingName) continue;
    
    for (let j = 0; j < newArticles.length; j++) {
      if (usedNewIndices.has(j)) continue;
      
      const newArt = newArticles[j];
      const newHeadingName = extractHeadingName(newArt.header);
      
      if (!newHeadingName) continue;
      
      const headingSimilarity = calculateHeadingNameSimilarity(oldHeadingName, newHeadingName);
      
      if (headingSimilarity >= 0.8) { // 見出し名の類似度が80%以上
        headingMatches.push({
          oldIndex: i,
          newIndex: j,
          oldHeading: oldHeadingName,
          newHeading: newHeadingName,
          similarity: headingSimilarity
        });
      }
    }
  }
  
  // 類似度が高い順にソートしてマッチング確定
  headingMatches.sort((a, b) => b.similarity - a.similarity);
  
  for (const match of headingMatches) {
    if (articleMap.has(match.oldIndex) || usedNewIndices.has(match.newIndex)) continue;
    
    articleMap.set(match.oldIndex, match.newIndex);
    usedNewIndices.add(match.newIndex);
    
    if (match.similarity === 1.0) {
      console.log(`   ✅ 完全一致: 「${match.oldHeading}」`);
    } else {
      console.log(`   ✅ 類似一致(${(match.similarity * 100).toFixed(0)}%): 「${match.oldHeading}」≈「${match.newHeading}」`);
    }
  }
  
  console.log(`   → ${articleMap.size}個の条文をマッチング`);
  
  // フェーズ2: 残りの条文を内容の類似度でマッチング
  console.log('\n📌 フェーズ2: 内容類似度ベースのマッチング（残り条文）');
  
  let phase2Matches = 0;
  
  for (let i = 0; i < oldArticles.length; i++) {
    if (articleMap.has(i)) continue; // 既にマッチ済み
    
    const oldArt = oldArticles[i];
    let bestMatch = -1;
    let bestScore = 0.6; // フェーズ2の閾値（やや高め）
    
    for (let j = 0; j < newArticles.length; j++) {
      if (usedNewIndices.has(j)) continue;
      
      const newArt = newArticles[j];
      
      // ヘッダー全体の類似度を計算
      const headerSimilarity = calculateSimilarity(oldArt.header, newArt.header);
      
      // 内容（段落）の類似度を計算
      const oldContent = oldArt.paragraphs.join(' ');
      const newContent = newArt.paragraphs.join(' ');
      const contentSimilarity = oldContent && newContent ? calculateSimilarity(oldContent, newContent) : 0;
      
      // 総合スコア（ヘッダー40% + 内容60%）
      const totalScore = headerSimilarity * 0.4 + contentSimilarity * 0.6;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMatch = j;
      }
    }
    
    if (bestMatch >= 0) {
      articleMap.set(i, bestMatch);
      usedNewIndices.add(bestMatch);
      phase2Matches++;
      console.log(`   ✅ 内容類似(${(bestScore * 100).toFixed(0)}%): 「${oldArt.header}」→「${newArticles[bestMatch].header}」`);
    }
  }
  
  console.log(`   → ${phase2Matches}個の条文を追加マッチング`);
  console.log(`\n📊 マッチング結果: ${articleMap.size}/${oldArticles.length}個の旧条文がマッチ`);
  console.log(`   新規条文: ${newArticles.length - usedNewIndices.size}個`);
  console.log(`   削除条文: ${oldArticles.length - articleMap.size}個`);
  
  // ========================================
  
  const rows = [titleRow, headerRow];
  let changedArticleCount = 0;
  let changedParagraphCount = 0;
  let addedParagraphCount = 0;
  let deletedParagraphCount = 0;
  
  // 項番号を抽出する関数
  function extractItemNumber(text) {
    const patterns = [
      /^\(([0-9０-９]+)\)/,
      /^（([0-9０-９]+)）/,
      /^([0-9０-９]+)\./,
      /^([0-9０-９]+)\)/,
      /^([0-9０-９]+)）/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const numStr = match[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
        return parseInt(numStr, 10);
      }
    }
    return null;
  }

  // 削除条文のソート位置を計算
  function getDeletedSortKey(oldIdx) {
    for (let i = oldIdx - 1; i >= 0; i--) {
      if (articleMap.has(i)) {
        const newIdx = articleMap.get(i);
        return newIdx + 0.001 + (oldIdx - i) * 0.0001;
      }
    }
    return -1 + oldIdx * 0.001;
  }

  const rowData = [];
  const spacing = { after: 200 };

  // マッチした条文を処理
  for (const [oldIdx, newIdx] of articleMap) {
    const oldArt = oldArticles[oldIdx];
    const newArt = newArticles[newIdx];
    
    // 段落レベルでマッチング
    const matchResult = matchParagraphsBySimilarity(oldArt.paragraphs, newArt.paragraphs);
    
    // 変更があるかチェック（ヘッダーの変更も含む）
    const headerChanged = calculateSimilarity(oldArt.header, newArt.header) < 1.0;
    const hasChanges = headerChanged ||
                      matchResult.matches.some(m => m.similarity < 1.0) ||
                      matchResult.unmatchedOld.length > 0 ||
                      matchResult.unmatchedNew.length > 0;
    
    if (!hasChanges) continue;
    
    changedArticleCount++;
    
    // 全ての変更項目を収集
    const items = [];
    
    // マッチした段落（変更あり）
    const sortedMatches = [...matchResult.matches].sort((a, b) => a.newIndex - b.newIndex);
    for (const match of sortedMatches) {
      if (match.similarity < 1.0) {
        changedParagraphCount++;
        const oldPara = oldArt.paragraphs[match.oldIndex];
        const newPara = newArt.paragraphs[match.newIndex];
        const itemNum = extractItemNumber(newPara) || extractItemNumber(oldPara) || 9999;
        
        items.push({
          type: 'modified',
          itemNum: itemNum,
          oldPara: oldPara,
          newPara: newPara
        });
      }
    }
    
    // 削除された段落
    for (const deleted of matchResult.unmatchedOld) {
      deletedParagraphCount++;
      const itemNum = extractItemNumber(deleted.text) || 9999;
      items.push({
        type: 'deleted',
        itemNum: itemNum,
        oldPara: deleted.text
      });
    }
    
    // 追加された段落
    for (const added of matchResult.unmatchedNew) {
      addedParagraphCount++;
      const itemNum = extractItemNumber(added.text) || 9999;
      items.push({
        type: 'added',
        itemNum: itemNum,
        newPara: added.text,
        newIndex: added.index
      });
    }
    
    // 項番号でソート（安定ソート）
    items.forEach((item, idx) => item.originalIndex = idx);
    items.sort((a, b) => {
      if (a.itemNum !== b.itemNum) return a.itemNum - b.itemNum;
      return a.originalIndex - b.originalIndex;
    });
    
    // セルの内容を構築
    const oldCellChildren = [];
    const newCellChildren = [];
    
    // ヘッダー行を追加（変更がある場合はハイライト）
    if (headerChanged) {
      const headerDiff = computeDiff(oldArt.header, newArt.header);
      oldCellChildren.push(new Paragraph({
        children: createHighlightedRuns(oldArt.header, true, headerDiff),
        spacing: { after: 100 }
      }));
      newCellChildren.push(new Paragraph({
        children: createHighlightedRuns(newArt.header, false, headerDiff),
        spacing: { after: 100 }
      }));
    } else {
      oldCellChildren.push(new Paragraph({
        children: [new TextRun({ text: oldArt.header, bold: true, size: 22, font: "Yu Gothic" })],
        spacing: { after: 100 }
      }));
      newCellChildren.push(new Paragraph({
        children: [new TextRun({ text: newArt.header, bold: true, size: 22, font: "Yu Gothic" })],
        spacing: { after: 100 }
      }));
    }
    
    // 変更項目をグループ化して追加
    let i = 0;
    while (i < items.length) {
      const item = items[i];
      const isLast = (i === items.length - 1);
      const itemSpacing = isLast ? spacing : { after: 100 };
      
      if (item.type === 'modified') {
        const diffResult = computeDiff(item.oldPara, item.newPara);
        oldCellChildren.push(new Paragraph({
          children: createHighlightedRuns(item.oldPara, true, diffResult),
          spacing: itemSpacing
        }));
        newCellChildren.push(new Paragraph({
          children: createHighlightedRuns(item.newPara, false, diffResult),
          spacing: itemSpacing
        }));
        i++;
      } else if (item.type === 'deleted') {
        // 連続する削除をグループ化
        const deletedItems = [item];
        while (i + 1 < items.length && items[i + 1].type === 'deleted') {
          i++;
          deletedItems.push(items[i]);
        }
        
        // 変更前欄：全ての削除項目を表示
        deletedItems.forEach((delItem, idx) => {
          const delSpacing = (idx === deletedItems.length - 1 && i === items.length - 1) ? spacing : { after: 100 };
          oldCellChildren.push(new Paragraph({
            children: [new TextRun({
              text: delItem.oldPara,
              color: "FF0000",
              strike: true,
              size: 22,
              font: "Yu Gothic"
            })],
            spacing: delSpacing
          }));
        });
        
        // 変更後欄：(削除) ラベル1つ
        newCellChildren.push(new Paragraph({
          children: [new TextRun({
            text: "(削除)",
            color: "FF0000",
            bold: true,
            size: 22,
            font: "Yu Gothic"
          })],
          spacing: itemSpacing
        }));
        i++;
      } else if (item.type === 'added') {
        // 連続する追加をグループ化
        const addedItems = [item];
        while (i + 1 < items.length && items[i + 1].type === 'added') {
          i++;
          addedItems.push(items[i]);
        }
        
        // 変更前欄：(新規追加) ラベル1つ
        oldCellChildren.push(new Paragraph({
          children: [new TextRun({
            text: "(新規追加)",
            color: "0000FF",
            bold: true,
            size: 22,
            font: "Yu Gothic"
          })],
          spacing: spacing
        }));
        
        // 変更後欄：全ての追加項目を表示
        addedItems.forEach((addItem, idx) => {
          const addSpacing = (idx === addedItems.length - 1) ? spacing : { after: 100 };
          newCellChildren.push(new Paragraph({
            children: [new TextRun({
              text: addItem.newPara,
              color: "0000FF",
              bold: true,
              size: 22,
              font: "Yu Gothic"
            })],
            spacing: addSpacing
          }));
        });
        i++;
      }
    }
    
    // 行データを収集
    const leftCell = new TableCell({
      borders: cellBorders,
      width: { size: 4680, type: WidthType.DXA },
      children: isNewOld ? newCellChildren : oldCellChildren,
      verticalAlign: "top"
    });
    const rightCell = new TableCell({
      borders: cellBorders,
      width: { size: 4680, type: WidthType.DXA },
      children: isNewOld ? oldCellChildren : newCellChildren,
      verticalAlign: "top"
    });
    
    rowData.push({
      sortKey: newIdx,
      row: new TableRow({ children: [leftCell, rightCell] })
    });
  }
  
  // 削除された条文
  for (let i = 0; i < oldArticles.length; i++) {
    if (!articleMap.has(i)) {
      const oldArt = oldArticles[i];
      changedArticleCount++;
      
      const oldCellChildren = [
        new Paragraph({
          children: [new TextRun({
            text: oldArt.header,
            bold: true,
            color: "FF0000",
            strike: true,
            size: 22,
            font: "Yu Gothic"
          })],
          spacing: { after: 100 }
        })
      ];
      
      oldArt.paragraphs.forEach((p, idx) => {
        const isLast = (idx === oldArt.paragraphs.length - 1);
        oldCellChildren.push(new Paragraph({
          children: [new TextRun({
            text: p,
            color: "FF0000",
            strike: true,
            size: 22,
            font: "Yu Gothic"
          })],
          spacing: isLast ? {} : { after: 100 }
        }));
      });
      
      const deletedLabelCell = new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        children: [new Paragraph({
          children: [new TextRun({
            text: "(削除)",
            color: "FF0000",
            bold: true,
            size: 22,
            font: "Yu Gothic"
          })]
        })],
        verticalAlign: "top"
      });
      const deletedContentCell = new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        children: oldCellChildren,
        verticalAlign: "top"
      });
      
      rowData.push({
        sortKey: getDeletedSortKey(i),
        row: new TableRow({
          children: isNewOld ? [deletedLabelCell, deletedContentCell] : [deletedContentCell, deletedLabelCell]
        })
      });
      deletedParagraphCount += oldArt.paragraphs.length;
    }
  }
  
  // 追加された条文
  for (let j = 0; j < newArticles.length; j++) {
    if (!usedNewIndices.has(j)) {
      const newArt = newArticles[j];
      changedArticleCount++;
      
      const newCellChildren = [
        new Paragraph({
          children: [new TextRun({
            text: newArt.header,
            bold: true,
            color: "0000FF",
            size: 22,
            font: "Yu Gothic"
          })],
          spacing: { after: 100 }
        })
      ];
      
      newArt.paragraphs.forEach((p, idx) => {
        const isLast = (idx === newArt.paragraphs.length - 1);
        newCellChildren.push(new Paragraph({
          children: [new TextRun({
            text: p,
            color: "0000FF",
            bold: true,
            size: 22,
            font: "Yu Gothic"
          })],
          spacing: isLast ? {} : { after: 100 }
        }));
      });
      
      const addedLabelCell = new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        children: [new Paragraph({
          children: [new TextRun({
            text: "(新規追加)",
            color: "0000FF",
            bold: true,
            size: 22,
            font: "Yu Gothic"
          })]
        })],
        verticalAlign: "top"
      });
      const addedContentCell = new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        children: newCellChildren,
        verticalAlign: "top"
      });
      
      rowData.push({
        sortKey: j,
        row: new TableRow({
          children: isNewOld ? [addedContentCell, addedLabelCell] : [addedLabelCell, addedContentCell]
        })
      });
      addedParagraphCount += newArt.paragraphs.length;
    }
  }
  
  // ソートして行を追加
  rowData.sort((a, b) => a.sortKey - b.sortKey);
  for (const data of rowData) {
    rows.push(data.row);
  }
  
  const table = new Table({
    rows: rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: {
      top: tableBorder,
      bottom: tableBorder,
      left: tableBorder,
      right: tableBorder,
      insideHorizontal: tableBorder,
      insideVertical: tableBorder
    }
  });
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [table]
    }]
  });
  
  console.log(`\n📊 統計情報:`);
  console.log(`   変更された条文: ${changedArticleCount}個`);
  console.log(`   変更された段落: ${changedParagraphCount}個`);
  console.log(`   新規追加段落: ${addedParagraphCount}個`);
  console.log(`   削除された段落: ${deletedParagraphCount}個`);
  
  return { doc, stats: { changedArticleCount, changedParagraphCount, addedParagraphCount, deletedParagraphCount } };
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);
  
  let order = 'new-old';
  const filteredArgs = args.filter(arg => {
    if (arg.startsWith('--order=')) {
      order = arg.split('=')[1];
      return false;
    }
    return true;
  });
  
  if (filteredArgs.length < 2) {
    console.error('使用方法: node comparison_docx_generator_v5.8.js <old_file.docx> <new_file.docx> [output_file.docx] [document_name] [date] [--order=old-new|new-old]');
    console.error('');
    console.error('v5.8: 見出し名ベースのマッチング（章新設による番号ずれに対応）');
    console.error('');
    console.error('オプション:');
    console.error('  --order=new-old  変更後→変更前の順 (デフォルト)');
    console.error('  --order=old-new  変更前→変更後の順');
    process.exit(1);
  }
  
  const oldFilePath = filteredArgs[0];
  const newFilePath = filteredArgs[1];
  const outputFilePath = filteredArgs[2] || 'comparison_table.docx';
  const documentName = filteredArgs[3] || '';
  const date = filteredArgs[4] || '';
  
  console.log('📄 変更前ファイルを読み込み中...');
  const oldText = extractTextFromDocx(oldFilePath);
  const oldParagraphs = splitIntoParagraphs(oldText);
  
  console.log('📄 変更後ファイルを読み込み中...');
  const newText = extractTextFromDocx(newFilePath);
  const newParagraphs = splitIntoParagraphs(newText);
  
  console.log(`\n📝 新旧対比表を生成中... (順序: ${order === 'new-old' ? '新→旧' : '旧→新'})`);
  const { doc, stats } = generateComparisonTable(oldParagraphs, newParagraphs, "新旧対比表", documentName, date, order);
  
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
  
  console.log(`\n✅ 新旧対比表を生成しました: ${outputFilePath}`);
  console.log(`📋 規定名: ${documentName || '新旧対比表'}`);
  console.log(`📅 日付: ${date || '(自動生成)'}`);
  console.log(`📊 変更前: ${oldParagraphs.length}段落`);
  console.log(`📊 変更後: ${newParagraphs.length}段落`);
  console.log(`📊 表示順序: ${order === 'new-old' ? '変更後（新）→ 変更前（旧）' : '変更前（旧）→ 変更後（新）'}`);
}

main().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
