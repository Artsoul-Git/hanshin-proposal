#!/usr/bin/env python3
"""Kai Visualize Server  port 3458
セッション管理・マンダラ含む全工程をGroq API自動生成
Usage: python server.py
"""
import json, os, uuid, datetime, threading, queue, webbrowser, re, time
import urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver

PORT = 3458
BASE = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(BASE, 'state.json')

_clients: dict = {}
_lock = threading.Lock()

PALETTE = [
    {'c':'#c62828','bg':'#ffebee','bc':'#ef9a9a'},
    {'c':'#2e7d32','bg':'#e8f5e9','bc':'#a5d6a7'},
    {'c':'#e65100','bg':'#fff3e0','bc':'#ffcc80'},
    {'c':'#0277bd','bg':'#e1f5fe','bc':'#81d4fa'},
    {'c':'#6a1b9a','bg':'#f3e5f5','bc':'#ce93d8'},
    {'c':'#00695c','bg':'#e0f2f1','bc':'#80cbc4'},
    {'c':'#1565c0','bg':'#e3f2fd','bc':'#90caf9'},
    {'c':'#4e342e','bg':'#efebe9','bc':'#bcaaa4'},
]


# ─── State I/O ───

def _load() -> dict:
    try:
        with open(STATE_FILE, encoding='utf-8') as f:
            s = json.load(f)
    except FileNotFoundError:
        s = {}
    return _migrate(s)


def _migrate(s: dict) -> dict:
    if 'sessions' not in s:
        s = {'sessions': [], 'queue': []}
    if 'queue' not in s:
        s['queue'] = []
    return s


def _save(s: dict) -> None:
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(s, f, ensure_ascii=False, indent=2)


def _get_session(s: dict, sid: str):
    for sess in s.get('sessions', []):
        if sess['id'] == sid:
            return sess
    return None


def _broadcast(event: str, data: dict) -> None:
    msg = f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
    with _lock:
        for q in list(_clients.values()):
            try:
                q.put_nowait(msg)
            except Exception:
                pass


# ─── Groq API ───

def _call_groq(prompt: str) -> str:
    api_key = os.environ.get('GROQ_API_KEY', '')
    if not api_key:
        raise RuntimeError('GROQ_API_KEY が設定されていません')
    payload = json.dumps({
        'model': 'llama-3.3-70b-versatile',
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 2048,
        'temperature': 0.7
    }, ensure_ascii=False).encode('utf-8')
    url = 'https://api.groq.com/openai/v1/chat/completions'
    for attempt in range(3):
        req = urllib.request.Request(url, data=payload, headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
            'User-Agent': 'python-requests/2.31.0',
            'Accept': 'application/json'
        })
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                resp = json.loads(r.read())
                return resp['choices'][0]['message']['content']
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='replace')
            print(f'[GROQ] HTTP {e.code}: {body[:500]}')
            if e.code == 429 and attempt < 2:
                wait = 10 * (attempt + 1)
                print(f'[GROQ] レート制限。{wait}秒後にリトライ ({attempt+1}/3)')
                time.sleep(wait)
            else:
                raise


def _extract_json(text: str):
    text = re.sub(r'```[a-z]*\n?', '', text).strip()
    text = re.sub(r'\n?```', '', text).strip()
    match = re.search(r'[\[{][\s\S]*[\]}]', text)
    if not match:
        raise ValueError('JSON が見つかりませんでした')
    return json.loads(match.group(0))


def _sanitize_mermaid(text: str) -> str:
    lines = []
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('style ') or s.startswith('classDef ') or s.startswith('class '):
            continue
        lines.append(line)
    text = '\n'.join(lines).strip()
    text = re.sub(r'^```[a-z]*\n?', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n?```$', '', text, flags=re.MULTILINE)
    return text.strip()


# ─── Generators ───

def _gen_mandala(theme: str) -> list:
    prompt = f"""テーマ「{theme}」のマンダラチャートを日本語で生成してください。
中心テーマを展開する8つのサブテーマと、各サブテーマの8つのタスク・アクションを考えてください。

以下のJSON形式のみで返答してください（説明・コードブロック不要）：
{{
  "themes": [
    {{"name": "サブテーマ（8字以内）", "tasks": ["タスク（15字以内）","タスク","タスク","タスク","タスク","タスク","タスク","タスク"]}},
    {{"name": "...（計8テーマ）"}}
  ]
}}
8テーマ×8タスク=64個必須。"""
    data = _extract_json(_call_groq(prompt))
    themes = data.get('themes', [])[:8]
    for i, t in enumerate(themes):
        t.update(PALETTE[i % 8])
        t['tasks'] = [str(tk)[:20] for tk in t.get('tasks', [])[:8]]
        while len(t['tasks']) < 8:
            t['tasks'].append(f'タスク{len(t["tasks"])+1}')
    while len(themes) < 8:
        idx = len(themes)
        themes.append({'name': f'テーマ{idx+1}', 'tasks': [f'タスク{j+1}' for j in range(8)], **PALETTE[idx % 8]})
    return themes


def _gen_4q(sess: dict, ti: int, tj=None) -> dict:
    theme = sess.get('theme', '')
    themes = (sess.get('mandala') or {}).get('themes', [])
    sub_name = themes[ti]['name'] if ti < len(themes) else f'テーマ{ti+1}'

    if tj is not None:
        tasks = themes[ti].get('tasks', []) if ti < len(themes) else []
        task_name = tasks[tj] if tj < len(tasks) else f'タスク{tj+1}'
        prompt = f"""テーマ「{theme}」のサブテーマ「{sub_name}」のタスク「{task_name}」を実行するための具体的アクションを4象限マトリクスに整理してください。

8つのアクション・サブタスクを考案し、以下のJSON形式のみで返答してください（説明不要）：
{{
  "axis": {{"x": "実施難易度", "y": "期待効果"}},
  "tl": {{"lbl": "🔴 今すぐ着手", "items": [{{"t": "アクション名", "s": "理由（25字以内）"}}]}},
  "tr": {{"lbl": "🔵 計画的推進", "items": [{{"t": "アクション名", "s": "理由（25字以内）"}}]}},
  "bl": {{"lbl": "🟢 余力でやる", "items": [{{"t": "アクション名", "s": "理由（25字以内）"}}]}},
  "br": {{"lbl": "⚪ 保留・見直し", "items": [{{"t": "アクション名", "s": "理由（25字以内）"}}]}}
}}
※ 8アクションをすべていずれかの象限に配置。"""
    else:
        tasks_str = ', '.join(themes[ti].get('tasks', [])) if ti < len(themes) else ''
        prompt = f"""テーマ「{theme}」のサブテーマ「{sub_name}」の8タスクを4象限マトリクスに整理してください。

タスク一覧：{tasks_str}

以下のJSON形式のみで返答してください（説明不要）：
{{
  "axis": {{"x": "実施コスト・難易度", "y": "期待インパクト"}},
  "tl": {{"lbl": "🔴 今すぐ着手", "items": [{{"t": "タスク名", "s": "理由（25字以内）"}}]}},
  "tr": {{"lbl": "🔵 計画的推進", "items": [{{"t": "タスク名", "s": "理由（25字以内）"}}]}},
  "bl": {{"lbl": "🟢 余力でやる", "items": [{{"t": "タスク名", "s": "理由（25字以内）"}}]}},
  "br": {{"lbl": "⚪ 保留・見直し", "items": [{{"t": "タスク名", "s": "理由（25字以内）"}}]}}
}}
※ 8タスクをすべていずれかの象限に配置。"""
    return _extract_json(_call_groq(prompt))


def _gen_flow(sess: dict, ti: int, context: str) -> str:
    theme = sess.get('theme', '')
    prompt = f"""テーマ「{theme}」のアクション「{context}」の実行手順をMermaidフロー図で生成してください。

【Mermaid構文ルール（必ず守ること）】
- 1行目: flowchart TD
- ノードID: 英字1〜2文字のみ（A B C D E F G H）
- 全ラベルは二重引用符で囲む: A["開始"]
- 分岐（菱形）: D{{"判断？"}}
- 条件付き矢印: D -- "はい" --> E
- style/classDef/class 文は一切書かない
- コードブロック（```）は書かない

【構成（8〜10ノード）】
開始 → 準備ステップ2〜3個 → 分岐1箇所 → 実行ステップ2〜3個 → 終了

Mermaidコードのみ出力:"""
    return _sanitize_mermaid(_call_groq(prompt))


def _gen_gantt(sess: dict, ti: int, context: str) -> dict:
    theme = sess.get('theme', '')
    prompt = f"""テーマ「{theme}」のアクション「{context}」について、実行スケジュールとタスク詳細を生成してください。

以下の形式で出力してください（===の行はそのまま出力）：

===MERMAID===
gantt
    title {context}の実行計画
    dateFormat YYYY-MM-DD
    excludes weekends
    section 準備フェーズ
    （タスクをここに）
    section 実行フェーズ
    （タスクをここに）
    section 完了フェーズ
    （タスクをここに）
===TASKS===
[
  {{"id": "t1", "title": "タスク名", "summary": "作業内容1〜2文", "notes": "注意点1〜2文"}}
]

【Mermaidのルール】
- gantt（gは1つ）
- タスクID: t1 t2 t3...（英数字のみ）
- タスク名にコロン・カッコ・スラッシュ不可
- 形式: タスク名 :t1, 2026-06-01, 3d
- クリティカル: タスク名 :crit, t2, 2026-06-04, 5d
- マイルストーン: 完了確認 :milestone, m1, 2026-06-14, 0d
- 3セクション計6〜8タスク、コードブロック不要"""
    text = _call_groq(prompt)
    mermaid_code = ''
    tasks = []
    if '===MERMAID===' in text and '===TASKS===' in text:
        parts = text.split('===TASKS===')
        mermaid_part = parts[0].replace('===MERMAID===', '').strip()
        tasks_part = parts[1].strip()
        mermaid_code = _sanitize_mermaid(mermaid_part)
        try:
            arr_match = re.search(r'\[[\s\S]*\]', tasks_part)
            if arr_match:
                tasks = json.loads(arr_match.group(0))
        except Exception as e:
            print(f'[GANTT] タスクJSON解析エラー: {e}')
    else:
        mermaid_code = _sanitize_mermaid(text)
    return {'mermaid': mermaid_code, 'tasks': tasks}


# ─── Auto Generate ───

def _auto_generate(req: dict) -> None:
    sid = req.get('session_id', '')
    ti = req.get('theme_id')
    tj = req.get('task_id')
    gtype = req.get('type', '')
    context = req.get('context', '')
    req_id = req['id']
    default_key = f"{ti}_{tj}" if tj is not None else str(ti)
    state_key = req.get('flow_key') or default_key

    print(f'[AUTO] 生成開始: {gtype} / session={sid} (id={req_id})')
    try:
        s = _load()
        sess = _get_session(s, sid)
        if not sess:
            raise RuntimeError(f'セッション {sid} が見つかりません')

        if gtype == 'mandala':
            content = _gen_mandala(sess['theme'])
            sess['mandala'] = {'themes': content}
            bcast_key = 'mandala'
            bcast_content = {'themes': content}
        elif gtype == '4q':
            content = _gen_4q(sess, ti, tj)
            sess.setdefault('generated', {}).setdefault('4q', {})[state_key] = content
            bcast_key, bcast_content = state_key, content
        elif gtype == 'flow':
            content = _gen_flow(sess, ti, context)
            sess.setdefault('generated', {}).setdefault('flow', {})[state_key] = content
            bcast_key, bcast_content = state_key, content
        elif gtype == 'gantt':
            content = _gen_gantt(sess, ti, context)
            sess.setdefault('generated', {}).setdefault('gantt', {})[state_key] = content
            bcast_key, bcast_content = state_key, content
        else:
            return

        sess['updatedAt'] = datetime.datetime.now().isoformat()
        s['queue'] = [q for q in s['queue'] if q['id'] != req_id]
        _save(s)
        _broadcast('content_ready', {
            'type': gtype, 'session_id': sid,
            'key': bcast_key, 'content': bcast_content
        })
        print(f'[AUTO] 生成完了: {gtype} / session={sid}')

    except Exception as e:
        print(f'[AUTO] エラー: {e}')
        s = _load()
        s['queue'] = [q for q in s['queue'] if q['id'] != req_id]
        _save(s)
        _broadcast('generate_error', {'id': req_id, 'error': str(e)})


# ─── HTTP Handler ───

class _Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        p = self.path.split('?')[0]
        if p == '/':
            self._file('index.html', 'text/html; charset=utf-8')
        elif p == '/has-api-key':
            self._json({'ok': bool(os.environ.get('GROQ_API_KEY'))})
        elif p == '/events':
            self._sse()
        elif p == '/api/sessions':
            s = _load()
            summaries = []
            for sess in s.get('sessions', []):
                gen = sess.get('generated', {})
                summaries.append({
                    'id': sess['id'],
                    'theme': sess.get('theme', ''),
                    'title': sess.get('title', sess.get('theme', '')),
                    'memo': sess.get('memo', ''),
                    'createdAt': sess.get('createdAt', ''),
                    'updatedAt': sess.get('updatedAt', ''),
                    'progress': {
                        'mandala': bool(sess.get('mandala')),
                        '4q': bool(gen.get('4q')),
                        'flow': bool(gen.get('flow')),
                        'gantt': bool(gen.get('gantt')),
                    }
                })
            summaries.sort(key=lambda x: x.get('updatedAt', ''), reverse=True)
            self._json(summaries)
        elif p.startswith('/api/sessions/'):
            sid = p[len('/api/sessions/'):]
            s = _load()
            sess = _get_session(s, sid)
            if not sess:
                self.send_response(404); self.end_headers(); return
            self._json(sess)
        else:
            self.send_response(404); self.end_headers()

    def _read_body(self):
        try:
            n = int(self.headers.get('Content-Length', 0))
            return json.loads(self.rfile.read(n)) if n else {}
        except Exception:
            return None

    def do_POST(self):
        body = self._read_body()
        if body is None:
            self.send_response(400); self.end_headers(); return

        p = self.path
        if p == '/api/sessions':
            theme = body.get('theme', '').strip()
            if not theme:
                self._json({'ok': False, 'error': 'theme required'}); return
            now = datetime.datetime.now().isoformat()
            sess = {
                'id': str(uuid.uuid4())[:8],
                'theme': theme,
                'title': theme,
                'memo': '',
                'createdAt': now,
                'updatedAt': now,
                'mandala': None,
                'generated': {'4q': {}, 'flow': {}, 'gantt': {}}
            }
            s = _load()
            s['sessions'].insert(0, sess)
            _save(s)
            self._json(sess)

        elif p == '/request':
            req = {
                'id': str(uuid.uuid4())[:8],
                'session_id': body.get('session_id', ''),
                'type': body.get('type'),
                'theme_id': body.get('theme_id'),
                'task_id': body.get('task_id'),
                'context': body.get('context', ''),
                'flow_key': body.get('flow_key'),
                'status': 'pending',
                'created_at': datetime.datetime.now().isoformat(),
            }
            s = _load()
            s['queue'].append(req)
            _save(s)
            _broadcast('request_added', req)
            self._json({'ok': True, 'id': req['id']})
            if os.environ.get('GROQ_API_KEY'):
                threading.Thread(target=_auto_generate, args=(req,), daemon=True).start()

        elif p == '/clear-queue':
            s = _load()
            s['queue'] = []
            _save(s)
            self._json({'ok': True})

        else:
            self.send_response(404); self.end_headers()

    def do_PATCH(self):
        body = self._read_body()
        if body is None:
            self.send_response(400); self.end_headers(); return

        p = self.path
        if p.startswith('/api/sessions/'):
            sid = p[len('/api/sessions/'):]
            s = _load()
            sess = _get_session(s, sid)
            if not sess:
                self.send_response(404); self.end_headers(); return
            if 'title' in body:
                sess['title'] = body['title']
            if 'memo' in body:
                sess['memo'] = body['memo']
            sess['updatedAt'] = datetime.datetime.now().isoformat()
            _save(s)
            self._json({'ok': True})
        else:
            self.send_response(404); self.end_headers()

    def do_DELETE(self):
        p = self.path
        if p.startswith('/api/sessions/'):
            sid = p[len('/api/sessions/'):]
            s = _load()
            s['sessions'] = [sess for sess in s['sessions'] if sess['id'] != sid]
            _save(s)
            self._json({'ok': True})
        else:
            self.send_response(404); self.end_headers()

    def _file(self, name: str, ct: str):
        try:
            with open(os.path.join(BASE, name), 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', ct)
            self.send_header('Content-Length', len(data))
            self._cors()
            self.end_headers()
            self.wfile.write(data)
        except FileNotFoundError:
            self.send_response(404); self.end_headers()

    def _json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _sse(self):
        cid = str(uuid.uuid4())
        q: queue.Queue = queue.Queue()
        with _lock:
            _clients[cid] = q
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self._cors()
        self.end_headers()
        try:
            self.wfile.write(b': ok\n\n')
            self.wfile.flush()
            while True:
                try:
                    msg = q.get(timeout=25)
                    self.wfile.write(msg.encode())
                    self.wfile.flush()
                except queue.Empty:
                    self.wfile.write(b': ping\n\n')
                    self.wfile.flush()
        except Exception:
            pass
        finally:
            with _lock:
                _clients.pop(cid, None)

    def log_message(self, *_):
        pass


class _Server(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True


if __name__ == '__main__':
    has_key = bool(os.environ.get('GROQ_API_KEY'))
    mode = 'クリック自動生成モード' if has_key else '手動生成モード（API キーなし）'
    print(f'Kai Visualize Server: http://localhost:{PORT}  [{mode}]  (Ctrl+C で停止)')
    srv = _Server(('localhost', PORT), _Handler)
    threading.Timer(1.2, lambda: webbrowser.open(f'http://localhost:{PORT}')).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\n停止')
