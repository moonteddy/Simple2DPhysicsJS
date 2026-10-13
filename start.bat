@echo off
rem Double-click to run public/index.html : starts a local server and opens the browser.
rem Close this window to stop the server.
set PORT=8000
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://localhost:%PORT%/"
python "%~dp0serve.py" %PORT%
if errorlevel 1 pause
