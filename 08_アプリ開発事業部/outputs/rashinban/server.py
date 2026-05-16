#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
rashinban/server.py  ―  ラシンバン ホーム画面サーバー (ポート 3457)
静的ファイルの配信と HTML ファイル一覧 API を提供する。
外部 API 連携なし・追加コストゼロ。

使い方:
  py server.py
"""
import os, re, json, http.server, urllib.parse
from datetime import datetime

PORT = 3457
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def extract_meta(filepath):
    """HTML ファイルの先頭 12KB から主要メタデータを抽出する"""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read(12000)

        title_m   = re.search(r"<title>([^<]+)</title>", content)
        theme_m   = re.search(r'"theme"\s*:\s*"([^"]+)"', content)
        created_m = re.search(r'"createdAt"\s*:\s*"([^"]+)"', content)
        period_m  = re.search(r'"targetPeriod"\s*:\s*"([^"]+)"', content)
        flow_ct   = len(re.findall(r'"id"\s*:\s*"fl-\d+"', content))

        return {
            "title":        title_m.group(1)   if title_m   else os.path.basename(filepath),
            "theme":        theme_m.group(1)   if theme_m   else "",
            "createdAt":    created_m.group(1) if created_m else "",
            "targetPeriod": period_m.group(1)  if period_m  else "",
            "flowCount":    flow_ct,
        }
    except Exception:
        return {
            "title": os.path.basename(filepath),
            "theme": "", "createdAt": "", "targetPeriod": "", "flowCount": 0,
        }


def get_files():
    """ディレクトリ内の *.html (index.html を除く) を新しい順で返す"""
    result = []
    try:
        names = sorted(
            [n for n in os.listdir(SCRIPT_DIR)
             if n.endswith(".html") and n != "index.html"],
            reverse=True,
        )
    except Exception:
        return []

    for name in names:
        path = os.path.join(SCRIPT_DIR, name)
        try:
            stat = os.stat(path)
            meta = extract_meta(path)
            result.append({
                "filename": name,
                "mtime": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M"),
                "size": stat.st_size,
                **meta,
            })
        except Exception:
            pass

    return result


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SCRIPT_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/files":
            data = json.dumps(get_files(), ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            super().do_GET()

    def log_message(self, fmt, *args):
        pass  # サイレント動作


if __name__ == "__main__":
    import webbrowser, threading

    server = http.server.HTTPServer(("", PORT), Handler)
    url = f"http://localhost:{PORT}"
    print(f"🧭 ラシンバン サーバー起動 → {url}")
    threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nサーバーを停止しました。")
