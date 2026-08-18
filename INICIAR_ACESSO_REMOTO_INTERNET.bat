@echo off
setlocal
cd /d "%~dp0"
title SCOOBY INFORM?TICA - SERVIDOR & ACESSO REMOTO
color 0B

echo ===============================================================================
echo     ?? SCOOBY INFORM?TICA & ASSIST?NCIA T?CNICA - ACESSO REMOTO
echo ===============================================================================
echo.
echo  Iniciando Servidor e T?nel de Internet Remota...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process npm.cmd -ArgumentList 'run dev' -WorkingDirectory '%~dp0backend' -WindowStyle Hidden; Start-Sleep -Seconds 2; Start-Process '%~dp0cloudflared.exe' -ArgumentList 'tunnel --url http://localhost:3001' -WindowStyle Minimized; Write-Host 'Servidor e Tunel Iniciados com Sucesso!' -ForegroundColor Green"

echo.
echo ===============================================================================
echo  ? SISTEMA RODANDO E DISPON?VEL NA INTERNET!
echo ===============================================================================
echo.
echo  ?? Acesso Local:   http://localhost:3001
echo  ?? Acesso na Rede: http://192.168.100.8:3001
echo.
echo  ?? Mantenha o computador ligado para acessar do trabalho ou celular!
echo ===============================================================================
echo.
pause