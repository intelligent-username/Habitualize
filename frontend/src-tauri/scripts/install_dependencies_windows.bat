@echo off
title Habitualize - Installing Dependencies

echo Checking and installing dependencies for Habitualize...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Installing Python 3.10...
    echo Downloading Python installer...
    
    REM Create temp directory
    set TEMP_DIR=%TEMP%\Habitualize_Setup
    if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"
    
    REM Download Python installer using PowerShell
    powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.10.11/python-3.10.11-amd64.exe' -OutFile '%TEMP_DIR%\python-installer.exe'"
    
    if exist "%TEMP_DIR%\python-installer.exe" (
        echo Installing Python...
        "%TEMP_DIR%\python-installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
        
        REM Wait for installation to complete
        timeout /t 30 /nobreak >nul
        
        REM Clean up
        del "%TEMP_DIR%\python-installer.exe"
        
        echo Python installed successfully.
        echo Please restart the application for Python to be recognized.
    ) else (
        echo Failed to download Python installer.
        echo Please install Python manually from https://python.org
        pause
        exit /b 1
    )
) else (
    echo Python is already installed.
)

REM Check if pip is available
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo pip not found. Installing pip...
    python -m ensurepip --upgrade
)

REM Install backend dependencies from the backend directory
set BACKEND_DIR=%~dp0..\backend
if exist "%BACKEND_DIR%\requirements.txt" (
    echo Installing Python backend dependencies...
    python -m pip install --user -r "%BACKEND_DIR%\requirements.txt"
) else (
    echo requirements.txt not found in backend directory.
)

echo.
echo Dependency installation completed.
echo.
