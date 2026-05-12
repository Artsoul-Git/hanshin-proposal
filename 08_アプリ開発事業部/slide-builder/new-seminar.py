#!/usr/bin/env python3
"""
new-seminar.py — スライドビルダー CLI

使い方:
  python new-seminar.py --slug my-seminar --title "マイセミナー"
  python new-seminar.py --slug my-seminar --title "マイセミナー" --template kawai-dark-v1
  python new-seminar.py --slug my-slides --title "プレゼン" --images "C:\\path\\to\\images"
  python new-seminar.py --list-templates

生成先:
  08_アプリ開発事業部/slide-builder/projects/{slug}/
"""

import argparse
import re
import shutil
import sys
from pathlib import Path

SCRIPT_DIR   = Path(__file__).parent
TEMPLATES_DIR = SCRIPT_DIR / "templates"
PROJECTS_DIR  = SCRIPT_DIR / "projects"

SLUG_RULE = "英数字とハイフンのみ（例: sales-ai-seminar）"
IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'}


def natural_key(path: Path):
    return [int(c) if c.isdigit() else c.lower() for c in re.split(r'(\d+)', path.name)]


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


def generate_image_slides_js(title: str, image_names: list) -> str:
    lines = ["(function () {\n"]
    funcs = []
    for i, name in enumerate(image_names, 1):
        fn = f"slide{i:02d}"
        funcs.append(fn)
        lines.append(f"  function {fn}() {{")
        lines.append(f"    return '<section class=\"slide\" data-section=\"slides\" data-title=\"スライド{i}\" data-notes=\"\">' +")
        lines.append(f"      '<div style=\"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000;\">' +")
        lines.append(f"        '<img src=\"img/{name}\" style=\"max-width:100%;max-height:100%;object-fit:contain;\" alt=\"スライド{i}\">' +")
        lines.append(f"      '</div>' +")
        lines.append(f"    '</section>';")
        lines.append(f"  }}\n")

    lines.append(f"  window.SLIDES = [{', '.join(funcs)}];\n")
    lines.append("})();\n")
    return "\n".join(lines)


def copy_assets(assets_dir: str, img_out: Path) -> int:
    asset_path = Path(assets_dir)
    if not asset_path.exists() or not asset_path.is_dir():
        print(f"[WARN] 挿絵フォルダが見つかりません: {assets_dir}")
        return 0
    files = [f for f in asset_path.iterdir() if f.suffix.lower() in IMAGE_EXTS]
    count = 0
    for f in sorted(files, key=natural_key):
        dst = img_out / f.name
        if dst.exists():
            print(f"[SKIP] 同名ファイルが既に存在: {f.name}")
        else:
            shutil.copy2(f, dst)
            count += 1
    if count:
        print(f"[ASSET] {count} 枚の挿絵を img/ にコピーしました。")
    return count


def create_seminar(slug: str, title: str, template: str, images_dir: str = None, assets_dir: str = None):
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

    # Validate images dir if specified
    img_files = []
    if images_dir:
        img_path = Path(images_dir)
        if not img_path.exists() or not img_path.is_dir():
            print(f"エラー: 画像フォルダが見つかりません: {images_dir}")
            sys.exit(1)
        img_files = sorted(
            [f for f in img_path.iterdir() if f.suffix.lower() in IMAGE_EXTS],
            key=natural_key
        )
        if not img_files:
            print(f"エラー: 対応画像ファイル（{', '.join(IMAGE_EXTS)}）が見つかりません: {images_dir}")
            sys.exit(1)
        print(f"[OK] 画像ファイル {len(img_files)} 枚を検出しました。")

    # Copy template
    shutil.copytree(tpl_dir, out_dir)

    # Remove template-spec.md and slides-template.js from output
    for remove in ["template-spec.md", "js/slides-template.js"]:
        target = out_dir / remove
        if target.exists():
            target.unlink()

    # Handle image mode
    slides_js = out_dir / "js" / "slides.js"
    img_out = out_dir / "img"
    if img_files:
        img_out.mkdir()
        for f in img_files:
            shutil.copy2(f, img_out / f.name)
        slides_js.write_text(
            generate_image_slides_js(title, [f.name for f in img_files]),
            encoding="utf-8"
        )
        print(f"[IMG] {len(img_files)} 枚の画像を img/ にコピーし、slides.js を生成しました。")
    else:
        # Create empty slides.js
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

    # Copy assets (illustration files)
    if assets_dir:
        img_out.mkdir(exist_ok=True)
        copy_assets(assets_dir, img_out)

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
[DONE] プロジェクト作成完了
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
    parser.add_argument("--images",   help="画像フォルダのパス（連番画像からスライドを自動生成）")
    parser.add_argument("--assets",   help="挿絵フォルダのパス（img/ にコピーのみ。slides.js は変更しない）")
    parser.add_argument("--list-templates", action="store_true", help="利用可能なテンプレートを表示")

    args = parser.parse_args()

    if args.list_templates:
        list_templates()
        return

    if not args.slug or not args.title:
        parser.print_help()
        print("\nエラー: --slug と --title は必須です。")
        sys.exit(1)

    create_seminar(args.slug, args.title, args.template, args.images, args.assets)


if __name__ == "__main__":
    main()
