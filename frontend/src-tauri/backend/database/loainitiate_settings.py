"""
Helper to initialize default user settings in the database.
"""
import json

def loainitiate_settings(c):
    default_settings = [
        ('default_habit_color', 'gray', 'string', 'Default color for new habits'),
        ('default_habit_type', 'normal', 'string', 'Default type for new habits (normal, cumulative, etc.)'),
        ('default_habit_icon', 'default.svg', 'string', 'Default icon for new habits'),
        ('default_category_id', '1', 'integer', 'Default category ID for new habits'),
        ('default_sequence_count', '2', 'integer', 'Default number of steps for new sequences'),
        ('week_start_day', '0', 'integer', 'Week start day (0=Sunday, 1=Monday)'),
        ('theme', 'dark', 'string', 'Application theme (dark/light)'),
        ('show_habit_icons', 'true', 'boolean', 'Toggle visibility of habit icons'),
        ('filter_completed_to_bottom', 'false', 'boolean', 'Move completed habits to the bottom of the list'),
        ('notification_settings', json.dumps({
            "enabled": False,
            "type": "interval",
            "intervalHours": 6,
            "startTime": "09:00",
            "endTime": "22:00",
            "times": ["09:00", "18:00"]
        }), 'json', 'User notification preferences')
    ]

    # Only add description column if it doesn't exist
    c.execute("PRAGMA table_info(user_settings)")
    columns = [row[1] for row in c.fetchall()]
    if 'description' not in columns:
        c.execute('ALTER TABLE user_settings ADD COLUMN description TEXT')

    for key, value, setting_type, description in default_settings:
        c.execute('''
            INSERT OR IGNORE INTO user_settings (setting_key, setting_value, setting_type, description)
            VALUES (?, ?, ?, ?)
        ''', (key, value, setting_type, description))
