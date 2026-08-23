@echo off
chcp 65001 > nul
title Scooby OS - Inicializador de Banco de Dados Docker

echo ====================================================================
echo 🚀 SCOOBY OS - INICIALIZANDO BANCO POSTGRESQL + REDIS NO DOCKER
echo ====================================================================
echo.

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker Desktop não foi detectado ou ainda não está aberto!
    echo 1. Certifique-se de instalar o Docker Desktop para Windows.
    echo 2. Abra o aplicativo do Docker Desktop e aguarde o ícone da baleia ficar verde.
    echo 3. Execute este arquivo novamente.
    echo.
    pause
    exit /b 1
)

echo [1/2] Iniciando containers PostgreSQL 16 e Redis 7...
docker compose up -d

echo.
echo [2/2] Verificando status dos containers...
docker compose ps

echo.
echo ====================================================================
echo ✅ BANCO DE DADOS POSTGRESQL E CACHE REDIS ATIVOS E PRONTOS!
echo.
echo 🐘 PostgreSQL: localhost:5432 (Banco: scoobydb, Usuário: postgres)
echo ⚡ Redis:      localhost:6379
echo ====================================================================
echo.
pause
