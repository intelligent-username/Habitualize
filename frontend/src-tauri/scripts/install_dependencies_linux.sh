#!/bin/bash

echo "Checking and installing dependencies for Habitualize..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 not found. Installing Python 3..."
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv python3-dev
    elif command -v yum &> /dev/null; then
        # RedHat/CentOS
        sudo yum install -y python3 python3-pip python3-venv python3-devel
    elif command -v dnf &> /dev/null; then
        # Fedora
        sudo dnf install -y python3 python3-pip python3-venv python3-devel
    elif command -v pacman &> /dev/null; then
        # Arch Linux
        sudo pacman -S --noconfirm python python-pip
    else
        echo "Package manager not supported. Please install Python 3 manually."
        exit 1
    fi
else
    echo "Python 3 is already installed."
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 not found. Installing pip..."
    python3 -m ensurepip --upgrade
fi

# Install backend dependencies
BACKEND_DIR="/opt/habitualize/backend"
if [ -d "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/requirements.txt" ]; then
    echo "Installing Python backend dependencies..."
    python3 -m pip install --user -r "$BACKEND_DIR/requirements.txt"
else
    echo "Backend directory or requirements.txt not found at $BACKEND_DIR"
fi

echo "Dependency installation completed."
