"""
SPECIFIC Utilities for the different routes
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
from services.utils import calculate_end_date
from services.settings_service import get_week_start_day, get_default_habit_type, get_default_habit_icon


def get_cumulative_progress_details(habit_id, date=None):
    """
    Fetches and calculates all details for a habit's cumulative progress.
    Returns a dictionary with progress details, or None if the habit is invalid.
    """
    try:
        # 1. Fetch the habit's goal and period from the database
        goal_details = run_query(FETCH_HABIT_GOAL_DETAILS, params=(habit_id,), fetch='one')
        
        if not goal_details:
            current_app.logger.warning(f"Habit {habit_id} not found")
            return None
            
        goal = goal_details['cumulative_goal']
        period = goal_details['cumulative_period']

        # Check if this is actually a cumulative habit
        if goal is None:
            current_app.logger.warning(f"Habit {habit_id} is not a cumulative habit (no cumulative_goal)")
            return None
            
        if not period or str(period).strip() == '':
            current_app.logger.warning(f"Habit {habit_id} has invalid cumulative_period")
            return None

        # 2. Calculate the correct start and end dates for the period
        week_start = 'sunday' if get_week_start_day() == 0 else 'monday'
        start_date = calculate_start_date(period, start_day_str=week_start, reference_date=date)
        end_date = calculate_end_date(period, start_date)
        
        if not start_date or not end_date:
            current_app.logger.error(f"Invalid period '{period}' for habit {habit_id}")
            return None

        # 3. Calculate progress by summing all values in the period
        start_str = start_date.isoformat()
        end_str = end_date.isoformat()
        progress_result = run_query(FETCH_CUMULATIVE_SO_FAR, params=(habit_id, start_str, end_str), fetch='one')
        
        # Handle NULL from SUM() when no rows exist
        progress = progress_result[0] if progress_result and progress_result[0] is not None else 0

        # 4. Ensure both values are numbers and calculate completion
        try:
            progress_num = float(progress) if progress is not None else 0.0
            goal_num = float(goal) if goal is not None else 0.0
            is_complete = progress_num >= goal_num
        except (ValueError, TypeError) as e:
            current_app.logger.error(f"Conversion error for habit {habit_id}: progress={progress}, goal={goal}, error={e}")
            return None

        # Return the result
        return {
            "progress": progress_num,
            "goal": goal_num,
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
            
            # Get the habit type for the previous habit
            prev_habit_details = run_query(FETCH_TYPE_AND_CUMULATIVE, params=(prev_habit_id,), fetch='one')
            prev_habit_type = prev_habit_details['type'] if prev_habit_details else get_default_habit_type()

            # Handle reverse binary habits correctly
            if prev_habit_type == "reverse_binary":
                history_row = run_query(FETCH_HABIT_COMPLETION_STATUS, params=(prev_habit_id, date), fetch='one')
                if not history_row:
                    # No history entry exists, so create one marking it as completed (default for reverse binary)
                    run_query(MAKE_CONTRIBUTION, params=(prev_habit_id, date, 1, 1))
                    is_completed = True
                else:
                    is_completed = bool(history_row['completed'])
            else:
                # For other habit types: use standard completion check
                prev_habit_completed = run_query(FETCH_HABIT_COMPLETION_STATUS, params=(prev_habit_id, date), fetch='one')
                is_completed = prev_habit_completed and prev_habit_completed['completed']
            
            if not is_completed:
                return {"error": "Previous step in sequence not completed"}, 400
    return None


def update_habit_completion_status(habit_id, date, completed, value):
    """
    Updates a habit's completion status for a specific date.
    Handles both cumulative and non-cumulative habits.
    """
    # 1. Check business rule preconditions (sequence ordering)
    precondition_failure = _check_sequence_preconditions(habit_id, date)
    if precondition_failure:
        return precondition_failure

    # 2. Fetch habit details
    habit_details = run_query(FETCH_TYPE_AND_CUMULATIVE, params=(habit_id,), fetch='one')
    if not habit_details:
        return {"error": "Habit not found"}, 404
        
    habit_type = habit_details['type']
    is_cumulative_habit = habit_details['cumulative_goal'] is not None

    # 3. Handle cumulative vs non-cumulative habits
    if is_cumulative_habit:
        return _handle_cumulative_habit_update(habit_id, date, value)
    else:
        return _handle_regular_habit_update(habit_id, date, completed, value, habit_type)


def _handle_cumulative_habit_update(habit_id, date, value):
    """
    Handles updates for cumulative habits.
    For cumulative habits, we store incremental values but don't mark as completed.
    Completion is determined by the cumulative progress vs goal.
    """
    try:
        # Check if there's already an entry for this date
        existing_entry = run_query(FETCH_HABIT_HISTORY_ENTRY, params=(habit_id, date), fetch='one')
        
        if existing_entry:
            # Update existing entry by adding the new value
            current_value = existing_entry['value'] or 0
            new_total = current_value + value
            
            if new_total <= 0:
                # If total becomes zero or negative, delete the entry
                run_query(DEL_HISTORY_BY_DATE, params=(habit_id, date))
            else:
                # For cumulative habits, completion is determined by overall progress
                run_query(UPDATE_HABIT_HISTORY_ENTRY, params=(0, new_total, habit_id, date))
        else:
            # Create new entry only if value is positive
            if value > 0:
                run_query(MAKE_CONTRIBUTION, params=(habit_id, date, 0, value))
            # If value is negative or zero and no existing entry, do nothing
        
        return {"message": "Cumulative habit updated successfully"}, 200
        
    except Exception as e:
        current_app.logger.error(f"Error updating cumulative habit {habit_id}: {e}")
        return {"error": "Failed to update cumulative habit"}, 500


def _handle_regular_habit_update(habit_id, date, completed, value, habit_type):
    """
    Handles updates for regular (non-cumulative) habits.
    """
    try:
        existing_entry = run_query(FETCH_HABIT_HISTORY_ENTRY, params=(habit_id, date), fetch='one')
        
        if completed == 0:
            # Unchecking - delete the history entry if it exists
            if existing_entry:
                run_query(DEL_HISTORY_BY_DATE, params=(habit_id, date))
        else:
            # Checking - create or update the entry
            if existing_entry:
                run_query(UPDATE_HABIT_HISTORY_ENTRY, params=(completed, value, habit_id, date))
            else:
                run_query(MAKE_CONTRIBUTION, params=(habit_id, date, completed, value))
        
        return {"message": "Habit completion updated successfully"}, 200
        
    except Exception as e:
        current_app.logger.error(f"Error updating regular habit {habit_id}: {e}")
        return {"error": "Failed to update habit completion"}, 500


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
        merged_data.get('icon', get_default_habit_icon()), 
        habit_id
    )
    current_app.logger.info(f"Executing update for habit {habit_id} with SQL: '{UPDATE_HABIT.strip()}' and params: {params_for_habit_update}")
    run_query(UPDATE_HABIT, params=params_for_habit_update)


def update_sequence(sequence_id, data):
    """
    Updates the sequence properties like color and category_id.
    """
    sql = UPDATE_SEQ
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
    # UNIFIED DEFINITION: Check if habit is cumulative based on cumulative_goal
    is_cumulative = habit_row['cumulative_goal'] is not None
    habit_id = habit_row['id']

    if habit_type == "reverse_binary":
        history_row = run_query(FETCH_HABIT_COMPLETION_STATUS, params=(habit_id, date), fetch='one')
        if not history_row:
            # No history entry exists, so create one marking it as completed (default for reverse binary)
            run_query(MAKE_CONTRIBUTION, params=(habit_id, date, 1, 1))
            progress['completed'] = True
        else:
            progress['completed'] = bool(history_row['completed'])
        progress['value'] = 1 if progress['completed'] else 0

    elif habit_type in ("counter", "entry"):
        sum_result = run_query(FETCH_SUM_SO_FAR, params=(habit_id, date), fetch='one')
        value = sum_result[0] if sum_result and sum_result[0] is not None else 0
        target = float(habit_row['target_value'] or 1.0)
        progress['value'] = value
        progress['completed'] = value >= target

    elif is_cumulative:
        # For cumulative habits, calculate progress within the time period (weekly/monthly/yearly)
        try:
            # Get cumulative progress details for the current period
            cumulative_details = get_cumulative_progress_details(habit_id)
            if cumulative_details:
                progress['value'] = cumulative_details['progress']
                progress['completed'] = cumulative_details['is_complete']
            else:
                # Fallback: treat as regular counter if cumulative details unavailable
                sum_result = run_query(FETCH_SUM_SO_FAR, params=(habit_id, date), fetch='one')
                value = sum_result[0] if sum_result and sum_result[0] is not None else 0
                progress['value'] = value
                progress['completed'] = False  # Can't determine completion without goal
        except Exception as e:
            current_app.logger.error(f"Error calculating cumulative progress for habit {habit_id}: {e}")
            # Fallback to simple sum
            sum_result = run_query(FETCH_SUM_SO_FAR, params=(habit_id, date), fetch='one')
            value = sum_result[0] if sum_result and sum_result[0] is not None else 0
            progress['value'] = value
            progress['completed'] = False

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
    session_data = run_query(POM_CALC, (session_id,), fetch='one')
    if not session_data:
        current_app.logger.error(f"Could not find pomodoro session with id {session_id} to finish.")
        return

    # Always use the frontend's time_completed value for accuracy
    duration_minutes = time_completed if time_completed is not None else 0

    # If the session was not marked as 'completed' via the timer finishing,
    # we still record the actual time spent. The 'completed' flag now strictly
    # means "Did the timer finish naturally?".
    # We also check if the time worked is a significant portion of the goal, e.g., 95%
    goal_minutes = session_data['goal_duration_minutes']
    if not completed and (duration_minutes >= goal_minutes * 0.95):
        completed = True
    
    run_query(FINISH_POMODORO_SESSION, (time_finished, completed, duration_minutes, session_id))


def get_pomodoro_stats(range_type, start=None, week_start_day=None):
    """
    Returns pomodoro stats for a given range_type and start date.
    range_type: 'day', 'week', 'month', or 'all'
    start: ISO date string (YYYY-MM-DD) for 'day' and 'week', or 'YYYY-MM' for 'month'.
    week_start_day: 0=Sunday, 1=Monday
    """
    # Always interpret the 'start' date as local time, but filter using the local date derived from UTC timestamps
    if range_type == 'day':
        date_str = start or datetime.now().strftime('%Y-%m-%d')
        # Use SQLite's datetime(time_started, 'localtime') to convert UTC to local before filtering
        x = run_query(POM_TIMER_CALC2, (date_str,))
    elif range_type == 'week':
        if start:
            start_date = datetime.strptime(start, '%Y-%m-%d')
        else:
            today = datetime.now()
            # Use week_start_day parameter if provided, otherwise get from settings
            if week_start_day is None:
                week_start_day = get_week_start_day()
            # Calculate start of week based on week_start_day
            days_since_week_start = (today.weekday() + 1) % 7 if week_start_day == 0 else today.weekday()
            start_date = today - timedelta(days=days_since_week_start)
        end_date = start_date + timedelta(days=6)
        # Filter using local date range
        x = run_query(POM_TIMER_CALC3, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')))
    elif range_type == 'month':
        month_str = start or datetime.now().strftime('%Y-%m')
        # Filter using local month
        x = run_query(FETCH_POM_LOC, (month_str,))
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


def get_pom_week_streak(week_start_day=None):
    if week_start_day is None:
        week_start_day = get_week_start_day()
    
    rows = run_query(FETCH_WEEK_STREAK, fetch="all")
    weeks = set(row['w'] for row in rows)
    now = datetime.now()
    current = now
    streak = 0
    while True:
        # Calculate week number based on week_start_day setting
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
