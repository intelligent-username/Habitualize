@echo off
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Installing Python...
    powershell -Command "Start-Process 'https://www.python.org/ftp/python/3.10.0/python-3.10.0-amd64.exe' -ArgumentList '/quiet InstallAllUsers=1 PrependPath=1' -Wait"
    echo Python installed successfully.
) else (
    echo Python is already installed.
)
