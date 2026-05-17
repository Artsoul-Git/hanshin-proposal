#!/usr/bin/env python3
"""
タスク管理アプリ - ローカルサーバー v2 (SSE Live Sync)
起動: python server.py
アクセス: http://localhost:3456
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import http.server
import json
import os
import uuid
import queue
import threading
import socketserver
import urllib.request
import urllib.error
from datetime import datetime
from urllib.parse import urlparse

PORT = 3456
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "tasks.json")
INDEX_FILE = os.path.join(BASE_DIR, "index.html")

# ─── .env 読み込み ────────────────────────────────────────────
def _load_env():
    env_path = os.path.join(BASE_DIR, ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                os.environ[key.strip()] = val.strip()  # .envを優先して上書き

_load_env()
GROQ_API_KEY  = os.environ.get("GROQ_API_KEY", "")
print(f"[Groq] APIキー: {'✅ 読込済 (' + GROQ_API_KEY[:8] + '...)' if GROQ_API_KEY else '❌ 未設定'}")
GROQ_API_URL  = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL    = "llama-3.3-70b-versatile"

# ─── SSE Live Broadcast ──────────────────────────────────────
_subscribers = []
_subs_lock   = threading.Lock()
_data_lock   = threading.Lock()


def _broadcast(payload=None):
    msg = ("data: " + json.dumps(payload or {}, ensure_ascii=False) + "\n\n").encode()
    with _subs_lock:
        dead = []
        for q in _subscribers:
            try:
                q.put_nowait(msg)
            except queue.Full:
                dead.append(q)
        for q in dead:
            _subscribers.remove(q)


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def now_iso():
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")


def load_data():
    with _data_lock:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)


def save_data(data):
    ts = now_iso()
    data["last_updated"] = ts
    with _data_lock:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    _broadcast({"type": "update", "ts": ts})


# ─── Groq API 呼び出し ────────────────────────────────────────
def groq_chat(messages, max_tokens=1000):
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY が .env に設定されていません")
    payload = json.dumps({
        "model": GROQ_MODEL,
        "messages": messages,
        "response_format": {"type": "json_object"},
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }).encode("utf-8")
    req = urllib.request.Request(
        GROQ_API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    return json.loads(result["choices"][0]["message"]["content"])


class TaskHandler(http.server.BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}")

    def send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def send_html(self, path):
        with open(path, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length).decode("utf-8")) if length else {}

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"

        if path in ("/", "/index.html"):
            self.send_html(INDEX_FILE)
        elif path == "/api/tasks":
            self.send_json(200, load_data())
        elif path == "/api/stats":
            self._handle_stats()
        elif path == "/api/events":
            self._handle_sse()
        else:
            self.send_json(404, {"error": "Not found"})

    def _handle_stats(self):
        data = load_data()
        projects = data.get("projects", [])
        today = now_iso()[:10]
        stats = {
            "total_projects": len(projects),
            "active": sum(1 for p in projects if p["status"] == "active"),
            "completed": sum(1 for p in projects if p["status"] == "completed"),
            "archived": sum(1 for p in projects if p["status"] == "archived"),
            "total_tasks": 0, "done": 0, "in_progress": 0, "overdue": 0,
        }
        for p in projects:
            ts = []
            if p.get("big_task"):
                ts.append(p["big_task"])
            ts.extend(p.get("medium_tasks", []))
            ts.extend(p.get("small_tasks", []))
            for t in ts:
                stats["total_tasks"] += 1
                if t["status"] == "done":
                    stats["done"] += 1
                elif t["status"] == "in_progress":
                    stats["in_progress"] += 1
                if t.get("due_date") and t["due_date"] < today and t["status"] != "done":
                    stats["overdue"] += 1
        self.send_json(200, stats)

    def _handle_sse(self):
        q = queue.Queue(maxsize=20)
        with _subs_lock:
            _subscribers.append(q)
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        try:
            self.wfile.write(b": connected\n\n")
            self.wfile.flush()
            while True:
                try:
                    msg = q.get(timeout=25)
                    self.wfile.write(msg)
                    self.wfile.flush()
                except queue.Empty:
                    self.wfile.write(b": ping\n\n")
                    self.wfile.flush()
        except Exception:
            pass
        finally:
            with _subs_lock:
                if q in _subscribers:
                    _subscribers.remove(q)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self.read_body()

        if path == "/api/projects":
            data = load_data()
            project = {
                "id": str(uuid.uuid4())[:8],
                "name": body.get("name", "新規プロジェクト"),
                "goal": body.get("goal", ""),
                "status": "active",
                "created_at": now_iso(),
                "updated_at": now_iso(),
                "memo": body.get("memo", ""),
                "big_task": None,
                "medium_tasks": [],
                "small_tasks": [],
                "pivots": [],
                "linked_projects": [],
                "initial_mindmap_mmd": "",
                "tags": body.get("tags", []),
                "session_logs": [],
                "history": [{"timestamp": now_iso(), "action": "作成", "detail": "プロジェクトを作成しました"}]
            }
            data["projects"].append(project)
            save_data(data)
            self.send_json(201, project)

        elif path.startswith("/api/projects/") and path.endswith("/tasks"):
            project_id = path.split("/")[3]
            data = load_data()
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})

            task_type = body.get("type", "small")
            task = {
                "id": str(uuid.uuid4())[:8],
                "title": body.get("title", "新規タスク"),
                "description": body.get("description", ""),
                "status": "todo",
                "due_date": body.get("due_date", None),
                "created_at": now_iso(),
                "updated_at": now_iso(),
                "mindmap_mmd": "",
                "roadmap_mmd": "",
                "related_links": [],
                "output_files": [],
                "history": [{"timestamp": now_iso(), "action": "作成", "detail": "タスクを作成しました"}]
            }
            if task_type == "big":
                project["big_task"] = task
            elif task_type == "medium":
                if len(project["medium_tasks"]) >= 3:
                    return self.send_json(400, {"error": "中タスクは最大3つです"})
                project["medium_tasks"].append(task)
            elif task_type == "small":
                if len(project["small_tasks"]) >= 5:
                    return self.send_json(400, {"error": "小タスクは最大5つです"})
                project["small_tasks"].append(task)

            project["updated_at"] = now_iso()
            project["history"].append({"timestamp": now_iso(), "action": "タスク追加",
                                        "detail": f"{task['title']} を追加しました"})
            save_data(data)
            self.send_json(201, task)

        elif path.startswith("/api/projects/") and path.endswith("/pivots"):
            project_id = path.split("/")[3]
            data = load_data()
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})
            if "pivots" not in project:
                project["pivots"] = []
            pivot = {
                "id": str(uuid.uuid4())[:8],
                "timestamp": now_iso(),
                "type": body.get("type", "strategic"),
                "from": body.get("from", ""),
                "to": body.get("to", ""),
                "reason": body.get("reason", ""),
                "impact": body.get("impact", "medium"),
            }
            project["pivots"].append(pivot)
            project["updated_at"] = now_iso()
            project["history"].append({"timestamp": now_iso(), "action": "ピボット記録",
                                        "detail": f"{pivot['from']} → {pivot['to']}"})
            save_data(data)
            self.send_json(201, pivot)

        elif path.startswith("/api/projects/") and path.endswith("/links"):
            project_id = path.split("/")[3]
            data = load_data()
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})
            if "linked_projects" not in project:
                project["linked_projects"] = []
            target_id = body.get("target_id", "")
            if target_id and target_id not in project["linked_projects"]:
                project["linked_projects"].append(target_id)
            project["updated_at"] = now_iso()
            save_data(data)
            self.send_json(200, {"ok": True})

        elif path.startswith("/api/projects/") and path.endswith("/logs"):
            project_id = path.split("/")[3]
            data = load_data()
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})
            if "session_logs" not in project:
                project["session_logs"] = []
            log = {
                "id": str(uuid.uuid4())[:8],
                "timestamp": now_iso(),
                "type": body.get("type", "note"),
                "summary": body.get("summary", ""),
                "detail": body.get("detail", ""),
            }
            project["session_logs"].append(log)
            project["updated_at"] = now_iso()
            project["history"].append({"timestamp": now_iso(), "action": "ログ追加",
                                        "detail": f"[{log['type']}] {log['summary']}"})
            save_data(data)
            self.send_json(201, log)

        elif path.startswith("/api/projects/") and path.endswith("/snapshot"):
            project_id = path.split("/")[3]
            data = load_data()
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})
            if "snapshots" not in project:
                project["snapshots"] = []
            state_copy = json.loads(json.dumps(project))
            state_copy.pop("snapshots", None)
            snap = {
                "id": str(uuid.uuid4())[:8],
                "timestamp": now_iso(),
                "label": body.get("label", "スナップショット"),
                "state": state_copy,
            }
            project["snapshots"].append(snap)
            if len(project["snapshots"]) > 10:
                project["snapshots"] = project["snapshots"][-10:]
            project["updated_at"] = now_iso()
            save_data(data)
            self.send_json(201, {"id": snap["id"], "timestamp": snap["timestamp"], "label": snap["label"]})

        elif path.startswith("/api/projects/") and path.endswith("/restore"):
            project_id = path.split("/")[3]
            data = load_data()
            snapshot = body.get("snapshot")
            if not snapshot:
                return self.send_json(400, {"error": "snapshot required"})
            idx = next((i for i, p in enumerate(data["projects"]) if p["id"] == project_id), None)
            if idx is not None:
                # preserve snapshots list from current project
                current_snaps = data["projects"][idx].get("snapshots", [])
                data["projects"][idx] = snapshot
                data["projects"][idx]["snapshots"] = current_snaps
            else:
                data["projects"].append(snapshot)
            save_data(data)
            self.send_json(200, snapshot)

        elif path == "/api/files/check":
            paths = body.get("paths", [])
            results = {p: os.path.exists(p) for p in paths}
            self.send_json(200, results)

        elif path == "/api/ai/decompose":
            # タスクを具体的な実行ステップに分解する
            title   = body.get("title", "")
            desc    = body.get("description", "")
            goal    = body.get("project_goal", "")
            memo    = body.get("project_memo", "")
            if not title:
                return self.send_json(400, {"error": "title は必須です"})
            if not GROQ_API_KEY:
                return self.send_json(503, {"error": "GROQ_API_KEY が未設定です。.env を確認してください"})
            try:
                context = f"プロジェクトゴール：{goal}" if goal else ""
                if memo:
                    context += f"\nプロジェクトメモ：{memo}"
                messages = [
                    {"role": "system", "content": (
                        "あなたはプロジェクト管理の専門家です。与えられたタスクを、"
                        "誰でもすぐに取り掛かれる具体的な実行ステップ3〜5個に分解してください。"
                        "必ずJSON形式で返してください。形式：{\"steps\": ["
                        "{\"title\": \"ステップ名\", \"description\": \"具体的な作業内容\", \"estimated_minutes\": 所要時間（数値）}"
                        ", ...]}"
                    )},
                    {"role": "user", "content": (
                        f"タスク名：{title}\n"
                        f"タスク説明：{desc}\n"
                        f"{context}\n\n"
                        "このタスクを今すぐ実行できる具体的なステップに分解してください。"
                    )}
                ]
                result = groq_chat(messages)
                self.send_json(200, result)
            except urllib.error.HTTPError as e:
                body_err = e.read().decode("utf-8", errors="replace")
                self.send_json(502, {"error": f"Groq APIエラー: {e.code} {e.reason}", "detail": body_err})
            except Exception as e:
                self.send_json(500, {"error": str(e)})

        elif path == "/api/ai/recommend":
            # プロジェクトの状況から次のタスクを提案する
            goal      = body.get("goal", "")
            memo      = body.get("memo", "")
            done      = body.get("completed_tasks", [])
            pending   = body.get("pending_tasks", [])
            proj_name = body.get("project_name", "")
            if not goal and not proj_name:
                return self.send_json(400, {"error": "goal または project_name は必須です"})
            if not GROQ_API_KEY:
                return self.send_json(503, {"error": "GROQ_API_KEY が未設定です。.env を確認してください"})
            try:
                done_text    = "\n".join(f"・{t}" for t in done)    if done    else "（まだなし）"
                pending_text = "\n".join(f"・{t}" for t in pending) if pending else "（まだなし）"
                messages = [
                    {"role": "system", "content": (
                        "あなたはプロジェクト管理コンサルタントです。"
                        "プロジェクトの状況を分析し、今すぐ着手すべき推奨タスクを3件提案してください。"
                        "必ずJSON形式で返してください。形式：{\"recommendations\": ["
                        "{\"title\": \"タスク名\", \"reason\": \"なぜ今必要か\", "
                        "\"priority\": \"high/medium/low\", \"type\": \"big/medium/small\"}"
                        ", ...]}"
                    )},
                    {"role": "user", "content": (
                        f"プロジェクト名：{proj_name}\n"
                        f"ゴール：{goal}\n"
                        f"メモ・背景：{memo}\n\n"
                        f"【完了済みタスク】\n{done_text}\n\n"
                        f"【未完了タスク】\n{pending_text}\n\n"
                        "この状況を踏まえて、次に取り組むべき重要なタスクを3件提案してください。"
                    )}
                ]
                result = groq_chat(messages)
                self.send_json(200, result)
            except urllib.error.HTTPError as e:
                self.send_json(502, {"error": f"Groq APIエラー: {e.code} {e.reason}"})
            except Exception as e:
                self.send_json(500, {"error": str(e)})

        else:
            self.send_json(404, {"error": "Not found"})

    def do_PUT(self):
        parsed = urlparse(self.path)
        segments = parsed.path.rstrip("/").split("/")
        body = self.read_body()
        data = load_data()

        if len(segments) == 4 and segments[2] == "projects":
            project_id = segments[3]
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})

            old_status = project["status"]
            for key in ["name", "goal", "status", "memo", "initial_mindmap_mmd", "tags", "session_logs", "pivots"]:
                if key in body:
                    project[key] = body[key]
            project["updated_at"] = now_iso()

            detail_parts = []
            if "status" in body and body["status"] != old_status:
                detail_parts.append(f"ステータスを「{old_status}」→「{body['status']}」に変更")
            if "name" in body:
                detail_parts.append("名前を更新")
            if detail_parts:
                project["history"].append({"timestamp": now_iso(), "action": "更新",
                                            "detail": "、".join(detail_parts)})
            save_data(data)
            self.send_json(200, project)

        elif len(segments) == 4 and segments[2] == "tasks":
            task_id = segments[3]
            found = False
            for project in data["projects"]:
                for ttype in ["big_task", "medium_tasks", "small_tasks"]:
                    if ttype == "big_task":
                        t = project[ttype]
                        if t and t["id"] == task_id:
                            old_status = t["status"]
                            for key in ["title", "description", "status", "due_date",
                                        "mindmap_mmd", "roadmap_mmd", "related_links", "output_files"]:
                                if key in body:
                                    t[key] = body[key]
                            t["updated_at"] = now_iso()
                            if "status" in body and body["status"] != old_status:
                                t["history"].append({"timestamp": now_iso(), "action": "ステータス変更",
                                                     "detail": f"「{old_status}」→「{body['status']}」"})
                            project["updated_at"] = now_iso()
                            found = True
                            break
                    else:
                        for t in project[ttype]:
                            if t["id"] == task_id:
                                old_status = t["status"]
                                for key in ["title", "description", "status", "due_date",
                                            "mindmap_mmd", "roadmap_mmd", "related_links"]:
                                    if key in body:
                                        t[key] = body[key]
                                t["updated_at"] = now_iso()
                                if "status" in body and body["status"] != old_status:
                                    t["history"].append({"timestamp": now_iso(), "action": "ステータス変更",
                                                         "detail": f"「{old_status}」→「{body['status']}」"})
                                project["updated_at"] = now_iso()
                                found = True
                                break
                if found:
                    break
            if not found:
                return self.send_json(404, {"error": "Task not found"})
            save_data(data)
            self.send_json(200, {"ok": True})

        else:
            self.send_json(404, {"error": "Not found"})

    def do_DELETE(self):
        segments = self.path.rstrip("/").split("/")
        data = load_data()

        if len(segments) == 6 and segments[2] == "projects" and segments[4] == "pivots":
            project_id = segments[3]
            pivot_id   = segments[5]
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})
            before = len(project.get("pivots", []))
            project["pivots"] = [pv for pv in project.get("pivots", []) if pv["id"] != pivot_id]
            if len(project["pivots"]) == before:
                return self.send_json(404, {"error": "Pivot not found"})
            project["updated_at"] = now_iso()
            save_data(data)
            self.send_json(200, {"ok": True})

        elif len(segments) == 6 and segments[2] == "projects" and segments[4] == "links":
            project_id = segments[3]
            target_id  = segments[5]
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})
            project["linked_projects"] = [lid for lid in project.get("linked_projects", []) if lid != target_id]
            project["updated_at"] = now_iso()
            save_data(data)
            self.send_json(200, {"ok": True})

        elif len(segments) == 4 and segments[2] == "projects":
            project_id = segments[3]
            before = len(data["projects"])
            data["projects"] = [p for p in data["projects"] if p["id"] != project_id]
            if len(data["projects"]) == before:
                return self.send_json(404, {"error": "Project not found"})
            save_data(data)
            self.send_json(200, {"ok": True})

        elif len(segments) == 4 and segments[2] == "tasks":
            task_id = segments[3]
            found = False
            for project in data["projects"]:
                if project["big_task"] and project["big_task"]["id"] == task_id:
                    project["big_task"] = None
                    found = True
                for ttype in ["medium_tasks", "small_tasks"]:
                    before = len(project[ttype])
                    project[ttype] = [t for t in project[ttype] if t["id"] != task_id]
                    if len(project[ttype]) < before:
                        found = True
                if found:
                    project["updated_at"] = now_iso()
                    break
            if not found:
                return self.send_json(404, {"error": "Task not found"})
            save_data(data)
            self.send_json(200, {"ok": True})

        else:
            self.send_json(404, {"error": "Not found"})


if __name__ == "__main__":
    server = ThreadingHTTPServer(("localhost", PORT), TaskHandler)
    print(f"✅ Kai Tasks サーバー起動中 (v2 - Live Sync)")
    print(f"   → http://localhost:{PORT}")
    print(f"   データ: {DATA_FILE}")
    print(f"   停止: Ctrl+C")
    server.serve_forever()
