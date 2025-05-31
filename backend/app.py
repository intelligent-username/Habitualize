"""
Habitualize Backend - Flask API Server
Provides REST endpoints for habit tracking application.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime

from database.init_db import init_db
from services import category_service, sequence_service, habit_service

app = Flask(__name__)
CORS(app)


# Category endpoints
@app.route('/categories', methods=['GET'])
def get_categories():
   """Get all categories."""
   try:
       categories = category_service.get_all_categories()
       return jsonify(categories)
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/categories', methods=['POST'])
def add_category():
   """Create a new category."""
   try:
       data = request.json
       result = category_service.create_category(data.get('name'))
       return jsonify(result), 201
   except ValueError as e:
       return jsonify({"error": str(e)}), 400
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/categories/<int:category_id>', methods=['PUT'])
def rename_category(category_id):
   """Update category name."""
   try:
       data = request.json
       result = category_service.update_category(category_id, data.get('name'))
       return jsonify(result), 200
   except ValueError as e:
       return jsonify({"error": str(e)}), 400
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
   """Delete category and move sequences to default."""
   try:
       category_service.delete_category(category_id)
       return jsonify({"message": "Category deleted"}), 200
   except ValueError as e:
       return jsonify({"error": str(e)}), 400
   except Exception as e:
       return jsonify({"error": str(e)}), 500


# Sequence endpoints
@app.route('/sequences', methods=['GET'])
def get_sequences():
   """Get all sequences."""
   try:
       sequences = sequence_service.get_all_sequences()
       return jsonify(sequences)
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/sequences', methods=['POST'])
def add_sequence():
   """Create a new sequence."""
   try:
       data = request.json
       result = sequence_service.create_sequence(
           name=data.get('name', 'Unnamed Sequence'),
           color=data.get('color', 'gray'),
           category_id=data.get('category_id', 1)
       )
       return jsonify(result), 201
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/sequences/<int:sequence_id>', methods=['GET'])
def get_sequence(sequence_id):
   """Get sequence with today's completion status."""
   try:
       sequence = sequence_service.get_sequence_with_status(sequence_id)
       return jsonify(sequence)
   except ValueError as e:
       return jsonify({"error": str(e)}), 404
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/sequences/<int:sequence_id>', methods=['PUT'])
def update_sequence(sequence_id):
   """Update sequence details."""
   try:
       data = request.json
       result = sequence_service.update_sequence(
           sequence_id=sequence_id,
           name=data.get('name'),
           color=data.get('color'),
           category_id=data.get('category_id')
       )
       return jsonify(result), 200
   except ValueError as e:
       return jsonify({"error": str(e)}), 400
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/sequences/<int:sequence_id>', methods=['DELETE'])
def delete_sequence(sequence_id):
   """Delete sequence and all associated habits."""
   try:
       sequence_service.delete_sequence(sequence_id)
       return jsonify({"message": "Sequence deleted successfully"}), 200
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/sequences/<int:sequence_id>/habits', methods=['GET'])
def get_sequence_habits(sequence_id):
   """Get all habits in a sequence."""
   try:
       habits = habit_service.get_habits_by_sequence(sequence_id)
       return jsonify(habits)
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/sequences/by-date/<date>', methods=['GET'])
def get_sequences_by_date(date):
   """Get all sequences with completion status for specific date."""
   try:
       sequences = sequence_service.get_sequences_by_date(date)
       return jsonify(sequences)
   except Exception as e:
       return jsonify({"error": str(e)}), 500


# Habit endpoints
@app.route('/habits', methods=['POST'])
def add_habit():
   """Create a new habit in a sequence."""
   try:
       data = request.json
       result = habit_service.create_habit(
           sequence_id=data.get('sequence_id'),
           step_order=data.get('step_order', 0),
           name=data.get('name'),
           habit_type=data.get('type', 'binary'),
           target_value=data.get('target_value'),
           cumulative=data.get('cumulative', 0),
           cumulative_goal=data.get('cumulative_goal'),
           cumulative_period=data.get('cumulative_period')
       )
       return jsonify(result), 201
   except ValueError as e:
       return jsonify({"error": str(e)}), 400
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/habits/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
   """Update habit details."""
   try:
       data = request.json
       result = habit_service.update_habit(habit_id, data)
       return jsonify(result), 200
   except ValueError as e:
       return jsonify({"error": str(e)}), 400
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
   """Delete habit and its history."""
   try:
       habit_service.delete_habit(habit_id)
       return jsonify({"message": "Habit deleted successfully"}), 200
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/habits/<int:habit_id>/history', methods=['GET'])
def get_habit_history(habit_id):
   """Get habit completion history."""
   try:
       history = habit_service.get_habit_history(habit_id)
       return jsonify(history)
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/habits/<int:habit_id>/history', methods=['PUT'])
def toggle_habit_completion(habit_id):
   """Update habit completion status for a date."""
   try:
       data = request.json
       result = habit_service.update_habit_completion(
           habit_id=habit_id,
           completed=int(data.get('completed', 0)),
           value=data.get('value', 0),
           date=data.get('date') or datetime.date.today().isoformat()
       )
       return jsonify(result), 200
   except ValueError as e:
       return jsonify({"error": str(e)}), 400
   except Exception as e:
       return jsonify({"error": str(e)}), 500


@app.route('/habits/<int:habit_id>/cumulative-progress', methods=['GET'])
def get_cumulative_progress(habit_id):
   """Get cumulative progress for a habit over specified period."""
   try:
       period = request.args.get('period', 'weekly')
       progress = habit_service.get_cumulative_progress(habit_id, period)
       return jsonify(progress)
   except ValueError as e:
       return jsonify({"error": str(e)}), 400
   except Exception as e:
       return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
   init_db()
   app.run(debug=True)
