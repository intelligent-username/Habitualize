import sys
sys.path.append('.')

from app import app
import json

print('=== DIRECT API TEST ===')

with app.test_client() as client:
    # Test the cumulative progress endpoint
    response = client.get('/habits/216/cumulative-progress')
    print(f'Status: {response.status_code}')
    print(f'Response: {response.get_json()}')
    
    # Test what a habit details request would return
    try:
        from database.connection import run_query
        habit_data = run_query('SELECT * FROM habits WHERE id = ?', (216,), fetch='one')
        print(f'\nHabit data from DB:')
        print(f'ID: {habit_data["id"]}, Name: {habit_data["name"]}')
        print(f'Cumulative: {habit_data["cumulative"]}, Goal: {habit_data["cumulative_goal"]}, Period: {habit_data["cumulative_period"]}')
        print(f'Type: {habit_data["type"]}')
    except Exception as e:
        print(f'Error getting habit data: {e}')
