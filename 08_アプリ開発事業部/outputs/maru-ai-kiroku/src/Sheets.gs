// ============================================================
// Sheets.gs — スプレッドシート操作
// ============================================================

// 利用者マスターを取得
// シート列構成: A=利用者ID B=氏名 C=フリガナ D=生年月日 E=障害種別 F=計画相談員名
function getUsers() {
  const sheet = getSpreadsheet().getSheetByName(CONFIG.SHEET_USERS);
  const data  = sheet.getDataRange().getValues();
  const users = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    users.push({
      id:         String(data[i][0]),
      name:       String(data[i][1] || ''),
      nameKana:   String(data[i][2] || ''),
      dob:        String(data[i][3] || ''),
      disability: String(data[i][4] || ''),
      planner:    String(data[i][5] || ''),
    });
  }
  return users;
}

// 職員マスターを取得
// シート列構成: A=職員ID B=氏名 C=フリガナ D=役職
function getStaff() {
  const sheet = getSpreadsheet().getSheetByName(CONFIG.SHEET_STAFF);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const staff = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] || !data[i][1]) continue;
    staff.push({
      id:   String(data[i][0]),
      name: String(data[i][1] || ''),
      kana: String(data[i][2] || ''),
      role: String(data[i][3] || ''),
    });
  }
  return staff;
}

// 生成ログに保存
// シート列構成: A=ログID B=生成日時 C=利用者ID D=利用者名 E=書類種別 F=担当者 G=生成内容 H=ステータス
function saveDocument(params) {
  const sheet = getSpreadsheet().getSheetByName(CONFIG.SHEET_LOG);
  const now   = new Date();
  const logId = Utilities.getUuid();

  sheet.appendRow([
    logId,
    now,
    params.userId,
    params.userName,
    params.docTypeId,
    params.staffName,
    params.generatedText,
    '生成済み',
  ]);

  return { success: true, logId: logId, savedAt: Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm') };
}
