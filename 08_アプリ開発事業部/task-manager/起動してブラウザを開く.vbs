Set WshShell = CreateObject("WScript.Shell")

' サーバーをバックグラウンドで起動（ウィンドウなし）
serverPath = "D:\Google Antigravity\AS_AI導入支援事業_cc\08_アプリ開発事業部\task-manager\server.py"
WshShell.Run "python """ & serverPath & """", 0, False

' 2秒待ってブラウザを開く
WScript.Sleep 2000
WshShell.Run "http://localhost:3456"