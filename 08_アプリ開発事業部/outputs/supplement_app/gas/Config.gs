// =============================================
// Config.gs — 設定・共通処理
// =============================================
// ⚠️ APIキーはスクリプトプロパティに設定してください
// （このファイルに直接書かない）
// 設定方法: GASエディタ → 歯車アイコン → スクリプトのプロパティ
// SPREADSHEET_ID, GEMINI_API_KEY, LINE_TOKEN, ADMIN_TOKEN

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID'),
    GEMINI_API_KEY:  props.getProperty('GEMINI_API_KEY'),
    LINE_TOKEN:      props.getProperty('LINE_TOKEN'),
    ADMIN_TOKEN:     props.getProperty('ADMIN_TOKEN'),
    APP_NAME:        'Nolia',
    APP_URL:         'https://artsoul-git.github.io/nolia-app/', // Phase 0はGitHub Pages
  };
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(getConfig().SPREADSHEET_ID);
}

function getSheet(name) {
  return getSpreadsheet().getSheetByName(name);
}

// MIMEタイプ設定（GAS「全員公開」デプロイ時はCORSをGoogleが自動処理）
function setCorsHeaders(output) {
  return output.setMimeType(ContentService.MimeType.JSON);
}

// JSONレスポンス生成
function jsonOk(data) {
  return setCorsHeaders(
    ContentService.createTextOutput(JSON.stringify({ ok: true, ...data }))
  );
}

function jsonErr(msg) {
  return setCorsHeaders(
    ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg }))
  );
}

// ユニークID生成
function generateId(prefix) {
  return prefix + '_' + new Date().getTime() + '_' + Math.random().toString(36).slice(2, 7);
}

// 共通 Gemini API 呼び出し
function callGemini(prompt, maxTokens) {
  const apiKey = getConfig().GEMINI_API_KEY;
  if (!apiKey) return '';
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens || 200, temperature: 0.85 },
  };
  try {
    const res = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true }
    );
    const json = JSON.parse(res.getContentText());
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch(e) {
    console.error('Gemini error:', e.message);
    return '';
  }
}

// 今日の日付（JST）
function todayJST() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600000);
  return jst.toISOString().split('T')[0]; // YYYY-MM-DD
}
