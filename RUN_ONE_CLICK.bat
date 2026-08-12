@echo off
setlocal EnableExtensions
cd /d "%~dp0"

rem Prefer the Python integration server so the three piece-specific LLM chats are available.
where py >nul 2>nul
if errorlevel 1 goto no_install

echo Starting History Pieces with the integrated LLM and AI server...
py run_integrated.py
if not errorlevel 1 exit /b 0

echo.
echo The integrated Python server could not start. Switching to no-install mode.

:no_install
call "%~dp0START_NO_INSTALL.bat"
exit /b %errorlevel%
