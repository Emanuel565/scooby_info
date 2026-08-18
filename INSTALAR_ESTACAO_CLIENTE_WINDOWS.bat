@echo off
title Instalador Scooby OS - Estacao Cliente
color 0B

echo =======================================================================
echo          SCOOBY OS - INSTALADOR DA ESTACAO CLIENTE (WINDOWS)
echo =======================================================================
echo.

set DEFAULT_IP=192.168.100.8
set /p SERVER_IP="Digite o IP do Computador Servidor [Pressione ENTER para usar %DEFAULT_IP%]: "

if "%SERVER_IP%"=="" set SERVER_IP=%DEFAULT_IP%

set APP_URL=http://%SERVER_IP%:3001

echo.
echo [INFO] Configurando atalho para conectar em: %APP_URL%...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$desktop\Scooby OS - Oficina.lnk\"); $edgePath = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe' -ErrorAction SilentlyContinue).'(default)'; if (-not $edgePath) { $edgePath = 'msedge.exe' }; $s.TargetPath = $edgePath; $s.Arguments = \"--app=%APP_URL%\"; $s.Description = 'Scooby OS - Gestao de Assistencia Tecnica'; $s.Save();"

echo.
echo =======================================================================
echo [SUCESSO] Atalho 'Scooby OS - Oficina' criado na sua Area de Trabalho!
echo =======================================================================
echo.
pause