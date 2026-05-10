#!/usr/bin/env python3
"""
タスク管理アプリ - ローカルサーバー
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
from datetime import datetime
from urllib.parse import urlparse, parse_qs

PORT = 3456
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "tasks.json")
INDEX_FILE = os.path.join(BASE_DIR, "index.html")


def now_iso():
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    data["last_updated"] = now_iso()
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


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

        if path == "/" or path == "/index.html":
            self.send_html(INDEX_FILE)
        elif path == "/api/tasks":
            self.send_json(200, load_data())
        else:
            self.send_json(404, {"error": "Not found"})

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
            project["history"].append({"timestamp": now_iso(), "action": "タスク追加", "detail": f"{task['title']} を追加しました"})
            save_data(data)
            self.send_json(201, task)

        else:
            self.send_json(404, {"error": "Not found"})

    def do_PUT(self):
        parsed = urlparse(self.path)
        segments = parsed.path.rstrip("/").split("/")
        body = self.read_body()
        data = load_data()

        # PUT /api/projects/{id}
        if len(segments) == 4 and segments[2] == "projects":
            project_id = segments[3]
            project = next((p for p in data["projects"] if p["id"] == project_id), None)
            if not project:
                return self.send_json(404, {"error": "Project not found"})

            old_status = project["status"]
            for key in ["name", "goal", "status", "memo"]:
                if key in body:
                    project[key] = body[key]
            project["updated_at"] = now_iso()

            detail_parts = []
            if "status" in body and body["status"] != old_status:
                detail_parts.append(f"ステータスを「{old_status}」→「{body['status']}」に変更")
            if "name" in body:
                detail_parts.append(f"名前を更新")
            if detail_parts:
                project["history"].append({"timestamp": now_iso(), "action": "更新", "detail": "、".join(detail_parts)})

            save_data(data)
            self.send_json(200, project)

        # PUT /api/tasks/{task_id}
        elif len(segments) == 4 and segments[2] == "tasks":
            task_id = segments[3]
            found = False
            for project in data["projects"]:
                for ttype in ["big_task", "medium_tasks", "small_tasks"]:
                    if ttype == "big_task":
                        t = project[ttype]
                        if t and t["id"] == task_id:
                            old_status = t["status"]
                            for key in ["title", "description", "status", "due_date", "mindmap_mmd", "roadmap_mmd", "related_links"]:
                                if key in body:
                                    t[key] = body[key]
                            t["updated_at"] = now_iso()
                            if "status" in body and body["status"] != old_status:
                                t["history"].append({"timestamp": now_iso(), "action": "ステータス変更", "detail": f"「{old_status}」→「{body['status']}」"})
                            project["updated_at"] = now_iso()
                            found = True
                            break
                    else:
                        for t in project[ttype]:
                            if t["id"] == task_id:
                                old_status = t["status"]
                                for key in ["title", "description", "status", "due_date", "mindmap_mmd", "roadmap_mmd", "related_links"]:
                                    if key in body:
                                        t[key] = body[key]
                                t["updated_at"] = now_iso()
                                if "status" in body and body["status"] != old_status:
                                    t["history"].append({"timestamp": now_iso(), "action": "ステータス変更", "detail": f"「{old_status}」→「{body['status']}」"})
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

        # DELETE /api/projects/{id}
        if len(segments) == 4 and segments[2] == "projects":
            project_id = segments[3]
            before = len(data["projects"])
            data["projects"] = [p for p in data["projects"] if p["id"] != project_id]
            if len(data["projects"]) == before:
                return self.send_json(404, {"error": "Project not found"})
            save_data(data)
            self.send_json(200, {"ok": True})

        # DELETE /api/tasks/{task_id}
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
    server = http.server.HTTPServer(("localhost", PORT), TaskHandler)
    print(f"✅ タスク管理サーバー起動中")
    print(f"   → http://localhost:{PORT}")
    print(f"   データ: {DATA_FILE}")
    print(f"   停止: Ctrl+C")
    server.serve_forever()
