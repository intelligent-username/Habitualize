from flask import Blueprint, request, jsonify
from database.connection import get_db
from services.services import (
    insert_pomodoro_session,
    finish_pomodoro_session,
    get_pomodoro_stats
)

pomodoro_bp = Blueprint('pomodoro', __name__)

@pomodoro_bp.route('/api/pomodoro/start', methods=['POST'])
def start_pomodoro():
    data = request.get_json()
    goal_duration = data.get('goal_duration_minutes', 25)
    time_started = data.get('time_started')
    session_id = insert_pomodoro_session(goal_duration, time_started)
    return jsonify({'session_id': session_id}), 201

@pomodoro_bp.route('/api/pomodoro/finish', methods=['POST'])
def finish_pomodoro():
    data = request.get_json()
    session_id = data['session_id']
    time_finished = data['time_finished']
    completed = data['completed']
    time_completed = data.get('time_completed', None)
    finish_pomodoro_session(session_id, time_finished, completed, time_completed)
    return jsonify({'status': 'ok'})

@pomodoro_bp.route('/api/pomodoro/stats', methods=['GET'])
def pomodoro_stats():
    range_type = request.args.get('range', 'today')
    stats = get_pomodoro_stats(range_type)
    return jsonify(stats)
