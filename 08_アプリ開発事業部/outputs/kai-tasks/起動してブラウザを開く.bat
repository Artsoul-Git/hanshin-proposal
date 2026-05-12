@echo off
chcp 65001 > nul
echo タスク管理アプリを起動します...
start "" python "%~dp0server.py"
timeout /t 2 /nobreak > nul
start "" "http://localhost:3456"
echo サーバー起動中... ブラウザが開きます
echo このウィンドウは閉じてください（サーバーは別プロセスで動き続けます）
timeout /t 3
