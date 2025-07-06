import sys
sys.path.append('.')

import sqlite3
from datetime import datetime, timedelta
from app import app

print('=== COMPREHENSIVE CUMULATIVE ANALYSIS ===')

# Test with actual database and API
with app.app_context():
    # 1. Check database directly
    conn = sqlite3.connect('data.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Find the cumulative habit
    cursor.execute('SELECT id, name, cumulative_goal, cumulative_period FROM habits WHERE cumulative = 1 LIMIT 1')
    habit = cursor.fetchone()
    
    if not habit:
        print('No cumulative habits found')
        exit()
    
    habit_id = habit['id']
    goal = habit['cumulative_goal']
    period = habit['cumulative_period']
    
    print(f'Testing habit: {habit["name"]} (ID: {habit_id})')
    print(f'Goal: {goal}, Period: {period}')
    
    # 2. Current month range
    today = datetime.now().date()
    month_start = today.replace(day=1)
    next_month = month_start.replace(day=28) + timedelta(days=4)
    month_end = next_month.replace(day=1) - timedelta(days=1)
    
    print(f'Current month: {month_start} to {month_end}')
    
    # 3. Test database queries
    # Current query (with both start and end date)
    cursor.execute('SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date >= ? AND date <= ?', 
                  (habit_id, month_start.isoformat(), month_end.isoformat()))
    current_sum = cursor.fetchone()[0] or 0
    
    # Old query (only start date) for comparison
    cursor.execute('SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date >= ?', 
                  (habit_id, month_start.isoformat()))
    old_sum = cursor.fetchone()[0] or 0
    
    # Universal sum (all time)
    cursor.execute('SELECT SUM(value) FROM habit_history WHERE habit_id = ?', (habit_id,))
    total_sum = cursor.fetchone()[0] or 0
    
    print(f'Current month sum (new query): {current_sum}')
    print(f'From month start (old query): {old_sum}')
    print(f'Total sum (all time): {total_sum}')
    
    # 4. Test backend service
    from services.services import get_cumulative_progress_details
    api_result = get_cumulative_progress_details(habit_id)
    print(f'Backend API result: {api_result}')
    
    # 5. Test Flask endpoint
    with app.test_client() as client:
        response = client.get(f'/habits/{habit_id}/cumulative-progress')
        endpoint_result = response.get_json()
        print(f'Flask endpoint result: {endpoint_result}')
    
    # 6. Check completion logic
    is_complete = current_sum >= goal
    print(f'Manual completion check: {current_sum} >= {goal} = {is_complete}')
    
    # 7. Show recent entries
    print(f'\nRecent entries for this habit:')
    cursor.execute('SELECT date, value FROM habit_history WHERE habit_id = ? ORDER BY date DESC LIMIT 10', (habit_id,))
    recent = cursor.fetchall()
    for entry in recent:
        print(f'  {entry["date"]}: {entry["value"]}')
    
    conn.close()
    
print('\n=== ANALYSIS COMPLETE ===')
print('If the backend API and Flask endpoint show is_complete=False but the frontend shows completed,')
print('then the issue is in frontend caching or display logic.')
print('If they show is_complete=True but progress < goal, then there\'s a backend calculation issue.')
