@echo off
setlocal
cd /d "%~dp0"
title INSTALADOR SCOOBY OS - WINDOWS SERVER

echo ==============================================================================
echo        SCOOBY OS - INSTALADOR E CONFIGURADOR DE WINDOWS SERVER
echo ==============================================================================
echo  Este script configura o Scooby OS para rodar como Servidor Central 24/7
echo  na sua empresa, permitindo o acesso de todos os computadores da oficina.
echo ==============================================================================
echo.

:: 1. Verificacao de Privilegios de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [AVISO] Solicitando permissao de Administrador para Firewall e Servicos...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [OK] Privilegios de Administrador confirmados.
echo.

:: 2. Verificacao do Node.js
echo [1/7] Verificando ambiente Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no servidor.
    echo Por favor, instale o Node.js v20 ou superior (https://nodejs.org)
    echo e execute este instalador novamente.
    pause
    exit /b
)
node -v
echo.

:: 3. Verificacao do Docker
echo [2/7] Verificando Docker (PostgreSQL 16 e Redis 7)...
where docker >nul 2>&1
if %errorLevel% neq 0 (
    echo [AVISO] Docker nao detectado no PATH. Certifique-se de que o Docker Desktop esta aberto.
) else (
    echo Iniciando conteineres do PostgreSQL e Redis...
    docker compose up -d
    echo [OK] Conteineres de Banco de Dados e Cache ativos.
)
echo.

:: 4. Instalacao de Dependencias
echo [3/7] Instalando e atualizando dependencias do Backend e Frontend...
cd /d "%~dp0backend"
call npm install --no-audit --no-fund
call npx prisma generate
call npx prisma db push

cd /d "%~dp0frontend"
call npm install --no-audit --no-fund
echo.

:: 5. Compilacao do Frontend Integrado
echo [4/7] Compilando Frontend integrado para producao...
call npm run build
if %errorLevel% neq 0 (
    echo [ERRO] Falha na compilacao do Frontend.
    pause
    exit /b
)
echo [OK] Frontend compilado e integrado com sucesso no backend.
echo.

:: 6. Liberacao no Firewall do Windows
echo [5/7] Configurando regra no Firewall do Windows para a porta 3001...
netsh advfirewall firewall delete rule name="Scooby OS - Servidor Local (Porta 3001)" >nul 2>&1
netsh advfirewall firewall add rule name="Scooby OS - Servidor Local (Porta 3001)" dir=in action=allow protocol=TCP localport=3001 profile=any >nul
echo [OK] Regra de entrada TCP 3001 liberada no Firewall para toda a rede local.
echo.

:: 7. Configuracao de PM2 para Inicializacao Automatica
echo [6/7] Instalando gerenciador de processos PM2...
cd /d "%~dp0"
call npm install -g pm2 pm2-windows-startup >nul 2>&1
echo.

:: 8. Criacao da Pasta e Agendamento de Backup Automatico Diario
echo [7/7] Configurando rotina de backup automatico diario...
if not exist "%~dp0backups" mkdir "%~dp0backups"
schtasks /query /tn "ScoobyOS_Backup_Diario" >nul 2>&1
if %errorLevel% neq 0 (
    schtasks /create /tn "ScoobyOS_Backup_Diario" /tr "\"%~dp0GERAR_BACKUP_BANCO.bat\"" /sc daily /st 19:00 /f >nul 2>&1
    echo [OK] Tarefa agendada: Backup automatico diario configurado para as 19:00h.
) else (
    echo [OK] Tarefa de backup diario ja existente e ativa.
)

echo.
echo ==============================================================================
echo   INSTALACAO NO SERVIDOR CONCLUIDA COM SUCESSO!
echo ==============================================================================
echo.
echo  ACESSO NESTE SERVIDOR:
echo     http://localhost:3001
echo.
echo  ACESSO DE OUTROS COMPUTADORES NA REDE LOCAL:
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254*' } | ForEach-Object { Write-Host ('   http://' + $_.IPAddress + ':3001') -ForegroundColor Cyan }"
echo.
echo ==============================================================================
echo.
set /p INICIAR="Deseja iniciar o servidor agora? (S/N): "
if /i "%INICIAR%"=="S" (
    cd /d "%~dp0backend"
    start cmd /k "title SCOOBY OS - SERVIDOR CENTRAL ATIVO & npm run dev"
    ping 127.0.0.1 -n 3 >nul
    start http://localhost:3001
)
pause
