"""Handles Sequence CRUD operations"""

"""
Sequence management service.
"""

import datetime
from database.connection import get_db_connection

def get_all_sequences():
    """Get all sequences with basic info."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, color, category_id, date_created FROM sequences")
        return [
            {
                "id": row[0],
                "name": row[1],
                "color": row[2],
                "category_id": row[3],
                "date_created": row[4]
            }
            for row in cursor.fetchall()
        ]

def create_sequence(name, color='gray', category_id=1):
    """Create new sequence."""
    date_created = datetime.date.today().isoformat()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sequences (name, color, category_id, date_created) VALUES (?, ?, ?, ?)",
            (name, color, category_id, date_created)
        )
        return {"id": cursor.lastrowid, "message": "Sequence added successfully"}

def get_sequence_with_status(sequence_id):
    """Get sequence with today's completion status for all habits."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get sequence info
        cursor.execute("SELECT id, name, color, category_id, date_created FROM sequences WHERE id = ?", (sequence_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError("Sequence not found")
        
        seq_id, name, color, category_id, date_created = row
        today = datetime.date.today().isoformat()
        
        # Get habits with completion status
        cursor.execute(
            "SELECT id, step_order, name, type, target_value, cumulative, cumulative_goal, cumulative_period FROM habits WHERE sequence_id = ? ORDER BY step_order ASC",
            (seq_id,)
        )
        
        steps = []
        for hrow in cursor.fetchall():
            hid, step_order, hname, htype, htarget_value, hcumulative, hcumulative_goal, hcumulative_period = hrow
            
            # Calculate completion status
            if htype in ("counter", "entry") or hcumulative:
                cursor.execute("SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date = ?", (hid, today))
                value = cursor.fetchone()[0] or 0
                completed = value >= (htarget_value or 1)
            else:
                cursor.execute("SELECT completed, value FROM habit_history WHERE habit_id = ? AND date = ?", (hid, today))
                result = cursor.fetchone()
                completed = bool(result[0]) if result else False
                value = result[1] if result else 0
            
            steps.append({
                "id": hid,
                "step_order": step_order,
                "name": hname,
                "type": htype,
                "target_value": htarget_value,
                "cumulative": hcumulative,
                "cumulative_goal": hcumulative_goal,
                "cumulative_period": hcumulative_period,
                "completed": completed,
                "value": value
            })
        
        return {
            "id": seq_id,
            "name": name,
            "color": color,
            "category_id": category_id,
            "date_created": date_created,
            "steps": steps
        }

def update_sequence(sequence_id, name, color, category_id):
    """Update sequence details."""
    if not name:
        raise ValueError("Missing fields")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE sequences SET name = ?, color = ?, category_id = ? WHERE id = ?",
            (name, color, category_id, sequence_id)
        )
        return {"message": "Sequence updated"}

def delete_sequence(sequence_id):
    """Delete sequence and all associated habits/history."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get habit IDs to delete history
        cursor.execute("SELECT id FROM habits WHERE sequence_id = ?", (sequence_id,))
        habit_ids = [row[0] for row in cursor.fetchall()]
        
        # Delete history for all habits
        for hid in habit_ids:
            cursor.execute("DELETE FROM habit_history WHERE habit_id = ?", (hid,))
        
        # Delete habits and sequence
        cursor.execute("DELETE FROM habits WHERE sequence_id = ?", (sequence_id,))
        cursor.execute("DELETE FROM sequences WHERE id = ?", (sequence_id,))

def get_sequences_by_date(date):
    """Get all sequences with completion status for specific date."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, color, category_id, date_created FROM sequences")
        
        sequences = []
        for row in cursor.fetchall():
            seq_id, name, color, category_id, date_created = row
            
            # Get habits with completion status for date
            cursor.execute(
                "SELECT id, step_order, name, type, target_value, cumulative, cumulative_goal, cumulative_period FROM habits WHERE sequence_id = ? ORDER BY step_order ASC",
                (seq_id,)
            )
            
            steps = []
            for hrow in cursor.fetchall():
                hid, step_order, hname, htype, htarget_value, hcumulative, hcumulative_goal, hcumulative_period = hrow
                
                # Calculate completion for date
                if htype in ("counter", "entry") or hcumulative:
                    cursor.execute("SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date = ?", (hid, date))
                    value = cursor.fetchone()[0] or 0
                    completed = value >= (htarget_value or 1)
                else:
                    cursor.execute("SELECT completed, value FROM habit_history WHERE habit_id = ? AND date = ?", (hid, date))
                    result = cursor.fetchone()
                    if htype == "reverse_binary":
                        completed = True if result is None else bool(result[0])
                    else:
                        completed = bool(result[0]) if result else False
                    value = result[1] if result else 0
                
                steps.append({
                    "id": hid,
                    "step_order": step_order,
                    "name": hname,
                    "type": htype,
                    "target_value": htarget_value,
                    "cumulative": hcumulative,
                    "cumulative_goal": hcumulative_goal,
                    "cumulative_period": hcumulative_period,
                    "completed": completed,
                    "value": value
                })
            
            sequences.append({
                "id": seq_id,
                "name": name,
                "color": color,
                "category_id": category_id,
                "date_created": date_created,
                "steps": steps
            })
        
        return sequences

