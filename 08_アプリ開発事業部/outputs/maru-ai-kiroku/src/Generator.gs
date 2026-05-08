// ============================================================
// Generator.gs — Gemini API 呼び出し + 書類生成
// ============================================================

function generateDocument(params) {
  const { userId, userName, docTypeId, inputText, staffName } = params;
  const sessionId = Utilities.getUuid();

  // ① 個人情報マスキング
  const maskedText = maskPersonalInfo(inputText, sessionId);

  // ② 書類種別ラベル取得
  const docType  = CONFIG.DOC_TYPES.find(d => d.id === docTypeId);
  const docLabel = docType ? docType.label : docTypeId;

  // ③ プロンプト構築
  const prompt = buildPrompt(docTypeId, docLabel, maskedText, staffName);

  // ④ Gemini API 呼び出し
  const url     = `${CONFIG.GEMINI_BASE_URL}${CONFIG.GEMINI_MODEL}:generateContent?key=${getApiKey()}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const json = JSON.parse(res.getContentText());
  if (json.error) throw new Error('Gemini APIエラー: ' + json.error.message);

  const generatedMasked = json.candidates[0].content.parts[0].text;

  // ⑤ マスキング解除
  const generatedText = unmaskPersonalInfo(generatedMasked, sessionId);

  return { success: true, sessionId, generatedText, docLabel, userId, userName };
}

// ---- プロンプトテンプレート ----

function buildPrompt(docTypeId, docLabel, maskedText, staffName) {
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年MM月dd日');

  const base = `あなたは就労継続支援B型事業所の記録作成支援AIです。
以下の面談メモをもとに、${docLabel}を作成してください。
作成日：${today}　担当者：${staffName}

【面談メモ】
${maskedText}

【注意事項】
- 支援員が書く客観的な記録体（「〜した」「〜と述べた」）で書く
- 敬語（〜です/〜ます）は使わない
- 記録に現れる識別子（【利用者_A】等）はそのまま使用する（処理済み）
- 必ず以下のフォーマットに従って出力する
`;

  const formats = {
    face_to_face: `
# 面談記録
- 日時：${today}
- 担当者：${staffName}
- 利用者：
- 面談場所：事業所内

## 主訴・相談内容

## 支援員の対応

## 今後の支援方針
`,
    monitoring: `
# モニタリング記録
- 実施日：${today}
- 担当者：${staffName}
- 利用者：

## 生活・健康状況

## 就労・作業状況

## 個別支援計画の達成状況

## 本人の意向・希望

## 今後の支援方針
`,
    individual_plan: `
# 個別支援計画
- 作成日：${today}
- 担当者：${staffName}
- 利用者：

## 長期目標（6か月〜1年）

## 短期目標（1〜3か月）

## 具体的な支援内容

## 本人の意向

## 家族の意向
`,
    consultation: `
# 相談支援記録
- 日時：${today}
- 担当者：${staffName}
- 利用者：

## 相談内容

## 対応内容

## 結果・今後の対応
`,
    staff_meeting: `
# サービス担当者会議録
- 日時：${today}
- 参加者：${staffName}（他関係者）

## 検討事項

## 各機関・参加者の意見

## 合意事項・方針

## 次回予定
`,
  };

  return base + (formats[docTypeId] || `\n# ${docLabel}\n（自由形式で作成してください）\n`);
}
