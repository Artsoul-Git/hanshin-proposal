/**
 * 1: サービス等利用計画 案.pdf をGoogleスプレッドシートで再現するテンプレート生成
 * - 個人情報は空欄化
 * - 2ページ構成（書式本体/週間計画表）
 * - 入力補助: チェックボックス、プルダウン
 */
function createServicePlanTemplate() {
  const ss = SpreadsheetApp.create('書類1_サービス等利用計画案_未記入テンプレート');

  const s1 = ss.getActiveSheet();
  s1.setName('書式本体_1of2');
  buildPage1_(s1);

  const s2 = ss.insertSheet('週間計画表_2of2');
  buildPage2_(s2);

  // 先頭に作成情報
  ss.getSheetByName('書式本体_1of2').getRange('A1').setValue('※未記入テンプレート（個人情報は含まれていません）').setFontColor('#666666');

  SpreadsheetApp.flush();
  Logger.log('Created: ' + ss.getUrl());
}

function buildPage1_(sh) {
  sh.clear();
  // 列幅（A:AN）
  for (let c = 1; c <= 40; c++) sh.setColumnWidth(c, 28);
  sh.setColumnWidth(1, 38);
  sh.setColumnWidth(2, 70);
  sh.setColumnWidth(3, 70);
  sh.setColumnWidth(4, 70);
  sh.setColumnWidth(5, 70);
  for (let r = 1; r <= 85; r++) sh.setRowHeight(r, 22);

  // タイトル
  sh.getRange('A2:AN2').merge().setValue('サービス等利用計画（案）').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');

  // 基本情報枠
  box_(sh, 4, 1, 10, 40);
  sh.getRange('A4:C5').merge().setValue('利用者氏名');
  sh.getRange('D4:I5').merge().setValue('');
  sh.getRange('J4:L5').merge().setValue('受給者証番号');
  sh.getRange('M4:R5').merge().setValue('');
  sh.getRange('S4:U5').merge().setValue('作成日');
  sh.getRange('V4:AN5').merge().setValue('');

  sh.getRange('A6:C7').merge().setValue('相談支援事業者');
  sh.getRange('D6:AN7').merge().setValue('');

  sh.getRange('A8:C9').merge().setValue('計画作成担当者');
  sh.getRange('D8:I9').merge().setValue('');
  sh.getRange('J8:L9').merge().setValue('連絡先');
  sh.getRange('M8:AN9').merge().setValue('');

  // 意向
  box_(sh, 12, 1, 18, 40);
  sh.getRange('A12:AN12').merge().setValue('利用者及びその家族の生活に対する意向（希望する生活）').setFontWeight('bold');
  sh.getRange('A13:AN18').merge().setValue('').setWrap(true).setVerticalAlignment('top');

  // 総合的な援助方針
  box_(sh, 20, 1, 25, 40);
  sh.getRange('A20:AN20').merge().setValue('総合的な援助の方針').setFontWeight('bold');
  sh.getRange('A21:AN25').merge().setValue('').setWrap(true).setVerticalAlignment('top');

  // 長期・短期目標
  box_(sh, 27, 1, 35, 40);
  sh.getRange('A27:K27').merge().setValue('長期目標').setFontWeight('bold');
  sh.getRange('L27:AN27').merge().setValue('短期目標').setFontWeight('bold');
  sh.getRange('A28:K35').merge().setValue('').setWrap(true).setVerticalAlignment('top');
  sh.getRange('L28:AN35').merge().setValue('').setWrap(true).setVerticalAlignment('top');

  // 課題解決テーブルヘッダ
  box_(sh, 37, 1, 80, 40);
  sh.getRange('A37:C38').merge().setValue('課題\n番号').setHorizontalAlignment('center');
  sh.getRange('D37:L38').merge().setValue('解決すべき課題（本人のニーズ）').setHorizontalAlignment('center');
  sh.getRange('M37:T38').merge().setValue('支援目標').setHorizontalAlignment('center');
  sh.getRange('U37:W38').merge().setValue('達成時期').setHorizontalAlignment('center');
  sh.getRange('X37:AF38').merge().setValue('福祉サービス等').setHorizontalAlignment('center');
  sh.getRange('AG37:AK38').merge().setValue('本人の役割').setHorizontalAlignment('center');
  sh.getRange('AL37:AN38').merge().setValue('評価時期').setHorizontalAlignment('center');

  let r = 39;
  for (let i = 1; i <= 4; i++) {
    const rr = r + (i - 1) * 10;
    sh.getRange(rr, 1, 10, 3).merge().setValue(String(i)).setHorizontalAlignment('center');
    sh.getRange(rr, 4, 10, 9).merge().setValue('').setWrap(true).setVerticalAlignment('top');
    sh.getRange(rr, 13, 10, 8).merge().setValue('').setWrap(true).setVerticalAlignment('top');
    sh.getRange(rr, 21, 10, 3).merge().setValue('').setHorizontalAlignment('center');
    sh.getRange(rr, 24, 10, 9).merge().setValue('').setWrap(true).setVerticalAlignment('top');
    sh.getRange(rr, 33, 10, 5).merge().setValue('').setWrap(true).setVerticalAlignment('top');
    sh.getRange(rr, 38, 10, 3).merge().setValue('').setHorizontalAlignment('center');
  }

  // 入力補助: 達成時期・評価時期プルダウン
  const periodRule = SpreadsheetApp.newDataValidation().requireValueInList(['1か月','3か月','6か月','12か月'], true).setAllowInvalid(false).build();
  sh.getRange('U39:W78').setDataValidation(periodRule);
  sh.getRange('AL39:AN78').setDataValidation(periodRule);

  // 見た目
  sh.getRange('A4:AN80').setFontSize(10).setVerticalAlignment('middle');
  sh.setFrozenRows(3);
}

function buildPage2_(sh) {
  sh.clear();
  for (let c = 1; c <= 40; c++) sh.setColumnWidth(c, 28);
  sh.setColumnWidth(1, 38);
  sh.setColumnWidth(2, 70);
  for (let r = 1; r <= 90; r++) sh.setRowHeight(r, 22);

  sh.getRange('A2:AN2').merge().setValue('サービス等利用計画・障害児支援利用計画【週間計画表】').setFontSize(13).setFontWeight('bold').setHorizontalAlignment('center');

  // 基本情報
  box_(sh, 4, 1, 8, 40);
  sh.getRange('A4:C5').merge().setValue('利用者氏名');
  sh.getRange('D4:I5').merge().setValue('');
  sh.getRange('J4:L5').merge().setValue('作成担当者');
  sh.getRange('M4:R5').merge().setValue('');
  sh.getRange('S4:U5').merge().setValue('計画開始年月');
  sh.getRange('V4:AN5').merge().setValue('');

  // 週間計画グリッド
  box_(sh, 10, 1, 62, 40);
  sh.getRange('A10:C11').merge().setValue('時間');
  const days = ['月','火','水','木','金','土','日'];
  let col = 4;
  days.forEach(d => {
    sh.getRange(10, col, 2, 5).merge().setValue(d).setHorizontalAlignment('center');
    col += 5;
  });

  // 時間帯
  const times = ['6:00','8:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00','0:00','2:00','4:00'];
  for (let i = 0; i < times.length; i++) {
    const rr = 12 + i * 4;
    sh.getRange(rr, 1, 4, 3).merge().setValue(times[i]).setHorizontalAlignment('center');
    for (let d = 0; d < 7; d++) {
      sh.getRange(rr, 4 + d * 5, 4, 5).merge().setValue('').setWrap(true).setVerticalAlignment('top');
    }
  }

  // 主な日常生活
  box_(sh, 64, 1, 72, 40);
  sh.getRange('A64:AN64').merge().setValue('主な日常生活上の活動').setFontWeight('bold');
  sh.getRange('A65:AN72').merge().setValue('').setWrap(true).setVerticalAlignment('top');

  // 週単位以外
  box_(sh, 74, 1, 82, 40);
  sh.getRange('A74:AN74').merge().setValue('週単位以外のサービス').setFontWeight('bold');
  sh.getRange('A75:AN82').merge().setValue('').setWrap(true).setVerticalAlignment('top');

  // 入力補助: よく使うサービス（チェックボックス）
  sh.getRange('A84:C84').merge().setValue('サービス選択').setFontWeight('bold');
  const labels = ['受診','病院受診','移動支援','居宅介護','訪問看護','就労継続支援B型'];
  for (let i = 0; i < labels.length; i++) {
    const r = 85 + i;
    sh.getRange(r, 2).insertCheckboxes();
    sh.getRange(r, 3, 1, 8).merge().setValue(labels[i]);
  }

  sh.getRange('A4:AN90').setFontSize(10).setVerticalAlignment('middle');
  sh.setFrozenRows(3);
}

function box_(sh, r1, c1, r2, c2) {
  sh.getRange(r1, c1, r2 - r1 + 1, c2 - c1 + 1).setBorder(true, true, true, true, true, true);
}
