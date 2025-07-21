"""API for Habits."""

from flask import Blueprint, jsonify, request, current_app
import sys
import os
import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from imports import * 
from services.services import get_cumulative_progress_details, update_habit_completion_status, update_habit_details
from services.settings_service import get_default_habit_icon, get_default_habit_type

habits_bp = Blueprint('habits', __name__, url_prefix='/habits')


@habits_bp.route('', methods=['POST'])
def add_habit():
    data = request.json
    columns = ['sequence_id', 'step_order', 'name', 'type', 'target_value', 'cumulative', 'cumulative_goal', 'cumulative_period', 'icon']
    
    # Set default icon if not provided
    if 'icon' not in data or not data['icon']:
        data['icon'] = get_default_habit_icon()
    
    vals = extract_data(data, columns)
    # Validation: Only allow positive numbers for counter, cumulative, and total habits
    habit_type = data.get('type', '').lower()
    target_value = data.get('target_value', 1)
    cumulative_goal = data.get('cumulative_goal', 1)
    if habit_type in ('counter', 'cumulative', 'total'):
        if (isinstance(target_value, (int, float)) and target_value <= 0) or (isinstance(cumulative_goal, (int, float)) and cumulative_goal <= 0):
            return jsonify({"error": "'Counting' habits must have positive target and goal values."}), 400
    # Add date_created
    final_vals = (vals[0], vals[1], vals[2], vals[3], vals[4], get_today(), vals[5], vals[6], vals[7], vals[8]) # NOTE: if this order ever changes, gotta update query!!
    habit_id = run_query(MAKE_HABIT, params=final_vals)
    
    return jsonify({"id": habit_id, "message": "New habit added successfully"}), 201


@habits_bp.route('/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    run_query(DEL_HABIT, params=(habit_id,))
    run_query(DEL_HISTORY, params=(habit_id,))
    return jsonify({"message": "Habit deleted successfully"}), 200


@habits_bp.route('/<int:habit_id>/history', methods=['GET'])
def get_habit_history(habit_id):
    history = run_query(FETCH_HABIT_HISTORY, params=(habit_id,))
    return jsonify([serialize_habit_history(row) for row in history])


@habits_bp.route('/<int:habit_id>/cumulative-progress', methods=['GET'])
def get_cumulative_progress(habit_id):
    progress_details = get_cumulative_progress_details(habit_id)

    if not progress_details:
        return jsonify({"error": "This habit does not have a valid cumulative goal or period."}), 404

    return jsonify(progress_details), 200


@habits_bp.route('/<int:habit_id>/history', methods=['PUT'])
def toggle_habit_completion(habit_id):
    """Handles toggling a habit's completion status for a given day."""
    data = request.json
    date = data.get('date') or get_today()
    completed = int(data.get('completed', 0))
    value = data.get('value', 0)
    
    # Fetch habit type
    habit_details = run_query(FETCH_TYPE_AND_CUMULATIVE, params=(habit_id,), fetch='one')
    habit_type = habit_details['type'] if habit_details else get_default_habit_type()
    cumulative = habit_details['cumulative'] if habit_details else 0
    
    # Only allow positive values for counter, cumulative, and total habits when completing (completed=1)
    # Allow zero/negative values when unchecking (completed=0) to enable deletion of history entries
    # Make sure to fix cumulative goals time framing bug
    if habit_type in ('counter', 'cumulative', 'total') or cumulative:
        if completed == 1 and isinstance(value, (int, float)) and value <= 0:
            return jsonify({"error": "Value must be a positive number for counter, cumulative, or total habits."}), 400
    
    result, status_code = update_habit_completion_status(habit_id, date, completed, value)
    return jsonify(result), status_code


@habits_bp.route('/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    """Handles updating a habit's core attributes."""
    update_payload = request.json
    
    result, status_code = update_habit_details(habit_id, update_payload)
    
    return jsonify(result), status_code
