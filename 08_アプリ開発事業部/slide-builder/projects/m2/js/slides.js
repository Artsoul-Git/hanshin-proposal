(function () {

  function H(title) {
    return '<header class="slide-header"><h2 class="slide-h2">' + title + '</h2></header>';
  }

  function fullImg(src, alt) {
    return '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f8f8f8;">' +
      '<img src="img/' + src + '" style="max-width:100%;max-height:100%;object-fit:contain;" alt="' + alt + '">' +
    '</div>';
  }

  /* ===================== SLIDES ===================== */

  /* ---- COVER ---- */

  function slide01() {
    return '<section class="slide slide-cover" data-section="cover" data-title="もらったプロンプトを使い倒そう！" data-notes="本日はよろしくお願いします。今日はプロンプトを怖がらず、実際に使ってみる体験をしていただきます。">' +
      '<div class="slide-cover-bar">' +
        '<div class="slide-cover-tag">有限会社アートソウル AI導入支援事業</div>' +
        '<h1 class="slide-cover-title">もらったプロンプトを<br>使い倒そう！</h1>' +
      '</div>' +
      '<div class="slide-cover-body">' +
        '<p class="slide-cover-sub">〜今日からできるAI活用第一歩〜</p>' +
        '<div class="slide-cover-meta">ひとやね × AIふらっとラボ</div>' +
      '</div>' +
    '</section>';
  }

  /* ---- INTRO ---- */

  function slide02() {
    return '<section class="slide" data-section="intro" data-title="まず確認！" data-notes="3択で挙手してもらいましょう。&#39;よく使っている&#39;方、&#39;登録はしたけど&#39;という方、&#39;まだ触ったことがない&#39;方でそれぞれ挙手をお願いします。">' +
      fullImg('slide-02.jpg', 'ChatGPTやGeminiって使ってますか？') +
    '</section>';
  }

  function slide03() {
    return '<section class="slide" data-section="intro" data-title="宝の持ち腐れ問題" data-notes="&#39;あるある&#39;として共感を取りに行きます。手を挙げてもらっても良いです。">' +
      fullImg('slide-03.jpg', '宝の持ち腐れになっていませんか？') +
    '</section>';
  }

  /* ---- PART 01: プロンプトって何？ ---- */

  function slide04() {
    return '<section class="slide slide-section" data-section="part1" data-title="PART 01 プロンプトって何？" data-notes="">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 01</div>' +
        '<h1 class="s-section-title">プロンプトって何？</h1>' +
        '<p class="s-section-lead">難しく考えなくて大丈夫</p>' +
      '</div>' +
    '</section>';
  }

  function slide05() {
    return '<section class="slide slide-impact" data-section="part1" data-title="プロンプト＝お願いのお手紙" data-notes="このイメージ転換が今日一番重要です。呪文でも暗号でも命令でもない。ただのお願いのお手紙。">' +
      '<div class="slide-content slide-content-center">' +
        '<div class="s-impact-tag">KEY CONCEPT</div>' +
        '<p class="s-impact-main">プロンプトは<br>ただの「お願いのお手紙」</p>' +
      '</div>' +
    '</section>';
  }

  function slide06() {
    return '<section class="slide" data-section="part1" data-title="Before→Afterで見てみよう" data-notes="左が&#39;呪文&#39;のイメージ、右が&#39;お手紙&#39;のイメージ。GPT/Geminiはお手紙を読んでくれる親切なアシスタントです。">' +
      fullImg('slide-04.jpg', 'プロンプト＝AIへのお手紙') +
    '</section>';
  }

  function slide07() {
    return '<section class="slide" data-section="part1" data-title="必要なスキルはコピペだけ" data-notes="これだけ！と断言して安心感を与えます。笑いを取りに行っても良いです。">' +
      fullImg('slide-05.jpg', '必要なスキルはコピペだけ') +
    '</section>';
  }

  /* ---- PART 02: マインドセットを変えよう ---- */

  function slide08() {
    return '<section class="slide slide-section" data-section="part2" data-title="PART 02 マインドセットを変えよう" data-notes="">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 02</div>' +
        '<h1 class="s-section-title">マインドセットを<br>変えよう</h1>' +
        '<p class="s-section-lead">パソコン操作の「常識」を今日から捨てる</p>' +
      '</div>' +
    '</section>';
  }

  function slide09() {
    return '<section class="slide" data-section="part2" data-title="昔のコンピュータ vs 今のAI" data-notes="AIはエラーで怒らない、失敗してもすぐやり直せる、というメッセージを伝えます。">' +
      fullImg('slide-06.jpg', '昔のコンピュータ vs 今のAI') +
    '</section>';
  }

  function slide10() {
    return '<section class="slide" data-section="part2" data-title="呪文思考→対話思考へ" data-notes="AI＝自動販売機ではなく、隣の席の優しい同僚というイメージに変えてもらいます。">' +
      fullImg('slide-08.jpg', '呪文思考から対話思考へ') +
    '</section>';
  }

  function slide11() {
    return '<section class="slide" data-section="part2" data-title="AIとの新しい距離感" data-notes="今日はStep 2からStep 3を体験してもらいます。">' +
      fullImg('slide-09.jpg', 'AIとの新しい距離感') +
    '</section>';
  }

  /* ---- PART 03: 迷ったらどうする？ ---- */

  function slide12() {
    return '<section class="slide slide-section" data-section="part3" data-title="PART 03 迷ったらどうする？" data-notes="">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 03</div>' +
        '<h1 class="s-section-title">迷ったら<br>どうする？</h1>' +
        '<p class="s-section-lead">Feedback Loopを活用しよう</p>' +
      '</div>' +
    '</section>';
  }

  function slide13() {
    return '<section class="slide" data-section="part3" data-title="迷ったらAI自身に聞く" data-notes="&#39;これは○○を入力してね、という意味ですか？&#39;と聞くだけでOKです。AIが一緒にやってみましょうかと提案してくれます。">' +
      fullImg('slide-07.jpg', '迷ったら、AI自身に聞いてみよう！') +
    '</section>';
  }

  /* ---- PART 04: さあ、やってみよう！ ---- */

  function slide14() {
    return '<section class="slide slide-section" data-section="work" data-title="PART 04 さあ、やってみよう！" data-notes="">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 04</div>' +
        '<h1 class="s-section-title">さあ、<br>やってみよう！</h1>' +
        '<p class="s-section-lead">今日のワーク</p>' +
      '</div>' +
    '</section>';
  }

  function slide15() {
    return '<section class="slide" data-section="work" data-title="今日のワーク" data-notes="細かい説明はしません。触りながら慣れていきましょう！と伝えてワークに入ります。">' +
      fullImg('slide-10.jpg', '今回のワークはコピペとおしゃべりだけ！') +
    '</section>';
  }

  function slide16() {
    return '<section class="slide slide-impact" data-section="work" data-title="さあ、AIとおしゃべりしよう！" data-notes="PCを開いて一緒にスタートします。">' +
      '<div class="slide-content slide-content-center">' +
        '<div class="s-impact-tag">LET&#39;S GO</div>' +
        '<p class="s-impact-main">百聞は一見に如かず。<br>さあ、AIとおしゃべり<br>してみましょう！</p>' +
      '</div>' +
    '</section>';
  }

  function slide17() {
    return '<section class="slide" data-section="work" data-title="PCを開いてチャレンジ！" data-notes="">' +
      fullImg('slide-11.jpg', 'PCを開いて、一緒にチャレンジしてみましょう！') +
    '</section>';
  }

  /* ===================== REGISTER ===================== */

  window.SLIDES = [
    slide01, slide02, slide03,
    slide04, slide05, slide06, slide07,
    slide08, slide09, slide10, slide11,
    slide12, slide13,
    slide14, slide15, slide16, slide17
  ];

})();
