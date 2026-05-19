#!/usr/bin/env python3
"""
slide-server.py — スライド ローカル開発サーバー
使い方: python slide-server.py
アクセス: http://localhost:8765/{slug}/admin.html

機能:
  - ローカルでスライドを http:// で配信（localhost origin で localStorage 共有）
  - GET  http://localhost:8765/{slug}/{file}  → 静的ファイル配信
  - POST http://localhost:8765/{slug}/api/deploy → git commit + push (master & gh-pages)
  - GET  http://localhost:8765/ → プロジェクト一覧
"""

import datetime
import http.server
import json
import mimetypes
import os
import subprocess
import sys
from pathlib import Path

PORT = 8765
BASE = Path(__file__).parent.resolve()

# プロジェクトを探す順序（セミナー事業部優先 → ステージングはフォールバック）
SEARCH_ROOTS = [
    BASE.parent.parent.parent / "06_セミナー事業部" / "outputs",
    BASE / "projects",
]


def find_project(slug: str) -> Path | None:
    for root in SEARCH_ROOTS:
        candidate = root / slug
        if candidate.is_dir() and (candidate / "js" / "slides.js").exists():
            return candidate
    return None


def all_projects() -> list[dict]:
    seen = set()
    results = []
    for root in SEARCH_ROOTS:
        if not root.exists():
            continue
        for d in sorted(root.iterdir()):
            if d.name in seen:
                continue
            if d.is_dir() and (d / "js" / "slides.js").exists():
                seen.add(d.name)
                results.append({"slug": d.name, "dir": str(d), "source": root.name})
    return results


def git_run(args: list[str], cwd: Path) -> tuple[bool, str]:
    try:
        r = subprocess.run(
            args, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace"
        )
        ok = r.returncode == 0
        msg = (r.stdout + r.stderr).strip()
        return ok, msg
    except FileNotFoundError:
        return False, "git コマンドが見つかりません"


def deploy(project_dir: Path) -> dict:
    # 変更確認
    ok, status = git_run(["git", "status", "--porcelain"], project_dir)
    if not ok:
        return {"ok": False, "message": "git status 失敗: " + status}

    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    commit_msg = f"deploy: {ts}"

    # master へ commit + push
    steps = [
        (["git", "add", "js/slides.js"], "ステージング失敗"),
        (["git", "commit", "-m", commit_msg], None),   # "nothing to commit" は許容
        (["git", "push", "origin", "master"],           "master push 失敗"),
        (["git", "checkout", "gh-pages"],               "gh-pages checkout 失敗"),
        (["git", "merge", "master", "--no-edit"],       "gh-pages merge 失敗"),
        (["git", "push", "origin", "gh-pages"],         "gh-pages push 失敗"),
        (["git", "checkout", "master"],                 "master 復帰 失敗"),
    ]

    for cmd, err_label in steps:
        ok, out = git_run(cmd, project_dir)
        if not ok and err_label:
            return {"ok": False, "message": f"{err_label}: {out}"}

    return {"ok": True, "message": f"GitHub Pages に反映しました（60秒ほどで更新）\n{commit_msg}"}


class Handler(http.server.BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        slug = self.path.lstrip("/").split("/")[0] or "-"
        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {args[1]} {slug} {self.path}")

    # ─── CORS ───────────────────────────────────────────────
    def add_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self.add_cors()
        self.end_headers()

    # ─── JSON helper ────────────────────────────────────────
    def json(self, data: dict, status: int = 200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.add_cors()
        self.end_headers()
        self.wfile.write(body)

    # ─── GET ────────────────────────────────────────────────
    def do_GET(self):
        path = self.path.split("?")[0].lstrip("/")

        # ルート → プロジェクト一覧 HTML
        if not path or path == "/":
            self.send_index()
            return

        parts = path.split("/", 1)
        slug = parts[0]
        rel   = parts[1] if len(parts) > 1 else "admin.html"

        project = find_project(slug)
        if not project:
            self.json({"error": f"'{slug}' が見つかりません"}, 404)
            return

        file_path = project / rel.replace("/", os.sep)
        if file_path.is_dir():
            file_path = file_path / "admin.html"
        if not file_path.is_file():
            self.json({"error": "ファイルなし: " + rel}, 404)
            return

        mime, _ = mimetypes.guess_type(str(file_path))
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", (mime or "application/octet-stream") + ("; charset=utf-8" if mime and "text" in mime or "javascript" in (mime or "") else ""))
        self.send_header("Content-Length", str(len(data)))
        self.add_cors()
        self.end_headers()
        self.wfile.write(data)

    # ─── POST ───────────────────────────────────────────────
    def do_POST(self):
        path = self.path.lstrip("/")
        parts = path.split("/")

        # /{slug}/api/deploy
        if len(parts) >= 3 and parts[-2] == "api" and parts[-1] == "deploy":
            slug = parts[0]
            project = find_project(slug)
            if not project:
                self.json({"error": f"'{slug}' が見つかりません"}, 404)
                return
            result = deploy(project)
            self.json(result, 200 if result["ok"] else 500)
            return

        # /{slug}/api/ping → サーバー稼働確認
        if len(parts) >= 3 and parts[-2] == "api" and parts[-1] == "ping":
            self.json({"ok": True, "port": PORT})
            return

        self.json({"error": "unknown endpoint"}, 404)

    # ─── プロジェクト一覧 HTML ───────────────────────────────
    def send_index(self):
        projects = all_projects()
        rows = "".join(
            f'<li><a href="/{p["slug"]}/admin.html">{p["slug"]}</a>'
            f' <small>({Path(p["dir"]).parent.name})</small>'
            f' — <a href="/{p["slug"]}/viewer.html" style="color:#888">viewer</a>'
            f' | <a href="/{p["slug"]}/presenter.html" style="color:#888">presenter</a></li>'
            for p in projects
        )
        html = f"""<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<title>Slide Server — {PORT}</title>
<style>
  body{{background:#0d0d0d;color:#ccc;font-family:sans-serif;padding:40px;max-width:700px;margin:auto}}
  h1{{color:#6F911D;font-size:18px;margin-bottom:24px}}
  li{{margin:10px 0;font-size:14px}} a{{color:#6F911D}}
  small{{color:#555}}
</style></head>
<body>
<h1>Slide Server :{PORT}</h1>
<ul>{rows}</ul>
<p style="color:#333;font-size:12px;margin-top:32px">
  本番反映: 各 admin.html の「本番へ反映」ボタン<br>
  停止: Ctrl+C
</p>
</body></html>"""
        data = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    print(f"[Slide Server] http://localhost:{PORT}/")
    print(f"プロジェクト一覧: http://localhost:{PORT}/")
    print("停止: Ctrl+C\n")
    with http.server.HTTPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
