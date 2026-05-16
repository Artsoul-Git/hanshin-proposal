#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_flows.py  ―  チェック専用ユーティリティ
売上2倍_羅針盤_20260516.html の q-tr（🔴 今すぐ着手）象限で
フローが未作成のアイテムを一覧表示する。

フローの生成・HTML更新は Claude Code（Kai）が直接行う。
このスクリプトは API 連携なし・外部コストゼロで動作する。

使い方:
  py generate_flows.py          # 不足アイテム一覧を表示
  py generate_flows.py --all    # 既存フローも含めて全件表示
"""

import re, sys, os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_FILE  = os.path.join(SCRIPT_DIR, "売上2倍_羅針盤_20260516.html")

MATRICES_QTR = [
    {"themeIndex":0,"themeName":"アライアンス構築","quadrant":"q0-tr",
     "items":["税理士リスト作成","アライアンス提案書","初回アポ5件獲得"]},
    {"themeIndex":1,"themeName":"ライモBiz販売体制","quadrant":"q1-tr",
     "items":["提案資料1枚作成","トークスクリプト作成","成約フロー標準化"]},
    {"themeIndex":2,"themeName":"コンテンツ発信","quadrant":"q2-tr",
     "items":["発信テーマ設定","X週3投稿開始","導入事例レポート作成"]},
    {"themeIndex":3,"themeName":"伴走支援設計","quadrant":"q3-tr",
     "items":["3ティア料金設計","提供内容の標準化"]},
    {"themeIndex":4,"themeName":"セミナー・勉強会","quadrant":"q4-tr",
     "items":["登壇交渉（アライアンス）","初回セミナー企画"]},
    {"themeIndex":5,"themeName":"営業パイプライン管理","quadrant":"q5-tr",
     "items":["パイプライン可視化","CRMツール整備","週次レビュー習慣化"]},
    {"themeIndex":6,"themeName":"実績・口コミ構築","quadrant":"q6-tr",
     "items":["既存客事例化許可取得","事例1枚ペーパー作成","紹介依頼スクリプト"]},
    {"themeIndex":7,"themeName":"財務・事業設計","quadrant":"q7-tr",
     "items":["200万逆算スケジュール","月次収支3シナリオ","損益分岐点把握"]},
]

def get_existing_source_items(html):
    return set(re.findall(r'sourceItem:["\']([^"\']+)["\']', html))

def main():
    show_all = "--all" in sys.argv
    with open(HTML_FILE, "r", encoding="utf-8") as f:
        html = f.read()

    existing = get_existing_source_items(html)
    total = sum(len(m["items"]) for m in MATRICES_QTR)
    missing_count = sum(1 for m in MATRICES_QTR for it in m["items"] if it not in existing)

    print("=" * 52)
    print("  羅針盤フロー チェックツール")
    print("=" * 52)
    print(f"\nq-tr アイテム総数 : {total} 件")
    print(f"既存フロー        : {total - missing_count} 件")
    print(f"未作成            : {missing_count} 件\n")

    for matrix in MATRICES_QTR:
        for item in matrix["items"]:
            exists = item in existing
            if show_all or not exists:
                mark = "✅" if exists else "❌"
                print(f"  {mark} [{matrix['themeName']}] {item}")

    if missing_count == 0:
        print("\n✅ すべてのアイテムにフローが存在します。")
    else:
        print(f"\n→ 不足 {missing_count} 件は Kai が直接 HTML を更新します。")

if __name__ == "__main__":
    main()
