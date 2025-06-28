"""Sequence API & Routes"""


from flask import Blueprint, jsonify, request, current_app
import sys
import os

# This allows us to import from the parent directory (backend)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from imports import * 
from services.services import get_hydrated_sequences_for_date, get_hydrated_sequence, update_sequence_details

sequences_bp = Blueprint('sequences', __name__, url_prefix='/sequences')

@sequences_bp.route('', methods=['POST'])
def add_sequence():
    name, color, category_id = extract_data(request.json, ['name', 'color', 'category_id'])
    date_created = get_today()
    sequence_id = run_query(MAKE_SEQUENCE, params=(name, color, category_id, date_created))
    return jsonify({"id": sequence_id, "message": "Sequence added successfully"}), 201

@sequences_bp.route('', methods=['GET'])
def get_sequences():
    sequences = run_query(FETCH_ALL_SEQUENCES)
    return jsonify(serialize_sequence(seq) for seq in sequences)

@sequences_bp.route('/<int:sequence_id>/habits', methods=['GET'])
def get_sequence_habits(sequence_id):
    habits = run_query(FETCH_HABITS_BY_SEQUENCE_ID, params=(sequence_id,))
    return jsonify([serialize_habit(habit) for habit in habits])

@sequences_bp.route('/<int:sequence_id>', methods=['DELETE'])
def delete_sequence(sequence_id):
    habit_ids = run_query(FETCH_HAB, params=(sequence_id,))
    for hid, in habit_ids:
        run_query(DEL_HISTORY, params=(hid,))
    run_query(DEL_HABIT_S, params=(sequence_id,))
    run_query(DEL_SEQ, params=(sequence_id,))
    return jsonify({"message": "Sequence deleted successfully"}), 200

@sequences_bp.route('/<int:sequence_id>', methods=['PUT'])
def update_sequence(sequence_id):
    """Handles updating a sequence's attributes."""
    payload = request.json
    result, status_code = update_sequence_details(sequence_id, payload)
    return jsonify(result), status_code

@sequences_bp.route('/by-date/<date>', methods=['GET'])
def get_sequences_by_date(date):
    """Fetches all sequences, hydrated with habit progress for a specific date."""
    # current_app.logger.info(f"[SEQUENCES] GET /sequences/by-date/{date} called")
    # current_app.logger.info(f"[SEQUENCES] Request headers: {dict(request.headers)}")
    # current_app.logger.info(f"[SEQUENCES] Request remote addr: {request.remote_addr}")
    # current_app.logger.info(f"[SEQUENCES] Request user agent: {request.user_agent}")
    
    hydrated_data = get_hydrated_sequences_for_date(date)
    # current_app.logger.info(f"[SEQUENCES] Returning data for {len(hydrated_data)} sequences")
    return jsonify(hydrated_data)

@sequences_bp.route('/<int:sequence_id>', methods=['GET'])
def get_sequence(sequence_id):
    """Fetches a single sequence, hydrated with habit progress for today."""
    today = get_today()
    hydrated_sequence, error, status_code = get_hydrated_sequence(sequence_id, today)
    
    if error:
        return jsonify(error), status_code
        
    return jsonify(hydrated_sequence)
