// =============================================
// Auth.gs — 認証・プロフィール管理
// =============================================

const Auth = {

  // トークンでログイン → ユーザー情報を返す
  login(token) {
    if (!token) return jsonErr('token required');

    const sheet = getSheet('users');
    const data  = sheet.getDataRange().getValues();
    const headers = data[0];
    const tokenIdx = headers.indexOf('token');

    for (let i = 1; i < data.length; i++) {
      if (data[i][tokenIdx] === token) {
        const user = this._rowToUser(headers, data[i]);
        if (user.status === 'churned') return jsonErr('account_inactive');
        return jsonOk({ user });
      }
    }
    return jsonErr('invalid_token');
  },

  // 初回セットアップ（プロフィール保存）
  setupProfile(token, body) {
    if (!token) return jsonErr('token required');

    const sheet   = getSheet('users');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const tokenIdx      = headers.indexOf('token');
    const displayNameIdx = headers.indexOf('display_name');
    const birthdateIdx  = headers.indexOf('birthdate');
    const startDateIdx  = headers.indexOf('start_date');
    const initialWtIdx  = headers.indexOf('initial_weight');
    const goalWtIdx     = headers.indexOf('goal_weight');
    const purposeIdx    = headers.indexOf('purpose');

    for (let i = 1; i < data.length; i++) {
      if (data[i][tokenIdx] === token) {
        const row = i + 1; // 1-indexed
        if (body.display_name)    sheet.getRange(row, displayNameIdx + 1).setValue(body.display_name);
        if (body.birthdate)       sheet.getRange(row, birthdateIdx + 1).setValue(body.birthdate);
        if (body.start_date)      sheet.getRange(row, startDateIdx + 1).setValue(body.start_date);
        if (body.initial_weight)  sheet.getRange(row, initialWtIdx + 1).setValue(body.initial_weight);
        if (body.goal_weight)     sheet.getRange(row, goalWtIdx + 1).setValue(body.goal_weight);
        if (body.purpose)         sheet.getRange(row, purposeIdx + 1).setValue(body.purpose);

        // 更新後のユーザーを取得
        const updated = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
        return jsonOk({ user: this._rowToUser(headers, updated) });
      }
    }
    return jsonErr('user not found');
  },

  // 行データをユーザーオブジェクトに変換
  _rowToUser(headers, row) {
    const user = {};
    headers.forEach((h, i) => {
      // tokenとline_user_idはフロントエンドに返さない（セキュリティ）
      if (h !== 'token' && h !== 'line_user_id') {
        user[h] = row[i] instanceof Date ? row[i].toISOString().split('T')[0] : row[i];
      }
    });
    return user;
  },

  // トークンからユーザーIDを取得（他のGSから呼び出し用）
  getUserIdByToken(token) {
    if (!token) return null;
    const sheet = getSheet('users');
    const data  = sheet.getDataRange().getValues();
    const headers = data[0];
    const tokenIdx  = headers.indexOf('token');
    const userIdIdx = headers.indexOf('user_id');
    for (let i = 1; i < data.length; i++) {
      if (data[i][tokenIdx] === token) return data[i][userIdIdx];
    }
    return null;
  },
};
