# Habitualize Setup Guide

## Prerequisites

### For Development & Building

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **Rust** (latest stable)
- **Visual Studio Build Tools** (Windows only)

### For End Users (Desktop App)

- Windows: Minimal requirements (bundled installer)
- macOS: macOS 10.15+
- Linux: Modern Linux distribution with GTK

## Development Setup

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Backend runs on: [http://localhost:33333](http://localhost:33333)

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: [http://localhost:33333](http://localhost:33333)

### 3. Tauri Desktop App

```bash
cd frontend
npm run tauri:dev     # Development mode
npm run tauri:build   # Production build
```

## Building Installers

### Windows (.msi)

```bash
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/msi/`

### macOS (.dmg)

```bash
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/dmg/`

### Linux (.AppImage, .deb)

```bash
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/appimage/` and `src-tauri/target/release/bundle/deb/`

## Distribution

### Desktop App Features

- ✅ Native window (no browser required)
- ✅ Desktop icon and Start Menu entry
- ✅ Auto-launch backend on startup
- ✅ System notifications support
- ✅ File system access
- ✅ Offline support
- ✅ Auto-updater ready

### File Structure (Production)

```nd
Habitualize/
├── Habitualize.exe           # Main executable
├── backend/                  # Python backend (bundled)
│   ├── app.py
│   ├── requirements.txt
│   └── ...
└── frontend/                 # React frontend (built)
    └── build/
```

## App Size Optimization

### Current Optimizations

- Uses system webview (not Chromium)
- Bundled Python backend
- Minified frontend assets
- Compressed resources

### Expected Sizes

- Windows: ~15-25MB installer
- macOS: ~20-30MB
- Linux: ~15-25MB

## Troubleshooting

### Common Issues

1. **Rust compilation errors**: Install Visual Studio Build Tools
2. **Python not found**: Ensure Python is in PATH
3. **Port conflicts**: Backend uses port 33333
4. **Build failures**: Check Rust and Node.js versions

### Build Requirements

- Minimum 4GB RAM for building
- ~500MB disk space for build artifacts
- Internet connection for dependencies

## User Installation

### Windows

1. Download `Habitualize_1.0.0_x64_en-US.msi`
2. Double-click to install
3. Launch from Start Menu or Desktop

### macOS

1. Download `Habitualize_1.0.0_x64.dmg`
2. Open DMG and drag to Applications
3. Launch from Applications folder

### Linux

1. Download `Habitualize_1.0.0_amd64.AppImage`
2. Make executable: `chmod +x Habitualize_1.0.0_amd64.AppImage`
3. Run: `./Habitualize_1.0.0_amd64.AppImage`

## Development Notes

### Backend Integration

- Tauri automatically launches Python backend on app start
- Backend runs in background process
- Frontend connects to localhost:33333
- Backend shuts down when app closes

### Cross-Platform Considerations

- Icons: Multiple formats included (ICO, ICNS, PNG)
- Permissions: File access configured in tauri.conf.json
- Themes: Supports system light/dark mode
- Updates: Auto-updater configured for future releases
