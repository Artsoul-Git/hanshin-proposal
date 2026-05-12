// =============================================
// Admin.gs — 管理者機能（会員登録など）
// =============================================

const Admin = {

  // 管理者トークン検証
  _checkAdmin(token) {
    return token === getConfig().ADMIN_TOKEN;
  },

  // 新規会員登録 + 招待メール送信
  createUser(adminToken, body) {
    if (!this._checkAdmin(adminToken)) return jsonErr('unauthorized');

    const { email, name } = body;
    if (!email || !name) return jsonErr('email and name required');

    // 重複チェック
    const sheet   = getSheet('users');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIdx = headers.indexOf('email');
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIdx] === email) return jsonErr('email already exists');
    }

    // トークン生成（UUID v4相当）
    const token = Utilities.getUuid();

    // usersシートに追加
    const userId = 'USR' + String(data.length).padStart(4, '0');
    const now    = new Date().toISOString();
    const newRow = headers.map(h => {
      const map = {
        user_id: userId, email, name, display_name: name,
        token, status: 'active', joined_at: now,
      };
      return map[h] !== undefined ? map[h] : '';
    });
    sheet.appendRow(newRow);

    // 招待メール送信
    this._sendInviteEmail(email, name, token);

    return jsonOk({ user_id: userId, token });
  },

  // 招待メール送信
  _sendInviteEmail(email, name, token) {
    const config  = getConfig();
    const loginUrl = `${config.APP_URL}?t=${token}`;
    const subject  = '【Nolia】サプリサポートアプリへご招待します 🌿';
    const body = `
${name}さん、はじめまして。

Nolia（ノリア）サポートアプリへようこそ！

下のリンクをタップするとアプリに入れます。
ブックマークしておくと便利です。

▼ あなた専用のマイページ
${loginUrl}

Noliaでは、毎日のサプリ記録をつけるだけで、
AIがあなたのカラダのリズムに合ったアドバイスを届けます。
毎週レポートもお送りします。

一緒にカラダのリズムを整えていきましょう！

Noliaチーム
    `.trim();

    GmailApp.sendEmail(email, subject, body);
  },

  // 会員一覧取得
  getUsers(adminToken) {
    if (!this._checkAdmin(adminToken)) return jsonErr('unauthorized');

    const sheet   = getSheet('users');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];

    const users = [];
    for (let i = 1; i < data.length; i++) {
      const user = {};
      headers.forEach((h, j) => {
        if (h !== 'token' && h !== 'line_user_id') {
          user[h] = data[i][j] instanceof Date ? data[i][j].toISOString().split('T')[0] : data[i][j];
        }
      });
      users.push(user);
    }

    return jsonOk({ users });
  },
};

// ────────────────────────────────────────────
// Sheets初期セットアップ（初回のみ実行）
// GASエディタで手動実行してください
// ────────────────────────────────────────────
function setupSheets() {
  const ss = getSpreadsheet();

  const sheetsConfig = {
    users: ['user_id','email','name','display_name','token','line_user_id','birthdate','start_date','initial_weight','goal_weight','purpose','exercise_days','status','joined_at','last_record_at'],
    daily_log: ['log_id','user_id','log_date','weight','mood','cond','taken','memo','created_at'],
    weekly_reports: ['report_id','user_id','week_start','report_text','biorhythm_info','sent_at','opened_at'],
    content: ['content_id','type','category','title','excerpt','external_url','image_url','display_order','active','display_start','display_end','created_at'],
    testimonials: ['testimonial_id','user_id','display_name','duration','content','status','submitted_at','approved_at','coupon_code','coupon_sent_at'],
    coupons: ['coupon_id','user_id','code','type','discount','status','expires_at','sent_at'],
  };

  for (const [name, headers] of Object.entries(sheetsConfig)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // ヘッダー行を設定（既存データを消さない）
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#1A365D')
        .setFontColor('white')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }

  Logger.log('Sheets セットアップ完了！');
}
