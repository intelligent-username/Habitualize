"""
SPECIFIC Utilities for the different routes
This file requires refactoring also (later)
"""

# Might have to refactor this file, getting too long

import os, sys
from flask import current_app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from datetime import datetime, timedelta

from imports import * 
from database.connection import run_query
from datetime import datetime
import random


def get_cumulative_progress_details(habit_id):
    """
    Fetches and calculates all details for a habit's cumulative progress.
    Returns a dictionary with progress details, or None if the habit is invalid.
    """
    try:
        # 1. Fetch the habit's goal and period from the database
        goal_details = run_query(FETCH_HABIT_GOAL_DETAILS, params=(habit_id,), fetch='one')
        if not goal_details or not goal_details['cumulative_goal']:
            current_app.logger.warning(
                f"Attempted to get cumulative progress for habit_id {habit_id}, \
                but it's not a valid cumulative habit."
            )
            return None

        goal = goal_details['cumulative_goal']
        period = goal_details['cumulative_period']

        # 2. Calculate the correct start date using our utility
        start_date = calculate_start_date(period, start_day_str='sunday')
        if not start_date:
            current_app.logger.error(
                f"Invalid period '{period}' stored for habit_id {habit_id}.\
                Cannot calculate start date."
            )
            return None

        # 3. Fetch the progress sum for the calculated period
        start_str = start_date.isoformat()
        progress_result = run_query(FETCH_CUMULATIVE_SO_FAR, params=(habit_id, start_str), fetch='one')
        # Access by the first column's value, robustly handling if the result is None.
        progress = progress_result[0] if progress_result else 0

        # 4. Perform the comparison
        is_complete = progress >= goal

        # Return the result
        return {
            "progress": progress,
            "goal": goal,
            "period": period,
            "is_complete": is_complete
        }
    except Exception as e:
        current_app.logger.error(f"Error calculating cumulative progress for habit {habit_id}: {e}")
        return None


def _check_sequence_preconditions(habit_id, date):
    """
    Checks if a habit is part of a sequence and if the previous step is completed.
    Returns an error dictionary and status code if preconditions are not met, otherwise None.
    """
    sequence_info = run_query(FETCH_SEQ, params=(habit_id,), fetch='one')
    if not sequence_info:
        return None  # Not in a sequence => no preconditions to check

    sequence_id = sequence_info['sequence_id']
    step_order = sequence_info['step_order']

    if step_order > 0:
        prev_habit_info = run_query(FETCH_SEQ_HAB, params=(sequence_id, step_order - 1), fetch='one')
        if prev_habit_info:
            prev_habit_id = prev_habit_info['id']
            prev_habit_completed = run_query(FETCH_HABIT_COMPLETION_STATUS, params=(prev_habit_id, date), fetch='one')
            if not prev_habit_completed or not prev_habit_completed['completed']:
                return {"error": "Previous step in sequence not completed"}, 400
    return None


def _persist_habit_history(habit_id, date, completed, value, habit_type, cumulative):
    """
    Handles the database logic for inserting, updating, or deleting a habit history entry.
    """
    if habit_type in ("counter", "entry") or cumulative:
        if completed == 0 and value == 0:
            run_query(DEL_HISTORY_BY_DATE, params=(habit_id, date))
        elif value != 0:
            # BUG: Non-zero (elif) does not imply completion, whole function is kind of goofy. Fix later (not major rn).
            run_query(MAKE_CONTRIBUTION, params=(habit_id, date, 1, value))
    else:  # Binary habits
        existing_entry = run_query(FETCH_HABIT_HISTORY_ENTRY, params=(habit_id, date), fetch='one')
        if existing_entry:
            run_query(UPDATE_HABIT_HISTORY_ENTRY, params=(completed, value, habit_id, date))
        else:
            run_query(MAKE_CONTRIBUTION, params=(habit_id, date, completed, value))

    return {"message": "Habit completion status updated"}, 200


def update_habit_completion_status(habit_id, date, completed, value):
    """
    Orchestrates updating a habit's completion status, including checking preconditions.
    """
    # 1. Check business rule preconditions
    precondition_failure = _check_sequence_preconditions(habit_id, date)
    if precondition_failure:
        return precondition_failure

    # 2. Fetch necessary data
    habit_details = run_query(FETCH_TYPE_AND_CUMULATIVE, params=(habit_id,), fetch='one')
    habit_type = habit_details['type'] if habit_details else "binary"
    cumulative = habit_details['cumulative'] if habit_details else 0

    # 3. Persist the changes
    result, status_code = _persist_habit_history(habit_id, date, completed, value, habit_type, cumulative)

    return result, status_code


def _read_and_prepare_update_data(habit_id, update_payload):
    """
    (Read Phase) Fetches current habit data and merges it with the update payload.
    Returns a dictionary of merged data, or (None, error_dict, status_code) on failure.
    """
    current_habit_data = run_query(FETCH_UPDATED_HAB, params=(habit_id,), fetch='one')
    if not current_habit_data:
        current_app.logger.warning(f"Habit with id {habit_id} not found for update.")
        return None, {"error": "Habit not found"}, 404    # Log the dictionary version of the Row object for clarity.
    current_app.logger.info(f"Current habit data for {habit_id}: {dict(current_habit_data)}")

    # Only merge the fields that the frontend explicitly wants to update.
    # Start with current data, then overlay only the provided updates.
    merged_data = dict(current_habit_data)
    merged_data.update(update_payload)

    current_app.logger.info(f"Habit {habit_id}: Merged data for update: {merged_data}")

    return merged_data, None, None


def _execute_database_updates(habit_id, merged_data, original_payload):
    """
    (Write Phase) Executes the database updates for the habit and its parent sequence.
    Returns a boolean indicating if the sequence was updated.
    """
    # 1. Update the habit itself
    params_for_habit_update = (
        merged_data.get('name'), 
        merged_data.get('type'), 
        merged_data.get('target_value'),
        merged_data.get('cumulative'), 
        merged_data.get('cumulative_goal'), 
        merged_data.get('cumulative_period'),
        merged_data.get('sequence_id'), 
        merged_data.get('step_order'), 
        merged_data.get('icon', current_app.config.get('DEFAULT_ICON', 'default.svg')), 
        habit_id
    )
    current_app.logger.info(f"Executing update for habit {habit_id} with SQL: '{UPDATE_HABIT.strip()}' and params: {params_for_habit_update}")
    run_query(UPDATE_HABIT, params=params_for_habit_update)


def update_sequence(sequence_id, data):
    """
    Updates the sequence properties like color and category_id.
    """
    sql = """
    UPDATE sequences
    SET name = COALESCE(NULLIF(:name, ''), name),
        color = COALESCE(NULLIF(:color, ''), color),
        category_id = COALESCE(:category_id, category_id)
    WHERE id = :sequence_id
    """
    params = {
        'name': data.get('name'),
        'color': data.get('color'),
        'category_id': data.get('category_id'),
        'sequence_id': sequence_id
    }

    current_app.logger.info(f"Executing sequence update with SQL: '{sql}' and params: {params}")
    run_query(sql, params=params)


def update_sequence_details(sequence_id, payload):
    """Orchestrates updating a sequence's details."""
    current_app.logger.info(f"[Service] Starting update for sequence {sequence_id} with payload: {payload}")

    # Room for more complex logic later, like reading current data, merging, etc.
    # For now, we'll directly call the simpler update function.
    
    # Basic validation
    if 'name' not in payload or not payload['name']:
        return {"error": "Sequence name cannot be empty"}, 400

    try:
        update_sequence(sequence_id, payload) # Reusing the existing DB update logic
        return {"message": "Sequence updated successfully"}, 200
    except Exception as e:
        current_app.logger.error(f"Error updating sequence {sequence_id}: {e}")
        return {"error": "Failed to update sequence"}, 500


def update_habit_details(habit_id, update_payload):
    """
    Orchestrates the "Read, Write, Verify" workflow for updating a habit.
    Also updates the parent sequence if color/category are provided.
    """
    current_app.logger.info(f"[Service] Starting update for habit {habit_id} with payload: {update_payload}")

    # 1. Read current habit data and merge with payload
    merged_data, error, status = _read_and_prepare_update_data(habit_id, update_payload)
    if error:
        return error, status

    # 2. Update the habit's own properties
    _execute_database_updates(habit_id, merged_data, update_payload)

    # 3. If color or category are in the payload, update the parent sequence
    sequence_id = merged_data.get('sequence_id')
    if sequence_id and ('color' in update_payload or 'category_id' in update_payload):
        current_app.logger.info(f"Habit update for {habit_id} is triggering an update for parent sequence {sequence_id}.")
        
        # Construct a payload for the sequence update.
        # The update_sequence function is robust to handle None values.
        sequence_payload = {
            'color': update_payload.get('color'),
            'category_id': update_payload.get('category_id')
        }
        
        update_sequence(sequence_id, sequence_payload)

    return {"message": "Habit updated successfully"}, 200


def _get_habit_progress_for_date(habit_row, date):
    """
    Calculates the completion status and value for a single habit on a specific date.
    """
    progress = {'completed': False, 'value': 0}
    habit_type = habit_row['type']
    is_cumulative = habit_row['cumulative']
    habit_id = habit_row['id']

    if habit_type == "reverse_binary":
        history_row = run_query(FETCH_HABIT_COMPLETION_STATUS, params=(habit_id, date), fetch='one')
        progress['completed'] = not history_row or bool(history_row['completed'])
        progress['value'] = 1 if progress['completed'] else 0

    elif habit_type in ("counter", "entry") or is_cumulative:
        sum_result = run_query(FETCH_SUM_SO_FAR, params=(habit_id, date), fetch='one')
        value = sum_result[0] if sum_result and sum_result[0] is not None else 0
        target = float(habit_row['target_value'] or 1.0)
        progress['value'] = value
        progress['completed'] = value >= target

    else:  # Standard binary habit
        history_row = run_query(FETCH_COMPLETION, params=(habit_id, date), fetch='one')
        if history_row:
            progress['completed'] = bool(history_row['completed'])
            progress['value'] = history_row['value'] if history_row['value'] is not None else 0

    return progress


def _hydrate_sequence_with_progress(sequence_dict, date):
    """
    Takes a serialized sequence, fetches its habits, calculates their progress for a date,
    and returns the sequence with a populated 'steps' list.
    """
    sequence_id = sequence_dict['id']
    habits_for_sequence = run_query(FETCH_HABITS_IN_SEQUENCE, params=(sequence_id,))

    hydrated_steps = []
    if habits_for_sequence:
        hydrated_steps = [
            serialize_hydrated_habit_step(habit_row, _get_habit_progress_for_date(habit_row, date))
            for habit_row in habits_for_sequence
        ]

    sequence_dict['steps'] = hydrated_steps
    return sequence_dict


def get_hydrated_sequences_for_date(date):
    """
    Fetches all sequences and hydrates their habits with progress for a specific date.
    """
    sequences_from_db = run_query(FETCH_ALL_SEQUENCES)
    if not sequences_from_db:
        return []

    serialized_sequences = [serialize_sequence(row) for row in sequences_from_db]
    return [_hydrate_sequence_with_progress(seq, date) for seq in serialized_sequences]


def get_hydrated_sequence(sequence_id, date):
    """
    Fetches a single sequence and hydrates its habits with progress for a specific date.
    Returns the hydrated sequence, or (None, error_dict, status_code) on failure.
    """
    sequence_row = run_query(FETCH_SEQUENCE_BY_ID, params=(sequence_id,), fetch='one')
    if not sequence_row:
        return None, {"error": "Sequence not found"}, 404

    hydrated_sequence = serialize_sequence(sequence_row)

    hydrated_sequence_with_steps = _hydrate_sequence_with_progress(hydrated_sequence, date)
    
    return hydrated_sequence_with_steps, None, None # No error, status code


# POMODORO LOGIC
def insert_pomodoro_session(goal_duration_minutes, time_started):
    return run_query(MAKE_POMODORO_SESSION, (goal_duration_minutes, time_started, False))


def finish_pomodoro_session(session_id, time_finished, completed, time_completed=None):
    # Fetch the start time from the database
    session_data = run_query("SELECT time_started, goal_duration_minutes FROM pomodoro_sessions WHERE id = ?", (session_id,), fetch='one')
    if not session_data:
        current_app.logger.error(f"Could not find pomodoro session with id {session_id} to finish.")
        return

    # Calculate the duration on the backend to ensure accuracy
    time_started_str = session_data['time_started']
    
    # The frontend sends ISO 8601 format with 'Z' (UTC), which Python's fromisoformat can parse
    # if it ends with +00:00. We'll handle both 'Z' and timezone-aware strings.
    try:
        time_started = datetime.fromisoformat(time_started_str.replace('Z', '+00:00'))
        time_finished_obj = datetime.fromisoformat(time_finished.replace('Z', '+00:00'))
        
        duration_seconds = (time_finished_obj - time_started).total_seconds()
        duration_minutes = duration_seconds / 60.0
    except ValueError as e:
        current_app.logger.error(f"Error parsing date strings for session {session_id}: {e}")
        # As a fallback, use the client-sent time if parsing fails, though this is not ideal.
        duration_minutes = time_completed if time_completed is not None else 0

    # If the session was not marked as 'completed' via the timer finishing,
    # we still record the actual time spent. The 'completed' flag now strictly
    # means "Did the timer finish naturally?".
    # We also check if the time worked is a significant portion of the goal, e.g., 95%
    # This handles cases where the timer is a few seconds off due to browser throttling.
    goal_minutes = session_data['goal_duration_minutes']
    if not completed and (duration_minutes >= goal_minutes * 0.95):
        completed = True
        
    run_query(FINISH_POMODORO_SESSION, (time_finished, completed, duration_minutes, session_id))


def get_pomodoro_stats(range_type, start=None):
    """
    Returns pomodoro stats for a given range_type and start date.
    range_type: 'day', 'week', 'month', or 'all'
    start: ISO date string (YYYY-MM-DD) for 'day' and 'week', or 'YYYY-MM' for 'month'.
    """
    if range_type == 'day':
        date_str = start or datetime.now().strftime('%Y-%m-%d')
        x = run_query(FETCH_POMODORO_DAY, (date_str,))
    elif range_type == 'week':
        # `start` should be the first day of the week (YYYY-MM-DD), Sunday by default
        if start:
            start_date = datetime.strptime(start, '%Y-%m-%d')
        else:
            today = datetime.now()
            start_date = today - timedelta(days=today.weekday())  # Monday as start of week
        end_date = start_date + timedelta(days=6)
        x = run_query(FETCH_POMODORO_WEEK, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')))
    elif range_type == 'month':
        month_str = start or datetime.now().strftime('%Y-%m')
        x = run_query(FETCH_POMODORO_MON, (month_str,))
    else:
        x = run_query(FETCH_POMODORO_ALL)
    return [dict(row) for row in x]


def earliest_pom():
    return run_query(FIND_FIRST_POM, fetch="one")


def get_pom_day_streak():
    rows = run_query(FETCH_DAY_STREAK, fetch="all")
    days = set(row['d'] for row in rows)
    today = datetime.now().date()
    streak = 0
    current = today
    while current.strftime('%Y-%m-%d') in days:
        streak += 1
        current -= timedelta(days=1)
    return streak


def get_pom_week_streak():
    rows = run_query(FETCH_WEEK_STREAK, fetch="all")
    weeks = set(row['w'] for row in rows)
    now = datetime.now()
    current = now
    streak = 0
    while True:
        # Use strftime for consistency with the database query
        week_str = current.strftime('%Y-%W')
        if week_str in weeks:
            streak += 1
            # Move to a day in the previous week to avoid ambiguity
            current = current - timedelta(days=7)
        else:
            break
    return streak


# QotD
def get_quote_of_the_day():
    today = datetime.now().strftime('%Y-%m-%d')
    row = run_query(FETCH_QOTD, (today,), fetch='one')
    if row:
        return dict(row)
    unused = run_query(CHOOSE_QOTD)
    if not unused:
        run_query(MARK_QUOTES)
        unused = run_query(CHOOSE_QOTD)
    if not unused:
        return {"quote": "No quotes available.", "source": "System"}
    chosen = random.choice(unused)
    run_query(USE_QUOTE, (today, chosen['id']))
    return dict(chosen)
