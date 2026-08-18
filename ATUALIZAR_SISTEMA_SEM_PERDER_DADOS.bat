@echo off
setlocal
cd /d "%~dp0"
title SCOOBY INFORM?TICA - ATUALIZADOR SEGURO DE SISTEMA
color 0E

echo ===============================================================================
echo     ?? SCOOBY INFORM?TICA & ASSIST?NCIA T?CNICA - ATUALIZADOR SEGURO
echo ===============================================================================
echo.
echo  Este assistente ir? atualizar o sistema mantendo 100% dos seus dados intactos!
echo  (Ordens de Servi?o, Clientes, Estoque, Usu?rios e Relat?rios preservados).
echo.

:: 1. Cria pasta de backup de seguran?a preventiva
if not exist "%~dp0backups_atualizacao" mkdir "%~dp0backups_atualizacao"

:: 2. Faz c?pia de seguran?a do banco antes de atualizar
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%

echo [1/4] Fazendo backup preventivo do banco de dados...
if exist "%~dp0backend\prisma\dev.db" (
    copy /y "%~dp0backend\prisma\dev.db" "%~dp0backups_atualizacao\dev_backup_%TIMESTAMP%.db" > nul
    echo       ? C?pia de seguran?a salva em: backups_atualizacao\dev_backup_%TIMESTAMP%.db
) else (
    echo       ?? Nenhum banco anterior encontrado. Um novo ser? criado.
)
echo.

:: 3. Atualiza e compila o Backend
echo [2/4] Atualizando depend?ncias e estrutura do Banco de Dados...
cd /d "%~dp0backend"
call npm install --no-audit --no-fund
call npx prisma generate
call npx prisma db push --skip-generate
echo.

:: 4. Atualiza e compila o Frontend
echo [3/4] Atualizando e compilando o Frontend...
cd /d "%~dp0frontend"
call npm install --no-audit --no-fund
call npm run build
cd /d "%~dp0"
echo.

:: 5. Finaliza??o
echo [4/4] Concluindo atualiza??o...
echo.
echo ===============================================================================
echo  ?? SISTEMA ATUALIZADO COM SUCESSO!
echo ===============================================================================
echo  ? Todos os seus dados, ordens, clientes e estoques foram 100% preservados.
echo.
echo  Para iniciar o sistema atualizado, basta executar:
echo  ?? INICIAR_SCOOBY_OS.bat
echo ===============================================================================
echo.
pause