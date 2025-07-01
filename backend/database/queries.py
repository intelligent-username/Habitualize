"A collection of (reusable) queries for app.py."

# FETCHING (SELECT) queries
# --------------------------
FETCH_HABITS_BY_SEQUENCE_ID = """
        SELECT id, sequence_id, step_order, name, type, target_value,
        date_created, cumulative, cumulative_goal, cumulative_period, icon
        FROM habits WHERE sequence_id = ? 
        ORDER BY step_order ASC
"""

FETCH_HABITS_IN_SEQUENCE = """
        SELECT id, step_order, name, type, target_value, cumulative, 
        cumulative_goal, cumulative_period, icon FROM habits 
        WHERE sequence_id = ? ORDER BY step_order ASC
"""

FETCH_UPDATED_HAB =  """
        SELECT name, type, target_value, cumulative, cumulative_goal, 
        cumulative_period, sequence_id, step_order, icon 
        FROM habits WHERE id = ?
"""

FETCH_SEQUENCE_BY_ID = "SELECT id, name, color, category_id, date_created FROM sequences WHERE id = ?"

FETCH_ALL_CATEGORIES = "SELECT id, name FROM categories ORDER BY id ASC"

FETCH_HAB = "SELECT id FROM habits WHERE sequence_id = ?"

FETCH_HABIT_HISTORY_ENTRY = "SELECT id FROM habit_history WHERE habit_id = ? AND date = ?"

FETCH_SEQ_HAB = "SELECT id FROM habits WHERE sequence_id = ? AND step_order = ?"

FETCH_ALL_SEQUENCES ="SELECT id, name, color, category_id, date_created FROM sequences"

FETCH_HABIT_HISTORY = "SELECT date, completed, value FROM habit_history WHERE habit_id = ? ORDER BY date ASC"

FETCH_HABIT_COMPLETION_STATUS = "SELECT completed FROM habit_history WHERE habit_id = ? AND date = ?"

FETCH_COMPLETION = "SELECT completed, value FROM habit_history WHERE habit_id = ? AND date = ?"

FETCH_SUM_SO_FAR  = "SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date = ?"

FETCH_CUMULATIVE_SO_FAR = "SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date >= ?"

FETCH_TYPE_AND_CUMULATIVE = "SELECT type, cumulative FROM habits WHERE id = ?"

FETCH_HABIT_GOAL_DETAILS = "SELECT cumulative_goal, cumulative_period FROM habits WHERE id = ?"

FETCH_SEQ = "SELECT sequence_id, step_order FROM habits WHERE id = ?"

FETCH_SEQ_DATA = "SELECT color, category_id FROM sequences WHERE id = ?"


# MAKE (INSERT) queries
# -------------------------- 
MAKE_HABIT = """
INSERT INTO habits (
    sequence_id, step_order, name, type, target_value, 
    date_created, cumulative, cumulative_goal, cumulative_period, icon
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

MAKE_CATEGORY = "INSERT INTO categories (name) VALUES (?)"

MAKE_SEQUENCE = "INSERT INTO sequences (name, color, category_id, date_created) VALUES (?, ?, ?, ?)"

MAKE_CONTRIBUTION = "INSERT INTO habit_history (habit_id, date, completed, value) VALUES (?, ?, ?, ?)"

# Pomodoro session queries
MAKE_POMODORO_SESSION = """
INSERT INTO pomodoro_sessions (duration_minutes, time_started, completed)
VALUES (?, ?, ?)
"""

FINISH_POMODORO_SESSION = """
UPDATE pomodoro_sessions SET time_finished = ?, completed = ? WHERE id = ?
"""

FETCH_POMODORO_STATS = """
SELECT * FROM pomodoro_sessions WHERE date(time_started) = date('now', ?)
"""


# DELETE queries
# --------------------------
DEL_HISTORY = "DELETE FROM habit_history WHERE habit_id = ?"

DEL_HISTORY_BY_DATE = "DELETE FROM habit_history WHERE habit_id = ? AND date = ?"

DEL_HABIT_S = "DELETE FROM habits WHERE sequence_id = ?"

DEL_HABIT = "DELETE FROM habits WHERE id = ?"

DEL_SEQ = "DELETE FROM sequences WHERE id = ?"

DEL_CAT = "DELETE FROM categories WHERE id = ?"


# UPDATE queries
# --------------------------
UPDATE_HABIT = """UPDATE habits 
        SET name = ?, type = ?, target_value = ?, cumulative = ?, 
            cumulative_goal = ?, cumulative_period = ?, sequence_id = ?, step_order = ?, icon = ?
        WHERE id = ?
"""

UPDATE_CAT_IN_DB = "UPDATE categories SET name = ? WHERE id = ?"

UPDATE_HABIT_HISTORY_ENTRY = "UPDATE habit_history SET completed = ?, value = ? WHERE habit_id = ? AND date = ?"

UPDATE_SEQ = "UPDATE sequences SET name = ?, color = ?, category_id = ? WHERE id = ?"

UPDATE_HAB_CATS = "UPDATE sequences SET category_id = 1 WHERE category_id = ?" 
    # When a category is deleted, move all habits that were WITHIN that category to the default category (1)

def insert_pomodoro_session(duration_minutes, time_started):
    from .connection import get_db
    db = get_db()
    cur = db.cursor()
    cur.execute(MAKE_POMODORO_SESSION, (duration_minutes, time_started, False))
    db.commit()
    return cur.lastrowid

def finish_pomodoro_session(session_id, time_finished, completed):
    from .connection import get_db
    db = get_db()
    db.execute(FINISH_POMODORO_SESSION, (time_finished, completed, session_id))
    db.commit()

def get_pomodoro_stats(range_type):
    from .connection import get_db
    db = get_db()
    if range_type == 'today':
        cur = db.execute(FETCH_POMODORO_STATS, ('localtime',))
    elif range_type == 'week':
        cur = db.execute("SELECT * FROM pomodoro_sessions WHERE date(time_started) >= date('now', '-6 days')")
    else:
        cur = db.execute("SELECT * FROM pomodoro_sessions")
    return [dict(row) for row in cur.fetchall()]

