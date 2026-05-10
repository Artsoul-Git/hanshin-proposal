(function () {
  var factories   = window.slideFactories || [];
  var totalSlides = factories.length;
  var current     = 0;

  var layout      = document.getElementById('p-layout');
  var currentCol  = document.getElementById('p-current-col');
  var sideCol     = document.getElementById('p-side-col');
  var splitter    = document.getElementById('p-splitter');
  var vSplitter   = document.getElementById('p-v-splitter');
  var stgCurrent  = document.getElementById('p-stage-current');
  var stgNext     = document.getElementById('p-stage-next');
  var notesBox    = document.getElementById('p-notes-box');
  var notesText   = document.getElementById('p-notes-text');
  var timerEl     = document.getElementById('p-timer');
  var timerToggle = document.getElementById('p-timer-toggle');
  var timerReset  = document.getElementById('p-timer-reset');
  var prevBtn     = document.getElementById('p-prev');
  var nextBtn     = document.getElementById('p-next');
  var currentNum  = document.getElementById('p-current-num');
  var totalNum    = document.getElementById('p-total-num');
  var notesSmallerBtn = document.getElementById('p-notes-smaller');
  var notesLargerBtn  = document.getElementById('p-notes-larger');
  var fontsizeVal     = document.getElementById('p-fontsize-val');

  if (totalNum) totalNum.textContent = totalSlides;

  /* =============================================
     BroadcastChannel — sync with audience window
     ============================================= */
  var bc = null;
  try { bc = new BroadcastChannel('slide-sync'); } catch (e) {}
  var bcRemote = false;
  if (bc) {
    bc.onmessage = function (e) {
      if (e.data && e.data.type === 'goto') {
        bcRemote = true;
        goTo(e.data.index);
        bcRemote = false;
      }
    };
  }

  /* =============================================
     Slide rendering
     ============================================= */
  function renderInto(container, index) {
    container.innerHTML = '';
    if (index < 0 || index >= totalSlides) {
      container.innerHTML = '<div class="p-stage-empty">（最後のスライド）</div>';
      return null;
    }
    try {
      var html = factories[index]();
      var frag = document.createRange().createContextualFragment(html);
      var slide = frag.querySelector('.slide');
      if (slide) {
        slide.dataset.index = index;
        slide.classList.add('active');
      }
      container.appendChild(frag);
      return container.querySelector('.slide');
    } catch (e) { return null; }
  }

  /* =============================================
     Navigate
     ============================================= */
  function goTo(index) {
    if (index < 0 || index >= totalSlides) return;
    current = index;

    var slide = renderInto(stgCurrent, current);
    renderInto(stgNext, current + 1);

    var notes = slide ? (slide.dataset.notes || '') : '';
    if (notesText) notesText.textContent = notes || '（トークスクリプトなし）';
    if (currentNum) currentNum.textContent = current + 1;
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === totalSlides - 1;

    if (!bcRemote && bc) bc.postMessage({ type: 'goto', index: current });
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ':
        e.preventDefault(); goTo(current + 1); break;
      case 'ArrowLeft': case 'ArrowUp':
        e.preventDefault(); goTo(current - 1); break;
    }
  });

  /* =============================================
     Notes font size
     ============================================= */
  var notesFontSize = 13;

  function applyNotesFontSize(size) {
    notesFontSize = Math.max(9, Math.min(28, size));
    if (notesText)   notesText.style.fontSize   = notesFontSize + 'px';
    if (fontsizeVal) fontsizeVal.textContent     = notesFontSize;
    try { localStorage.setItem('presenterNotesFontSize', notesFontSize); } catch (e) {}
  }

  if (notesSmallerBtn) notesSmallerBtn.addEventListener('click', function () { applyNotesFontSize(notesFontSize - 1); });
  if (notesLargerBtn)  notesLargerBtn.addEventListener('click',  function () { applyNotesFontSize(notesFontSize + 1); });

  try {
    var savedFont = parseInt(localStorage.getItem('presenterNotesFontSize'), 10);
    if (!isNaN(savedFont)) applyNotesFontSize(savedFont);
  } catch (e) {}

  /* =============================================
     Generic splitter factory
     — builds a drag handler that resizes two regions
     ============================================= */
  function makeDragOverlay(cursor) {
    var el = document.createElement('div');
    el.className = 'p-drag-overlay ' + cursor;
    document.body.appendChild(el);
    return el;
  }

  /* =============================================
     Horizontal splitter (left col width)
     ============================================= */
  var H_MIN = 28; // % of layout width
  var H_MAX = 80;

  function applyHSplit(pct) {
    pct = Math.max(H_MIN, Math.min(H_MAX, pct));
    currentCol.style.flex = '0 0 ' + pct.toFixed(1) + '%';
    try { localStorage.setItem('presenterHSplit', pct.toFixed(1)); } catch (e) {}
  }

  if (splitter) {
    splitter.addEventListener('mousedown', function (e) {
      e.preventDefault();
      splitter.classList.add('active');
      var overlay = makeDragOverlay('h');

      function onMove(ev) {
        var rect = layout.getBoundingClientRect();
        applyHSplit(((ev.clientX - rect.left) / rect.width) * 100);
      }
      function onUp() {
        splitter.classList.remove('active');
        overlay.remove();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  }

  try {
    var hs = parseFloat(localStorage.getItem('presenterHSplit'));
    if (!isNaN(hs)) applyHSplit(hs);
  } catch (e) {}

  /* =============================================
     Vertical splitter (next-slide panel height)
     ============================================= */
  var V_MIN_PX = 60;

  function applyVSplit(px) {
    var sideH     = sideCol ? sideCol.clientHeight : 600;
    var infoH     = sideCol ? (sideCol.querySelector('.p-info-row') || {}).offsetHeight || 52 : 52;
    var labelH    = sideCol ? (sideCol.querySelector('.p-col-label') || {}).offsetHeight || 18 : 18;
    var vSplitH   = 8;
    var headerH   = notesBox ? (notesBox.querySelector('.p-notes-header') || {}).offsetHeight || 30 : 30;
    var maxPx     = sideH - infoH - labelH - vSplitH - headerH - 40;
    px = Math.max(V_MIN_PX, Math.min(maxPx, px));
    if (stgNext) stgNext.style.height = px + 'px';
    try { localStorage.setItem('presenterVSplit', Math.round(px)); } catch (e) {}
  }

  /* Default: height that gives 16:9 based on current side column width */
  function initVSplit() {
    var w = sideCol ? sideCol.clientWidth : 400;
    var defaultH = Math.round(w * 9 / 16);
    try {
      var saved = parseInt(localStorage.getItem('presenterVSplit'), 10);
      applyVSplit(!isNaN(saved) ? saved : defaultH);
    } catch (e) { applyVSplit(defaultH); }
  }

  if (vSplitter) {
    vSplitter.addEventListener('mousedown', function (e) {
      e.preventDefault();
      vSplitter.classList.add('active');
      var overlay = makeDragOverlay('v');

      function onMove(ev) {
        var sideRect = sideCol.getBoundingClientRect();
        var labelH   = (sideCol.querySelector('.p-col-label') || {}).offsetHeight || 18;
        var px = ev.clientY - sideRect.top - labelH;
        applyVSplit(px);
      }
      function onUp() {
        vSplitter.classList.remove('active');
        overlay.remove();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  }

  /* =============================================
     Timer
     ============================================= */
  var timerSec      = 0;
  var timerRunning  = false;
  var timerInterval = null;

  function fmtTime(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  if (timerToggle) {
    timerToggle.addEventListener('click', function () {
      if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerToggle.textContent = '▶ スタート';
      } else {
        timerInterval = setInterval(function () {
          timerSec++;
          if (timerEl) timerEl.textContent = fmtTime(timerSec);
        }, 1000);
        timerRunning = true;
        timerToggle.textContent = '⏸ 停止';
      }
    });
  }

  if (timerReset) {
    timerReset.addEventListener('click', function () {
      clearInterval(timerInterval);
      timerRunning = false;
      timerSec = 0;
      if (timerEl)     timerEl.textContent    = '00:00';
      if (timerToggle) timerToggle.textContent = '▶ スタート';
    });
  }

  /* =============================================
     Init
     ============================================= */
  var h = location.hash.replace('#', '');
  var n = parseInt(h, 10);
  current = (!isNaN(n) && n >= 1 && n <= totalSlides) ? n - 1 : 0;

  /* Init vertical split after layout is painted */
  requestAnimationFrame(function () {
    initVSplit();
    goTo(current);
  });
})();
