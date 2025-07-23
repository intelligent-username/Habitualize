"A collection of (reusable) queries for app.py."
# ---------------------------------------------
# ------------------------------------
#     FETCHING (SELECT) queries
# ------------------------------------
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

FETCH_HABIT_HISTORY_ENTRY = "SELECT id, value FROM habit_history WHERE habit_id = ? AND date = ?"

FETCH_SEQ_HAB = "SELECT id FROM habits WHERE sequence_id = ? AND step_order = ?"

FETCH_ALL_SEQUENCES ="SELECT id, name, color, category_id, date_created FROM sequences"

FETCH_HABIT_HISTORY = "SELECT date, completed, value FROM habit_history WHERE habit_id = ? ORDER BY date ASC"

FETCH_HABIT_COMPLETION_STATUS = "SELECT completed FROM habit_history WHERE habit_id = ? AND date = ?"

FETCH_COMPLETION = "SELECT completed, value FROM habit_history WHERE habit_id = ? AND date = ?"

FETCH_SUM_SO_FAR  = "SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date = ?"

FETCH_CUMULATIVE_SO_FAR = "SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date >= ? AND date <= ?"

FETCH_TYPE_AND_CUMULATIVE = "SELECT type, cumulative, cumulative_goal FROM habits WHERE id = ?"

FETCH_HABIT_GOAL_DETAILS = "SELECT cumulative_goal, cumulative_period FROM habits WHERE id = ?"

FETCH_SEQ = "SELECT sequence_id, step_order FROM habits WHERE id = ?"

FETCH_SEQ_DATA = "SELECT color, category_id FROM sequences WHERE id = ?"

FETCH_POMODORO_DAY = "SELECT * FROM pomodoro_sessions WHERE date(time_started) = date(?)"

FETCH_POMODORO_WEEK = "SELECT * FROM pomodoro_sessions WHERE date(time_started) >= date(?) AND date(time_started) <= date(?)"

FETCH_POMODORO_MON = "SELECT * FROM pomodoro_sessions WHERE strftime('%Y-%m', time_started) = ?"

FETCH_POMODORO_ALL = "SELECT * FROM pomodoro_sessions"

FIND_FIRST_POM = "SELECT MIN(date(time_started)) as earliest_date FROM pomodoro_sessions"

FETCH_DAY_STREAK = "SELECT DISTINCT date(time_started) as d FROM pomodoro_sessions WHERE completed = 1 AND date(time_started) <= date('now') ORDER BY d DESC"

FETCH_WEEK_STREAK = "SELECT DISTINCT strftime('%Y-%W', time_started) as w FROM pomodoro_sessions WHERE completed = 1 AND date(time_started) <= date('now') ORDER BY w DESC"

FETCH_QOTD = "SELECT id, quote, source FROM quotes WHERE date_used = ?"

CHOOSE_QOTD = "SELECT id, quote, source FROM quotes WHERE used = 0"

FETCH_ALL_SETTINGS = "SELECT setting_key, setting_value, setting_type, description FROM user_settings"

FETCH_SETTING_BY_KEY = "SELECT setting_value, setting_type FROM user_settings WHERE setting_key = ?"

POM_CALC = "SELECT time_started, goal_duration_minutes FROM pomodoro_sessions WHERE id = ?"

POM_TIMER_CALC2 = "SELECT * FROM pomodoro_sessions WHERE date(datetime(time_started, 'localtime')) = date(?)"

POM_TIMER_CALC3 = "SELECT * FROM pomodoro_sessions WHERE date(datetime(time_started, 'localtime')) >= date(?) AND date(datetime(time_started, 'localtime')) <= date(?)"

FETCH_POM_LOC = "SELECT * FROM pomodoro_sessions WHERE strftime('%Y-%m', datetime(time_started, 'localtime')) = ?"

# ---------------------------------------------
# ------------------------------------
# MAKE (INSERT) queries
# ------------------------------------
MAKE_HABIT = """
INSERT INTO habits (
    sequence_id, step_order, name, type, target_value, 
    date_created, cumulative, cumulative_goal, cumulative_period, icon
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

MAKE_CATEGORY = "INSERT INTO categories (name) VALUES (?)"

MAKE_SEQUENCE = "INSERT INTO sequences (name, color, category_id, date_created) VALUES (?, ?, ?, ?)"

MAKE_CONTRIBUTION = "INSERT INTO habit_history (habit_id, date, completed, value) VALUES (?, ?, ?, ?)"

MAKE_POMODORO_SESSION = "INSERT INTO pomodoro_sessions (goal_duration_minutes, time_started, completed) VALUES (?, ?, ?)"

MAKE_SETT = "INSERT INTO user_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)"

GET_COMPLETIONS_TREND_DAILY = """
    SELECT DATE(h.date) as period, COUNT(*) as count
    FROM habit_history h
    JOIN habits hab ON h.habit_id = hab.id
    WHERE h.completed = 1 AND h.date BETWEEN ? AND ?
    AND (
        (hab.type IN ('binary', 'reverse_binary', 'timer', 'entry') AND h.completed = 1)
        OR (hab.type = 'counter' AND h.value >= hab.target_value AND h.completed = 1)
    )
    GROUP BY DATE(h.date)
    ORDER BY DATE(h.date)
"""

GET_COMPLETIONS_TREND_WEEKLY = """
    SELECT strftime('%Y-W%W', h.date) as period, COUNT(*) as count
    FROM habit_history h
    JOIN habits hab ON h.habit_id = hab.id
    WHERE h.completed = 1 AND h.date BETWEEN ? AND ?
    AND (
        (hab.type IN ('binary', 'reverse_binary', 'timer', 'entry') AND h.completed = 1)
        OR (hab.type = 'counter' AND h.value >= hab.target_value AND h.completed = 1)
    )
    GROUP BY strftime('%Y-W%W', h.date)
    ORDER BY strftime('%Y-W%W', h.date)
"""

GET_COMPLETIONS_TREND_MONTHLY = """
    SELECT strftime('%Y-%m', h.date) as period, COUNT(*) as count
    FROM habit_history h
    JOIN habits hab ON h.habit_id = hab.id
    WHERE h.completed = 1 AND h.date BETWEEN ? AND ?
    AND (
        (hab.type IN ('binary', 'reverse_binary', 'timer', 'entry') AND h.completed = 1)
        OR (hab.type = 'counter' AND h.value >= hab.target_value AND h.completed = 1)
    )
    GROUP BY strftime('%Y-%m', h.date)
    ORDER BY strftime('%Y-%m', h.date)
"""

GET_HABIT_CONSISTENCY = """
SELECT 
    h.id,
    h.name,
    h.type,
    h.target_value,
    h.cumulative,
    h.cumulative_goal,
    s.name as sequence_name,
    c.name as category_name,
    (SELECT COUNT(*) FROM habits h2 WHERE h2.sequence_id = h.sequence_id) as sequence_habit_count,
    MIN(CASE WHEN hh.completed = 1 THEN hh.date END) as first_completed_date,
    MAX(hh.date) as last_tracked_date,
    COUNT(DISTINCT CASE WHEN hh.completed = 1 THEN hh.date END) as completed_days
FROM habits h
LEFT JOIN habit_history hh ON h.id = hh.habit_id
LEFT JOIN sequences s ON h.sequence_id = s.id
LEFT JOIN categories c ON s.category_id = c.id
GROUP BY h.id, h.name, h.type, h.target_value, h.cumulative, h.cumulative_goal, s.name, c.name
HAVING MIN(CASE WHEN hh.completed = 1 THEN hh.date END) IS NOT NULL
ORDER BY c.name, s.name, h.name
"""

GET_HABIT_DETAILS = """
SELECT h.name, h.type, s.name as category
FROM habits h
LEFT JOIN sequences s ON h.sequence_id = s.id
WHERE h.id = ?
"""

GET_HABIT_DETAILS_STATS = """
SELECT 
    COUNT(DISTINCT CASE WHEN hh.completed = 1 THEN hh.date END) as completed_days,
    MIN(CASE WHEN hh.completed = 1 THEN hh.date END) as first_completed,
    MAX(hh.date) as last_tracked
FROM habit_history hh
WHERE hh.habit_id = ?
"""

# ---------------------------------------------
# ------------------------------------
#          DELETE queries
# ------------------------------------
DEL_HISTORY = "DELETE FROM habit_history WHERE habit_id = ?"

DEL_HISTORY_BY_DATE = "DELETE FROM habit_history WHERE habit_id = ? AND date = ?"

DEL_HABIT_S = "DELETE FROM habits WHERE sequence_id = ?"

DEL_HABIT = "DELETE FROM habits WHERE id = ?"

DEL_SEQ = "DELETE FROM sequences WHERE id = ?"

DEL_CAT = "DELETE FROM categories WHERE id = ?"

# ---------------------------------------------
# ------------------------------------
# UPDATE queries
# ------------------------------------
UPDATE_HABIT = """UPDATE habits 
        SET name = ?, type = ?, target_value = ?, cumulative = ?, 
            cumulative_goal = ?, cumulative_period = ?, sequence_id = ?, step_order = ?, icon = ?
        WHERE id = ?
"""

UPDATE_CAT_IN_DB = "UPDATE categories SET name = ? WHERE id = ?"

UPDATE_HABIT_HISTORY_ENTRY = "UPDATE habit_history SET completed = ?, value = ? WHERE habit_id = ? AND date = ?"

UPDATE_SEQ = "UPDATE sequences SET name = ?, color = ?, category_id = ? WHERE id = ?"

UPDATE_HAB_CATS = "UPDATE sequences SET category_id = ? WHERE category_id = ?" 
    # When a category is deleted, move all habits that were WITHIN that category to the default category

FINISH_POMODORO_SESSION = "UPDATE pomodoro_sessions SET time_finished = ?, completed = ?, time_completed = ? WHERE id = ?"

MARK_QUOTES = "UPDATE quotes SET used = 0, date_used = NULL"

USE_QUOTE = "UPDATE quotes SET used = 1, date_used = ? WHERE id = ?"

UPDATE_SETTING = "UPDATE user_settings SET setting_value = ?, setting_type = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?"

UPDATE_SEQ = """
        UPDATE sequences
        SET name = COALESCE(NULLIF(:name, ''), name),
                color = COALESCE(NULLIF(:color, ''), color),
                category_id = COALESCE(:category_id, category_id)
        WHERE id = :sequence_id
"""

