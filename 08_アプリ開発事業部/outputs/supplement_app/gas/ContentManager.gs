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

    const activeIdx  = headers.indexOf('active');
    const startIdx   = headers.indexOf('display_start');
    const endIdx     = headers.indexOf('display_end');
    const orderIdx   = headers.indexOf('display_order');

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
};
