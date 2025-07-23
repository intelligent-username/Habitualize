"""
Helper to load quotes from raw_quotes.txt into the quotes table in data.db
"""

import sqlite3
import os
from flask import current_app, has_app_context


def strip_outer_quotes(s):
    s = s.strip()
    # Remove leading and trailing Unicode or ASCII quotes
    while s and (s[0] in ['"', "'", '“', '”', '‘', '’']):
        s = s[1:]
    while s and (s[-1] in ['"', "'", '“', '”', '‘', '’']):
        s = s[:-1]
    return s.strip()


def load_quotes(c, quotes_path):
    with open(quotes_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Split into blocks by two or more newlines
    blocks = [block.strip() for block in content.split('\n\n') if block.strip()]
    for block in blocks:
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        if not lines:
            continue
        # Source is last line if it starts with – or -
        if lines[-1].startswith('–') or lines[-1].startswith('-'):
            source = lines[-1].lstrip('–-').strip()
            quote_lines = lines[:-1]
        else:
            source = ''
            quote_lines = lines
        quote = ' '.join(quote_lines)
        quote = strip_outer_quotes(quote)
        c.execute('''INSERT OR IGNORE INTO quotes (quote, source) VALUES (?, ?)''', (quote, source))


if __name__ == "__main__":
    # Example usage for CLI
    import shutil
    appdata = os.environ.get('LOCALAPPDATA') or os.environ.get('APPDATA')
    user_db_dir = os.path.join(appdata, "Habitualize")
    os.makedirs(user_db_dir, exist_ok=True)
    db_path = os.path.join(user_db_dir, "data.db")
    # If the DB doesn't exist, copy it from the install directory
    install_db_path = os.path.join(os.path.dirname(__file__), '..', 'data.db')
    if not os.path.exists(db_path) and os.path.exists(install_db_path):
        shutil.copy2(install_db_path, db_path)
    quotes_path = os.path.join(os.path.dirname(__file__), '..', 'raw_quotes.txt')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    load_quotes(c, quotes_path)
    conn.commit()
    conn.close()
