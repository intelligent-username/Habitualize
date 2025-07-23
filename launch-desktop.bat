@echo off
title Habitualize Desktop App

echo Starting Habitualize Desktop App...
echo.

REM Navigate to frontend directory
cd /d "%~dp0frontend"

REM Check if Tauri is available
if not exist "src-tauri" (
    echo Tauri is not set up. Running web version instead...
    call ..\launch.bat
    exit /b 0
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check if Rust is installed
rustc --version >nul 2>&1
if errorlevel 1 (
    echo Rust is not installed or not in PATH.
    echo Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)

echo Installing dependencies...
npm install

echo Starting Habitualize Desktop App...
npm run tauri:dev

pause
