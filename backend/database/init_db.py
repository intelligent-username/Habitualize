"""Initializes Databases"""


from .connection import get_db_connection

def init_db():
    """
    Initialize database with required tables and default data.
    Creates categories, sequences, habits, and habit_history tables.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Categories table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        ''')
        cursor.execute("INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'default')")
        
        # Sequences table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sequences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                color TEXT DEFAULT 'gray',
                category_id INTEGER,
                date_created TEXT NOT NULL,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        ''')
        
        # Habits table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS habits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sequence_id INTEGER NOT NULL,
                step_order INTEGER NOT NULL,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'binary',
                target_value REAL,
                date_created TEXT NOT NULL,
                cumulative INTEGER DEFAULT 0,
                cumulative_goal REAL,
                cumulative_period TEXT,
                FOREIGN KEY (sequence_id) REFERENCES sequences(id)
            )
        ''')
        
        # Habit history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS habit_history (
                id INTEGER PRIMARY KEY,
                habit_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                completed INTEGER NOT NULL,
                value REAL DEFAULT 0,
                FOREIGN KEY (habit_id) REFERENCES habits (id)
            )
        ''')
        
        # Migration: add value column if missing
        try:
            cursor.execute("ALTER TABLE habit_history ADD COLUMN value REAL DEFAULT 0;")
        except Exception:
            pass


