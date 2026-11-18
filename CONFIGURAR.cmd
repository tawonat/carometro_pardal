@echo off
setlocal
cd /d "%~dp0"
call scripts\node-path.cmd
if errorlevel 1 goto failed
if not exist ".env" copy /y ".env.example" ".env" >nul
echo Preencha o .env com as credenciais do seu MySQL e salve o arquivo.
echo O MySQL precisa estar iniciado. Veja os detalhes no README.
start /wait notepad.exe ".env"
pause
call npm.cmd ci
if errorlevel 1 goto failed
call npm.cmd run db:setup
if errorlevel 1 goto failed
echo Configuracao concluida. Abra INICIAR.cmd para iniciar o Elo.
pause
exit /b 0
:failed
echo A configuracao nao foi concluida. Confira a mensagem acima e o README.
pause
exit /b 1
