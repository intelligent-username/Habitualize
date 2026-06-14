// Query definitions for mobile backend (CommonJS)

// SELECT queries
const FETCH_HABITS_BY_SEQUENCE_ID = `
    SELECT id, sequence_id, step_order, name, type, target_value,
    date_created, cumulative, cumulative_goal, cumulative_period, icon
    FROM habits WHERE sequence_id = ? 
    ORDER BY step_order ASC`;

const FETCH_HABITS_IN_SEQUENCE = `
    SELECT id, step_order, name, type, target_value, cumulative, 
    cumulative_goal, cumulative_period, icon FROM habits 
    WHERE sequence_id = ? ORDER BY step_order ASC`;

const FETCH_UPDATED_HAB = `
    SELECT name, type, target_value, cumulative, cumulative_goal, 
    cumulative_period, sequence_id, step_order, icon 
    FROM habits WHERE id = ?`;

const FETCH_SEQUENCE_BY_ID = "SELECT id, name, color, category_id, date_created FROM sequences WHERE id = ?";

const FETCH_ALL_SEQUENCES = "SELECT id, name, color, category_id, date_created FROM sequences";

const FETCH_ALL_CATEGORIES = "SELECT id, name FROM categories ORDER BY id ASC";

const FETCH_HAB = "SELECT id FROM habits WHERE sequence_id = ?";

const FETCH_HABIT_HISTORY_ENTRY = "SELECT id, value FROM habit_history WHERE habit_id = ? AND date = ?";

const FETCH_SEQ_HAB = "SELECT id FROM habits WHERE sequence_id = ? AND step_order = ?";

const FETCH_HABIT_HISTORY = "SELECT date, completed, value FROM habit_history WHERE habit_id = ? ORDER BY date ASC";

const FETCH_HABIT_COMPLETION_STATUS = "SELECT completed FROM habit_history WHERE habit_id = ? AND date = ?";

const FETCH_COMPLETION = "SELECT completed, value FROM habit_history WHERE habit_id = ? AND date = ?";

const FETCH_SUM_SO_FAR = "SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date = ?";

const FETCH_CUMULATIVE_SO_FAR = "SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date >= ? AND date <= ?";

const FETCH_TYPE_AND_CUMULATIVE = "SELECT type, cumulative, cumulative_goal FROM habits WHERE id = ?";

const FETCH_HABIT_GOAL_DETAILS = "SELECT cumulative_goal, cumulative_period FROM habits WHERE id = ?";

const FETCH_SEQ = "SELECT sequence_id, step_order FROM habits WHERE id = ?";

const FETCH_SEQ_DATA = "SELECT color, category_id FROM sequences WHERE id = ?";

const FETCH_POMODORO_DAY = "SELECT * FROM pomodoro_sessions WHERE date(time_started) = date(?)";

const FETCH_POMODORO_WEEK = "SELECT * FROM pomodoro_sessions WHERE date(time_started) >= date(?) AND date(time_started) <= date(?)";

const FETCH_POMODORO_MON = "SELECT * FROM pomodoro_sessions WHERE strftime('%Y-%m', time_started) = ?";

const FETCH_POMODORO_ALL = "SELECT * FROM pomodoro_sessions";

const FIND_FIRST_POM = "SELECT MIN(date(time_started)) as earliest_date FROM pomodoro_sessions";

const FETCH_DAY_STREAK = "SELECT DISTINCT date(time_started) as d FROM pomodoro_sessions WHERE completed = 1 AND date(time_started) <= date('now') ORDER BY d DESC";

const FETCH_WEEK_STREAK = "SELECT DISTINCT strftime('%Y-%W', time_started) as w FROM pomodoro_sessions WHERE completed = 1 AND date(time_started) <= date('now') ORDER BY w DESC";

const FETCH_QOTD = "SELECT id, quote, source FROM quotes WHERE date_used = ?";

const CHOOSE_QOTD = "SELECT id, quote, source FROM quotes WHERE used = 0";

const FETCH_ALL_SETTINGS = "SELECT setting_key, setting_value, setting_type, description FROM user_settings";

const FETCH_SETTING_BY_KEY = "SELECT setting_value, setting_type FROM user_settings WHERE setting_key = ?";

const GET_COMPLETIONS_TREND_DAILY = `
    SELECT DATE(h.date) as period, COUNT(*) as count
    FROM habit_history h
    JOIN habits hab ON h.habit_id = hab.id
    WHERE h.completed = 1 AND h.date BETWEEN ? AND ?
    AND (
        (hab.type IN ('binary', 'reverse_binary', 'timer', 'entry') AND h.completed = 1)
        OR (hab.type = 'counter' AND h.value >= hab.target_value AND h.completed = 1)
    )
    GROUP BY DATE(h.date)
    ORDER BY DATE(h.date)`;

const GET_COMPLETIONS_TREND_WEEKLY = `
    SELECT strftime('%Y-W%W', h.date) as period, COUNT(*) as count
    FROM habit_history h
    JOIN habits hab ON h.habit_id = hab.id
    WHERE h.completed = 1 AND h.date BETWEEN ? AND ?
    AND (
        (hab.type IN ('binary', 'reverse_binary', 'timer', 'entry') AND h.completed = 1)
        OR (hab.type = 'counter' AND h.value >= hab.target_value AND h.completed = 1)
    )
    GROUP BY strftime('%Y-W%W', h.date)
    ORDER BY strftime('%Y-W%W', h.date)`;

const GET_COMPLETIONS_TREND_MONTHLY = `
    SELECT strftime('%Y-%m', h.date) as period, COUNT(*) as count
    FROM habit_history h
    JOIN habits hab ON h.habit_id = hab.id
    WHERE h.completed = 1 AND h.date BETWEEN ? AND ?
    AND (
        (hab.type IN ('binary', 'reverse_binary', 'timer', 'entry') AND h.completed = 1)
        OR (hab.type = 'counter' AND h.value >= hab.target_value AND h.completed = 1)
    )
    GROUP BY strftime('%Y-%m', h.date)
    ORDER BY strftime('%Y-%m', h.date)`;

const GET_HABIT_CONSISTENCY = `
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
ORDER BY c.name, s.name, h.name`;

const GET_HABIT_DETAILS = `
SELECT h.name, h.type, s.name as category
FROM habits h
LEFT JOIN sequences s ON h.sequence_id = s.id
WHERE h.id = ?`;

const GET_HABIT_DETAILS_STATS = `
SELECT 
    COUNT(DISTINCT CASE WHEN hh.completed = 1 THEN hh.date END) as completed_days,
    MIN(CASE WHEN hh.completed = 1 THEN hh.date END) as first_completed,
    MAX(hh.date) as last_tracked
FROM habit_history hh
WHERE hh.habit_id = ?`;

// INSERT queries
const MAKE_HABIT = `
INSERT INTO habits (
    sequence_id, step_order, name, type, target_value, 
    date_created, cumulative, cumulative_goal, cumulative_period, icon
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const MAKE_CATEGORY = "INSERT INTO categories (name) VALUES (?)";

const MAKE_SEQUENCE = "INSERT INTO sequences (name, color, category_id, date_created) VALUES (?, ?, ?, ?)";

const MAKE_CONTRIBUTION = "INSERT INTO habit_history (habit_id, date, completed, value) VALUES (?, ?, ?, ?)";

const MAKE_POMODORO_SESSION = "INSERT INTO pomodoro_sessions (goal_duration_minutes, time_started, completed) VALUES (?, ?, ?)";

const MAKE_SETT = "INSERT INTO user_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)";

// DELETE queries
const DEL_HISTORY = "DELETE FROM habit_history WHERE habit_id = ?";
const DEL_HISTORY_BY_DATE = "DELETE FROM habit_history WHERE habit_id = ? AND date = ?";
const DEL_HABIT_S = "DELETE FROM habits WHERE sequence_id = ?";
const DEL_HABIT = "DELETE FROM habits WHERE id = ?";
const DEL_SEQ = "DELETE FROM sequences WHERE id = ?";
const DEL_CAT = "DELETE FROM categories WHERE id = ?";

// UPDATE queries
const UPDATE_HABIT = `
UPDATE habits 
    SET name = ?, type = ?, target_value = ?, cumulative = ?, 
        cumulative_goal = ?, cumulative_period = ?, sequence_id = ?, step_order = ?, icon = ?
    WHERE id = ?`;

const UPDATE_CAT_IN_DB = "UPDATE categories SET name = ? WHERE id = ?";

const UPDATE_HABIT_HISTORY_ENTRY = "UPDATE habit_history SET completed = ?, value = ? WHERE habit_id = ? AND date = ?";

const UPDATE_SEQ = `
    UPDATE sequences
    SET name = COALESCE(NULLIF(:name, ''), name),
        color = COALESCE(NULLIF(:color, ''), color),
        category_id = COALESCE(:category_id, category_id)
    WHERE id = :sequence_id`;

const UPDATE_HAB_CATS = "UPDATE sequences SET category_id = ? WHERE category_id = ?";

const FINISH_POMODORO_SESSION = "UPDATE pomodoro_sessions SET time_finished = ?, completed = ?, time_completed = ? WHERE id = ?";

const MARK_QUOTES = "UPDATE quotes SET used = 0, date_used = NULL";
const USE_QUOTE = "UPDATE quotes SET used = 1, date_used = ? WHERE id = ?";
const UPDATE_SETTING = "UPDATE user_settings SET setting_value = ?, setting_type = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?";

module.exports = {
  FETCH_HABITS_BY_SEQUENCE_ID,
  FETCH_HABITS_IN_SEQUENCE,
  FETCH_UPDATED_HAB,
  FETCH_SEQUENCE_BY_ID,
  FETCH_ALL_SEQUENCES,
  FETCH_ALL_CATEGORIES,
  FETCH_HAB,
  FETCH_HABIT_HISTORY_ENTRY,
  FETCH_SEQ_HAB,
  FETCH_HABIT_HISTORY,
  FETCH_HABIT_COMPLETION_STATUS,
  FETCH_COMPLETION,
  FETCH_SUM_SO_FAR,
  FETCH_CUMULATIVE_SO_FAR,
  FETCH_TYPE_AND_CUMULATIVE,
  FETCH_HABIT_GOAL_DETAILS,
  FETCH_SEQ,
  FETCH_SEQ_DATA,
  FETCH_POMODORO_DAY,
  FETCH_POMODORO_WEEK,
  FETCH_POMODORO_MON,
  FETCH_POMODORO_ALL,
  FIND_FIRST_POM,
  FETCH_DAY_STREAK,
  FETCH_WEEK_STREAK,
  FETCH_QOTD,
  CHOOSE_QOTD,
  FETCH_ALL_SETTINGS,
  FETCH_SETTING_BY_KEY,
  GET_COMPLETIONS_TREND_DAILY,
  GET_COMPLETIONS_TREND_WEEKLY,
  GET_COMPLETIONS_TREND_MONTHLY,
  GET_HABIT_CONSISTENCY,
  GET_HABIT_DETAILS,
  GET_HABIT_DETAILS_STATS,
  MAKE_HABIT,
  MAKE_CATEGORY,
  MAKE_SEQUENCE,
  MAKE_CONTRIBUTION,
  MAKE_POMODORO_SESSION,
  MAKE_SETT,
  DEL_HISTORY,
  DEL_HISTORY_BY_DATE,
  DEL_HABIT_S,
  DEL_HABIT,
  DEL_SEQ,
  DEL_CAT,
  UPDATE_HABIT,
  UPDATE_CAT_IN_DB,
  UPDATE_HABIT_HISTORY_ENTRY,
  UPDATE_SEQ,
  UPDATE_HAB_CATS,
  FINISH_POMODORO_SESSION,
  MARK_QUOTES,
  USE_QUOTE,
  UPDATE_SETTING,
};
