Option Explicit

Dim oShell, oFSO, sDir, sCmd, oHTTP, bRunning

Set oShell = CreateObject("WScript.Shell")
Set oFSO   = CreateObject("Scripting.FileSystemObject")

sDir = oFSO.GetParentFolderName(WScript.ScriptFullName)

' サーバーがすでに起動しているか確認
bRunning = False
Set oHTTP = CreateObject("MSXML2.XMLHTTP")
On Error Resume Next
oHTTP.Open "GET", "http://localhost:3457/api/files", False
oHTTP.Send
If Err.Number = 0 Then
    If oHTTP.Status = 200 Then bRunning = True
End If
On Error GoTo 0
Set oHTTP = Nothing

If bRunning Then
    ' 既に起動中 → ブラウザだけ開く
    oShell.Run "cmd /c start http://localhost:3457", 0, False
Else
    ' サーバーを起動してブラウザを開く
    sCmd = "cmd /c cd /d """ & sDir & """ && py server.py"
    oShell.Run sCmd, 0, False
    ' 起動待ち（1.5秒）はserver.py内のTimerが処理
End If

Set oShell = Nothing
Set oFSO   = Nothing
