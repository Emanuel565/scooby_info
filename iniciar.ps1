# Script de Inicialização Scooby OS
$ErrorActionPreference = "SilentlyContinue"
$Host.UI.RawUI.WindowTitle = "SCOOBY INFORMATICA - SISTEMA DE GESTAO"

Clear-Host
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "    SCOOBY INFORMATICA & ASSISTENCIA TECNICA - GESTAO DE OS" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " [1/2] Iniciando o servidor central..." -ForegroundColor White

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$baseDir\backend"

# Inicia o servidor Node em segundo plano
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$baseDir\backend" -WindowStyle Hidden

Start-Sleep -Seconds 3

Write-Host " [2/2] Abrindo o sistema no navegador..." -ForegroundColor White
Start-Process "http://localhost:3001"

# Obtém IP local da rede
$localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*", "Wi-Fi*" -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
if (-not $localIp) { $localIp = "192.168.100.8" }

Clear-Host
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "    SCOOBY INFORMATICA & ASSISTENCIA TECNICA - SISTEMA ATIVO!" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ACESSO NESTE COMPUTADOR:" -ForegroundColor White
Write-Host "     http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ACESSO DE OUTROS COMPUTADORES / CELULARES NA MESMA REDE WI-FI:" -ForegroundColor White
Write-Host "     http://${localIp}:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "  USUARIOS CADASTRADOS (Senha: 123456):" -ForegroundColor White
Write-Host "     Donizete (Administrador)  - Login: donizete" -ForegroundColor Cyan
Write-Host "     Juciane  (Administradora) - Login: juciane" -ForegroundColor Cyan
Write-Host "     Emanuel  (Tecnico)        - Login: emanuel" -ForegroundColor Cyan
Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  Para encerrar o sistema, basta fechar esta janela." -ForegroundColor DarkGray
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# Mantém a janela aberta e monitora
while ($true) {
    Start-Sleep -Seconds 60
}