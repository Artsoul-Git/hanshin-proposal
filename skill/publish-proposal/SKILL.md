---
name: publish-proposal
description: HTMLファイルをパスワード保護付きでGitHub Pagesに公開し、クライアントに送れる共有URLを発行する。新規デプロイ・既存ページの更新どちらにも対応。Triggers：「GitHub Pagesに公開して」「URLを発行して」「パスワードかけて公開して」「GitHub Pagesを更新して」「提案書をクライアントに送れる形にして」
---

# HTML公開スキル（パスワード保護 + GitHub Pages）

## 目的

提案書HTMLに自動でパスワードゲートを付加し、GitHub Pagesで公開する。  
クライアントへのURL送付が即日完結する。

---

## 入力情報の確認（起動時に確認する）

| 項目 | 取得方法 | 例 |
|------|---------|---|
| HTMLファイルパス | ユーザーから受け取る or 直前の作業から推定 | `D:\...\AI導入支援_v8_as.html` |
| パスワード | ユーザーが指定 | `as09052026` |
| リポジトリ名 | ユーザーが指定 or `{クライアント名}-proposal-{年}` を提案 | `maru-proposal-2026` |

---

## 実行手順（新規デプロイ）

### Step 1: パスワードゲート付き HTML を生成（PowerShell）

```powershell
$srcPath  = "{HTMLファイルパス}"
$password = "{パスワード}"
$repoName = "{リポジトリ名}"
$deployDir = "C:\Users\kei\AppData\Local\Temp\$repoName-deploy"

# 読み込み（UTF-8 BOM対応）
$content = [System.IO.File]::ReadAllText($srcPath, [System.Text.Encoding]::UTF8)

# パスワードゲート（fixed overlay — 本文を書き換えずに画面全体を覆う）
$gate = @"
<div id="_pg" style="position:fixed;inset:0;background:#112A46;display:flex;align-items:center;justify-content:center;z-index:99999;font-family:'Noto Sans JP',sans-serif">
  <div style="background:#fff;padding:48px 40px;border-radius:16px;text-align:center;width:360px;box-shadow:0 20px 60px rgba(0,0,0,.4)">
    <div style="font-size:12px;color:#00A8B5;font-weight:700;letter-spacing:3px;margin-bottom:12px">CONFIDENTIAL</div>
    <h2 style="color:#112A46;font-size:22px;margin-bottom:8px">提案書</h2>
    <p style="color:#718096;font-size:13px;margin-bottom:28px">閲覧にはパスワードが必要です</p>
    <input type="password" id="_pi" placeholder="パスワード" style="width:100%;padding:14px;border:2px solid #E2E8F0;border-radius:8px;font-size:16px;box-sizing:border-box;margin-bottom:14px" onkeydown="if(event.key==='Enter')_cpw()">
    <button onclick="_cpw()" style="width:100%;padding:14px;background:#112A46;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer">確認</button>
    <p id="_pe" style="color:#E53E3E;font-size:13px;margin-top:14px;display:none">パスワードが違います</p>
  </div>
</div>
<script>
function _cpw(){
  if(document.getElementById('_pi').value==='$password'){
    document.getElementById('_pg').remove();
    sessionStorage.setItem('_a','1');
  } else {
    document.getElementById('_pe').style.display='block';
    document.getElementById('_pi').value='';
  }
}
if(sessionStorage.getItem('_a')==='1') document.getElementById('_pg').remove();
</script>
"@

# <body> 直後にゲートを挿入（元の本文は一切変えない）
$modified = $content -replace '(<body[^>]*>)', "`$1`n$gate"

# デプロイフォルダへ保存
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
[System.IO.File]::WriteAllText("$deployDir\index.html", $modified, [System.Text.Encoding]::UTF8)

$size = [Math]::Round((Get-Item "$deployDir\index.html").Length / 1KB, 1)
Write-Host "作成完了: $deployDir\index.html ($size KB)"
```

> **ポイント：** `$password` は PowerShell 変数として定義しているため、ここに埋め込まれた JavaScript 内の `$password` も自動で実際のパスワード文字列に置換される。

---

### Step 2: Git 初期化 → GitHub 公開リポジトリ作成 → プッシュ（Bash）

```bash
cd "C:\Users\kei\AppData\Local\Temp\{repoName}-deploy" \
&& git init \
&& git config user.email "uemura@artsoul.jp" \
&& git config user.name "Kei Uemura" \
&& git add index.html \
&& git commit -m "feat: 提案書公開（パスワード保護付き）" \
&& gh repo create {repoName} --public --source=. --remote=origin --push
```

> **リポジトリ名が既存の場合：** `GraphQL: Name already exists` エラーが出たら、末尾に `-2`・`-2026` 等のサフィックスを付けて再試行する。

---

### Step 3: GitHub Pages 有効化（Bash）

```bash
gh api repos/Artsoul-Git/{repoName}/pages \
  --method POST \
  --field "source[branch]=master" \
  --field "source[path]=/"
```

---

### Step 4: ビルド完了まで待機（Bash）

```bash
until [ "$(gh api repos/Artsoul-Git/{repoName}/pages --jq '.status')" = "built" ]; do
  sleep 5
done && echo "ビルド完了"
```

---

### Step 5: URL を返す

```
https://artsoul-git.github.io/{repoName}/
```

ユーザーへ以下の形式で報告する：

```
✅ 公開完了

URL：https://artsoul-git.github.io/{repoName}/
パスワード：{password}

このURLとパスワードをクライアントへ送付してください。
（パスワードはURL本文とは別経路で伝えることを推奨）
```

---

## 実行手順（既存ページの更新）

提案書が新バージョンに更新されたとき。**URLは変わらない。**

### Step 1: 新しいパスワードゲート付き HTML を生成（Step 1 と同じ）

同じ `$deployDir` に上書きする。

### Step 2: 既存リポジトリへプッシュ（Bash）

```bash
cd "C:\Users\kei\AppData\Local\Temp\{repoName}-deploy" \
&& git add index.html \
&& git commit -m "update: 提案書 v{n} に更新" \
&& git push origin master
```

GitHub Pages は Push 後 1〜2 分で自動反映。`gh api ... --jq '.status'` でビルド確認可能。

---

## 注意事項

- パスワードはクライアントサイド JS での照合のため、JS を読める技術者には突破可能。完全な機密保護ではない。
- 公開リポジトリのため、GitHub.com でソースコードは閲覧可能。提案書の内容は把握されうる。
- クライアントへのURL送付時は、パスワードを URL と同じメール本文に書かない（できれば別便・電話で伝える）。
- `sessionStorage` を使用しているためブラウザを閉じると再認証が必要。

---

## 現在の公開済みリポジトリ

| クライアント | リポジトリ | URL |
|------------|----------|-----|
| 合同会社まる | `maru-proposal-2026` | https://artsoul-git.github.io/maru-proposal-2026/ |
