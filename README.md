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

The frontend will now be running on http://[localhost:3000](http://localhost:3000).

