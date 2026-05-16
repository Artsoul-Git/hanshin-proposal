#!/usr/bin/env python3
"""
kai-review.py — Kai 評価システム

ロードマップ（構造改革ロードマップ_2026.md）を評価基準として、
git履歴・セッションログ・kai-tasksデータから作業を自動分析する。

コマンド:
  daily   [--date YYYY-MM-DD]   今日（または指定日）の作業を分類・スコアリング
  weekly  [--last] [--mode MODE] 週次レビュー用データを集計・出力
  monthly [--last]              月次総括用データを集計・出力
  status                        評価ダッシュボード表示

--mode オプション（weekly/monthly）:
  print  Kai が読んで分析するためのテキスト出力（デフォルト。追加コストなし）
  api    Claude API を直接呼び出して分析（将来のサーバー運用向け）
"""
import sys, os, json, re, subprocess
from pathlib import Path
from datetime import datetime, timedelta, date

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ─── Windows ANSI カラー有効化 ─────────────────────────────────
if os.name == "nt":
    try:
        import ctypes
        ctypes.windll.kernel32.SetConsoleMode(
            ctypes.windll.kernel32.GetStdHandle(-11), 7)
    except Exception:
        pass

RST = "\033[0m"; RED = "\033[91m"; GRN = "\033[92m"
YLW = "\033[93m"; BLU = "\033[94m"; BLD = "\033[1m"; DIM = "\033[2m"

# ─── パス定義 ──────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent          # AS_AI導入支援事業_cc/
ROADMAP_PATH = PROJECT_ROOT / "01_経営管理" / "構造改革ロードマップ_2026.md"
LOGS_DIR     = PROJECT_ROOT / "logs"
KAI_TASKS_DATA = SCRIPT_DIR.parent / "kai-tasks" / "data" / "tasks.json"
KAI_TASKS_CLI  = SCRIPT_DIR.parent / "kai-tasks" / "kai-tasks-cli.py"
REVIEWS_DIR  = SCRIPT_DIR / "reviews"
DAILY_DIR    = REVIEWS_DIR / "daily"
WEEKLY_DIR   = REVIEWS_DIR / "weekly"
MONTHLY_DIR  = REVIEWS_DIR / "monthly"


# ══════════════════════════════════════════════════════════════
#  ゴール定義（ロードマップ 5本柱 + Phase1 タスク）
# ══════════════════════════════════════════════════════════════

PILLARS = {
    "pillar1": {
        "name": "ナレッジ標準化パイプライン",
        "keywords": ["knowledge", "ナレッジ", "スターターパック", "ヒアリング",
                     "テンプレート", "情報投入", "フォーマット", "知識"],
        "phase1": ["Kaiスターターパックテンプレートを作成"],
    },
    "pillar2": {
        "name": "Kai自己検証プロトコル",
        "keywords": ["自己検証", "self-validation", "レッドチーム", "品質ゲート",
                     "fact-check", "ファクトチェック", "検証"],
        "phase1": ["Kai自己検証プロトコルをスキルに組み込む"],
    },
    "pillar3": {
        "name": "段階的自律権限拡張",
        "keywords": ["L2", "L3", "L4", "自律", "権限", "承認率", "自律レベル"],
        "phase1": [],
    },
    "pillar4": {
        "name": "フィードバック→ルール化ループ",
        "keywords": ["フィードバック", "rules", "ルール化", "kai-style-guide",
                     "style-guide", "修正", "スタイルガイド"],
        "phase1": ["フィードバック→ルール化ループの運用開始"],
    },
    "pillar5": {
        "name": "案件パイプライン可視化",
        "keywords": ["パイプライン", "案件", "ステータス", "鳥瞰", "可視化", "管理"],
        "phase1": ["案件パイプライン管理ファイルを作成・運用開始"],
    },
}

# ゴール外でも価値を持つカテゴリ
VALUE_CATS = {
    "tool_dev":       ["スキル", "skill", "ツール", "アプリ", "html", "python", "cli", "システム"],
    "client_work":    ["クライアント", "提案書", "まる", "コーデ", "就労", "障害"],
    "content":        ["brain", "記事", "セミナー", "スライド", "コンテンツ"],
    "maintenance":    ["fix", "修正", "バグ", "update", "refactor", "改善"],
    "infra_system":   ["憲法", "constitution", "claude.md", "memory", "セッションログ", "log"],
}


# ══════════════════════════════════════════════════════════════
#  分類・スコアリング
# ══════════════════════════════════════════════════════════════

def classify(text: str) -> dict:
    t = text.lower()

    pillar_hits = []
    for pid, p in PILLARS.items():
        hits = sum(1 for kw in p["keywords"] if kw.lower() in t)
        if hits:
            pillar_hits.append({"id": pid, "name": p["name"], "hits": hits})
    pillar_hits.sort(key=lambda x: -x["hits"])

    value_hits = [cat for cat, kws in VALUE_CATS.items()
                  if any(kw.lower() in t for kw in kws)]

    if pillar_hits:
        goal_alignment = min(3, pillar_hits[0]["hits"] + 1)
        kind = "on_track"
    elif value_hits:
        goal_alignment = 1
        kind = "value_add"
    else:
        goal_alignment = 0
        kind = "off_track"

    return {
        "pillars": pillar_hits,
        "value_cats": value_hits,
        "goal_alignment": goal_alignment,   # 0–3
        "kind": kind,                        # on_track / value_add / off_track
    }


def score_commit(c: dict) -> dict:
    text = c["message"] + " " + " ".join(c.get("files", []))
    cl = classify(text)

    msg = c["message"].lower()
    if msg.startswith(("feat:", "feat：")):
        output_q = 3
    elif msg.startswith(("fix:", "refactor:", "docs:")):
        output_q = 2
    elif msg.startswith("auto:"):
        output_q = 1
    else:
        output_q = min(2, len(c.get("files", [])))

    return {**c, **cl, "output_q": output_q,
            "total": cl["goal_alignment"] + output_q}   # 0–6


# ══════════════════════════════════════════════════════════════
#  データ収集
# ══════════════════════════════════════════════════════════════

def git_commits(since: str, until: str) -> list:
    try:
        r = subprocess.run(
            ["git", "log",
             f"--since={since}", f"--until={until}",
             "--name-only",
             "--format=COMMIT|%H|%ai|%s", "--", "."],
            capture_output=True, text=True,
            encoding="utf-8", errors="replace",
            cwd=str(PROJECT_ROOT),
        )
        commits, cur = [], None
        for line in r.stdout.splitlines():
            if line.startswith("COMMIT|"):
                if cur:
                    commits.append(cur)
                parts = line.split("|", 3)
                cur = {"hash": parts[1][:8], "ts": parts[2],
                       "message": parts[3] if len(parts) > 3 else "",
                       "files": []}
            elif line.strip() and cur:
                cur["files"].append(line.strip())
        if cur:
            commits.append(cur)
        return commits
    except Exception:
        return []


def session_logs_for(d: date) -> list:
    month_dir = LOGS_DIR / d.strftime("%Y-%m")
    if not month_dir.exists():
        return []
    logs = []
    for f in month_dir.glob("*.md"):
        mtime = datetime.fromtimestamp(f.stat().st_mtime).date()
        if mtime == d:
            txt = f.read_text(encoding="utf-8", errors="replace")
            logs.append({"file": f.name, "preview": txt[:800]})
    return logs


def tasks_activity(d: date) -> dict:
    if not KAI_TASKS_DATA.exists():
        return {"completed": [], "started": []}
    try:
        data = json.loads(KAI_TASKS_DATA.read_text(encoding="utf-8"))
        completed, started = [], []
        ds = d.isoformat()
        for proj in data.get("projects", []):
            for task in proj.get("tasks", []):
                upd = task.get("updatedAt", "")[:10]
                if upd == ds:
                    entry = {"title": task.get("title"), "project": proj.get("name")}
                    if task.get("status") == "done":
                        completed.append(entry)
                    elif task.get("status") == "in_progress":
                        started.append(entry)
        return {"completed": completed, "started": started}
    except Exception:
        return {"completed": [], "started": []}


# ══════════════════════════════════════════════════════════════
#  日次レビュー
# ══════════════════════════════════════════════════════════════

def run_daily(target: date | None = None) -> dict:
    if target is None:
        target = date.today()
    ds = target.isoformat()

    print(f"\n{BLD}📊 日次評価: {ds}{RST}")

    commits = git_commits(f"{ds} 00:00:00", f"{ds} 23:59:59")
    scored  = [score_commit(c) for c in commits]
    logs    = session_logs_for(target)
    tasks   = tasks_activity(target)

    on_track  = [c for c in scored if c["kind"] == "on_track"]
    value_add = [c for c in scored if c["kind"] == "value_add"]
    off_track = [c for c in scored if c["kind"] == "off_track"]
    total_sc  = sum(c["total"] for c in scored)

    result = {
        "date": ds,
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "commits":          len(scored),
            "total_score":      total_sc,
            "avg_score":        round(total_sc / max(1, len(scored)), 2),
            "on_track":         len(on_track),
            "value_add":        len(value_add),
            "off_track":        len(off_track),
            "tasks_completed":  len(tasks["completed"]),
        },
        "commits":      scored,
        "session_logs": logs,
        "tasks":        tasks,
    }

    DAILY_DIR.mkdir(parents=True, exist_ok=True)
    out = DAILY_DIR / f"{ds}.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    _print_daily(result)
    print(f"\n{DIM}保存: {out}{RST}")
    return result


def _print_daily(r: dict):
    s = r["summary"]
    print(f"\n{BLD}── サマリー ──────────────────────────────{RST}")
    print(f"  コミット {s['commits']}件  |  平均スコア {s['avg_score']:.1f}/6  |"
          f"  タスク完了 {s['tasks_completed']}件")
    print(f"  ゴール直結 {GRN}{s['on_track']}件{RST} /"
          f" 付加価値 {YLW}{s['value_add']}件{RST} /"
          f" 脱線 {RED}{s['off_track']}件{RST}")

    if r["commits"]:
        print(f"\n{BLD}── 作業詳細（スコア降順）────────────────{RST}")
        for c in sorted(r["commits"], key=lambda x: -x["total"]):
            bar = "█" * c["total"] + "░" * (6 - c["total"])
            col = GRN if c["kind"] == "on_track" else \
                  YLW if c["kind"] == "value_add" else RED
            pillar = f" → {c['pillars'][0]['name']}" if c["pillars"] else ""
            print(f"  {col}{bar}{RST} [{c['total']}/6] {c['message'][:55]}{pillar}")


# ══════════════════════════════════════════════════════════════
#  週次レビュー
# ══════════════════════════════════════════════════════════════

def week_dates(offset: int = 0) -> list[date]:
    today = date.today()
    mon   = today - timedelta(days=today.weekday()) + timedelta(weeks=offset)
    return [mon + timedelta(days=i) for i in range(7)]


def load_dailies(dates: list[date]) -> list[dict]:
    out = []
    for d in dates:
        p = DAILY_DIR / f"{d.isoformat()}.json"
        if p.exists():
            out.append(json.loads(p.read_text(encoding="utf-8")))
    return out


def weekly_print_report(dailies: list[dict], w_start: date) -> str:
    """Kai が読んで分析するための構造化テキストを返す（追加コストなし）"""
    w_end = w_start + timedelta(days=6)
    roadmap = ROADMAP_PATH.read_text(encoding="utf-8", errors="replace") \
              if ROADMAP_PATH.exists() else "(ロードマップ未読み込み)"

    lines = [
        f"# 週次評価データ: {w_start} 〜 {w_end}",
        "",
        "## 評価基準（ロードマップ抜粋）",
        roadmap[:2500],
        "",
        "## 今週の作業データ",
    ]

    all_commits = []
    for daily in dailies:
        for c in daily.get("commits", []):
            all_commits.append({
                "date":     daily["date"],
                "message":  c["message"],
                "total":    c["total"],
                "kind":     c["kind"],
                "pillars":  [p["name"] for p in c.get("pillars", [])],
                "output_q": c.get("output_q", 0),
            })

    total_sc = sum(c["total"] for c in all_commits)
    avg_sc   = total_sc / max(1, len(all_commits))

    lines += [
        f"- 作業日数: {len(dailies)}日",
        f"- コミット総数: {len(all_commits)}件",
        f"- 平均スコア: {avg_sc:.2f}/6",
        f"- ゴール直結: {sum(1 for c in all_commits if c['kind']=='on_track')}件",
        f"- 付加価値: {sum(1 for c in all_commits if c['kind']=='value_add')}件",
        f"- 脱線: {sum(1 for c in all_commits if c['kind']=='off_track')}件",
        "",
        "### コミット一覧",
    ]
    for c in sorted(all_commits, key=lambda x: -x["total"]):
        lines.append(
            f"- [{c['date']}] スコア{c['total']}/6 ({c['kind']}) : {c['message']}"
            + (f" → {c['pillars'][0]}" if c["pillars"] else "")
        )

    lines += [
        "",
        "## Kai への分析依頼",
        "",
        "上記データをもとに、以下を出力してください：",
        "",
        "### 1. 週次サマリー（3文以内）",
        "### 2. ゴール整合スコア（0-10）と根拠",
        "### 3. 伸ばすべき取り組み",
        "  - 活動名 / 伸ばすべき理由（結果根拠） / 具体的スケールアップアドバイス（3点）",
        "  - kai-tasks 自動作成タスク候補",
        "### 4. 辞めることを推奨（Stop 候補）",
        "  - 活動名",
        "  - 辞める明確な理由（ロードマップとの乖離を具体的に）",
        "  - 辞めることのメリット",
        "  - もし続けるなら最低限やること（辞める推奨は変わらない）",
        "### 5. 翌週の優先アクション（上位3件）",
        "  - アクション / 対応する柱 / 期待アウトプット",
        "### 6. 各柱の進捗コメント（1文ずつ）",
    ]
    return "\n".join(lines)


def run_weekly(offset: int = -1, mode: str = "print") -> dict:
    dates   = week_dates(offset)
    w_start = dates[0]
    w_label = w_start.strftime("%Y-W%V")

    print(f"\n{BLD}📈 週次評価: {w_start} 〜 {dates[-1]}{RST}")

    # 欠損している日次データを自動補完
    for d in dates:
        p = DAILY_DIR / f"{d.isoformat()}.json"
        if not p.exists() and d <= date.today():
            print(f"  {DIM}日次データ補完: {d}{RST}")
            run_daily(d)

    dailies = load_dailies(dates)
    if not dailies:
        print(f"{YLW}今週の作業データがありません{RST}")
        return {}

    WEEKLY_DIR.mkdir(parents=True, exist_ok=True)

    if mode == "api":
        result = _weekly_api(dailies, w_start, w_label)
    else:
        report_text = weekly_print_report(dailies, w_start)
        print("\n" + "═" * 60)
        print(report_text)
        print("═" * 60)
        print(f"\n{BLD}↑ このデータを Kai に読ませて /eval-weekly を実行してください{RST}")
        result = {
            "week": w_label,
            "week_start": w_start.isoformat(),
            "generated_at": datetime.now().isoformat(),
            "mode": "print",
            "daily_count": len(dailies),
        }

    out = WEEKLY_DIR / f"{w_label}_data.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n{DIM}保存: {out}{RST}")
    return result


def _weekly_api(dailies: list, w_start: date, w_label: str) -> dict:
    """Claude API を使って直接分析（将来のサーバー運用向け）"""
    try:
        import anthropic
    except ImportError:
        print(f"{RED}anthropic パッケージが必要です: pip install anthropic{RST}")
        return {}

    prompt = weekly_print_report(dailies, w_start)
    prompt += "\n\n以下の JSON のみで回答してください（マークダウンなし）:\n"
    prompt += json.dumps({
        "week": "", "executive_summary": "", "goal_alignment_score": 0,
        "scale_candidates": [{"activity":"","reason":"","scale_advice":"","task_title":"","task_desc":""}],
        "stop_candidates": [{"activity":"","stop_reason":"","stop_merit":"","if_continue_advice":""}],
        "next_week_priorities": [{"priority":1,"action":"","pillar":"","expected_output":""}],
        "pillar_progress": {"pillar1":"","pillar2":"","pillar3":"","pillar4":"","pillar5":""},
    }, ensure_ascii=False, indent=2)

    client = anthropic.Anthropic()
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text
    try:
        clean = re.sub(r"```json?\s*|\s*```", "", raw).strip()
        insights = json.loads(clean)
    except Exception:
        insights = {"raw": raw}

    result = {
        "week": w_label, "week_start": w_start.isoformat(),
        "generated_at": datetime.now().isoformat(),
        "mode": "api", "insights": insights,
    }
    _print_weekly(insights)
    if "scale_candidates" in insights:
        _suggest_tasks(insights["scale_candidates"])
    return result


def _print_weekly(ins: dict):
    print(f"\n{BLD}── 週次評価結果 ──────────────────────────{RST}")
    print(f"  ゴール整合スコア: {BLD}{ins.get('goal_alignment_score','?')}/10{RST}")
    print(f"\n  {ins.get('executive_summary','')}")

    for item in ins.get("scale_candidates", []):
        print(f"\n{GRN}{BLD}▲ 伸ばす: {item.get('activity','')}{RST}")
        print(f"  理由: {item.get('reason','')}")
        print(f"  アドバイス: {item.get('scale_advice','')}")

    for item in ins.get("stop_candidates", []):
        print(f"\n{RED}{BLD}▼ 辞める推奨: {item.get('activity','')}{RST}")
        print(f"  理由: {item.get('stop_reason','')}")
        print(f"  メリット: {item.get('stop_merit','')}")
        print(f"  {DIM}もし続けるなら: {item.get('if_continue_advice','')}{RST}")

    print(f"\n{BLD}── 翌週の優先アクション ─────────────────{RST}")
    for p in ins.get("next_week_priorities", [])[:3]:
        print(f"  [{p.get('priority','?')}] {p.get('action','')} → {p.get('expected_output','')}")


def _suggest_tasks(scale: list):
    print(f"\n{BLD}── kai-tasks 作成候補 ────────────────────{RST}")
    for item in scale:
        t = item.get("task_title", "")
        if t:
            print(f"  {GRN}✦ {t}{RST}")
            print(f"    {DIM}{item.get('task_desc','')}{RST}")
    print(f"\n{DIM}上記タスクを手動で追加: python kai-tasks-cli.py add-task <PID> --type small --title \"...\"{RST}")


# ══════════════════════════════════════════════════════════════
#  月次レビュー
# ══════════════════════════════════════════════════════════════

def run_monthly(offset: int = -1) -> dict:
    today = date.today()
    target = today.replace(day=1)
    for _ in range(abs(offset)):
        target = (target - timedelta(days=1)).replace(day=1)

    ms = target.strftime("%Y-%m")
    print(f"\n{BLD}📋 月次評価: {ms}{RST}")

    # 当月の日次データを全部ロード
    dailies = []
    if DAILY_DIR.exists():
        for f in sorted(DAILY_DIR.glob(f"{ms}-*.json")):
            dailies.append(json.loads(f.read_text(encoding="utf-8")))

    if not dailies:
        print(f"{YLW}月次データがありません{RST}")
        return {}

    all_commits = []
    pillar_counts: dict[str, int] = {k: 0 for k in PILLARS}
    stop_flags: dict[str, int] = {}   # activity → off_track出現回数

    for daily in dailies:
        for c in daily.get("commits", []):
            all_commits.append(c)
            for p in c.get("pillars", []):
                pid = p.get("id", "")
                if pid in pillar_counts:
                    pillar_counts[pid] += 1
            if c["kind"] == "off_track":
                key = c["message"][:40]
                stop_flags[key] = stop_flags.get(key, 0) + 1

    total_sc = sum(c["total"] for c in all_commits)
    avg_sc   = total_sc / max(1, len(all_commits))

    # 繰り返し off_track（Stop候補）
    stop_candidates = [
        {"activity": k, "count": v, "note": "月内に複数回発生した脱線アクティビティ"}
        for k, v in stop_flags.items() if v >= 2
    ]

    result = {
        "month": ms,
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "working_days":      len(dailies),
            "total_commits":     len(all_commits),
            "avg_score":         round(avg_sc, 2),
            "tasks_completed":   sum(d["summary"]["tasks_completed"] for d in dailies),
        },
        "pillar_activity": pillar_counts,
        "stop_candidates": stop_candidates,
    }

    MONTHLY_DIR.mkdir(parents=True, exist_ok=True)
    out = MONTHLY_DIR / f"{ms}.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    _print_monthly(result)
    print(f"\n{DIM}保存: {out}{RST}")
    print(f"\n{BLD}↑ このデータを Kai に読ませて /eval-monthly を実行してください{RST}")
    return result


def _print_monthly(r: dict):
    s = r["summary"]
    print(f"\n{BLD}── 月次サマリー ──────────────────────────{RST}")
    print(f"  稼働日 {s['working_days']}日 | コミット {s['total_commits']}件 |"
          f" 平均スコア {s['avg_score']:.1f}/6 | タスク完了 {s['tasks_completed']}件")

    print(f"\n{BLD}── 柱別アクティビティ ────────────────────{RST}")
    for pid, count in r["pillar_activity"].items():
        name = PILLARS[pid]["name"]
        bar  = "█" * min(count, 20) + ("" if count <= 20 else f"…+{count-20}")
        print(f"  {name}: {GRN}{bar}{RST} {count}件")

    if r["stop_candidates"]:
        print(f"\n{RED}{BLD}── Stop 候補（繰り返し脱線）─────────────{RST}")
        for item in r["stop_candidates"]:
            print(f"  {item['count']}回: {item['activity']}")


# ══════════════════════════════════════════════════════════════
#  ステータス表示
# ══════════════════════════════════════════════════════════════

def show_status():
    today     = date.today()
    w_start   = today - timedelta(days=today.weekday())
    w_label   = w_start.strftime("%Y-W%V")
    month_str = today.strftime("%Y-%m")

    def _check(path: Path):
        return f"{GRN}✅ 済{RST}" if path.exists() else f"{YLW}⏳ 未{RST}"

    print(f"\n{BLD}╔══ Kai 評価システム ステータス ══╗{RST}")
    print(f"  日次 ({today}):    {_check(DAILY_DIR / f'{today}.json')}")
    print(f"  週次 ({w_label}): {_check(WEEKLY_DIR / f'{w_label}_data.json')}")
    print(f"  月次 ({month_str}): {_check(MONTHLY_DIR / f'{month_str}.json')}")

    print(f"\n{BLD}  直近7日スコア推移:{RST}")
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        p = DAILY_DIR / f"{d.isoformat()}.json"
        if p.exists():
            data = json.loads(p.read_text(encoding="utf-8"))
            avg  = data["summary"]["avg_score"]
            bar  = "█" * int(avg * 3) + "░" * (18 - int(avg * 3))
            lbl  = "今日" if i == 0 else f"-{i}日"
            print(f"  {lbl:>4}: {GRN}{bar}{RST} {avg:.1f}")
        else:
            lbl = "今日" if i == 0 else f"-{i}日"
            print(f"  {lbl:>4}: {DIM}データなし{RST}")


# ══════════════════════════════════════════════════════════════
#  エントリーポイント
# ══════════════════════════════════════════════════════════════

def main():
    import argparse
    p = argparse.ArgumentParser(
        description="kai-review.py — Kai 評価システム",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = p.add_subparsers(dest="cmd")

    pd = sub.add_parser("daily",   help="日次評価（コスト0）")
    pd.add_argument("--date", help="YYYY-MM-DD（省略=今日）", default=None)

    pw = sub.add_parser("weekly",  help="週次レビューデータ集計")
    pw.add_argument("--last", action="store_true", help="先週を対象")
    pw.add_argument("--mode", choices=["print", "api"], default="print",
                    help="print=Kaiが分析（デフォルト）/ api=Claude API直接呼出し")

    pm = sub.add_parser("monthly", help="月次総括データ集計")
    pm.add_argument("--last", action="store_true", help="先月を対象")

    sub.add_parser("status", help="評価ダッシュボード")

    args = p.parse_args()

    if args.cmd == "daily":
        tgt = date.fromisoformat(args.date) if args.date else None
        run_daily(tgt)
    elif args.cmd == "weekly":
        run_weekly(-1 if args.last else 0, mode=args.mode)
    elif args.cmd == "monthly":
        run_monthly(-1 if args.last else 0)
    elif args.cmd == "status":
        show_status()
    else:
        p.print_help()


if __name__ == "__main__":
    main()
