@echo off
setlocal
cd /d "%~dp0"
call scripts\node-path.cmd
if errorlevel 1 goto failed
if not exist ".env" (
  echo Execute CONFIGURAR.cmd primeiro.
  goto failed
)
if not exist "node_modules\next" (
  echo Dependencias ausentes. Execute CONFIGURAR.cmd primeiro.
  goto failed
)
echo Abra http://localhost:3000 no navegador. Use Ctrl+C para encerrar.
call npm.cmd run dev
if errorlevel 1 goto failed
exit /b 0
:failed
pause
exit /b 1
