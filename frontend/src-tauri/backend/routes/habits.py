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
    
    # Validation: Only allow positive numbers for counter and total habits
    # Cumulative habits are validated separately
    habit_type = data.get('type', '').lower()
    target_value = data.get('target_value', 1)
    cumulative_goal = data.get('cumulative_goal')
    
    # Check if this is a cumulative habit
    is_cumulative_habit = cumulative_goal is not None
    
    if is_cumulative_habit:
        # Validate cumulative habit
        if not isinstance(cumulative_goal, (int, float)) or cumulative_goal <= 0:
            return jsonify({"error": "Cumulative habits must have a positive goal value."}), 400
        cumulative_period = data.get('cumulative_period', '').strip()
        if not cumulative_period or cumulative_period not in ['day', 'week', 'weekly', 'month', 'monthly']:
            return jsonify({"error": "Cumulative habits must have a valid period (day, week, weekly, month, or monthly)."}), 400
    elif habit_type in ('counter', 'total'):
        # Validate counter/total habits
        if isinstance(target_value, (int, float)) and target_value <= 0:
            return jsonify({"error": "Counter and total habits must have positive target values."}), 400
    
    # Add date_created
    final_vals = (vals[0], vals[1], vals[2], vals[3], vals[4], get_today(), vals[5], vals[6], vals[7], vals[8])
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
    date = request.args.get('date') or get_today()
    progress_details = get_cumulative_progress_details(habit_id, date)

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
    
    habit_details = run_query(FETCH_TYPE_AND_CUMULATIVE, params=(habit_id,), fetch='one')
    if not habit_details:
        return jsonify({"error": "Habit not found."}), 404
    
    habit_type = habit_details['type']
    is_cumulative_habit = habit_details['cumulative_goal'] is not None
    
    # Validation based on habit type
    if is_cumulative_habit:
        # Cumulative habits: allow any numeric value (positive for increment, negative for decrement)
        if not isinstance(value, (int, float)):
            return jsonify({"error": "Value must be a number for cumulative habits."}), 400
    elif habit_type in ('counter', 'total'):
        # Counter/total habits: only allow positive values when completing
        if completed == 1 and (not isinstance(value, (int, float)) or value <= 0):
            return jsonify({"error": "Value must be a positive number for counter and total habits."}), 400
    
    # Process the completion update
    result, status_code = update_habit_completion_status(habit_id, date, completed, value)
    return jsonify(result), status_code


@habits_bp.route('/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    """Handles updating a habit's core attributes."""
    update_payload = request.json
    
    result, status_code = update_habit_details(habit_id, update_payload)
    
    return jsonify(result), status_code
