@echo off
chcp 65001 > nul
title INSTALADOR SCOOBY OS - CONFIGURAÇÃO INICIAL
color 0E

echo ===============================================================================
echo     🐶 INSTALAÇÃO E CONFIGURAÇÃO DO SCOOBY OS
echo ===============================================================================
echo.
echo  Este assistente irá preparar todas as dependências e o banco de dados.
echo.

echo [1/4] Instalando dependências do Backend...
cd /d "%~dp0backend"
call npm install

echo.
echo [2/4] Configurando Banco de Dados SQLite...
call npx prisma db push
call npx tsx prisma/seed.ts

echo.
echo [3/4] Instalando dependências do Frontend...
cd /d "%~dp0frontend"
call npm install

echo.
echo [4/4] Gerando pacote final do sistema...
call npm run build

cd /d "%~dp0"

echo.
echo ===============================================================================
echo  🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ===============================================================================
echo.
echo  Para iniciar o sistema, basta dar 2 cliques em:
echo  👉 INICIAR_SCOOBY_OS.bat
echo.
echo ===============================================================================
pause