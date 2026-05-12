// =============================================
// Testimonials.gs — 口コミ管理
// =============================================

const Testimonials = {

  // 口コミ一覧取得（管理者用）
  getAll(adminToken) {
    if (!Admin._checkAdmin(adminToken)) return jsonErr('unauthorized');

    const sheet = getSheet('testimonials');
    const data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return jsonOk({ testimonials: [] });

    const headers = data[0];
    const list = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((h, j) => {
        const v = data[i][j];
        row[h] = v instanceof Date ? v.toISOString() : v;
      });
      list.push(row);
    }
    list.sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0));
    return jsonOk({ testimonials: list });
  },

  // 口コミ承認 or 却下（管理者用）
  approve(adminToken, body) {
    if (!Admin._checkAdmin(adminToken)) return jsonErr('unauthorized');

    const { testimonial_id, action } = body;
    if (!testimonial_id || !action) return jsonErr('testimonial_id and action required');
    if (action !== 'approve' && action !== 'reject') return jsonErr('action must be approve or reject');

    const sheet   = getSheet('testimonials');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx     = headers.indexOf('testimonial_id');
    const statusIdx = headers.indexOf('status');
    const approvedAtIdx = headers.indexOf('approved_at');

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] !== testimonial_id) continue;

      const now = new Date().toISOString();
      sheet.getRange(i + 1, statusIdx + 1).setValue(action === 'approve' ? 'approved' : 'rejected');
      if (approvedAtIdx >= 0) {
        sheet.getRange(i + 1, approvedAtIdx + 1).setValue(action === 'approve' ? now : '');
      }
      return jsonOk({ updated: true, status: action === 'approve' ? 'approved' : 'rejected' });
    }
    return jsonErr('testimonial not found');
  },

  // 口コミ投稿（ユーザー用）
  submit(token, body) {
    const userId = Auth.getUserIdByToken(token);
    if (!userId) return jsonErr('invalid_token');

    const { display_name, duration, content } = body;
    if (!content || !content.trim()) return jsonErr('content required');

    const sheet   = getSheet('testimonials');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];

    const tsId = 'TST' + new Date().getTime();
    const now  = new Date().toISOString();
    const newRow = headers.map(h => {
      const map = {
        testimonial_id: tsId,
        user_id:        userId,
        display_name:   display_name || '匿名',
        duration:       duration || '',
        content:        content.trim(),
        status:         'pending',
        submitted_at:   now,
      };
      return map[h] !== undefined ? map[h] : '';
    });
    sheet.appendRow(newRow);

    this._notifyAdmin(display_name || '匿名', content.trim());
    return jsonOk({ testimonial_id: tsId });
  },

  _notifyAdmin(displayName, content) {
    try {
      const adminEmail = Session.getActiveUser().getEmail();
      GmailApp.sendEmail(
        adminEmail,
        '【Nolia】新しい口コミが届きました',
        displayName + 'さんから口コミが届きました。\n\n「' + content + '」\n\n管理者パネルで確認・承認してください。'
      );
    } catch(e) {
      console.warn('管理者通知メール送信エラー:', e.message);
    }
  },
};
