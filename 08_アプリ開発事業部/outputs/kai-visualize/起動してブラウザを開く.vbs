Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strPy = strDir & "\server.py"

' サーバー起動（py ランチャー使用）
objShell.Run "py -3 """ & strPy & """", 0, False

' 少し待ってブラウザを開く
WScript.Sleep 2000
objShell.Run "http://localhost:3458"
