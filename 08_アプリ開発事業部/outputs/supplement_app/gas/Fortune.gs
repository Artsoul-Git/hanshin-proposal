// =============================================
// Fortune.gs — 今日の占い（四柱推命ベース・動物占い風）
// =============================================

const Fortune = {

  getDaily(token) {
    const userId = Auth.getUserIdByToken(token);
    if (!userId) return jsonErr('invalid_token');

    // ユーザーの生年月日を取得
    const sheet   = getSheet('users');
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const userIdIdx    = headers.indexOf('user_id');
    const birthdateIdx = headers.indexOf('birthdate');
    const nameIdx      = headers.indexOf('display_name');

    let birthdate = '';
    let userName  = '';
    for (let i = 1; i < data.length; i++) {
      if (data[i][userIdIdx] !== userId) continue;
      birthdate = data[i][birthdateIdx] || '';
      userName  = data[i][nameIdx]      || '';
      break;
    }

    if (!birthdate) return jsonErr('birthdate_not_set');

    const today = todayJST();
    const fortune = this._generate(birthdate, today, userName);
    return jsonOk({ fortune, date: today });
  },

  _generate(birthdate, today, userName) {
    const prompt = `あなたは四柱推命をベースにした動物占いの占い師です。
生年月日から命式（年柱・月柱・日柱の干支）を算出し、今日の日柱と月柱の干支と組み合わせて、
${userName || 'あなた'}さんの今日の運勢を動物キャラクターで表現してください。

生年月日: ${birthdate}
今日の日付: ${today}

以下のJSON形式のみで出力（前後に余計な文章・マークダウン不要）:
{"animal":"動物名（ライオン・ウサギ・コアラ・チーター・ゾウ・オオカミ・トラ・クマ・キツネ・シカ・イルカ・フクロウ・ペガサス・タヌキなどから）","emoji":"その動物の絵文字1つ","tagline":"今日のひとことキャッチ（12文字以内）","message":"今日の運勢（70〜90文字・前向きに・具体的なアドバイスを含む）","lucky_color":"ラッキーカラー（色名のみ）","lucky_action":"今日のラッキーアクション（10文字以内）"}`;

    const raw = callGemini(prompt, 300);

    try {
      const m = raw.match(/\{[\s\S]*?\}/);
      if (m) return JSON.parse(m[0]);
    } catch(e) {
      console.warn('Fortune parse error:', e.message, raw);
    }

    // フォールバック
    return {
      animal:       'コアラ',
      emoji:        '🐨',
      tagline:      'ゆっくりが一番速い',
      message:      '今日は焦らずマイペースに過ごすと吉。カラダの声をよく聞いて、サプリもしっかり続けましょう。',
      lucky_color:  'グリーン',
      lucky_action: '深呼吸する',
    };
  },
};
