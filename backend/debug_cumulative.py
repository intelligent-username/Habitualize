import sqlite3
from datetime import datetime, timedelta
import sys
sys.path.append('.')

# Connect to database
conn = sqlite3.connect('data.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print('=== CUMULATIVE HABITS ANALYSIS ===')

# 1. Find all cumulative habits
cursor.execute('SELECT id, name, cumulative_goal, cumulative_period, type FROM habits WHERE cumulative = 1')
cumulative_habits = cursor.fetchall()

if not cumulative_habits:
    print('No cumulative habits found')
    exit()

for habit in cumulative_habits:
    habit_name = habit['name']
    habit_id = habit['id']
    goal = habit['cumulative_goal']
    period = habit['cumulative_period']
    habit_type = habit['type']
    
    print(f'\n--- Habit: {habit_name} (ID: {habit_id}) ---')
    print(f'Goal: {goal}, Period: {period}, Type: {habit_type}')
    
    # Show all history for this habit
    cursor.execute('SELECT date, value, completed FROM habit_history WHERE habit_id = ? ORDER BY date DESC', (habit_id,))
    history = cursor.fetchall()
    
    print('History:')
    total_sum = 0
    for entry in history:
        value = entry['value'] or 0
        total_sum += value
        print(f'  {entry["date"]}: value={value}, completed={entry["completed"]}')
    
    print(f'Total sum of all values: {total_sum}')
    
    # Test the current query with different date ranges
    today = datetime.now().date()
    
    # Monthly period test
    if period == 'monthly':
        month_start = today.replace(day=1)
        next_month = month_start.replace(day=28) + timedelta(days=4)
        month_end = next_month.replace(day=1) - timedelta(days=1)
        
        print(f'Current month range: {month_start} to {month_end}')
        
        # Test the updated query
        cursor.execute('SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date >= ? AND date <= ?', 
                      (habit_id, month_start.isoformat(), month_end.isoformat()))
        result = cursor.fetchone()
        monthly_sum = result[0] if result[0] is not None else 0
        print(f'Sum for current month: {monthly_sum}')
        
        # Test the old query (just >= start)
        cursor.execute('SELECT SUM(value) FROM habit_history WHERE habit_id = ? AND date >= ?', 
                      (habit_id, month_start.isoformat()))
        result = cursor.fetchone()
        old_sum = result[0] if result[0] is not None else 0
        print(f'Sum from month start (old query): {old_sum}')
        
        # Test specific dates
        print(f'Checking entries in current month:')
        cursor.execute('SELECT date, value FROM habit_history WHERE habit_id = ? AND date >= ? AND date <= ? ORDER BY date', 
                      (habit_id, month_start.isoformat(), month_end.isoformat()))
        month_entries = cursor.fetchall()
        for entry in month_entries:
            print(f'  {entry["date"]}: {entry["value"]}')
    
    print('---')

conn.close()
