// ============================================================
// Masking.gs — 個人情報マスキング（AI送信前後の変換）
// ============================================================

// テキスト内の個人情報をプレースホルダーに置換し、セッションとして保存する
function maskPersonalInfo(text, sessionId) {
  const master = getSpreadsheet().getSheetByName(CONFIG.SHEET_USERS).getDataRange().getValues();
  const maskMap = {};
  let idx = 0;

  master.slice(1).forEach(row => {
    if (!row[0]) return;
    const fullName = String(row[1] || '');
    const kana     = String(row[2] || '');
    const nameNoSp = fullName.replace(/\s/g, '');

    // 置換対象パターン（長い順で後ほどソートするため、ここでは登録のみ）
    const patterns = [
      fullName, fullName + 'さん', fullName + '様',
      nameNoSp, nameNoSp + 'さん', nameNoSp + '様',
      kana, kana + 'さん',
    ].filter(p => p.length > 1);

    const ph = `【利用者_${String.fromCharCode(65 + idx)}】`;
    patterns.forEach(p => { if (!maskMap[p]) maskMap[p] = ph; });
    idx++;
  });

  // 長い文字列から順に置換（部分一致防止）
  let masked = text;
  Object.keys(maskMap)
    .sort((a, b) => b.length - a.length)
    .forEach(orig => { masked = masked.split(orig).join(maskMap[orig]); });

  // 逆引きマップを保存
  const revMap = {};
  Object.entries(maskMap).forEach(([k, v]) => { revMap[v] = k; });

  getSpreadsheet().getSheetByName(CONFIG.SHEET_MASK)
    .appendRow([sessionId, new Date(), JSON.stringify(revMap)]);

  return masked;
}

// プレースホルダーを元の個人情報に戻す
function unmaskPersonalInfo(text, sessionId) {
  const sessions = getSpreadsheet().getSheetByName(CONFIG.SHEET_MASK).getDataRange().getValues();
  const row = sessions.find(r => String(r[0]) === String(sessionId));
  if (!row) return text;

  const revMap = JSON.parse(row[2]);
  let result = text;
  Object.entries(revMap)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([ph, orig]) => { result = result.split(ph).join(orig); });

  return result;
}
