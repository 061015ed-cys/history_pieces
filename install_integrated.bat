@echo off
cd /d "%~dp0"
py -m pip install -r requirements_integrated.txt
if errorlevel 1 (
  echo Installation failed.
  pause
  exit /b 1
)
echo Installation complete.
pause
