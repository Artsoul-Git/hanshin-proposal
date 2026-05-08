// ============================================================
// Code.gs — エントリーポイント（doGet / クライアント呼び出し関数）
// ============================================================

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('UI')
    .setTitle('AI記録自動生成 | まる')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---- クライアント（google.script.run）から呼ばれる関数 ----

function serverGetUsers() {
  return getUsers();
}

function serverGetDocTypes() {
  return CONFIG.DOC_TYPES;
}

function serverGenerateDocument(params) {
  // params: { userId, userName, docTypeId, inputText, staffName }
  return generateDocument(params);
}

function serverSaveDocument(params) {
  // params: { userId, userName, docTypeId, staffName, generatedText, sessionId }
  return saveDocument(params);
}
