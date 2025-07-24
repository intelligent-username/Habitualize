@echo off
title Habitualize

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set APP_DIR=%SCRIPT_DIR%..

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Running dependency installer...
    if exist "%SCRIPT_DIR%install_dependencies_windows.bat" (
        call "%SCRIPT_DIR%install_dependencies_windows.bat"
    ) else (
        echo Dependency installer not found. Please install Python manually.
        pause
        exit /b 1
    )
)

REM Start the backend server in background
if exist "%APP_DIR%\backend\app.py" (
    start /b python "%APP_DIR%\backend\app.py"
    
    REM Wait a moment for backend to start
    timeout /t 2 /nobreak >nul
    
    REM Start the frontend
    "%APP_DIR%\habitualize.exe"
) else (
    echo Backend not found at %APP_DIR%\backend\app.py
    pause
    exit /b 1
)
