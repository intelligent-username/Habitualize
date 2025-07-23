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
    # If provided, 'defaults' dictionary will override these, not merge with them.
    if defaults is None:
        defaults = {'name': 'Unnamed Sequence', 'color': 'gray', 'category_id': 1, 'cumulative': 0, 'type': 'binary', 'step_order': 0}
    
    return tuple(data.get(field, defaults.get(field)) for field in required_fields)


def get_today():
    """Returns the current date in ISO format"""
    return datetime.date.today().isoformat()


def calculate_start_date(period, start_day_str='sunday', reference_date=None):
    """
    Calculates the start date for a given period (day, week/weekly, month/monthly).
    The week's start day is customizable.

    Args:
        period (str): The period ('day', 'week', 'weekly', 'month', 'monthly').
        start_day_str (str): The name of the day the week starts on (e.g., 'sunday').
        reference_date (str or datetime.date): The reference date to calculate from. Defaults to today.

    Returns:
        datetime.date: The calculated start date.
        None: If the period is invalid.
    """
    if reference_date:
        if isinstance(reference_date, str):
            today = datetime.datetime.strptime(reference_date, '%Y-%m-%d').date()
        else:
            today = reference_date
    else:
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

    period_actions = {
        'day': lambda: today,
        'week': get_weekly_start,
        'weekly': get_weekly_start,  # Support old format
        'month': lambda: today.replace(day=1),
        'monthly': lambda: today.replace(day=1),  # Support old format
    }

    action = period_actions.get(period)
    
    return action() if action else None


def calculate_end_date(period, start_date):
    """
    Calculates the end date for a given period (day, week/weekly, month/monthly).

    Args:
        period (str): The period ('day', 'week', 'weekly', 'month', 'monthly').
        start_date (datetime.date): The start date of the period.

    Returns:
        datetime.date: The calculated end date.
        None: If the period is invalid.
    """
    if period == 'day':
        return start_date  # Same day
    elif period in ('week', 'weekly'):
        return start_date + datetime.timedelta(days=6)
    elif period in ('month', 'monthly'):
        next_month = start_date.replace(day=28) + datetime.timedelta(days=4)  # Go to next month
        return next_month.replace(day=1) - datetime.timedelta(days=1)  # Last day of current month
    else:
        return None
