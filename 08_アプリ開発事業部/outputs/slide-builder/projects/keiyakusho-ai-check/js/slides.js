(function () {

  function H(title) {
    return '<header class="slide-header"><h2 class="slide-h2">' + title + '</h2></header>';
  }

  /* ===================== SLIDES ===================== */
  /* テンプレート: kawai-dark-v1                           */
  /* タイトル: 契約書AIチェックセミナー                                  */
  /* TODO: 以下にスライド関数を追加してください          */

  function slide01() {
    return '<section class="slide slide-cover" data-section="cover" data-title="契約書AIチェックセミナー" data-notes="">' +
      '<div class="slide-cover-bar">' +
        '<div class="slide-cover-tag">有限会社アートソウル AI導入支援事業</div>' +
        '<h1 class="slide-cover-title">契約書AIチェックセミナー</h1>' +
      '</div>' +
      '<div class="slide-cover-body">' +
        '<p class="slide-cover-sub">サブタイトルをここに</p>' +
      '</div>' +
    '</section>';
  }

  /* ===================== REGISTER ===================== */

  window.slideFactories = [slide01];

})();
