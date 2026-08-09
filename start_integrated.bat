@echo off
cd /d "%~dp0"
py run_integrated.py
if errorlevel 1 (
  echo Server failed to start.
  pause
)
