@echo off
setlocal EnableExtensions
cd /d "%~dp0"

rem Prefer the full Python model server when it is already available.
where py >nul 2>nul
if errorlevel 1 goto no_install

py -c "import torch, torchvision, PIL" >nul 2>nul
if errorlevel 1 goto no_install

echo Starting History Pieces with the integrated AI model server...
py run_integrated.py
if not errorlevel 1 exit /b 0

echo.
echo The AI model server could not start. Switching to no-install mode.

:no_install
call "%~dp0START_NO_INSTALL.bat"
exit /b %errorlevel%
