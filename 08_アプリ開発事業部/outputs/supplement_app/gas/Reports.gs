// =============================================
// Reports.gs — 週次レポート生成・取得
// =============================================

const Reports = {

  // ユーザーのレポート一覧取得
  getReports(token) {
    const userId = Auth.getUserIdByToken(token);
    if (!userId) return jsonErr('invalid_token');

    const sheet   = getSheet('weekly_reports');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const userIdIdx = headers.indexOf('user_id');

    const reports = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][userIdIdx]).trim() !== userId) continue;
      reports.push({
        report_id:      data[i][headers.indexOf('report_id')],
        week_start:     this._toDateStr(data[i][headers.indexOf('week_start')]),
        report_text:    data[i][headers.indexOf('report_text')],
        biorhythm_info: data[i][headers.indexOf('biorhythm_info')],
        sent_at:        this._toDateStr(data[i][headers.indexOf('sent_at')]),
        stats:          this._parseStats(data[i][headers.indexOf('biorhythm_info')]),
      });
    }

    reports.sort((a, b) => b.week_start.localeCompare(a.week_start));
    return jsonOk({ reports: reports.slice(0, 10) }); // 最新10件
  },

  // レポート開封記録
  markOpened(token) {
    const userId = Auth.getUserIdByToken(token);
    if (!userId) return jsonOk({});

    const sheet   = getSheet('weekly_reports');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const userIdIdx  = headers.indexOf('user_id');
    const openedIdx  = headers.indexOf('opened_at');

    // 最新の未開封レポートに開封日時をセット
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][userIdIdx] === userId && !data[i][openedIdx]) {
        sheet.getRange(i + 1, openedIdx + 1).setValue(new Date().toISOString());
        break;
      }
    }
    return jsonOk({});
  },

  // 全会員の週次レポートを生成して送信（管理者トリガー用）
  generateAll(adminToken) {
    const config = getConfig();
    if (adminToken !== config.ADMIN_TOKEN) return jsonErr('unauthorized');

    const usersSheet = getSheet('users');
    const usersData  = usersSheet.getDataRange().getValues();
    const headers    = usersData[0];
    const statusIdx  = headers.indexOf('status');

    let count = 0;
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][statusIdx] !== 'active') continue;
      const user = {};
      headers.forEach((h, j) => { user[h] = usersData[i][j]; });
      try {
        this._generateForUser(user);
        count++;
        Utilities.sleep(1500); // API制限対策
      } catch(err) {
        console.error(`Failed for user ${user.user_id}:`, err);
      }
    }
    return jsonOk({ generated: count });
  },

  // 1ユーザー分のレポート生成
  _generateForUser(user) {
    const config = getConfig();

    // 先週のログを取得
    const logSheet = getSheet('daily_log');
    const logData  = logSheet.getDataRange().getValues();
    const logHeaders = logData[0];
    const weekStart = this._getLastMonday();
    const weekEnd   = this._addDays(weekStart, 6);

    const logs = [];
    const userIdIdx = logHeaders.indexOf('user_id');
    const dateIdx   = logHeaders.indexOf('log_date');
    for (let i = 1; i < logData.length; i++) {
      if (logData[i][userIdIdx] === user.user_id &&
          logData[i][dateIdx] >= weekStart && logData[i][dateIdx] <= weekEnd) {
        logs.push(logData[i]);
      }
    }

    if (logs.length === 0) return; // 記録なしはスキップ

    // 統計計算
    const weights = logs.map(r => parseFloat(r[logHeaders.indexOf('weight')])).filter(w => !isNaN(w));
    const moods   = logs.map(r => parseInt(r[logHeaders.indexOf('mood')])).filter(m => !isNaN(m));
    const taken   = logs.filter(r => r[logHeaders.indexOf('taken')] === true || r[logHeaders.indexOf('taken')] === 'TRUE').length;
    const weightChange = weights.length >= 2 ? (weights[weights.length-1] - weights[0]).toFixed(1) : 0;
    const avgMood = moods.length > 0 ? (moods.reduce((a,b) => a+b, 0) / moods.length).toFixed(1) : '-';
    const takenRate = Math.round(taken / logs.length * 100);

    // バイオリズム計算（JS側と同じロジック）
    const bioInfo = user.birthdate ? this._calcBioText(user.birthdate, new Date(weekStart)) : '';

    // Gemini APIでレポート生成
    const reportText = this._callGemini(config.GEMINI_API_KEY, {
      weightChange, takenRate, avgMood, bioInfo,
      userName: user.display_name || user.name,
    });

    // Sheetsに保存
    const reportSheet = getSheet('weekly_reports');
    reportSheet.appendRow([
      generateId('RPT'),
      user.user_id,
      weekStart,
      reportText,
      JSON.stringify({ weight_change: parseFloat(weightChange), taken_rate: takenRate, avg_mood: avgMood }),
      new Date().toISOString(),
      '', // opened_at は空
    ]);

    // メール送信
    const reportUrl = `${config.APP_URL}?t=${user.token}#report`;
    this._sendReportEmail(user, reportText, reportUrl, weekStart);
  },

  _callGemini(apiKey, data) {
    const prompt = `
あなたは寄り添う健康アドバイザー「Nolia」のAIです。
友達に話しかけるような温かい日本語で、200文字程度のレポートを書いてください。

【今週の記録サマリー（${data.userName}さん）】
・体重変化：${data.weightChange > 0 ? '+' : ''}${data.weightChange}kg
・サプリ服用率：${data.takenRate}%
・平均気分：${data.avgMood}/5
${data.bioInfo ? `・バイオサイクル：${data.bioInfo}` : ''}

ルール：
・体重増加でも「バイオサイクルの調整期なので自然」と励ます
・「来週はどんな変化が期待できるか」を前向きに伝える
・絵文字を1〜2個だけ自然に使う
・断定・説教・他人との比較は絶対しない
・「${data.userName}さん」と名前で呼びかける`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
    };

    const res = UrlFetchApp.fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      }
    );

    const json = JSON.parse(res.getContentText());
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || '今週もよく頑張りました！サプリを続けることが大切です🌿';
  },

  _sendReportEmail(user, reportText, reportUrl, weekStart) {
    const subject = `【Nolia】${weekStart}週のあなたのレポートが届きました 🌿`;
    const body = `
${user.display_name || user.name}さん、こんにちは。

今週のNoliaレポートが届きました。

━━━━━━━━━━━━━━━━━━
${reportText}
━━━━━━━━━━━━━━━━━━

▼ 会員ページで詳しく見る
${reportUrl}

引き続き、一緒にカラダのリズムを整えていきましょう！

Noliaチーム
    `.trim();

    GmailApp.sendEmail(user.email, subject, body);
  },

  // 先週月曜日の日付を返す（YYYY-MM-DD）
  _getLastMonday() {
    const today = new Date();
    const jst   = new Date(today.getTime() + 9 * 3600000);
    const day   = jst.getDay(); // 0=日, 1=月
    const diff  = day === 0 ? -6 : 1 - day;
    const monday = new Date(jst.getTime() + diff * 86400000);
    monday.setDate(monday.getDate() - 7);
    return monday.toISOString().split('T')[0];
  },

  _addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  },

  // バイオリズム状態テキスト（GAS版計算）
  _calcBioText(birthdate, targetDate) {
    const days = Math.floor((targetDate - new Date(birthdate)) / 86400000);
    const physical  = Math.sin(2 * Math.PI * days / 23);
    const emotional = Math.sin(2 * Math.PI * days / 28);
    const vitality  = Math.sin(2 * Math.PI * days / 33);
    const getPhase = v => v > 0.5 ? '好調期' : v > 0 ? '上昇期' : v > -0.5 ? '調整期' : '充電期';
    return `体力${getPhase(physical)}・こころ${getPhase(emotional)}・活力${getPhase(vitality)}`;
  },

  _parseStats(biorhythmInfo) {
    try { return JSON.parse(biorhythmInfo); } catch(_) { return null; }
  },

  // Sheets が Date オブジェクトで返す場合も YYYY-MM-DD 文字列に統一
  _toDateStr(val) {
    if (!val) return '';
    if (val instanceof Date) {
      return Utilities.formatDate(val, 'Asia/Tokyo', 'yyyy-MM-dd');
    }
    return String(val).split('T')[0];
  },
};

// 毎週日曜22時に自動実行するトリガー（手動で設定）
// GASエディタ → 時計アイコン → 週次トリガーを追加 → generateWeeklyReports を選択
function generateWeeklyReports() {
  const config = getConfig();
  Reports.generateAll(config.ADMIN_TOKEN);
}
