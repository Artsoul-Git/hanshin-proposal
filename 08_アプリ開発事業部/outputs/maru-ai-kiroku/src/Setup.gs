// ============================================================
// Setup.gs — スプレッドシート初期構築・カスタムメニュー・サイドバー
// ============================================================
// 【使い方】スプレッドシートを開く → メニュー「🤖 AI記録システム」が表示される

// スプレッドシートを開いたときに自動実行
function onOpen() {
  // WebアプリからアクセスするためにスプレッドシートIDを自動保存
  PropertiesService.getScriptProperties()
    .setProperty('SPREADSHEET_ID', SpreadsheetApp.getActiveSpreadsheet().getId());

  SpreadsheetApp.getUi()
    .createMenu('🤖 AI記録システム')
    .addItem('📋 初期セットアップ実行（初回のみ）', 'setupSpreadsheet')
    .addSeparator()
    .addItem('📖 使い方ガイドを開く', 'showGuide')
    .addItem('🔗 アプリのURLを確認する', 'showAppUrl')
    .addSeparator()
    .addItem('🔄 利用者マスターを再読み込み', 'refreshUsers')
    .addToUi();
}

// ============================================================
// メイン：シート一括セットアップ
// ============================================================
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // 既存シートの確認
  const exists = [CONFIG.SHEET_USERS, CONFIG.SHEET_LOG, CONFIG.SHEET_MASK]
    .filter(n => ss.getSheetByName(n));

  if (exists.length > 0) {
    const res = ui.alert(
      '確認',
      `「${exists.join('」「')}」は既に存在します。\n\n上書きして再セットアップしますか？\n（データは消去されます）`,
      ui.ButtonSet.YES_NO
    );
    if (res !== ui.Button.YES) return;
  }

  try {
    _setupUsersSheet(ss);
    _setupLogSheet(ss);
    _setupMaskSheet(ss);

    // デフォルトの「シート1」を削除
    const def = ss.getSheetByName('シート1');
    if (def && ss.getSheets().length > 1) ss.deleteSheet(def);

    // 利用者マスターを先頭に移動
    ss.setActiveSheet(ss.getSheetByName(CONFIG.SHEET_USERS));
    ss.moveActiveSheet(1);

    ui.alert(
      '✅ セットアップ完了',
      '3つのシートが作成されました。\n\n' +
      '【次のステップ】\n' +
      '① 「利用者マスター」のサンプルデータを実際の利用者情報に書き換える\n' +
      '② 「🤖 AI記録システム」→「アプリのURLを確認する」でURLを取得\n' +
      '③ スタッフにURLを共有する\n\n' +
      '詳しくは「使い方ガイドを開く」を参照してください。',
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('❌ エラー', 'セットアップ中にエラーが発生しました：\n' + e.message, ui.ButtonSet.OK);
  }
}

// ============================================================
// 利用者マスター シート
// ============================================================
function _setupUsersSheet(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_USERS) || ss.insertSheet(CONFIG.SHEET_USERS);
  sh.clearContents();
  sh.clearFormats();

  // ---- ヘッダー ----
  const headers = [['利用者ID', '氏名', 'フリガナ', '生年月日', '障害種別', '計画相談員名']];
  sh.getRange(1, 1, 1, 6).setValues(headers);
  sh.getRange(1, 1, 1, 6)
    .setBackground('#2B6CB0').setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // ---- 列幅 ----
  [80, 120, 150, 100, 100, 130].forEach((w, i) => sh.setColumnWidth(i + 1, w));

  // ---- サンプルデータ（2〜3行目・薄黄で区別）----
  const samples = [
    ['U001', '山田 太郎', 'ヤマダ タロウ', '1985/04/12', '精神障害', '田中 花子'],
    ['U002', '鈴木 花子', 'スズキ ハナコ', '1990/08/25', '知的障害', '田中 花子'],
  ];
  sh.getRange(2, 1, 2, 6).setValues(samples)
    .setBackground('#FEFCE8');

  // ---- 4行目以降の交互背景 ----
  sh.getRange(4, 1, 97, 6).setBackground('#F7FAFC');

  // ---- 注記行 ----
  sh.getRange(2, 1, 2, 6)
    .setBorder(null, null, null, null, null, true, '#E2E8F0', SpreadsheetApp.BorderStyle.SOLID);

  // ---- 全体枠線 ----
  sh.getRange(1, 1, 100, 6)
    .setBorder(true, true, true, true, true, true, '#CBD5E0', SpreadsheetApp.BorderStyle.SOLID);

  // ---- 行の高さ ----
  sh.setRowHeight(1, 34);
  sh.setRowHeightsForced(2, 99, 28);

  // ---- ヘッダー固定 ----
  sh.setFrozenRows(1);

  // ---- シート見出し色 ----
  sh.setTabColor('#2B6CB0');

  // ---- 説明コメント ----
  const note = '【入力方法】\n' +
    '利用者ID：U001, U002... と連番で入力\n' +
    '氏名：姓と名の間にスペースを入れる\n' +
    'フリガナ：カタカナで入力\n' +
    '生年月日：yyyy/MM/dd 形式\n' +
    '障害種別：精神障害/知的障害/身体障害 など\n' +
    '計画相談員名：担当者の氏名';
  sh.getRange('A1').setNote(note);
}

// ============================================================
// 生成ログ シート
// ============================================================
function _setupLogSheet(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_LOG) || ss.insertSheet(CONFIG.SHEET_LOG);
  sh.clearContents();
  sh.clearFormats();

  const headers = [['ログID', '生成日時', '利用者ID', '利用者名', '書類種別', '担当者', '生成内容', 'ステータス']];
  sh.getRange(1, 1, 1, 8).setValues(headers);
  sh.getRange(1, 1, 1, 8)
    .setBackground('#276749').setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  [200, 140, 70, 100, 120, 90, 500, 80]
    .forEach((w, i) => sh.setColumnWidth(i + 1, w));

  sh.setRowHeight(1, 34);
  sh.setFrozenRows(1);
  sh.setTabColor('#276749');

  // G列（生成内容）は折り返し表示
  sh.getRange('G:G').setWrap(true);

  // ステータス列に条件付き書式
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('生成済み')
    .setBackground('#F0FFF4')
    .setFontColor('#276749')
    .setRanges([sh.getRange('H2:H1000')])
    .build();
  sh.setConditionalFormatRules([rule]);

  sh.getRange(1, 1, 1, 8)
    .setBorder(true, true, true, true, true, true, '#CBD5E0', SpreadsheetApp.BorderStyle.SOLID);
}

// ============================================================
// マスキングセッション シート
// ============================================================
function _setupMaskSheet(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_MASK) || ss.insertSheet(CONFIG.SHEET_MASK);
  sh.clearContents();
  sh.clearFormats();

  const headers = [['セッションID', '実行日時', '逆引きマップ（JSON）']];
  sh.getRange(1, 1, 1, 3).setValues(headers);
  sh.getRange(1, 1, 1, 3)
    .setBackground('#744210').setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  [220, 140, 700].forEach((w, i) => sh.setColumnWidth(i + 1, w));
  sh.setRowHeight(1, 34);
  sh.setFrozenRows(1);
  sh.setTabColor('#744210');

  // 説明行
  sh.getRange('A2')
    .setValue('⚠️ このシートはシステムが自動管理します。手動で変更しないでください。')
    .setFontColor('#92400E').setFontStyle('italic').setFontSize(10)
    .setBackground('#FFFBEB');
  sh.getRange(2, 1, 1, 3).mergeAcross();

  sh.getRange(1, 1, 1, 3)
    .setBorder(true, true, true, true, true, true, '#CBD5E0', SpreadsheetApp.BorderStyle.SOLID);
}

// ============================================================
// サイドバー・URL確認
// ============================================================
function showGuide() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('📖 使い方ガイド')
    .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

function showAppUrl() {
  const url = ScriptApp.getService().getUrl();
  const msg = url
    ? `以下のURLをスタッフに共有してください：\n\n${url}\n\n※ スマホのブラウザで開けます`
    : 'まだデプロイされていません。\n\n「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」で設定してください。';
  SpreadsheetApp.getUi().alert('📱 アプリURL', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function refreshUsers() {
  SpreadsheetApp.getUi().alert(
    '✅ 完了',
    '利用者マスターは起動時に自動で読み込まれます。\nアプリを開き直すと最新データが反映されます。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
