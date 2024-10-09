from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, static_folder='../frontend/build')
CORS(app)  # Enable CORS to allow requests from React frontend

# Initialize the SQLite database
def init_db():
    conn = sqlite3.connect('habits.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS habits
                 (id INTEGER PRIMARY KEY, name TEXT, completed INTEGER)''')
    conn.commit()
    conn.close()

@app.route('/habits', methods=['GET'])
def get_habits():
    conn = sqlite3.connect('habits.db')
    c = conn.cursor()
    c.execute("SELECT * FROM habits")
    habits = [{"id": row[0], "name": row[1], "completed": row[2]} for row in c.fetchall()]
    conn.close()
    return jsonify(habits)

@app.route('/habits', methods=['POST'])
def add_habit():
    habit = request.json.get('name')
    conn = sqlite3.connect('habits.db')
    c = conn.cursor()
    c.execute("INSERT INTO habits (name, completed) VALUES (?, ?)", (habit, 0))
    conn.commit()
    conn.close()
    return jsonify({"message": "Habit added successfully"}), 201

@app.route('/habits/<int:habit_id>', methods=['PUT'])
def complete_habit(habit_id):
    conn = sqlite3.connect('habits.db')
    c = conn.cursor()
    c.execute("UPDATE habits SET completed = 1 WHERE id = ?", (habit_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Habit marked as completed"}), 200

@app.route('/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    conn = sqlite3.connect('habits.db')
    c = conn.cursor()
    c.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Habit deleted successfully"}), 200

# Serve the React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
