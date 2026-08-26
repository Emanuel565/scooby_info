@echo off
title PREPARAR PACOTE PARA PEN DRIVE - SCOOBY OS
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$dest = Join-Path $env:USERPROFILE 'Desktop\SCOOBY_PENDRIVE';" ^
  "if (Test-Path $dest) { Remove-Item -Recurse -Force $dest };" ^
  "New-Item -ItemType Directory -Path (Join-Path $dest 'backups') -Force | Out-Null;" ^
  "Write-Host '============================================================' -ForegroundColor Cyan;" ^
  "Write-Host '   SCOOBY OS - GERADOR DE PACOTE LIMPO PARA PEN DRIVE' -ForegroundColor Yellow;" ^
  "Write-Host '============================================================' -ForegroundColor Cyan;" ^
  "Write-Host '1/3 Gerando backup atualizado do PostgreSQL...' -ForegroundColor Green;" ^
  "$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm';" ^
  "$backupFile = \"backup_scoobydb_$timestamp.sql\";" ^
  "$backupPath = Join-Path (Get-Location) \"backups\$backupFile\";" ^
  "if (-not (Test-Path 'backups')) { New-Item -ItemType Directory -Path 'backups' -Force | Out-Null };" ^
  "docker exec -t scooby_postgres pg_dump -U postgres -d scoobydb | Out-File -FilePath $backupPath -Encoding utf8;" ^
  "Copy-Item $backupPath (Join-Path $dest \"backups\$backupFile\") -Force;" ^
  "Write-Host '2/3 Copiando arquivos essenciais do sistema...' -ForegroundColor Green;" ^
  "robocopy 'backend' (Join-Path $dest 'backend') /E /XD node_modules dist .vscode /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null;" ^
  "robocopy 'frontend' (Join-Path $dest 'frontend') /E /XD node_modules dist .vscode /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null;" ^
  "if (Test-Path 'scripts') { robocopy 'scripts' (Join-Path $dest 'scripts') /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null };" ^
  "$rootFiles = @('docker-compose.yml', 'package.json', 'package-lock.json', 'INSTALAR_WINDOWS_SERVER.bat', 'ATUALIZAR_SISTEMA_SEM_PERDER_DADOS.bat', 'GERAR_BACKUP_BANCO.bat', 'RESTAURAR_BACKUP_BANCO.bat', 'GUIA_DEPLOY_WINDOWS_SERVER.md', 'MANUAL_DO_USUARIO_POR_CARGO.pdf', 'MANUAL_DO_USUARIO_POR_CARGO.html');" ^
  "foreach ($f in $rootFiles) { if (Test-Path $f) { Copy-Item $f $dest -Force } };" ^
  "$size = (Get-ChildItem $dest -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB;" ^
  "Write-Host '============================================================' -ForegroundColor Cyan;" ^
  "Write-Host ('SUCESSO! Pasta pronta no seu Desktop: ' + $dest) -ForegroundColor Green;" ^
  "Write-Host ('Tamanho Total: ' + [Math]::Round($size, 2) + ' MB') -ForegroundColor Yellow;" ^
  "Write-Host 'Basta copiar a pasta SCOOBY_PENDRIVE para o seu Pen Drive!' -ForegroundColor Cyan;" ^
  "Write-Host '============================================================' -ForegroundColor Cyan;"
echo.
pause
