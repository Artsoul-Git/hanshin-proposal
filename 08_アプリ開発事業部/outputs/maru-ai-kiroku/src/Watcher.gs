// ============================================================
// Watcher.gs — Drive監視・Mode B（音声→書類）【Phase 2】
// ============================================================
// 現在 Mode A（テキスト手動入力）のみ実装済み。
// Mode B は Gemini File API を使ってMP4音声を直接処理する。
// Phase 2 実装時にこのファイルを完成させる。

// Drive内の特定フォルダを監視するトリガーを設定
function setupDriveTrigger() {
  // TODO Phase 2:
  // const folderId = PropertiesService.getScriptProperties().getProperty('MEET_RECORDING_FOLDER_ID');
  // ScriptApp.newTrigger('onDriveChange').forUserCalendar(Session.getActiveUser().getEmail()).onEventUpdated().create();
  Logger.log('[Watcher] Mode B（Drive監視）は Phase 2 で実装予定');
}

// 録音ファイルをGemini File APIで処理
function processRecordingFile(fileId) {
  // TODO Phase 2:
  // 1. DriveからファイルのBlobを取得
  // 2. Gemini File API（multipart upload）でアップロード
  // 3. state: ACTIVE になるまでポーリング
  // 4. generateContent で文字起こし + 書類生成
  // 5. maskPersonalInfo / unmaskPersonalInfo を通す
  // 6. saveDocument でSheetsに保存
  Logger.log('[Watcher] processRecordingFile: ' + fileId + ' (Phase 2 未実装)');
}
