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
    const tokenIdx = headers.indexOf('token');

    const fields = ['display_name','birthdate','start_date','initial_weight','goal_weight','purpose','height','exercise_days'];

    for (let i = 1; i < data.length; i++) {
      if (data[i][tokenIdx] !== token) continue;
      const row = i + 1;
      for (const f of fields) {
        const idx = headers.indexOf(f);
        if (idx >= 0 && body[f] !== undefined && body[f] !== '') {
          sheet.getRange(row, idx + 1).setValue(body[f]);
        }
      }
      const updated = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
      return jsonOk({ user: this._rowToUser(headers, updated) });
    }
    return jsonErr('user not found');
  },

  // プロフィール更新（マイページ編集）
  updateProfile(token, body) {
    const userId = this.getUserIdByToken(token);
    if (!userId) return jsonErr('invalid_token');

    const sheet   = getSheet('users');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const userIdIdx = headers.indexOf('user_id');

    const updatable = ['display_name','birthdate','height','exercise_days','goal_weight','purpose'];

    for (let i = 1; i < data.length; i++) {
      if (data[i][userIdIdx] !== userId) continue;
      const row = i + 1;
      for (const f of updatable) {
        const idx = headers.indexOf(f);
        if (idx >= 0 && body[f] !== undefined && body[f] !== '') {
          sheet.getRange(row, idx + 1).setValue(body[f]);
        }
      }
      const updated = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
      return jsonOk({ user: this._rowToUser(headers, updated) });
    }
    return jsonErr('user not found');
  },

  // ログインリンク再発行（パスワード忘れ代替）
  // セキュリティ：メール有無を問わず常に { ok: true } を返す
  requestLoginLink(body) {
    const { email } = body;
    if (!email) return jsonOk({});

    const sheet   = getSheet('users');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIdx  = headers.indexOf('email');
    const tokenIdx  = headers.indexOf('token');
    const statusIdx = headers.indexOf('status');
    const nameIdx   = headers.indexOf('display_name') >= 0
      ? headers.indexOf('display_name')
      : headers.indexOf('name');

    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIdx] !== email) continue;
      if (data[i][statusIdx] === 'churned') break;

      // 新トークン発行（旧トークンは自動的に無効化）
      const newToken = Utilities.getUuid();
      sheet.getRange(i + 1, tokenIdx + 1).setValue(newToken);

      const config = getConfig();
      const loginUrl = `${config.APP_URL}?t=${newToken}`;
      const name = data[i][nameIdx] || 'さん';

      try {
        GmailApp.sendEmail(
          email,
          '【Nolia】ログインリンクをお送りします 🌿',
          `${name}、こんにちは。\n\n下のリンクをタップするとアプリに入れます。\n\n▼ ログインリンク\n${loginUrl}\n\n＊セキュリティのため、このリンクの発行で旧リンクは無効になっています。\n\nNoliaチーム`
        );
      } catch(e) {
        console.error('Login link email error:', e.message);
      }
      break;
    }

    return jsonOk({});
  },

  // 行データをユーザーオブジェクトに変換
  _rowToUser(headers, row) {
    const user = {};
    headers.forEach((h, i) => {
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
