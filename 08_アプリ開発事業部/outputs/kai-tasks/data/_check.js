
mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose',
  mindmap: { padding: 16, curve: 'linear' } });
let mmdSeq = 0;

// ── MindMeister-style coloring via post-render DOM manipulation ──
// (Mermaid mindmap :::className is NOT supported — treated as literal text)
const _MM_P = ['#3b82f6','#10b981','#f97316','#8b5cf6','#ef4444','#06b6d4','#ec4899','#f59e0b'];

function applyMindmapColors(svgEl) {
  if (!svgEl || !svgEl.querySelector('.mindmap-node')) return;

  function paint(el, bg, txt) {
    // Shapes: rect, circle, ellipse, polygon
    el.querySelectorAll('rect, circle, ellipse, polygon').forEach(s => {
      s.style.setProperty('fill', bg, 'important');
      s.style.setProperty('stroke', bg, 'important');
    });
    // Paths: only those with an existing fill (node background paths, not edge-only paths)
    el.querySelectorAll('path').forEach(p => {
      const f = p.getAttribute('fill') || p.style.fill || '';
      if (f && f !== 'none') p.style.setProperty('fill', bg, 'important');
      p.style.setProperty('stroke', bg, 'important');
    });
    // Text
    el.querySelectorAll('text, tspan').forEach(t => t.style.setProperty('fill', txt, 'important'));
  }

  // Color each branch section (section-0 … section-7)
  for (let i = 0; i < 8; i++) {
    const els = svgEl.querySelectorAll(`.section-${i}`);
    if (!els.length) break;
    els.forEach(el => paint(el, _MM_P[i], '#fff'));
  }

  // Root node — paint last so it overrides any inherited section color
  const allNodes = Array.from(svgEl.querySelectorAll('.mindmap-node'));
  const rootEl = svgEl.querySelector('.mindmap-node--root')
    || allNodes.find(n => n.querySelector('circle, ellipse'));
  if (rootEl) paint(rootEl, '#1e293b', '#f8fafc');
}

const API = 'http://localhost:3456/api';
let state = { data: null, projectId: null, tab: 'tasks', globalTab: 'dashboard', searchQuery: '', _draggingId: null };

// ══════════════════════════════════════════════
//  SSE Live Sync
// ══════════════════════════════════════════════
function setupSSE() {
  let es;
  function connect() {
    try { es = new EventSource(`${API}/events`); } catch(e) { return; }
    es.onopen = () => {
      document.getElementById('liveDot').className = 'live-dot connected';
      document.getElementById('liveText').textContent = 'LIVE';
    };
    es.onmessage = async (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'update') {
          const lastUpdated = state.data?.last_updated;
          if (!lastUpdated || payload.ts > lastUpdated) {
            await loadData(true);
          }
        }
      } catch(_) {}
    };
    es.onerror = () => {
      document.getElementById('liveDot').className = 'live-dot error';
      document.getElementById('liveText').textContent = 'OFF';
      es.close();
      setTimeout(connect, 4000);
    };
  }
  connect();
}

// ══════════════════════════════════════════════
//  Data
// ══════════════════════════════════════════════
async function loadData(silent = false) {
  try {
    const r = await fetch(`${API}/tasks`);
    state.data = await r.json();
    renderSidebar();
    renderKaiFeed();
    if (state.projectId) {
      const p = state.data.projects.find(p => p.id === state.projectId);
      if (p) {
        if (!silent) renderProject(p);
        else         softRefreshProject(p);
      } else {
        showDashboard();
      }
    } else {
      showDashboard();
    }
  } catch(e) {
    if (!silent) toast('サーバーに接続できません。起動.bat を実行してください', 'err');
    document.getElementById('liveDot').className = 'live-dot error';
  }
}

function softRefreshProject(p) {
  // SSE triggered: re-render content without losing scroll position
  const detail = document.getElementById('projectDetail');
  if (detail.style.display === 'none') return;
  // Update progress bar
  const tasks = getAllTasks(p);
  const done = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  const fill = detail.querySelector('.progress-bar-fill');
  const label = detail.querySelector('.progress-bar-label span:last-child');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `${done} / ${tasks.length} タスク完了（${pct}%）`;
  // Re-render tab content
  const tabContent = document.getElementById('tabContent');
  if (tabContent) tabContent.innerHTML = renderTabContent(p);
}

// ══════════════════════════════════════════════
//  Sidebar
// ══════════════════════════════════════════════
function renderSidebar() {
  const el = document.getElementById('projectList');
  const q = state.searchQuery;
  let projects = state.data?.projects || [];

  if (q) {
    projects = projects
      .map(p => {
        const nameMatch = p.name.toLowerCase().includes(q) || (p.goal||'').toLowerCase().includes(q);
        const matchedTasks = getAllTasks(p).filter(t =>
          t.title.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q));
        return { ...p, _nameMatch: nameMatch, _matchedTasks: matchedTasks };
      })
      .filter(p => p._nameMatch || p._matchedTasks?.length > 0);
  }

  if (!projects.length) {
    el.innerHTML = `<div style="color:var(--text2);font-size:12px;padding:8px;">${q ? '一致なし' : 'プロジェクトなし'}</div>`;
    return;
  }

  el.innerHTML = projects.map(p => {
    const tasks = getAllTasks(p);
    const done = tasks.filter(t => t.status === 'done').length;
    const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    const matchInfo = q && p._matchedTasks?.length ? `<div class="proj-search-match">タスク ${p._matchedTasks.length} 件一致</div>` : '';
    return `<div class="project-item ${p.id === state.projectId ? 'active' : ''}" onclick="selectProject('${p.id}')">
      <div class="proj-name"><span class="proj-dot ${p.status}"></span>${esc(p.name)}</div>
      <div class="proj-meta">
        <span>${done}/${tasks.length}</span>
        <div class="proj-mini-bar"><div class="proj-mini-fill" style="width:${pct}%"></div></div>
        <span>${pct}%</span>
      </div>
      ${matchInfo}
    </div>`;
  }).join('');
}

function handleSearch(q) {
  state.searchQuery = q.toLowerCase().trim();
  document.getElementById('searchClear').style.display = q ? 'block' : 'none';
  renderSidebar();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  state.searchQuery = '';
  document.getElementById('searchClear').style.display = 'none';
  renderSidebar();
}

// ══════════════════════════════════════════════
//  Kai Feed (sidebar)
// ══════════════════════════════════════════════
let _lastFeedTs = '';

function renderKaiFeed() {
  const feed = document.getElementById('kaiFeed');
  const recent = getRecentHistory(5);
  if (!recent.length) {
    feed.innerHTML = '<div class="feed-empty">まだ更新なし</div>';
    return;
  }
  const newTs = recent[0]?.timestamp || '';
  const isNew = newTs !== _lastFeedTs;
  _lastFeedTs = newTs;

  feed.innerHTML = recent.map((h, i) => `
    <div class="feed-item ${i === 0 && isNew ? 'feed-new' : ''}" onclick="selectProject('${h.projectId}')">
      <div class="feed-project">${esc(h.projectName)}</div>
      <div class="feed-action">${esc(h.action)} — ${esc(h.detail.slice(0, 40))}${h.detail.length > 40 ? '…' : ''}</div>
      <div class="feed-time">${timeAgo(h.timestamp)}</div>
    </div>`).join('');
}

function getRecentHistory(n) {
  const all = [];
  for (const p of (state.data?.projects || [])) {
    for (const h of (p.history || []))
      all.push({ ...h, projectId: p.id, projectName: p.name });
    for (const t of getAllTasks(p))
      for (const h of (t.history || []))
        all.push({ ...h, projectId: p.id, projectName: p.name });
  }
  return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, n);
}

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'たった今';
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

// ══════════════════════════════════════════════
//  Dashboard
// ══════════════════════════════════════════════
async function showDashboard(tab) {
  state.projectId = null;
  if (tab) state.globalTab = tab;
  const ws = document.getElementById('welcomeScreen');
  ws.style.display = 'block';
  if (state.data) {
    if (state.globalTab === 'graph') {
      ws.innerHTML = await renderGraphView();
      setTimeout(() => renderGraphMmd(), 50);
    } else {
      ws.innerHTML = renderDashboard();
    }
  } else {
    ws.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:60vh;color:var(--text2);">読み込み中…</div>';
  }
  document.getElementById('projectDetail').style.display = 'none';
  renderSidebar();
}

function renderDashboard() {
  const projects = state.data?.projects || [];
  const today = new Date().toISOString().slice(0, 10);

  let total = 0, done = 0, inProg = 0, overdue = 0;
  const overdueList = [];

  for (const p of projects) {
    for (const t of getAllTasks(p)) {
      total++;
      if (t.status === 'done') done++;
      else if (t.status === 'in_progress') inProg++;
      if (t.due_date && t.due_date < today && t.status !== 'done') {
        overdue++;
        overdueList.push({ t, pName: p.name, pid: p.id });
      }
    }
  }

  const pct = total ? Math.round(done / total * 100) : 0;
  const active = projects.filter(p => p.status === 'active')
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const recent = getRecentHistory(8);

  // Pattern analysis
  const allPivots = projects.flatMap(p => p.pivots || []);
  const pivotTypes = { strategic: 0, technical: 0, scope: 0, conceptual: 0 };
  for (const pv of allPivots) { if (pv.type in pivotTypes) pivotTypes[pv.type]++; }
  const topPivotProject = [...projects].sort((a, b) => (b.pivots||[]).length - (a.pivots||[]).length)[0];

  return `
  <div class="dashboard">
    <div class="global-tab-bar">
      <button class="tab ${state.globalTab==='dashboard'?'active':''}" onclick="showDashboard('dashboard')">📊 ダッシュボード</button>
      <button class="tab ${state.globalTab==='graph'?'active':''}" onclick="showDashboard('graph')">🔗 グラフビュー</button>
    </div>
    <div class="dash-hero">
      <h1>📊 ダッシュボード</h1>
      <p>全プロジェクトの進行状況 — Claude Code リアルタイム連動 · 思考転換 ${allPivots.length} 件記録済み</p>
    </div>

    <div class="dash-stats">
      <div class="stat-card stat-card-blue stat-card-colored">
        <div class="stat-icon">📋</div>
        <div class="stat-num">${active.length}<span class="stat-sub"> / ${projects.length}</span></div>
        <div class="stat-label">進行中プロジェクト</div>
      </div>
      <div class="stat-card stat-card-amber stat-card-colored">
        <div class="stat-icon">⚙️</div>
        <div class="stat-num">${inProg}</div>
        <div class="stat-label">作業中タスク</div>
      </div>
      <div class="stat-card stat-card-green stat-card-colored">
        <div class="stat-icon">✅</div>
        <div class="stat-num">${done}<span class="stat-sub"> / ${total}</span></div>
        <div class="stat-label">完了タスク（${pct}%）</div>
      </div>
      <div class="stat-card stat-card-red stat-card-colored">
        <div class="stat-icon">${overdue > 0 ? '🔴' : '📅'}</div>
        <div class="stat-num">${overdue}</div>
        <div class="stat-label">期限切れタスク</div>
      </div>
    </div>

    <div class="dash-grid">
      <div>
        <div class="dash-panel">
          <div class="dash-panel-title">進行中プロジェクト</div>
          ${active.length ? active.map(p => {
            const ts = getAllTasks(p);
            const d = ts.filter(t => t.status === 'done').length;
            const pc = ts.length ? Math.round(d / ts.length * 100) : 0;
            const ip = ts.filter(t => t.status === 'in_progress').length;
            return `<div class="active-proj-item" onclick="selectProject('${p.id}')">
              <div class="active-proj-name">${esc(p.name)}</div>
              ${p.goal ? `<div class="active-proj-goal">${esc(p.goal.slice(0,52))}${p.goal.length>52?'…':''}</div>` : ''}
              <div class="active-proj-bar-row">
                <div class="active-proj-bar-wrap"><div class="active-proj-bar-fill" style="width:${pc}%"></div></div>
                <span class="active-proj-pct">${pc}%</span>
              </div>
              <div class="active-proj-counts">${d}/${ts.length}完了 ${ip>0?`· ${ip}作業中`:''}${ts.filter(t=>t.due_date&&t.due_date<today&&t.status!=='done').length>0?` · <span style="color:var(--red)">期限切れあり</span>`:''}</div>
            </div>`;
          }).join('') : '<div class="dash-empty">進行中のプロジェクトはありません<br><button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="openNewProjectModal()">＋ 新規作成</button></div>'}
        </div>
        ${overdueList.length ? `
        <div class="dash-panel" style="margin-top:14px;">
          <div class="dash-panel-title" style="color:var(--red)">⚠️ 期限切れタスク</div>
          ${overdueList.slice(0,5).map(({t,pName,pid}) => `
            <div class="dash-overdue-item" onclick="selectProject('${pid}')">
              <div><div class="overdue-task-name">${esc(t.title)}</div><div class="overdue-task-proj">${esc(pName)}</div></div>
              <span class="overdue-badge">📅 ${t.due_date}</span>
            </div>`).join('')}
          ${overdueList.length > 5 ? `<div style="font-size:11px;color:var(--text2);padding:4px;">他 ${overdueList.length-5} 件…</div>` : ''}
        </div>` : ''}
      </div>

      <div>
        <div class="dash-panel">
          <div class="dash-panel-title">Kai 更新履歴</div>
          ${recent.length ? recent.map(h => `
            <div class="dash-feed-item" onclick="selectProject('${h.projectId}')">
              <div class="dash-feed-project">${esc(h.projectName)}</div>
              <div class="dash-feed-action">${esc(h.action)} — ${esc(h.detail.slice(0,55))}${h.detail.length>55?'…':''}</div>
              <div class="dash-feed-time">${timeAgo(h.timestamp)} · ${h.timestamp.replace('T',' ')}</div>
            </div>`).join('') : '<div class="dash-empty">変更履歴なし</div>'}
        </div>
        ${allPivots.length > 0 ? `
        <div class="dash-panel" style="margin-top:14px;">
          <div class="dash-panel-title">🧠 パターン分析 — ピボット傾向</div>
          <div style="margin-bottom:10px;">
            ${[['strategic','方針転換',allPivots.filter(p=>p.type==='strategic').length,'#6c63ff'],
               ['technical','技術転換',allPivots.filter(p=>p.type==='technical').length,'#54a0ff'],
               ['scope','スコープ',allPivots.filter(p=>p.type==='scope').length,'#f9ca24'],
               ['conceptual','概念転換',allPivots.filter(p=>p.type==='conceptual').length,'#43e97b']]
              .map(([type,label,count,color]) => {
                const pct = allPivots.length ? Math.round(count/allPivots.length*100) : 0;
                return `<div class="pattern-item">
                  <span class="pattern-label">${label}</span>
                  <div class="pattern-bar-wrap"><div class="pattern-bar-fill" style="width:${pct}%;background:${color};"></div></div>
                  <span class="pattern-value" style="color:${color};">${count}</span>
                </div>`;
              }).join('')}
          </div>
          ${topPivotProject && (topPivotProject.pivots||[]).length > 0 ? `
          <div style="font-size:11px;color:var(--text2);padding-top:8px;border-top:1px solid var(--border);">
            最多ピボット: <span style="color:var(--text);font-weight:600;">${esc(topPivotProject.name)}</span>
            （${(topPivotProject.pivots||[]).length} 件）
          </div>` : ''}
        </div>` : ''}
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════
//  Graph View
// ══════════════════════════════════════════════
async function renderGraphView() {
  const projects = state.data?.projects || [];
  const tabBar = `
    <div class="global-tab-bar">
      <button class="tab" onclick="showDashboard('dashboard')">📊 ダッシュボード</button>
      <button class="tab active" onclick="showDashboard('graph')">🔗 グラフビュー</button>
    </div>`;

  if (!projects.length) {
    return tabBar + '<div class="graph-view"><p style="color:var(--text2)">プロジェクトなし</p></div>';
  }

  const idMap = {};
  projects.forEach((p, i) => { idMap[p.id] = `N${i}`; });

  let mmd = 'graph LR\n';
  for (const p of projects) {
    const nodeId = idMap[p.id];
    const label  = esc(p.name.slice(0, 18)) + (p.name.length > 18 ? '…' : '');
    const pcts   = (() => { const ts = getAllTasks(p); const d = ts.filter(t=>t.status==='done').length; return ts.length ? Math.round(d/ts.length*100) : 0; })();
    mmd += `  ${nodeId}(["${label}\\n${pcts}%"])\n`;
    for (const lid of (p.linked_projects || [])) {
      if (idMap[lid]) mmd += `  ${nodeId} --> ${idMap[lid]}\n`;
    }
  }
  // Colors by status
  for (const p of projects) {
    const nodeId = idMap[p.id];
    const fill   = p.status === 'active' ? '#6c63ff' : p.status === 'completed' ? '#43e97b' : '#444';
    const color  = p.status === 'completed' ? '#000' : '#fff';
    mmd += `  style ${nodeId} fill:${fill},color:${color},stroke:${fill}\n`;
  }

  const projCards = projects.map(p => {
    const links = (p.linked_projects||[]).map(lid => {
      const lp = projects.find(x => x.id === lid);
      return lp ? `<span class="graph-link-tag">→ ${esc(lp.name.slice(0,12))}</span>` : '';
    }).join('');
    const pvCount = (p.pivots||[]).length;
    return `<div class="graph-proj-card" onclick="selectProject('${p.id}')">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span class="proj-dot ${p.status}" style="flex-shrink:0;"></span>
        <div class="graph-proj-card-name">${esc(p.name)}</div>
      </div>
      <div class="graph-proj-card-meta">
        ${pvCount > 0 ? `🔄 ピボット ${pvCount} 件 &nbsp;` : ''}
        ${links || '<span style="color:var(--border);font-size:10px;">リンクなし</span>'}
      </div>
    </div>`;
  }).join('');

  return tabBar + `
  <div class="graph-view">
    <h1>🔗 プロジェクトグラフ</h1>
    <p class="graph-desc">プロジェクト間の関係と思考の転換点を可視化。ノードをクリックしてプロジェクトを開く。</p>
    <div class="graph-legend">
      <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#6c63ff;"></div>進行中</div>
      <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#43e97b;"></div>完了</div>
      <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#444;"></div>アーカイブ</div>
    </div>
    <div class="graph-mmd-wrap" id="graphMmdWrap">
      <div style="color:var(--text2);font-size:12px;">レンダリング中…</div>
    </div>
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text2);margin-bottom:10px;">プロジェクト一覧</div>
    <div class="graph-proj-grid">${projCards}</div>
  </div>`;
}

async function renderGraphMmd() {
  const ws = document.getElementById('welcomeScreen');
  if (!ws || state.projectId) return;
  const wrap = document.getElementById('graphMmdWrap');
  if (!wrap) return;
  const projects = state.data?.projects || [];
  const idMap = {};
  projects.forEach((p, i) => { idMap[p.id] = `N${i}`; });

  let mmd = 'graph LR\n';
  for (const p of projects) {
    const nodeId = idMap[p.id];
    const label  = p.name.slice(0, 18) + (p.name.length > 18 ? '…' : '');
    const pcts   = (() => { const ts = getAllTasks(p); const d = ts.filter(t=>t.status==='done').length; return ts.length ? Math.round(d/ts.length*100) : 0; })();
    mmd += `  ${nodeId}(["${label}\\n${pcts}%"])\n`;
    for (const lid of (p.linked_projects || [])) {
      if (idMap[lid]) mmd += `  ${nodeId} --> ${idMap[lid]}\n`;
    }
  }
  for (const p of projects) {
    const nodeId = idMap[p.id];
    const fill   = p.status === 'active' ? '#6c63ff' : p.status === 'completed' ? '#43e97b' : '#444';
    const color  = p.status === 'completed' ? '#000' : '#fff';
    mmd += `  style ${nodeId} fill:${fill},color:${color},stroke:${fill}\n`;
  }

  try {
    const id = `graph-${++mmdSeq}`;
    const { svg } = await mermaid.render(id, mmd);
    wrap.innerHTML = svg;
    wrap.querySelector('svg')?.setAttribute('style', 'max-width:100%;height:auto;');
  } catch(e) {
    wrap.innerHTML = `<div class="mmd-error">グラフ描画エラー: ${e.message || e}</div>`;
  }
}

// ══════════════════════════════════════════════
//  Project select / render
// ══════════════════════════════════════════════
function selectProject(id) {
  state.projectId = id; state.tab = 'tasks';
  const p = state.data.projects.find(p => p.id === id);
  if (p) renderProject(p);
  renderSidebar();
}

function getAllTasks(p) {
  const ts = [];
  if (p.big_task) ts.push(p.big_task);
  ts.push(...(p.medium_tasks || []));
  ts.push(...(p.small_tasks || []));
  return ts;
}

function renderProject(p) {
  document.getElementById('welcomeScreen').style.display = 'none';
  const el = document.getElementById('projectDetail');
  el.style.display = 'block';
  const tasks = getAllTasks(p);
  const done = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  el.innerHTML = `
    <div class="main-header">
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;">
        <h1>${esc(p.name)}</h1>
        <span class="status-badge ${p.status}">${statusLabel(p.status)}</span>
      </div>
      ${p.goal ? `<div class="goal-text">🎯 ${esc(p.goal)}</div>` : ''}
      <div class="progress-bar-wrap">
        <div class="progress-bar-label"><span>進捗</span><span>${done} / ${tasks.length} タスク完了（${pct}%）</span></div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" style="color:var(--green);border-color:var(--green);" onclick="openResumeModal('${p.id}')">▶ 再開</button>
        <button class="btn btn-recommend btn-sm" onclick="openRecommendModal('${p.id}')">💡 推奨タスク</button>
        <button class="btn btn-ghost btn-sm" onclick="openEditProjectModal('${p.id}')">✏️ 編集</button>
        ${p.status !== 'completed' ? `<button class="btn btn-success btn-sm" onclick="markProjectDone('${p.id}')">✅ 完了</button>` : ''}
        ${p.status !== 'archived' ? `<button class="btn btn-ghost btn-sm" onclick="archiveProject('${p.id}')">📁 アーカイブ</button>` : ''}
        <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')">🗑️ 削除</button>
      </div>
    </div>
    <div class="tabs">
      <button class="tab ${state.tab==='tasks'?'active':''}" onclick="switchTab('tasks','${p.id}')">タスク</button>
      <button class="tab ${state.tab==='kanban'?'active':''}" onclick="switchTab('kanban','${p.id}')">カンバン</button>
      <button class="tab ${state.tab==='pivots'?'active':''}" onclick="switchTab('pivots','${p.id}')">🔀 フロー${(p.pivots||[]).length>0?` <span style="font-size:10px;background:var(--accent);color:#fff;border-radius:99px;padding:1px 6px;margin-left:3px;">${(p.pivots||[]).length}</span>`:''}</button>
      <button class="tab ${state.tab==='logs'?'active':''}" onclick="switchTab('logs','${p.id}')">📋 活動ログ${(p.session_logs||[]).length>0?` <span style="font-size:10px;background:var(--med);color:#fff;border-radius:99px;padding:1px 6px;margin-left:3px;">${(p.session_logs||[]).length}</span>`:''}</button>
      <button class="tab ${state.tab==='history'?'active':''}" onclick="switchTab('history','${p.id}')">履歴</button>
      <button class="tab ${state.tab==='memo'?'active':''}" onclick="switchTab('memo','${p.id}')">メモ</button>
      <button class="tab ${state.tab==='timemachine'?'active':''}" onclick="switchTab('timemachine','${p.id}')">⏰ タイムマシン${(p.snapshots||[]).length>0?` <span style="font-size:10px;background:var(--text2);color:#fff;border-radius:99px;padding:1px 6px;margin-left:3px;">${(p.snapshots||[]).length}</span>`:''}</button>
    </div>
    <div id="tabContent">${renderTabContent(p)}</div>`;
  if (state.tab === 'pivots') {
    setTimeout(() => { renderPivotDiagram(p); renderPivotCompare(p); }, 80);
  }
}

function switchTab(tab, pid) {
  state.tab = tab;
  const p = state.data.projects.find(p => p.id === pid);
  renderProject(p);
}

function renderTabContent(p) {
  if (state.tab === 'kanban')      return renderKanban(p);
  if (state.tab === 'history')     return renderHistory(p);
  if (state.tab === 'memo')        return renderMemo(p);
  if (state.tab === 'pivots')      return renderPivots(p);
  if (state.tab === 'logs')        return renderActivityLog(p);
  if (state.tab === 'timemachine') return renderTimeMachine(p);
  return renderTasks(p);
}

// ══════════════════════════════════════════════
//  Tasks (list view)
// ══════════════════════════════════════════════
function renderTasks(p) {
  const bigHtml = p.big_task
    ? taskCard(p.big_task, 'big', p.id)
    : `<div class="task-empty" onclick="openAddTaskModal('${p.id}','big')">＋ 大タスクを追加（Must do）</div>`;

  const med = p.medium_tasks || [];
  const medHtml = med.map(t => taskCard(t, 'med', p.id)).join('') +
    (med.length < 3 ? `<div class="task-empty" onclick="openAddTaskModal('${p.id}','medium')">＋ 中タスクを追加（${med.length}/3）</div>` : '');

  const sm = p.small_tasks || [];
  const smHtml = sm.map(t => taskCard(t, 'small', p.id)).join('') +
    (sm.length < 5 ? `<div class="task-empty" onclick="openAddTaskModal('${p.id}','small')">＋ 小タスクを追加（${sm.length}/5）</div>` : '');

  return `
    <div class="task-section">
      <div class="task-section-header">
        <div class="task-section-title">
          <div class="task-badge big">1</div>
          <div><div class="task-section-name">大タスク（Must do）</div><div class="task-count">プロジェクト全体のゴール</div></div>
        </div>
      </div>
      <div class="task-cards">${bigHtml}</div>
    </div>
    <div class="section-divider"></div>
    <div class="task-section">
      <div class="task-section-header">
        <div class="task-section-title">
          <div class="task-badge med">3</div>
          <div><div class="task-section-name">中タスク（Should do）</div><div class="task-count">大タスクを支える重要タスク（最大3つ）</div></div>
        </div>
      </div>
      <div class="task-cards">${medHtml}</div>
    </div>
    <div class="section-divider"></div>
    <div class="task-section">
      <div class="task-section-header">
        <div class="task-section-title">
          <div class="task-badge small">5</div>
          <div><div class="task-section-name">小タスク（Nice to do）</div><div class="task-count">細かいアクション（最大5つ）</div></div>
        </div>
      </div>
      <div class="task-cards">${smHtml}</div>
    </div>`;
}

function taskCard(t, sizeClass, pid) {
  const isDone = t.status === 'done';
  const due = t.due_date ? `📅 ${t.due_date}${isOverdue(t.due_date) && !isDone ? ' ⚠️' : ''}` : '';
  const links = t.related_links || [];
  const hasMmd = !!(t.mindmap_mmd);
  const hasRm  = !!(t.roadmap_mmd);
  const fileCount = (t.output_files || []).length;
  const missingFiles = (t.output_files || []).filter(f => f.status === 'missing').length;
  const linksHtml = links.length
    ? `<div class="task-links">${links.slice(0,3).map(l =>
        `<a class="task-link-item" href="${esc(l.url)}" target="_blank" rel="noopener">
          <span class="task-link-icon">🔗</span>
          <div class="task-link-info">
            <div class="task-link-title">${esc(l.title||l.url)}</div>
            ${l.description ? `<div class="task-link-desc">${esc(l.description)}</div>` : ''}
          </div></a>`).join('')}
        ${links.length > 3 ? `<div style="font-size:11px;color:var(--text2);padding:2px 8px;">他 ${links.length-3} 件…</div>` : ''}
      </div>` : '';

  return `
    <div class="task-card ${sizeClass} ${isDone ? 'done' : ''}">
      <div class="task-card-top">
        <div class="task-checkbox ${t.status}" onclick="cycleStatus('${t.id}')">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="task-info">
          <div class="task-title task-title-link" onclick="openTaskDashboard('${t.id}')">${esc(t.title)}</div>
          ${t.description ? `<div class="task-desc">${esc(t.description)}</div>` : ''}
          <div class="task-meta">
            <span class="task-status-pill ${t.status}">${taskStatusLabel(t.status)}</span>
            ${due ? `<span class="task-due ${isOverdue(t.due_date)&&!isDone?'overdue':''}">${due}</span>` : ''}
            ${hasMmd ? `<span style="font-size:10px;color:#a29bfe;">🧠 あり</span>` : ''}
            ${hasRm  ? `<span style="font-size:10px;color:var(--med);">🗺️ あり</span>` : ''}
            ${fileCount > 0 ? '<span style="font-size:10px;color:'+(missingFiles>0?'var(--red)':'var(--green)')+';">📦'+(missingFiles>0?' ⚠️'+missingFiles+'件消失':' '+fileCount+'件')+'</span>' : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-btn mindmap ${hasMmd?'has-badge':''}" ${hasMmd?'data-count="1"':''} onclick="openMindmapModal('${t.id}')" title="マインドマップ">🧠</button>
          <button class="icon-btn roadmap ${hasRm?'has-badge':''}" ${hasRm?'data-count="1"':''} onclick="openRoadmapModal('${t.id}')" title="ロードマップ">🗺️</button>
          <button class="icon-btn links ${links.length?'has-badge':''}" ${links.length?`data-count="${links.length}"`:''} onclick="openLinksModal('${t.id}')" title="関連リンク">🔗</button>
          <button class="icon-btn" onclick="openEditTaskModal('${t.id}')" title="編集">✏️</button>
          <button class="icon-btn del" onclick="deleteTask('${t.id}')" title="削除">🗑</button>
          ${!isDone ? `<button class="icon-btn btn-ai" onclick="openDecomposeModal('${t.id}')" title="タスクを分解">✂️</button>` : ''}
        </div>
      </div>
      ${linksHtml}
    </div>`;
}

// ══════════════════════════════════════════════
//  Kanban
// ══════════════════════════════════════════════
function renderKanban(p) {
  const all = [];
  if (p.big_task) all.push({ ...p.big_task, _type: 'big' });
  (p.medium_tasks||[]).forEach(t => all.push({ ...t, _type: 'med' }));
  (p.small_tasks||[]).forEach(t => all.push({ ...t, _type: 'small' }));

  const cols = [
    { status: 'todo',        label: '未着手',   cls: 'todo' },
    { status: 'in_progress', label: '進行中',   cls: 'in_progress' },
    { status: 'done',        label: '完了',     cls: 'done' },
  ];

  return `<div class="kanban">${cols.map(col => {
    const cards = all.filter(t => t.status === col.status);
    return `<div class="kanban-col"
        ondragover="event.preventDefault();this.classList.add('drag-over')"
        ondragleave="this.classList.remove('drag-over')"
        ondrop="onKanbanDrop(event,'${col.status}')">
      <div class="kanban-col-header">
        <span class="kanban-col-title ${col.cls}">${col.label}</span>
        <span class="kanban-count">${cards.length}</span>
      </div>
      <div class="kanban-cards">
        ${cards.map(t => kanbanCard(t)).join('') ||
          `<div class="kanban-empty">${col.status === 'in_progress' ? 'ここにドロップ' : '—'}</div>`}
      </div>
    </div>`;
  }).join('')}</div>`;
}

function kanbanCard(t) {
  const isDone = t.status === 'done';
  const due = t.due_date ? `📅 ${t.due_date}${isOverdue(t.due_date)&&!isDone?' ⚠️':''}` : '';
  const typeLabel = { big: '★ 大', med: '◆ 中', small: '◇ 小' }[t._type];
  return `
    <div class="kanban-card ${t._type} ${isDone?'done':''}"
         draggable="true"
         ondragstart="onKanbanDragStart(event,'${t.id}','${t.status}')"
         ondragend="this.classList.remove('dragging')">
      <div class="kanban-card-header">
        <span class="kanban-card-type ${t._type}">${typeLabel}</span>
        <div class="kanban-card-actions">
          <button class="icon-btn btn-sm" style="width:24px;height:24px;font-size:11px;" onclick="openEditTaskModal('${t.id}')" title="編集">✏️</button>
        </div>
      </div>
      <div class="kanban-card-title ${isDone?'done':''} task-title-link" onclick="openTaskDashboard('${t.id}')">${esc(t.title)}</div>
      ${due ? `<div class="kanban-card-due ${isOverdue(t.due_date)&&!isDone?'overdue':''}">${due}</div>` : ''}
      <div class="kanban-card-footer">
        <div class="task-checkbox ${t.status}" onclick="cycleStatus('${t.id}')" style="width:18px;height:18px;border-radius:5px;">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span style="font-size:10px;color:var(--text2);">${taskStatusLabel(t.status)}</span>
      </div>
    </div>`;
}

function onKanbanDragStart(e, taskId, status) {
  e.dataTransfer.setData('text/plain', JSON.stringify({ taskId, status }));
  e.dataTransfer.effectAllowed = 'move';
  state._draggingId = taskId;
  setTimeout(() => e.target.classList.add('dragging'), 0);
}

async function onKanbanDrop(e, toStatus) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  let data;
  try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch(_) { return; }
  if (!data.taskId || data.status === toStatus) return;
  captureSnapshotForTask(data.taskId, 'カンバン移動');
  await api('PUT', `/tasks/${data.taskId}`, { status: toStatus });
  await loadData(true);
  const p = state.data?.projects.find(p => p.id === state.projectId);
  if (p) {
    const tc = document.getElementById('tabContent');
    if (tc) tc.innerHTML = renderKanban(p);
  }
  toast(`→ ${taskStatusLabel(toStatus)}に移動しました`, 'ok');
}

// ══════════════════════════════════════════════
//  Unified Diagram Modal (マインドマップ / ロードマップ / ガント / フロー)
// ══════════════════════════════════════════════
let _diagCtx = { taskId: null, tab: 'roadmap' };

const DIAG_TABS = {
  mindmap: { label: '🧠 マインドマップ', field: 'mindmap_mmd', showAI: false, templates: [] },
  roadmap: { label: '🗺️ ロードマップ',  field: 'roadmap_mmd', showAI: true,
    templates: [['🌿 WBS分解','wbs']] },
  gantt:   { label: '📅 ガント',         field: 'gantt_mmd',   showAI: true,
    templates: [['📅 デフォルト','gantt']] },
  flow:    { label: '🔀 フロー',         field: 'flow_mmd',    showAI: true,
    templates: [['🔀 状態フロー','flow']] },
};

const DIAG_TEMPLATE_CODES = {
  wbs:   `graph TD\n  A(["🎯 ゴール設定"]) --> B["📋 計画"]\n  B --> C["⚙️ 実行"]\n  C --> D(["✅ 完了"])\n\n  B --> B1["要件整理"]\n  B --> B2["リソース確認"]\n  B --> B3["スケジュール確定"]\n\n  C --> C1["フェーズ1"]\n  C --> C2["フェーズ2"]\n  C --> C3["フェーズ3"]\n\n  style A fill:#6c63ff,color:#fff\n  style D fill:#43e97b,color:#000`,
  td:    `graph TD\n  A(["🎯 ゴール"]) --> B["📋 計画"]\n  B --> C["⚙️ 実行"]\n  C --> D(["✅ 完了"])\n\n  style A fill:#6c63ff,color:#fff\n  style D fill:#43e97b,color:#000`,
  gantt: `gantt\n  title ロードマップ\n  dateFormat YYYY-MM-DD\n  section 計画\n    要件整理         :a1, 2026-06-01, 7d\n    スケジュール確定  :a2, after a1, 3d\n  section 実行\n    フェーズ1        :b1, after a2, 14d\n    フェーズ2        :b2, after b1, 14d\n  section 完了\n    テスト・レビュー  :c1, after b2, 7d\n    振り返り         :c2, after c1, 3d`,
  flow:  `stateDiagram-v2\n  [*] --> Todo\n  Todo --> Doing : 開始\n  Doing --> Review : 完成\n  Review --> Done : 承認\n  Review --> Doing : 差し戻し\n  Done --> [*]\n\n  Todo : 未着手\n  Doing : 進行中\n  Review : レビュー中\n  Done : 完了`,
};

function _diagDefaultCode(tab, title) {
  if (tab === 'mindmap') return `mindmap\n  root(("${title.slice(0,26)}"))\n    計画フェーズ\n      要件整理\n      スケジュール確定\n      関係者調整\n    実行フェーズ\n      フェーズ1\n      フェーズ2\n      フェーズ3\n    完了・検証\n      テスト\n      レビュー\n      振り返り`;
  if (tab === 'roadmap') return `graph TD\n  A(["🎯 ${title.slice(0,20)}"]) --> B["📋 計画フェーズ"]\n  B --> C["⚙️ 実行フェーズ"]\n  C --> D(["✅ 完了・定着"])\n\n  style A fill:#6c63ff,color:#fff,stroke:#6c63ff\n  style D fill:#43e97b,color:#000,stroke:#43e97b`;
  if (tab === 'gantt')   return DIAG_TEMPLATE_CODES.gantt;
  if (tab === 'flow')    return DIAG_TEMPLATE_CODES.flow;
  return '';
}

function openDiagramModal(taskId, activeTab = 'roadmap') {
  _diagCtx = { taskId, tab: activeTab };
  const t = findTask(taskId);
  const titleEsc = esc(t.title);
  const tabBarHtml = Object.entries(DIAG_TABS).map(([key, info]) =>
    `<button class="diag-tab ${key === activeTab ? 'active' : ''}" onclick="switchDiagTab('${key}')">${info.label}</button>`
  ).join('');

  document.getElementById('wideContent').innerHTML = `
    <div class="wide-header">
      <div class="wide-header-left">
        <h2 id="diagTitle">${DIAG_TABS[activeTab].label} — ${titleEsc}</h2>
        <div class="diag-tab-bar">${tabBarHtml}</div>
      </div>
      <div class="wide-header-right">
        <button class="btn-tmpl" onclick="openMmdPopupFromPreview('diagPreview','${titleEsc}')">🔍 拡大表示</button>
      </div>
    </div>
    <div class="wide-body wide-body-3col" id="diagBody">
      <div class="ai-panel" id="diagAiPanel">
        <div class="ai-panel-section">✨ AIに指示して生成</div>
        <textarea class="ai-textarea" id="aiInstruction"
          placeholder="例：&#10;フェーズを5段階にして&#10;各ステップに期間を追加して&#10;英語ラベルを日本語にして"
          onfocus="openAiFocus('aiInstruction','✨ AIへの指示')"></textarea>
        <button class="btn-ai btn-ai-apply" id="diagGroqBtn" onclick="diagGroqGenerate()">✨ 生成して適用</button>
      </div>
      <div class="wide-editor">
        <div class="wide-editor-label">Mermaid コード</div>
        <textarea class="mmd-editor" id="diagEditor" spellcheck="false" oninput="previewMmd('diagEditor','diagPreview')"></textarea>
      </div>
      <div class="wide-preview">
        <div class="wide-preview-label">プレビュー（リアルタイム） <span style="font-size:9px;color:var(--text2);">クリックで拡大</span></div>
        <div class="mmd-preview" id="diagPreview" onclick="openMmdPopupFromPreview('diagPreview','${titleEsc}')"></div>
      </div>
    </div>
    <div class="wide-footer">
      <div class="wide-footer-left" id="diagTemplateBtns"></div>
      <div class="wide-footer-right">
        <button class="btn btn-ghost btn-sm" onclick="closeWide()">✕ 閉じる</button>
        <button class="btn btn-primary btn-sm" onclick="saveDiagram()">💾 保存</button>
      </div>
    </div>`;
  document.getElementById('wideOverlay').style.display = 'flex';
  _applyDiagTab(activeTab);
}

function _applyDiagTab(tab) {
  const t = findTask(_diagCtx.taskId);
  const info = DIAG_TABS[tab];
  // title
  const titleEl = document.getElementById('diagTitle');
  if (titleEl) titleEl.textContent = `${info.label} — ${t.title}`;
  // tab active class
  document.querySelectorAll('.diag-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick') === `switchDiagTab('${tab}')`);
  });
  // AI panel visibility
  const aiPanel = document.getElementById('diagAiPanel');
  const body    = document.getElementById('diagBody');
  if (aiPanel && body) {
    aiPanel.style.display = info.showAI ? '' : 'none';
    body.className = `wide-body ${info.showAI ? 'wide-body-3col' : 'wide-body-2col'}`;
  }
  // editor content
  const code = (t[info.field] || '').trim() || _diagDefaultCode(tab, t.title);
  const editor = document.getElementById('diagEditor');
  if (editor) { editor.value = code; previewMmd('diagEditor', 'diagPreview'); }
  // templates
  const tmplEl = document.getElementById('diagTemplateBtns');
  if (tmplEl) {
    if (info.templates.length) {
      tmplEl.innerHTML = `<span class="tmpl-label">テンプレート：</span>` +
        info.templates.map(([lbl, key]) => `<button class="btn-tmpl" onclick="insertDiagTemplate('${key}')">${lbl}</button>`).join('');
    } else {
      tmplEl.innerHTML = `<span class="tmpl-label">💡 Kaiに指示して生成 → 返答を貼り付け → コードに適用</span>`;
    }
  }
}

function switchDiagTab(tab) {
  _diagCtx.tab = tab;
  _applyDiagTab(tab);
}

function insertDiagTemplate(key) {
  const code = DIAG_TEMPLATE_CODES[key];
  if (!code) return;
  const editor = document.getElementById('diagEditor');
  if (editor) { editor.value = code; previewMmd('diagEditor', 'diagPreview'); }
}

async function saveDiagram() {
  const editor = document.getElementById('diagEditor');
  const code = editor?.value?.trim();
  if (!code) { toast('コードが空です', 'err'); return; }
  const info = DIAG_TABS[_diagCtx.tab];
  captureSnapshotForTask(_diagCtx.taskId, `${info.label}保存`);
  await api('PUT', `/tasks/${_diagCtx.taskId}`, { [info.field]: code });
  await loadData(true);
  const p = state.data?.projects.find(x => x.id === state.projectId);
  if (p) renderProject(p);
  toast(`${info.label}を保存しました ✓`, 'ok');
}

// 後方互換：既存の呼び出し元を統合モーダルへリダイレクト
function openMindmapModal(taskId) { openDiagramModal(taskId, 'mindmap'); }
function openRoadmapModal(taskId)  { openDiagramModal(taskId, 'roadmap'); }

function defaultMindmapCode(title) { return _diagDefaultCode('mindmap', title); }
function defaultRoadmapCode(title) { return _diagDefaultCode('roadmap', title); }

function insertTemplate(type) {
  const map = { 'roadmap-flow': 'wbs', 'roadmap-gantt': 'gantt', 'roadmap-status': 'flow' };
  insertDiagTemplate(map[type] || type);
}

function openA4Preview(previewId, title, autoPrint = false) {
  const svgEl = document.getElementById(previewId)?.querySelector('svg');
  if (!svgEl) { toast('先にプレビューを表示してから拡大してください', 'err'); return; }
  const clone = svgEl.cloneNode(true);
  clone.removeAttribute('style');
  clone.style.cssText = 'max-width:100%;height:auto;';
  const safeTitle = (title||'').replace(/[<>"&]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;'}[c]));
  const win = window.open('', '_blank', 'width=1280,height=900,menubar=no,toolbar=no');
  if (!win) { toast('ポップアップがブロックされています', 'err'); return; }
  win.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>${safeTitle}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#e8e8e8;font-family:'Segoe UI',sans-serif}
.toolbar{display:flex;align-items:center;gap:10px;padding:10px 20px;background:#1a1a24;color:#e8e8f0;position:sticky;top:0;z-index:10}
.toolbar-title{font-size:14px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tbtn{padding:6px 16px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:600}
.tbtn-print{background:#6c63ff;color:#fff}.tbtn-print:hover{background:#5a52e8}
.tbtn-close{background:transparent;color:#8888aa;border:1px solid #2e2e40}.tbtn-close:hover{background:#22222f;color:#e8e8f0}
.page-wrap{display:flex;align-items:flex-start;justify-content:center;padding:24px;min-height:calc(100vh - 52px)}
.a4-page{width:297mm;min-height:210mm;background:#fff;padding:14mm 16mm;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,0,0,.25)}
.a4-page svg{max-width:100%;height:auto;display:block}
@media print{body{background:white}.toolbar{display:none!important}.page-wrap{padding:0;min-height:0}
.a4-page{margin:0;width:100%;min-height:0;box-shadow:none;padding:8mm}@page{size:A4 landscape;margin:0}}</style>
</head><body>
<div class="toolbar"><span class="toolbar-title">🗺️ ${safeTitle}</span>
<button class="tbtn tbtn-print" onclick="window.print()">🖨️ PDF出力 / 印刷</button>
<button class="tbtn tbtn-close" onclick="window.close()">✕ 閉じる</button></div>
<div class="page-wrap"><div class="a4-page">${clone.outerHTML}</div></div></body></html>`);
  win.document.close();
  if (autoPrint) win.addEventListener('load', () => setTimeout(() => win.print(), 300));
}

async function diagGroqGenerate() {
  const instruction = document.getElementById('aiInstruction')?.value?.trim();
  if (!instruction) { toast('指示を入力してください', 'err'); return; }
  const currentCode = document.getElementById('diagEditor')?.value?.trim() || '';
  const task = findTask(_diagCtx.taskId);
  const btn = document.getElementById('diagGroqBtn');
  if (btn) { btn.textContent = '⏳ 生成中…'; btn.disabled = true; }
  try {
    const res = await fetch('/api/ai/diagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction,
        current_code: currentCode,
        diagram_type: _diagCtx.tab,
        task_title: task?.title || '',
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    const editor = document.getElementById('diagEditor');
    if (editor && json.code) {
      editor.value = json.code;
      previewMmd('diagEditor', 'diagPreview');
      document.getElementById('aiInstruction').value = '';
      toast('✨ AIが生成しました。内容を確認して保存してください', 'ok');
    }
  } catch (e) {
    toast(`生成エラー：${e.message}`, 'err');
  } finally {
    if (btn) { btn.textContent = '✨ 生成して適用'; btn.disabled = false; }
  }
}

function copyAiPrompt(editorId) {
  const code = document.getElementById(editorId)?.value?.trim() || '';
  const instruction = document.getElementById('aiInstruction')?.value?.trim();
  if (!instruction) { toast('Kaiへの指示を入力してください', 'err'); return; }
  const prompt = `以下のMermaidダイアグラムを「${instruction}」に従って改修してください。\n改修後のMermaidコードのみを \`\`\`mermaid\n...\n\`\`\` 形式で返してください。\n\n現在のコード:\n\`\`\`mermaid\n${code}\n\`\`\``;
  const fallback = () => { const tmp = document.createElement('textarea'); tmp.value = prompt; document.body.appendChild(tmp); tmp.select(); document.execCommand('copy'); document.body.removeChild(tmp); };
  if (navigator.clipboard) navigator.clipboard.writeText(prompt).then(() => {}, fallback);
  else fallback();
  toast('プロンプトをコピーしました。Kaiのチャットに貼り付けてください', 'ok');
}

function applyAiCode(editorId, previewId) {
  const response = document.getElementById('aiResponse')?.value?.trim();
  if (!response) { toast('Kaiの返答を貼り付けてください', 'err'); return; }
  const match = response.match(/```(?:mermaid)?\s*\n?([\s\S]+?)```/);
  if (!match) { toast('Mermaidコードブロックが見つかりません', 'err'); return; }
  const editor = document.getElementById(editorId);
  if (editor) { editor.value = match[1].trim(); previewMmd(editorId, previewId); document.getElementById('aiResponse').value = ''; toast('✨ Kaiのコードを適用しました', 'ok'); }
}

function defaultRoadmapCode(title) {
  return `graph TD\n  A(["🎯 ${title}"]) --> B[計画]\n  B --> C[実行]\n  C --> D(["✅ 完了"])\n\n  B --> B1[要件整理]\n  B --> B2[スケジュール]\n  C --> C1[フェーズ1]\n  C --> C2[フェーズ2]\n\n  style A fill:#6c63ff,color:#fff\n  style D fill:#43e97b,color:#000`;
}

let previewDebounce = null;
function previewMmd(editorId, previewId) {
  clearTimeout(previewDebounce);
  previewDebounce = setTimeout(async () => {
    const code = document.getElementById(editorId)?.value?.trim();
    const container = document.getElementById(previewId);
    if (!code || !container) return;
    try {
      const id = `mmd-${++mmdSeq}`;
      const { svg } = await mermaid.render(id, code);
      container.innerHTML = svg + '<div class="mmd-preview-hint">クリックで拡大</div>';
      const svgEl = container.querySelector('svg');
      if (svgEl) {
        const w = svgEl.getAttribute('width');
        const h = svgEl.getAttribute('height');
        if (w && h && !svgEl.getAttribute('viewBox')) {
          svgEl.setAttribute('viewBox', `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
        }
        svgEl.setAttribute('style', 'max-width:100%;max-height:100%;width:auto;height:auto;display:block;');
        if (code.trim().startsWith('mindmap')) applyMindmapColors(svgEl);
      }
    } catch(e) {
      container.innerHTML = `<div class="mmd-error">構文エラー:\n${e.message || e}</div>`;
    }
  }, 400);
}

// ══════════════════════════════════════════════
//  Links modal
// ══════════════════════════════════════════════
function openLinksModal(taskId) {
  const t = findTask(taskId);
  renderLinksModal(taskId, t.related_links || []);
  document.getElementById('linksOverlay').style.display = 'flex';
}

function renderLinksModal(taskId, links) {
  const listHtml = links.length
    ? links.map((l, i) => `
      <div class="link-card">
        <div class="link-card-body">
          <a class="link-card-title" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title||l.url)}</a>
          <div class="link-card-url">${esc(l.url)}</div>
          ${l.description ? `<div class="link-card-desc">${esc(l.description)}</div>` : ''}
        </div>
        <button class="icon-btn del btn-sm" onclick="removeLink('${taskId}',${i})" title="削除">🗑</button>
      </div>`).join('')
    : '<div class="link-empty">関連リンクはまだありません</div>';

  document.getElementById('linksContent').innerHTML = `
    <h2 style="font-size:17px;font-weight:700;margin-bottom:16px;">🔗 関連リンク — <span style="color:var(--text2);font-size:13px;">${esc(findTask(taskId).title)}</span></h2>
    <div class="link-add-form">
      <h4>新しいリンクを追加</h4>
      <div class="form-group" style="margin-bottom:8px;"><label>タイトル</label><input id="l-title" placeholder="例：コーデ就労支援_要件定義" /></div>
      <div class="form-group" style="margin-bottom:8px;"><label>URL</label><input id="l-url" placeholder="https://..." type="url" /></div>
      <div class="form-group" style="margin-bottom:10px;"><label>概要</label><textarea id="l-desc" placeholder="この業務との関連など" style="min-height:48px;"></textarea></div>
      <button class="btn btn-primary btn-sm" onclick="addLink('${taskId}')">＋ 追加</button>
    </div>
    <div class="link-list-label">登録済み（${links.length}件）</div>
    <div id="linkList">${listHtml}</div>
    <div class="modal-actions" style="margin-top:14px;">
      <button class="btn btn-ghost" onclick="closeLinks()">閉じる</button>
    </div>`;
}

async function addLink(taskId) {
  const title = document.getElementById('l-title').value.trim();
  const url   = document.getElementById('l-url').value.trim();
  const desc  = document.getElementById('l-desc').value.trim();
  if (!url) { toast('URLを入力してください', 'err'); return; }
  const t = findTask(taskId);
  const links = [...(t.related_links||[]), { title: title||url, url, description: desc }];
  captureSnapshotForTask(taskId, 'リンク追加');
  await api('PUT', `/tasks/${taskId}`, { related_links: links });
  await loadData(true);
  renderLinksModal(taskId, findTask(taskId).related_links || []);
  const p = state.data?.projects.find(p => p.id === state.projectId);
  if (p) renderProject(p);
  toast('リンクを追加しました', 'ok');
  document.getElementById('linksOverlay').style.display = 'flex';
}

async function removeLink(taskId, idx) {
  if (!confirm('このリンクを削除しますか？')) return;
  captureSnapshotForTask(taskId, 'リンク削除');
  const t = findTask(taskId);
  const links = (t.related_links||[]).filter((_, i) => i !== idx);
  await api('PUT', `/tasks/${taskId}`, { related_links: links });
  await loadData(true);
  renderLinksModal(taskId, findTask(taskId).related_links || []);
  const p = state.data?.projects.find(p => p.id === state.projectId);
  if (p) renderProject(p);
  toast('削除しました', 'ok');
  document.getElementById('linksOverlay').style.display = 'flex';
}

// ══════════════════════════════════════════════
//  Status helpers
// ══════════════════════════════════════════════
function statusLabel(s) { return { active:'進行中', completed:'完了', archived:'アーカイブ' }[s] || s; }
function taskStatusLabel(s) { return { todo:'未着手', in_progress:'進行中', done:'完了' }[s] || s; }
function isOverdue(date) { return date && date < new Date().toISOString().slice(0,10); }

async function cycleStatus(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  captureSnapshotForTask(taskId, 'ステータス変更');
  const next = { todo:'in_progress', in_progress:'done', done:'todo' }[task.status];
  await api('PUT', `/tasks/${taskId}`, { status: next });
  await loadData(true);
  const p = state.data?.projects.find(p => p.id === state.projectId);
  if (p) {
    const tc = document.getElementById('tabContent');
    if (tc) tc.innerHTML = renderTabContent(p);
  }
}

function findTask(id) {
  for (const p of (state.data?.projects || [])) {
    if (p.big_task?.id === id) return p.big_task;
    for (const t of [...(p.medium_tasks||[]), ...(p.small_tasks||[])])
      if (t.id === id) return t;
  }
  return null;
}

// ══════════════════════════════════════════════
//  API helper
// ══════════════════════════════════════════════
async function api(method, path, body) {
  const r = await fetch(`${API}${path}`, {
    method, headers: { 'Content-Type':'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}

// ══════════════════════════════════════════════
//  Modal helpers
// ══════════════════════════════════════════════
function openModal(html) { document.getElementById('modalContent').innerHTML = html; document.getElementById('modalOverlay').style.display = 'flex'; }
function closeModal(e) { if (!e || e.target === document.getElementById('modalOverlay')) document.getElementById('modalOverlay').style.display = 'none'; }
function closeWide(e) { if (!e || e.target === document.getElementById('wideOverlay')) document.getElementById('wideOverlay').style.display = 'none'; }
function closeLinks(e) { if (!e || e.target === document.getElementById('linksOverlay')) document.getElementById('linksOverlay').style.display = 'none'; }
function closeAllModals() { closeModal(); closeWide(); closeLinks(); }

// ══════════════════════════════════════════════
//  Project CRUD
// ══════════════════════════════════════════════
function openNewProjectModal() {
  openModal(`
    <h2>新規プロジェクト</h2>
    <div class="form-group"><label>プロジェクト名 *</label><input id="f-name" placeholder="例：コーデ就労支援 AI導入" autofocus></div>
    <div class="form-group"><label>ゴール（達成目標）</label><textarea id="f-goal" placeholder="例：2026年7月末までにAI活用率50%を達成する"></textarea></div>
    <div class="form-group"><label>メモ</label><textarea id="f-memo" placeholder="背景・補足など"></textarea></div>
    <div style="display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:rgba(108,99,255,.1);border:1px solid rgba(108,99,255,.3);border-radius:10px;margin-bottom:4px;">
      <input type="checkbox" id="f-autogen" checked style="width:16px;height:16px;margin-top:1px;cursor:pointer;accent-color:var(--accent);" onchange="document.getElementById('task-count-opts').style.display=this.checked?'grid':'none'">
      <label for="f-autogen" style="font-size:13px;cursor:pointer;line-height:1.5;">
        <span style="font-weight:700;color:var(--accent);">✨ タスクを自動生成する</span><br>
        <span style="font-size:11px;color:var(--text2);">大タスク×1＋ロードマップ・マインドマップを自動生成します</span>
      </label>
    </div>
    <div id="task-count-opts" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 14px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;">
      <div class="form-group" style="margin:0">
        <label style="font-size:11px;">中タスク数（0〜10）</label>
        <input type="number" id="f-med-count" value="3" min="0" max="10" style="width:100%;padding:6px 8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;">
      </div>
      <div class="form-group" style="margin:0">
        <label style="font-size:11px;">小タスク数（0〜20）</label>
        <input type="number" id="f-sm-count" value="5" min="0" max="20" style="width:100%;padding:6px 8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;">
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary" onclick="createProject()">作成</button>
    </div>`);
}

async function createProject() {
  const name = document.getElementById('f-name').value.trim();
  const goal = document.getElementById('f-goal').value.trim();
  const autoGen = document.getElementById('f-autogen').checked;
  const medCount = parseInt(document.getElementById('f-med-count')?.value || '3', 10);
  const smCount  = parseInt(document.getElementById('f-sm-count')?.value  || '5', 10);
  if (!name) { toast('プロジェクト名を入力してください', 'err'); return; }
  closeModal();
  const r = await api('POST', '/projects', { name, goal, memo: document.getElementById('f-memo')?.value.trim() || '' });
  if (autoGen) {
    toast('タスクを自動生成中…', 'ok');
    await autoGenerateTasks(r.id, name, goal, medCount, smCount);
  }
  await loadData();
  selectProject(r.id);
  toast(autoGen ? '✨ プロジェクトとタスクを自動生成しました' : 'プロジェクトを作成しました', 'ok');
}

async function autoGenerateTasks(pid, name, goal, medCount = 3, smCount = 5) {
  const label = goal || name;
  const short = label.length > 28 ? label.slice(0,28) + '…' : label;
  const bigTitle = goal ? `「${short}」を達成する` : `${short}を完了させる`;
  const bigR = await api('POST', `/projects/${pid}/tasks`, { type:'big', title:bigTitle, description:'このプロジェクト全体のゴール。ここを達成することがすべての判断基準になります。' });
  if (bigR.id) await api('PUT', `/tasks/${bigR.id}`, { roadmap_mmd: generateRoadmapCode(name, goal), mindmap_mmd: generateMindmapCode(bigTitle) });

  const medTemplates = [
    ['現状把握・要件整理','現在の状況を正確に把握し、達成に必要な要件を明確にする'],
    ['計画立案・実行','具体的なアクションプランを立て、確実に実行する'],
    ['検証・改善・定着化','結果を数値で確認し、改善サイクルを回して定着させる'],
  ];
  for (let i = 0; i < medCount; i++) {
    const [title, description] = medTemplates[i] || [`中タスク ${i+1}`, ''];
    await api('POST', `/projects/${pid}/tasks`, { type:'medium', title, description });
  }

  const smTemplates = [
    ['キックオフ・関係者共有','プロジェクト開始を関係者に伝え、役割分担と協力体制を整える'],
    ['ツール・リソースの準備','作業に必要なツール・情報・人員・予算を事前に確保する'],
    ['進捗確認・中間レビュー','定期的に進捗を確認し、目標とのズレを早期に修正する'],
    ['課題の洗い出しと対処','リスクや障害を早期に発見し、影響が出る前に手を打つ'],
    ['最終確認・完了報告','成果物・達成度を確認し、引き継ぎ・報告を行って完了とする'],
  ];
  for (let i = 0; i < smCount; i++) {
    const [title, description] = smTemplates[i] || [`小タスク ${i+1}`, ''];
    await api('POST', `/projects/${pid}/tasks`, { type:'small', title, description });
  }
}

function generateRoadmapCode(name, goal) {
  const label = goal || name;
  const s = label.length > 22 ? label.slice(0,22) + '…' : label;
  return `graph TD\n  A(["🎯 ${s}"]) --> B["📋 計画フェーズ"]\n  B --> C["⚙️ 実行フェーズ"]\n  C --> D(["✅ 完了・定着"])\n\n  B --> B1["現状把握"]\n  B --> B2["要件整理"]\n  B --> B3["リソース確保"]\n\n  C --> C1["フェーズ1: 着手"]\n  C --> C2["フェーズ2: 展開"]\n  C --> C3["フェーズ3: 仕上げ"]\n\n  style A fill:#6c63ff,color:#fff,stroke:#6c63ff\n  style D fill:#43e97b,color:#000,stroke:#43e97b`;
}

function generateMindmapCode(title) {
  const s = title.length > 24 ? title.slice(0,24) + '…' : title;
  return `mindmap\n  root(("${s}"))\n    計画\n      現状把握\n      要件整理\n      スケジュール確定\n    実行\n      フェーズ1\n      フェーズ2\n      フェーズ3\n    完了\n      検証・テスト\n      改善\n      定着化・引き継ぎ`;
}

function openEditProjectModal(pid) {
  const p = state.data.projects.find(p => p.id === pid);
  openModal(`
    <h2>プロジェクト編集</h2>
    <div class="form-group"><label>プロジェクト名</label><input id="f-name" value="${esc(p.name)}" autofocus></div>
    <div class="form-group"><label>ゴール</label><textarea id="f-goal">${esc(p.goal||'')}</textarea></div>
    <div class="form-group"><label>ステータス</label>
      <select id="f-status">
        <option value="active" ${p.status==='active'?'selected':''}>進行中</option>
        <option value="completed" ${p.status==='completed'?'selected':''}>完了</option>
        <option value="archived" ${p.status==='archived'?'selected':''}>アーカイブ</option>
      </select></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary" onclick="updateProject('${pid}')">保存</button>
    </div>`);
}

async function updateProject(pid) {
  captureSnapshot(pid, 'プロジェクト編集');
  await api('PUT', `/projects/${pid}`, { name: document.getElementById('f-name').value.trim(), goal: document.getElementById('f-goal').value.trim(), status: document.getElementById('f-status').value });
  closeModal(); await loadData(true);
  const p = state.data?.projects.find(p => p.id === pid);
  if (p) renderProject(p);
  toast('更新しました', 'ok');
}

async function markProjectDone(pid) {
  captureSnapshot(pid, 'プロジェクト完了');
  await api('PUT', `/projects/${pid}`, { status:'completed' });
  await loadData(true);
  const p = state.data?.projects.find(p => p.id === pid);
  if (p) renderProject(p); else showDashboard();
  toast('プロジェクトを完了しました！', 'ok');
}

async function archiveProject(pid) {
  captureSnapshot(pid, 'アーカイブ');
  await api('PUT', `/projects/${pid}`, { status:'archived' });
  await loadData(true);
  const p = state.data?.projects.find(p => p.id === pid);
  if (p) renderProject(p);
  toast('アーカイブしました', 'ok');
}

async function deleteProject(pid) {
  if (!confirm('このプロジェクトを削除しますか？（元に戻せません）')) return;
  captureSnapshot(pid, 'プロジェクト削除');
  await api('DELETE', `/projects/${pid}`);
  await loadData(); showDashboard();
  toast('削除しました', 'ok');
}

// ══════════════════════════════════════════════
//  Task CRUD
// ══════════════════════════════════════════════
function openAddTaskModal(pid, type) {
  const labels = { big:'大タスク（Must do）', medium:'中タスク（Should do）', small:'小タスク（Nice to do）' };
  openModal(`
    <h2>タスク追加 — ${labels[type]}</h2>
    <div class="form-group"><label>タイトル *</label><input id="f-title" placeholder="タスクのタイトル" autofocus></div>
    <div class="form-group"><label>説明</label><textarea id="f-desc" placeholder="詳細・目的など"></textarea></div>
    <div class="form-group"><label>期日</label><input id="f-due" type="date"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary" onclick="addTask('${pid}','${type}')">追加</button>
    </div>`);
}

async function addTask(pid, type) {
  const title = document.getElementById('f-title').value.trim();
  if (!title) { toast('タイトルを入力してください', 'err'); return; }
  captureSnapshot(pid, 'タスク追加');
  const r = await api('POST', `/projects/${pid}/tasks`, { type, title, description: document.getElementById('f-desc').value.trim(), due_date: document.getElementById('f-due').value || null });
  if (r.error) { toast(r.error, 'err'); return; }
  closeModal(); await loadData(true);
  const p = state.data?.projects.find(p => p.id === pid);
  if (p) renderProject(p);
  toast('タスクを追加しました', 'ok');
}

function openEditTaskModal(taskId) {
  const t = findTask(taskId);
  if (!t) return;
  openModal(`
    <h2>タスク編集</h2>
    <div class="form-group"><label>タイトル</label><input id="f-title" value="${esc(t.title)}" autofocus></div>
    <div class="form-group"><label>説明</label><textarea id="f-desc">${esc(t.description||'')}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>ステータス</label>
        <select id="f-status">
          <option value="todo" ${t.status==='todo'?'selected':''}>未着手</option>
          <option value="in_progress" ${t.status==='in_progress'?'selected':''}>進行中</option>
          <option value="done" ${t.status==='done'?'selected':''}>完了</option>
        </select></div>
      <div class="form-group"><label>期日</label><input id="f-due" type="date" value="${t.due_date||''}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary" onclick="updateTask('${taskId}')">保存</button>
    </div>`);
}

async function updateTask(taskId) {
  captureSnapshotForTask(taskId, 'タスク編集');
  await api('PUT', `/tasks/${taskId}`, { title: document.getElementById('f-title').value.trim(), description: document.getElementById('f-desc').value.trim(), status: document.getElementById('f-status').value, due_date: document.getElementById('f-due').value || null });
  closeModal(); await loadData(true);
  const p = state.data?.projects.find(p => p.id === state.projectId);
  if (p) renderProject(p);
  toast('更新しました', 'ok');
}

async function deleteTask(taskId) {
  if (!confirm('このタスクを削除しますか？')) return;
  captureSnapshotForTask(taskId, 'タスク削除');
  await api('DELETE', `/tasks/${taskId}`);
  await loadData(true);
  const p = state.data?.projects.find(p => p.id === state.projectId);
  if (p) renderProject(p);
  toast('削除しました', 'ok');
}

// ══════════════════════════════════════════════
//  Pivots (Thinking Transition)
// ══════════════════════════════════════════════
function renderPivots(p) {
  const pivots = (p.pivots || []).slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const typeLabel = { strategic:'方針転換', technical:'技術転換', scope:'スコープ変更', conceptual:'概念転換' };
  const impactLabel = { high:'影響大', medium:'影響中', low:'影響小' };

  const diagramHtml = `
    <div class="pivot-section-title">🗺️ 思考遷移図 <span style="font-weight:400;color:var(--border);font-size:10px;">自動生成 — ピボットを追加するとリアルタイム更新</span></div>
    <div class="pivot-diagram-wrap" id="pivotDiagramWrap">
      ${pivots.length === 0
        ? `<span style="color:var(--text2);font-size:12px;">ピボットを記録すると思考遷移図が表示されます</span>`
        : `<span style="color:var(--text2);font-size:12px;">レンダリング中…</span>`}
    </div>`;

  // Initial vs current mindmap comparison
  const initialMmd = p.initial_mindmap_mmd;
  const bigTaskMmd = p.big_task?.mindmap_mmd;
  const compareHtml = (initialMmd && bigTaskMmd && initialMmd !== bigTaskMmd) ? `
    <div class="pivot-section-title" style="margin-top:4px;">🧠 マインドマップの変遷 <span style="font-weight:400;color:var(--border);font-size:10px;">初期 vs 現在</span></div>
    <div class="pivot-compare">
      <div class="pivot-compare-panel">
        <div class="pivot-compare-label">🌱 初期マインドマップ</div>
        <div class="pivot-compare-mmd" id="pivotInitMmd"><span style="color:var(--text2);font-size:11px;">レンダリング中…</span></div>
      </div>
      <div class="pivot-compare-panel">
        <div class="pivot-compare-label">✨ 現在のマインドマップ</div>
        <div class="pivot-compare-mmd" id="pivotCurrMmd"><span style="color:var(--text2);font-size:11px;">レンダリング中…</span></div>
      </div>
    </div>` : '';

  const pivotListHtml = pivots.length
    ? `<div class="pivot-timeline">${pivots.map((pv, i) => `
        <div class="pivot-card">
          <div class="pivot-card-top">
            <div>
              <span class="pivot-type-badge ${pv.type}">${typeLabel[pv.type] || pv.type}</span>
              ${i === 0 ? '<span style="font-size:10px;color:var(--accent);margin-left:6px;">← 最初の転換点</span>' : ''}
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
              <span class="pivot-impact ${pv.impact}">${impactLabel[pv.impact] || pv.impact}</span>
              <button class="icon-btn btn-sm" style="width:22px;height:22px;font-size:11px;" onclick="openEditPivotModal('${p.id}','${pv.id}')" title="編集">✏️</button>
              <button class="icon-btn del btn-sm" style="width:22px;height:22px;font-size:11px;" onclick="deletePivot('${p.id}','${pv.id}')" title="削除">🗑</button>
            </div>
          </div>
          ${pv.from ? `<div class="pivot-from-to">
            <span class="pivot-from">${esc(pv.from)}</span>
            <span class="pivot-arrow">→</span>
            <span class="pivot-to">${esc(pv.to)}</span>
          </div>` : `<div style="margin:6px 0;font-size:13px;font-weight:600;color:var(--accent);">→ ${esc(pv.to)}</div>`}
          ${pv.reason ? `<div class="pivot-reason">💬 ${esc(pv.reason)}</div>` : ''}
          <div class="pivot-time">${pv.timestamp.replace('T',' ')}</div>
        </div>`).join('')}
      </div>`
    : `<div class="pivot-empty">
        <p>まだ思考転換が記録されていません</p>
        <p style="font-size:11px;margin-top:4px;">方針転換・技術的判断・スコープ変更などをここに記録すると<br>プロジェクトの思考の流れが可視化されます</p>
      </div>`;

  return `
    ${diagramHtml}
    ${compareHtml}
    <div class="pivot-section-title" style="margin-top:${compareHtml?'4px':'0'};">📋 ピボット記録 <span style="font-weight:400;font-size:10px;color:var(--border);">${pivots.length} 件</span></div>
    ${pivotListHtml}
    <div style="margin-top:16px;">
      <button class="btn btn-primary btn-sm" onclick="openAddPivotModal('${p.id}')">＋ 思考転換を記録</button>
      ${!initialMmd && bigTaskMmd ? `<button class="btn btn-ghost btn-sm" style="margin-left:8px;" onclick="saveInitialMindmap('${p.id}')">📸 現在のマインドマップを初期として保存</button>` : ''}
    </div>`;
}

async function renderPivotDiagram(p) {
  const wrap = document.getElementById('pivotDiagramWrap');
  if (!wrap) return;
  const pivots = (p.pivots || []).slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  if (!pivots.length) return;

  const initLabel = pivots[0].from || p.name.slice(0, 18);
  let mmd = 'graph LR\n';
  mmd += `  N_init(["🌱 ${initLabel.slice(0,20)}"])\n`;
  let prev = 'N_init';
  pivots.forEach((pv, i) => {
    const nid = `N${i}`;
    const label = pv.to.slice(0, 20);
    const edge  = pv.reason ? pv.reason.slice(0, 16) : (pv.type === 'strategic' ? '方針転換' : pv.type === 'technical' ? '技術転換' : pv.type === 'scope' ? 'スコープ変更' : '概念転換');
    mmd += `  ${nid}(["${label}"])\n`;
    mmd += `  ${prev} -->|"${edge}"| ${nid}\n`;
    prev = nid;
  });
  mmd += `  style N_init fill:#444,color:#fff,stroke:#444\n`;
  pivots.forEach((_, i) => {
    const color = i === pivots.length - 1 ? '#43e97b' : '#6c63ff';
    const text  = i === pivots.length - 1 ? '#000' : '#fff';
    mmd += `  style N${i} fill:${color},color:${text},stroke:${color}\n`;
  });

  try {
    const id = `pivot-${++mmdSeq}`;
    const { svg } = await mermaid.render(id, mmd);
    wrap.innerHTML = svg;
    wrap.querySelector('svg')?.setAttribute('style', 'max-width:100%;height:auto;');
  } catch(e) {
    wrap.innerHTML = `<div class="mmd-error">描画エラー: ${e.message}</div>`;
  }
}

async function renderPivotCompare(p) {
  const initialMmd = p.initial_mindmap_mmd;
  const bigTaskMmd = p.big_task?.mindmap_mmd;
  if (!initialMmd || !bigTaskMmd || initialMmd === bigTaskMmd) return;

  for (const [elId, code] of [['pivotInitMmd', initialMmd], ['pivotCurrMmd', bigTaskMmd]]) {
    const el = document.getElementById(elId);
    if (!el) continue;
    try {
      const id = `pmc-${++mmdSeq}`;
      const { svg } = await mermaid.render(id, code);
      el.innerHTML = svg;
      const s = el.querySelector('svg');
      if (s) { s.setAttribute('style', 'max-width:100%;height:auto;'); applyMindmapColors(s); }
    } catch(e) {
      el.innerHTML = `<div class="mmd-error" style="font-size:10px;">${e.message}</div>`;
    }
  }
}

function openAddPivotModal(pid) {
  openModal(`
    <h2>🔄 思考転換を記録</h2>
    <div class="form-group">
      <label>転換タイプ</label>
      <select id="pv-type">
        <option value="strategic">方針転換 — プロジェクトの方向性が変わった</option>
        <option value="technical">技術転換 — 実装アプローチが変わった</option>
        <option value="scope">スコープ変更 — 範囲・規模が変わった</option>
        <option value="conceptual">概念転換 — 考え方・フレームが変わった</option>
      </select>
    </div>
    <div class="form-group"><label>転換前の状態（元の方向）</label><input id="pv-from" placeholder="例：シングルスレッドサーバー" autofocus></div>
    <div class="form-group"><label>転換後の状態（新しい方向）*</label><input id="pv-to" placeholder="例：ThreadingHTTPServer + SSE"></div>
    <div class="form-group"><label>転換の理由</label><textarea id="pv-reason" placeholder="例：SSEの長時間接続が通常リクエストをブロックするため" style="min-height:60px;"></textarea></div>
    <div class="form-group">
      <label>影響度</label>
      <select id="pv-impact">
        <option value="high">大 — プロジェクト全体に影響</option>
        <option value="medium" selected>中 — 一部に影響</option>
        <option value="low">小 — 軽微な変更</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary" onclick="addPivot('${pid}')">記録する</button>
    </div>`);
}

async function addPivot(pid) {
  const to = document.getElementById('pv-to').value.trim();
  if (!to) { toast('転換後の状態を入力してください', 'err'); return; }
  captureSnapshot(pid, 'ピボット追加');
  closeModal();
  await api('POST', `/projects/${pid}/pivots`, {
    type:   document.getElementById('pv-type').value,
    from:   document.getElementById('pv-from').value.trim(),
    to,
    reason: document.getElementById('pv-reason').value.trim(),
    impact: document.getElementById('pv-impact').value,
  });
  await loadData(true);
  const p = state.data?.projects.find(p => p.id === pid);
  if (p) { renderProject(p); setTimeout(() => { renderPivotDiagram(p); renderPivotCompare(p); }, 100); }
  toast('思考転換を記録しました', 'ok');
}

async function deletePivot(pid, pivotId) {
  if (!confirm('このピボット記録を削除しますか？')) return;
  captureSnapshot(pid, 'ピボット削除');
  await api('DELETE', `/projects/${pid}/pivots/${pivotId}`);
  await loadData(true);
  const p = state.data?.projects.find(p => p.id === pid);
  if (p) renderProject(p);
  toast('削除しました', 'ok');
}

async function saveInitialMindmap(pid) {
  const p = state.data?.projects.find(p => p.id === pid);
  const mmd = p?.big_task?.mindmap_mmd;
  if (!mmd) { toast('大タスクのマインドマップが未設定です', 'err'); return; }
  captureSnapshot(pid, '初期マインドマップ保存');
  await api('PUT', `/projects/${pid}`, { initial_mindmap_mmd: mmd });
  await loadData(true);
  const updated = state.data?.projects.find(p => p.id === pid);
  if (updated) renderProject(updated);
  toast('初期マインドマップを保存しました', 'ok');
}

// ══════════════════════════════════════════════
//  History / Memo
// ══════════════════════════════════════════════
function renderHistory(p) {
  const all = [];
  (p.history||[]).forEach(h => all.push({ ...h, source: p.name }));
  getAllTasks(p).forEach(t => (t.history||[]).forEach(h => all.push({ ...h, source: t.title })));
  all.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (!all.length) return '<div style="color:var(--text2);font-size:13px;padding:20px 0;">履歴なし</div>';
  return `<div class="history-section"><div class="history-list">${all.map(h => `
    <div class="history-item">
      <div class="history-dot"></div>
      <div class="history-content">
        <div class="history-action">${esc(h.action)}</div>
        <div class="history-detail">${esc(h.detail)} — <em>${esc(h.source)}</em></div>
        <div class="history-time">${h.timestamp}</div>
      </div>
    </div>`).join('')}</div></div>`;
}

function renderMemo(p) {
  return `<div class="memo-section">
    <h3>メモ</h3>
    <textarea class="memo-area" id="memoArea" placeholder="このプロジェクトに関するメモを自由に...">${esc(p.memo||'')}</textarea>
    <div style="margin-top:8px;"><button class="btn btn-primary btn-sm" onclick="saveMemo('${p.id}')">保存</button></div>
  </div>`;
}

async function saveMemo(pid) {
  const memo = document.getElementById('memoArea').value;
  captureSnapshot(pid, 'メモ保存');
  await api('PUT', `/projects/${pid}`, { memo });
  await loadData(true);
  toast('メモを保存しました', 'ok');
}

// ══════════════════════════════════════════════
//  Undo System
// ══════════════════════════════════════════════
const UNDO_MAX = 3;
const _undoStack = [];

function _findProjectForTask(taskId) {
  return (state.data?.projects || []).find(p =>
    p.big_task?.id === taskId ||
    (p.medium_tasks||[]).some(t => t.id === taskId) ||
    (p.small_tasks||[]).some(t => t.id === taskId));
}

function captureSnapshot(projectId, label) {
  const p = (state.data?.projects || []).find(x => x.id === projectId);
  if (!p) return;
  _undoStack.push({ label, projectId, snapshot: JSON.parse(JSON.stringify(p)) });
  if (_undoStack.length > UNDO_MAX) _undoStack.shift();
  renderUndoBar();
}

function captureSnapshotForTask(taskId, label) {
  const p = _findProjectForTask(taskId);
  if (p) captureSnapshot(p.id, label);
}

async function doUndo(idx) {
  if (!_undoStack.length || idx < 0 || idx >= _undoStack.length) return;
  const { label, projectId, snapshot } = _undoStack[idx];
  _undoStack.splice(idx);
  const r = await api('POST', `/projects/${projectId}/restore`, { snapshot });
  if (r.error) { toast(`↩ 失敗: ${r.error}（サーバーを再起動してください）`, 'err'); renderUndoBar(); return; }
  await loadData(true);
  const p = state.data?.projects.find(p => p.id === projectId);
  if (state.projectId === projectId) {
    if (p) renderProject(p);
    else { state.projectId = null; showDashboard(); }
  }
  renderSidebar();
  renderUndoBar();
  toast(`↩ "${label}" を元に戻しました`, 'ok');
}

function clearUndoStack() {
  _undoStack.length = 0;
  renderUndoBar();
}

function renderUndoBar() {
  const bar = document.getElementById('undoBar');
  const itemsEl = document.getElementById('undoItems');
  if (!bar || !itemsEl) return;
  if (!_undoStack.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  const stepNames = ['1つ前', '2つ前', '3つ前'];
  const reversed = [..._undoStack].reverse();
  itemsEl.innerHTML = reversed.map((item, ri) => {
    const idx = _undoStack.length - 1 - ri;
    return `<button class="undo-item ${ri===0?'undo-latest':''}" onclick="doUndo(${idx})" title="${esc(item.label)} を元に戻す">${stepNames[ri]}: ${esc(item.label)}</button>`;
  }).join('');
}

// ══════════════════════════════════════════════
//  Toast / helpers
// ══════════════════════════════════════════════
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg; el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════
//  Keyboard shortcuts
// ══════════════════════════════════════════════
let kbdHintTimer;
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
    if (e.key === 'Escape') { e.target.blur(); closeAllModals(); }
    return;
  }
  if (e.key === 'Escape') { closeAllModals(); clearSearch(); }
  else if (e.ctrlKey && e.key === 'z') { e.preventDefault(); if (_undoStack.length) doUndo(_undoStack.length - 1); return; }
  else if (e.key === '/' || (e.key === 'f' && !e.ctrlKey && !e.metaKey)) {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
  else if (e.key === 'n' || e.key === 'N') { openNewProjectModal(); }
  else if (e.key === 'd' || e.key === 'D') { showDashboard('dashboard'); }
  else if (e.key === 'g' || e.key === 'G') { showDashboard('graph'); }
  else if (state.projectId) {
    if      (e.key === 'k' || e.key === 'K') switchTab('kanban',  state.projectId);
    else if (e.key === 't' || e.key === 'T') switchTab('tasks',   state.projectId);
    else if (e.key === 'h' || e.key === 'H') switchTab('history', state.projectId);
    else if (e.key === 'p' || e.key === 'P') switchTab('pivots',  state.projectId);
    else if (e.key === 'l' || e.key === 'L') switchTab('logs',    state.projectId);
  }
  // Show hint briefly
  clearTimeout(kbdHintTimer);
  const hint = document.getElementById('kbdHint');
  hint.classList.add('show');
  kbdHintTimer = setTimeout(() => hint.classList.remove('show'), 2500);
});

// ══════════════════════════════════════════════
//  Mermaid Zoom Popup
// ══════════════════════════════════════════════
let _zoom = { scale: 1, tx: 0, ty: 0, drag: false, lastX: 0, lastY: 0, natW: 800, natH: 600 };
let _zoomSvg = null;

function openMmdPopupFromPreview(previewId, title) {
  const svgEl = document.getElementById(previewId)?.querySelector('svg');
  if (!svgEl) { toast('先にプレビューを表示してください', 'err'); return; }
  openMmdPopup(svgEl, title);
}

function openMmdPopup(svgEl, title) {
  const overlay = document.getElementById('mmdZoomOverlay');
  const inner   = document.getElementById('mmdZoomInner');
  document.getElementById('mmdZoomTitle').textContent = title || '';

  const clone = svgEl.cloneNode(true);
  // Read natural dimensions
  const vb = clone.getAttribute('viewBox');
  if (vb) {
    const p = vb.trim().split(/[\s,]+/);
    _zoom.natW = parseFloat(p[2]) || 800;
    _zoom.natH = parseFloat(p[3]) || 600;
  } else {
    _zoom.natW = parseFloat(clone.getAttribute('width'))  || 800;
    _zoom.natH = parseFloat(clone.getAttribute('height')) || 600;
  }
  clone.setAttribute('width',  _zoom.natW);
  clone.setAttribute('height', _zoom.natH);
  clone.style.cssText = 'display:block;';
  inner.innerHTML = '';
  inner.appendChild(clone);
  _zoomSvg = clone;

  overlay.style.display = 'flex';
  requestAnimationFrame(() => mmdZoomFit());
}

function closeMmdPopup() {
  document.getElementById('mmdZoomOverlay').style.display = 'none';
}

function _applyZoom() {
  const inner = document.getElementById('mmdZoomInner');
  if (inner) inner.style.transform = `translate(${_zoom.tx}px,${_zoom.ty}px) scale(${_zoom.scale})`;
  const d = document.getElementById('mmdZoomScaleDisplay');
  if (d) d.textContent = Math.round(_zoom.scale * 100) + '%';
}

function mmdZoomFit() {
  const canvas = document.getElementById('mmdZoomCanvas');
  if (!canvas) return;
  const cw = canvas.clientWidth, ch = canvas.clientHeight;
  _zoom.scale = Math.min(cw / _zoom.natW, ch / _zoom.natH) * 0.92;
  _zoom.tx = (cw - _zoom.natW * _zoom.scale) / 2;
  _zoom.ty = (ch - _zoom.natH * _zoom.scale) / 2;
  _applyZoom();
}
function mmdZoomIn()  { _zoom.scale = Math.min(_zoom.scale * 1.25, 12); _applyZoom(); }
function mmdZoomOut() { _zoom.scale = Math.max(_zoom.scale / 1.25, 0.04); _applyZoom(); }

function printMmdPopup() {
  if (!_zoomSvg) return;
  const clone = _zoomSvg.cloneNode(true);
  clone.setAttribute('style', 'max-width:100%;height:auto;display:block;');
  const landscape = _zoom.natW > _zoom.natH;
  const ps = landscape ? 'A4 landscape' : 'A4 portrait';
  const pw = landscape ? '297mm' : '210mm';
  const ph = landscape ? '210mm' : '297mm';
  const title = document.getElementById('mmdZoomTitle').textContent;
  const safeTitle = title.replace(/[<>"&]/g, c=>({'<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;'}[c]));
  const win = window.open('', '_blank', 'width=1280,height=900,menubar=no,toolbar=no');
  if (!win) { toast('ポップアップがブロックされています', 'err'); return; }
  win.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>${safeTitle}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#e8e8e8;font-family:'Segoe UI',sans-serif}
.tb{display:flex;align-items:center;gap:10px;padding:10px 20px;background:#1a1a24;color:#e8e8f0;position:sticky;top:0;z-index:10}
.tb-t{font-size:14px;font-weight:600;flex:1}.tbtn{padding:6px 16px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:600}
.tbtn-p{background:#6c63ff;color:#fff}.tbtn-c{background:transparent;color:#8888aa;border:1px solid #2e2e40}
.pw{display:flex;align-items:flex-start;justify-content:center;padding:24px;min-height:calc(100vh - 52px)}
.a4{width:${pw};min-height:${ph};background:#fff;padding:12mm;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,0,0,.25)}
.a4 svg{max-width:100%;height:auto;display:block}
@media print{body{background:white}.tb{display:none!important}.pw{padding:0;min-height:0}.a4{margin:0;width:100%;min-height:0;box-shadow:none;padding:8mm}@page{size:${ps};margin:0}}</style>
</head><body>
<div class="tb"><span class="tb-t">${safeTitle}</span>
<button class="tbtn tbtn-p" onclick="window.print()">🖨️ PDF出力</button>
<button class="tbtn tbtn-c" onclick="window.close()">✕</button></div>
<div class="pw"><div class="a4">${clone.outerHTML}</div></div></body></html>`);
  win.document.close();
}

function _initZoomEvents() {
  const canvas = document.getElementById('mmdZoomCanvas');
  if (!canvas) return;
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const f = e.deltaY < 0 ? 1.15 : 0.87;
    const ns = Math.max(0.04, Math.min(12, _zoom.scale * f));
    _zoom.tx = cx - (cx - _zoom.tx) * (ns / _zoom.scale);
    _zoom.ty = cy - (cy - _zoom.ty) * (ns / _zoom.scale);
    _zoom.scale = ns;
    _applyZoom();
  }, { passive: false });
  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    _zoom.drag = true; _zoom.lastX = e.clientX; _zoom.lastY = e.clientY;
    canvas.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!_zoom.drag) return;
    _zoom.tx += e.clientX - _zoom.lastX; _zoom.ty += e.clientY - _zoom.lastY;
    _zoom.lastX = e.clientX; _zoom.lastY = e.clientY;
    _applyZoom();
  });
  window.addEventListener('mouseup', () => {
    if (_zoom.drag) { _zoom.drag = false; canvas.classList.remove('dragging'); }
  });
}

// ══════════════════════════════════════════════
//  AI Input Focus Overlay
// ══════════════════════════════════════════════
let _aiFocusTarget = null;

function openAiFocus(targetId, title) {
  _aiFocusTarget = targetId;
  const ta = document.getElementById(targetId);
  const focusTa = document.getElementById('aiFocusTa');
  document.getElementById('aiFocusTitle').textContent = title || '入力';
  focusTa.value = ta ? ta.value : '';
  focusTa.placeholder = ta ? ta.placeholder : '';
  document.getElementById('aiFocusOverlay').style.display = 'flex';
  setTimeout(() => { focusTa.focus(); focusTa.selectionStart = focusTa.value.length; }, 80);
}

function closeAiFocus(apply) {
  if (apply && _aiFocusTarget) {
    const src = document.getElementById('aiFocusTa');
    const dst = document.getElementById(_aiFocusTarget);
    if (src && dst) dst.value = src.value;
  }
  document.getElementById('aiFocusOverlay').style.display = 'none';
  _aiFocusTarget = null;
}

// ══════════════════════════════════════════════
//  Activity Log (session_logs)
// ══════════════════════════════════════════════
function renderActivityLog(p) {
  const logs = (p.session_logs || []).slice().sort((a,b) => b.timestamp.localeCompare(a.timestamp));
  const typeIcon = { instruction: '📝', decision: '✅', output: '📦', note: '💬' };
  const typeLabel = { instruction: '指示', decision: '決定', output: '成果物', note: 'メモ' };

  const logsHtml = logs.length ? logs.map(l => `
    <div class="act-log-item act-log-type-${esc(l.type)}">
      <div class="act-log-icon">${typeIcon[l.type] || '📌'}</div>
      <div class="act-log-body">
        <div class="act-log-summary">
          <span class="act-log-type-badge">${typeLabel[l.type] || l.type}</span>${esc(l.summary)}
        </div>
        ${l.detail ? `<div class="act-log-detail">${esc(l.detail)}</div>` : ''}
        <div class="act-log-meta">${l.timestamp.replace('T',' ')} · ${timeAgo(l.timestamp)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
        <button class="icon-btn btn-sm" style="width:22px;height:22px;font-size:11px;" onclick="openEditLogModal('${p.id}','${l.id}')" title="編集">✏️</button>
        <button class="file-del-btn" onclick="deleteActivityLog('${p.id}','${l.id}')" title="削除">✕</button>
      </div>
    </div>`).join('') :
    `<div style="color:var(--text2);font-size:13px;padding:20px 0;text-align:center;">
      活動ログがありません<br>
      <div style="font-size:11px;margin-top:8px;">CLIから: <code style="background:var(--surface2);padding:2px 6px;border-radius:4px;">log-action PROJECT_ID --type instruction --summary "指示内容"</code></div>
    </div>`;

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <div>
        <h2 style="font-size:16px;font-weight:700;">📋 活動ログ</h2>
        <div style="font-size:11px;color:var(--text2);margin-top:2px;">上村の指示・Kaiの決定・成果物・メモを時系列で記録</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openAddLogModal('${p.id}')">＋ ログを追加</button>
    </div>
    <div class="act-log-list">${logsHtml}</div>`;
}

function openAddLogModal(pid) {
  const html = `
    <div style="font-size:16px;font-weight:700;margin-bottom:14px;">📋 活動ログを追加</div>
    <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text2);display:block;margin-bottom:5px;">種別</label>
    <select id="logType" class="form-input" style="margin-bottom:10px;">
      <option value="instruction">📝 指示（上村からの指示内容）</option>
      <option value="decision">✅ 決定（Kaiが行った判断・決定）</option>
      <option value="output">📦 成果物（作成したファイル・成果）</option>
      <option value="note">💬 メモ（その他のメモ）</option>
    </select>
    <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text2);display:block;margin-bottom:5px;">概要 <span style="color:var(--red)">*</span></label>
    <input id="logSummary" class="form-input" placeholder="1行で要約" style="margin-bottom:10px;">
    <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text2);display:block;margin-bottom:5px;">詳細（省略可）</label>
    <textarea id="logDetail" class="form-input" rows="3" placeholder="詳細な内容・ファイルパス・コマンドなど" style="resize:vertical;margin-bottom:14px;"></textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary btn-sm" onclick="addActivityLog('${pid}')">追加</button>
    </div>`;
  openModal(html);
}

async function addActivityLog(pid) {
  const type = document.getElementById('logType')?.value || 'note';
  const summary = document.getElementById('logSummary')?.value.trim();
  const detail = document.getElementById('logDetail')?.value.trim() || '';
  if (!summary) { toast('概要を入力してください', 'err'); return; }
  captureSnapshot(pid, '活動ログ追加');
  await api('POST', `/projects/${pid}/logs`, { type, summary, detail });
  await loadData(true);
  closeModal();
  const p = state.data?.projects.find(x => x.id === pid);
  if (p && state.tab === 'logs') {
    document.getElementById('tabContent').innerHTML = renderActivityLog(p);
  }
  toast('ログを追加しました', 'ok');
}

async function deleteActivityLog(pid, logId) {
  const p = state.data?.projects.find(x => x.id === pid);
  if (!p) return;
  captureSnapshot(pid, '活動ログ削除');
  const updated = (p.session_logs || []).filter(l => l.id !== logId);
  await api('PUT', `/projects/${pid}`, { session_logs: updated });
  await loadData(true);
  const pp = state.data?.projects.find(x => x.id === pid);
  if (pp && state.tab === 'logs') {
    document.getElementById('tabContent').innerHTML = renderActivityLog(pp);
  }
  toast('削除しました', 'ok');
}

// ══════════════════════════════════════════════
//  Edit Activity Log
// ══════════════════════════════════════════════
function openEditLogModal(pid, logId) {
  const p = state.data?.projects.find(x => x.id === pid);
  const log = (p?.session_logs || []).find(l => l.id === logId);
  if (!log) { toast('ログが見つかりません', 'err'); return; }
  openModal(`
    <h2>✏️ 活動ログを編集</h2>
    <div class="form-group">
      <label>種別</label>
      <select id="editLogType">
        <option value="instruction" ${log.type==='instruction'?'selected':''}>📝 指示（上村からの指示内容）</option>
        <option value="decision" ${log.type==='decision'?'selected':''}>✅ 決定（Kaiが行った判断・決定）</option>
        <option value="output" ${log.type==='output'?'selected':''}>📦 成果物（作成したファイル・成果）</option>
        <option value="note" ${log.type==='note'?'selected':''}>💬 メモ（その他のメモ）</option>
      </select>
    </div>
    <div class="form-group">
      <label>概要 <span style="color:var(--red)">*</span></label>
      <input id="editLogSummary" value="${esc(log.summary)}" placeholder="1行で要約">
    </div>
    <div class="form-group">
      <label>詳細（省略可）</label>
      <textarea id="editLogDetail" rows="3" placeholder="詳細な内容・ファイルパス・コマンドなど">${esc(log.detail||'')}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary" onclick="saveEditedLog('${pid}','${logId}')">保存</button>
    </div>`);
}

async function saveEditedLog(pid, logId) {
  const summary = document.getElementById('editLogSummary')?.value.trim();
  if (!summary) { toast('概要を入力してください', 'err'); return; }
  const p = state.data?.projects.find(x => x.id === pid);
  if (!p) return;
  const updated = (p.session_logs || []).map(l => l.id === logId ? {
    ...l,
    type: document.getElementById('editLogType').value,
    summary,
    detail: document.getElementById('editLogDetail')?.value.trim() || '',
  } : l);
  captureSnapshot(pid, '活動ログ編集');
  closeModal();
  await api('PUT', `/projects/${pid}`, { session_logs: updated });
  await loadData(true);
  const pp = state.data?.projects.find(x => x.id === pid);
  if (pp && state.tab === 'logs') document.getElementById('tabContent').innerHTML = renderActivityLog(pp);
  toast('ログを更新しました', 'ok');
}

// ══════════════════════════════════════════════
//  Edit Pivot
// ══════════════════════════════════════════════
function openEditPivotModal(pid, pivotId) {
  const p = state.data?.projects.find(x => x.id === pid);
  const pv = (p?.pivots || []).find(v => v.id === pivotId);
  if (!pv) { toast('ピボットが見つかりません', 'err'); return; }
  const typeLabel = { strategic:'方針転換', technical:'技術転換', scope:'スコープ変更', conceptual:'概念転換' };
  const html = `
    <h2>✏️ 思考転換を編集</h2>
    <div class="form-group">
      <label>転換タイプ</label>
      <select id="editPvType">
        <option value="strategic" ${pv.type==='strategic'?'selected':''}>方針転換</option>
        <option value="technical" ${pv.type==='technical'?'selected':''}>技術転換</option>
        <option value="scope" ${pv.type==='scope'?'selected':''}>スコープ変更</option>
        <option value="conceptual" ${pv.type==='conceptual'?'selected':''}>概念転換</option>
      </select>
    </div>
    <div class="form-group"><label>転換前の状態</label><input id="editPvFrom" value="${esc(pv.from||'')}"></div>
    <div class="form-group"><label>転換後の状態 *</label><input id="editPvTo" value="${esc(pv.to||'')}"></div>
    <div class="form-group"><label>転換の理由</label><textarea id="editPvReason" style="min-height:60px;">${esc(pv.reason||'')}</textarea></div>
    <div class="form-group">
      <label>影響度</label>
      <select id="editPvImpact">
        <option value="high" ${pv.impact==='high'?'selected':''}>大</option>
        <option value="medium" ${pv.impact==='medium'?'selected':''}>中</option>
        <option value="low" ${pv.impact==='low'?'selected':''}>小</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary" onclick="saveEditedPivot('${pid}','${pivotId}')">保存</button>
    </div>`;
  openModal(html);
}

async function saveEditedPivot(pid, pivotId) {
  const to = document.getElementById('editPvTo')?.value.trim();
  if (!to) { toast('転換後の状態を入力してください', 'err'); return; }
  const p = state.data?.projects.find(x => x.id === pid);
  if (!p) return;
  const updated = (p.pivots || []).map(pv => pv.id === pivotId ? {
    ...pv,
    type:   document.getElementById('editPvType').value,
    from:   document.getElementById('editPvFrom')?.value.trim() || '',
    to,
    reason: document.getElementById('editPvReason')?.value.trim() || '',
    impact: document.getElementById('editPvImpact').value,
  } : pv);
  captureSnapshot(pid, 'ピボット編集');
  closeModal();
  await api('PUT', `/projects/${pid}`, { pivots: updated });
  await loadData(true);
  const pp = state.data?.projects.find(x => x.id === pid);
  if (pp) { renderProject(pp); setTimeout(() => { renderPivotDiagram(pp); renderPivotCompare(pp); }, 100); }
  toast('思考転換を更新しました', 'ok');
}

// ══════════════════════════════════════════════
//  Time Machine
// ══════════════════════════════════════════════
function renderTimeMachine(p) {
  const snaps = (p.snapshots || []).slice().reverse();
  const snapListHtml = snaps.length ? snaps.map(s => `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;">
      <div style="font-size:22px;flex-shrink:0;">📸</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:13px;font-weight:600;color:var(--text);">${esc(s.label)}</span>
          <button class="icon-btn btn-sm" style="width:20px;height:20px;font-size:10px;opacity:.6;" onclick="editSnapshotLabel('${p.id}','${s.id}','${esc(s.label)}')" title="ラベルを編集">✏️</button>
        </div>
        <div style="font-size:11px;color:var(--text2);margin-top:3px;">${s.timestamp.replace('T',' ')}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="restoreSnapshot('${p.id}','${s.id}')" style="flex-shrink:0;">⏪ ここに戻る</button>
    </div>`).join('') :
    `<div style="text-align:center;padding:32px 16px;border:2px dashed var(--border);border-radius:12px;color:var(--text2);">
      <div style="font-size:32px;margin-bottom:10px;">📸</div>
      <div style="font-size:13px;margin-bottom:8px;">スナップショットがありません</div>
      <div style="font-size:11px;">「スナップショットを作成」ボタンで現在の状態を保存できます</div>
    </div>`;

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <div>
        <h2 style="font-size:16px;font-weight:700;">⏰ タイムマシン</h2>
        <div style="font-size:11px;color:var(--text2);margin-top:2px;">過去の状態に戻せるスナップショット。開発中の分岐点・重要決断の前後に作成推奨</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="createSnapshot('${p.id}')">📸 スナップショットを作成</button>
    </div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px;">最大10件保存 · 最新順に表示 · 復元するとタスク・ログ・ピボットがその時点の状態に戻ります</div>
    ${snapListHtml}`;
}

async function editSnapshotLabel(pid, snapId, currentLabel) {
  const newLabel = prompt('スナップショットのラベルを変更', currentLabel);
  if (newLabel === null || newLabel.trim() === currentLabel) return;
  const p = state.data?.projects.find(x => x.id === pid);
  if (!p) return;
  const updated = (p.snapshots || []).map(s => s.id === snapId ? { ...s, label: newLabel.trim() || currentLabel } : s);
  await api('PUT', `/projects/${pid}`, { snapshots: updated });
  await loadData(true);
  const pp = state.data?.projects.find(x => x.id === pid);
  if (pp && state.tab === 'timemachine') document.getElementById('tabContent').innerHTML = renderTimeMachine(pp);
  toast('ラベルを更新しました', 'ok');
}

async function createSnapshot(pid) {
  const label = prompt('スナップショットのラベル（例: Groq連携実装前）', `スナップショット ${new Date().toLocaleString('ja-JP')}`);
  if (label === null) return;
  await api('POST', `/projects/${pid}/snapshot`, { label: label || 'スナップショット' });
  await loadData(true);
  const p = state.data?.projects.find(x => x.id === pid);
  if (p && state.tab === 'timemachine') document.getElementById('tabContent').innerHTML = renderTimeMachine(p);
  toast('スナップショットを作成しました', 'ok');
}

async function restoreSnapshot(pid, snapId) {
  const p = state.data?.projects.find(x => x.id === pid);
  const snap = (p?.snapshots || []).find(s => s.id === snapId);
  if (!snap) { toast('スナップショットが見つかりません', 'err'); return; }
  if (!confirm(`「${snap.label}」(${snap.timestamp.replace('T',' ')}) の状態に戻しますか？\n現在の状態は失われます（先にスナップショットを作成することを推奨します）`)) return;
  await api('POST', `/projects/${pid}/restore`, { snapshot: snap.state });
  await loadData(true);
  const updated = state.data?.projects.find(x => x.id === pid);
  if (updated) renderProject(updated);
  toast('スナップショットを復元しました', 'ok');
}

// ══════════════════════════════════════════════
//  Resume Modal（再開指示生成）
// ══════════════════════════════════════════════
function openResumeModal(pid) {
  const p = state.data?.projects.find(x => x.id === pid);
  if (!p) return;

  const allTasks = getAllTasks(p);
  const inProgress = allTasks.filter(t => t.status === 'in_progress');
  const todo = allTasks.filter(t => t.status === 'todo');
  const lastLog = (p.session_logs || []).slice(-1)[0];
  const lastPivot = (p.pivots || []).slice(-1)[0];

  const taskLines = [
    ...inProgress.map(t => `  - [進行中] ${t.title}`),
    ...todo.slice(0, 3).map(t => `  - [未着手] ${t.title}`),
  ].join('\n') || '  - タスクなし';

  const cliBase = `py 08_アプリ開発事業部/outputs/kai-tasks/kai-tasks-cli.py`;
  const cliBlock = `cd "C:\\Users\\kei\\Dropbox\\00_Antigravity\\AS_AI導入支援事業_cc"
${cliBase} ensure-server
${cliBase} show ${p.id}
${cliBase} log-action ${p.id} --type note --summary "セッション再開"`;

  const contextBlock = `## プロジェクト再開: ${p.name}
**ゴール:** ${p.goal || '未設定'}
**ステータス:** ${p.status}
**進行中・次のタスク:**
${taskLines}
${lastLog ? `**前回の活動:** [${lastLog.type}] ${lastLog.summary}` : ''}
${lastPivot ? `**最新の思考転換:** ${lastPivot.from || '?'} → ${lastPivot.to}` : ''}
**プロジェクトID:** ${p.id}

このプロジェクトを上記の状態から再開してください。`;

  openModal(`
    <h2>▶ 再開指示を生成</h2>
    <p style="font-size:12px;color:var(--text2);margin-bottom:16px;">以下をターミナルまたはKaiへの指示としてコピーしてください。</p>
    <div class="form-group">
      <label>① ターミナルコマンド（現在の状態を確認）</label>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-family:monospace;font-size:11px;color:var(--text);white-space:pre-wrap;line-height:1.7;">${esc(cliBlock)}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:6px;" onclick="copyText(${JSON.stringify(cliBlock)})">📋 コピー</button>
    </div>
    <div class="form-group">
      <label>② Kaiへの再開コンテキスト（新しい会話に貼り付け）</label>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--text);white-space:pre-wrap;line-height:1.7;">${esc(contextBlock)}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:6px;" onclick="copyText(${JSON.stringify(contextBlock)})">📋 コピー</button>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">閉じる</button>
    </div>`);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast('クリップボードにコピーしました', 'ok')).catch(() => toast('コピーできませんでした', 'err'));
}

// ══════════════════════════════════════════════
//  Task Dashboard
// ══════════════════════════════════════════════
function openTaskDashboard(taskId) {
  const overlay = document.getElementById('taskDashOverlay');
  overlay.dataset.taskId = taskId;
  renderTaskDashboard(taskId);
  overlay.style.display = 'flex';
}

function closeTaskDash() {
  document.getElementById('taskDashOverlay').style.display = 'none';
}

function renderTaskDashboard(taskId) {
  const t = findTask(taskId);
  if (!t) return;
  const p = (state.data?.projects || []).find(proj =>
    proj.big_task?.id === taskId ||
    (proj.medium_tasks||[]).some(x=>x.id===taskId) ||
    (proj.small_tasks||[]).some(x=>x.id===taskId));
  const sizeClass = p?.big_task?.id === taskId ? 'big' : (p?.medium_tasks||[]).some(x=>x.id===taskId) ? 'med' : 'small';
  const sizeName = { big:'★ 大タスク', med:'◆ 中タスク', small:'◇ 小タスク' }[sizeClass];
  const today = new Date().toISOString().slice(0,10);
  const overdue = t.due_date && t.due_date < today && t.status !== 'done';
  const links = t.related_links || [];
  const history = (t.history || []).slice().sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0,8);

  const linksHtml = links.length ? links.map(l =>
    `<div class="task-link-item" style="margin-bottom:5px;">
      <span class="task-link-icon">🔗</span>
      <div class="task-link-info">
        <a class="task-link-title" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title||l.url)}</a>
        ${l.description?`<div class="task-link-desc">${esc(l.description)}</div>`:''}
      </div></div>`).join('') : '<div style="color:var(--text2);font-size:12px;">リンクなし</div>';

  const histHtml = history.length ? history.map(h =>
    `<div class="tdp-history-item">
      <div class="tdp-history-dot"></div>
      <div><div style="font-size:12px;font-weight:600;">${esc(h.action)}</div>
      <div style="font-size:11px;color:var(--text2);">${esc(h.detail)} · ${h.timestamp.replace('T',' ')}</div></div>
    </div>`).join('') : '<div style="color:var(--text2);font-size:12px;">履歴なし</div>';

  const cycleNext = { todo:'in_progress', in_progress:'done', done:'todo' };
  const cycleLabel = { todo:'▶ 開始', in_progress:'✅ 完了', done:'↩ 戻す' };

  document.getElementById('taskDashContent').innerHTML = `
    <div class="task-dash-head">
      <div class="task-dash-title-row">
        <span class="task-badge ${sizeClass}" style="flex-shrink:0;">${{big:'1',med:'3',small:'5'}[sizeClass]}</span>
        <div>
          <div class="task-dash-title">${esc(t.title)}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:3px;">${sizeName}${p?' · '+esc(p.name):''}</div>
        </div>
      </div>
      <div class="task-dash-meta">
        <span class="task-status-pill ${t.status}">${taskStatusLabel(t.status)}</span>
        ${t.due_date?`<span class="task-due ${overdue?'overdue':''}">📅 ${t.due_date}${overdue?' ⚠️':''}</span>`:''}
        ${t.mindmap_mmd?'<span style="font-size:11px;color:#a29bfe;">🧠 マインドマップあり</span>':''}
        ${t.roadmap_mmd?'<span style="font-size:11px;color:var(--med);">🗺️ ロードマップあり</span>':''}
      </div>
      ${t.description?`<div class="task-dash-desc">${esc(t.description)}</div>`:''}
    </div>
    <div class="task-dash-body">
      <div class="task-dash-grid">
        <div class="tdp">
          <div class="tdp-head">🧠 マインドマップ
            <button class="btn-tmpl" onclick="closeTaskDash();openMindmapModal('${taskId}')">✏️ 編集</button>
          </div>
          <div class="tdp-mmd" id="tdMindmap" onclick="openTdMmd('tdMindmap','🧠 ${esc(t.title)}')">
            ${t.mindmap_mmd?'<span style="color:var(--text2);font-size:11px;">レンダリング中…</span>':'<span style="color:var(--text2);font-size:12px;">未設定 — 編集ボタンから追加</span>'}
          </div>
        </div>
        <div class="tdp">
          <div class="tdp-head">🗺️ ロードマップ
            <button class="btn-tmpl" onclick="closeTaskDash();openRoadmapModal('${taskId}')">✏️ 編集</button>
          </div>
          <div class="tdp-mmd" id="tdRoadmap" onclick="openTdMmd('tdRoadmap','🗺️ ${esc(t.title)}')">
            ${t.roadmap_mmd?'<span style="color:var(--text2);font-size:11px;">レンダリング中…</span>':'<span style="color:var(--text2);font-size:12px;">未設定 — 編集ボタンから追加</span>'}
          </div>
        </div>
        <div class="tdp">
          <div class="tdp-head">🔗 関連リンク（${links.length}件）
            <button class="btn-tmpl" onclick="closeTaskDash();openLinksModal('${taskId}')">＋ 管理</button>
          </div>
          <div class="tdp-body">${linksHtml}</div>
        </div>
        <div class="tdp">
          <div class="tdp-head">📋 変更履歴</div>
          <div class="tdp-body" style="max-height:180px;overflow-y:auto;">${histHtml}</div>
        </div>
      </div>
      <div class="tdp tdp-full" id="tdFiles">
        <div class="tdp-head">📦 成果物ファイル（${(t.output_files||[]).length}件）
          <div style="display:flex;gap:6px;">
            <button class="btn-tmpl" onclick="checkTaskFiles('${taskId}')">🔍 存在確認</button>
            <button class="btn-tmpl" onclick="openAddFileModal('${taskId}')">＋ 追加</button>
          </div>
        </div>
        <div class="tdp-body" id="tdFilesBody">${renderFilesHtml(t.output_files||[])}</div>
      </div>
    </div>
    <div class="task-dash-foot">
      <button class="btn btn-primary btn-sm" onclick="cycleDashStatus('${taskId}')">${cycleLabel[t.status]}</button>
      <button class="btn btn-ghost btn-sm" onclick="closeTaskDash();openEditTaskModal('${taskId}')">✏️ タスク編集</button>
      <button class="btn btn-ghost btn-sm" onclick="closeTaskDash();openMindmapModal('${taskId}')">🧠 マインドマップ</button>
      <button class="btn btn-ghost btn-sm" onclick="closeTaskDash();openRoadmapModal('${taskId}')">🗺️ ロードマップ</button>
      <button class="btn btn-ghost btn-sm" onclick="closeTaskDash();openLinksModal('${taskId}')">🔗 リンク</button>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="closeTaskDash()">閉じる</button>
    </div>`;

  // Render mermaid after DOM update
  setTimeout(async () => {
    for (const [elId, code] of [['tdMindmap', t.mindmap_mmd], ['tdRoadmap', t.roadmap_mmd]]) {
      if (!code) continue;
      const el = document.getElementById(elId);
      if (!el) continue;
      try {
        const id = `td-${++mmdSeq}`;
        const { svg } = await mermaid.render(id, code);
        el.innerHTML = svg + '<div class="mmd-preview-hint" style="position:absolute;bottom:6px;right:6px;">クリックで拡大</div>';
        const s = el.querySelector('svg');
        if (s) {
          s.style.cssText = 'max-width:100%;height:auto;display:block;';
          if (code.trim().startsWith('mindmap')) applyMindmapColors(s);
        }
        el.style.position = 'relative';
      } catch(e) { el.innerHTML = `<div class="mmd-error" style="font-size:10px;">${e.message}</div>`; }
    }
  }, 50);
}

// ── Output Files helpers ──
function renderFilesHtml(files) {
  if (!files || !files.length) {
    return `<div style="color:var(--text2);font-size:12px;">成果物ファイルなし — 「＋ 追加」または CLIの <code>attach-file</code> で登録できます</div>`;
  }
  return `<div class="file-list">${files.map((f, i) => `
    <div class="file-item">
      <div class="file-dot ${f.status||'unchecked'}" title="${f.status==='ok'?'正常':'消失の可能性あり'}"></div>
      <div class="file-info">
        <div class="file-label">${esc(f.label||f.path)}</div>
        <div class="file-path" title="${esc(f.path)}">${esc(f.path)}</div>
        ${f.status==='missing'?`<div class="file-missing-alert">⚠️ ファイルが見つかりません（移動・削除の可能性）</div>`:''}
        ${f.status==='unchecked'?`<div style="font-size:10px;color:var(--text2);">未確認 — 「🔍 存在確認」でチェック</div>`:''}
      </div>
      <button class="file-del-btn" onclick="removeOutputFile(event.currentTarget)" data-index="${i}" title="削除">✕</button>
    </div>`).join('')}</div>`;
}

function openAddFileModal(taskId) {
  const html = `
    <div style="font-size:16px;font-weight:700;margin-bottom:14px;">📦 成果物ファイルを追加</div>
    <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text2);display:block;margin-bottom:5px;">ファイルパス <span style="color:var(--red)">*</span></label>
    <input id="addFilePath" class="form-input" placeholder="例: D:\\Google Antigravity\\...\\report.html" style="margin-bottom:10px;font-family:monospace;font-size:12px;">
    <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text2);display:block;margin-bottom:5px;">ラベル（省略可）</label>
    <input id="addFileLabel" class="form-input" placeholder="ファイルの分かりやすい名前" style="margin-bottom:14px;">
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">キャンセル</button>
      <button class="btn btn-primary btn-sm" onclick="addOutputFile('${taskId}')">追加</button>
    </div>`;
  openModal(html);
}

async function addOutputFile(taskId) {
  const path = document.getElementById('addFilePath')?.value.trim();
  if (!path) { toast('ファイルパスを入力してください', 'err'); return; }
  const label = document.getElementById('addFileLabel')?.value.trim() || path.split(/[\\/]/).pop();
  const t = findTask(taskId);
  if (!t) return;
  const files = [...(t.output_files || []), {
    id: Math.random().toString(36).slice(2, 10),
    path, label, added_at: new Date().toISOString().slice(0, 19), status: 'unchecked'
  }];
  captureSnapshotForTask(taskId, 'ファイル追加');
  await api('PUT', `/tasks/${taskId}`, { output_files: files });
  await loadData(true);
  closeModal();
  renderTaskDashboard(taskId);
  toast('ファイルを追加しました', 'ok');
}

async function removeOutputFile(btn) {
  const idx = parseInt(btn.dataset.index, 10);
  const overlay = document.getElementById('taskDashOverlay');
  const taskId = overlay?.dataset.taskId;
  if (!taskId) return;
  const t = findTask(taskId);
  if (!t) return;
  captureSnapshotForTask(taskId, 'ファイル削除');
  const files = (t.output_files || []).filter((_, i) => i !== idx);
  await api('PUT', `/tasks/${taskId}`, { output_files: files });
  await loadData(true);
  renderTaskDashboard(taskId);
  toast('削除しました', 'ok');
}

async function checkTaskFiles(taskId) {
  const t = findTask(taskId);
  if (!t) return;
  const files = t.output_files || [];
  if (!files.length) { toast('追跡ファイルがありません', 'err'); return; }
  toast('確認中…', 'ok');
  const paths = files.map(f => f.path);
  const results = await api('POST', '/files/check', { paths });
  let missingCount = 0;
  const updated = files.map(f => {
    const exists = results[f.path];
    if (!exists) missingCount++;
    return { ...f, status: exists ? 'ok' : 'missing' };
  });
  await api('PUT', `/tasks/${taskId}`, { output_files: updated });
  await loadData(true);
  renderTaskDashboard(taskId);
  toast(missingCount > 0 ? `⚠️ ${missingCount}件が見つかりません` : '✅ すべて正常', missingCount > 0 ? 'err' : 'ok');
}

function openTdMmd(elId, title) {
  const svgEl = document.getElementById(elId)?.querySelector('svg');
  if (!svgEl) return;
  openMmdPopup(svgEl, title);
}

async function cycleDashStatus(taskId) {
  const t = findTask(taskId);
  if (!t) return;
  captureSnapshotForTask(taskId, 'ステータス変更');
  const next = { todo:'in_progress', in_progress:'done', done:'todo' }[t.status];
  await api('PUT', `/tasks/${taskId}`, { status: next });
  await loadData(true);
  renderTaskDashboard(taskId);
  const p = state.data?.projects.find(p => p.id === state.projectId);
  if (p) { const tc = document.getElementById('tabContent'); if (tc) tc.innerHTML = renderTabContent(p); }
  toast(`→ ${taskStatusLabel(next)}`, 'ok');
}

// ══════════════════════════════════════════════
//  AI Modal
// ══════════════════════════════════════════════
function closeAiModal() {
  document.getElementById('aiModalOverlay').style.display = 'none';
}

async function openDecomposeModal(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  const proj = (state.data?.projects || []).find(p =>
    (p.big_task?.id === taskId) ||
    (p.medium_tasks||[]).some(t => t.id === taskId) ||
    (p.small_tasks||[]).some(t => t.id === taskId)
  );

  const overlay = document.getElementById('aiModalOverlay');
  const titleEl = document.getElementById('aiModalTitle');
  const body    = document.getElementById('aiModalBody');
  const foot    = document.getElementById('aiModalFoot');

  titleEl.textContent = `✂️ タスク分解：${task.title}`;
  body.innerHTML = `<div class="ai-loading"><div class="ai-spin"></div>分解中…</div>`;
  foot.innerHTML = '';
  overlay.style.display = 'flex';

  try {
    const res = await fetch('/api/ai/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: task.title,
        description: task.description || '',
        project_goal: proj?.goal || '',
        project_memo: proj?.memo || '',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const json = await res.json();
    const steps = json.steps || [];
    if (!steps.length) { body.innerHTML = '<p>ステップを生成できませんでした。</p>'; return; }

    body.innerHTML = steps.map((s, i) => renderDecomposeStepHtml(s, i)).join('')
      + `<div class="decompose-add-hint"></div>`;
    foot.innerHTML = `
      <button class="btn btn-ghost btn-sm" onclick="addDecomposeStep()" style="margin-right:auto;">＋ ステップ追加</button>
      <button class="btn btn-ghost" onclick="closeAiModal()">閉じる</button>
      <button class="btn btn-primary" onclick="confirmDecompose('${taskId}')">✅ 決定・マップへ反映</button>`;
  } catch (e) {
    body.innerHTML = `<p style="color:var(--red);">エラー：${esc(e.message)}</p>`;
    foot.innerHTML = `<button class="btn btn-ghost" onclick="closeAiModal()">閉じる</button>`;
  }
}

function renderDecomposeStepHtml(s, i) {
  return `
    <div class="ai-step-editable">
      <div class="ai-step-num">${i + 1}</div>
      <div class="ai-step-inputs">
        <input class="step-input step-title" placeholder="ステップのタイトル" value="${esc(s.title || '')}">
        <textarea class="step-input step-desc" placeholder="説明・手順（省略可）" rows="2" style="resize:vertical;">${esc(s.description || '')}</textarea>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;color:var(--text2);">⏱</span>
          <input class="step-input step-time" type="number" min="1" placeholder="—" value="${s.estimated_minutes || ''}" style="width:64px;text-align:right;">
          <span style="font-size:11px;color:var(--text2);">分</span>
        </div>
      </div>
      <button class="step-del" onclick="removeDecomposeStep(this)" title="削除">×</button>
    </div>`;
}

function removeDecomposeStep(btn) {
  btn.closest('.ai-step-editable').remove();
  renumberDecomposeSteps();
}

function addDecomposeStep() {
  const body = document.getElementById('aiModalBody');
  const hint = body.querySelector('.decompose-add-hint');
  const i = body.querySelectorAll('.ai-step-editable').length;
  const tmp = document.createElement('div');
  tmp.innerHTML = renderDecomposeStepHtml({ title: '', estimated_minutes: null }, i);
  body.insertBefore(tmp.firstElementChild, hint || null);
}

function renumberDecomposeSteps() {
  document.querySelectorAll('.ai-step-editable .ai-step-num').forEach((el, i) => {
    el.textContent = i + 1;
  });
}

function collectDecomposeSteps() {
  return Array.from(document.querySelectorAll('.ai-step-editable')).map(card => ({
    title: card.querySelector('.step-title')?.value?.trim() || '',
    description: card.querySelector('.step-desc')?.value?.trim() || '',
    estimated_minutes: parseInt(card.querySelector('.step-time')?.value || '0', 10) || null,
  })).filter(s => s.title);
}

function _mmdLabel(str) { return str.replace(/"/g, "'").replace(/[<>{}|]/g, ' ').trim(); }

async function confirmDecompose(taskId) {
  const steps = collectDecomposeSteps();
  if (!steps.length) { toast('ステップが1つもありません', 'err'); return; }

  const task = findTask(taskId);
  const proj = (state.data?.projects || []).find(p =>
    p.big_task?.id === taskId ||
    (p.medium_tasks||[]).some(t => t.id === taskId) ||
    (p.small_tasks||[]).some(t => t.id === taskId)
  );

  closeAiModal();
  toast('マップに反映中…', 'ok');

  await api('PUT', `/tasks/${taskId}`, {
    roadmap_mmd: stepsToRoadmapMmd(task.title, steps),
    mindmap_mmd: stepsToMindmapMmd(task.title, steps),
  });

  if (proj) {
    const logEntry = {
      id: Date.now().toString(36),
      timestamp: new Date().toISOString(),
      type: 'decision',
      summary: `✂️ 「${task.title}」を ${steps.length} ステップに分解`,
      detail: steps.map((s, i) => `Step${i+1}: ${s.title}${s.estimated_minutes ? ` (約${s.estimated_minutes}分)` : ''}`).join('\n'),
    };
    await api('PUT', `/projects/${proj.id}`, { session_logs: [...(proj.session_logs || []), logEntry] });
  }

  await loadData(true);
  const p = state.data?.projects.find(x => x.id === state.projectId);
  if (p) renderProject(p);
  toast(`✅ ${steps.length}ステップをロードマップ・マインドマップに反映しました`, 'ok');
}

function stepsToRoadmapMmd(title, steps) {
  const t = _mmdLabel(title.slice(0, 22));
  const nodes = [`  S0(["🎯 ${t}"])`];
  steps.forEach((s, i) => {
    const lbl = _mmdLabel(s.title.slice(0, 22));
    const time = s.estimated_minutes ? ` (${s.estimated_minutes}分)` : '';
    nodes.push(`  S${i+1}["${lbl}${time}"]`);
  });
  nodes.push(`  DONE(["✅ 完了"])`);
  const conns = [`  S0 --> S1`];
  steps.forEach((_, i) => conns.push(i < steps.length - 1 ? `  S${i+1} --> S${i+2}` : `  S${i+1} --> DONE`));
  return `graph TD\n${nodes.join('\n')}\n${conns.join('\n')}\n\n  style S0 fill:#6c63ff,color:#fff\n  style DONE fill:#43e97b,color:#000`;
}

function stepsToMindmapMmd(title, steps) {
  const t = _mmdLabel(title.slice(0, 26));
  const lines = steps.map((s, i) => {
    const lbl = _mmdLabel(s.title.slice(0, 24));
    const sub = s.estimated_minutes ? `\n      約${s.estimated_minutes}分` : '';
    return `    Step${i+1}: ${lbl}${sub}`;
  });
  return `mindmap\n  root(("${t}"))\n${lines.join('\n')}`;
}

async function openRecommendModal(projectId) {
  const proj = (state.data?.projects || []).find(p => p.id === projectId);
  if (!proj) return;

  const all = [];
  if (proj.big_task) all.push(proj.big_task);
  (proj.medium_tasks||[]).forEach(t => all.push(t));
  (proj.small_tasks||[]).forEach(t => all.push(t));
  const completed = all.filter(t => t.status === 'done').map(t => t.title);
  const pending   = all.filter(t => t.status !== 'done').map(t => t.title);

  const overlay = document.getElementById('aiModalOverlay');
  const title   = document.getElementById('aiModalTitle');
  const body    = document.getElementById('aiModalBody');
  const foot    = document.getElementById('aiModalFoot');

  title.textContent = `💡 推奨タスク：${proj.name}`;
  body.innerHTML = `<div class="ai-loading"><div class="ai-spin"></div>推奨タスクを生成中…</div>`;
  foot.innerHTML = '';
  overlay.style.display = 'flex';

  try {
    const res = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_name: proj.name,
        goal: proj.goal || '',
        memo: proj.memo || '',
        completed_tasks: completed,
        pending_tasks: pending,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const json = await res.json();
    const recs = json.recommendations || [];
    if (!recs.length) { body.innerHTML = '<p>推奨タスクを生成できませんでした。</p>'; return; }
    body.innerHTML = recs.map((r, i) => `
      <div class="ai-rec-card">
        <div class="ai-rec-priority ${r.priority}">${r.priority === 'high' ? '🔴 高' : r.priority === 'medium' ? '🟡 中' : '🟢 低'}</div>
        <div style="flex:1">
          <div class="ai-step-title">${esc(r.title)}</div>
          ${r.reason ? `<div class="ai-step-desc">${esc(r.reason)}</div>` : ''}
          <div style="font-size:10px;color:var(--text2);margin-top:4px;">種別：${r.type === 'big' ? '大タスク' : r.type === 'medium' ? '中タスク' : '小タスク'}</div>
        </div>
        <button class="btn btn-primary" style="font-size:11px;padding:4px 10px;white-space:nowrap;"
          onclick="addRecommendedTask('${projectId}','${esc(r.title).replace(/'/g,"\\'")}','${r.type||'small'}','${esc(r.reason||'').replace(/'/g,"\\'")}')">＋追加</button>
      </div>`).join('');
    foot.innerHTML = `<button class="btn btn-ghost" onclick="closeAiModal()">閉じる</button>`;
  } catch (e) {
    body.innerHTML = `<p style="color:var(--red);">エラー：${esc(e.message)}</p>`;
    foot.innerHTML = `<button class="btn btn-ghost" onclick="closeAiModal()">閉じる</button>`;
  }
}

async function addRecommendedTask(projectId, title, type, reason) {
  const sizeMap = { big: 'big_task', medium: 'medium_tasks', small: 'small_tasks' };
  const endpoint = type === 'big' ? `/api/projects/${projectId}/big-task`
                 : type === 'medium' ? `/api/projects/${projectId}/medium-tasks`
                 : `/api/projects/${projectId}/small-tasks`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadData();
    toast('タスクを追加しました', 'ok');
    closeAiModal();
  } catch (e) {
    toast(`追加失敗：${e.message}`, 'error');
  }
}

// ══════════════════════════════════════════════
//  Init
// ══════════════════════════════════════════════
loadData();
setupSSE();
_initZoomEvents();
