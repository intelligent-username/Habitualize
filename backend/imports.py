"""
Here we import Modularized Functions. All helpers for the routes are imported here.
Use this to see where functions used in app.py are defined (and save space in other files).
"""

# database/
from database.connection import run_query
from database.init_db import init_db

# Sorted by type of query
from database.queries import MAKE_SEQUENCE, MAKE_HABIT, MAKE_CATEGORY

from database.queries import FETCH_HABIT_HISTORY, FETCH_ALL_SEQUENCES, FETCH_HABITS_BY_SEQUENCE_ID, FETCH_ALL_CATEGORIES, FETCH_SEQUENCE_BY_ID, FETCH_HABITS_IN_SEQUENCE, FETCH_SUM_SO_FAR, FETCH_COMPLETION, FETCH_HAB, FETCH_HABIT_COMPLETION_STATUS, FETCH_CUMULATIVE_SO_FAR, FETCH_TYPE_AND_CUMULATIVE, FETCH_SEQ, FETCH_SEQ_HAB, FETCH_HABIT_HISTORY_ENTRY, FETCH_SEQ_DATA, FETCH_UPDATED_HAB, FETCH_HABIT_GOAL_DETAILS

from database.queries import DEL_HISTORY_BY_DATE, MAKE_CONTRIBUTION, DEL_HISTORY, DEL_HABIT_S, DEL_HABIT, DEL_SEQ, DEL_CAT

from database.queries import UPDATE_HABIT_HISTORY_ENTRY, UPDATE_HAB_CATS, UPDATE_CAT_IN_DB, UPDATE_HABIT, UPDATE_SEQ

# services/ folder. Helper functions for blueprints
from services.json_utils import serialize_habit, serialize_sequence, serialize_habit_history, serialize_category, serialize_hydrated_habit_step, serialize_sequence
from services.utils import extract_data, get_today, calculate_start_date


# __all__ = [name for name in globals() if not name.startswith("_") and name not in ["globals", "__builtins__", "__file__", "__name__", "__package__"]]
    # If I want to exclude packages in the future, expand the [] list ABOVE ^^. But for now, I want to include everything.

