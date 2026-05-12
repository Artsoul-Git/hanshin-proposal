@echo off
chcp 65001 > nul
echo タスク管理アプリを起動します...
echo ブラウザで http://localhost:3456 を開いてください
echo 停止するにはこのウィンドウを閉じてください
echo.
python "%~dp0server.py"
pause
