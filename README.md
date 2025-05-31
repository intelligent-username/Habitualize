# Habitualize

## In Progress 🚧

### Habitualize is a habit tracker app 🤯

Simple, minimalist habit tracker app. Currently incomplete. This README is also incomplete. Currently, the app is usable but incomplete.

What I will change:

- 'Categories' feature
- Improved design
- Week bar bugs
- Load up speed
- "Package" the app so it's easier to run etc.
- Make better compatible w/ Android

---

## How to Set It Up

--

### General Requirements

- Python 3.1.0 or newer
- node.js (install the TLS from [https://nodejs.org/en])

### Backend (Flask) Setup

#### Navigate to the `backend` folder and install the required dependencies

```bash
   pip install -r requirements.txt
```

#### Run the Flask server

```bash
    python app.py
```

The backend will now be running on [127.0.0.1:500](http://127.0.0.1:5000).

--

Ensure the terminal you're in is in the backend folder location.

### Frontend (ReactJS) Setup

On a SEPARATE terminal, Navigate to the **frontend folder** and install the necessary dependencies:

```bash
    npm install
```

Start the React development server:

```bash
    npm start
```

- date-fns is also required, `npm install date-fns`

Ensure the terminal you're in is in the frontend folder location.

- Run these in different terminals

The frontend will now be running on http://[localhost:3000](http://localhost:3000). **For now**, when running locally, THIS is where the app will be. Go to [localhost:3000] in your browser (for example, Chrome) to use the app.

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
