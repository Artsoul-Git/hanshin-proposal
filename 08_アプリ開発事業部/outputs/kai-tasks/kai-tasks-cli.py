#!/usr/bin/env python3
"""
kai-tasks-cli.py  ― Kai Tasks をコマンドラインから操作する
Kai (Claude Code) が直接呼び出して使う内製ツール。

使い方:
  python kai-tasks-cli.py <command> [options]

コマンド一覧:
  ensure-server              サーバーが起動していなければ起動する
  status                     全プロジェクトの進捗を表示
  list                       プロジェクト一覧（ID付き）
  open                       ブラウザで Kai Tasks を開く

  create --name NAME --goal GOAL [--memo MEMO]
                             プロジェクト作成 + 1-3-5 タスク自動生成
  create-bare --name NAME --goal GOAL
                             プロジェクトのみ作成（タスク未生成）
  add-task PID --type TYPE --title TITLE [--desc DESC] [--due DATE]
                             既存プロジェクトにタスク追加
  set-roadmap TASK_ID --code MERMAID_CODE
                             タスクにロードマップを設定
  set-mindmap TASK_ID --code MERMAID_CODE
                             タスクにマインドマップを設定

  start-task TASK_ID         タスクを「進行中」に変更
  done-task  TASK_ID         タスクを「完了」に変更
  update-task TASK_ID [--status STATUS] [--title TITLE] [--desc DESC]
                             タスクの任意フィールドを更新
  project-done PROJECT_ID    プロジェクトを完了に変更
  project-archive PROJECT_ID プロジェクトをアーカイブ

  show PROJECT_ID            プロジェクト詳細を表示
  find NAME                  プロジェクト名で検索してIDを返す
"""

import sys, os, json, time, argparse, subprocess, urllib.request, urllib.error
import io
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ─── ANSIカラー（Windows 10+ / Windows Terminal 対応）───────────
if os.name == "nt":
    try:
        import ctypes
        ctypes.windll.kernel32.SetConsoleMode(ctypes.windll.kernel32.GetStdHandle(-11), 7)
    except Exception:
        pass

_USE_COLOR = sys.stdout.isatty() or os.environ.get("FORCE_COLOR")
def _c(code): return f"\033[{code}m" if _USE_COLOR else ""
GREEN  = _c("92"); YELLOW = _c("93"); RED    = _c("91")
BLUE   = _c("94"); GRAY   = _c("90"); BOLD   = _c("1");  RESET  = _c("0")

# ─────────────────────────────────────
PORT        = 3456
BASE        = f"http://localhost:{PORT}/api"
SERVER_PY   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server.py")
# ─────────────────────────────────────

def _req(method, path, body=None):
    url  = BASE + path
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body else None
    req  = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json; charset=utf-8")
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode("utf-8"))

def _is_running():
    try:
        urllib.request.urlopen(f"http://localhost:{PORT}/api/tasks", timeout=2)
        return True
    except:
        return False

def ensure_server(quiet=False):
    if _is_running():
        if not quiet:
            print(f"[Kai Tasks] サーバー稼働中 → http://localhost:{PORT}")
        return True
    if not quiet:
        print("[Kai Tasks] サーバーを起動します…")
    flags = 0
    if os.name == "nt":
        flags = subprocess.CREATE_NO_WINDOW
    subprocess.Popen(
        [sys.executable, SERVER_PY],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=flags,
    )
    for _ in range(16):
        time.sleep(0.5)
        if _is_running():
            if not quiet:
                print(f"[Kai Tasks] 起動完了 → http://localhost:{PORT}")
            return True
    print("[Kai Tasks] ERROR: サーバーの起動に失敗しました", file=sys.stderr)
    return False

# ── タスク生成ヘルパー ──────────────────

def _roadmap_mmd(name, goal):
    label = goal or name
    s = (label[:22] + "…") if len(label) > 22 else label
    return (
        f'graph LR\n'
        f'  A(["\U0001f3af {s}"]) --> B["\U0001f4cb 計画フェーズ"]\n'
        f'  B --> C["⚙️ 実行フェーズ"]\n'
        f'  C --> D(["✅ 完了・定着"])\n\n'
        f'  B --> B1["現状把握"]\n'
        f'  B --> B2["要件整理"]\n'
        f'  B --> B3["リソース確保"]\n\n'
        f'  C --> C1["フェーズ1: 着手"]\n'
        f'  C --> C2["フェーズ2: 展開"]\n'
        f'  C --> C3["フェーズ3: 仕上げ"]\n\n'
        f'  style A fill:#6c63ff,color:#fff,stroke:#6c63ff\n'
        f'  style D fill:#43e97b,color:#000,stroke:#43e97b'
    )

def _mindmap_mmd(title):
    s = (title[:24] + "…") if len(title) > 24 else title
    return (
        f'mindmap\n'
        f'  root(("{s}"))\n'
        f'    計画\n'
        f'      現状把握\n'
        f'      要件整理\n'
        f'      スケジュール確定\n'
        f'    実行\n'
        f'      フェーズ1\n'
        f'      フェーズ2\n'
        f'      フェーズ3\n'
        f'    完了\n'
        f'      検証・テスト\n'
        f'      改善\n'
        f'      定着化・引き継ぎ'
    )

def auto_generate_tasks(pid, name, goal):
    label     = goal or name
    short     = (label[:28] + "…") if len(label) > 28 else label
    big_title = f"「{short}」を達成する" if goal else f"{short}を完了させる"

    big = _req("POST", f"/projects/{pid}/tasks", {
        "type": "big",
        "title": big_title,
        "description": "このプロジェクト全体のゴール。ここを達成することがすべての判断基準になります。",
    })
    if big.get("id"):
        _req("PUT", f"/tasks/{big['id']}", {
            "roadmap_mmd": _roadmap_mmd(name, goal),
            "mindmap_mmd": _mindmap_mmd(big_title),
        })

    for title, desc in [
        ("現状把握・要件整理",   "現在の状況を正確に把握し、達成に必要な要件を明確にする"),
        ("計画立案・実行",       "具体的なアクションプランを立て、確実に実行する"),
        ("検証・改善・定着化",   "結果を確認し、改善サイクルを回して定着させる"),
    ]:
        _req("POST", f"/projects/{pid}/tasks", {"type": "medium", "title": title, "description": desc})

    for title, desc in [
        ("キックオフ・関係者共有",   "プロジェクト開始を関係者に伝え、役割分担と協力体制を整える"),
        ("ツール・リソースの準備",   "作業に必要なツール・情報・人員・予算を事前に確保する"),
        ("進捗確認・中間レビュー",   "定期的に進捗を確認し、目標とのズレを早期に修正する"),
        ("課題の洗い出しと対処",     "リスクや障害を早期に発見し、影響が出る前に手を打つ"),
        ("最終確認・完了報告",       "成果物・達成度を確認し、引き継ぎ・報告を行って完了とする"),
    ]:
        _req("POST", f"/projects/{pid}/tasks", {"type": "small", "title": title, "description": desc})

    return big

# ── 表示ヘルパー ─────────────────────

STATUS_ICON = {"todo": "[ ]", "in_progress": "[>]", "done": "[x]"}
STATUS_JP   = {"todo": "未着手", "in_progress": "進行中", "done": "完了",
               "active": "進行中", "completed": "完了", "archived": "アーカイブ"}

def _pct(tasks):
    if not tasks: return 0
    return int(sum(1 for t in tasks if t["status"] == "done") / len(tasks) * 100)

def _all_tasks(p):
    tasks = []
    if p.get("big_task"): tasks.append(("big", p["big_task"]))
    for t in p.get("medium_tasks", []): tasks.append(("med", t))
    for t in p.get("small_tasks",  []): tasks.append(("sm",  t))
    return tasks

def _print_project(p, verbose=False):
    all_t  = _all_tasks(p)
    done   = sum(1 for _, t in all_t if t["status"] == "done")
    total  = len(all_t)
    bar_n  = int(_pct([({"status": t["status"]}) for _, t in all_t]) / 10)
    bar    = "█" * bar_n + "░" * (10 - bar_n)
    print(f"\n  [{STATUS_JP.get(p['status'],'?')}] {p['name']}  (ID: {p['id']})")
    if p.get("goal"):
        print(f"  🎯 {p['goal']}")
    print(f"  進捗: {bar} {done}/{total} ({_pct([t for _, t in all_t])}%)")
    if verbose:
        for kind, t in all_t:
            icon  = STATUS_ICON.get(t["status"], "[ ]")
            badge = {"big": "★", "med": "◆", "sm": "◇"}[kind]
            print(f"    {badge} {icon} [{t['id']}] {t['title']}")

# ── コマンド実装 ────────────────────

def cmd_status(_a):
    data = _req("GET", "/tasks")
    projects = data.get("projects", [])
    if not projects:
        print("[Kai Tasks] プロジェクトなし")
        return
    print(f"[Kai Tasks] {len(projects)} プロジェクト")
    for p in projects:
        _print_project(p, verbose=True)
    print()

def cmd_list(_a):
    data = _req("GET", "/tasks")
    for p in data.get("projects", []):
        all_t = _all_tasks(p)
        done  = sum(1 for _, t in all_t if t["status"] == "done")
        print(f"  {p['id']}  [{STATUS_JP.get(p['status'],'?')}] {p['name']}  {done}/{len(all_t)} 完了")

def cmd_show(a):
    data = _req("GET", "/tasks")
    pid  = a.project_id
    p    = next((x for x in data["projects"] if x["id"] == pid), None)
    if not p:
        print(f"ERROR: プロジェクト {pid} が見つかりません", file=sys.stderr)
        sys.exit(1)
    _print_project(p, verbose=True)
    print()

def cmd_find(a):
    data = _req("GET", "/tasks")
    kw   = a.name.lower()
    hits = [p for p in data["projects"] if kw in p["name"].lower()]
    if not hits:
        print("見つかりません")
    for p in hits:
        print(f"  {p['id']}  {p['name']}")

def cmd_open(_a):
    import webbrowser
    webbrowser.open(f"http://localhost:{PORT}")

def cmd_create(a):
    name = a.name
    goal = getattr(a, "goal", "") or ""
    memo = getattr(a, "memo", "") or ""
    p    = _req("POST", "/projects", {"name": name, "goal": goal, "memo": memo})
    pid  = p["id"]
    big  = auto_generate_tasks(pid, name, goal)
    print(f"[Kai Tasks] プロジェクト作成完了")
    print(f"  プロジェクトID : {pid}")
    print(f"  名前           : {name}")
    if goal:
        print(f"  ゴール         : {goal}")
    print(f"  大タスクID     : {big.get('id','?')}")
    print(f"  1-3-5 タスク   : 大1・中3・小5 生成済み")
    print(f"  ロードマップ   : 自動生成済み")
    print(f"  ブラウザ確認   : http://localhost:{PORT}")
    return pid

def cmd_create_bare(a):
    p = _req("POST", "/projects", {"name": a.name, "goal": getattr(a, "goal", "") or "", "memo": getattr(a, "memo", "") or ""})
    print(f"[Kai Tasks] プロジェクト作成: {p['id']}  {a.name}")
    return p["id"]

def cmd_add_task(a):
    body = {"type": a.type, "title": a.title}
    if getattr(a, "desc", None):  body["description"] = a.desc
    if getattr(a, "due",  None):  body["due_date"]    = a.due
    t = _req("POST", f"/projects/{a.project_id}/tasks", body)
    print(f"[Kai Tasks] タスク追加: {t['id']}  [{a.type}] {a.title}")
    return t["id"]

def cmd_set_roadmap(a):
    _req("PUT", f"/tasks/{a.task_id}", {"roadmap_mmd": a.code})
    print(f"[Kai Tasks] ロードマップ設定: {a.task_id}")

def cmd_set_mindmap(a):
    _req("PUT", f"/tasks/{a.task_id}", {"mindmap_mmd": a.code})
    print(f"[Kai Tasks] マインドマップ設定: {a.task_id}")

def cmd_start_task(a):
    _req("PUT", f"/tasks/{a.task_id}", {"status": "in_progress"})
    print(f"[Kai Tasks] 進行中: {a.task_id}")

def cmd_done_task(a):
    _req("PUT", f"/tasks/{a.task_id}", {"status": "done"})
    print(f"[Kai Tasks] 完了:   {a.task_id}")

def cmd_update_task(a):
    body = {}
    if getattr(a, "status", None): body["status"]      = a.status
    if getattr(a, "title",  None): body["title"]       = a.title
    if getattr(a, "desc",   None): body["description"] = a.desc
    if getattr(a, "due",    None): body["due_date"]    = a.due
    if not body:
        print("ERROR: 更新する項目がありません", file=sys.stderr); sys.exit(1)
    _req("PUT", f"/tasks/{a.task_id}", body)
    print(f"[Kai Tasks] タスク更新: {a.task_id}")

def cmd_project_done(a):
    _req("PUT", f"/projects/{a.project_id}", {"status": "completed"})
    print(f"[Kai Tasks] プロジェクト完了: {a.project_id}")

def cmd_project_archive(a):
    _req("PUT", f"/projects/{a.project_id}", {"status": "archived"})
    print(f"[Kai Tasks] アーカイブ: {a.project_id}")

def cmd_today(_a):
    """今日のフォーカス: 進行中タスク + 期限切れタスク"""
    data  = _req("GET", "/tasks")
    today = datetime.now().strftime("%Y-%m-%d")
    in_prog, overdue = [], []

    for p in data.get("projects", []):
        if p["status"] == "archived":
            continue
        for kind, t in _all_tasks(p):
            if t["status"] == "in_progress":
                in_prog.append((p["name"], kind, t))
            elif t["status"] != "done" and t.get("due_date") and t["due_date"] < today:
                overdue.append((p["name"], kind, t))

    badge = {"big": "★", "med": "◆", "sm": "◇"}
    print(f"\n{BOLD}[Kai Tasks] Today's Focus — {today}{RESET}\n")

    print(f"  {YELLOW}{BOLD}進行中タスク:{RESET}")
    if in_prog:
        for pname, kind, t in in_prog:
            print(f"    {GREEN}[>]{RESET} {BLUE}[{t['id']}]{RESET} {badge[kind]} {t['title']}")
            print(f"         {GRAY}↳ {pname}{RESET}")
    else:
        print(f"    {GRAY}進行中のタスクなし{RESET}")

    print()
    print(f"  {RED}{BOLD}期限切れタスク:{RESET}")
    if overdue:
        for pname, kind, t in overdue:
            print(f"    {RED}[!]{RESET} {BLUE}[{t['id']}]{RESET} {badge[kind]} {t['title']}  {GRAY}(期日: {t['due_date']}){RESET}")
            print(f"         {GRAY}↳ {pname}{RESET}")
    else:
        print(f"    {GREEN}期限切れなし ✓{RESET}")

    print()

def cmd_pivot(a):
    """プロジェクトに思考転換（ピボット）を記録する"""
    body = {
        "type":   a.type,
        "from":   getattr(a, "from_", "") or "",
        "to":     a.to,
        "reason": getattr(a, "reason", "") or "",
        "impact": getattr(a, "impact", "medium") or "medium",
    }
    result = _req("POST", f"/projects/{a.project_id}/pivots", body)
    pid = result.get("id", "?")
    print(f"\n{BOLD}[Kai Tasks] ピボット記録 [{pid}]{RESET}")
    print(f"  {GRAY}元の方向:{RESET} {body['from']}")
    print(f"  {YELLOW}▶{RESET}  {GREEN}{BOLD}{body['to']}{RESET}")
    if body["reason"]:
        print(f"  {GRAY}理由:{RESET} {body['reason']}")
    print(f"  {GRAY}影響度:{RESET} {body['impact']}\n")

def cmd_link(a):
    """プロジェクト間をリンクする"""
    _req("POST", f"/projects/{a.project_id}/links", {"target_id": a.target_id})
    print(f"[Kai Tasks] リンク設定: {a.project_id} → {a.target_id}")

def cmd_unlink(a):
    """プロジェクト間のリンクを解除する"""
    _req("DELETE", f"/projects/{a.project_id}/links/{a.target_id}")
    print(f"[Kai Tasks] リンク解除: {a.project_id} → {a.target_id}")

def cmd_init_mindmap(a):
    """現在のマインドマップをプロジェクトの「初期マインドマップ」として保存する（転換前スナップショット）"""
    data = _req("GET", "/tasks")
    # Find project containing this task
    for p in data.get("projects", []):
        for _, t in _all_tasks(p):
            if t["id"] == a.task_id and t.get("mindmap_mmd"):
                _req("PUT", f"/projects/{p['id']}", {"initial_mindmap_mmd": t["mindmap_mmd"]})
                print(f"[Kai Tasks] 初期マインドマップを保存しました (プロジェクト: {p['name']})")
                return
    print("ERROR: タスクが見つからないか、マインドマップが未設定です", file=sys.stderr)

def cmd_attach_file(a):
    """タスクに成果物ファイルを紐付ける"""
    import uuid as _uuid
    data = _req("GET", "/tasks")
    t = None
    for p in data.get("projects", []):
        for _, task in _all_tasks(p):
            if task["id"] == a.task_id:
                t = task
                break
        if t:
            break
    if not t:
        print(f"ERROR: タスク {a.task_id} が見つかりません", file=sys.stderr)
        sys.exit(1)

    abs_path = os.path.abspath(a.path)
    files = t.get("output_files", [])
    if any(f["path"] == abs_path for f in files):
        print(f"[Kai Tasks] 既に登録済み: {abs_path}")
        return
    exists = os.path.exists(abs_path)
    files.append({
        "id": str(_uuid.uuid4())[:8],
        "path": abs_path,
        "label": a.label or os.path.basename(abs_path),
        "added_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "status": "ok" if exists else "missing",
    })
    _req("PUT", f"/tasks/{a.task_id}", {"output_files": files})
    status_icon = f"{GREEN}✅{RESET}" if exists else f"{RED}⚠️ ファイルが見つかりません{RESET}"
    print(f"\n{BOLD}[Kai Tasks] ファイル紐付け {status_icon}{RESET}")
    print(f"  タスク: {a.task_id}")
    print(f"  パス  : {abs_path}")
    print(f"  ラベル: {a.label or os.path.basename(abs_path)}\n")

def cmd_check_files(a):
    """全タスク（または指定プロジェクト）の成果物ファイルの存在確認"""
    data = _req("GET", "/tasks")
    pid_filter = getattr(a, "project_id", None)
    ok_list, missing_list = [], []

    for p in data.get("projects", []):
        if pid_filter and p["id"] != pid_filter:
            continue
        for _, t in _all_tasks(p):
            for f in t.get("output_files", []):
                exists = os.path.exists(f["path"])
                entry  = (p["name"], t["title"], f["label"], f["path"], f["id"])
                (ok_list if exists else missing_list).append(entry)

    print(f"\n{BOLD}[Kai Tasks] ファイル存在確認{RESET}\n")
    print(f"  {GREEN}✅ 正常: {len(ok_list)} 件{RESET}")
    print(f"  {RED}⚠️  消失: {len(missing_list)} 件{RESET}\n")

    if missing_list:
        print(f"  {RED}{BOLD}消失ファイル:{RESET}")
        for pname, tname, label, path, _ in missing_list:
            print(f"    {RED}⚠️{RESET}  {BOLD}{label}{RESET}")
            print(f"         {GRAY}パス: {path}{RESET}")
            print(f"         {GRAY}↳ {pname} / {tname}{RESET}")
        print()
    else:
        print(f"  {GREEN}すべてのファイルが正常に存在しています ✓{RESET}\n")

def cmd_log_action(a):
    """プロジェクトに上村の指示・Kaiの活動を記録する"""
    body = {
        "type": a.type,
        "summary": a.summary,
        "detail": getattr(a, "detail", "") or "",
    }
    result = _req("POST", f"/projects/{a.project_id}/logs", body)
    icons = {"instruction": "📝", "decision": "✅", "output": "📦", "note": "💬"}
    icon = icons.get(a.type, "📌")
    print(f"\n{BOLD}[Kai Tasks] ログ記録 [{result.get('id','?')}]{RESET}")
    print(f"  {icon} [{a.type}] {a.summary}")
    if body["detail"]:
        print(f"  {GRAY}{body['detail']}{RESET}")
    print()

def cmd_session_end(a):
    """セッション終了時に要約ログを記録し、必要に応じてスナップショットを作成する"""
    body = {
        "type": "output",
        "summary": a.summary,
        "detail": getattr(a, "detail", "") or "",
    }
    result = _req("POST", f"/projects/{a.project_id}/logs", body)
    print(f"\n{BOLD}[Kai Tasks] セッション終了ログ [{result.get('id','?')}]{RESET}")
    print(f"  📦 {a.summary}")
    if body["detail"]:
        print(f"  {GRAY}{body['detail']}{RESET}")
    if getattr(a, "snapshot", False):
        snap = _req("POST", f"/projects/{a.project_id}/snapshot",
                    {"label": f"セッション終了 — {datetime.now().strftime('%Y-%m-%d %H:%M')}"})
        print(f"  {GREEN}📸 スナップショット保存: [{snap.get('id','?')}]{RESET}")
    print()

def cmd_snapshot(a):
    """プロジェクトの現在状態をスナップショットとして永続保存する"""
    label = getattr(a, "label", None) or f"スナップショット {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    snap = _req("POST", f"/projects/{a.project_id}/snapshot", {"label": label})
    print(f"\n{BOLD}[Kai Tasks] スナップショット作成 [{snap.get('id','?')}]{RESET}")
    print(f"  {GREEN}📸{RESET} {snap.get('label','')}")
    print(f"  {GRAY}{snap.get('timestamp','')}{RESET}\n")

def cmd_log(a):
    """最近の変更履歴を全プロジェクトから表示"""
    data  = _req("GET", "/tasks")
    limit = getattr(a, "limit", 15) or 15
    all_h = []

    for p in data.get("projects", []):
        for h in (p.get("history") or []):
            all_h.append({**h, "project": p["name"], "source": "プロジェクト"})
        for _, t in _all_tasks(p):
            for h in (t.get("history") or []):
                all_h.append({**h, "project": p["name"], "source": t["title"]})

    all_h.sort(key=lambda x: x["timestamp"], reverse=True)
    recent = all_h[:limit]

    print(f"\n{BOLD}[Kai Tasks] 変更履歴 — 最新{limit}件{RESET}\n")
    for h in recent:
        ts = h["timestamp"].replace("T", " ")
        print(f"  {GRAY}{ts}{RESET}  {BLUE}[{h['project']}]{RESET}  {BOLD}{h['action']}{RESET} — {h['detail']}")
        if h["source"] != "プロジェクト":
            print(f"            {GRAY}↳ {h['source']}{RESET}")
    print()

# ── エントリーポイント ────────────────

def main():
    p = argparse.ArgumentParser(description="Kai Tasks CLI")
    sub = p.add_subparsers(dest="command")

    sub.add_parser("ensure-server", aliases=["server"])
    sub.add_parser("status")
    sub.add_parser("list")
    sub.add_parser("open")

    c = sub.add_parser("create")
    c.add_argument("--name", required=True)
    c.add_argument("--goal", default="")
    c.add_argument("--memo", default="")

    c = sub.add_parser("create-bare")
    c.add_argument("--name", required=True)
    c.add_argument("--goal", default="")
    c.add_argument("--memo", default="")

    c = sub.add_parser("add-task")
    c.add_argument("project_id")
    c.add_argument("--type",  required=True, choices=["big","medium","small"])
    c.add_argument("--title", required=True)
    c.add_argument("--desc",  default="")
    c.add_argument("--due",   default=None)

    c = sub.add_parser("set-roadmap")
    c.add_argument("task_id")
    c.add_argument("--code", required=True)

    c = sub.add_parser("set-mindmap")
    c.add_argument("task_id")
    c.add_argument("--code", required=True)

    c = sub.add_parser("start-task")
    c.add_argument("task_id")

    c = sub.add_parser("done-task")
    c.add_argument("task_id")

    c = sub.add_parser("update-task")
    c.add_argument("task_id")
    c.add_argument("--status", choices=["todo","in_progress","done"])
    c.add_argument("--title",  default=None)
    c.add_argument("--desc",   default=None)
    c.add_argument("--due",    default=None)

    c = sub.add_parser("show")
    c.add_argument("project_id")

    c = sub.add_parser("find")
    c.add_argument("name")

    c = sub.add_parser("project-done")
    c.add_argument("project_id")

    c = sub.add_parser("project-archive")
    c.add_argument("project_id")

    sub.add_parser("today")

    c = sub.add_parser("log")
    c.add_argument("--limit", type=int, default=15)

    c = sub.add_parser("pivot")
    c.add_argument("project_id")
    c.add_argument("--type", choices=["strategic","technical","scope","conceptual"], default="strategic")
    c.add_argument("--from", dest="from_", default="", metavar="FROM")
    c.add_argument("--to", required=True)
    c.add_argument("--reason", default="")
    c.add_argument("--impact", choices=["high","medium","low"], default="medium")

    c = sub.add_parser("link")
    c.add_argument("project_id")
    c.add_argument("target_id")

    c = sub.add_parser("unlink")
    c.add_argument("project_id")
    c.add_argument("target_id")

    c = sub.add_parser("init-mindmap")
    c.add_argument("task_id")

    c = sub.add_parser("attach-file")
    c.add_argument("task_id")
    c.add_argument("--path", required=True)
    c.add_argument("--label", default="")

    c = sub.add_parser("check-files")
    c.add_argument("--project-id", dest="project_id", default=None)

    c = sub.add_parser("log-action")
    c.add_argument("project_id")
    c.add_argument("--type", choices=["instruction","decision","output","note"], default="note")
    c.add_argument("--summary", required=True)
    c.add_argument("--detail", default="")

    c = sub.add_parser("session-end")
    c.add_argument("project_id")
    c.add_argument("--summary", required=True)
    c.add_argument("--detail", default="")
    c.add_argument("--snapshot", action="store_true", help="スナップショットも作成する")

    c = sub.add_parser("snapshot")
    c.add_argument("project_id")
    c.add_argument("--label", default="")

    args = p.parse_args()

    # ensure-server は常に最初に実行
    if args.command in (None, "ensure-server", "server"):
        ok = ensure_server(quiet=(args.command not in ("ensure-server","server")))
        if args.command in ("ensure-server","server"):
            sys.exit(0 if ok else 1)
    else:
        if not ensure_server(quiet=True):
            sys.exit(1)

    dispatch = {
        "status":          cmd_status,
        "list":            cmd_list,
        "open":            cmd_open,
        "create":          cmd_create,
        "create-bare":     cmd_create_bare,
        "add-task":        cmd_add_task,
        "set-roadmap":     cmd_set_roadmap,
        "set-mindmap":     cmd_set_mindmap,
        "start-task":      cmd_start_task,
        "done-task":       cmd_done_task,
        "update-task":     cmd_update_task,
        "show":            cmd_show,
        "find":            cmd_find,
        "project-done":    cmd_project_done,
        "project-archive": cmd_project_archive,
        "today":           cmd_today,
        "log":             cmd_log,
        "pivot":           cmd_pivot,
        "link":            cmd_link,
        "unlink":          cmd_unlink,
        "init-mindmap":    cmd_init_mindmap,
        "attach-file":     cmd_attach_file,
        "check-files":     cmd_check_files,
        "log-action":      cmd_log_action,
        "session-end":     cmd_session_end,
        "snapshot":        cmd_snapshot,
    }
    fn = dispatch.get(args.command)
    if fn:
        fn(args)
    else:
        p.print_help()

if __name__ == "__main__":
    main()
