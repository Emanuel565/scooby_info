@echo off
setlocal
cd /d "%~dp0"
title SCOOBY OS - SERVIDOR E ACESSO REMOTO
color 0B

echo ===============================================================================
echo     SCOOBY OS - SERVIDOR E TUNEL DE ACESSO REMOTO PELA INTERNET
echo ===============================================================================
echo.
echo  Iniciando Servidor e Tunel de Internet Remota (Cloudflare)...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process npm.cmd -ArgumentList 'run dev' -WorkingDirectory '%~dp0backend' -WindowStyle Hidden;" ^
  "Start-Sleep -Seconds 2;" ^
  "if (Test-Path '%~dp0cloudflared.exe') {" ^
  "    Start-Process '%~dp0cloudflared.exe' -ArgumentList 'tunnel --url http://localhost:3001' -WindowStyle Normal;" ^
  "    Write-Host '[OK] Servidor e Tunel Cloudflare iniciados com sucesso!' -ForegroundColor Green;" ^
  "} else {" ^
  "    Write-Host '[AVISO] cloudflared.exe nao encontrado. Servidor rodando apenas localmente.' -ForegroundColor Yellow;" ^
  "}"

echo.
echo ===============================================================================
echo  SISTEMA RODANDO E DISPONIVEL!
echo ===============================================================================
echo.
echo  Acesso Local: http://localhost:3001
echo.
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254*' } | ForEach-Object { Write-Host ('  Acesso Rede Local: http://' + $_.IPAddress + ':3001') -ForegroundColor Cyan }"
echo.
echo  Mantenha esta janela aberta para manter o servidor e o tunel ativos.
echo ===============================================================================
echo.
pause