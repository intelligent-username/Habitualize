#!/bin/bash
# Post-installation script for Habitualize .deb package

set -e

# Run the dependency installer
if [ -f "/usr/share/habitualize/scripts/install_dependencies_linux.sh" ]; then
    chmod +x /usr/share/habitualize/scripts/install_dependencies_linux.sh
    /usr/share/habitualize/scripts/install_dependencies_linux.sh
fi

# Create desktop entry
cat > /usr/share/applications/habitualize.desktop << EOF
[Desktop Entry]
Name=Habitualize
Comment=Lightning-fast habit tracker
Exec=/usr/bin/habitualize
Icon=habitualize
Terminal=false
Type=Application
Categories=Utility;Productivity;
EOF

exit 0
