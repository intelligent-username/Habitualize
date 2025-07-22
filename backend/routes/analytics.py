""" Analytics API."""

from flask import Blueprint, jsonify, request
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from imports import *

analytics_bp = Blueprint('analytics', __name__, url_prefix='/analytics')


@analytics_bp.route('/completions', methods=['GET'])
def get_completions_trend():
    """Get habit completion counts grouped by period (daily/weekly/monthly)"""
    period = request.args.get('period', 'daily')  # daily, weekly, monthly
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    # Default to last 30 days if no dates provided
    if not start_date or not end_date:
        end_date = get_today()
        start_date = (datetime.strptime(end_date, '%Y-%m-%d') - timedelta(days=30)).strftime('%Y-%m-%d')
    
    if period == 'daily':
        query = GET_COMPLETIONS_TREND_DAILY
    elif period == 'weekly':
        query = GET_COMPLETIONS_TREND_WEEKLY
    elif period == 'monthly':
        query = GET_COMPLETIONS_TREND_MONTHLY
    else:
        return jsonify({"error": "Invalid period. Use daily, weekly, or monthly"}), 400
    
    results = run_query(query, params=(start_date, end_date))
    return jsonify([{"period": row["period"], "count": row["count"]} for row in results])


@analytics_bp.route('/habit-consistency', methods=['GET'])
def get_habit_consistency():
    """Get completion percentage for all habits based on days since first tracking"""
    query = GET_HABIT_CONSISTENCY
    
    results = run_query(query)
    response_data = []
    
    for row in results:
        # Use first_completed_date instead of first_tracked_date
        first_completed_str = row["first_completed_date"]
        if not first_completed_str:
            continue  # Skip habits that have never been completed
            
        first_completed = datetime.strptime(first_completed_str, '%Y-%m-%d')
        today = datetime.now().date()  # Use date() to avoid time component issues
        
        # Calculate days since first completion
        total_days_since_first_completion = (today - first_completed.date()).days + 1
        completed_days = row["completed_days"] or 0
        completion_percent = round((completed_days / total_days_since_first_completion) * 100, 1) if total_days_since_first_completion > 0 else 0
        # UNIFIED DEFINITION: A habit is cumulative if it has a cumulative_goal set
        is_cumulative = row["cumulative_goal"] is not None
        is_single_habit = row["sequence_habit_count"] == 1
        response_data.append(dict(zip(HABIT_CONSISTENCY_KEYS, [
            row["id"], row["name"], row["type"],
            row["sequence_name"] or "Uncategorized",
            row["category_name"] or "Uncategorized",
            is_cumulative, is_single_habit, row["sequence_habit_count"],
            completion_percent, total_days_since_first_completion, completed_days,
            first_completed_str, row["last_tracked_date"]
        ])))
    
    return jsonify(response_data)


@analytics_bp.route('/habit-consistency/<int:habit_id>', methods=['GET'])
def get_habit_details(habit_id):
    """Get detailed stats for a specific habit"""
    # Get basic habit info
    habit_query = GET_HABIT_DETAILS
    habit_info = run_query(habit_query, params=(habit_id,), fetch='one')
    
    if not habit_info:
        return jsonify({"error": "Habit not found"}), 404
    
    # Get completion stats using the same calculation as the main consistency query
    stats_query = GET_HABIT_DETAILS_STATS
    stats = run_query(stats_query, params=(habit_id,), fetch='one')
    
    # Calculate completion percentage using days since first completion (same as main query)
    if stats["first_completed"]:
        first_completed = datetime.strptime(stats["first_completed"], '%Y-%m-%d')
        today = datetime.now().date()  # Use date() to avoid time component issues
        total_days_since_first_completion = (today - first_completed.date()).days + 1
        completed_days = stats["completed_days"] or 0
        completion_percent = round((completed_days / total_days_since_first_completion) * 100, 1) if total_days_since_first_completion > 0 else 0
    else:
        total_days_since_first_completion = 0
        completed_days = 0
        completion_percent = 0
    
    return jsonify(dict(zip(HABIT_DETAILS_KEYS, [
        habit_id,
        habit_info["name"],
        habit_info["type"],
        habit_info["category"] or "Uncategorized",
        completion_percent,
        total_days_since_first_completion,
        completed_days,
        stats["first_completed"],
        stats["last_tracked"]
    ])))

