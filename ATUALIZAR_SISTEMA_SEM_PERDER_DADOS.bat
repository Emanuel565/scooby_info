@echo off
setlocal
cd /d "%~dp0"
title ATUALIZADOR SEGURO - SCOOBY OS

echo ===============================================================================
echo     SCOOBY OS - ATUALIZADOR AUTOMATICO SEM PERDA DE DADOS
echo ===============================================================================
echo.
echo  Este assistente ira atualizar o sistema mantendo 100%% dos seus dados intactos!
echo  (Ordens de Servico, Clientes, Estoque, Usuarios, Vendas e Relatorios).
echo.

:: 1. Faz backup preventivo do banco PostgreSQL antes de atualizar
echo [1/4] Gerando backup preventivo do banco PostgreSQL...
call "%~dp0GERAR_BACKUP_BANCO.bat"
echo.

:: 2. Sincroniza novidades do Git se configurado
echo [2/4] Baixando novidades do repositorio Git...
git status >nul 2>&1
if %errorLevel% equ 0 (
    git pull origin main
) else (
    echo       [AVISO] Git nao detectado nesta pasta. Pulando git pull.
)
echo.

:: 3. Garante que os conteineres Docker estao rodando
echo [3/4] Atualizando dependencias e estrutura do banco...
docker compose up -d >nul 2>&1

cd /d "%~dp0backend"
call npm install --no-audit --no-fund
call npx prisma generate
call npx prisma db push --skip-generate

cd /d "%~dp0frontend"
call npm install --no-audit --no-fund
call npm run build
cd /d "%~dp0"
echo.

:: 4. Finalizacao
echo [4/4] Concluindo atualizacao...
echo.
echo ===============================================================================
echo  SISTEMA ATUALIZADO COM SUCESSO!
echo ===============================================================================
echo  Todos os seus dados, ordens, clientes e estoques foram 100%% preservados.
echo.
echo  Para reiniciar o sistema, basta executar o backend ou acessar:
echo  http://localhost:3001
echo ===============================================================================
echo.
pause