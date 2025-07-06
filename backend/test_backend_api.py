import sys
sys.path.append('.')

from services.services import get_cumulative_progress_details
from services.utils import calculate_start_date, calculate_end_date
from datetime import datetime

print('=== BACKEND API TEST ===')

# Test the actual backend function
habit_id = 216  # The cumulative habit we found
result = get_cumulative_progress_details(habit_id)

print(f'Backend function result: {result}')

# Test the utility functions
period = 'monthly'
start_date = calculate_start_date(period)
end_date = calculate_end_date(period, start_date)

print(f'Start date calculation: {start_date}')
print(f'End date calculation: {end_date}')
print(f'Current date: {datetime.now().date()}')
