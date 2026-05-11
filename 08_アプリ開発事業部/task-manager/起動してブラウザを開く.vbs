Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "python """ & scriptDir & "\server.py""", 0, False
WScript.Sleep 2000
WshShell.Run "http://localhost:3456"
