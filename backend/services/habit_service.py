"""Handles Habit CRUD + history operations"""


import datetime
from database.connection import get_db_connection

def get_habits_by_sequence(sequence_id):
    """Get all habits in a sequence ordered by step_order."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, sequence_id, step_order, name, type, target_value, date_created, cumulative, cumulative_goal, cumulative_period FROM habits WHERE sequence_id = ? ORDER BY step_order ASC",
            (sequence_id,)
        )
        
        return [
            {
                "id": row[0],
                "sequence_id": row[1],
                "step_order": row[2],
                "name": row[3],
                "type": row[4],
                "target_value": row[5],
                "date_created": row[6],
                "cumulative": row[7],
                "cumulative_goal": row[8],
                "cumulative_period": row[9]
            }
            for row in cursor.fetchall()
        ]

def create_habit(sequence_id, step_order, name, habit_type='binary', target_value=None, cumulative=0, cumulative_goal=None, cumulative_period=None):
    """
    Create new habit in sequence.
    
    Args:
        sequence_id: Parent sequence ID
        step_order: Order within sequence
        name: Habit name
        habit_type: Type (binary, counter, entry, reverse_binary)
        target_value: Target value for completion
        cumulative: Whether habit is cumulative (0 or 1)
        cumulative_goal: Goal for cumulative tracking
        cumulative_period: Period for cumulative tracking
    """
    if not name or not sequence_id:
        raise ValueError("Habit name and sequence_id are required")
    
    date_created = datetime.date.today().isoformat()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO habits (sequence_id, step_order, name, type, target_value, date_created, cumulative, cumulative_goal, cumulative_period)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (sequence_id, step_order, name, habit_type, target_value, date_created, cumulative, cumulative_goal, cumulative_period)
        )
        return {"id": cursor.lastrowid, "message": "Habit added successfully"}

def update_habit(habit_id, data):
    """Update habit with provided data."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get current values
        cursor.execute("SELECT name, type, target_value, cumulative, cumulative_goal, cumulative_period FROM habits WHERE id = ?", (habit_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError("Habit not found")
        
        # Use provided values or keep current ones
        name = data.get('name', row[0])
        habit_type = data.get('type', row[1])
        target_value = data.get('target_value', row[2])
        cumulative = data.get('cumulative', row[3])
        cumulative_goal = data.get('cumulative_goal', row[4])
        cumulative_period = data.get('cumulative_period', row[5])
        
        if not name:
            raise ValueError("Missing fields")
        
        cursor.execute(
            "UPDATE habits SET name = ?, type = ?, target_value = ?, cumulative = ?, cumulative_goal = ?, cumulative_period = ? WHERE id = ?",
            (name, habit_type, target_value, cumulative, cumulative_goal, cumulative_period, habit_id)
        )
        return {"message": "Habit updated"}

def delete_habit(habit_id):
    """Delete habit and all its history."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
        cursor.execute("DELETE FROM habit_history WHERE habit_id = ?", (habit_id,))

def get_habit_history(habit_id):
    """Get habit completion history ordered by date."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT date, completed, value FROM habit_history WHERE habit_id = ? ORDER BY date ASC",
            (habit_id,)
        )
        return [
            {"date": row[0], "completed": bool(row[1]), "value": row[2]}
            for row in cursor.fetchall()
        ]

def update_habit_completion(habit_id, completed, value, date):
    """
    Update habit completion status for a specific date.
    Handles sequence locking and different habit types.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get habit info
        cursor.execute("SELECT type, cumulative, sequence_id, step_order FROM habits WHERE id = ?", (habit_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError("Habit not found")
        
        habit_type, cumulative, sequence_id, step_order = row
        
        # Check sequence locking
        if step_order > 0:
            cursor.execute("SELECT id FROM habits WHERE sequence_id = ? AND step_order = ?", (sequence_id, step_order - 1))
            prev_row = cursor.fetchone()
            if prev_row:
                prev_id = prev_row[0]
                cursor.execute("SELECT completed FROM habit_history WHERE habit_id = ? AND date = ?", (prev_id, date))
                prev_completed = cursor.fetchone()
                if not prev_completed or not prev_completed[0]:
                    raise ValueError("Previous step in sequence not completed")
        
        # Handle different habit types
        if habit_type in ("counter", "entry") or cumulative:
            if completed == 0 and value == 0:
                # Reset progress for the day
                cursor.execute("DELETE FROM habit_history WHERE habit_id = ? AND date = ?", (habit_id, date))
            elif value != 0:
                # Add progress
                cursor.execute(
                    "INSERT INTO habit_history (habit_id, date, completed, value) VALUES (?, ?, ?, ?)",
                    (habit_id, date, 1, value)
                )
        else:
            # Binary/reverse_binary habits
            cursor.execute("SELECT id FROM habit_history WHERE habit_id = ? AND date = ?", (habit_id, date))
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute(
                    "UPDATE habit_history SET completed = ?, value = ? WHERE habit_id = ? AND date = ?",
                    (completed, value, habit_id, date)
                )
            else:
                cursor.execute(
                    "INSERT INTO habit_history (habit_id, date, completed, value) VALUES (?, ?, ?, ?)",
                    (habit_id, date, completed, value)
                )
        
        return {"message": "Habit completion status updated"}

def get_cumulative_progress(habit_id, period):
    """
    Get cumulative progress for habit over specified period.
    
    Args:
        habit_id: Habit ID
        period: 'weekly', 'monthly', or 'yearly'
    """
    today = datetime.date.today()
    
    if period == 'weekly':
        start = today - datetime.timedelta(days=today.weekday())
    elif period == 'monthly':
        start = today.replace(day=1)
    elif period == 'yearly':
        start = today.replace(month=1, day=1)
    else:
        raise ValueError("Invalid period")
    
    start_str = start.isoformat()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date >= ?",
            (habit_id, start_str)
        )
        total = cursor.fetchone()[0] or 0
        return {"progress": total}

