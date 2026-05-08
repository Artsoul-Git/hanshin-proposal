// ============================================================
// Config.gs — 設定値（デプロイ前にスクリプトプロパティを設定）
// ============================================================

const CONFIG = {
  SHEET_USERS:  '利用者マスター',
  SHEET_LOG:    '生成ログ',
  SHEET_MASK:   'マスキングセッション',

  GEMINI_MODEL:    'gemini-2.0-flash',
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/',

  DOC_TYPES: [
    { id: 'face_to_face',    label: '面談記録',           icon: '💬' },
    { id: 'monitoring',      label: 'モニタリング記録',    icon: '📊' },
    { id: 'individual_plan', label: '個別支援計画',        icon: '📋' },
    { id: 'consultation',    label: '相談支援記録',        icon: '🤝' },
    { id: 'staff_meeting',   label: 'サービス担当者会議録', icon: '👥' },
  ],
};

// スクリプトプロパティから取得（コードに直書き禁止）
function getApiKey() {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY がスクリプトプロパティに設定されていません');
  return key;
}

function getSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID がスクリプトプロパティに設定されていません');
  return SpreadsheetApp.openById(id);
}
