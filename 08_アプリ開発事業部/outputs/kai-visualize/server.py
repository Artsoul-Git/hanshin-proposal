#!/usr/bin/env python3
"""Kai Visualize Server  port 3458
クリックで自動生成: GROQ_API_KEY が環境変数にあれば Groq API を直接呼び出す
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

# ─── テーマ・タスクデータ（index.html と同期） ───
THEMES = [
    '顧客開拓', '提案品質向上', '収益・財務設計', 'マーケティング',
    'セミナー事業', 'パートナー連携', '業務効率化', '人材・組織体制'
]
TASKS = [
    ['ターゲット業種絞り込み','リード獲得フロー設計','紹介・口コミ仕組み化','問い合わせページ最適化','SNS露出増加','無料診断メニュー作成','月次アプローチ件数管理','商談→成約率改善'],
    ['スキルセット拡充','ケーススタディ蓄積','提案書テンプレ改善','実績事例ドキュメント化','Kai精度継続評価','業種別ノウハウ整備','ファクトチェック徹底','フィードバック収集'],
    ['月次収益目標設定','料金体系見直し','収益源の多角化','損益シミュレーション','CF計画の立案','投資計画の策定','粗利率の改善','年間売上KPI分解'],
    ['LP設計最適化','コンテンツマーケ','メルマガリスト構築','SEO/SNS戦略','無料セミナー告知','事例コンテンツ発信','USP明確化','広告運用検討'],
    ['セミナーテーマ計画','参加者目標管理','セミナー後フォロー','動画コンテンツ化','スライド品質向上','アーカイブ運用','有料セミナー展開','コラボセミナー'],
    ['税理士・社労士連携','中小企業診断士連携','差別化ポジション','紹介ネットワーク構築','アライアンス条件設計','共同提案の仕組み','補助金情報提供','商工会・金融機関'],
    ['Kai作業フロー最適化','テンプレート整備','ファイル管理徹底','定型業務の自動化','作業時間の計測','外注可能業務整理','ツール棚卸し','週次レビュー習慣化'],
    ['上村スキル強化計画','外注スタッフ活用検討','Kaiとの役割分担','業務委託先選定基準','自社ナレッジ整備','学習・インプット計画','健康・稼働管理','3年後の組織像設計'],
]


# ─── State I/O ───
def _load() -> dict:
    try:
        with open(STATE_FILE, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'generated': {'4q': {}, 'flow': {}, 'gantt': {}}, 'queue': []}


def _save(state: dict) -> None:
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def _broadcast(event: str, data: dict) -> None:
    msg = f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
    with _lock:
        for q in list(_clients.values()):
            try:
                q.put_nowait(msg)
            except Exception:
                pass


# ─── Groq API ───
def _call_gemini(prompt: str) -> str:
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


def _extract_json(text: str) -> dict:
    # コードブロックを除去してJSONを抽出
    text = re.sub(r'```[a-z]*\n?', '', text).strip()
    match = re.search(r'\{[\s\S]*\}', text)
    if not match:
        raise ValueError('JSON が見つかりませんでした')
    return json.loads(match.group(0))


def _gen_4q(ti: int) -> dict:
    theme = THEMES[ti]
    tasks = ', '.join(TASKS[ti])
    prompt = f"""AI導入支援コンサルタントとして、テーマ「{theme}」の8タスクを4象限マトリクスに整理してください。

タスク一覧：{tasks}

以下のJSON形式のみで返答してください（説明・コードブロック不要）：
{{
  "axis": {{"x": "実施コスト・難易度", "y": "期待インパクト"}},
  "tl": {{"lbl": "🔴 今すぐ着手", "items": [{{"t": "タスク名", "s": "理由（25字以内）", "flow": false}}]}},
  "tr": {{"lbl": "🔵 計画的推進", "items": [{{"t": "タスク名", "s": "理由（25字以内）"}}]}},
  "bl": {{"lbl": "🟢 余力でやる", "items": [{{"t": "タスク名", "s": "理由（25字以内）"}}]}},
  "br": {{"lbl": "⚪ 保留・見直し", "items": [{{"t": "タスク名", "s": "理由（25字以内）"}}]}}
}}
※ 8タスクをすべていずれかの象限に配置。Q1（今すぐ着手）の最重要タスク1つのみ "flow": true を付けてください。"""
    return _extract_json(_call_gemini(prompt))


def _gen_4q_task(ti: int, tj: int) -> dict:
    theme = THEMES[ti]
    task = TASKS[ti][tj]
    prompt = f"""AI導入支援コンサルタントとして、テーマ「{theme}」の施策「{task}」を実行するための具体的アクションを4象限マトリクスに整理してください。

「{task}」を進めるための8つのアクション・サブタスクを考案し、以下のJSON形式のみで返答してください（説明・コードブロック不要）：
{{
  "axis": {{"x": "実施難易度", "y": "期待効果"}},
  "tl": {{"lbl": "🔴 今すぐ着手", "items": [{{"t": "アクション名", "s": "理由（25字以内）", "flow": false}}]}},
  "tr": {{"lbl": "🔵 計画的推進", "items": [{{"t": "アクション名", "s": "理由（25字以内）"}}]}},
  "bl": {{"lbl": "🟢 余力でやる", "items": [{{"t": "アクション名", "s": "理由（25字以内）"}}]}},
  "br": {{"lbl": "⚪ 保留・見直し", "items": [{{"t": "アクション名", "s": "理由（25字以内）"}}]}}
}}
※ 8アクションをすべていずれかの象限に配置。Q1（今すぐ着手）の最重要アクション1つのみ "flow": true を付けてください。"""
    return _extract_json(_call_gemini(prompt))


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


def _gen_flow(ti: int, context: str) -> str:
    theme = THEMES[ti]
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
    return _sanitize_mermaid(_call_gemini(prompt))


def _gen_gantt(ti: int, context: str) -> str:
    theme = THEMES[ti]
    prompt = f"""テーマ「{theme}」（{context}）の実行スケジュールをMermaidガントチャートで生成してください。

【Mermaid構文ルール（必ず守ること）】
- 1行目: gantt（gが1つ。"gaantt"は誤り）
- 2行目: title {context}の実行計画
- 3行目: dateFormat YYYY-MM-DD
- 4行目: excludes weekends
- タスク名に括弧・コロン・スラッシュは使わない
- クリティカルタスク: タスク名 :crit, 2026-06-01, 5d
- マイルストーン: 名前 :milestone, 2026-06-07, 0d
- コードブロック（```）は書かない

【構成】
section 準備フェーズ（3タスク）
section 実行フェーズ（3タスク、うち1つcrit）
section 完了フェーズ（マイルストーン2個）

開始日: 2026-06-01

Mermaidコードのみ出力:"""
    return _sanitize_mermaid(_call_gemini(prompt))


def _auto_generate(req: dict) -> None:
    """バックグラウンドスレッドで Gemini API を呼び出して生成"""
    ti = req.get('theme_id', 0)
    tj = req.get('task_id')  # None = テーマ全体, 数値 = 特定タスク
    gtype = req.get('type', '')
    context = req.get('context', THEMES[ti] if 0 <= ti < 8 else '')
    req_id = req['id']
    default_key = f"{ti}_{tj}" if tj is not None else str(ti)
    state_key = req.get('flow_key') or default_key

    label = f"{THEMES[ti]}[{tj}]" if tj is not None else THEMES[ti]
    print(f'[AUTO] 生成開始: {gtype} / {label} (id={req_id})')
    try:
        if gtype == '4q':
            content = _gen_4q_task(ti, tj) if tj is not None else _gen_4q(ti)
        elif gtype == 'flow':
            content = _gen_flow(ti, context)
        elif gtype == 'gantt':
            content = _gen_gantt(ti, context)
        else:
            return

        s = _load()
        s['generated'].setdefault(gtype, {})[state_key] = content
        s['queue'] = [q for q in s['queue'] if q['id'] != req_id]
        _save(s)
        _broadcast('content_ready', {'type': gtype, 'key': state_key, 'content': content})
        print(f'[AUTO] 生成完了: {gtype} / {label}')

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
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        p = self.path.split('?')[0]
        if p == '/':
            self._file('index.html', 'text/html; charset=utf-8')
        elif p == '/state':
            self._json(_load())
        elif p == '/events':
            self._sse()
        elif p == '/has-api-key':
            self._json({'ok': bool(os.environ.get('GROQ_API_KEY'))})
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        try:
            n = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(n)) if n else {}
        except Exception:
            self.send_response(400)
            self.end_headers()
            return

        p = self.path
        if p == '/request':
            req = {
                'id': str(uuid.uuid4())[:8],
                'type': body.get('type'),
                'theme_id': body.get('theme_id'),
                'task_id': body.get('task_id'),  # None=テーマ全体, 数値=特定タスク
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

            # API キーがあれば自動生成
            if os.environ.get('GROQ_API_KEY'):
                threading.Thread(target=_auto_generate, args=(req,), daemon=True).start()

        elif p == '/generate':
            gtype = body.get('type')
            key = str(body.get('key', ''))
            content = body.get('content')
            req_id = body.get('request_id')
            if gtype and key and content is not None:
                s = _load()
                s['generated'].setdefault(gtype, {})[key] = content
                if req_id:
                    s['queue'] = [q for q in s['queue'] if q['id'] != req_id]
                _save(s)
                _broadcast('content_ready', {'type': gtype, 'key': key, 'content': content})
                self._json({'ok': True})
            else:
                self._json({'ok': False, 'error': 'type/key/content required'})

        elif p == '/clear-queue':
            s = _load()
            s['queue'] = []
            _save(s)
            self._json({'ok': True})

        elif p == '/reset':
            _save({'generated': {'4q': {}, 'flow': {}, 'gantt': {}}, 'queue': []})
            _broadcast('reset', {})
            self._json({'ok': True})

        else:
            self.send_response(404)
            self.end_headers()

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
            self.send_response(404)
            self.end_headers()

    def _json(self, data: dict):
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
