@echo off
chcp 65001 >nul
title BACKUP AUTOMÁTICO DO BANCO - SCOOBY OS

echo ==============================================================================
echo        💾 SCOOBY OS - GERADOR DE BACKUP DO BANCO POSTGRESQL
echo ==============================================================================

if not exist "%~dp0backups" mkdir "%~dp0backups"

:: Gerar timestamp no formato AAAA-MM-DD_HH-MM
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%

set BACKUP_FILE=%~dp0backups\backup_scoobydb_%TIMESTAMP%.sql

echo [*] Extraindo cópia de segurança completa do PostgreSQL...
docker exec -t scooby_postgres pg_dump -U postgres -d scoobydb > "%BACKUP_FILE%"

if %errorLevel% equ 0 (
    echo.
    echo [✓] BACKUP GERADO COM SUCESSO!
    echo     Arquivo: %BACKUP_FILE%
    echo.
    echo [*] Mantendo apenas os últimos 30 backups para economizar espaço em disco...
    powershell -Command "Get-ChildItem '%~dp0backups\backup_scoobydb_*.sql' | Sort-Object CreationTime -Descending | Select-Object -Skip 30 | Remove-Item -Force"
) else (
    echo.
    echo [X] ERRO ao gerar backup. Verifique se o Docker e o contêiner 'scooby_postgres' estão rodando.
)

echo.
timeout /t 5
