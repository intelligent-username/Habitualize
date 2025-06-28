"""
GENERIC utilities for the backend.
Usable across different modules.
"""

import datetime


def extract_data(data, required_fields, defaults=None):
    """
    Extracts and validates data from a dictionary.
    data: The input dictionary (i.e. request.json).
    required_fields: List of required fields (COLUMNS) to extract from the data.
    defaults: Dictionary of default values for optional fields.
    Returns values in the same order as required_fields for direct unpacking.
    """
    # If no custom defaults are provided, use a set of standard application-wide defaults.
    # A provided 'defaults' dictionary will override these, not merge with them.
    if defaults is None:
        defaults = {'name': 'Unnamed Sequence', 'color': 'gray', 'category_id': 1, 'cumulative': 0, 'type': 'binary', 'step_order': 0}
    
    # Use a generator expression for a more concise and Pythonic approach.
    return tuple(data.get(field, defaults.get(field)) for field in required_fields)

def get_today():
    """Returns the current date in ISO format"""
    return datetime.date.today().isoformat()

def calculate_start_date(period, start_day_str='sunday'):
    """
    Calculates the start date for a given period (weekly, monthly, yearly).
    The week's start day is customizable.

    Args:
        period (str): The period ('weekly', 'monthly', 'yearly').
        start_day_str (str): The name of the day the week starts on (e.g., 'sunday').

    Returns:
        datetime.date: The calculated start date.
        None: If the period is invalid.
    """
    today = datetime.date.today()

    def get_weekly_start():
        """Calculates the start of the week based on the configured start day."""
        week_start_map = {
            'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
            'friday': 4, 'saturday': 5, 'sunday': 6
        }
        start_day_weekday = week_start_map.get(start_day_str.lower(), 6)  # Default to Sunday
        days_to_subtract = (today.weekday() - start_day_weekday + 7) % 7
        return today - datetime.timedelta(days=days_to_subtract)

    # A dispatch table is a clean, scalable way to handle different period logic.
    period_actions = {
        'monthly': lambda: today.replace(day=1),
        'yearly': lambda: today.replace(month=1, day=1),
        'weekly': get_weekly_start
    }

    # Get the appropriate function from the dispatch table and execute it.
    action = period_actions.get(period)
    
    # Return the result of the function call, or None if the period was invalid.
    return action() if action else None
