@echo off
chcp 65001 > nul
title SCOOBY INFORMÁTICA & ASSISTÊNCIA TÉCNICA - SERVIDOR
color 0B

echo ================================================================
echo  🚀 SCOOBY INFORMÁTICA - INICIANDO SISTEMA & ACESSO À INTERNET
echo ================================================================
echo.

echo [1/2] Iniciando Servidor Central Scooby OS...
start "Scooby OS Server" /min cmd /c "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Conectando ao Cloudflare Tunnel para QR Codes na Internet...
start "Scooby Internet Tunnel" /min cmd /c "cd /d %~dp0 && cloudflared.exe tunnel --url http://localhost:3001"

echo.
echo ================================================================
echo  ✅ SISTEMA ATIVO E PRONTO PARA USO!
echo ================================================================
echo  💻 Acesso Local na Oficina: http://localhost:3001
echo  📱 O QR Code impresso no comprovante A4 funciona no 4G/Wi-Fi!
echo ================================================================
echo.
pause