import sys
sys.path.append('.')

from datetime import datetime, timedelta

print('=== MONTHLY PERIOD EDGE CASE TEST ===')

def test_monthly_calculation(test_date):
    """Test monthly period calculation for a given date"""
    print(f'Testing date: {test_date}')
    
    # Calculate start and end for monthly period (mimicking our backend logic)
    start_date = test_date.replace(day=1)
    next_month = start_date.replace(day=28) + timedelta(days=4)
    end_date = next_month.replace(day=1) - timedelta(days=1)
    
    print(f'Start: {start_date}')
    print(f'End: {end_date}')
    print(f'Days in month: {(end_date - start_date).days + 1}')
    return start_date, end_date

# Test different dates
test_dates = [
    datetime(2025, 7, 5).date(),   # Current date (July 5, 2025)
    datetime(2025, 7, 1).date(),   # First day of July
    datetime(2025, 7, 31).date(),  # Last day of July
    datetime(2025, 8, 1).date(),   # First day of August
    datetime(2025, 6, 30).date(),  # Last day of June
    datetime(2025, 2, 15).date(),  # February (28 days)
    datetime(2024, 2, 15).date(),  # February in leap year (29 days)
]

for test_date in test_dates:
    print(f'\n--- {test_date} ---')
    start, end = test_monthly_calculation(test_date)

print(f'\nActual current date: {datetime.now().date()}')
