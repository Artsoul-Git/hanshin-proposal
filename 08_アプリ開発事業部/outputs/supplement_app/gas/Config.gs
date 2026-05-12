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

// CORS対応ヘッダー（GAS Web Appに必須）
function setCorsHeaders(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

// 今日の日付（JST）
function todayJST() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600000);
  return jst.toISOString().split('T')[0]; // YYYY-MM-DD
}
