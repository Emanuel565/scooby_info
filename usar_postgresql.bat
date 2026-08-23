@echo off
chcp 65001 > nul
title Scooby OS - Ativar PostgreSQL + Redis (Docker)

echo ====================================================================
echo 🚀 ATIVANDO BANCO DE DADOS POSTGRESQL + CACHE REDIS (PRODUÇÃO)
echo ====================================================================
echo.

echo [1/4] Iniciando containers no Docker Desktop...
docker compose up -d

echo.
echo [2/4] Configurando variáveis de ambiente para PostgreSQL...
copy /Y backend\.env.docker backend\.env > nul

echo [3/4] Atualizando schema do Prisma para PostgreSQL...
powershell -Command "(Get-Content backend\prisma\schema.prisma) -replace 'provider = \"sqlite\"', 'provider = \"postgresql\"' | Set-Content backend\prisma\schema.prisma"

echo.
echo [4/4] Criando tabelas e gerando cliente Prisma no PostgreSQL...
cd backend
call npx.cmd prisma db push
call npx.cmd prisma generate
cd ..

echo.
echo ====================================================================
echo ✅ MUDANÇA CONCLUÍDA COM SUCESSO!
echo O Scooby OS agora está rodando sobre PostgreSQL 16 + Redis 7!
echo ====================================================================
echo.
pause
