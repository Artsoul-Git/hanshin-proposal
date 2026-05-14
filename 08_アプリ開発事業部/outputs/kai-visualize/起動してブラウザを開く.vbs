Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' PowerShell でAPIキーを読み込んでサーバーを起動
' (キーをコマンド引数に渡さないため画面に表示されない)
strPS = "powershell -NoExit -Command """ & _
    "$host.UI.RawUI.WindowTitle = 'Kai Visualize Server'; " & _
    "$env:GROQ_API_KEY = [System.Environment]::GetEnvironmentVariable('GROQ_API_KEY','User'); " & _
    "if (-not $env:GROQ_API_KEY) { Write-Host 'エラー: GROQ_API_KEY が設定されていません。' -ForegroundColor Red; Read-Host '続行するにはEnterを押してください'; exit }; " & _
    "Set-Location '" & strDir & "'; " & _
    "py -3 server.py"""

objShell.Run strPS, 1, False

' 少し待ってブラウザを開く
WScript.Sleep 2500
objShell.Run "http://localhost:3458"
