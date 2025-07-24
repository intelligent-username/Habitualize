# Habitualize

## Tauri version

<img src="frontend/public/logo.svg" alt="Logo" width="128" height="128">

## "You are what you repeatedly do. Excellence, then, is not an act, but a habit."

– Aristotle

### A lightning-fast, minimalistic and functional habit tracker

Track your progress, analyze your patterns, and stay motivated with a clean, intuitive interface that actually gets out of your way.
Finally complete

## Running the App

## Desktop App (quickstart, recommended)

- **Windows**: `.msi` installer
  - Click [this button](https://github.com/intelligent-username/Habitualize/releases/download/v1/Habitualize_1.0.0_x64_en-US.msi) to downlaod
  - Or go to 'Releases' page on this Github repo, navigate to v1.0.0, and install the .msi from there
  - Will start backend on a separate app terminal. Here you can see the logs. **Do not close this terminal.**

- **macOS**: `.dmg` package
  - 

- **Linux**: `.AppImage` / `.deb`

### 🌐 Web App (Manual Setup, mostly for Developers)

I recommend running the non-Tauri version for development, it's less of a headache.

**Requirements**: Python 3.10+, Node.js 18+, Rust, Visual Studio Build Tools

**Frontend**
Run the Tauri production app (in `frontend/` folder):

```bash
npm install
npm run tauri:dev    # Development
npm run tauri:build  # Production installer
```

Alternatively, run a generic browser-based app:
(in `/frontend` folder, separate terminal):

```bash
npm install
npm run dev
```

**Backend** (in `/backend` folder):

```bash
pip install -r requirements.txt
python app.py
```

- For web/manual dev: run backend and frontend separately.
- For Tauri dev: just run `npm run tauri:dev`.
- For production: run `npm run tauri:build`.

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

## File Structure

```md
Habitualize/
├── frontend/                   # React app
├───── src/                     # UI, front end logic 
├───── src-tauri/
├──────────────── backend/      # Python (flask) backend
─── # And a lot of other files
└── README.md    # You are here
```

**Tech Stack**: Flask + SQLite backend, React + Vite frontend. Simple, fast, and reliable.

---
