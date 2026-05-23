/**
 * export-text.js — テキスト編集可能なPPTX出力
 * ascolor-minimal テーマ対応 / PptxGenJS v3.12
 *
 * slides.js の各スライド関数を DOMParser で解析し、
 * PptxGenJS のネイティブ text/shape API でレイアウトを再現する。
 * html2canvas を使わないため、テキストはPowerPointで編集可能。
 */
(function () {
  'use strict';

  /* ── カラーパレット (ascolor-minimal) ─────────────────── */
  var C = {
    green:    '6f911d',
    dark:     '3d5411',
    mid:      '4a6214',
    pale:     'e8f1d8',
    line:     'c5d9a8',
    yellow:   'fabe00',
    text:     '1A1A1A',
    sub:      '837c75',
    white:    'FFFFFF',
    grayLt:   'F5F5F5',
    grayMd:   'CCCCCC',
    codeBg:   '1e1e1e',
    codeFg:   'd4d4d4',
  };

  /* ── スライドサイズ: WIDE 10"×5.625" ─────────────────── */
  var W = 10, H = 5.625;

  /* ── ヘルパー ─────────────────────────────────────────── */
  function txt(el) {
    return el ? el.textContent.trim() : '';
  }

  /* BR タグを \n に変換してテキスト抽出（複数行対応） */
  function txtBr(el) {
    if (!el) return '';
    var r = '';
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) r += n.textContent;
      else if (n.nodeName === 'BR') r += '\n';
      else r += txtBr(n);
    });
    return r.trim().replace(/\n{3,}/g, '\n\n');
  }

  function addRect(s, x, y, w, h, fill, lineColor, lineW, rounding, fillTransp) {
    var opts = { x: x, y: y, w: w, h: h };
    if (fill) opts.fill = { color: fill };
    if (fill && fillTransp) opts.fill.transparency = fillTransp;
    if (lineColor) opts.line = { color: lineColor, width: lineW || 0.5 };
    if (rounding) opts.rectRadius = rounding;
    s.addShape('rect', opts);
  }

  function addEllipse(s, x, y, r, fill) {
    s.addShape('ellipse', { x: x, y: y, w: r * 2, h: r * 2, fill: { color: fill } });
  }

  function addTxt(s, text, x, y, w, h, opts) {
    if (!text) return;
    var o = Object.assign({}, opts);
    /* bold → Noto Sans JP Black でウェイトを管理。b="1" は使わない */
    if (o.bold) { o.fontFace = 'Noto Sans JP Black'; delete o.bold; }
    else if (!o.fontFace) { o.fontFace = 'Noto Sans JP'; }
    s.addText(text, Object.assign({ x: x, y: y, w: w, h: h, shrinkText: true }, o));
  }

  /* ── カバースライド ────────────────────────────────────── */
  function buildCover(pSlide, sec) {
    var barH = 1.62;
    // グリーンバー
    addRect(pSlide, 0, 0, W, barH, C.green);

    var tag   = sec.querySelector('.slide-cover-tag');
    var title = sec.querySelector('.slide-cover-title');
    var brand = sec.querySelector('.slide-cover-brand');
    var sub   = sec.querySelector('.slide-cover-sub');
    var meta  = sec.querySelector('.slide-cover-meta');

    if (tag)
      addTxt(pSlide, txt(tag),   0.38, 0.18, 8.5, 0.28, { fontSize: 10, color: C.white, bold: true, charSpacing: 4, transparency: 35 });
    if (title)
      addTxt(pSlide, txt(title), 0.38, 0.46, 8.8, 1.05, { fontSize: 30, color: C.white, bold: true, lineSpacingMultiple: 1.2 });
    if (brand)
      addTxt(pSlide, txt(brand), 7.0,  1.32, 2.8, 0.22, { fontSize: 9,  color: C.white, align: 'right', transparency: 50 });
    if (sub)
      addTxt(pSlide, txt(sub),   0.38, 1.9,  9.0, 0.46, { fontSize: 16, color: C.text,  bold: true });
    if (meta)
      addTxt(pSlide, txt(meta),  0.38, 2.45, 9.0, 0.3,  { fontSize: 10, color: C.sub });
  }

  /* ── インパクトスライド ────────────────────────────────── */
  function buildImpact(pSlide, sec) {
    pSlide.background = { color: C.dark };

    var tag  = sec.querySelector('.s-impact-tag');
    var main = sec.querySelector('.s-impact-main');
    var sub  = sec.querySelector('.s-impact-sub');

    var y = sub ? 1.2 : 1.6;

    if (tag) {
      addTxt(pSlide, txt(tag), 0.5, y, W - 1, 0.42, { fontSize: 17, color: C.white, bold: true, align: 'center', charSpacing: 4, transparency: 20 });
      y += 0.5;
    }
    if (main) {
      /* <em> タグの内容に下線を付ける */
      var mainEl = main;
      var runs = [];
      mainEl.childNodes.forEach(function (node) {
        if (node.nodeType === 3 && node.textContent.trim()) {
          runs.push({ text: node.textContent, options: {} });
        } else if (node.nodeName === 'EM') {
          runs.push({ text: node.textContent, options: { underline: { type: 'sng', color: C.yellow } } });
        } else if (node.nodeName === 'BR') {
          runs.push({ text: '\n', options: {} });
        } else if (node.nodeName === 'SPAN' && node.textContent.trim()) {
          runs.push({ text: node.textContent, options: { fontSize: 20, transparency: 25 } });
        }
      });
      if (runs.length === 0) runs = [{ text: txt(main), options: {} }];
      /* fontFace=Black でウェイト管理（bold属性は使わない） */
      pSlide.addText(runs, {
        x: 0.3, y: y, w: W - 0.6, h: 1.8,
        fontSize: 30, color: C.white, fontFace: 'Noto Sans JP Black',
        align: 'center', lineSpacingMultiple: 1.3, shrinkText: true,
      });
      y += 1.9;
    }
    if (sub) {
      addTxt(pSlide, txt(sub), 0.3, y, W - 0.6, 0.42, { fontSize: 13, color: C.white, align: 'center', transparency: 30 });
    }
  }

  /* ── セクション区切り ──────────────────────────────────── */
  function buildSection(pSlide, sec) {
    pSlide.background = { color: C.green };

    var chapter = sec.querySelector('.s-section-chapter');
    var title   = sec.querySelector('.s-section-title');
    var lead    = sec.querySelector('.s-section-lead');

    var y = 1.35;
    // アクセントバー（細い白線）
    addRect(pSlide, 0.6, y, 1.5, 0.06, C.white, null, 0, 0);
    y += 0.2;

    if (chapter) {
      addTxt(pSlide, txt(chapter), 0.62, y, 9, 0.35, { fontSize: 12, color: C.white, bold: true, charSpacing: 6, transparency: 28 });
      y += 0.42;
    }
    if (title) {
      addTxt(pSlide, txt(title), 0.62, y, 9, 1.3, { fontSize: 28, color: C.white, bold: true, lineSpacingMultiple: 1.2 });
      y += 1.4;
    }
    if (lead) {
      addTxt(pSlide, txt(lead), 0.62, y, 9, 0.42, { fontSize: 14, color: C.white, transparency: 32 });
    }
  }

  /* ── エンディングスライド ──────────────────────────────── */
  function buildEnding(pSlide, sec) {
    pSlide.background = { color: C.dark };  /* CSS: .slide-ending { background: #3d5411 } */

    var main = sec.querySelector('.s-ending-main');
    var subs = sec.querySelectorAll('.s-ending-sub');

    var y = 0.55;

    if (main) {
      addTxt(pSlide, txt(main), 0.5, y, W - 1, 0.72, { fontSize: 24, color: C.white, bold: true, align: 'center' });
      y += 0.88;
    }

    addRect(pSlide, 3.5, y, 3, 0.04, C.white, null, 0, 0, 60);  /* rgba(255,255,255,.4) */
    y += 0.2;

    var subArr = Array.prototype.slice.call(subs);
    subArr.forEach(function (sub, i) {
      var t = txtBr(sub);
      if (!t) return;
      var h = 0.95;
      addTxt(pSlide, t, 0.4, y, W - 0.8, h, { fontSize: 12, color: C.white, align: 'center', transparency: 40, lineSpacingMultiple: 1.5 });
      y += h;
      if (i < subArr.length - 1) {
        addRect(pSlide, 3.5, y, 3, 0.04, C.white, null, 0, 0, 60);
        y += 0.2;
      }
    });
  }

  /* ── callout + prompt + list 複合レンダラー（スライド16等） ── */
  function renderCalloutPromptList(pSlide, callout, promptWrap, listEl, y0, avH) {
    var y = y0 + 0.04;

    var calloutH = callout ? 0.44 : 0;
    if (callout) {
      renderCallout(pSlide, txt(callout), y, calloutH);
      y += calloutH + 0.1;
    }

    var items = listEl.querySelectorAll('li');
    var listN = items.length || 1;
    var listRowH = 0.46;
    var listH = listN * listRowH + 0.08;

    var promptH = avH - calloutH - (callout ? 0.1 : 0) - listH - 0.16;
    promptH = Math.max(promptH, 0.6);

    var pb = promptWrap.querySelector('.s-prompt-box');
    if (pb) {
      renderPromptBox(pSlide, txtBr(pb), y, promptH);
      y += promptH + 0.12;
    }

    items.forEach(function (li) {
      var t = txt(li);
      var isHead    = li.classList.contains('s-list-head');
      var isSub     = li.classList.contains('s-list-sub');
      var isCallout = li.classList.contains('s-list-callout');
      var isArrow   = li.classList.contains('s-list-arrow');
      var rH = listRowH * 0.9;

      if (isCallout) {
        addRect(pSlide, 0.38, y, 9.24, rH, C.pale, C.line, 0.5, 0.04);
        addRect(pSlide, 0.38, y, 0.1,  rH, C.green);
        addTxt(pSlide, t, 0.6, y + 0.04, 8.9, rH * 0.82, { fontSize: 12, bold: true, color: C.text });
      } else if (isHead) {
        addTxt(pSlide, t, 0.38, y, 9.24, rH, { fontSize: 13, bold: true, color: C.text });
      } else if (isSub) {
        addTxt(pSlide, '─  ' + t, 0.82, y, 8.8, rH, { fontSize: 11, color: C.sub });
      } else if (isArrow) {
        addTxt(pSlide, '→  ' + t, 0.58, y, 9.0, rH, { fontSize: 12, color: C.sub });
      } else {
        addTxt(pSlide, '●  ' + t, 0.58, y, 9.0, rH, { fontSize: 12, color: C.text });
      }
      y += listRowH;
    });
  }

  /* ── コンテンツスライド ────────────────────────────────── */
  function buildContent(pSlide, sec) {
    pSlide.background = { color: C.white };

    var hdrEl  = sec.querySelector('.slide-header .slide-h2');
    var cntEl  = sec.querySelector('.slide-content');
    var cY     = 0.12;

    if (hdrEl) {
      /* CSS: .slide-h2 { color: #6f911d } / .slide-header { border-bottom: solid #6f911d } */
      addTxt(pSlide, txt(hdrEl), 0.38, 0.1, W - 0.76, 0.5, { fontSize: 19, color: C.green, bold: true });
      addRect(pSlide, 0, 0.62, W, 0.03, C.green);
      cY = 0.76;
    }

    if (!cntEl) return;

    var availH = H - cY - 0.18;

    var sList     = cntEl.querySelector('.s-list');
    var sNumList  = cntEl.querySelector('.s-num-list');
    var sFlow     = cntEl.querySelector('.s-flow');
    var sSteps    = cntEl.querySelector('.s-steps');
    var sPointList= cntEl.querySelector('.s-point-list');
    var sCompare  = cntEl.querySelector('.s-compare');
    var sPromptBox= cntEl.querySelector('.s-prompt-box');
    var callout   = cntEl.querySelector('.s-callout');
    var promptWrap= cntEl.querySelector('.s-prompt-wrap');

    if (sFlow)
      renderFlow(pSlide, sFlow, cY, availH);
    else if (sCompare)
      renderCompare(pSlide, sCompare, cY, availH);
    else if (sNumList)
      renderNumList(pSlide, sNumList, cY, availH, callout);
    else if (sList && promptWrap)
      renderCalloutPromptList(pSlide, callout, promptWrap, sList, cY, availH);
    else if (sList)
      renderList(pSlide, sList, cY, availH);
    else if (sSteps)
      renderSteps(pSlide, sSteps, cY, availH, promptWrap, callout);
    else if (sPointList)
      renderPointList(pSlide, sPointList, cY, availH);
    else if (sPromptBox)
      renderPromptOnly(pSlide, sPromptBox, cY, availH, callout);
    else if (callout)
      renderCalloutOnly(pSlide, callout, cY, availH);
  }

  /* ── s-list レンダラー ──────────────────────────────────── */
  function renderList(pSlide, el, y0, avH) {
    var items = el.querySelectorAll('li');
    var n = items.length || 1;
    var rowH = Math.min(avH / n, 0.56);
    var y = y0 + 0.04;

    items.forEach(function (li) {
      var t = txt(li);
      var isHead    = li.classList.contains('s-list-head');
      var isSub     = li.classList.contains('s-list-sub');
      var isCallout = li.classList.contains('s-list-callout');
      var isArrow   = li.classList.contains('s-list-arrow');

      if (isCallout) {
        addRect(pSlide, 0.38, y, 9.24, rowH * 0.9, C.pale, C.line, 0.5, 0.04);
        addRect(pSlide, 0.38, y, 0.1,  rowH * 0.9, C.green);
        addTxt(pSlide, t, 0.6, y + 0.04, 8.9, rowH * 0.82, { fontSize: 12, bold: true, color: C.text });
      } else if (isHead) {
        addTxt(pSlide, t, 0.38, y, 9.24, rowH * 0.9, { fontSize: 13, bold: true, color: C.text });
      } else if (isSub) {
        addTxt(pSlide, '─  ' + t, 0.82, y, 8.8, rowH * 0.88, { fontSize: 11, color: C.sub });
      } else if (isArrow) {
        addTxt(pSlide, '→  ' + t, 0.58, y, 9.0, rowH * 0.88, { fontSize: 12, color: C.sub });
      } else {
        addTxt(pSlide, '●  ' + t, 0.58, y, 9.0, rowH * 0.88, { fontSize: 12, color: C.text });
      }
      y += rowH;
    });
  }

  /* ── s-num-list レンダラー ──────────────────────────────── */
  function renderNumList(pSlide, el, y0, avH, callout) {
    var items = el.querySelectorAll('.s-num-item');
    var n = items.length || 1;
    var calloutH = callout ? 0.48 : 0;
    var rowH = Math.min((avH - calloutH - 0.1) / n, 0.75);
    var y = y0 + 0.04;

    // 上ライン
    addRect(pSlide, 0.38, y, 9.24, 0.03, C.text);

    items.forEach(function (item) {
      var num   = item.querySelector('.s-num');
      var title = item.querySelector('.s-num-title');
      var desc  = item.querySelector('.s-num-desc');

      if (num)
        addTxt(pSlide, txt(num), 0.38, y + 0.04, 0.48, rowH * 0.88, { fontSize: 20, bold: true, color: C.green, align: 'center', valign: 'middle' });
      if (title)
        addTxt(pSlide, txt(title), 0.96, y + 0.05, 8.6, rowH * 0.44, { fontSize: 13, bold: true, color: C.text });
      if (desc)
        addTxt(pSlide, txt(desc), 0.96, y + rowH * 0.46, 8.6, rowH * 0.42, { fontSize: 11, color: C.sub });

      y += rowH;
      // アイテム下ライン
      addRect(pSlide, 0.38, y, 9.24, 0.03, C.grayMd);
    });

    if (callout)
      renderCallout(pSlide, txt(callout), y + 0.1, calloutH);
  }

  /* ── s-flow レンダラー ──────────────────────────────────── */
  function renderFlow(pSlide, el, y0, avH) {
    var steps = el.querySelectorAll('.s-flow-step');
    var n = steps.length || 1;
    var totalW = 9.24;
    var arrowW = 0.38;
    var stepW  = (totalW - arrowW * (n - 1)) / n;
    var boxH   = Math.min(avH - 0.25, 3.0);
    var y      = y0 + (avH - boxH) / 2;
    var x      = 0.38;
    var circR  = 0.3;

    steps.forEach(function (step, i) {
      var numEl  = step.querySelector('.s-flow-num');
      var lblEl  = step.querySelector('.s-flow-label');
      var dscEl  = step.querySelector('.s-flow-desc');

      addRect(pSlide, x, y, stepW, boxH, C.pale, C.line, 0.5, 0.06);

      var cx = x + stepW / 2 - circR;
      addEllipse(pSlide, cx, y + 0.22, circR, C.green);
      if (numEl)
        addTxt(pSlide, txt(numEl), cx, y + 0.22, circR * 2, circR * 2, { fontSize: 13, bold: true, color: C.white, align: 'center', valign: 'middle' });

      var textY = y + 0.22 + circR * 2 + 0.12;
      if (lblEl)
        addTxt(pSlide, txt(lblEl), x + 0.06, textY, stepW - 0.12, 0.48, { fontSize: 13, bold: true, color: C.text, align: 'center' });
      if (dscEl)
        addTxt(pSlide, txtBr(dscEl), x + 0.06, textY + 0.5, stepW - 0.12, boxH - 1.4, { fontSize: 11, color: C.sub, align: 'center', lineSpacingMultiple: 1.3 });

      if (i < n - 1)
        addTxt(pSlide, '▶', x + stepW, y + boxH / 2 - 0.15, arrowW, 0.3, { fontSize: 10, color: C.line, align: 'center' });

      x += stepW + arrowW;
    });
  }

  /* ── s-steps レンダラー ─────────────────────────────────── */
  function renderSteps(pSlide, el, y0, avH, promptWrap, callout) {
    var rows = el.querySelectorAll('.s-step-row');
    var n = rows.length || 1;
    var promptH  = promptWrap ? 1.25 : 0;
    var calloutH = callout    ? 0.4  : 0;
    var stepsH   = avH - promptH - calloutH - 0.15;
    var rowH     = Math.min(stepsH / n, 0.8);
    var y = y0 + 0.04;

    rows.forEach(function (row) {
      var numEl  = row.querySelector('.s-step-num');
      var txtEl  = row.querySelector('.s-step-text');
      var subEl  = row.querySelector('.s-step-sub');
      var rH     = rowH * 0.9;

      addRect(pSlide, 0.38, y, 9.24, rH, C.pale, null, 0, 0.04);

      if (numEl) {
        addEllipse(pSlide, 0.44, y + (rH - 0.44) / 2, 0.22, C.green);
        addTxt(pSlide, txt(numEl), 0.44, y + (rH - 0.44) / 2, 0.44, 0.44, { fontSize: 13, bold: true, color: C.white, align: 'center', valign: 'middle' });
      }

      var tx = 1.05, tw = 8.45;
      if (txtEl)
        addTxt(pSlide, txt(txtEl), tx, y + 0.05, tw, subEl ? rH * 0.46 : rH * 0.85, { fontSize: 13, color: C.text });
      if (subEl)
        addTxt(pSlide, txtBr(subEl), tx, y + rH * 0.48, tw, rH * 0.38, { fontSize: 10, color: C.sub });

      y += rowH;
    });

    if (callout) {
      renderCallout(pSlide, txt(callout), y + 0.05, calloutH);
      y += calloutH + 0.1;
    }

    if (promptWrap) {
      var pb = promptWrap.querySelector('.s-prompt-box');
      if (pb) renderPromptBox(pSlide, txtBr(pb), y + 0.06, promptH - 0.06);
    }
  }

  /* ── s-point-list レンダラー ────────────────────────────── */
  function renderPointList(pSlide, el, y0, avH) {
    var rows = el.querySelectorAll('.s-point-row');
    var n = rows.length || 1;
    var rowH = Math.min(avH / n - 0.08, 1.28);
    var y = y0 + 0.05;

    rows.forEach(function (row) {
      var bdgEl = row.querySelector('.s-point-badge');
      var ttlEl = row.querySelector('.s-point-title');
      var dscEl = row.querySelector('.s-point-desc');
      var rH    = rowH * 0.92;

      addRect(pSlide, 0.38, y, 9.24, rH, C.pale, null, 0, 0.06);
      addRect(pSlide, 0.44, y + 0.08, 0.52, rH - 0.16, C.green, null, 0, 0.04);

      if (bdgEl)
        addTxt(pSlide, txt(bdgEl), 0.44, y + 0.08, 0.52, rH - 0.16, { fontSize: 16, color: C.white, align: 'center', valign: 'middle' });
      if (ttlEl)
        addTxt(pSlide, txt(ttlEl), 1.08, y + 0.1, 8.46, rH * 0.44, { fontSize: 14, bold: true, color: C.text });
      if (dscEl)
        addTxt(pSlide, txtBr(dscEl), 1.08, y + rH * 0.47, 8.46, rH * 0.44, { fontSize: 11, color: C.sub });

      y += rowH;
    });
  }

  /* ── s-compare レンダラー ───────────────────────────────── */
  function renderCompare(pSlide, el, y0, avH) {
    var cols = el.querySelectorAll('.s-compare-col');
    var xs = [0.38, 5.2];
    var colW = 4.45;
    var colH = avH - 0.1;
    var y = y0 + 0.05;

    cols.forEach(function (col, i) {
      var isPos = col.classList.contains('positive');
      addRect(pSlide, xs[i], y, colW, colH, isPos ? C.white : C.pale, isPos ? C.text : C.line, isPos ? 1.5 : 0.5, 0.06);

      var bdgEl  = col.querySelector('.s-compare-badge');
      var ttlEl  = col.querySelector('.s-compare-title');
      var items  = col.querySelectorAll('.s-compare-items li');
      var cy = y + 0.18;

      if (bdgEl) {
        addRect(pSlide, xs[i] + 0.15, cy, colW - 0.3, 0.32, isPos ? C.dark : C.grayMd, null, 0, 0.05);
        addTxt(pSlide, txt(bdgEl), xs[i] + 0.15, cy, colW - 0.3, 0.32, { fontSize: 11, bold: true, color: isPos ? C.white : C.sub, align: 'center', valign: 'middle' });
        cy += 0.42;
      }
      if (ttlEl) {
        addTxt(pSlide, txt(ttlEl), xs[i] + 0.15, cy, colW - 0.3, 0.4, { fontSize: 13, bold: true, color: C.text });
        cy += 0.45;
      }
      var itemH = Math.min((colH - (cy - y) - 0.15) / (items.length || 1), 0.44);
      items.forEach(function (item) {
        addTxt(pSlide, '✓  ' + txt(item), xs[i] + 0.15, cy, colW - 0.3, itemH, { fontSize: 11, color: isPos ? C.text : C.sub });
        cy += itemH;
      });
    });
  }

  /* ── プロンプトのみ ─────────────────────────────────────── */
  function renderPromptOnly(pSlide, pbEl, y0, avH, callout) {
    var calloutH = callout ? 0.42 : 0;
    var y = y0 + 0.05;
    if (callout) {
      renderCallout(pSlide, txt(callout), y, calloutH);
      y += calloutH + 0.1;
    }
    renderPromptBox(pSlide, txtBr(pbEl), y, avH - calloutH - 0.18);
  }

  function renderCalloutOnly(pSlide, callout, y0, avH) {
    renderCallout(pSlide, txt(callout), y0 + 0.05, Math.min(avH - 0.1, 0.55));
  }

  /* ── カラアウトボックス ─────────────────────────────────── */
  function renderCallout(pSlide, text, y, h) {
    addRect(pSlide, 0.38, y, 9.24, h, C.pale, C.line, 0.5, 0.04);
    addRect(pSlide, 0.38, y, 0.1,  h, C.green);
    addTxt(pSlide, text, 0.58, y + 0.06, 8.9, h - 0.12, { fontSize: 12, color: C.text });
  }

  /* ── プロンプトボックス ─────────────────────────────────── */
  function renderPromptBox(pSlide, text, y, h) {
    addRect(pSlide, 0.38, y, 9.24, h, C.codeBg, '444444', 0.5, 0.04);
    addRect(pSlide, 0.38, y, 0.15, h, C.green);
    addTxt(pSlide, text, 0.62, y + 0.1, 8.9, h - 0.2, { fontSize: 10, color: C.codeFg, fontFace: 'Courier New', lineSpacingMultiple: 1.4 });
  }

  /* ── メイン：テキストPPTX出力 ──────────────────────────── */
  function exportTextPptx() {
    if (typeof PptxGenJS === 'undefined') {
      alert('PptxGenJS が読み込まれていません');
      return;
    }

    var factories = window.slideFactories || [];
    var SLUG = window.SLIDE_SLUG || 'slides';

    if (factories.length === 0) {
      alert('スライドが見つかりません');
      return;
    }

    var pptx = new PptxGenJS();
    pptx.layout  = 'LAYOUT_16x9';  /* 10" × 5.625" — 座標系と一致させる */
    pptx.title   = document.title || SLUG;
    pptx.author  = '有限会社アートソウル';
    pptx.company = 'Artsoul';

    var parser = new DOMParser();

    factories.forEach(function (factory, idx) {
      var html = factory();
      var doc  = parser.parseFromString('<div>' + html + '</div>', 'text/html');
      var sec  = doc.querySelector('section');
      if (!sec) return;

      var pSlide = pptx.addSlide();

      /* プレゼンターノートを追加 */
      var notes = (sec.getAttribute('data-notes') || '').replace(/&#10;/g, '\n');
      if (notes) pSlide.addNotes(notes);

      if (sec.classList.contains('slide-cover'))   buildCover(pSlide, sec);
      else if (sec.classList.contains('slide-impact'))   buildImpact(pSlide, sec);
      else if (sec.classList.contains('slide-section'))  buildSection(pSlide, sec);
      else if (sec.classList.contains('slide-ending'))   buildEnding(pSlide, sec);
      else                                               buildContent(pSlide, sec);
    });

    pptx.writeFile({ fileName: SLUG + '_editable.pptx' });
  }

  /* ── グローバル公開 ─────────────────────────────────────── */
  window.exportTextPptx = exportTextPptx;

})();
