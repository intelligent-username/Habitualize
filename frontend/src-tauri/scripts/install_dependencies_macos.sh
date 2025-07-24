#!/bin/bash

echo "Checking and installing dependencies for Habitualize on macOS..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 not found. Installing Python 3..."
    brew install python@3.10
else
    echo "Python 3 is already installed."
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 not found. Installing pip..."
    python3 -m ensurepip --upgrade
fi

# Install backend dependencies
APP_DIR="/Applications/Habitualize.app/Contents/Resources/backend"
if [ -d "$APP_DIR" ] && [ -f "$APP_DIR/requirements.txt" ]; then
    echo "Installing Python backend dependencies..."
    python3 -m pip install --user -r "$APP_DIR/requirements.txt"
else
    echo "Backend directory or requirements.txt not found at $APP_DIR"
fi

echo "Dependency installation completed."
