"""DB connection context manager"""

import sqlite3
from flask import current_app, g
# from contextlib import contextmanager

DB_PATH = 'data.db'

# Open a single persistent connection for the lifetime of the Flask app, not needed anymore but keep for reference (delete later)
# New calls will connect to a cursor from this one
# persistent_conn = sqlite3.connect(DB_PATH, check_same_thread=False)

# @contextmanager
# def get_db_connection():
#     """
#     Context manager for database connections.
#     Automatically handles connection opening/closing and commit/rollback.
    
#     Example:
#         with get_db_connection() as conn:
#             cursor = conn.cursor()
#             cursor.execute("SELECT * FROM categories")
#     """
#     conn = sqlite3.connect(DB_PATH)
#     try:
#         yield conn
#     finally:
#         conn.close()

def get_db():
    """
    Connect to the application's configured database.
    The connection is unique for each request and will be reused if called again.
    """
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row  # <-- HUGE improvement: access results by column name

    return g.db

def close_db(e=None):
    """
    If this request connected to the database, close the connection.
    """
    db = g.pop('db', None)

    if db is not None:
        db.close()

def run_query(sql, params=None, fetch='all'):
    """
    Execute a SQL statement with automatic connection handling (single persistent connection).
    Automatically commits on INSERT/UPDATE/DELETE and rolls back on error.
     - sql: SQL query string.
    - params: tuple of parameters for the query. Must match number of '?' in `sql`.
    - fetch: 'all' for fetchall(), 'one' for fetchone(), or None for no result
    Returns query result or lastrowid for INSERT.
    """
    db = get_db()
    cursor = db.cursor()
    try:

        cursor.execute(sql, params or ())
        upper_sql = sql.strip().upper()

        if upper_sql.startswith('SELECT'):
            return cursor.fetchone() if fetch == 'one' else cursor.fetchall()

        db.commit()
        if upper_sql.startswith('INSERT'):
            return cursor.lastrowid
        return None

    except sqlite3.Error as e:
        current_app.logger.error(f"Database error during query: {e}")

        # Rollback is not necessary (handled by Flask's teardown), but this is future-proof
        db = get_db()
        db.rollback()

        raise

