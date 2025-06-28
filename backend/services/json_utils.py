"""
Service file for JSON utilies. 
Mainly Serialization (for now); turns rows into JSON dictionaries.
"""

# Key lists for serialization
_HABIT_KEYS = [
    "id", "sequence_id", "step_order", "name", "type", "target_value",
    "date_created", "cumulative", "cumulative_goal", "cumulative_period"
]

_SEQUENCE_KEYS = [
    "id", "name", "color", "category_id", "date_created"
]

_HABIT_HISTORY_KEYS = ["date", "completed", "value"]

_CATEGORY_KEYS = ["id", "name"]

_HYDRATED_HABIT_STEP_KEYS = [
    "id", "step_order", "name", "type", "target_value",
    "cumulative", "cumulative_goal", "cumulative_period"
]


def _serialize_row(row, keys):
    """
    A generic serializer that converts a database row into a dictionary.
    row: A tuple containing data from a database query.
    keys: A list of strings representing the dictionary keys.
    Returns a dictionary.
    """
    return dict(zip(keys, row))


def serialize_habit(habit_row):
    """
    Converts a database row representing a habit into a JSON-friendly dictionary.
    """
    return _serialize_row(habit_row, _HABIT_KEYS)


def serialize_sequence(sequence_row):
    """
    Converts a database row representing a sequence into a JSON-friendly dictionary.
    """
    return _serialize_row(sequence_row, _SEQUENCE_KEYS)


def serialize_habit_history(row):
    """
    Converts habit history rows into JSON-friendly format.
    """
    data = _serialize_row(row, _HABIT_HISTORY_KEYS)
    data['completed'] = bool(data['completed'])
    return data


def serialize_category(category_row):
    """
    Converts a database row representing a category into a JSON-friendly dictionary.
    """
    return _serialize_row(category_row, _CATEGORY_KEYS)


def serialize_hydrated_habit_step(habit_row, progress):
    """
    Combines a habit's database data with its calculated progress for a given day.
    """
    serialized_habit = _serialize_row(habit_row, _HYDRATED_HABIT_STEP_KEYS)
    serialized_habit.update(progress)
    return serialized_habit
