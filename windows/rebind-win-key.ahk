#Persistent
#SingleInstance Force

if not A_IsAdmin
    Run *RunAs "%A_ScriptFullPath%"

; List of PowerToys shortcuts to ignore
PowerToysHotkeys := ["#1", "#2", "#3", "#4", "#5"] ; This is the Win+Enter hotkey

; Use PowerToysRun as replacement for Start Menu
LWin Up::
{
    ; Check if a PowerToys shortcut is pressed
    If (HotkeyTriggered())
        Return ; Ignore this hotkey and do nothing if PowerToys shortcut was triggered
    
    Process, Exist, Flow.Launcher.exe
    if (ErrorLevel == 0) ; PTRun not running
        send {LWin}
    else ; PTRun is running
        if (A_PriorKey = "LWin") ; A_PriorKey is the key that was last pressed
            send {LAlt Down}{Space Down}{LAlt Up}{Space Up}
}
return

; Important: Allows Win Key Hotkeys to work
LWin & J::
return

; New hotkey to open Windows Terminal with Win + Enter
#Enter::
    Run, "C:\Program Files\WindowsApps\Microsoft.WindowsTerminal_1.20.11781.0_x64__8wekyb3d8bbwe\wt.exe"
return

; Remap Win + W to Alt + F4
#W::
    Send, !{F4}
return

; Function to detect if PowerToys hotkeys are triggered
HotkeyTriggered()
{
    global PowerToysHotkeys
    for each, hotkey in PowerToysHotkeys
    {
        If (GetKeyState(StrReplace(hotkey, "#", "LWin"), "P"))
            return true
    }
    return false
}
