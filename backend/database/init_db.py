"""
Initializes Databases
Expand as needed
"""

# Libraries
import sqlite3
from flask import current_app



def init_db():
    path = current_app.config['DATABASE']
    conn = sqlite3.connect(path)
    c = conn.cursor()
    # Categories table
    c.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    ''')
    c.execute("INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'default')")
    # Sequences table
    c.execute('''
        CREATE TABLE IF NOT EXISTS sequences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT DEFAULT 'gray',
            category_id INTEGER,
            date_created TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    ''')
    # Habits table (steps in a sequence, or single habits)
    c.execute('''
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
            icon TEXT DEFAULT 'default.svg',
            FOREIGN KEY (sequence_id) REFERENCES sequences(id)
        )
    ''')
    # Habit history table
    c.execute('''
        CREATE TABLE IF NOT EXISTS habit_history (
            id INTEGER PRIMARY KEY,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            completed INTEGER NOT NULL,
            value REAL DEFAULT 0,
            FOREIGN KEY (habit_id) REFERENCES habits (id)
        )
    ''')
    conn.commit()

# def run_migrations(conn):
#     c = conn.cursor()
#     # Migration: add icon column to habits if missing
#     try:
#         c.execute("ALTER TABLE habits ADD COLUMN icon TEXT DEFAULT 'default.svg'")
#     except sqlite3.OperationalError:
#         pass  # Column already exists
#     # Migration: add value column to habit_history if missing
#     try:
#         c.execute("ALTER TABLE habit_history ADD COLUMN value REAL DEFAULT 0;")
#     except sqlite3.OperationalError:
#         pass  # Column already exists

# if __name__ == '__main__':
#     path = '..data.db'
#     conn = sqlite3.connect(path)
#     run_migrations(conn)
#     conn.commit()
#     conn.close()
