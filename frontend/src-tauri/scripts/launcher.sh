#!/bin/bash
# Main launcher script for Habitualize

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

# Check if dependencies are installed
check_dependencies() {
    if ! command -v python3 &> /dev/null; then
        echo "Python 3 is not installed. Running dependency installer..."
        if [ -f "$APP_DIR/scripts/install_dependencies_linux.sh" ]; then
            bash "$APP_DIR/scripts/install_dependencies_linux.sh"
        elif [ -f "$APP_DIR/scripts/install_dependencies_macos.sh" ]; then
            bash "$APP_DIR/scripts/install_dependencies_macos.sh"
        else
            echo "Dependency installer not found. Please install Python 3 manually."
            exit 1
        fi
    fi
}

# Check dependencies before starting
check_dependencies

# Start the backend server in background
if [ -f "$APP_DIR/backend/app.py" ]; then
    python3 "$APP_DIR/backend/app.py" &
    BACKEND_PID=$!
    
    # Wait a moment for backend to start
    sleep 2
    
    # Start the frontend
    exec "$APP_DIR/habitualize"
else
    echo "Backend not found at $APP_DIR/backend/app.py"
    exit 1
fi
