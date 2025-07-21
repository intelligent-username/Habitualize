"""Settings API routes"""

from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from imports import * 


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from imports import *
from services.settings_service import SettingsService

settings_bp = Blueprint('settings', __name__, url_prefix='/settings')

@settings_bp.route('', methods=['GET'])
def get_all_settings():
    """Get all user settings"""
    settings = run_query(FETCH_ALL_SETTINGS)
    result = [{
        'key': row[0],
        'value': row[1],
        'setting_type': row[2],  # Change 'type' to 'setting_type' to match other code
        'description': row[3]
    } for row in settings]
    print(f"[Settings API] Returning settings: {result}")
    return jsonify(result)

@settings_bp.route('/<setting_key>', methods=['GET'])
def get_setting(setting_key):
    """Get a specific setting"""
    value = SettingsService.get_setting(setting_key)
    if value is None:
        return jsonify({"error": "Setting not found"}), 404
    return jsonify({"key": setting_key, "value": value})

@settings_bp.route('', methods=['POST'])
def update_settings():
    """Update multiple settings"""
    data = request.json
    print(f"[Settings API] Received data: {data}")
    
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data format"}), 400
    
    # Standardized key mapping that always uses lowercase
    standardized_keys = {
        # Core settings
        'default_habit_color': 'default_habit_color',
        'default_habit_type': 'default_habit_type', 
        'default_habit_icon': 'default_habit_icon',
        'default_category_id': 'default_category_id',
        'default_sequence_count': 'default_sequence_count',
        'week_start_day': 'week_start_day',
        # Appearance settings
        'theme': 'theme',
        'show_habit_icons': 'show_habit_icons',
        'filter_completed_to_bottom': 'filter_completed_to_bottom',
        # Notification settings
        'notification_settings': 'notification_settings'
    }
    
    # Process each setting
    for frontend_key, value in data.items():
        print(f"[Settings API] Processing {frontend_key} = {value}")
        
        # Always normalize keys to lowercase to prevent duplicates
        normalized_key = frontend_key.lower()
        
        # Map keys if they exist in our mapping, otherwise use normalized key directly
        db_key = standardized_keys.get(normalized_key, normalized_key)
        
        # Check if this is a valid setting key
        if normalized_key not in [k.lower() for k in standardized_keys.keys()]:
            return jsonify({"error": f"Invalid setting key: {frontend_key}"}), 400
        
        # Type validation
        setting_type = 'string'
        if normalized_key in ['default_category_id', 'default_sequence_count', 'week_start_day']:
            setting_type = 'integer'
            try:
                value = int(value)
            except ValueError:
                return jsonify({"error": f"Invalid integer value for {frontend_key}"}), 400
        elif normalized_key in ['show_habit_icons', 'filter_completed_to_bottom']:
            setting_type = 'boolean'
        elif normalized_key == 'notification_settings':
            setting_type = 'json'
            # Value should already be a dict/object from JSON, SettingsService will handle conversion
        
        print(f"[Settings API] Saving {db_key} = {value} (type: {setting_type})")
        SettingsService.set_setting(db_key, value, setting_type)
    
    return jsonify({"message": "Settings updated successfully"})
