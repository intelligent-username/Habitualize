# Habitualize Backend

This is the backend for the Habitualize app, built with Flask and SQLite.

## Overview

- Modular Flask app using Blueprints for categories, sequences, and habits
- SQLite database with schema for categories, sequences, habits, and habit history
- All business logic is organized in `services/` and `database/` modules
- API endpoints for CRUD operations on categories, sequences, and habits
- CORS enabled for frontend-backend communication

## Project Structure

- `app.py` — Main Flask app, registers blueprints, error handlers, and health checks
- `imports.py` — Centralized imports for helpers and queries
- `database/` — DB connection, schema, and SQL queries
- `routes/` — API endpoints for categories, sequences, and habits
- `services/` — Helper functions for serialization, business logic, and utilities
- `requirements.txt` — Python dependencies

## Setup

### Prerequisites

- Python 3.10+ and pip
- Virtual environment (recommended)

### Installation

1. **Create and activate virtual environment:**

   ```sh
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies:**

   ```sh
   pip install -r requirements.txt
   ```

3. **Run the backend server:**

   ```sh
   python app.py
   ```

   The API will be available at [http://localhost:5000](http://localhost:5000)

### Configuration

- **Port:** 5000 (default)
- **Debug Mode:** Enabled in development
- **Database:** SQLite (`data.db`) - auto-created on first run
- **CORS:** Enabled for all origins

## Database Schema

The application uses SQLite with the following table structure:

```md
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│   categories    │       │    sequences     │       │       habits        │
├─────────────────┤       ├──────────────────┤       ├─────────────────────┤
│ id (PK)         │◄──────┤ category_id (FK) │       │ sequence_id (FK)    │◄────┐
│ name            │       │ id (PK)          │◄──────┤ id (PK)             │     │
└─────────────────┘       │ name             │       │ step_order          │     │
                          │ color            │       │ name                │     │
                          │ date_created     │       │ type                │     │
                          └──────────────────┘       │ target_value        │     │
                                                     │ date_created        │     │
                                                     │ cumulative          │     │
                                                     │ cumulative_goal     │     │
                                                     │ cumulative_period   │     │
                                                     └─────────────────────┘     │
                                                                                 │
                          ┌──────────────────┐                                  │
                          │  habit_history   │                                  │
                          ├──────────────────┤                                  │
                          │ habit_id (FK)    │──────────────────────────────────┘
                          │ date (PK)        │
                          │ completed        │
                          │ value            │
                          └──────────────────┘
```

### Table Relationships

- **categories** → **sequences** (1:many) via `category_id`
- **sequences** → **habits** (1:many) via `sequence_id`  
- **habits** → **habit_history** (1:many) via `habit_id`

### Data Types

- **categories**: Simple name-based grouping
- **sequences**: Collections of related habits with visual styling
- **habits**: Individual trackable items (binary/numeric/timer types)
- **habit_history**: Daily completion records with values

## API Endpoints

### Categories (`/categories`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/categories` | Get all categories |
| POST   | `/categories` | Create new category |
| PUT    | `/categories/{id}` | Update category |
| DELETE | `/categories/{id}` | Delete category |

**Example Requests:**

```json
// POST /categories
{
  "name": "Health & Fitness"
}

// PUT /categories/1  
{
  "name": "Updated Category Name"
}
```

### Sequences (`/sequences`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/sequences` | Get all sequences |
| POST   | `/sequences` | Create new sequence |
| GET    | `/sequences/{id}` | Get sequence by ID |
| PUT    | `/sequences/{id}` | Update sequence |
| DELETE | `/sequences/{id}` | Delete sequence |
| GET    | `/sequences/{id}/habits` | Get habits in sequence |
| GET    | `/sequences/by-date/{date}` | Get sequences by date |

**Example Requests:**

```json
// POST /sequences
{
  "name": "Morning Routine",
  "color": "#4CAF50",
  "category_id": 1
}

// PUT /sequences/1
{
  "name": "Updated Morning Routine",
  "color": "#2196F3"
}
```

### Habits (`/habits`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/habits` | Create new habit |
| GET    | `/habits/{id}/history` | Get habit completion history |
| PUT    | `/habits/{id}/history` | Update habit completion for date |
| GET    | `/habits/{id}/cumulative-progress` | Get cumulative progress |
| PUT    | `/habits/{id}` | Update habit details |
| DELETE | `/habits/{id}` | Delete habit |

**Example Requests:**

```json
// POST /habits
{
  "sequence_id": 1,
  "name": "Drink Water",
  "type": "binary",
  "target_value": 1,
  "step_order": 1
}

// PUT /habits/1/history
{
  "date": "2025-06-27",
  "completed": true,
  "value": 1
}

// PUT /habits/1
{
  "name": "Updated Habit Name",
  "target_value": 2
}
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | API status message |
| GET    | `/health` | Health check endpoint |

### Error Responses

All endpoints return JSON error responses with appropriate HTTP status codes:

```json
// 404 Not Found
{
  "error": "Not Found",
  "message": "The requested URL was not found on the server."
}

// 405 Method Not Allowed  
{
  "error": "Method Not Allowed",
  "message": "The method is not allowed for the requested URL."
}

// 500 Internal Server Error
{
  "error": "Error description"
}
```

## Development Notes

### Database

- All database schema is auto-initialized on first run
- Database file (`data.db`) is created in the project root
- Uses SQLite Row factory for named column access
- Foreign key constraints are enabled

### Project Architecture

- **Modular Design**: Uses Flask Blueprints for route organization
- **Centralized Imports**: `imports.py` manages all cross-module dependencies
- **Service Layer**: Business logic separated into `services/` directory
- **Database Layer**: SQL queries and connection management in `database/`

### Development Tips

- Use virtual environment to avoid dependency conflicts
- Check `app.py` and `routes/` files for detailed API implementation
- Database queries are defined in `database/queries.py`
- JSON serialization helpers are in `services/json_utils.py`

### Troubleshooting

**Common Issues:**

1. **Port Already in Use**: Change port in `app.py` or kill existing process
2. **CORS Errors**: Ensure `flask-cors` is installed and configured
3. **Database Locked**: Close any open database connections or restart the server
4. **Import Errors**: Verify all dependencies are installed and virtual environment is activated

### Testing

- Health check: `GET http://localhost:5000/health`
- API status: `GET http://localhost:5000/`
- Test database initialization by checking for `data.db` file creation

For full-stack setup and frontend integration, see the main project README.
