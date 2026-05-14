// =============================================
// DemoData.gs — デモデータ一括挿入（1回だけ実行）
// =============================================
// ▼ GASエディタで insertDemoData() を選択して「実行」してください
// ▼ 実行後はこのファイルを削除（または関数を呼ばないように）してください
// =============================================

function insertDemoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── 1. users シート：start_date と joined_at を更新 ──────────────
  _updateUserStartDate(ss);

  // ── 2. daily_log シート：2026-02-14〜2026-05-12 の記録を追加 ──────
  _insertDailyLogs(ss);

  // ── 3. weekly_reports シート：週次レポートを追加 ──────────────────
  _insertWeeklyReports(ss);

  Logger.log('デモデータ挿入完了！');
  SpreadsheetApp.getActiveSpreadsheet().toast('デモデータ挿入完了！', 'Nolia Demo', 5);
}

// ──────────────────────────────────────────────────────────────────
// ユーザーのサプリ開始日・登録日を3か月前に変更
// ──────────────────────────────────────────────────────────────────
function _updateUserStartDate(ss) {
  const sheet   = ss.getSheetByName('users');
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdIdx    = headers.indexOf('user_id');
  const startDateIdx = headers.indexOf('start_date');
  const joinedAtIdx  = headers.indexOf('joined_at');

  for (let i = 1; i < data.length; i++) {
    if (data[i][userIdIdx] !== 'USR0001') continue;
    sheet.getRange(i + 1, startDateIdx + 1).setValue('2026-02-14');
    sheet.getRange(i + 1, joinedAtIdx  + 1).setValue('2026-02-14T08:30:00.000Z');
    Logger.log('users 更新完了');
    break;
  }
}

// ──────────────────────────────────────────────────────────────────
// 日次記録を生成して追加
// ストーリー：61.5kg → 58.0kg（自然な減少・停滞・回復のリズム）
// ──────────────────────────────────────────────────────────────────
function _insertDailyLogs(ss) {
  const sheet   = ss.getSheetByName('daily_log');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // 2026-02-14 から 2026-05-12 まで（88日間）
  const START = new Date('2026-02-14T00:00:00Z');
  const TOTAL_DAYS = 88;

  // ── 体重の基準ライン（セグメント線形補間）──
  const weightCurve = [
    { d: 0,  w: 61.5 },  // スタート
    { d: 7,  w: 61.9 },  // 最初の1週間は微増（よくある現象）
    { d: 20, w: 61.0 },  // 少し落ちてくる
    { d: 35, w: 60.2 },  // 順調に減少
    { d: 48, w: 59.9 },  // 停滞期
    { d: 55, w: 59.8 },  // まだ停滞
    { d: 65, w: 59.1 },  // 停滞突破
    { d: 75, w: 58.7 },  // 順調
    { d: 88, w: 58.0 },  // 3か月時点
  ];

  // ── 記録しない日（0始まりのインデックス）──
  // 84% ログ率（14日欠け）
  const SKIP = new Set([4, 5, 11, 19, 20, 26, 34, 35, 43, 50, 56, 57, 63, 71]);

  // ── 日本語メモのプール ──
  const MEMOS = [
    'よく眠れた', 'ジムに行った', '水たくさん飲んだ', '体が軽い気がする',
    '少し食べ過ぎた…', '疲れが残ってる', '気分が上がってきた', '体重減ってきた！',
    '食欲がなかった', '良い汗かけた', '野菜多めにした', '夜遅く食べてしまった',
    '散歩した', 'ぐっすり眠れた', '胃腸の調子がいい', 'いい1日だった',
    '今日は頑張れた', 'お腹すっきり', '疲れたけど記録できた', 'ちょっと食べすぎ',
  ];

  const rows = [];

  for (let d = 0; d < TOTAL_DAYS; d++) {
    if (SKIP.has(d)) continue;

    const date    = new Date(START.getTime() + d * 86400000);
    const dateStr = date.toISOString().split('T')[0];

    // 体重（基準ライン + 日内変動）
    const baseWeight = _interpolateWeight(weightCurve, d);
    const weightNoise = (_rand(d * 3 + 1) - 0.5) * 0.7;
    const weight = Math.round((baseWeight + weightNoise) * 10) / 10;

    // 気分（1〜5、序盤は低め→中盤から改善）
    const moodProgress = Math.min(1, d / 60);
    const moodBase = 2.4 + moodProgress * 1.4;
    const mood = Math.min(5, Math.max(1, Math.round(moodBase + (_rand(d * 5 + 2) - 0.5) * 2.2)));

    // 体調（1〜5、気分より少し渋め）
    const condBase = 2.2 + moodProgress * 1.3;
    const cond = Math.min(5, Math.max(1, Math.round(condBase + (_rand(d * 7 + 3) - 0.5) * 2.2)));

    // 服用（85%率、気分体調が1の日は飲み忘れやすい）
    const takenBase = _rand(d * 11 + 4) > 0.15;
    const taken = (mood === 1 && cond === 1) ? (_rand(d * 13) > 0.5) : takenBase;

    // メモ（約25%の日に入力）
    const memo = (d % 4 === 1) ? MEMOS[d % MEMOS.length] : '';

    // created_at（その日の朝〜昼ランダム）
    const hourOffset = Math.floor(_rand(d * 17) * 4 + 6); // 6〜9時
    const createdAt  = new Date(date.getTime() + hourOffset * 3600000).toISOString();

    const logId = 'LOG_DEMO' + String(d + 1000).padStart(4, '0');

    const logObj = {
      log_id:     logId,
      user_id:    'USR0001',
      log_date:   dateStr,
      weight:     weight,
      mood:       mood,
      cond:       cond,
      taken:      taken,
      memo:       memo,
      created_at: createdAt,
    };
    const row = headers.map(h => logObj[h] !== undefined ? logObj[h] : '');

    rows.push(row);
  }

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  }
  Logger.log('daily_log 追加: ' + rows.length + '件');
}

// ──────────────────────────────────────────────────────────────────
// 週次レポートを生成（12週分）
// ──────────────────────────────────────────────────────────────────
function _insertWeeklyReports(ss) {
  const sheet   = ss.getSheetByName('weekly_reports');
  if (!sheet) { Logger.log('weekly_reports シートなし、スキップ'); return; }
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const REPORTS = [
    { week: '2026-02-14', text: 'サプリを始めて最初の1週間。体重は61.9kgとスタートより少し上がりましたが、これは筋肉への刺激や水分バランスの調整段階です。記録を毎日続けられていて素晴らしいスタートです！', stats: { weight_change: +0.4, taken_rate: 86, avg_mood: 3 } },
    { week: '2026-02-21', text: '2週目に入り、体重が少しずつ落ちてきました（61.0kg）。気分や体調も安定してきた日が増えています。サプリの効果が出始めるのは3〜4週目からが多いので、このまま続けましょう！', stats: { weight_change: -0.9, taken_rate: 83, avg_mood: 3 } },
    { week: '2026-02-28', text: '3週目。体重は60.5kg付近で推移しています。気分スコアも平均3.2と上向き傾向。服用率85%は立派です。少し調子が落ちた日もありましたが、記録を欠かさなかったのが好印象です！', stats: { weight_change: -0.5, taken_rate: 85, avg_mood: 3 } },
    { week: '2026-03-07', text: '4週目で1か月に近づいてきました。体重60.2kgで着実に進んでいます。気分スコアが平均3.5と上がっており、カラダのリズムが整ってきた証拠。今週も継続記録で連続記録を伸ばしましょう！', stats: { weight_change: -0.3, taken_rate: 90, avg_mood: 4 } },
    { week: '2026-03-14', text: '5週目。体重はわずかに停滞気味ですが、これはよくある「2〜3週間サイクルの調整期」です。体調スコアが改善しているのは良いシグナル。停滞期こそ記録が重要です！', stats: { weight_change: -0.1, taken_rate: 88, avg_mood: 3 } },
    { week: '2026-03-21', text: '6週目。体重は60.0kgを切りました（59.9kg）！停滞を突破して再び動き出しています。気分スコア平均3.8と今週最高値。6週間の継続は大きな財産です。', stats: { weight_change: -0.3, taken_rate: 100, avg_mood: 4 } },
    { week: '2026-03-28', text: '7週目。今週は少し疲れが出た日もありましたが、服用率を維持できています。体重59.7kgで着実に前進中。バイオサイクルの体力が「充実期」に入っているので、この調子です！', stats: { weight_change: -0.2, taken_rate: 86, avg_mood: 3 } },
    { week: '2026-04-04', text: '8週目・2か月経過！体重59.3kgまで来ました。開始時から-2.2kg。気分も体調もスコアが全体的に上向きで、カラダのリズムと生活習慣がしっかり整ってきています。次の1か月も一緒に頑張りましょう！', stats: { weight_change: -0.4, taken_rate: 88, avg_mood: 4 } },
    { week: '2026-04-11', text: '9週目。今週は記録の空白が少しありましたが、それでも服用継続できています。体重59.1kgで停滞と前進を繰り返しながらも確実に目標へ近づいています。', stats: { weight_change: -0.2, taken_rate: 83, avg_mood: 3 } },
    { week: '2026-04-18', text: '10週目。体重58.8kgで着実に下降中。目標54kgまで残り約5kg。気分スコア平均4.0と今期最高値を更新！カラダとこころの好調期が重なっています。', stats: { weight_change: -0.3, taken_rate: 90, avg_mood: 4 } },
    { week: '2026-04-25', text: '11週目。体重58.5kgまで到達。3か月継続の目標まであと2週間！服用率・記録率ともに高水準をキープ。バイオリズムも「充実期」が多く、カラダのリズムが完全に整ってきた証拠です。', stats: { weight_change: -0.3, taken_rate: 86, avg_mood: 4 } },
    { week: '2026-05-02', text: '12週目・3か月達成おめでとうございます！体重58.1kgと開始時から-3.4kgを達成。服用率87%・記録率84%は素晴らしい数字です。次のステージへ向けて、さらなるサポートを続けます！', stats: { weight_change: -0.4, taken_rate: 87, avg_mood: 4 } },
  ];

  const rows = REPORTS.map((r, i) => {
    const reportId = 'RPT_DEMO' + String(i + 1).padStart(3, '0');
    const sentAt   = new Date(r.week + 'T07:00:00.000Z').toISOString();
    // biorhythm_info 列に stats を格納（Reports.gs の _parseStats と一致させる）
    const bioInfo  = JSON.stringify(r.stats);

    return headers.map(h => ({
      report_id:      reportId,
      user_id:        'USR0001',
      week_start:     r.week,
      report_text:    r.text,
      biorhythm_info: bioInfo,
      sent_at:        sentAt,
      opened_at:      '',
    }[h] !== undefined ? {
      report_id:      reportId,
      user_id:        'USR0001',
      week_start:     r.week,
      report_text:    r.text,
      biorhythm_info: bioInfo,
      sent_at:        sentAt,
      opened_at:      '',
    }[h] : ''));
  });

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  }
  Logger.log('weekly_reports 追加: ' + rows.length + '件');
}

// ──────────────────────────────────────────────────────────────────
// ヘルパー：体重の線形補間
// ──────────────────────────────────────────────────────────────────
function _interpolateWeight(curve, day) {
  for (let i = 0; i < curve.length - 1; i++) {
    if (day >= curve[i].d && day <= curve[i + 1].d) {
      const t = (day - curve[i].d) / (curve[i + 1].d - curve[i].d);
      return curve[i].w + t * (curve[i + 1].w - curve[i].w);
    }
  }
  return curve[curve.length - 1].w;
}

// ──────────────────────────────────────────────────────────────────
// ヘルパー：決定論的な擬似乱数（seed → 0〜1）
// ──────────────────────────────────────────────────────────────────
function _rand(seed) {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

// ──────────────────────────────────────────────────────────────────
// ▼ デモデータを削除したい場合はこちらを実行
// ──────────────────────────────────────────────────────────────────
function deleteDemoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('daily_log');
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  const logIdIdx = headers.indexOf('log_id');

  // LOG_DEMO で始まる行を削除（後ろから削除してインデックスずれを防ぐ）
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][logIdIdx]).startsWith('LOG_DEMO')) {
      sheet.deleteRow(i + 1);
    }
  }

  // weekly_reports の RPT_DEMO 行を削除
  const rSheet = ss.getSheetByName('weekly_reports');
  if (rSheet) {
    const rData    = rSheet.getDataRange().getValues();
    const rHeaders = rData[0];
    const rIdIdx   = rHeaders.indexOf('report_id');
    for (let i = rData.length - 1; i >= 1; i--) {
      if (String(rData[i][rIdIdx]).startsWith('RPT_DEMO')) {
        rSheet.deleteRow(i + 1);
      }
    }
  }

  Logger.log('デモデータ削除完了');
  SpreadsheetApp.getActiveSpreadsheet().toast('デモデータ削除完了', 'Nolia Demo', 5);
}
