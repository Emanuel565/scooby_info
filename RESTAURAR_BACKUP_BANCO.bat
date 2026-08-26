@echo off
setlocal
cd /d "%~dp0"
title RESTAURADOR DE BACKUP - SCOOBY OS

echo ==============================================================================
echo        SCOOBY OS - RESTAURADOR DE BACKUP POSTGRESQL
echo ==============================================================================
echo  ATENCAO: Este procedimento ira substituir os dados atuais do banco
echo  pelo arquivo de backup selecionado!
echo ==============================================================================
echo.

if not exist "%~dp0backups" (
    echo [ERRO] Pasta de backups nao encontrada.
    pause
    exit /b
)

powershell -NoProfile -Command ^
  "$backups = Get-ChildItem '%~dp0backups\*.sql' | Sort-Object CreationTime -Descending;" ^
  "if ($backups.Count -eq 0) { Write-Host '[AVISO] Nenhum arquivo .sql encontrado em backups/' -ForegroundColor Yellow; exit };" ^
  "Write-Host 'Backups disponiveis na pasta backups/:' -ForegroundColor Cyan;" ^
  "for ($i = 0; $i -lt $backups.Count; $i++) { Write-Host ('  [' + ($i + 1) + '] ' + $backups[$i].Name + ' (' + [Math]::Round($backups[$i].Length / 1KB, 1) + ' KB)') };" ^
  "$choice = Read-Host 'Digite o numero do backup que deseja restaurar (ou ENTER para cancelar)';" ^
  "if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $backups.Count) {" ^
  "    $selected = $backups[[int]$choice - 1].FullName;" ^
  "    $confirma = Read-Host ('Digite SIM para confirmar a restauracao de ' + $backups[[int]$choice - 1].Name);" ^
  "    if ($confirma.ToUpper() -eq 'SIM') {" ^
  "        Write-Host '[*] Restaurando banco de dados no PostgreSQL...' -ForegroundColor Cyan;" ^
  "        Get-Content $selected -Raw | docker exec -i scooby_postgres psql -U postgres -d scoobydb;" ^
  "        Write-Host '[OK] BANCO DE DADOS RESTAURADO COM SUCESSO!' -ForegroundColor Green;" ^
  "    } else { Write-Host 'Operacao cancelada pelo usuario.' -ForegroundColor Yellow; }" ^
  "} else { Write-Host 'Operacao cancelada.' -ForegroundColor Yellow; }"

echo.
pause
