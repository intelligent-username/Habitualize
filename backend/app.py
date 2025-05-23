from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import datetime

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('habits.db')
    c = conn.cursor()
    # Categories table
    c.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    ''')
    # Insert default category if not exists
    c.execute("INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'default')")
    # Habits table
    c.execute('''
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            date_created TEXT NOT NULL,
            color TEXT DEFAULT 'gray',
            category_id INTEGER DEFAULT 1,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    ''')
    # Habit history table
    c.execute('''
        CREATE TABLE IF NOT EXISTS habit_history (
            id INTEGER PRIMARY KEY,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            completed INTEGER NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits (id)
        )
    ''')
    # Ensure all habits have a category_id
    c.execute("UPDATE habits SET category_id = 1 WHERE category_id IS NULL")
    conn.commit()
    conn.close()

@app.route('/habits', methods=['GET'])
def get_habits():
    try:
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        today = datetime.date.today().isoformat()
        c.execute("SELECT id, name, date_created, color, category_id FROM habits")
        habits = []
        for row in c.fetchall():
            habit_id, name, date_created, color, category_id = row
            c.execute(
                "SELECT completed FROM habit_history WHERE habit_id = ? AND date = ?",
                (habit_id, today)
            )
            result = c.fetchone()
            completed = bool(result[0]) if result else False
            habits.append({
                "id": habit_id,
                "name": name,
                "date_created": date_created,
                "color": color,
                "category_id": category_id,
                "completed": completed
            })
        conn.close()
        return jsonify(habits)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/habits', methods=['POST'])
def add_habit():
    try:
        data = request.json
        name = data.get('name')
        color = data.get('color', 'gray')
        category_id = data.get('category_id', 1)
        if not name:
            return jsonify({"error": "Habit name is required"}), 400
        date_created = datetime.date.today().isoformat()
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute(
            "INSERT INTO habits (name, date_created, color, category_id) VALUES (?, ?, ?, ?)",
            (name, date_created, color, category_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Habit added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/habits/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    try:
        data = request.json
        name = data.get('name')
        color = data.get('color')
        category_id = data.get('category_id')
        if not name or not color or not category_id:
            return jsonify({"error": "Missing fields"}), 400
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute(
            "UPDATE habits SET name = ?, color = ?, category_id = ? WHERE id = ?",
            (name, color, category_id, habit_id)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Habit updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    try:
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
        c.execute("DELETE FROM habit_history WHERE habit_id = ?", (habit_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Habit deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/habits/<int:habit_id>/history', methods=['PUT'])
def toggle_habit_completion(habit_id):
    try:
        data = request.json
        completed = int(data.get('completed', 0))
        date = data.get('date') or datetime.date.today().isoformat()
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute(
            "SELECT id FROM habit_history WHERE habit_id = ? AND date = ?",
            (habit_id, date)
        )
        if c.fetchone():
            c.execute(
                "UPDATE habit_history SET completed = ? WHERE habit_id = ? AND date = ?",
                (completed, habit_id, date)
            )
        else:
            c.execute(
                "INSERT INTO habit_history (habit_id, date, completed) VALUES (?, ?, ?)",
                (habit_id, date, completed)
            )
        conn.commit()
        conn.close()
        return jsonify({"message": "Habit completion status updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/habits/<int:habit_id>/history', methods=['GET'])
def get_habit_history(habit_id):
    try:
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute(
            "SELECT date, completed FROM habit_history WHERE habit_id = ? ORDER BY date ASC",
            (habit_id,)
        )
        history = [
            {"date": row[0], "completed": bool(row[1])}
            for row in c.fetchall()
        ]
        conn.close()
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/habits/by-date/<date>', methods=['GET'])
def get_habits_by_date(date):
    try:
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute("SELECT id, name, date_created, color, category_id FROM habits WHERE date_created <= ?", (date,))
        habits = []
        for habit_id, name, date_created, color, category_id in c.fetchall():
            c.execute(
                "SELECT completed FROM habit_history WHERE habit_id = ? AND date = ?",
                (habit_id, date)
            )
            result = c.fetchone()
            completed = bool(result[0]) if result else False
            habits.append({
                "id": habit_id,
                "name": name,
                "date_created": date_created,
                "color": color,
                "category_id": category_id,
                "completed": completed
            })
        conn.close()
        return jsonify(habits)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    try:
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute("SELECT id, name FROM categories ORDER BY id ASC")
        categories = [{"id": row[0], "name": row[1]} for row in c.fetchall()]
        conn.close()
        return jsonify(categories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/categories', methods=['POST'])
def add_category():
    try:
        data = request.json
        name = data.get('name')
        if not name:
            return jsonify({"error": "Category name is required"}), 400
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute("INSERT INTO categories (name) VALUES (?)", (name,))
        conn.commit()
        category_id = c.lastrowid
        conn.close()
        return jsonify({"id": category_id, "name": name}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/categories/<int:category_id>', methods=['PUT'])
def rename_category(category_id):
    try:
        data = request.json
        name = data.get('name')
        if not name:
            return jsonify({"error": "Category name is required"}), 400
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute("UPDATE categories SET name = ? WHERE id = ?", (name, category_id))
        conn.commit()
        conn.close()
        return jsonify({"id": category_id, "name": name}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        if category_id == 1:
            return jsonify({"error": "Cannot delete default category"}), 400
        conn = sqlite3.connect('habits.db')
        c = conn.cursor()
        c.execute("UPDATE habits SET category_id = 1 WHERE category_id = ?", (category_id,))
        c.execute("DELETE FROM categories WHERE id = ?", (category_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Category deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
    