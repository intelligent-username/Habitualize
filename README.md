# Habitualize

## Tauri version

- App is complete now, just need to add 

<img src="frontend/public/logo.svg" alt="Logo" width="128" height="128">

## "You are what you repeatedly do. Excellence, then, is not an act, but a habit."

– Aristotle

### A lightning-fast, minimalistic and functional habit tracker

Track your progress, analyze your patterns, and stay motivated with a clean, intuitive interface that actually gets out of your way.
Finally complete

## What's Inside

```md
Habitualize/
├── backend/     # Flask API + SQLite
├── frontend/    # React app
└── README.md    # You are here
```

**Tech Stack**: Flask + SQLite backend, React + Vite frontend. Simple, fast, and reliable.

## Quick Start

### 🚀 One-Click Launch (Windows)

Double-click `launch.bat` or `launch-desktop.bat` to automatically set up and run the app!

### 📱 Desktop App (Recommended)

**Requirements**: Python 3.10+, Node.js 18+, Rust, Visual Studio Build Tools

```bash
cd frontend
npm install
npm run tauri:dev    # Development
npm run tauri:build  # Production installer
```

### 🌐 Web App (Manual Setup)

**Requirements**: Python 3.10+ and Node.js 18+

**Backend** (in `/backend` folder):

```bash
pip install -r requirements.txt
python app.py
```

**Frontend** (in `/frontend` folder, separate terminal):

```bash
npm install
npm run dev
```

Visit `http://localhost:33333` and start building those habits! 🎯

## Features

### **Dashboard & Analytics**

- Daily habit tracking with intuitive date navigation
- Weekly and monthly analytics with beautiful charts
- Habit consistency tracking and streak counters
- Export your data for deeper analysis

### **Habit Types**

- **Binary**: Simple done/not done tracking ("Read 20 minutes")
- **Reverse Binary**: For breaking bad habits ("No social media")
- **Timer**: Built-in timers for time-based habits ("Meditate 10 minutes")
- **Counter**: Track repetitions ("50 push-ups", "8 glasses of water")
- **Entry**: Log numeric values ("Weight", "Hours studied")
- **Cumulative**: Track progress over custom periods ("Run 10 miles this week")

### **Organization**

- **Categories**: Organize habits by life areas (Health, Work, Personal)
- **Sequences**: Chain related habits together for powerful routines
- **Custom Icons**: 50+ icons to personalize your habits, possible more to come later.

### **Pomodoro Timer**🐐🐐

- Integrated focus timer with work/break cycles
- Session tracking and productivity analytics
- Custom work and break durations
- Audio notifications (because who doesn't love a good *ding*?)

### **Quality of Life**

- Dark/Light mode support
- Mobile-responsive design
- Offline-ready (your habits don't need WiFi)
- Clean, distraction-free interface
- Quote of the day for some wonderful motivation

## 📦 Distribution & Installation

### Desktop App (Tauri)

- **Windows**: `.msi` installer (~15-25MB) (coming soon)
- **macOS**: `.dmg` package (~20-30MB)  (coming soon)
- **Linux**: `.AppImage` / `.deb` (~15-25MB) (coming soon)

### For Developers

See `SETUP.md` for detailed build instructions and cross-platform considerations. (COMING SOON)

---
