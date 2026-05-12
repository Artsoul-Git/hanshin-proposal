// =============================================
// ContentManager.gs — コンテンツ管理
// =============================================

const ContentManager = {

  getContent(token) {
    const userId = Auth.getUserIdByToken(token);
    if (!userId) return jsonErr('invalid_token');

    const sheet   = getSheet('content');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const today   = todayJST();

    const activeIdx = headers.indexOf('active');
    const startIdx  = headers.indexOf('display_start');
    const endIdx    = headers.indexOf('display_end');

    const content = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][activeIdx]) continue;
      const start = data[i][startIdx];
      const end   = data[i][endIdx];
      if (start && start > today) continue;
      if (end   && end   < today) continue;

      const item = {};
      headers.forEach((h, j) => { item[h] = data[i][j]; });
      content.push(item);
    }

    content.sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
    return jsonOk({ content });
  },

  // ── 以下は管理者専用（ADMIN_TOKEN必須） ──

  getAllContent(adminToken) {
    if (!Admin._checkAdmin(adminToken)) return jsonErr('unauthorized');

    const sheet   = getSheet('content');
    const data    = sheet.getDataRange().getValues();
    if (data.length <= 1) return jsonOk({ content: [] });

    const headers = data[0];
    const content = [];
    for (let i = 1; i < data.length; i++) {
      const item = {};
      headers.forEach((h, j) => {
        const v = data[i][j];
        item[h] = v instanceof Date ? v.toISOString().split('T')[0] : v;
      });
      content.push(item);
    }
    content.sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
    return jsonOk({ content });
  },

  addContent(adminToken, body) {
    if (!Admin._checkAdmin(adminToken)) return jsonErr('unauthorized');
    if (!body.title) return jsonErr('title required');

    const sheet   = getSheet('content');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];

    const contentId = 'CNT' + new Date().getTime();
    const today = todayJST();
    const newRow = headers.map(h => {
      const map = {
        content_id:    contentId,
        type:          body.type          || 'tip',
        category:      body.category      || '',
        title:         body.title,
        excerpt:       body.excerpt       || '',
        external_url:  body.external_url  || '',
        image_url:     body.image_url     || '',
        display_order: parseInt(body.display_order) || 99,
        active:        body.active !== false,
        display_start: body.display_start || '',
        display_end:   body.display_end   || '',
        created_at:    today,
      };
      return map[h] !== undefined ? map[h] : '';
    });
    sheet.appendRow(newRow);
    return jsonOk({ content_id: contentId });
  },

  updateContent(adminToken, body) {
    if (!Admin._checkAdmin(adminToken)) return jsonErr('unauthorized');
    if (!body.content_id) return jsonErr('content_id required');

    const sheet   = getSheet('content');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx   = headers.indexOf('content_id');

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] !== body.content_id) continue;
      headers.forEach((h, j) => {
        if (h === 'content_id' || h === 'created_at') return;
        if (body[h] !== undefined) sheet.getRange(i + 1, j + 1).setValue(body[h]);
      });
      return jsonOk({ updated: true });
    }
    return jsonErr('content not found');
  },

  deleteContent(adminToken, body) {
    if (!Admin._checkAdmin(adminToken)) return jsonErr('unauthorized');
    if (!body.content_id) return jsonErr('content_id required');

    const sheet    = getSheet('content');
    const data     = sheet.getDataRange().getValues();
    const headers  = data[0];
    const idIdx    = headers.indexOf('content_id');
    const activeIdx = headers.indexOf('active');

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] !== body.content_id) continue;
      sheet.getRange(i + 1, activeIdx + 1).setValue(false);
      return jsonOk({ deleted: true });
    }
    return jsonErr('content not found');
  },
};
