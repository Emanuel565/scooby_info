@echo off
setlocal
cd /d "%~dp0"
title BACKUP AUTOMATICO DO BANCO - SCOOBY OS

echo ==============================================================================
echo        SCOOBY OS - GERADOR DE BACKUP DO BANCO POSTGRESQL
echo ==============================================================================

if not exist "%~dp0backups" mkdir "%~dp0backups"

powershell -NoProfile -Command ^
  "$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm';" ^
  "$backupFile = Join-Path '%~dp0backups' ('backup_scoobydb_' + $timestamp + '.sql');" ^
  "Write-Host '[*] Extraindo copia de seguranca completa do PostgreSQL...' -ForegroundColor Cyan;" ^
  "docker exec -t scooby_postgres pg_dump -U postgres -d scoobydb | Out-File -FilePath $backupFile -Encoding utf8;" ^
  "if (Test-Path $backupFile) {" ^
  "    Write-Host ('[OK] BACKUP GERADO COM SUCESSO: ' + $backupFile) -ForegroundColor Green;" ^
  "    Get-ChildItem '%~dp0backups\backup_scoobydb_*.sql' | Sort-Object CreationTime -Descending | Select-Object -Skip 30 | Remove-Item -Force;" ^
  "} else {" ^
  "    Write-Host '[ERRO] Falha ao gerar backup. Verifique se o Docker e o conteiner scooby_postgres estao ativos.' -ForegroundColor Red;" ^
  "}"

echo.
ping 127.0.0.1 -n 3 >nul
