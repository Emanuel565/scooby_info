@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title PREPARAR PACOTE DE INSTALAÇÃO PARA PEN DRIVE

echo ==============================================================================
echo        📦 SCOOBY OS - PREPARADOR DE PACOTE PARA PEN DRIVE
echo ==============================================================================
echo  Este script irá gerar um backup atualizado do banco de dados e empacotar
echo  apenas os arquivos essenciais em uma pasta limpa pronta para o Pen Drive!
echo ==============================================================================
echo.

set DESTINO=%USERPROFILE%\Desktop\SCOOBY_PENDRIVE

if exist "%DESTINO%" (
    echo [*] Limpando pasta anterior em '%DESTINO%'...
    rd /s /q "%DESTINO%" >nul 2>&1
)

mkdir "%DESTINO%"
mkdir "%DESTINO%\backups"

echo [1/4] Gerando cópia de segurança atualizada do Banco de Dados...
call "%~dp0GERAR_BACKUP_BANCO.bat"

echo.
echo [2/4] Copiando o backup mais recente do banco para o pacote...
for /f "delims=" %%F in ('dir /b /o-d "%~dp0backups\*.sql"') do (
    set ULTIMO_BACKUP=%%F
    goto :copiar_bkp
)
:copiar_bkp
if defined ULTIMO_BACKUP (
    copy "%~dp0backups\%ULTIMO_BACKUP%" "%DESTINO%\backups\" >nul
    echo     [✓] Banco copiado: %ULTIMO_BACKUP%
) else (
    echo     [!] Nenhum backup .sql encontrado em backups/
)

echo.
echo [3/4] Copiando arquivos essenciais do sistema (sem node_modules pesados)...
xcopy "%~dp0backend" "%DESTINO%\backend\" /E /I /Q /EXCLUDE:%~dp0.exclude_node_modules >nul 2>&1
xcopy "%~dp0frontend" "%DESTINO%\frontend\" /E /I /Q /EXCLUDE:%~dp0.exclude_node_modules >nul 2>&1
if exist "%~dp0scripts" xcopy "%~dp0scripts" "%DESTINO%\scripts\" /E /I /Q >nul 2>&1

copy "%~dp0docker-compose.yml" "%DESTINO%\" >nul
copy "%~dp0package.json" "%DESTINO%\" >nul
copy "%~dp0package-lock.json" "%DESTINO%\" >nul
copy "%~dp0INSTALAR_WINDOWS_SERVER.bat" "%DESTINO%\" >nul
copy "%~dp0ATUALIZAR_SISTEMA_SEM_PERDER_DADOS.bat" "%DESTINO%\" >nul
copy "%~dp0GERAR_BACKUP_BANCO.bat" "%DESTINO%\" >nul
copy "%~dp0RESTAURAR_BACKUP_BANCO.bat" "%DESTINO%\" >nul
copy "%~dp0GUIA_DEPLOY_WINDOWS_SERVER.md" "%DESTINO%\" >nul
copy "%~dp0MANUAL_DO_USUARIO_POR_CARGO.pdf" "%DESTINO%\" >nul
copy "%~dp0MANUAL_DO_USUARIO_POR_CARGO.html" "%DESTINO%\" >nul

echo.
echo [4/4] Finalizando e organizando...
if exist "%~dp0.exclude_node_modules" del "%~dp0.exclude_node_modules"

echo.
echo ==============================================================================
echo   🎉 PACOTE DO PEN DRIVE CRIADO COM SUCESSO NA SUA ÁREA DE TRABALHO!
echo ==============================================================================
echo.
echo  📁 Local do pacote: %DESTINO%
echo.
echo  👉 O QUE FAZER AGORA:
echo     1. Conecte o Pen Drive no seu computador.
echo     2. Copie a pasta "SCOOBY_PENDRIVE" da sua Área de Trabalho para o Pen Drive.
echo     3. No Windows Server, copie a pasta para C:\Scooby e dê 2 cliques em:
echo        "INSTALAR_WINDOWS_SERVER.bat"
echo.
echo     4. Em seguida, dê 2 cliques em "RESTAURAR_BACKUP_BANCO.bat" para carregar
echo        todos os seus clientes, OSs e produtos do arquivo .sql!
echo ==============================================================================
echo.
pause
