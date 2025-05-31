"""DB connection context manager"""

"""
Database connection management with context manager.
"""

import sqlite3
from contextlib import contextmanager

DB_PATH = 'data.db'

@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Automatically handles connection opening/closing and commit/rollback.
    
    Example:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM categories")
    """
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

