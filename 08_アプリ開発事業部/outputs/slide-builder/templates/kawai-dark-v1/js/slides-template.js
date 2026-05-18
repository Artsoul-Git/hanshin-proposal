(function () {

  function H(title) {
    return '<header class="slide-header"><h2 class="slide-h2">' + title + '</h2></header>';
  }

  /* ===================== SLIDES ===================== */

  /* プロジェクト識別子 — localStorage の名前空間として使用 */
  window.SLIDE_SLUG = 'SLUG_PLACEHOLDER'; /* new-seminar.py が自動置換 */

  /*
   * スライドタイプ一覧:
   *
   *   slide-cover   : タイトルスライド（冒頭専用）
   *   slide-impact  : インパクト一言スライド
   *   slide-section : セクション区切り（PART XX）
   *   slide-metric  : 数字を大きく見せるスライド
   *   slide-quote   : 引用・格言スライド
   *   (なし)        : 標準スライド（H() + .slide-content）
   *
   * data属性:
   *   data-section  : セクションID（サイドバーのグループ化に使用）
   *   data-title    : スライドタイトル（サイドバー表示）
   *   data-notes    : トークスクリプト（プレゼンター画面に表示）
   *
   * コンテンツコンポーネント:
   *   .s-list > .s-list-callout / .s-list-arrow / .s-list-head / .s-list-sub
   *   .s-steps > .s-step-row > .s-step-num + .s-step-text
   *   .s-risk-list > .s-risk-item > .s-risk-header + .s-risk-body
   *   .s-risk-badge high / medium / low
   *   .s-compare > .s-compare-col positive / neutral / negative
   *   .s-metric-lead / .s-metric-value / .s-metric-desc / .s-metric-source
   *   .s-impact-main / .s-impact-tag
   *   .s-quote
   *   .s-2col > .s-2col-left + .s-2col-right
   *   .slide-content-center  : 縦横中央寄せ
   */

  /* --- COVER --- */

  function slide01() {
    return '<section class="slide slide-cover" data-section="cover" data-title="【タイトル】" data-notes="開始前のトークスクリプト。">' +
      '<div class="slide-cover-bar">' +
        '<div class="slide-cover-tag">有限会社アートソウル AI導入支援事業</div>' +
        '<h1 class="slide-cover-title">【セミナータイトル】</h1>' +
      '</div>' +
      '<div class="slide-cover-body">' +
        '<p class="slide-cover-sub">【サブタイトル・キャッチコピー】</p>' +
        '<div class="slide-cover-meta">YYYY.MM ｜ 【開催情報】</div>' +
      '</div>' +
    '</section>';
  }

  function slide02() {
    return '<section class="slide slide-impact" data-section="cover" data-title="【インパクトメッセージ】" data-notes="トークスクリプト">' +
      '<div class="slide-content slide-content-center">' +
        '<div class="s-impact-tag">TODAY</div>' +
        '<p class="s-impact-main">【インパクトになる一文。<br>改行で強調する。】</p>' +
      '</div>' +
    '</section>';
  }

  function slide03() {
    return '<section class="slide" data-section="cover" data-title="今日のゴール" data-notes="トークスクリプト">' +
      H('今日のゴール') +
      '<div class="slide-content">' +
        '<ul class="s-list">' +
          '<li class="s-list-callout">【最重要メッセージ（1行）】</li>' +
          '<li class="s-list-arrow">【補足1】</li>' +
          '<li class="s-list-arrow">【補足2】</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  function slide04() {
    return '<section class="slide" data-section="cover" data-title="本日の流れ" data-notes="トークスクリプト">' +
      H('本日の流れ') +
      '<div class="slide-content">' +
        '<div class="s-steps">' +
          '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">【ステップ1】</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">【ステップ2】</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">【ステップ3】</div></div></div>' +
          '<div class="s-step-row"><div class="s-step-num">④</div><div><div class="s-step-text">【Q&amp;A・まとめ】</div></div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  /* --- PART 01 --- */

  function slide05() {
    return '<section class="slide slide-section" data-section="part1" data-title="【パート名】" data-notes="">' +
      '<div class="slide-content">' +
        '<div class="s-section-accent-bar"></div>' +
        '<div class="s-section-chapter">PART 01</div>' +
        '<h1 class="s-section-title">【パートタイトル】</h1>' +
        '<p class="s-section-lead">【サブタイトル】</p>' +
      '</div>' +
    '</section>';
  }

  /* 以下、必要なスライドを追加 */

  /* ===================== REGISTER ===================== */

  var slides = [
    slide01, slide02, slide03, slide04, slide05
    /* ここにスライド関数を追加 */
  ];

  window.slideFactories = slides;

})();
