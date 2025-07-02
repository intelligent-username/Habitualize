# Habitualize

## “You are what you repeatedly do. Excellence, then, is not an act, but a habit."

– Aristotle

## In Progress 🚧

### Habitualize is a habit tracker app 🤯

Simple, minimalist habit tracker app. Track habits by entering a numeric value each day. Useful for habits where the value changes daily and is not a fixed target. The app is still in development, but most features work.
Example:
"Record weight", "Log hours studied", "Money saved".

## Quick Troubleshooting

**Something not working?**

- **Backend won't start**: Make sure you're in the `/backend` folder when running `python app.py`
- **Frontend won't start**: Make sure you're in the `/frontend` folder when running `npm run dev`
- **Can't connect**: Backend should be on port 5000, frontend on port 3000
- **Still stuck?**: Check the detailed READMEs in `/backend` and `/frontend` folders

**Pro tip**: Run backend and frontend in separate terminal windows/tabs.

What I will change:

- Re-implement 'Categories'
- Improve the UI
- "Package" the app better (loading screen, etc. etc.).
- Soon to come: Mobile Versions

---

## Set Up

**Quick note**: For detailed setup info, check out the individual READMEs in `/backend` and `/frontend` folders.

### What's What (Project Structure)

```md
Habitualize/
├── backend/     # Flask API server (Python)
├── frontend/    # React app (JavaScript)
└── README.md    # This file
```

### Tech Stack

- **Backend**: Flask + SQLite (auto-creates database)
- **Frontend**: React 19 + Vite + TanStack Query + react-router-dom@6
- **Why these?**: Fast to set up, easy to modify, good for prototyping

--

### General Requirements

- Python 3.10+
- Node.js (install the LTS from [https://nodejs.org/en])

### Backend (Flask) Setup

#### Navigate to the `backend` folder and install the required dependencies

```bash
   pip install -r requirements.txt
```

#### Run the Flask server

```bash
    python app.py
```

The backend will now be running on [http://127.0.0.1:5000](http://127.0.0.1:5000).

--

Ensure the terminal you're in is in the backend folder location.

### Frontend (ReactJS) Setup

On a SEPARATE terminal, Navigate to the **frontend folder** and install the necessary dependencies:

```bash
    npm install
```

Start the React development server:

```bash
    npm run dev
```

(The dependencies like date-fns, Vite, and react-query-devtools are already included in package.json - no need to install separately!)

Ensure the terminal you're in is in the frontend folder location.

- Run these in different terminals

The frontend will now be running on [http://localhost:3000](http://localhost:3000). **For now**, when running locally, THIS is where the app will be. Go to localhost:3000 in your browser (for example, Chrome) to use the app.

## Some Features

### Habit Types

#### 1. Binary

Description:
The classic habit tracker type. Mark the habit as complete (checked) or incomplete (unchecked) for each day.
Example:
“Read for 10 minutes”, “Go for a walk”.

#### 2. Reverse Binary

Description:
Used for “negative” habits. The habit is considered complete by default (checked); uncheck it if you “fail” (e.g., break a rule).
Example:
“No sugar today”, “No drinking”.

#### 3. Timer

Description:
Track habits that require spending a certain amount of time. Start a timer and mark the habit as complete when the target time is reached.
Example:
“Meditate for 5 minutes”, “Exercise for 30 minutes”.

#### 4. Counter

Description:
Track habits that require a specific number of repetitions. Enter or select the number of times you performed the habit and save your progress.
Example:
“Do 50 push-ups”, “Drink 8 glasses of water”.

#### 5. Entry-based

Description:
Track habits by entering a numeric value each day. Useful for habits where the value changes daily and is not a fixed target.
Example:
“Record weight”, “Log hours studied”, “Money saved”.
