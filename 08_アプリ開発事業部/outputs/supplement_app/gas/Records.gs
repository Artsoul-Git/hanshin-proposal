// =============================================
// Records.gs — 日次記録の保存・取得
// =============================================

const Records = {

  // 日次記録を保存（同日は上書き）
  saveLog(token, body) {
    const userId = Auth.getUserIdByToken(token);
    if (!userId) return jsonErr('invalid_token');

    const sheet   = getSheet('daily_log');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const date    = body.date || todayJST();

    // 同日の記録を検索
    const userIdIdx = headers.indexOf('user_id');
    const dateIdx   = headers.indexOf('log_date');
    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][userIdIdx] === userId && data[i][dateIdx] === date) {
        existingRow = i + 1; // 1-indexed
        break;
      }
    }

    const rowData = this._buildRowData(headers, {
      log_id:     existingRow > 0 ? data[existingRow - 1][headers.indexOf('log_id')] : generateId('LOG'),
      user_id:    userId,
      log_date:   date,
      weight:     body.weight || '',
      mood:       body.mood   || '',
      cond:       body.cond   || '',
      taken:      body.taken  === true ? true : false,
      memo:       (body.memo  || '').substring(0, 200),
      created_at: existingRow > 0
        ? data[existingRow - 1][headers.indexOf('created_at')]
        : new Date().toISOString(),
    });

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    // usersシートの last_record_at を更新
    this._updateLastRecord(userId);

    return jsonOk({ date });
  },

  // 過去N日分の記録を取得
  getLogs(token, days = 30) {
    const userId = Auth.getUserIdByToken(token);
    if (!userId) return jsonErr('invalid_token');

    const sheet   = getSheet('daily_log');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];

    const cutoff  = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const userIdIdx = headers.indexOf('user_id');
    const dateIdx   = headers.indexOf('log_date');

    const logs = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][userIdIdx] === userId && data[i][dateIdx] >= cutoffStr) {
        logs.push(this._rowToLog(headers, data[i]));
      }
    }

    logs.sort((a, b) => a.date.localeCompare(b.date));
    return jsonOk({ logs });
  },

  // 行データオブジェクトに変換
  _rowToLog(headers, row) {
    return {
      log_id:  row[headers.indexOf('log_id')],
      date:    row[headers.indexOf('log_date')],
      weight:  parseFloat(row[headers.indexOf('weight')]) || null,
      mood:    parseInt(row[headers.indexOf('mood')])     || null,
      cond:    parseInt(row[headers.indexOf('cond')])     || null,
      taken:   row[headers.indexOf('taken')] === true || row[headers.indexOf('taken')] === 'TRUE',
      memo:    row[headers.indexOf('memo')]  || '',
    };
  },

  // ヘッダー順に並べた配列を生成
  _buildRowData(headers, obj) {
    return headers.map(h => obj[h] !== undefined ? obj[h] : '');
  },

  // usersシートの last_record_at を更新
  _updateLastRecord(userId) {
    const sheet   = getSheet('users');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const userIdIdx = headers.indexOf('user_id');
    const lastRecIdx = headers.indexOf('last_record_at');
    for (let i = 1; i < data.length; i++) {
      if (data[i][userIdIdx] === userId) {
        sheet.getRange(i + 1, lastRecIdx + 1).setValue(new Date().toISOString());
        break;
      }
    }
  },
};
