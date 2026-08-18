@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Scooby OS - Assistencia Tecnica.lnk'); $Shortcut.TargetPath = '%~dp0INICIAR_SCOOBY_OS.bat'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = 'Sistema de Gestao Scooby Informatica'; $Shortcut.Save(); Write-Host 'ATALHO CRIADO NA AREA DE TRABALHO COM SUCESSO!' -ForegroundColor Green"
pause