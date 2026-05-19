Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

WshShell.Run "py """ & scriptDir & "\slide-server.py""", 1, False
WScript.Sleep 1500
WshShell.Run "http://localhost:8765"
