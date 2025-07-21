"""
Centralized settings service for user-configurable defaults
"""
from imports import *
import json

class SettingsService:
    _cache = {}
    
    @classmethod
    def get_setting(cls, key, default=None):
        """Get a setting value with caching"""
        # Always normalize keys to lowercase to prevent duplicates
        normalized_key = key.lower()
        
        if normalized_key in cls._cache:
            return cls._cache[normalized_key]
            
        # Try to fetch with normalized key using the proper query
        result = run_query(FETCH_SETTING_BY_KEY, (normalized_key,), fetch='one')
        
        if not result:
            return default
            
        value, setting_type = result
        
        # Type conversion
        if setting_type == 'integer':
            value = int(value)
        elif setting_type == 'boolean':
            value = value.lower() == 'true'
        elif setting_type == 'json':
            value = json.loads(value)
            
        cls._cache[normalized_key] = value
        return value
    
    @classmethod
    def set_setting(cls, key, value, setting_type='string'):
        """Set a setting value and update cache. Uses UPDATE if exists, INSERT if new."""
        # Always normalize keys to lowercase to prevent duplicates
        normalized_key = key.lower()
        print(f"[SettingsService] set_setting called - key: {key}, normalized: {normalized_key}, value: {value}, type: {setting_type}")
        
        # Convert value to its string representation for the database
        str_value = str(value)
        if setting_type == 'json':
            str_value = json.dumps(value)
        
        print(f"[SettingsService] str_value for database: {str_value}")
        
        # Check if setting exists using the normalized key
        existing = run_query(FETCH_SETTING_BY_KEY, (normalized_key,), fetch='one')
        print(f"[SettingsService] existing setting found: {existing}")
        
        if existing:
            # Update existing setting using the proper UPDATE query
            print(f"[SettingsService] Updating existing setting with query params: ({str_value}, {setting_type}, {normalized_key})")
            run_query(UPDATE_SETTING, (str_value, setting_type, normalized_key))
        else:
            # Insert new setting
            print(f"[SettingsService] Inserting new setting")
            run_query(
                MAKE_SETT,
                (normalized_key, str_value, setting_type)
            )
            
        # Update the cache with the normalized key
        cls._cache[normalized_key] = value
        print(f"[SettingsService] Cache updated: {cls._cache}")
        
        # Clear cache to force fresh read on next get
        cls.clear_cache()
        print(f"[SettingsService] Cache cleared")
        
    @classmethod
    def clear_cache(cls):
        """Clear settings cache"""
        cls._cache = {}

# Convenience functions for each setting
def get_default_habit_color():
    return SettingsService.get_setting('default_habit_color', 'gray')

def get_default_habit_type():
    return SettingsService.get_setting('default_habit_type', 'binary')

def get_default_habit_icon():
    return SettingsService.get_setting('default_habit_icon', 'default.svg')

def get_default_category_id():
    return SettingsService.get_setting('default_category_id', 1)

def get_default_sequence_count():
    return SettingsService.get_setting('default_sequence_count', 2)

def get_week_start_day():
    return SettingsService.get_setting('week_start_day', 0)

def get_notification_settings():
    """Convenience function for notification settings"""
    default_settings = {
        "enabled": False,
        "type": "interval",
        "intervalHours": 6,
        "startTime": "09:00",
        "endTime": "22:00",
        "times": ["09:00", "18:00"]
    }
    return SettingsService.get_setting('notification_settings', default_settings)
