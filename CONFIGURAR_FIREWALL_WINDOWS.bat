@echo off
title Liberar Porta 3001 no Firewall
color 0E

echo =======================================================================
echo     LIBERAR COMUNICACAO DO SCOOBY OS NO FIREWALL DO WINDOWS
echo =======================================================================
echo.

netsh advfirewall firewall add rule name="Scooby OS Servidor (Porta 3001)" dir=in action=allow protocol=TCP localport=3001 >nul 2>nul

if %errorlevel% equ 0 (
    color 0A
    echo [SUCESSO] Porta 3001 liberada com sucesso no Firewall do Windows!
) else (
    color 0C
    echo [AVISO] Execute este arquivo como Administrador (clique direito -> Executar como Administrador).
)

echo.
pause