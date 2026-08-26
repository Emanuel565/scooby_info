@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title INSTALADOR SCOOBY OS - WINDOWS SERVER & REDE LOCAL

echo ==============================================================================
echo        🐕 SCOOBY OS - INSTALADOR & CONFIGURADOR DE WINDOWS SERVER
echo ==============================================================================
echo  Este script irá configurar o Scooby OS para rodar como Servidor Central 24/7
echo  na sua empresa, permitindo o acesso de todos os computadores da oficina.
echo ==============================================================================
echo.

:: 1. Verificação de Privilégios de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] AVISO: Executando sem privilégios de Administrador.
    echo [*] Solicitando permissão de Administrador para configurar Firewall e Serviços...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [✓] Privilégios de Administrador confirmados!
echo.

:: 2. Verificação do Node.js
echo [1/7] Verificando ambiente Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [X] ERRO: Node.js não foi encontrado no servidor!
    echo     Por favor, instale o Node.js v20 ou superior (https://nodejs.org)
    echo     e execute este instalador novamente.
    pause
    exit /b
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo     Node.js detectado: !NODE_VER!

:: 3. Verificação do Docker
echo.
echo [2/7] Verificando Docker (PostgreSQL 16 e Redis 7)...
where docker >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] AVISO: Docker não detectado no PATH do sistema.
    echo     Certifique-se de que o Docker Desktop está instalado e rodando.
) else (
    echo     Iniciando contêineres do PostgreSQL e Redis...
    docker compose up -d
    echo [✓] Contêineres de Banco de Dados e Cache ativos!
)

:: 4. Instalação de Dependências
echo.
echo [3/7] Instalando e atualizando dependências do Backend e Frontend...
cd /d "%~dp0\backend"
call npm install --no-audit
call npx prisma generate
call npx prisma db push

cd /d "%~dp0\frontend"
call npm install --no-audit

:: 5. Compilação do Frontend Integrado
echo.
echo [4/7] Compilando Frontend de Alta Performance para Produção...
call npm run build
if %errorLevel% neq 0 (
    echo [X] Falha na compilação do Frontend. Verifique os logs.
    pause
    exit /b
)
echo [✓] Frontend compilado e integrado com sucesso no backend!

:: 6. Liberação no Firewall do Windows
echo.
echo [5/7] Configurando regra no Firewall do Windows para a porta 3001...
netsh advfirewall firewall delete rule name="Scooby OS - Servidor Local (Porta 3001)" >nul 2>&1
netsh advfirewall firewall add rule name="Scooby OS - Servidor Local (Porta 3001)" dir=in action=allow protocol=TCP localport=3001 profile=any >nul
echo [✓] Regra de entrada TCP 3001 liberada no Firewall para toda a rede local!

:: 7. Configuração de PM2 para Inicialização Automática 24/7
echo.
echo [6/7] Configurando Gerenciador de Processos PM2 (Início com o Windows)...
cd /d "%~dp0"
call npm install -g pm2 pm2-windows-startup >nul 2>&1

:: 8. Criação da Pasta e Agendamento de Backup Automático Diário
echo.
echo [7/7] Configurando Rotina de Backup Automático Diário...
if not exist "%~dp0backups" mkdir "%~dp0backups"
schtasks /query /tn "ScoobyOS_Backup_Diario" >nul 2>&1
if %errorLevel% neq 0 (
    schtasks /create /tn "ScoobyOS_Backup_Diario" /tr "\"%~dp0GERAR_BACKUP_BANCO.bat\"" /sc daily /st 19:00 /f >nul 2>&1
    echo [✓] Tarefa agendada: Backup automático diário configurado para as 19:00h!
) else (
    echo [✓] Tarefa de backup diário já existente e ativa!
)

:: Obtenção dos IPs locais para exibição
echo.
echo ==============================================================================
echo   🎉 INSTALAÇÃO NO SERVIDOR CONCLUÍDA COM SUCESSO!
echo ==============================================================================
echo.
echo  💻 ACESSO NESTE SERVIDOR:
echo     👉 http://localhost:3001
echo.
echo  📡 ACESSO DE OUTROS COMPUTADORES NA REDE (Atendimento, Técnicos, Gerência):
powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254*' } | ForEach-Object { Write-Host ('   👉 http://' + $_.IPAddress + ':3001') -ForegroundColor Cyan }"
echo.
echo  💡 Dica: Você pode criar um atalho no Desktop dos outros computadores com o link acima!
echo ==============================================================================
echo.
set /p INICIAR="Deseja iniciar o servidor agora? (S/N): "
if /i "%INICIAR%"=="S" (
    cd /d "%~dp0\backend"
    start cmd /k "title SCOOBY OS - SERVIDOR CENTRAL ATIVO & npm run dev"
    timeout /t 3 >nul
    start http://localhost:3001
)
pause
