(function () {
  var factories = window.slideFactories || [];
  var agenda    = window.agendaItems   || [];
  var totalSlides = factories.length;
  var rendered  = new Set();
  var current   = 0;
  var scriptLocked = false;
  var scriptHideTimer = null;

  var stage    = document.querySelector('.slide-stage');
  var nav      = document.querySelector('.section-nav');
  var sidebar  = document.querySelector('.sidebar');
  var backdrop = document.querySelector('.sidebar-backdrop');
  var sideList = document.querySelector('.sidebar-list');
  var toggleBtn= document.querySelector('.sidebar-toggle');
  var scriptPanel  = document.querySelector('.script-panel');
  var scriptTrigger= document.querySelector('.script-trigger');
  var scriptText   = document.querySelector('.script-text');
  var overlay     = document.querySelector('.export-overlay');
  var fillBar     = document.querySelector('.export-progress-fill');
  var pdfBtn      = document.querySelector('.export-pdf');
  var pptxBtn     = document.querySelector('.export-pptx');
  var zoomInBtn   = document.querySelector('.zoom-in');
  var zoomOutBtn  = document.querySelector('.zoom-out');
  var zoomResetBtn= document.querySelector('.zoom-reset');
  var zoomDisplay = document.getElementById('zoom-display');

  /* ---------- Render ---------- */
  function ensureRendered(index) {
    if (rendered.has(index) || index < 0 || index >= totalSlides) return;
    var html = factories[index]();
    var frag = document.createRange().createContextualFragment(html);
    var sec  = frag.querySelector('.slide');
    if (sec) sec.dataset.index = index;
    stage.appendChild(frag);
    rendered.add(index);
  }

  function getSlide(index) {
    return stage.querySelector('.slide[data-index="' + index + '"]');
  }

  /* ---------- Navigate ---------- */
  function goTo(index) {
    if (index < 0 || index >= totalSlides) return;
    ensureRendered(index);
    ensureRendered(index + 1);
    var prev = getSlide(current);
    if (prev) prev.classList.remove('active');
    current = index;
    var next = getSlide(current);
    if (next) next.classList.add('active');
    updateHash();
    updateSectionNav();
    updateSidebar();
    updateScriptPanel();
  }

  function updateHash() {
    history.replaceState(null, '', '#' + (current + 1));
  }

  function parseHash() {
    var h = location.hash.replace('#', '');
    var n = parseInt(h, 10);
    return (!isNaN(n) && n >= 1 && n <= totalSlides) ? n - 1 : 0;
  }

  /* ---------- Section Nav ---------- */
  function buildSectionNav() {
    agenda.forEach(function (item) {
      var el = document.createElement('span');
      el.className = 'section-nav-item';
      el.dataset.section = item.id;
      el.textContent = item.label;
      el.addEventListener('click', function () {
        for (var i = 0; i < totalSlides; i++) {
          ensureRendered(i);
          var s = getSlide(i);
          if (s && s.dataset.section === item.id) { goTo(i); return; }
        }
      });
      nav.appendChild(el);
    });
  }

  function updateSectionNav() {
    var slide = getSlide(current);
    var sec   = slide ? slide.dataset.section : '';
    var isDark = slide ? slide.classList.contains('slide-section') ||
                         slide.classList.contains('slide-impact') ||
                         slide.classList.contains('slide-metric') ||
                         slide.classList.contains('slide-ending') : false;
    nav.classList.toggle('on-dark', isDark);
    nav.querySelectorAll('.section-nav-item').forEach(function (el) {
      el.classList.toggle('current', el.dataset.section === sec);
    });
  }

  /* ---------- Sidebar ---------- */
  function buildSidebar() {
    factories.forEach(function (fn, i) {
      var el = document.createElement('div');
      el.className = 'sidebar-item';
      el.dataset.index = i;
      var num  = document.createElement('span');
      num.className = 'sidebar-item-num';
      num.textContent = String(i + 1).padStart(2, '0');
      var label = document.createElement('span');
      label.textContent = getTitleFromFactory(fn, i);
      el.appendChild(num);
      el.appendChild(label);
      el.addEventListener('click', function () { goTo(i); closeSidebar(); });
      sideList.appendChild(el);
    });
  }

  function getTitleFromFactory(fn, i) {
    try {
      var html = fn();
      var m = html.match(/data-title="([^"]+)"/);
      if (m) return m[1];
      var m2 = html.match(/class="slide-h2[^"]*">([^<]+)</);
      if (m2) return m2[1];
      var m3 = html.match(/class="s-section-title[^"]*">([^<]+)</);
      if (m3) return m3[1];
      var m4 = html.match(/class="slide-cover-title[^"]*">([^<]+)</);
      if (m4) return m4[1];
    } catch (e) {}
    return 'スライド ' + (i + 1);
  }

  function updateSidebar() {
    sideList.querySelectorAll('.sidebar-item').forEach(function (el) {
      el.classList.toggle('current', parseInt(el.dataset.index, 10) === current);
    });
  }

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('open');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
  }

  /* ---------- Script Panel ---------- */
  function updateScriptPanel() {
    var slide = getSlide(current);
    var notes = slide ? (slide.dataset.notes || '') : '';
    if (scriptText) scriptText.textContent = notes;
  }

  function openScriptPanel() {
    if (scriptPanel) scriptPanel.classList.add('open');
  }

  function hideScriptPanel() {
    if (!scriptLocked && scriptPanel) scriptPanel.classList.remove('open');
  }

  function toggleScriptPanel() {
    scriptLocked = !scriptLocked;
    if (scriptLocked) { openScriptPanel(); }
    else if (scriptPanel) { scriptPanel.classList.remove('open'); }
  }

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ':
        e.preventDefault(); goTo(current + 1); break;
      case 'ArrowLeft': case 'ArrowUp':
        e.preventDefault(); goTo(current - 1); break;
      case 's': case 'S':
        toggleScriptPanel(); break;
      case 'Escape':
        closeSidebar();
        if (scriptLocked) { scriptLocked = false; hideScriptPanel(); }
        break;
    }
  });

  /* ---------- Touch / Swipe ---------- */
  var touchX = 0;
  stage.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Click half-screen navigation (left=prev / right=next) ---------- */
  stage.addEventListener('click', function (e) {
    // インタラクティブ要素はスキップ
    var t = e.target;
    while (t && t !== stage) {
      var tag = t.tagName;
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' ||
          tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (t.classList && (t.classList.contains('s-prompt-copy') ||
          t.classList.contains('sidebar-toggle'))) return;
      t = t.parentElement;
    }
    // サイドバー開いているときはスキップ
    if (sidebar && sidebar.classList.contains('open')) return;
    if (e.clientX < window.innerWidth / 2) {
      goTo(current - 1);
    } else {
      goTo(current + 1);
    }
  });

  /* ---------- Mouse wheel navigation ---------- */
  var wheelLocked = false;
  document.addEventListener('wheel', function (e) {
    // サイドバー・スクリプトパネル内のスクロールは除外
    var t = e.target;
    while (t) {
      if (t === sidebar || t === scriptPanel) return;
      t = t.parentElement;
    }
    if (wheelLocked) return;
    if (e.deltaY > 0) { goTo(current + 1); }
    else if (e.deltaY < 0) { goTo(current - 1); }
    wheelLocked = true;
    setTimeout(function () { wheelLocked = false; }, 650);
  }, { passive: true });

  /* ---------- Script hover ---------- */
  if (scriptTrigger) {
    scriptTrigger.addEventListener('mouseenter', function () {
      clearTimeout(scriptHideTimer);
      updateScriptPanel();
      openScriptPanel();
    });
  }
  if (scriptPanel) {
    scriptPanel.addEventListener('mouseleave', function () {
      if (!scriptLocked) {
        scriptHideTimer = setTimeout(hideScriptPanel, 200);
      }
    });
    scriptPanel.addEventListener('mouseenter', function () {
      clearTimeout(scriptHideTimer);
    });
  }

  /* ---------- Sidebar toggle ---------- */
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
  }

  /* ---------- Export: PDF ---------- */
  if (pdfBtn) {
    pdfBtn.addEventListener('click', function () {
      for (var i = 0; i < totalSlides; i++) ensureRendered(i);
      requestAnimationFrame(function () { window.print(); });
    });
  }

  /* ---------- Export: PPTX ---------- */
  if (pptxBtn) {
    pptxBtn.addEventListener('click', function () {
      if (typeof PptxGenJS === 'undefined') {
        alert('pptxgenjs が読み込まれていません');
        return;
      }
      showOverlay();
      for (var i = 0; i < totalSlides; i++) ensureRendered(i);

      setTimeout(function () {
        var pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_WIDE';
        var slides = stage.querySelectorAll('.slide');

        slides.forEach(function (sl, i) {
          var pSlide = pptx.addSlide();
          var bg = window.getComputedStyle(sl).backgroundColor;
          pSlide.background = { fill: rgbToHex(bg) || 'FFFFFF' };
          var h2 = sl.querySelector('.slide-h2, .s-section-title, .slide-cover-title, .s-quote, .s-ending-main');
          if (h2) {
            pSlide.addText(h2.innerText || h2.textContent, {
              x: 0.3, y: 0.3, w: 9.4, h: 1.0,
              fontSize: 24, bold: true, color: '1a3c6e',
              fontFace: 'Noto Sans JP', breakLine: true
            });
          }
          var body = sl.querySelector('.s-list, .s-prompt-box, .s-risk-list, .slide-content');
          if (body && body !== h2) {
            var txt = (body.innerText || body.textContent).trim();
            if (txt) {
              pSlide.addText(txt, {
                x: 0.3, y: 1.5, w: 9.4, h: 4.5,
                fontSize: 14, color: '1e2735',
                fontFace: 'Noto Sans JP', valign: 'top',
                breakLine: true
              });
            }
          }
          var notes = sl.dataset.notes || '';
          if (notes) pSlide.addNotes(notes);
          setProgress((i + 1) / totalSlides);
        });

        pptx.writeFile({ fileName: '契約書AIチェックセミナー.pptx' }).then(hideOverlay);
      }, 100);
    });
  }

  function showOverlay() { if (overlay) overlay.classList.add('show'); setProgress(0); }
  function hideOverlay() { if (overlay) overlay.classList.remove('show'); }
  function setProgress(v) { if (fillBar) fillBar.style.width = Math.round(v * 100) + '%'; }

  /* ---------- Zoom ---------- */
  var zoomLevel  = 1.0;
  var ZOOM_STEP  = 0.1;
  var ZOOM_MIN   = 0.6;
  var ZOOM_MAX   = 1.8;

  function applyZoom(z) {
    zoomLevel = Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)) * 10) / 10;
    stage.style.transform       = zoomLevel === 1 ? '' : 'scale(' + zoomLevel + ')';
    stage.style.transformOrigin = 'center center';
    if (zoomDisplay) zoomDisplay.textContent = Math.round(zoomLevel * 100) + '%';
    // ズームレベルをLocalStorageに保存
    try { localStorage.setItem('slideZoom', zoomLevel); } catch (e) {}
  }

  if (zoomInBtn)    zoomInBtn.addEventListener('click',    function () { applyZoom(zoomLevel + ZOOM_STEP); });
  if (zoomOutBtn)   zoomOutBtn.addEventListener('click',   function () { applyZoom(zoomLevel - ZOOM_STEP); });
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', function () { applyZoom(1.0); });

  /* Ctrl+ホイールで拡大縮小 */
  document.addEventListener('wheel', function (e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    applyZoom(zoomLevel + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });

  /* Ctrl +/- キー */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.key === ';')) {
      e.preventDefault(); applyZoom(zoomLevel + ZOOM_STEP);
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
      e.preventDefault(); applyZoom(zoomLevel - ZOOM_STEP);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault(); applyZoom(1.0);
    }
  });

  /* 前回のズームレベルを復元 */
  try {
    var saved = parseFloat(localStorage.getItem('slideZoom'));
    if (!isNaN(saved) && saved !== 1.0) applyZoom(saved);
  } catch (e) {}

  function rgbToHex(rgb) {
    var m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) return null;
    return [m[1], m[2], m[3]].map(function (v) {
      return ('0' + parseInt(v).toString(16)).slice(-2);
    }).join('').toUpperCase();
  }

  /* ---------- Init ---------- */
  buildSectionNav();
  buildSidebar();
  current = parseHash();
  ensureRendered(current);
  ensureRendered(current + 1);
  var first = getSlide(current);
  if (first) first.classList.add('active');
  updateSectionNav();
  updateSidebar();
  updateScriptPanel();
  window.addEventListener('popstate', function () { goTo(parseHash()); });
})();
