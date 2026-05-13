#!/usr/bin/env python3
"""Kai Visualize Server  port 3458
Usage: python server.py
"""
import json, os, uuid, datetime, threading, queue, webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver

PORT = 3458
BASE = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(BASE, 'state.json')

_clients: dict = {}
_lock = threading.Lock()


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
                'context': body.get('context', ''),
                'status': 'pending',
                'created_at': datetime.datetime.now().isoformat(),
            }
            s = _load()
            s['queue'].append(req)
            _save(s)
            _broadcast('request_added', req)
            self._json({'ok': True, 'id': req['id']})

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
    srv = _Server(('localhost', PORT), _Handler)
    print(f'Kai Visualize Server: http://localhost:{PORT}  (Ctrl+C で停止)')
    threading.Timer(1.2, lambda: webbrowser.open(f'http://localhost:{PORT}')).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\n停止')
