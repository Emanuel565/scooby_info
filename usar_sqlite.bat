@echo off
chcp 65001 > nul
title Scooby OS - Ativar SQLite (Modo Leve / Offline)

echo ====================================================================
echo 🚀 ATIVANDO BANCO DE DADOS SQLITE (MODO LOCAL LEVE)
echo ====================================================================
echo.

echo [1/3] Configurando variáveis de ambiente para SQLite...
(
echo PORT=3001
echo HOST=0.0.0.0
echo DATABASE_URL="file:./dev.db"
echo JWT_SECRET="scooby_super_secret_jwt_key_2026_tech_flow"
echo CORS_ORIGIN="*"
echo PUBLIC_URL="https://polyphonic-beta-handmade-spread.trycloudflare.com"
) > backend\.env

echo [2/3] Atualizando schema do Prisma para SQLite...
powershell -Command "(Get-Content backend\prisma\schema.prisma) -replace 'provider = \"postgresql\"', 'provider = \"sqlite\"' | Set-Content backend\prisma\schema.prisma"

echo.
echo [3/3] Sincronizando banco SQLite...
cd backend
call npx.cmd prisma db push
call npx.cmd prisma generate
cd ..

echo.
echo ====================================================================
echo ✅ MUDANÇA CONCLUÍDA! O Scooby OS está usando SQLite local.
echo ====================================================================
echo.
pause
