(function () {
  var factories = window.slideFactories || [];
  var totalSlides = factories.length;
  var current = 0;

  var stgCurrent = document.getElementById('p-stage-current');
  var stgNext    = document.getElementById('p-stage-next');
  var notesText  = document.getElementById('p-notes-text');
  var timerEl    = document.getElementById('p-timer');
  var timerToggle= document.getElementById('p-timer-toggle');
  var timerReset = document.getElementById('p-timer-reset');
  var prevBtn    = document.getElementById('p-prev');
  var nextBtn    = document.getElementById('p-next');
  var currentNum = document.getElementById('p-current-num');
  var totalNum   = document.getElementById('p-total-num');

  if (totalNum) totalNum.textContent = totalSlides;

  /* ---------- BroadcastChannel ---------- */
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

  /* ---------- Render slide into container ---------- */
  function renderSlide(container, index) {
    container.innerHTML = '';
    if (index < 0 || index >= totalSlides) {
      container.innerHTML = '<div class="p-stage-empty">最後のスライド</div>';
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

  /* ---------- Update presenter view ---------- */
  function updateView() {
    var slide = renderSlide(stgCurrent, current);
    renderSlide(stgNext, current + 1);

    var notes = slide ? (slide.dataset.notes || '') : '';
    if (notesText) notesText.textContent = notes || '（トークスクリプトなし）';
    if (currentNum) currentNum.textContent = current + 1;
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === totalSlides - 1;
  }

  /* ---------- Navigate ---------- */
  function goTo(index) {
    if (index < 0 || index >= totalSlides) return;
    current = index;
    updateView();
    if (!bcRemote && bc) bc.postMessage({ type: 'goto', index: current });
  }

  /* ---------- Navigation buttons ---------- */
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ':
        e.preventDefault(); goTo(current + 1); break;
      case 'ArrowLeft': case 'ArrowUp':
        e.preventDefault(); goTo(current - 1); break;
    }
  });

  /* ---------- Timer ---------- */
  var timerSec = 0;
  var timerRunning = false;
  var timerInterval = null;

  function formatTime(s) {
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
          if (timerEl) timerEl.textContent = formatTime(timerSec);
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
      if (timerEl) timerEl.textContent = '00:00';
      if (timerToggle) timerToggle.textContent = '▶ スタート';
    });
  }

  /* ---------- Init ---------- */
  var h = location.hash.replace('#', '');
  var n = parseInt(h, 10);
  current = (!isNaN(n) && n >= 1 && n <= totalSlides) ? n - 1 : 0;
  updateView();
})();
