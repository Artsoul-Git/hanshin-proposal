(function () {

  function H(title) {
    return '<header class="slide-header"><h2 class="slide-h2">' + title + '</h2></header>';
  }

  /* ===================== SLIDES ===================== */

  /* --- COVER (slides 01–04) --- */

  function slide01() {
    return '<section class="slide slide-cover" data-section="cover" data-title="契約書AIチェックセミナー" data-notes="BGM流しながら受講者着席を待つ。開始前に画面共有・マイク確認。">' +
      '<div class="slide-cover-bar">' +
        '<div class="slide-cover-tag">有限会社アートソウル AI導入支援事業</div>' +
        '<h1 class="slide-cover-title">契約書AIチェックセミナー</h1>' +
      '</div>' +
      '<div class="slide-cover-body">' +
        '<p class="slide-cover-sub">AIを法務の一次確認に使う習慣をつくる</p>' +
        '<div class="slide-cover-meta">2026.05 ｜ AIを使う前に知っておくこと</div>' +
      '</div>' +
    '</section>';
  }

  function slide02() {
    return '<section class="slide slide-impact" data-section="cover" data-title="サインする前の5分が、のちの5年を変える" data-notes="開幕の1枚。しばらく黙って見せる。たった5分の確認で防げたことが、実は山ほどあります。今日はその5分の使い方を覚えて帰ってください。">' +
      '<div class="slide-content slide-content-center">' +
        '<div class="s-impact-tag">TODAY</div>' +
        '<p class="s-impact-main">サインする前の5分が、<br>のちの5年を変える。</p>' +
      '</div>' +
    '</section>';
  }

  function slide03() {
    return '<section class="slide" data-section="cover" data-title="今日のゴールは「1つだけ」" data-notes="今日は60分で進めていきます。後半に質問の時間も設けていますので、気になることは遠慮なく。始めに、今日の着地点をお伝えします。今日のセミナーが終わったとき、AIで契約書をすべて完璧にチェックできるようになる、という場ではありません。今日お持ち帰りいただきたいのは、1つだけです。怪しいかどうかを5分で洗い出す習慣とその道具。これだけを掴んでもらえれば、今日は十分です。">' +
      H('今日のゴールは「1つだけ」') +
      '<div class="slide-content">' +
        '<ul class="s-list">' +
          '<li class="s-list-callout">AIを、法務の一次確認に使う習慣をつくる</li>' +
          '<li class="s-list-arrow">「AIで完璧なチェックができる」場ではありません</li>' +
          '<li class="s-list-arrow">「怪しいかどうかを5分で洗い出す」道具と習慣を掴む場です</li>' +
          '<li class="s-list-arrow">今日終わったとき、<strong>なんとなくできそう</strong>という感覚を持ち帰る</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide04() {
    return '<section class="slide" data-section="cover" data-title="本日の流れ" data-notes="全体像を最初に見せる。前半20分で基礎知識、後半20分は実際に動くところを見ていただきます。残り20分は質問にお答えします。">' +
      H('本日の流れ') +
      '<div class="slide-content">' +
        '<div class="s-steps">' +
          '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>座学</strong>：AIを使う前に知っておくこと</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>実演①</strong>：業務委託契約書チェック【Claude】</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>実演②</strong>：FC加盟契約書チェック【Gemini】</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">④</div><div><div class="s-step-text"><strong>Q&amp;A＋まとめ</strong></div></div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  /* --- PART 01: 座学 (slides 05–14) --- */

  function slide05() {
    return '<section class="slide slide-section" data-section="part1" data-title="座学ブロック" data-notes="">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 01</div>' +
        '<h1 class="s-section-title">座学ブロック</h1>' +
        '<p class="s-section-lead">AIを使う前に知っておくこと</p>' +
      '</div>' +
    '</section>';
  }

  function slide06() {
    return '<section class="slide" data-section="part1" data-title="ケース①：業務委託で損害賠償が青天井に" data-notes="少し、身近な話から入らせてください。1つ目のケースです。普段の仕事で、契約書をどのくらい確認していますか？相手が出してきたものだから大丈夫だろうと判断されていることが多いのではないかと思います。">' +
      H('ケース①：損害賠償が「青天井」になった') +
      '<div class="slide-content">' +
        '<div class="s-risk-list">' +
          '<div class="s-risk-item">' +
            '<div class="s-risk-header"><span class="s-risk-badge high">実際のケース</span><span class="s-risk-title">業務委託契約 / Webシステム開発</span></div>' +
            '<div class="s-risk-body">' +
              '「甲に生じた一切の損害を乙が賠償する」<br>上限の記載なし。作業ミスで300万円を請求された。' +
              '<div class="s-risk-proposal">見るべき条項：損害賠償条項の「上限額」の有無</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:1cqw;">' +
          '<li class="s-list-arrow">「普通はこういう書き方をしない」とは限らない</li>' +
          '<li class="s-list-arrow">相手が出した書類だから大丈夫、ではない</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide07() {
    return '<section class="slide" data-section="part1" data-title="ケース②：NDAで業務範囲が実質制限された" data-notes="2つ目のケースです。秘密保持契約は守秘のためのもの、と思っていたら、業務の幅そのものが縛られていた、という話です。">' +
      H('ケース②：NDAで業務範囲が実質制限された') +
      '<div class="slide-content">' +
        '<div class="s-risk-list">' +
          '<div class="s-risk-item">' +
            '<div class="s-risk-header"><span class="s-risk-badge high">実際のケース</span><span class="s-risk-title">NDA（秘密保持契約）/ フリーランス</span></div>' +
            '<div class="s-risk-body">' +
              '「業務を通じて知り得た一切の情報」が秘密情報に。<br>同業他社の仕事を受けることができなくなった。' +
              '<div class="s-risk-proposal">見るべき条項：「秘密情報の範囲」と「競業避止義務」の有無</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:1cqw;">' +
          '<li class="s-list-arrow">「一切の情報」は広すぎる。交渉できたはず</li>' +
          '<li class="s-list-arrow">NDAは守秘のためだけとは限らない</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide08() {
    return '<section class="slide" data-section="part1" data-title="ケース③：SaaS規約でデータがAI学習に使われた" data-notes="3つ目です。これは特に今、気をつけていただきたいケースです。ツールを使い始めてから気づくケースが増えています。">' +
      H('ケース③：SaaS規約でデータがAI学習に使われた') +
      '<div class="slide-content">' +
        '<div class="s-risk-list">' +
          '<div class="s-risk-item">' +
            '<div class="s-risk-header"><span class="s-risk-badge high">実際のケース</span><span class="s-risk-title">SaaS利用規約 / 業務ツール導入</span></div>' +
            '<div class="s-risk-body">' +
              '「サービス改善・AI学習に利用する場合がある」<br>入力した顧客情報・社内文書が学習データに使われていた。' +
              '<div class="s-risk-proposal">見るべき条項：「データの利用目的」「AIトレーニング」への言及</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:1cqw;">' +
          '<li class="s-list-arrow">利用規約の「改正」で後から追加されることもある</li>' +
          '<li class="s-list-arrow">無料プランほどこの条項が含まれやすい</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide09() {
    return '<section class="slide slide-metric" data-section="part1" data-title="1〜3万円" data-notes="どのケースも、サインする前に5〜10分、重要な箇所だけをAIで確認していれば、気づけた可能性が高いことです。問題が発生してから弁護士に相談する場合、初回の法律相談だけで1〜3万円。サイン前の一次確認が、実は一番安い法務コストです。今日はその方法を、実際に体験していただきます。">' +
      '<div class="slide-content slide-content-center">' +
        '<p class="s-metric-lead">問題が起きてから弁護士に相談すると</p>' +
        '<div class="s-metric-value">1〜3万円</div>' +
        '<p class="s-metric-desc">初回法律相談費用（着手金は別途）</p>' +
        '<p class="s-metric-source">一般的な弁護士費用の目安（2024年）</p>' +
      '</div>' +
    '</section>';
  }

  function slide10() {
    return '<section class="slide" data-section="part1" data-title="AIの立ち位置" data-notes="今日の話はAIがあれば弁護士は不要という話ではありません。重要な契約書は弁護士に確認していただくべきです。ただ現実として、毎月届くSaaSの利用規約、取引先から送られてくる業務委託契約、これを都度弁護士に相談するのはコストとスピードの面で難しい。AIをどう位置づけるかというと、弁護士に相談するかどうかを判断するための、一次確認の道具です。">' +
      H('AIの立ち位置') +
      '<div class="slide-content">' +
        '<div class="s-compare">' +
          '<div class="s-compare-col neutral">' +
            '<div class="s-compare-badge">弁護士</div>' +
            '<div class="s-compare-title">専門家に依頼する領域</div>' +
            '<ul class="s-compare-items">' +
              '<li>確定した法的判断</li>' +
              '<li>交渉代理</li>' +
              '<li>契約書の新規作成</li>' +
              '<li>重大案件の最終確認</li>' +
            '</ul>' +
          '</div>' +
          '<div class="s-compare-col positive">' +
            '<div class="s-compare-badge">AI</div>' +
            '<div class="s-compare-title">一次確認の領域</div>' +
            '<ul class="s-compare-items">' +
              '<li>「ここが引っかかる」を洗い出す</li>' +
              '<li>弁護士に相談するか判断する材料</li>' +
              '<li>相談内容を具体化する</li>' +
              '<li>5〜10分で怪しい箇所を絞る</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide11() {
    return '<section class="slide slide-quote" data-section="part1" data-title="AIは答えを出す機械ではなく…" data-notes="">' +
      '<div class="slide-content slide-content-center">' +
        '<blockquote class="s-quote">AIは答えを出す機械ではなく、<br>確認すべき問いを見つける道具。</blockquote>' +
      '</div>' +
    '</section>';
  }

  function slide12() {
    return '<section class="slide" data-section="part1" data-title="チェックすべき書類の全体地図" data-notes="チェックすべき書類の全体像をお伝えします。全部を今日のうちに覚えていただかなくて構いません。こういう地図があるという感覚だけ持ってもらえれば十分です。詳細はあとでお渡しするプロンプトテンプレートに書いてあります。全部覚えなくていいです。後半のハンズオンで実際に動かしながら確認していきましょう。">' +
      H('チェックすべき書類の全体地図') +
      '<div class="slide-content">' +
        '<ul class="s-list">' +
          '<li class="s-list-head">書類①：契約書（業務委託・NDA）</li>' +
          '<li class="s-list-sub">→ 報酬・損害賠償・解除条件・知財帰属</li>' +
          '<li class="s-list-head">書類②：利用規約（SaaS・外部サービス）</li>' +
          '<li class="s-list-sub">→ データの利用・損害免責・解約後のデータ</li>' +
          '<li class="s-list-head">書類③：自社のプライバシーポリシー</li>' +
          '<li class="s-list-sub">→ 利用目的・第三者提供・開示請求手続き</li>' +
          '<li class="s-list-callout">全部覚えなくていい。プロンプトテンプレートに盛り込んであります</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide13() {
    return '<section class="slide" data-section="part1" data-title="AIを安全に使う 2つのルール" data-notes="使い始める前に、2つだけ守っていただきたいことがあります。ルール1：機密情報は伏せてから入力する。ルール2：AIの指摘は必ず元の文書で確認する。AIは誤った情報を自信ありげに提示することがあります。これをハルシネーションと呼びます。">' +
      H('AIを安全に使う 2つのルール') +
      '<div class="slide-content">' +
        '<ul class="s-list">' +
          '<li class="s-list-head">ルール① マスキング（機密情報は伏せてから入力）</li>' +
          '<li class="s-list-sub">会社名→A社 ／ 個人名→[担当者名] ／ 金額→[契約金額] ／ 日付→[契約期限]</li>' +
          '<li class="s-list-sub">慣れれば1〜2分。置き換えを戻して元文書の該当箇所を確認する流れ</li>' +
          '<li class="s-list-head">ルール② 元の文書で確認（AIの指摘を鵜呑みにしない）</li>' +
          '<li class="s-list-sub">ハルシネーション：誤った情報を自信ありげに提示する特性</li>' +
          '<li class="s-list-sub">「第5条に上限が書かれています」→ 実際に第5条を確認する</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide14() {
    return '<section class="slide" data-section="part1" data-title="安全で効率的な使い方の流れ" data-notes="この4ステップが、安全で効率的な使い方です。この2つのルールを守っていただければ、あとは使いながら慣れていただけます。">' +
      H('安全で効率的な使い方の流れ') +
      '<div class="slide-content">' +
        '<div class="s-flow">' +
          '<div class="s-flow-step"><div class="s-flow-num">1</div><div class="s-flow-label">マスキング</div><div class="s-flow-desc">会社名・金額・日付を置き換え</div></div>' +
          '<div class="s-flow-step"><div class="s-flow-num">2</div><div class="s-flow-label">AIに確認</div><div class="s-flow-desc">状況と目的をプロンプトで伝える</div></div>' +
          '<div class="s-flow-step"><div class="s-flow-num">3</div><div class="s-flow-label">元文書で照合</div><div class="s-flow-desc">指摘された条番号を自分で確認</div></div>' +
          '<div class="s-flow-step"><div class="s-flow-num">4</div><div class="s-flow-label">必要なら専門家へ</div><div class="s-flow-desc">相談内容が具体的な状態で臨む</div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  /* --- PART 02: 実演① Claude (slides 15–21) --- */

  function slide15() {
    return '<section class="slide slide-section" data-section="part2" data-title="実演① 業務委託契約書チェック" data-notes="座学はここまでです。ここからは実際に動かすところをお見せします。まず3点だけ確認させてください。">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 02</div>' +
        '<h1 class="s-section-title">実演① 業務委託契約書チェック</h1>' +
        '<p class="s-section-lead">Claude を使って実際に動かします</p>' +
      '</div>' +
    '</section>';
  }

  function slide16() {
    return '<section class="slide" data-section="part2" data-title="実演を始める前に：状況確認" data-notes="まず3点だけ確認させてください。ヒアリング後では今日は[ルートA/B/C]を中心に進めましょう。">' +
      H('実演を始める前に：状況確認') +
      '<div class="slide-content">' +
        '<ul class="s-list">' +
          '<li>確認① 普段、契約書を「受け取る」「渡す」どちらが多いですか？</li>' +
          '<li>確認② 受け取る場合：条件の交渉はできますか？のむしかない？</li>' +
          '<li>確認③ 今日試したい書類はありますか？（なければサンプルを使います）</li>' +
        '</ul>' +
        '<div class="s-routes">' +
          '<div class="s-route-card"><div class="s-route-label">ROUTE A</div><div class="s-route-title">受け取る × 交渉できる</div><div class="s-route-desc">不利条項の洗い出し＋修正案</div></div>' +
          '<div class="s-route-card"><div class="s-route-label">ROUTE B</div><div class="s-route-title">受け取る × のむしかない</div><div class="s-route-desc">リスク優先度＋社内対策</div></div>' +
          '<div class="s-route-card"><div class="s-route-label">ROUTE C</div><div class="s-route-title">渡す側</div><div class="s-route-desc">法的適合性＋相手目線チェック</div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide17() {
    return '<section class="slide" data-section="part2" data-title="Claudeへの書類の渡し方" data-notes="今日はClaudeを使います。ChatGPTでも同じように動きます。まず最初に、契約書をAIに渡す方法をお見せします。プロンプトの内容が重要なので、ツールよりも何を書くかを見ていてください。">' +
      H('Claudeへの書類の渡し方') +
      '<div class="slide-content">' +
        '<div class="s-steps">' +
          '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">claude.ai を開く → 新規チャットを作成</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">ペーパークリップ／添付アイコン → ファイルをアップロード</div><div class="s-step-sub">（Word・PDF・テキストファイルに対応）</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">プロンプトと一緒に送信</div></div></div>' +
        '</div>' +
        '<div class="s-callout"><strong>Gemini の場合：</strong>GoogleドキュメントのURLを貼り付けるだけ</div>' +
        '<p style="font-size:1.4cqw;color:var(--c-text-sub);margin-top:.5cqw;">プロンプトの内容が重要なので、ツールよりも「何を書くか」を見ていてください</p>' +
      '</div>' +
    '</section>';
  }

  function slide18() {
    var prompt = 'あなたは経験豊富な日本の企業法務の専門家です。\n添付した契約書について、当社の立場から確認してください。\n\n【当社の立場】\n・受託側（Webシステム開発を請け負う中小企業）\n・相手方から提示された業務委託契約書のチェックが目的\n・条件交渉の余地はある\n\n【出力してほしい内容】\n1. 当社に不利な条項をリスクの高い順に（条項番号・理由・シナリオ）\n2. 相手方に提案すべき修正案（そのまま使える文言で）';
    return '<section class="slide" data-section="part2" data-title="実演入力：ルートA プロンプト" data-notes="プロンプトを入力して実演。今回の状況をプロンプトに書きます。テンプレートをそのまま使いつつ、立場だけカスタマイズします。会社名・金額・日付はあらかじめマスキング済みのサンプルを使っています。">' +
      H('実演入力：ルートA プロンプト') +
      '<div class="slide-content">' +
        '<div class="s-prompt-wrap">' +
          '<pre class="s-prompt-box" id="prompt-rouA">' + prompt + '</pre>' +
          '<button class="s-prompt-copy" onclick="(function(b){var t=document.getElementById(\'prompt-rouA\').textContent;navigator.clipboard.writeText(t).then(function(){b.textContent=\'✓ コピー済\';setTimeout(function(){b.textContent=\'コピー\'},1500)})})(this)">コピー</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide19() {
    return '<section class="slide" data-section="part2" data-title="AI出力例：ルートA" data-notes="※ このスライドは通信トラブル時の予備。通常はリアルタイムのAI出力を解説する。\nAIが最初に挙げた条項を見てください。損害賠償の条項が先頭に来ていますね。\'一切の損害を賠償する\'という表現は、上限がないという意味です。修正案をそのまま相手に送るのではなく、交渉のたたき台として使います。">' +
      H('AI出力例：ルートA') +
      '<div class="slide-content" style="padding-top:1.2cqw;">' +
        '<div class="s-risk-list">' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge high">リスク：高</span><span class="s-risk-title">第8条 損害賠償条項</span></div><div class="s-risk-body">「甲に生じた一切の損害を乙が賠償する」→ 上限なし<div class="s-risk-proposal">修正案：「損害賠償額は本契約の報酬総額を上限とする」</div></div></div>' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge high">リスク：高</span><span class="s-risk-title">第9条 知的財産帰属</span></div><div class="s-risk-body">開発過程のツール・ライブラリも全部委託者に帰属<div class="s-risk-proposal">修正案：「委託業務のため新規作成した成果物のみ委託者に帰属」</div></div></div>' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge mid">リスク：中</span><span class="s-risk-title">第7条 解除条件の非対称性</span></div><div class="s-risk-body">甲（委託者）のみ即時解除可。乙（受託者）の解除条件なし</div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide20() {
    return '<section class="slide" data-section="part2" data-title="AI出力の読み解き方（3つの着目点）" data-notes="知財帰属の条項（第9条）も確認してみましょう。AIがこの条項への指摘を弱めにしか出していない場合があります。重大な条項でも、AIが強調しないことはあります。これがハルシネーション対策の習慣です。">' +
      H('AI出力の読み解き方（3つの着目点）') +
      '<div class="slide-content">' +
        '<ul class="s-list">' +
          '<li class="s-list-head">着目① 最初に挙げてきた条項</li>' +
          '<li class="s-list-sub">AIがリスクの高い順で出している。先頭に注目</li>' +
          '<li class="s-list-head">着目② 修正案の内容</li>' +
          '<li class="s-list-sub">交渉のたたき台として使う（そのまま送らない）</li>' +
          '<li class="s-list-head">着目③ AIが見落としている可能性への対処</li>' +
          '<li class="s-list-sub">重大な条項でもAIが強調しないことがある</li>' +
          '<li class="s-list-sub">指摘された条番号は必ず元の文書で照合する</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide21() {
    return '<section class="slide slide-impact" data-section="part2" data-title="道具を使いこなすのに、完璧な知識はいらない" data-notes="PART02とPART03の橋渡し。どうでしたか。難しかったですか？実際にやってみると、ツールより何を書くかの方がずっと大事だと分かります。次は、別のツールで別の書類を試してみましょう。">' +
      '<div class="slide-content slide-content-center">' +
        '<div class="s-impact-tag">KEY INSIGHT</div>' +
        '<p class="s-impact-main">道具を使いこなすのに、<br>完璧な知識はいらない。</p>' +
      '</div>' +
    '</section>';
  }

  /* --- PART 03: 実演② Gemini (slides 22–29) --- */

  function slide22() {
    return '<section class="slide slide-section" data-section="part3" data-title="実演② FC加盟契約書チェック" data-notes="もう1つの実演をお見せします。今度はGeminiを使います。">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 03</div>' +
        '<h1 class="s-section-title">実演② FC加盟契約書チェック</h1>' +
        '<p class="s-section-lead">Gemini を使ってフランチャイズ契約を多角的にチェックします</p>' +
      '</div>' +
    '</section>';
  }

  function slide23() {
    return '<section class="slide" data-section="part3" data-title="実演② オリエンテーション" data-notes="今日はキッチンカーでから揚げを販売するフランチャイズへの加盟を例に、AIを使った契約書の多角的なチェックをお見せします。今日の数字をそのまま覚えようとする必要はありません。ご自身の業界に置き換えながら聞いていただくと、より実感が持てると思います。">' +
      H('実演② オリエンテーション') +
      '<div class="slide-content">' +
        '<div class="s-callout"><strong>題材：</strong>キッチンカーから揚げFC「カラアゲーニョ」への加盟検討 ｜ ツール：Google Gemini</div>' +
        '<div class="s-steps">' +
          '<div class="s-step-row"><div class="s-step-num">1</div><div class="s-step-text">FC契約書の総合リスクチェック</div></div>' +
          '<div class="s-step-row"><div class="s-step-num">2</div><div class="s-step-text">費用の全体像と収支の妥当性検証</div></div>' +
          '<div class="s-step-row"><div class="s-step-num">3</div><div class="s-step-text">FC本部の信用度・実態確認の方法</div></div>' +
          '<div class="s-step-row"><div class="s-step-num">4</div><div class="s-step-text">Gemを使った日常的な活用方法</div></div>' +
        '</div>' +
        '<p style="font-size:1.3cqw;color:var(--c-text-sub);">数値（ロイヤルティ率・期間等）は業界・状況によって変わります。ご自身の業界に置き換えながらご覧ください</p>' +
      '</div>' +
    '</section>';
  }

  function slide24() {
    return '<section class="slide" data-section="part3" data-title="Gemini：書類の渡し方" data-notes="今日のサンプルはGoogleドキュメントに入れてあります。チャット欄にURLを貼り付けると、Geminiが自動的に文書を読み込みます。これだけです。">' +
      H('Gemini：書類の渡し方') +
      '<div class="slide-content">' +
        '<div class="s-steps">' +
          '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">gemini.google.com を開く</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">チャット欄にGoogleドキュメントのURLを貼り付け</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">プロンプトと一緒に送信 → Geminiが自動的に文書を読み込む</div></div></div>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:.8cqw;">' +
          '<li class="s-list-arrow">PDFの場合：添付ファイルとしてアップロード</li>' +
          '<li class="s-list-arrow">テキストの直接貼り付けでも同様に動作</li>' +
          '<li class="s-list-callout">GoogleドキュメントのURL方式：長い文書もコピペの手間なくまるごと渡せる</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide25() {
    var prompt = 'あなたは日本のフランチャイズ契約に精通した法務専門家です。\nFC加盟契約書について、加盟検討中の個人事業主の立場から確認してください。\n\n1. 加盟者に著しく不利な条項をリスクの大きい順に5つ\n   （条項番号・内容・シナリオを添えて）\n2. 業界標準と比較して「異常」と感じる条件があれば\n3. 中小小売商業振興法の法定開示書面チェック\n4. 締結前に確認・交渉を試みるべきことを優先度順に';
    return '<section class="slide" data-section="part3" data-title="Step 1：FC契約書 総合リスクチェック（プロンプト）" data-notes="プロンプトを入力して実演。">' +
      H('Step 1：FC契約書 総合リスクチェック（プロンプト）') +
      '<div class="slide-content">' +
        '<div class="s-prompt-wrap">' +
          '<pre class="s-prompt-box" id="prompt-fc1">' + prompt + '</pre>' +
          '<button class="s-prompt-copy" onclick="(function(b){var t=document.getElementById(\'prompt-fc1\').textContent;navigator.clipboard.writeText(t).then(function(){b.textContent=\'✓ コピー済\';setTimeout(function(){b.textContent=\'コピー\'},1500)})})(this)">コピー</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide26() {
    return '<section class="slide" data-section="part3" data-title="AI出力例：Step 1 リスクチェック" data-notes="※ このスライドは通信トラブル時の予備。\nロイヤルティが10%という数字が出てきていますね。業界平均は3〜7%とされているので、これは高い水準です。テリトリーの項目を見てください。参考区域となっています。これは、同じエリアに別の加盟者が入る可能性を本部が否定していない、ということです。">' +
      H('AI出力例：Step 1 リスクチェック') +
      '<div class="slide-content" style="padding-top:1.2cqw;">' +
        '<div class="s-risk-list">' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge high">リスク：高 ★業界標準外</span><span class="s-risk-title">第4条 ロイヤルティ 10%</span></div><div class="s-risk-body">飲食FC業界平均は3〜7%。月売上100万円でロイヤルティ＋広告分担金が毎月12万円流出</div></div>' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge high">リスク：高 ★要交渉</span><span class="s-risk-title">第6条 テリトリー「参考区域」表記</span></div><div class="s-risk-body">独占性が保証されていない → 同エリアに別加盟者が入る可能性あり</div></div>' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge high">リスク：高</span><span class="s-risk-title">第11条 解除条件の非対称性</span></div><div class="s-risk-body">本部：30日前通知で解除可 ／ 加盟者：6ヶ月前通知が必要</div></div>' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge info">要確認</span><span class="s-risk-title">法定開示書面（締結20日前の交付義務）→ 本部に確認を</span></div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide27() {
    return '<section class="slide" data-section="part3" data-title="AI出力例：Step 2 費用・収支検証" data-notes="※ このスライドは通信トラブル時の予備。\n明示されている費用と、別途定めるとして金額が見えない費用が分かれて出てきていますね。契約書の加盟金300万円だけを見ていると、実際のスタートコストが全く見えない構造になっています。">' +
      H('AI出力例：Step 2 費用・収支検証') +
      '<div class="slide-content" style="padding-top:1.2cqw;">' +
        '<div class="s-risk-list">' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge high">要注意</span><span class="s-risk-title">費用の全体像（明示 vs「別途定める」）</span></div><div class="s-risk-body"><strong>明示：</strong>加盟金300万円＋研修費60万円＋設備費<br><strong>不明：</strong>キッチンカー車両費・調理器具・開業販促費・年次更新料<div class="s-risk-proposal">合計：最低でも700万円〜、設備費次第で1,000万円超の可能性</div></div></div>' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge mid">試算</span><span class="s-risk-title">月次固定費：ロイヤルティ10%＋広告分担金2%＝売上の12%が本部へ</span></div><div class="s-risk-body">損益分岐点の目安：月次売上 <strong>60〜80万円</strong>（固定費15〜20万円を仮定）</div></div>' +
          '<div class="s-risk-item"><div class="s-risk-header"><span class="s-risk-badge mid">試算</span><span class="s-risk-title">初期投資700万円の回収期間</span></div><div class="s-risk-body">月次純利益10万円 → 約70ヶ月（5年10ヶ月） ／ 20万円 → 約35ヶ月（2年11ヶ月）</div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide28() {
    return '<section class="slide" data-section="part3" data-title="Step 3：FC本部の信用度・実態確認の方法" data-notes="法人番号・登記情報の確認、国税庁の法人情報、日本フランチャイズ協会への登録有無、こういった具体的な確認先が出てきていますね。これらは無料でできます。FC本部に直接確認すべき質問として現在の加盟店数と過去2年間の解約・退会数は特に重要です。">' +
      H('Step 3：FC本部の信用度・実態確認の方法') +
      '<div class="slide-content">' +
        '<div class="s-routes">' +
          '<div class="s-route-card">' +
            '<div class="s-route-label">無料でできる</div>' +
            '<div class="s-route-title">自分で調べる</div>' +
            '<ul class="s-card-items">' +
              '<li>法人番号・登記情報（法務局・国税庁）</li>' +
              '<li>日本フランチャイズ協会への登録有無</li>' +
              '<li>公正取引委員会の相談・苦情事例検索</li>' +
            '</ul>' +
          '</div>' +
          '<div class="s-route-card">' +
            '<div class="s-route-label">本部に直接確認</div>' +
            '<div class="s-route-title">必ず聞くこと</div>' +
            '<ul class="s-card-items">' +
              '<li>現在の加盟店数と<br><strong>過去2年の解約・退会数</strong></li>' +
              '<li>既存加盟者との面談の可否</li>' +
            '</ul>' +
          '</div>' +
          '<div class="s-route-card danger">' +
            '<div class="s-route-label">⚠ 危険サイン</div>' +
            '<div class="s-route-title">これが出たら撤退検討</div>' +
            '<ul class="s-card-items danger">' +
              '<li>数字を見せない</li>' +
              '<li>既存オーナーとの面談を避ける</li>' +
              '<li>契約を急かす</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide29() {
    return '<section class="slide" data-section="part3" data-title="Step 4：Gemで日常的に使えるエージェントを作る" data-notes="GeminiにはGemという機能があります。今日やったFC契約チェックの流れを、一度Gemとして設定しておけば、次からはGemを開いて書類を貼るだけで同じ分析が自動的に動きます。">' +
      H('Step 4：Gemで日常的に使えるエージェントを作る') +
      '<div class="slide-content">' +
        '<div class="s-callout"><strong>Gem とは：</strong>特定の目的に特化したAIエージェントを自分で作れる機能</div>' +
        '<div class="s-steps" style="margin-top:.8cqw;">' +
          '<div class="s-step-row"><div class="s-step-num">①</div><div class="s-step-text">Geminiサイドメニュー「Gemを作成」</div></div>' +
          '<div class="s-step-row"><div class="s-step-num">②</div><div class="s-step-text">名前を入力：FC加盟審査アシスタント</div></div>' +
          '<div class="s-step-row"><div class="s-step-num">③</div><div class="s-step-text">カスタムインストラクションを貼り付けて保存</div></div>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:.8cqw;">' +
          '<li class="s-list-callout">使い方：Gemを開く → GoogleドキュメントのURLを貼るだけ → 5ステップの審査が自動で動く</li>' +
          '<li class="s-list-arrow">一度作れば繰り返し使える。業務委託用・利用規約用も作成可能</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  /* --- PART 04: Q&A ＋ まとめ (slides 30–40) --- */

  function slide30() {
    return '<section class="slide slide-section" data-section="part4" data-title="Q&A ＋ まとめ" data-notes="ここからは質問の時間です。今日やったことへの疑問でも、日頃感じていたことでも何でも。">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 04</div>' +
        '<h1 class="s-section-title">Q&amp;A ＋ まとめ</h1>' +
      '</div>' +
    '</section>';
  }

  function slide31() {
    return '<section class="slide" data-section="part4" data-title="Q：AIが間違えたらどうするんですか？" data-notes="よくある質問①。これが一番多い質問です。結論から言うと、AIは間違えます。前提として、そういうものだと思って使ってください。">' +
      H('Q：AIが間違えたらどうするんですか？') +
      '<div class="slide-content">' +
        '<div class="s-callout">' +
          '<strong>A：間違えます。だから「元の文書で確認」が必須。</strong>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:1cqw;">' +
          '<li class="s-list-arrow">AIに探させる → 人間が確認する、の2段階で使う</li>' +
          '<li class="s-list-arrow">「第5条に書いてある」と言われたら、実際に第5条を開く</li>' +
          '<li class="s-list-arrow">AIを信頼するのではなく、AIを道具として使う感覚</li>' +
          '<li class="s-list-callout">ハルシネーションが怖い → だから今日ルール②を先に教えました</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide32() {
    return '<section class="slide" data-section="part4" data-title="Q：ChatGPTとClaudeどっちがいいですか？" data-notes="よくある質問②。">' +
      H('Q：ChatGPTとClaudeどっちがいいですか？') +
      '<div class="slide-content">' +
        '<div class="s-callout">' +
          '<strong>A：どちらでも十分。長い文書はClaudeが安定している印象。</strong>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:1cqw;">' +
          '<li class="s-list-arrow">ChatGPT（OpenAI）/ Claude（Anthropic）/ Gemini（Google）— どれも同等に使える</li>' +
          '<li class="s-list-arrow">長い契約書・PDFの読み込みはClaudeが安定している</li>' +
          '<li class="s-list-arrow">Googleドキュメントで管理している場合はGeminiが連携しやすい</li>' +
          '<li class="s-list-callout">有料版を1つ持つのがおすすめ。月2,000〜3,000円で業務上のストレスがほぼなくなる</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide33() {
    return '<section class="slide" data-section="part4" data-title="Q：無料版でもできますか？" data-notes="よくある質問③。">' +
      H('Q：無料版でもできますか？') +
      '<div class="slide-content">' +
        '<div class="s-callout">' +
          '<strong>A：できます。ただし制限があります。</strong>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:1cqw;">' +
          '<li class="s-list-arrow">1回あたりのトークン上限が低い → 長い契約書は途中で打ち切られることがある</li>' +
          '<li class="s-list-arrow">1日の利用回数制限がある → 業務中に使えなくなる</li>' +
          '<li class="s-list-arrow">ファイルのアップロード非対応のプランもある</li>' +
          '<li class="s-list-callout">まず無料で試す → 実務で使えそうなら有料版へ、の順番がおすすめ</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide34() {
    return '<section class="slide" data-section="part4" data-title="Q：毎回プロンプトを一から書くんですか？" data-notes="よくある質問④。">' +
      H('Q：毎回プロンプトを一から書くんですか？') +
      '<div class="slide-content">' +
        '<div class="s-callout">' +
          '<strong>A：書きません。テンプレートをコピーして「立場」だけ変える。</strong>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:1cqw;">' +
          '<li class="s-list-arrow">今日お渡しするプロンプトテンプレートをそのまま使う</li>' +
          '<li class="s-list-arrow">変えるのは「当社の立場」の部分だけ → 慣れれば1〜2分</li>' +
          '<li class="s-list-arrow">Gemのカスタムインストラクションにテンプレートをセットしておくと次からゼロ入力</li>' +
          '<li class="s-list-callout">「毎回ゼロから書く」は続かない。テンプレートが習慣化のカギ</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide35() {
    return '<section class="slide" data-section="part4" data-title="Q：弁護士費用は削れますか？" data-notes="よくある質問⑤。これは正直に答えます。">' +
      H('Q：弁護士費用は削れますか？') +
      '<div class="slide-content">' +
        '<div class="s-callout">' +
          '<strong>A：AIで削れるのは「相談するかどうかを判断するまでのコスト」。</strong>' +
        '</div>' +
        '<ul class="s-list" style="margin-top:1cqw;">' +
          '<li class="s-list-arrow">実際に問題が発生すれば弁護士は必要。AIで代替はできない</li>' +
          '<li class="s-list-arrow">「この条項は弁護士に確認すべきか？」を自分で判断できるようになる</li>' +
          '<li class="s-list-arrow">相談するとき、内容が具体的になる → 相談時間が短縮 → コスト削減</li>' +
          '<li class="s-list-callout">「弁護士不要」ではなく「無駄な相談ゼロ」が正確な表現</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide36() {
    return '<section class="slide" data-section="part4" data-title="今日のポイント 3つ" data-notes="質問ありがとうございました。残り少ないので、今日やったことを1分で整理します。">' +
      H('今日のポイント 3つ') +
      '<div class="slide-content">' +
        '<div class="s-steps">' +
          '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>チェックする書類は3種類</strong></div><div class="s-step-sub">契約書 ／ 利用規約 ／ 自社のプライバシーポリシー</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>AIを使う前のルールは2つ</strong></div><div class="s-step-sub">マスキング ／ 鵜呑み禁止（元の文書で確認）</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>AIは一次フィルター</strong></div><div class="s-step-sub">判断は人間がやる。必要なら専門家へ</div></div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function slide37() {
    return '<section class="slide" data-section="part4" data-title="今日からできること・次のステップ" data-notes="今日から1つだけやってみてください。手元にある書類、何でもいいです。昨日受け取った業務委託でも、今使っているSaaSの規約でも。今日覚えたプロンプトをそのまま使って、1回やってみる。たぶん30分もかからない。それだけでこのセミナーの元が取れます。">' +
      H('今日からできること・次のステップ') +
      '<div class="slide-content">' +
        '<ul class="s-list">' +
          '<li class="s-list-head">【今日から】手元にある書類を1つ、今日のプロンプトで試す</li>' +
          '<li class="s-list-sub">30分もかからない。これだけでセミナーの元が取れる</li>' +
          '<li class="s-list-head">【次のステップ①】業種別プロンプトの最適化</li>' +
          '<li class="s-list-sub">自分の業種・よく使う書類に合わせてカスタマイズ</li>' +
          '<li class="s-list-sub">次回セミナー「業種別AI活用」で扱います</li>' +
          '<li class="s-list-head">【次のステップ②】法務AIツールの本格導入（LegalForce・Holmesなど）</li>' +
          '<li class="s-list-sub">まず今日のレベルで習慣化してから検討する順番がおすすめ</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide38() {
    return '<section class="slide slide-impact" data-section="part4" data-title="今日、1通だけ試してみて。" data-notes="最後にもう1枚。難しく考えなくていいです。今日持ち帰ったプロンプトを開いて、手元にある書類を貼り付けるだけ。それだけです。">' +
      '<div class="slide-content slide-content-center">' +
        '<div class="s-impact-tag">ACTION</div>' +
        '<p class="s-impact-main">今日、1通だけ<br>試してみて。</p>' +
      '</div>' +
    '</section>';
  }

  function slide39() {
    return '<section class="slide" data-section="part4" data-title="個別支援のご案内" data-notes="最後に1点だけ。自社の書類に当てはめてもっと深くやりたい、社内に展開したい、AI導入全体の相談がしたい、という場合は、個別の支援メニューがあります。まず一度、無料の個別相談を使ってみてください。">' +
      H('個別支援のご案内') +
      '<div class="slide-content">' +
        '<ul class="s-list">' +
          '<li>「自社の書類に当てはめてもっと深くやりたい」</li>' +
          '<li>「社内に展開したい」</li>' +
          '<li>「AI導入全体の相談がしたい」</li>' +
        '</ul>' +
        '<div class="s-callout" style="margin-top:1cqw;"><strong>まず無料の個別相談をご活用ください</strong><br>岡山県よろず支援拠点：086-206-2180</div>' +
        '<p style="font-size:1.3cqw;color:var(--c-text-sub);margin-top:.8cqw;">今日のセミナーを受けた方は、今日の内容を前提に話ができるので最初から話を作り直す手間がなく、早く本題に入れます</p>' +
      '</div>' +
    '</section>';
  }

  function slide40() {
    return '<section class="slide slide-ending" data-section="part4" data-title="今日から1通、試してみてください。" data-notes="エンディングスライド。今日はここまでです。ありがとうございました。">' +
      '<div class="slide-content slide-content-center">' +
        '<h1 class="s-ending-main">今日から1通、<br>試してみてください。</h1>' +
        '<div class="s-ending-bar"></div>' +
        '<p class="s-ending-sub">プロンプトテンプレートをお持ち帰りいただきます。<br>ありがとうございました。</p>' +
      '</div>' +
    '</section>';
  }

  /* ===================== EXPORTS ===================== */

  window.slideFactories = [
    slide01, slide02, slide03, slide04, slide05, slide06, slide07, slide08,
    slide09, slide10, slide11, slide12, slide13, slide14, slide15, slide16,
    slide17, slide18, slide19, slide20, slide21, slide22, slide23, slide24,
    slide25, slide26, slide27, slide28, slide29, slide30, slide31, slide32,
    slide33, slide34, slide35, slide36, slide37, slide38, slide39, slide40
  ];

  window.agendaItems = [
    { id: 'cover', label: '導入' },
    { id: 'part1', label: '01 座学' },
    { id: 'part2', label: '02 実演①' },
    { id: 'part3', label: '03 実演②' },
    { id: 'part4', label: '04 Q&A' }
  ];

})();
