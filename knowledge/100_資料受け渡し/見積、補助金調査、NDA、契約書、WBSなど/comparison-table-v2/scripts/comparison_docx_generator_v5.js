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
  // - 合成文字と分解文字を統一（「が」= か+゛ → が）
  // - 全角英数字を半角に統一
  // - 異体字セレクタを除去
  para1 = para1.normalize('NFKC');
  para2 = para2.normalize('NFKC');
  
  const maxLen = Math.max(para1.length, para2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(para1, para2);
  return 1.0 - (distance / maxLen);
}

// 類似度ベースで段落をマッチング
function matchParagraphsBySimilarity(oldParas, newParas, threshold = 0.5) {
  // 1. 各新旧段落ペアの類似度を計算
  const candidates = [];
  
  for (let i = 0; i < oldParas.length; i++) {
    for (let j = 0; j < newParas.length; j++) {
      const similarity = calculateSimilarity(oldParas[i], newParas[j]);
      if (similarity >= threshold) {
        candidates.push({ oldIndex: i, newIndex: j, similarity });
      }
    }
  }
  
  // 2. 類似度が高い順にソートして、マッチングを決定
  const matches = [];
  const usedOld = new Set();
  const usedNew = new Set();
  
  candidates.sort((a, b) => b.similarity - a.similarity);
  
  // 貪欲法で最適なペアを選択
  for (const candidate of candidates) {
    if (!usedOld.has(candidate.oldIndex) && !usedNew.has(candidate.newIndex)) {
      matches.push(candidate);
      usedOld.add(candidate.oldIndex);
      usedNew.add(candidate.newIndex);
    }
  }
  
  // 3. マッチしなかった段落を記録
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
    const token = tokens[i];
    const isChanged = changes.has(i);
    
    runs.push(new TextRun({
      text: token,
      color: isChanged ? (isOld ? "000000" : "FF0000") : "000000",
      bold: isChanged,
      underline: isChanged ? { type: "single" } : undefined,
      size: 22
    }));
  }
  
  return runs;
}

// ========== 新機能: 階層構造解析 ==========

// 各パターンの定義（正規表現 + 階層レベル）
// 注意: より具体的なパターンを先に配置（legalBranch → legal、legalKanjiBranch → legalKanji の順）
const PATTERNS = {
  legalBranch: { 
    regex: /^第[0-9０-９]+条の[0-9０-９]+/,
    level: 1,
    name: 'legalBranch'
  },
  legal: { 
    regex: /^第[0-9０-９]+条/,
    level: 1,
    name: 'legal'
  },
  legalChapter: { 
    regex: /^第[0-9０-９]+章/,
    level: 1,
    name: 'legalChapter'
  },
  legalPart: {
    regex: /^第[0-9０-９]+編/,
    level: 1,
    name: 'legalPart'
  },
  legalSection: {
    regex: /^第[0-9０-９]+節/,
    level: 1,
    name: 'legalSection'
  },
  legalSubsection: {
    regex: /^第[0-9０-９]+款/,
    level: 1,
    name: 'legalSubsection'
  },
  legalKanjiBranch: {
    regex: /^第[一二三四五六七八九十百千]+条の[0-9０-９一二三四五六七八九十]+/,
    level: 1,
    name: 'legalKanjiBranch'
  },
  legalKanji: { 
    regex: /^第[一二三四五六七八九十百千]+条/,
    level: 1,
    name: 'legalKanji'
  },
  appendixTable: {
    regex: /^別表[0-9０-９一二三四五六七八九十]*\s*/,
    level: 1,
    name: 'appendixTable'
  },
  appendixForm: {
    regex: /^様式[第]?[0-9０-９一二三四五六七八九十]*号?/,
    level: 1,
    name: 'appendixForm'
  },
  appendixAttachment: {
    regex: /^別紙[0-9０-９一二三四五六七八九十]*\s*/,
    level: 1,
    name: 'appendixAttachment'
  },
  numbered: { 
    regex: /^[0-9０-９]+\.\s+[（(]/,
    level: 1,
    name: 'numbered'
  },
  hierarchical: { 
    regex: /^[0-9０-９]+(\.[0-9０-９]+)+\.?\s/,
    level: 2,  // デフォルトはレベル2、実際はドットの数で判定
    name: 'hierarchical'
  },
  hyphenated: { 
    regex: /^[0-9０-９]+-[0-9０-９]+\.?\s/,
    level: 2,
    name: 'hyphenated'
  },
  parentheses: { 
    regex: /^[（(][0-9０-９]+[)）]/,
    level: 2,  // 通常は条文の配下
    name: 'parentheses'
  },
  singleParen: { 
    regex: /^[0-9０-９]+[)）]\s/,
    level: 2,
    name: 'singleParen'
  },
  symbol: { 
    regex: /^[§■▪●◆□]/,
    level: 1,
    name: 'symbol'
  },
  bracket: { 
    regex: /^[【［\[][0-9０-９]+[】］\]]/,
    level: 2,
    name: 'bracket'
  },
  english: { 
    regex: /^(Article|Section|Chapter|Part)\s+[0-9]+/i,
    level: 1,
    name: 'english'
  },
  plainNumber: {
    regex: /^[0-9０-９]+\.\s/,  // "2. " のような単純な番号
    level: 2,
    name: 'plainNumber'
  },
  appendix: {
    regex: /^附則$/,  // 「附則」単独
    level: 1,
    name: 'appendix'
  }
};

// 階層レベルを判定（hierarchicalパターンの場合）
function getHierarchicalLevel(text) {
  const match = text.match(/^([0-9０-９]+(?:\.[0-9０-９]+)*)/);
  if (!match) return 1;
  
  const parts = match[1].split('.');
  return parts.length; // "1.1" -> 2, "1.1.1" -> 3
}

// 段落の見出しパターンと階層レベルを判定
function analyzeHeading(para) {
  for (const [key, pattern] of Object.entries(PATTERNS)) {
    if (pattern.regex.test(para)) {
      let level = pattern.level;
      
      // hierarchicalパターンの場合は実際のレベルを計算
      if (key === 'hierarchical') {
        level = getHierarchicalLevel(para);
      }
      
      return {
        isHeading: true,
        pattern: key,
        level: level,
        text: para
      };
    }
  }
  
  return {
    isHeading: false,
    pattern: null,
    level: 0,
    text: para
  };
}

// 文書全体の構造を解析
function analyzeDocumentStructure(paragraphs) {
  console.log('\n🔍 文書構造を解析中...');
  
  // 1. 各段落を解析
  const analyzed = paragraphs.map(para => analyzeHeading(para));
  
  // 2. パターン別の出現回数をカウント
  const patternCounts = {};
  const levelCounts = {};
  
  for (const item of analyzed) {
    if (item.isHeading) {
      patternCounts[item.pattern] = (patternCounts[item.pattern] || 0) + 1;
      levelCounts[item.level] = (levelCounts[item.level] || 0) + 1;
    }
  }
  
  // 3. 最小レベル（最上位）を特定
  const levels = Object.keys(levelCounts).map(Number).sort((a, b) => a - b);
  const topLevel = levels.length > 0 ? levels[0] : 1;
  
  // 4. 統計情報を出力
  console.log(`📊 検出された見出しパターン:`);
  for (const [pattern, count] of Object.entries(patternCounts)) {
    const level = PATTERNS[pattern].level;
    console.log(`   ${pattern}: ${count}回 (レベル${level})`);
  }
  console.log(`📊 階層レベル分布:`, levelCounts);
  console.log(`📊 最上位レベル: ${topLevel}`);
  
  return {
    analyzed: analyzed,
    topLevel: topLevel,
    patternCounts: patternCounts,
    levelCounts: levelCounts
  };
}

// 最上位レベルの見出しで段落をグループ化
function groupByTopLevelHeading(structure) {
  const articles = [];
  let currentArticle = null;
  
  console.log(`\n📝 レベル${structure.topLevel}の見出しで条文を分割中...`);
  
  for (const item of structure.analyzed) {
    if (item.isHeading && item.level === structure.topLevel) {
      // 最上位レベルの見出し -> 新しい条文
      if (currentArticle) {
        articles.push(currentArticle);
      }
      currentArticle = {
        header: item.text,
        paragraphs: []
      };
    } else {
      // 最上位レベルでない -> 現在の条文に追加
      if (currentArticle) {
        currentArticle.paragraphs.push(item.text);
      } else {
        // 最初の条文見出しが来る前の内容
        articles.push({
          header: '',
          paragraphs: [item.text]
        });
      }
    }
  }
  
  if (currentArticle) {
    articles.push(currentArticle);
  }
  
  console.log(`✅ ${articles.length}個の条文に分割しました`);
  
  return articles;
}

// 対比表を生成する関数（階層構造対応版）
function generateComparisonTable(oldParagraphs, newParagraphs, title = "新旧対比表", documentName = "", date = "", order = "new-old") {
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
  const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
  
  // 順序に応じたヘッダーラベル
  const isNewOld = (order === 'new-old');
  const leftHeader = isNewOld ? "変更後（新）" : "変更前（旧）";
  const rightHeader = isNewOld ? "変更前（旧）" : "変更後（新）";
  
  if (!date) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    date = `${year}年${month}月${day}日`;
  }
  
  const titleRow = new TableRow({
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({
              text: documentName || title,
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
        shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: date,
              size: 20,
              font: "Yu Gothic"
            })
          ]
        })]
      })
    ]
  });
  
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
  
  // 条文番号を抽出するヘルパー関数
  function extractArticleNumber(header) {
    // 第○条、第○条の○、第○章 などから番号を抽出
    const patterns = [
      /^第([0-9０-９]+)条の([0-9０-９]+)/,  // 第1条の2 → [1, 2]
      /^第([0-9０-９]+)条/,                  // 第1条 → [1]
      /^第([0-9０-９]+)章/,                  // 第1章 → [1]
      /^第([一二三四五六七八九十百千]+)条の([0-9０-９一二三四五六七八九十]+)/, // 漢数字枝番
      /^第([一二三四五六七八九十百千]+)条/,  // 漢数字
    ];
    
    for (const pattern of patterns) {
      const match = header.match(pattern);
      if (match) {
        return match[0]; // マッチした部分全体を返す（第1条、第1条の2 など）
      }
    }
    return null;
  }
  
  // 条文同士をマッチング（条文番号一致にボーナスを付与）
  const articleMap = new Map();
  const usedNewIndices = new Set();
  
  // 見出しが完全一致または類似する条文を探す
  for (let i = 0; i < oldArticles.length; i++) {
    const oldArt = oldArticles[i];
    let bestMatch = -1;
    let bestScore = 0.5; // 閾値
    
    const oldArticleNum = extractArticleNumber(oldArt.header);
    
    for (let j = 0; j < newArticles.length; j++) {
      if (usedNewIndices.has(j)) continue;
      
      const newArt = newArticles[j];
      let similarity = calculateSimilarity(oldArt.header, newArt.header);
      
      const newArticleNum = extractArticleNumber(newArt.header);
      
      // 条文番号の処理
      if (oldArticleNum && newArticleNum) {
        if (oldArticleNum === newArticleNum) {
          // 条文番号が一致する場合: 大きなボーナス
          similarity = Math.min(1.0, similarity + 0.4);
        } else {
          // 条文番号が異なる場合: ペナルティを与えて誤マッチを防ぐ
          similarity = similarity * 0.5; // 類似度を半減
        }
      }
      
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = j;
      }
    }
    
    if (bestMatch >= 0) {
      articleMap.set(i, bestMatch);
      usedNewIndices.add(bestMatch);
    }
  }
  
  const rows = [titleRow, headerRow];
  let changedArticleCount = 0;
  let changedParagraphCount = 0;
  let addedParagraphCount = 0;
  let deletedParagraphCount = 0;
  
  // 項番号を抽出する関数
  function extractItemNumber(text) {
    // (1), （1）, 1., 1) などから番号を抽出
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
        // 全角数字を半角に変換
        const numStr = match[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
        return parseInt(numStr, 10);
      }
    }
    return null;
  }

  // 削除条文のソート位置を計算するヘルパー関数
  // 旧版で直前にマッチしている条文の新版位置の直後に配置
  function getDeletedSortKey(oldIdx) {
    // 旧版で直前にマッチしている条文を探す
    for (let i = oldIdx - 1; i >= 0; i--) {
      if (articleMap.has(i)) {
        const newIdx = articleMap.get(i);
        // 直前のマッチの直後に配置（連続削除は旧版順を維持）
        return newIdx + 0.001 + (oldIdx - i) * 0.0001;
      }
    }
    // 前にマッチがなければ、先頭
    return -1 + oldIdx * 0.001;
  }

  // 行データを収集する配列（後でソートする）
  const rowData = [];

  // マッチした条文を処理
  for (const [oldIdx, newIdx] of articleMap) {
    const oldArt = oldArticles[oldIdx];
    const newArt = newArticles[newIdx];
    
    // 段落レベルでマッチング
    const matchResult = matchParagraphsBySimilarity(oldArt.paragraphs, newArt.paragraphs);
    
    // 変更があるかチェック
    const hasChanges = matchResult.matches.some(m => m.similarity < 1.0) ||
                      matchResult.unmatchedOld.length > 0 ||
                      matchResult.unmatchedNew.length > 0;
    
    if (!hasChanges) continue; // 変更がない条文はスキップ
    
    changedArticleCount++;
    
    // 全ての変更項目を収集して項番号順にソート
    const items = [];
    
    // マッチした段落（変更あり）- 元の文書順序でソート
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
        newPara: added.text
      });
    }
    
    // 項番号順にソート（安定ソート：同一番号は元の順序を維持）
    items.forEach((item, idx) => item.originalIndex = idx);
    items.sort((a, b) => {
      if (a.itemNum !== b.itemNum) {
        return a.itemNum - b.itemNum;
      }
      return a.originalIndex - b.originalIndex;
    });
    
    // 条文見出しと内容を1つのセルにまとめる
    const oldCellChildren = [];
    const newCellChildren = [];
    
    // 見出しを追加
    oldCellChildren.push(new Paragraph({
      children: [
        new TextRun({
          text: oldArt.header,
          bold: true,
          size: 22,
          font: "Yu Gothic"
        })
      ],
      spacing: { after: 100 }
    }));
    
    newCellChildren.push(new Paragraph({
      children: [
        new TextRun({
          text: newArt.header,
          bold: true,
          size: 22,
          font: "Yu Gothic"
        })
      ],
      spacing: { after: 100 }
    }));
    
    // 各項目を追加（連続する同じタイプの項目をグループ化）
    let i = 0;
    while (i < items.length) {
      const item = items[i];
      
      if (item.type === 'modified') {
        const isLast = (i === items.length - 1);
        const spacing = isLast ? {} : { after: 100 };
        const diffResult = computeDiff(item.oldPara, item.newPara);
        
        oldCellChildren.push(new Paragraph({
          children: createHighlightedRuns(item.oldPara, true, diffResult),
          spacing: spacing
        }));
        
        newCellChildren.push(new Paragraph({
          children: createHighlightedRuns(item.newPara, false, diffResult),
          spacing: spacing
        }));
        i++;
        
      } else if (item.type === 'deleted') {
        // 連続する削除項目を収集
        const deletedItems = [];
        while (i < items.length && items[i].type === 'deleted') {
          deletedItems.push(items[i]);
          i++;
        }
        const isLast = (i === items.length);
        const spacing = isLast ? {} : { after: 100 };
        
        // 変更前欄：全ての削除項目を取り消し線付きで表示
        deletedItems.forEach((delItem, idx) => {
          const itemSpacing = (idx === deletedItems.length - 1) ? spacing : { after: 100 };
          oldCellChildren.push(new Paragraph({
            children: [
              new TextRun({
                text: delItem.oldPara,
                color: "FF0000",
                strike: true,
                size: 22,
                font: "Yu Gothic"
              })
            ],
            spacing: itemSpacing
          }));
        });
        
        // 変更後欄：「(削除)」を1回だけ表示
        newCellChildren.push(new Paragraph({
          children: [
            new TextRun({
              text: "(削除)",
              color: "FF0000",
              bold: true,
              size: 22,
              font: "Yu Gothic"
            })
          ],
          spacing: spacing
        }));
        
      } else if (item.type === 'added') {
        // 連続する追加項目を収集
        const addedItems = [];
        while (i < items.length && items[i].type === 'added') {
          addedItems.push(items[i]);
          i++;
        }
        const isLast = (i === items.length);
        const spacing = isLast ? {} : { after: 100 };
        
        // 変更前欄：「(新規追加)」を1回だけ表示
        oldCellChildren.push(new Paragraph({
          children: [
            new TextRun({
              text: "(新規追加)",
              color: "0000FF",
              bold: true,
              size: 22,
              font: "Yu Gothic"
            })
          ],
          spacing: spacing
        }));
        
        // 変更後欄：全ての追加項目を表示
        addedItems.forEach((addItem, idx) => {
          const itemSpacing = (idx === addedItems.length - 1) ? spacing : { after: 100 };
          newCellChildren.push(new Paragraph({
            children: [
              new TextRun({
                text: addItem.newPara,
                color: "0000FF",
                bold: true,
                size: 22,
                font: "Yu Gothic"
              })
            ],
            spacing: itemSpacing
          }));
        });
      }
    }
    
    // 行データを収集（後でソート）
    // orderに応じてセルの左右を切り替え
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
      sortKey: newIdx,  // 新版の位置でソート
      row: new TableRow({
        children: [leftCell, rightCell]
      })
    });
  }
  
  // 削除された条文（新版にマッチしない旧版の条文）
  for (let i = 0; i < oldArticles.length; i++) {
    if (!articleMap.has(i)) {
      const oldArt = oldArticles[i];
      changedArticleCount++;
      
      const oldCellChildren = [
        new Paragraph({
          children: [
            new TextRun({
              text: oldArt.header,
              bold: true,
              color: "FF0000",
              strike: true,
              size: 22,
              font: "Yu Gothic"
            })
          ],
          spacing: { after: 100 }
        })
      ];
      
      // 各段落を追加
      oldArt.paragraphs.forEach((p, idx) => {
        const isLast = (idx === oldArt.paragraphs.length - 1);
        oldCellChildren.push(new Paragraph({
          children: [
            new TextRun({
              text: p,
              color: "FF0000",
              strike: true,
              size: 22,
              font: "Yu Gothic"
            })
          ],
          spacing: isLast ? {} : { after: 100 }
        }));
      });
      
      // 行データを収集（削除条文は適切な位置にソート）
      const deletedLabelCell = new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        children: [new Paragraph({
          children: [
            new TextRun({
              text: "(削除)",
              color: "FF0000",
              bold: true,
              size: 22,
              font: "Yu Gothic"
            })
          ]
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
  
  // 追加された条文（旧版にマッチしない新版の条文）
  for (let j = 0; j < newArticles.length; j++) {
    if (!usedNewIndices.has(j)) {
      const newArt = newArticles[j];
      changedArticleCount++;
      
      const newCellChildren = [
        new Paragraph({
          children: [
            new TextRun({
              text: newArt.header,
              bold: true,
              color: "0000FF",
              size: 22,
              font: "Yu Gothic"
            })
          ],
          spacing: { after: 100 }
        })
      ];
      
      // 各段落を追加
      newArt.paragraphs.forEach((p, idx) => {
        const isLast = (idx === newArt.paragraphs.length - 1);
        newCellChildren.push(new Paragraph({
          children: [
            new TextRun({
              text: p,
              color: "0000FF",
              bold: true,
              size: 22,
              font: "Yu Gothic"
            })
          ],
          spacing: isLast ? {} : { after: 100 }
        }));
      });
      
      // 行データを収集（追加条文は新版の位置でソート）
      const addedLabelCell = new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        children: [new Paragraph({
          children: [
            new TextRun({
              text: "(新規追加)",
              color: "0000FF",
              bold: true,
              size: 22,
              font: "Yu Gothic"
            })
          ]
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
  
  // オプション引数を解析
  let order = 'new-old'; // デフォルト: 新→旧
  const filteredArgs = args.filter(arg => {
    if (arg.startsWith('--order=')) {
      order = arg.split('=')[1];
      return false;
    }
    return true;
  });
  
  if (filteredArgs.length < 2) {
    console.error('使用方法: node comparison_docx_generator_v5.js <old_file.docx> <new_file.docx> [output_file.docx] [document_name] [date] [--order=old-new|new-old]');
    console.error('');
    console.error('オプション:');
    console.error('  --order=old-new  変更前→変更後の順 (デフォルト)');
    console.error('  --order=new-old  変更後→変更前の順');
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
