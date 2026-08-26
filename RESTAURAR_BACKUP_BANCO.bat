@echo off
chcp 65001 >nul
title RESTAURAÇÃO DE BACKUP - SCOOBY OS

echo ==============================================================================
echo        ⚠️ SCOOBY OS - RESTAURADOR DE BACKUP POSTGRESQL
echo ==============================================================================
echo  ATENÇÃO: Este procedimento irá substituir os dados atuais do banco
echo  pelo arquivo de backup selecionado!
echo ==============================================================================
echo.

if not exist "%~dp0backups" (
    echo [X] Pasta de backups não encontrada.
    pause
    exit /b
)

echo Backups disponíveis na pasta 'backups':
echo ------------------------------------------------------------------------------
dir /b /o-d "%~dp0backups\*.sql"
echo ------------------------------------------------------------------------------
echo.
set /p ARQUIVO="Digite o nome exato do arquivo .sql para restaurar: "

if not exist "%~dp0backups\%ARQUIVO%" (
    echo.
    echo [X] Arquivo não encontrado na pasta backups!
    pause
    exit /b
)

echo.
set /p CONFIRMA="Tem certeza absoluta que deseja restaurar '%ARQUIVO%'? (DIGITE 'SIM'): "
if /i not "%CONFIRMA%"=="SIM" (
    echo Operação cancelada pelo usuário.
    pause
    exit /b
)

echo.
echo [*] Restaurando banco de dados a partir do arquivo...
docker exec -i scooby_postgres psql -U postgres -d scoobydb < "%~dp0backups\%ARQUIVO%"

if %errorLevel% equ 0 (
    echo.
    echo [✓] BANCO DE DADOS RESTAURADO COM SUCESSO!
) else (
    echo.
    echo [X] Ocorreu um erro durante a restauração.
)

echo.
pause
