@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where powershell >nul 2>nul
if errorlevel 1 (
  echo Windows PowerShell was not found.
  echo Run this folder on Windows 10 or Windows 11.
  pause
  exit /b 1
)

echo Starting History Pieces in no-install mode...
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\static_server.ps1" -Port 5517
if errorlevel 1 (
  echo.
  echo The local server could not start. Make sure port 5517 is free.
  pause
  exit /b 1
)
