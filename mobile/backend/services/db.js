const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../data.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Failed to open SQLite DB:', err);
  else console.log('SQLite DB opened at', dbPath);
});

/**
 * Run a SQLite query.
 * @param {string} sql - The SQL statement.
 * @param {Array} params - Parameters for the statement.
 * @param {string} fetch - 'all' (default), 'one', or 'run' for non‑select.
 */
function runQuery(sql, params = [], fetch = 'all') {
  return new Promise((resolve, reject) => {
    const callback = (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    };
    if (fetch === 'one') {
      db.get(sql, params, callback);
    } else if (fetch === 'all') {
      db.all(sql, params, callback);
    } else {
      // run for INSERT/UPDATE/DELETE
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    }
  });
}

module.exports = { runQuery };
