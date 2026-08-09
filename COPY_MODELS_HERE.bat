@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "DEST=%~dp0addons\models"
if not exist "%DEST%" mkdir "%DEST%"
set "MISSING=0"
call :copyone first_piece_detection.pth
call :copyone second_piece_detection.pth
call :copyone third_piece_detection.pth
if not "%MISSING%"=="0" (
  echo.
  echo One or more model files were not found.
  echo Put the three .pth files next to this project folder or in Downloads, then run this file again.
  pause
  exit /b 1
)
echo.
echo All three model files are ready in addons\models.
pause
exit /b 0

:copyone
set "NAME=%~1"
if exist "%DEST%\%NAME%" (
  echo [OK] %NAME%
  exit /b 0
)
if exist "%~dp0%NAME%" (
  copy /y "%~dp0%NAME%" "%DEST%\%NAME%" >nul
  echo [COPIED] %NAME% from project folder
  exit /b 0
)
if exist "%~dp0..\%NAME%" (
  copy /y "%~dp0..\%NAME%" "%DEST%\%NAME%" >nul
  echo [COPIED] %NAME% from parent folder
  exit /b 0
)
if exist "%USERPROFILE%\Downloads\%NAME%" (
  copy /y "%USERPROFILE%\Downloads\%NAME%" "%DEST%\%NAME%" >nul
  echo [COPIED] %NAME% from Downloads
  exit /b 0
)
if exist "%USERPROFILE%\Desktop\%NAME%" (
  copy /y "%USERPROFILE%\Desktop\%NAME%" "%DEST%\%NAME%" >nul
  echo [COPIED] %NAME% from Desktop
  exit /b 0
)
echo [MISSING] %NAME%
set /a MISSING+=1
exit /b 0
