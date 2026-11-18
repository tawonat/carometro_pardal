@echo off
rem Localiza o Node sem depender apenas do PATH. SETLOCAL fica nos CMDs chamadores.
set "ELO_NODE_HOME="
for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined ELO_NODE_HOME set "ELO_NODE_HOME=%%~dpN"
if not defined ELO_NODE_HOME if exist "%ProgramFiles%\nodejs\node.exe" set "ELO_NODE_HOME=%ProgramFiles%\nodejs"
if not defined ELO_NODE_HOME if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "ELO_NODE_HOME=%LOCALAPPDATA%\Programs\nodejs"
if defined ELO_NODE_HOME goto verify
set /p "ELO_NODE_HOME=Informe a pasta do Node.js 22+ ou o caminho de node.exe: "
set "ELO_NODE_HOME=%ELO_NODE_HOME:"=%"
if exist "%ELO_NODE_HOME%" if /i "%ELO_NODE_HOME:~-8%"=="node.exe" for %%N in ("%ELO_NODE_HOME%") do set "ELO_NODE_HOME=%%~dpN"
:verify
if not exist "%ELO_NODE_HOME%\node.exe" (
  echo Node.js nao encontrado. Instale Node.js 22 ou superior.
  exit /b 1
)
if not exist "%ELO_NODE_HOME%\npm.cmd" (
  echo npm.cmd nao encontrado na pasta do Node. Instale a distribuicao completa.
  exit /b 1
)
"%ELO_NODE_HOME%\node.exe" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 (
  echo Esta versao do Node e antiga. Use Node.js 22 ou superior.
  exit /b 1
)
set "PATH=%ELO_NODE_HOME%;%PATH%"
exit /b 0
