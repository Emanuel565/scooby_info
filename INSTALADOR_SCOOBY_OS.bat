@echo off
setlocal EnableDelayedExpansion
title Scooby OS - Instalador Windows
color 0B

:MENU
cls
echo =======================================================================
echo          SCOOBY OS - ASSISTENTE DE INSTALACAO PARA WINDOWS
echo =======================================================================
echo.
echo  Selecione como deseja configurar este computador:
echo.
echo  [1] INSTALAR COMO SERVIDOR PRINCIPAL (Computador Central da Loja)
echo      * Contem o banco de dados central e distribui o sistema na rede.
echo.
echo  [2] INSTALAR COMO ESTACAO CLIENTE (Balcao, Bancadas de Reparo)
echo      * Conecta no servidor central via rede local em modo app nativo.
echo.
echo  [3] LIBERAR FIREWALL DO WINDOWS (Necessario no Servidor)
echo.
echo  [4] CRIAR / ATUALIZAR ATALHOS NA AREA DE TRABALHO
echo.
echo  [5] SAIR
echo.
echo =======================================================================
set /p OPCAO="Escolha uma opcao (1 a 5): "

if "%OPCAO%"=="1" goto INSTALAR_SERVIDOR
if "%OPCAO%"=="2" goto INSTALAR_CLIENTE
if "%OPCAO%"=="3" goto FIREWALL
if "%OPCAO%"=="4" goto ATALHOS
if "%OPCAO%"=="5" exit /b 0

echo Opcao invalida! Pressione qualquer tecla para voltar...
pause > nul
goto MENU

:INSTALAR_SERVIDOR
cls
echo =======================================================================
echo             CONFIGURANDO SERVIDOR PRINCIPAL (CENTRAL)
echo =======================================================================
echo.
echo [1/4] Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Node.js nao foi detectado neste computador!
    echo Baixe e instale o Node.js em: https://nodejs.org
    echo Depois execute este instalador novamente.
    pause
    color 0B
    goto MENU
)
echo [OK] Node.js detectado com sucesso!

echo.
echo [2/4] Liberando porta 3001 no Firewall do Windows...
netsh advfirewall firewall add rule name="Scooby OS Servidor (Porta 3001)" dir=in action=allow protocol=TCP localport=3001 >nul 2>nul
echo [OK] Firewall configurado!

echo.
echo [3/4] Preparando banco de dados e arquivos compilados...
cd /d "%~dp0backend"
call npx.cmd prisma db push >nul 2>nul
cd /d "%~dp0frontend"
call npm.cmd run build >nul 2>nul
cd /d "%~dp0"
echo [OK] Sistema compilado e banco inicializado!

echo.
echo [4/4] Criando atalho na Area de Trabalho e Menu Iniciar...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$desktop\Scooby OS - Servidor Central.lnk\"); $s.TargetPath = '%~dp0INICIAR_SCOOBY_OS.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Iniciar Servidor Central Scooby OS'; $s.Save();"
echo [OK] Atalho criado na Area de Trabalho!

echo.
echo =======================================================================
color 0A
echo        INSTALACAO DO SERVIDOR CONCLUIDA COM SUCESSO!
echo =======================================================================
echo.
echo Para iniciar o sistema agora:
echo Basta dar 2 cliques no atalho "Scooby OS - Servidor Central" na Area de Trabalho.
echo.
pause
color 0B
goto MENU

:INSTALAR_CLIENTE
cls
echo =======================================================================
echo          CONFIGURANDO ESTACAO CLIENTE (BALCAO / BANCADAS)
echo =======================================================================
echo.
set DEFAULT_IP=192.168.100.8
set /p SERVER_IP="Digite o endereco IP do Computador Servidor [Padrao: %DEFAULT_IP%]: "
if "%SERVER_IP%"=="" set SERVER_IP=%DEFAULT_IP%

set APP_URL=http://%SERVER_IP%:3001

echo.
echo Criando atalho de aplicativo nativo para: %APP_URL%...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$desktop\Scooby OS - Oficina.lnk\"); $edgePath = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe' -ErrorAction SilentlyContinue).'(default)'; if (-not $edgePath) { $edgePath = 'msedge.exe' }; $s.TargetPath = $edgePath; $s.Arguments = \"--app=%APP_URL%\"; $s.Description = 'Scooby OS - Gestao de Assistencia Tecnica'; $s.Save();"

echo.
echo =======================================================================
color 0A
echo        ESTACAO CLIENTE CONFIGURADA COM SUCESSO!
echo =======================================================================
echo.
echo O atalho "Scooby OS - Oficina" foi criado na Area de Trabalho.
echo Ao clicar nele, o sistema abrira em janela propria como um app nativo!
echo.
pause
color 0B
goto MENU

:FIREWALL
cls
echo =======================================================================
echo               LIBERANDO PORTA 3001 NO FIREWALL
echo =======================================================================
echo.
netsh advfirewall firewall add rule name="Scooby OS Servidor (Porta 3001)" dir=in action=allow protocol=TCP localport=3001
echo.
echo Concluido. Pressione qualquer tecla para voltar ao menu...
pause > nul
goto MENU

:ATALHOS
cls
echo Criando atalhos...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$desktop\Scooby OS.lnk\"); $s.TargetPath = '%~dp0INICIAR_SCOOBY_OS.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Scooby OS'; $s.Save();"
echo [OK] Atalho criado na Area de Trabalho!
pause
goto MENU