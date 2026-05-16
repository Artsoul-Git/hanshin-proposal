#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_flows.py
売上2倍_羅針盤_20260516.html の q-tr（🔴 今すぐ着手）象限で
フロー・タスクガイドが未作成のアイテムを Claude API で自動生成し HTML に反映する。

使い方:
  py generate_flows.py             # 全不足アイテムを生成
  py generate_flows.py --check     # 不足確認のみ（HTML変更なし）
  py generate_flows.py --item "アイテム名"  # 指定アイテムのみ生成

必須環境変数:
  ANTHROPIC_API_KEY
"""

import re, sys, os, json, shutil
from datetime import date
import anthropic

# Windows コンソールで日本語・絵文字を正常出力するため UTF-8 に設定
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# ── 設定 ──────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_FILE  = os.path.join(SCRIPT_DIR, "売上2倍_羅針盤_20260516.html")
TODAY      = date.today().isoformat()
MODEL      = "claude-opus-4-5"

# ── マトリクス定義（q-tr 象限のみ） ───────────────────────────────────
MATRICES_QTR = [
    {"themeIndex":0,"themeName":"アライアンス構築",
     "themeInsight":"今月の最優先は「アポ獲得」と「提案書作成」の2点に絞ること。リスト作りに時間をかけすぎず、まず5社に連絡を入れることが全てのスタート。商工会や士業横展開は税理士が軌道に乗ってから。",
     "quadrant":"q0-tr","quadrantDesc":"最速でチャネルが生まれる",
     "items":[
         {"text":"税理士リスト作成","detail":"5事務所を今週中に特定"},
         {"text":"アライアンス提案書","detail":"A4一枚・今月中に完成"},
         {"text":"初回アポ5件獲得","detail":"メール送付から開始"},
     ]},
    {"themeIndex":1,"themeName":"ライモBiz販売体制",
     "themeInsight":"提案資料とトークスクリプトがなければ7件成約は永遠に達成できない。この2点は今週着手・来週完成を死守。FAQと競合比較は提案に慣れてから追加で十分。",
     "quadrant":"q1-tr","quadrantDesc":"成約に直結する最重要準備",
     "items":[
         {"text":"提案資料1枚作成","detail":"今週着手・来週完成"},
         {"text":"トークスクリプト作成","detail":"業種別2パターンから"},
         {"text":"成約フロー標準化","detail":"60分の面談フロー設計"},
     ]},
    {"themeIndex":2,"themeName":"コンテンツ発信",
     "themeInsight":"コンテンツは3ヶ月後に効いてくる投資。今月から始めないと10月に間に合わない。XとBiz事例レポートを最初の2本柱に絞り、週2〜3時間以上かけないこと。",
     "quadrant":"q2-tr","quadrantDesc":"認知獲得の土台を今すぐ作る",
     "items":[
         {"text":"発信テーマ設定","detail":"今週中に決定"},
         {"text":"X週3投稿開始","detail":"今週から開始"},
         {"text":"導入事例レポート作成","detail":"提案資料と並行作成"},
     ]},
    {"themeIndex":3,"themeName":"伴走支援設計",
     "themeInsight":"サブスク収入は月商安定化の命綱。1社でも早く契約を取ることが最優先。まず料金と内容を決め、契約書を整備すること。複数社管理の効率化は5社を超えてから考えれば十分。",
     "quadrant":"q3-tr","quadrantDesc":"初契約獲得に必要な最低限",
     "items":[
         {"text":"3ティア料金設計","detail":"今週中に価格と内容を決定"},
         {"text":"提供内容の標準化","detail":"月次MTG・報告書の仕様を決める"},
     ]},
    {"themeIndex":4,"themeName":"セミナー・勉強会",
     "themeInsight":"自社集客セミナーよりアライアンス先の主催勉強会への登壇が圧倒的に効率的。集客コストゼロ・信頼の借り受けができる。アライアンス合意後、即座に登壇を打診すること。",
     "quadrant":"q4-tr","quadrantDesc":"見込み客獲得の最速ルート",
     "items":[
         {"text":"登壇交渉（アライアンス）","detail":"アライアンス合意後すぐ打診"},
         {"text":"初回セミナー企画","detail":"アライアンス先顧客向け5〜10名"},
     ]},
    {"themeIndex":5,"themeName":"営業パイプライン管理",
     "themeInsight":"パイプライン管理は「200万達成を確実にする」ための安全装置。週次レビューがないと気づいたときには手遅れになる。ツールはシンプルなNotionかスプレッドシートで十分。複雑にしないこと。",
     "quadrant":"q5-tr","quadrantDesc":"今週中に構築開始",
     "items":[
         {"text":"パイプライン可視化","detail":"シンプルなシートで今週開始"},
         {"text":"CRMツール整備","detail":"Notionで30分で作れる"},
         {"text":"週次レビュー習慣化","detail":"毎週月曜朝30分を固定"},
     ]},
    {"themeIndex":6,"themeName":"実績・口コミ構築",
     "themeInsight":"今すぐできる最高の口コミ施策は「既存客の事例化」。ゼロコスト・高信頼性。過去のクライアントに今週連絡を取り、許可を得ること。事例1枚が提案成功率を3倍にする。",
     "quadrant":"q6-tr","quadrantDesc":"ゼロコストで信頼を獲得する",
     "items":[
         {"text":"既存客事例化許可取得","detail":"今週中に連絡する"},
         {"text":"事例1枚ペーパー作成","detail":"業種別3種・来週完成目標"},
         {"text":"紹介依頼スクリプト","detail":"事例化ついでに紹介も依頼"},
     ]},
    {"themeIndex":7,"themeName":"財務・事業設計",
     "themeInsight":"今週中に「200万の逆算スケジュール」を作ること。毎月何件成約すればいいかが見えていないのに目標達成はできない。3シナリオのシミュレーションは1〜2時間あれば作れる。",
     "quadrant":"q7-tr","quadrantDesc":"今週中に数字を揃える",
     "items":[
         {"text":"200万逆算スケジュール","detail":"月次目標を今週中に作成"},
         {"text":"月次収支3シナリオ","detail":"楽観・標準・悲観でシミュレーション"},
         {"text":"損益分岐点把握","detail":"固定費の洗い出しから"},
     ]},
]

# ── ユーティリティ ─────────────────────────────────────────────────────

def read_html():
    with open(HTML_FILE, "r", encoding="utf-8") as f:
        return f.read()

def write_html(html):
    bak = HTML_FILE + ".bak"
    shutil.copy2(HTML_FILE, bak)
    with open(HTML_FILE, "w", encoding="utf-8", newline="") as f:
        f.write(html)
    print(f"  バックアップ: {os.path.basename(bak)}")

def get_existing_source_items(html):
    """既存フローの sourceItem 一覧（シングル/ダブルクォート両対応）"""
    return set(re.findall(r'sourceItem:["\']([^"\']+)["\']', html))

def get_next_flow_id(html):
    ids = [int(m) for m in re.findall(r'id:["\']fl-(\d+)["\']', html)]
    return max(ids) + 1 if ids else 0

def get_missing_items(html, filter_item=None):
    existing = get_existing_source_items(html)
    missing = []
    for matrix in MATRICES_QTR:
        for item in matrix["items"]:
            if item["text"] not in existing:
                if filter_item is None or filter_item == item["text"]:
                    missing.append((matrix, item))
    return missing

def esc(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")

def to_js(v):
    """Python オブジェクト → JS リテラル（単引用符）"""
    if isinstance(v, str):   return f"'{esc(v)}'"
    if isinstance(v, bool):  return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    if v is None:            return "null"
    if isinstance(v, list):  return "[" + ",".join(to_js(x) for x in v) + "]"
    if isinstance(v, dict):
        pairs = ",".join(f"{k}:{to_js(val)}" for k, val in v.items())
        return "{" + pairs + "}"
    return repr(v)

# ── Claude API ─────────────────────────────────────────────────────────

SYSTEM = (
    "あなたは月商200万円達成を支援するAIコンサルタント「Kai」です。"
    "厳格・実践的・辛口。必ずJSONのみを出力し、説明文・マークダウンは一切不要です。"
)

def call_claude(client, prompt, max_tokens=2500):
    msg = client.messages.create(
        model=MODEL, max_tokens=max_tokens, system=SYSTEM,
        messages=[{"role": "user", "content": prompt}]
    )
    text = msg.content[0].text.strip()
    # コードブロック除去
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```\s*$", "", text, flags=re.MULTILINE)
    m = re.search(r"\{[\s\S]+\}", text)
    if m:
        text = m.group(0)
    return json.loads(text)

def generate_flow(client, matrix, item):
    prompt = f"""以下のアクションアイテムに対して実行フローをJSONで生成してください。

## コンテキスト
- 経営者: AI導入支援コンサルタント（独立1年目、月商200万を10月末に達成が目標）
- 収益柱: ライモBiz販売（月7件目標・20万/件）＋伴走支援月5万×N社＋税理士アライアンス
- テーマ: {matrix["themeName"]}
- 方針: {matrix["themeInsight"]}
- 象限: 🔴 今すぐ着手（{matrix["quadrantDesc"]}）
- アクション: {item["text"]}
- メモ: {item["detail"]}

## 出力形式
{{
  "title": "フロータイトル（行動的・具体的・30字以内）",
  "kaiComment": "Kaiコメント（辛口・実践的・150字程度・短文連続スタイル・「〜こと。」で締める）",
  "steps": [
    {{"order":1,"title":"ステップタイトル（15字以内）","description":"実行手順詳細（100字以上）","type":"action","duration":"所要時間","output":"具体的な成果物"}}
  ]
}}

- steps は5〜7個、最終stepはtype:milestone
- typeはaction/decision/milestoneのいずれか
- 初心者でも今日から実行できる内容
- JSONのみ出力"""
    return call_claude(client, prompt, max_tokens=2000)

def generate_guide(client, flow_data):
    step_list = "\n".join(
        f"  Step{s['order']}: {s['title']}（{s.get('duration','')}）"
        for s in flow_data["steps"]
    )
    n = len(flow_data["steps"])
    prompt = f"""以下のフローに対してタスクガイドをJSONで生成してください。

## フロータイトル
{flow_data["title"]}

## ステップ一覧
{step_list}

## 出力形式
{{
  "overview": "フロー全体の概要・注意点（100字程度）",
  "totalTime": "総所要時間（例: 3〜5時間）",
  "difficulty": "難易度（低/中/高またはその組み合わせ）",
  "steps": [
    {{
      "stepRef": 1,
      "title": "ステップタイトル",
      "timeEstimate": "所要時間",
      "effortLevel": "低",
      "detailedInstructions": "初心者向け詳細手順（200字以上）。<br>で改行。",
      "workTemplate": "コピペ可能な作業テンプレート（<br>で改行。不要ならnull）",
      "claudePrompt": "AIへの依頼プロンプト（<br>で改行。不要ならnull）",
      "checklist": ["完了確認チェック1","チェック2","チェック3"]
    }}
  ]
}}

- steps は{n}個（全ステップをカバー）
- detailedInstructions は200字以上
- checklist は3〜5項目
- workTemplate・claudePrompt は実用的なもののみ（不要ならnull）
- JSONのみ出力"""
    return call_claude(client, prompt, max_tokens=3500)

# ── JS ビルド ──────────────────────────────────────────────────────────

def build_flow_js(flow_id, matrix, item, flow_data):
    steps_js = []
    for s in flow_data["steps"]:
        steps_js.append(to_js({
            "order": s["order"], "title": s["title"],
            "description": s["description"], "type": s["type"],
            "duration": s.get("duration",""), "output": s.get("output",""),
        }))
    base = to_js({
        "id": flow_id, "themeIndex": matrix["themeIndex"],
        "quadrant": matrix["quadrant"], "sourceItem": item["text"],
        "title": flow_data["title"], "kaiComment": flow_data["kaiComment"],
    })
    return base[:-1] + f",steps:[{','.join(steps_js)}]}}"

def build_guide_entry(flow_id, guide_data):
    steps_js = []
    for s in guide_data.get("steps", []):
        step = {
            "stepRef": s["stepRef"], "title": s["title"],
            "timeEstimate": s.get("timeEstimate",""),
            "effortLevel": s.get("effortLevel","中"),
            "detailedInstructions": s.get("detailedInstructions",""),
        }
        if s.get("workTemplate"): step["workTemplate"] = s["workTemplate"]
        if s.get("claudePrompt"): step["claudePrompt"] = s["claudePrompt"]
        if s.get("checklist"):    step["checklist"]    = s["checklist"]
        steps_js.append(to_js(step))
    base = to_js({
        "createdAt": TODAY,
        "totalTime": guide_data.get("totalTime","—"),
        "difficulty": guide_data.get("difficulty","—"),
        "overview":   guide_data.get("overview",""),
    })
    guide_val = base[:-1] + f",steps:[{','.join(steps_js)}]}}"
    return f"'{esc(flow_id)}':{guide_val}"

# ── HTML 挿入 ──────────────────────────────────────────────────────────

def detect_nl(html):
    return "\r\n" if "\r\n" in html[:500] else "\n"

def insert_flow(html, flow_js):
    """flows 配列の末尾（gantt の直前）に新フローを追加"""
    m = re.search(r"(\n|\r\n)  \],(\n|\r\n)  gantt:", html)
    if not m:
        raise ValueError("flows配列の挿入ポイントが見つかりません（],ganttが見当たらない）")
    pos = m.start()
    nl = detect_nl(html)
    return html[:pos] + f",{nl}    {flow_js}" + html[pos:]

def insert_guide(html, guide_entry):
    """BUILTIN_GUIDES オブジェクトの末尾に新エントリを追加"""
    marker = "Object.entries(BUILTIN_GUIDES)"
    idx = html.find(marker)
    if idx == -1:
        raise ValueError("Object.entries(BUILTIN_GUIDES)が見つかりません")
    before = html[:idx]
    # BUILTIN_GUIDES を閉じる } の直前に挿入
    m = re.search(r"\}(;\s*)\Z", before, re.DOTALL)
    if not m:
        raise ValueError("BUILTIN_GUIDESの閉じ括弧が見つかりません")
    close_pos  = m.start()
    semi_and_nl = m.group(1)
    return (before[:close_pos]
            + "," + guide_entry
            + "}" + semi_and_nl
            + html[idx:])

# ── メイン ─────────────────────────────────────────────────────────────

def main():
    check_only  = "--check" in sys.argv
    filter_item = None
    for i, a in enumerate(sys.argv[1:], 1):
        if a == "--item" and i < len(sys.argv):
            filter_item = sys.argv[i + 1]
            break

    print("=" * 52)
    print("  羅針盤フロー自動生成スクリプト")
    print("=" * 52)

    html    = read_html()
    missing = get_missing_items(html, filter_item)
    total   = sum(len(m["items"]) for m in MATRICES_QTR)
    done    = total - len(missing)

    print(f"\nq-tr アイテム総数 : {total} 件")
    print(f"既存フロー        : {done} 件")
    print(f"未生成            : {len(missing)} 件\n")

    if not missing:
        print("✅ すべてのアイテムにフロー＆タスクガイドが存在します。")
        return

    for matrix, item in missing:
        print(f"  ❌ [{matrix['themeName']}] {item['text']}")

    if check_only:
        print("\n--check モードのため生成をスキップします。")
        return

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("\n❌ ANTHROPIC_API_KEY が未設定です。")
        print("   実行前に: set ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)

    client  = anthropic.Anthropic(api_key=api_key)
    next_id = get_next_flow_id(html)
    errors  = []

    for matrix, item in missing:
        flow_id = f"fl-{next_id}"
        next_id += 1
        label   = f"[{matrix['themeName']}] {item['text']}"

        print(f"\n{'─' * 52}")
        print(f"生成中: {label}")

        try:
            print("  ① フロー生成 ...", end="", flush=True)
            flow_data = generate_flow(client, matrix, item)
            print(f" ✓  {flow_data['title']}  ({len(flow_data['steps'])} steps)")

            print("  ② タスクガイド生成 ...", end="", flush=True)
            guide_data = generate_guide(client, flow_data)
            print(" ✓")

            flow_js     = build_flow_js(flow_id, matrix, item, flow_data)
            guide_entry = build_guide_entry(flow_id, guide_data)

            html = insert_flow(html, flow_js)
            html = insert_guide(html, guide_entry)

            print(f"  ✅ {flow_id} 挿入完了")

        except Exception as e:
            import traceback
            print(f" ❌")
            print(f"  エラー: {e}")
            traceback.print_exc()
            errors.append((label, str(e)))

    # 変更があれば保存
    original = read_html()
    if html != original:
        print(f"\n{'=' * 52}")
        write_html(html)
        generated = len(missing) - len(errors)
        print(f"✅ HTML 更新完了  ({generated} フロー追加)")

    if errors:
        print(f"\n⚠️  エラー ({len(errors)} 件):")
        for lbl, err in errors:
            print(f"   {lbl}: {err}")

if __name__ == "__main__":
    main()
