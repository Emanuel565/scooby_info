@echo off
chcp 65001 > nul
echo Limpando eventuais travas do OneDrive...
if exist ".git\index.lock" del /f /q ".git\index.lock" > nul 2>&1
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock" > nul 2>&1

echo Mudando para a branch DEV...
git checkout dev
echo.
git status
echo.
pause
