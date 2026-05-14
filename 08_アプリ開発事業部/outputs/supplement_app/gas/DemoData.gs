// =============================================
// DemoData.gs — デモデータ一括挿入（1回だけ実行）
// =============================================
// GASエディタで insertDemoData() を選択して実行してください
// =============================================

function insertDemoData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var userId = _updateUserStartDate(ss);
  if (!userId) {
    Logger.log('エラー: ユーザーが見つかりません');
    return;
  }
  Logger.log('対象ユーザーID: ' + userId);
  _insertDailyLogs(ss, userId);
  _insertWeeklyReports(ss, userId);
  Logger.log('デモデータ挿入完了');
  SpreadsheetApp.getActiveSpreadsheet().toast('デモデータ挿入完了！', 'Nolia Demo', 5);
}

function _updateUserStartDate(ss) {
  var sheet        = ss.getSheetByName('users');
  var data         = sheet.getDataRange().getValues();
  var headers      = data[0];
  var userIdIdx    = headers.indexOf('user_id');
  var startDateIdx = headers.indexOf('start_date');
  var joinedAtIdx  = headers.indexOf('joined_at');
  var statusIdx    = headers.indexOf('status');
  for (var i = 1; i < data.length; i++) {
    var status = statusIdx >= 0 ? data[i][statusIdx] : '';
    if (status === 'churned') continue;
    var userId = String(data[i][userIdIdx]);
    sheet.getRange(i + 1, startDateIdx + 1).setValue('2026-02-17');
    sheet.getRange(i + 1, joinedAtIdx  + 1).setValue('2026-02-17T08:30:00.000Z');
    Logger.log('users更新: ' + userId);
    return userId;
  }
  return null;
}

function _insertDailyLogs(ss, userId) {
  var sheet   = ss.getSheetByName('daily_log');
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var START      = new Date('2026-02-17T00:00:00Z');
  var TOTAL_DAYS = 88;
  var weightCurve = [
    {d:0,w:61.5},{d:7,w:61.9},{d:20,w:61.0},{d:35,w:60.2},
    {d:48,w:59.9},{d:55,w:59.8},{d:65,w:59.1},{d:75,w:58.7},{d:88,w:58.0}
  ];
  var SKIP = [4,5,11,19,20,26,34,35,43,50,56,57,63,71];
  var MEMOS = [
    'よく眠れた','ジムに行った','水たくさん飲んだ','体が軽い気がする',
    '少し食べ過ぎた','疲れが残ってる','気分が上がってきた','体重減ってきた',
    '食欲がなかった','良い汗かけた','野菜多めにした','夜遅く食べてしまった',
    '散歩した','ぐっすり眠れた','胃腸の調子がいい','いい1日だった',
    '今日は頑張れた','お腹すっきり','疲れたけど記録できた','ちょっと食べすぎ'
  ];
  var rows = [];
  for (var d = 0; d < TOTAL_DAYS; d++) {
    if (SKIP.indexOf(d) >= 0) continue;
    var date    = new Date(START.getTime() + d * 86400000);
    var dateStr = date.toISOString().split('T')[0];
    var baseWeight   = _interpolateWeight(weightCurve, d);
    var weight       = Math.round((baseWeight + (_rand(d*3+1)-0.5)*0.7) * 10) / 10;
    var moodProgress = Math.min(1, d / 60);
    var mood  = Math.min(5, Math.max(1, Math.round(2.4 + moodProgress*1.4 + (_rand(d*5+2)-0.5)*2.2)));
    var cond  = Math.min(5, Math.max(1, Math.round(2.2 + moodProgress*1.3 + (_rand(d*7+3)-0.5)*2.2)));
    var taken = (mood === 1 && cond === 1) ? (_rand(d*13) > 0.5) : (_rand(d*11+4) > 0.15);
    var memo  = (d % 4 === 1) ? MEMOS[d % MEMOS.length] : '';
    var hourOffset = Math.floor(_rand(d*17)*4+6);
    var createdAt  = new Date(date.getTime() + hourOffset*3600000).toISOString();
    var logObj = {
      log_id:     'LOG_DEMO' + String(d+1000).padStart(4,'0'),
      user_id:    userId,
      log_date:   dateStr,
      weight:     weight,
      mood:       mood,
      cond:       cond,
      taken:      taken,
      memo:       memo,
      created_at: createdAt
    };
    rows.push(headers.map(function(h){ return logObj[h] !== undefined ? logObj[h] : ''; }));
  }
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow()+1, 1, rows.length, headers.length).setValues(rows);
  }
  Logger.log('daily_log追加: ' + rows.length + '件');
}

function _insertWeeklyReports(ss, userId) {
  var sheet = ss.getSheetByName('weekly_reports');
  if (!sheet) { Logger.log('weekly_reportsなし'); return; }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var REPORTS = [
    {week:'2026-02-17',text:'サプリを始めて最初の1週間。体重は61.9kgとスタートより少し上がりましたが、これは筋肉への刺激や水分バランスの調整段階です。記録を毎日続けられていて素晴らしいスタートです！',stats:{weight_change:0.4,taken_rate:86,avg_mood:3}},
    {week:'2026-02-24',text:'2週目に入り、体重が少しずつ落ちてきました（61.0kg）。気分や体調も安定してきた日が増えています。サプリの効果が出始めるのは3〜4週目からが多いので、このまま続けましょう！',stats:{weight_change:-0.9,taken_rate:83,avg_mood:3}},
    {week:'2026-03-03',text:'3週目。体重は60.5kg付近で推移しています。気分スコアも平均3.2と上向き傾向。服用率85%は立派です。少し調子が落ちた日もありましたが、記録を欠かさなかったのが好印象です！',stats:{weight_change:-0.5,taken_rate:85,avg_mood:3}},
    {week:'2026-03-10',text:'4週目で1か月に近づいてきました。体重60.2kgで着実に進んでいます。気分スコアが平均3.5と上がっており、カラダのリズムが整ってきた証拠。今週も継続記録で連続記録を伸ばしましょう！',stats:{weight_change:-0.3,taken_rate:90,avg_mood:4}},
    {week:'2026-03-17',text:'5週目。体重はわずかに停滞気味ですが、これはよくある2〜3週間サイクルの調整期です。体調スコアが改善しているのは良いシグナル。停滞期こそ記録が重要です！',stats:{weight_change:-0.1,taken_rate:88,avg_mood:3}},
    {week:'2026-03-24',text:'6週目。体重は60.0kgを切りました（59.9kg）！停滞を突破して再び動き出しています。気分スコア平均3.8と今週最高値。6週間の継続は大きな財産です。',stats:{weight_change:-0.3,taken_rate:100,avg_mood:4}},
    {week:'2026-03-31',text:'7週目。今週は少し疲れが出た日もありましたが、服用率を維持できています。体重59.7kgで着実に前進中。バイオサイクルの体力が充実期に入っているので、この調子です！',stats:{weight_change:-0.2,taken_rate:86,avg_mood:3}},
    {week:'2026-04-07',text:'8週目・2か月経過！体重59.3kgまで来ました。開始時から-2.2kg。気分も体調もスコアが全体的に上向きで、カラダのリズムと生活習慣がしっかり整ってきています。次の1か月も一緒に頑張りましょう！',stats:{weight_change:-0.4,taken_rate:88,avg_mood:4}},
    {week:'2026-04-14',text:'9週目。今週は記録の空白が少しありましたが、それでも服用継続できています。体重59.1kgで停滞と前進を繰り返しながらも確実に目標へ近づいています。',stats:{weight_change:-0.2,taken_rate:83,avg_mood:3}},
    {week:'2026-04-21',text:'10週目。体重58.8kgで着実に下降中。目標54kgまで残り約5kg。気分スコア平均4.0と今期最高値を更新！カラダとこころの好調期が重なっています。',stats:{weight_change:-0.3,taken_rate:90,avg_mood:4}},
    {week:'2026-04-28',text:'11週目。体重58.5kgまで到達。3か月継続の目標まであと2週間！服用率・記録率ともに高水準をキープ。カラダのリズムが完全に整ってきた証拠です。',stats:{weight_change:-0.3,taken_rate:86,avg_mood:4}},
    {week:'2026-05-05',text:'12週目・3か月達成おめでとうございます！体重58.1kgと開始時から-3.4kgを達成。服用率87%・記録率84%は素晴らしい数字です。次のステージへ向けて、さらなるサポートを続けます！',stats:{weight_change:-0.4,taken_rate:87,avg_mood:4}}
  ];
  var rows = REPORTS.map(function(r, i) {
    var reportId = 'RPT_DEMO' + String(i+1).padStart(3,'0');
    var sentAt   = new Date(r.week + 'T07:00:00.000Z').toISOString();
    var bioInfo  = JSON.stringify(r.stats);
    var obj = {
      report_id:      reportId,
      user_id:        userId,
      week_start:     r.week,
      report_text:    r.text,
      biorhythm_info: bioInfo,
      sent_at:        sentAt,
      opened_at:      ''
    };
    return headers.map(function(h){ return obj[h] !== undefined ? obj[h] : ''; });
  });
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow()+1, 1, rows.length, headers.length).setValues(rows);
  }
  Logger.log('weekly_reports追加: ' + rows.length + '件');
}

function _interpolateWeight(curve, day) {
  for (var i = 0; i < curve.length - 1; i++) {
    if (day >= curve[i].d && day <= curve[i+1].d) {
      var t = (day - curve[i].d) / (curve[i+1].d - curve[i].d);
      return curve[i].w + t * (curve[i+1].w - curve[i].w);
    }
  }
  return curve[curve.length-1].w;
}

function _rand(seed) {
  var x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

function deleteDemoData() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('daily_log');
  var data  = sheet.getDataRange().getValues();
  var logIdIdx = data[0].indexOf('log_id');
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][logIdIdx]).indexOf('LOG_DEMO') === 0) {
      sheet.deleteRow(i + 1);
    }
  }
  var rSheet = ss.getSheetByName('weekly_reports');
  if (rSheet) {
    var rData  = rSheet.getDataRange().getValues();
    var rIdIdx = rData[0].indexOf('report_id');
    for (var j = rData.length - 1; j >= 1; j--) {
      if (String(rData[j][rIdIdx]).indexOf('RPT_DEMO') === 0) {
        rSheet.deleteRow(j + 1);
      }
    }
  }
  Logger.log('デモデータ削除完了');
  SpreadsheetApp.getActiveSpreadsheet().toast('デモデータ削除完了', 'Nolia Demo', 5);
}
