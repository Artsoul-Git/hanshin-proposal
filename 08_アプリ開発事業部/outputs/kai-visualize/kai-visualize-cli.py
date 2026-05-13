#!/usr/bin/env python3
"""Kai Visualize CLI
Usage:
  python kai-visualize-cli.py pending              -- pending requests を表示
  python kai-visualize-cli.py status               -- 生成済みコンテンツ一覧
  python kai-visualize-cli.py post-4q  <ti> <file> -- 4Q マトリクスを投稿 (JSON file)
  python kai-visualize-cli.py post-flow <ti> <file> -- フロー図を投稿 (Mermaid text file)
  python kai-visualize-cli.py post-gantt <ti> <file> -- ガントを投稿 (Mermaid text file)
  python kai-visualize-cli.py open                 -- ブラウザで開く
  python kai-visualize-cli.py reset                -- 全データをリセット（確認あり）
  python kai-visualize-cli.py template 4q          -- 4Q の JSON フォーマットを表示

ti = テーマID（0=顧客開拓, 1=提案品質向上, 2=収益・財務設計, 3=マーケティング,
              4=セミナー事業, 5=パートナー連携, 6=業務効率化, 7=人材・組織体制）
"""
import sys, json, os, urllib.request, urllib.error, webbrowser

API = 'http://localhost:3458'

THEMES = [
    '顧客開拓', '提案品質向上', '収益・財務設計', 'マーケティング',
    'セミナー事業', 'パートナー連携', '業務効率化', '人材・組織体制'
]

TEMPLATE_4Q = {
    "axis": {"x": "実施コスト・難易度", "y": "期待インパクト"},
    "tl": {
        "lbl": "🔴 今すぐ着手",
        "items": [
            {"t": "タスク名", "s": "サブテキスト説明", "flow": True},
            {"t": "タスク名2", "s": "説明"}
        ]
    },
    "tr": {
        "lbl": "🔵 計画的推進",
        "items": [{"t": "タスク名", "s": "説明"}]
    },
    "bl": {
        "lbl": "🟢 余力でやる",
        "items": [{"t": "タスク名", "s": "説明"}]
    },
    "br": {
        "lbl": "⚪ 保留・見直し",
        "items": [{"t": "タスク名", "s": "説明"}]
    }
}


def _req(method: str, path: str, body=None):
    data = json.dumps(body, ensure_ascii=False).encode() if body else None
    headers = {'Content-Type': 'application/json'} if data else {}
    req = urllib.request.Request(f'{API}{path}', data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return json.loads(r.read())
    except urllib.error.URLError:
        print('❌ サーバーに接続できません。server.py を起動してください。')
        print(f'   python {os.path.join(os.path.dirname(__file__), "server.py")}')
        sys.exit(1)


def cmd_pending():
    state = _req('GET', '/state')
    q = state.get('queue', [])
    if not q:
        print('✅ pending requests はありません')
        return
    print(f'📋 Pending requests: {len(q)}件\n')
    for r in q:
        ti = r.get('theme_id')
        theme = THEMES[ti] if ti is not None and 0 <= ti < 8 else '?'
        print(f"  ID: {r['id']}  type: {r['type']}  theme: {ti}（{theme}）")
        print(f"  context: {r.get('context', '')}")
        print(f"  created: {r.get('created_at', '')[:19]}")
        print()
    print('Kaiが生成後に post-4q / post-flow / post-gantt コマンドで投稿してください。')


def cmd_status():
    state = _req('GET', '/state')
    gen = state.get('generated', {})
    print('📊 生成済みコンテンツ\n')
    for gtype in ('4q', 'flow', 'gantt'):
        keys = list(gen.get(gtype, {}).keys())
        if keys:
            items = ', '.join(f"{k}（{THEMES[int(k)] if k.isdigit() and int(k)<8 else k}）" for k in keys)
            print(f"  {gtype}: {items}")
        else:
            print(f"  {gtype}: なし")
    q = state.get('queue', [])
    print(f"\n⏳ Pending: {len(q)}件")


def cmd_post(gtype: str, ti_str: str, filepath: str, req_id: str = None):
    if not ti_str.isdigit() or not 0 <= int(ti_str) <= 7:
        print(f'❌ テーマID は 0〜7 の整数で指定してください (指定値: {ti_str})')
        sys.exit(1)
    ti = int(ti_str)

    if not os.path.exists(filepath):
        print(f'❌ ファイルが見つかりません: {filepath}')
        sys.exit(1)

    with open(filepath, encoding='utf-8') as f:
        raw = f.read()

    if gtype == '4q':
        try:
            content = json.loads(raw)
        except json.JSONDecodeError as e:
            print(f'❌ JSON パースエラー: {e}')
            sys.exit(1)
    else:
        content = raw.strip()

    # req_id: 対応する pending request の ID を自動検索
    if not req_id:
        state = _req('GET', '/state')
        matches = [q for q in state.get('queue', []) if q.get('type') == gtype and q.get('theme_id') == ti]
        if matches:
            req_id = matches[0]['id']

    result = _req('POST', '/generate', {'type': gtype, 'key': str(ti), 'content': content, 'request_id': req_id})
    theme = THEMES[ti]
    if result.get('ok'):
        print(f'✅ 投稿完了: {gtype} / テーマ{ti}（{theme}）')
        print('   ブラウザが自動更新されます。')
    else:
        print(f'❌ エラー: {result}')


def cmd_template(gtype: str):
    if gtype == '4q':
        print('=== 4Q マトリクス JSON フォーマット ===')
        print(json.dumps(TEMPLATE_4Q, ensure_ascii=False, indent=2))
        print('\n保存して: python kai-visualize-cli.py post-4q <ti> <file.json>')
    elif gtype in ('flow', 'gantt'):
        print(f'=== {gtype} フォーマット (Mermaid テキスト) ===')
        if gtype == 'flow':
            print('flowchart TD\n  A([開始]) --> B[STEP1: ...]\n  B --> C{分岐？}\n  ...')
        else:
            print('gantt\n  dateFormat  YYYY-MM-DD\n  title タイトル\n  excludes weekends\n  section フェーズ1\n    タスク :a1, 2026-06-01, 3d\n  ...')
        print(f'\n保存して: python kai-visualize-cli.py post-{gtype} <ti> <file.txt>')
    else:
        print(f'❌ 不明な type: {gtype}  (4q / flow / gantt)')


def cmd_open():
    webbrowser.open(f'http://localhost:{3458}')
    print(f'ブラウザで開きます: http://localhost:3458')


def cmd_reset():
    ans = input('⚠️  全生成データを削除します。よろしいですか？ (y/N): ').strip().lower()
    if ans == 'y':
        _req('POST', '/reset')
        print('✅ リセット完了')
    else:
        print('キャンセルしました')


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return

    cmd = args[0]
    if cmd == 'pending':
        cmd_pending()
    elif cmd == 'status':
        cmd_status()
    elif cmd == 'post-4q' and len(args) >= 3:
        cmd_post('4q', args[1], args[2], args[3] if len(args) > 3 else None)
    elif cmd == 'post-flow' and len(args) >= 3:
        cmd_post('flow', args[1], args[2], args[3] if len(args) > 3 else None)
    elif cmd == 'post-gantt' and len(args) >= 3:
        cmd_post('gantt', args[1], args[2], args[3] if len(args) > 3 else None)
    elif cmd == 'template' and len(args) >= 2:
        cmd_template(args[1])
    elif cmd == 'open':
        cmd_open()
    elif cmd == 'reset':
        cmd_reset()
    else:
        print(f'❌ 不明なコマンド: {cmd}')
        print(__doc__)


if __name__ == '__main__':
    main()
