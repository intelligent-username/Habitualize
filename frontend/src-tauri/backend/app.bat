@echo off
title Habitualize Backend Launcher

echo Starting Habitualize Backend...
echo.

REM Navigate to the directory of the script (where backend files are)
cd /d "%~dp0"

REM Create temp directory for venv in user's temp folder to avoid permission issues
set TEMP_DIR=%TEMP%\Habitualize_Backend
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    echo Downloading Python 3.10+ installer...
    
    REM Use bitsadmin to download Python installer
    bitsadmin /transfer "DownloadPython" https://www.python.org/ftp/python/3.10.0/python-3.10.0-amd64.exe "%TEMP_DIR%\python-installer.exe"
    if exist "%TEMP_DIR%\python-installer.exe" (
        echo Installing Python...
        start /wait "%TEMP_DIR%\python-installer.exe" /quiet InstallAllUsers=1 PrependPath=1
        del "%TEMP_DIR%\python-installer.exe"
        echo Python installed successfully.
        echo Please restart the application for Python to be recognized.
        pause
        exit /b 0
    ) else (
        echo Failed to download Python installer. Please install it manually from https://python.org.
        pause
        exit /b 1
    )
)

REM Create virtual environment in temp directory to avoid permission issues
if not exist "%TEMP_DIR%\venv" (
    echo Creating Python virtual environment in temp directory...
    python -m venv "%TEMP_DIR%\venv"
    REM Download get-pip.py if not present
    if not exist "%TEMP_DIR%\get-pip.py" (
        echo Downloading get-pip.py for pip installation...
        bitsadmin /transfer "DownloadGetPip" https://bootstrap.pypa.io/get-pip.py "%TEMP_DIR%\get-pip.py"
    )
    REM Install pip in the venv using get-pip.py
    "%TEMP_DIR%\venv\Scripts\python.exe" "%TEMP_DIR%\get-pip.py"
)

echo Activating virtual environment...
call "%TEMP_DIR%\venv\Scripts\activate"

echo Installing Python dependencies...
pip install -r requirements.txt

echo Starting backend server...
python app.py