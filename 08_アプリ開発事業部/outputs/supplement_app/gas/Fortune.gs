// =============================================
// Fortune.gs — 今日のエネルギー（四柱推命×五行カラー）
// =============================================

const Fortune = {

  getDaily(token) {
    const userId = Auth.getUserIdByToken(token);
    if (!userId) return jsonErr('invalid_token');

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
    const energy = this._generate(birthdate, today, userName);
    return jsonOk({ fortune: energy, date: today });
  },

  _generate(birthdate, today, userName) {
    const prompt = `あなたはNoliaというウェルネスアプリのAIです。
四柱推命に基づき、命式（年柱・月柱・日柱の干支）と今日の日柱・月柱の干支を計算し、
${userName || 'あなた'}さんの「今日の気（エネルギー）」を五行（木・火・土・金・水）と自然の色彩で表現してください。
動物キャラクターは一切使わず、自然の元素・光・色のイメージで。

生年月日: ${birthdate}
今日の日付: ${today}

以下のJSON形式のみで出力（前後に余計な文章・マークダウン不要）:
{"energy_name":"気のエネルギー名（例：清流の気・大地の息吹・陽炎の光・深淵の静・金風の閃き）（12文字以内）","color_name":"今日のカラー（日本語の色名 例：深緑・朱色・藤色・琥珀・紺碧）（10文字以内）","color_hex":"そのカラーのHEXコード（例：#2B8A7A）","keyword":"今日の一言（例：前進・充電・解放・温もり・凛）（6文字以内）","message":"今日のウェルネスメッセージ（70〜90文字・具体的な行動アドバイスを含む・前向きな内容）","lucky_action":"今日意識すること（12文字以内）"}`;

    const raw = callGemini(prompt, 350);

    try {
      const m = raw.match(/\{[\s\S]*?\}/);
      if (m) return JSON.parse(m[0]);
    } catch(e) {
      console.warn('Fortune parse error:', e.message, raw);
    }

    // フォールバック（デフォルトは木のエネルギー）
    return {
      energy_name:  '清流の気',
      color_name:   'フォレストグリーン',
      color_hex:    '#2B8A7A',
      keyword:      'ありのまま',
      message:      '今日は自分のペースを大切に。カラダの声に耳を傾けながら、サプリとともにリズムを整えていきましょう。',
      lucky_action: '深呼吸する',
    };
  },
};
