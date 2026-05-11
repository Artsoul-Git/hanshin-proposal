#!/usr/bin/env python3
"""
new-seminar.py — スライドビルダー CLI

使い方:
  python new-seminar.py --slug my-seminar --title "マイセミナー"
  python new-seminar.py --slug my-seminar --title "マイセミナー" --template kawai-dark-v1
  python new-seminar.py --list-templates

生成先:
  08_アプリ開発事業部/slide-builder/projects/{slug}/
"""

import argparse
import shutil
import sys
from pathlib import Path

SCRIPT_DIR   = Path(__file__).parent
TEMPLATES_DIR = SCRIPT_DIR / "templates"
PROJECTS_DIR  = SCRIPT_DIR / "projects"

SLUG_RULE = "英数字とハイフンのみ（例: sales-ai-seminar）"


def list_templates():
    templates = [d.name for d in TEMPLATES_DIR.iterdir() if d.is_dir()]
    if not templates:
        print("テンプレートが見つかりません。")
    else:
        print("利用可能なテンプレート:")
        for t in sorted(templates):
            spec = TEMPLATES_DIR / t / "template-spec.md"
            version = "(仕様書なし)"
            if spec.exists():
                for line in spec.read_text(encoding="utf-8").splitlines():
                    if line.startswith("**バージョン:**"):
                        version = line.replace("**バージョン:**", "").strip()
                        break
            print(f"  {t}  {version}")


def validate_slug(slug: str) -> bool:
    import re
    return bool(re.match(r'^[a-z0-9][a-z0-9\-]*[a-z0-9]$', slug))


def create_seminar(slug: str, title: str, template: str):
    tpl_dir  = TEMPLATES_DIR / template
    out_dir  = PROJECTS_DIR / slug

    # Validation
    if not tpl_dir.exists():
        print(f"エラー: テンプレート '{template}' が見つかりません。")
        print(f"  候補: {[d.name for d in TEMPLATES_DIR.iterdir() if d.is_dir()]}")
        sys.exit(1)

    if not validate_slug(slug):
        print(f"エラー: スラッグの形式が正しくありません。{SLUG_RULE}")
        sys.exit(1)

    if out_dir.exists():
        print(f"エラー: '{out_dir}' はすでに存在します。別のスラッグを指定してください。")
        sys.exit(1)

    # Copy template
    shutil.copytree(tpl_dir, out_dir)

    # Remove template-spec.md and slides-template.js from output
    for remove in ["template-spec.md", "js/slides-template.js"]:
        target = out_dir / remove
        if target.exists():
            target.unlink()

    # Create empty slides.js
    slides_js = out_dir / "js" / "slides.js"
    slides_js.write_text(
        f"""(function () {{

  function H(title) {{
    return '<header class="slide-header"><h2 class="slide-h2">' + title + '</h2></header>';
  }}

  /* ===================== SLIDES ===================== */
  /* テンプレート: {template}                           */
  /* タイトル: {title}                                  */
  /* TODO: 以下にスライド関数を追加してください          */

  function slide01() {{
    return '<section class="slide slide-cover" data-section="cover" data-title="{title}" data-notes="">' +
      '<div class="slide-cover-bar">' +
        '<div class="slide-cover-tag">有限会社アートソウル AI導入支援事業</div>' +
        '<h1 class="slide-cover-title">{title}</h1>' +
      '</div>' +
      '<div class="slide-cover-body">' +
        '<p class="slide-cover-sub">サブタイトルをここに</p>' +
      '</div>' +
    '</section>';
  }}

  /* ===================== REGISTER ===================== */

  window.SLIDES = [slide01];

}})();
""",
        encoding="utf-8"
    )

    # Create manual.html (local only — matching the template's design)
    manual_src = SCRIPT_DIR.parent.parent / "06_セミナー事業部" / "outputs" / "契約書AIチェックセミナー" / "07_HTML版_v2" / "manual.html"
    manual_dst = out_dir / "manual.html"
    if manual_src.exists():
        content = manual_src.read_text(encoding="utf-8")
        content = content.replace("契約書AIチェックセミナー", title)
        manual_dst.write_text(content, encoding="utf-8")

    # Update HTML title tags
    for html_file in out_dir.glob("*.html"):
        if html_file.name == "manual.html":
            continue
        text = html_file.read_text(encoding="utf-8")
        text = text.replace("契約書AIチェックセミナー", title)
        html_file.write_text(text, encoding="utf-8")

    print(f"""
✅ プロジェクト作成完了
──────────────────────────────
スラッグ     : {slug}
タイトル     : {title}
テンプレート : {template}
出力先       : {out_dir}

次のステップ:
  1. {out_dir / "js" / "slides.js"} を Kai に生成させる
  2. GitHub にデプロイする:

     cd "{out_dir}"
     git init
     git config user.email "uemura@artsoul.jp"
     git config user.name "Kei Uemura"
     git add .
     git commit -m "初期公開: {title}"
     gh repo create Artsoul-Git/{slug} --public --description "{title}"
     git remote add origin https://github.com/Artsoul-Git/{slug}.git
     git push -u origin master
     git checkout -b gh-pages
     git push origin gh-pages
     git checkout master

  3. GitHub Pages が有効になったら（1〜2分後）:
     受講者URL: https://artsoul-git.github.io/{slug}/viewer.html
     管理画面 : https://artsoul-git.github.io/{slug}/admin.html
──────────────────────────────
""")


def main():
    parser = argparse.ArgumentParser(
        description="セミナースライドシステムの新規プロジェクトを生成します。"
    )
    parser.add_argument("--slug",     help=f"GitHubスラッグ（{SLUG_RULE}）")
    parser.add_argument("--title",    help="セミナータイトル")
    parser.add_argument("--template", default="kawai-dark-v1", help="テンプレート名（デフォルト: kawai-dark-v1）")
    parser.add_argument("--list-templates", action="store_true", help="利用可能なテンプレートを表示")

    args = parser.parse_args()

    if args.list_templates:
        list_templates()
        return

    if not args.slug or not args.title:
        parser.print_help()
        print("\nエラー: --slug と --title は必須です。")
        sys.exit(1)

    create_seminar(args.slug, args.title, args.template)


if __name__ == "__main__":
    main()
