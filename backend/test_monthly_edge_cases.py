import sys
sys.path.append('.')

from app import app
from services.utils import calculate_start_date, calculate_end_date
from datetime import datetime, timedelta

print('=== MONTHLY PERIOD EDGE CASE TEST ===')

# Test different months to see if there's an edge case
test_months = [
    (2025, 7),  # Current month (July 2025)
    (2025, 6),  # Previous month (June 2025)
    (2025, 8),  # Next month (August 2025)
    (2025, 2),  # February (short month)
    (2024, 2),  # February in leap year
]

for year, month in test_months:
    print(f'\n--- Testing {year}-{month:02d} ---')
    
    # Simulate being in that month
    original_today = datetime.now().date()
    test_date = datetime(year, month, 15).date()  # Middle of the month
    
    # Calculate start and end for monthly period
    start_date = test_date.replace(day=1)
    next_month = start_date.replace(day=28) + timedelta(days=4)
    end_date = next_month.replace(day=1) - timedelta(days=1)
    
    print(f'Start: {start_date}')
    print(f'End: {end_date}')
    print(f'Days in month: {(end_date - start_date).days + 1}')
    
    # Test using our utility functions
    period = 'monthly'
    
    # Temporarily mock the current date
    import services.utils
    original_today_func = services.utils.datetime.date.today
    services.utils.datetime.date.today = lambda: test_date
    
    try:
        util_start = calculate_start_date(period)
        util_end = calculate_end_date(period, util_start)
        print(f'Utility start: {util_start}')
        print(f'Utility end: {util_end}')
        
        if util_start != start_date or util_end != end_date:
            print('WARNING: Utility functions give different results!')
    finally:
        # Restore original function
        services.utils.datetime.date.today = original_today_func

print(f'\nCurrent actual date: {datetime.now().date()}')
