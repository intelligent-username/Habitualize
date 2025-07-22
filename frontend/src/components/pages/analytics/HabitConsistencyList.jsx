import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const HabitConsistencyList = () => {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitDetails, setHabitDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchHabitsConsistency();
  }, []);

  const fetchHabitsConsistency = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getHabitConsistency();
      console.log('✅ Fetched habits data successfully:', result.length, 'habits');
      setHabits(result);
    } catch (err) {
      console.error('❌ Error fetching habits consistency:', err);
      setError('Failed to load habits data');
    } finally {
      setLoading(false);
    }
  };

  const handleHabitClick = async (habitId) => {
    // Toggle: if clicking the already selected habit, close the details
    if (selectedHabit === habitId) {
      setSelectedHabit(null);
      setHabitDetails(null);
      return;
    }

    try {
      setSelectedHabit(habitId);
      const details = await api.getHabitDetails(habitId);
      setHabitDetails(details);
    } catch (err) {
      console.error('Error fetching habit details:', err);
      setHabitDetails(null);
    }
  };

  const groupedHabits = habits.reduce((groups, habit) => {
    const category = habit.category || 'Uncategorized';
    if (!groups[category]) groups[category] = [];
    groups[category].push(habit);
    return groups;
  }, {});

  // Filter habits based on selected filters
  const filteredHabits = habits.filter(habit => {
    // Type filter
    let typeMatch = true;
    if (typeFilter === 'normal') {
      // Normal habits are single-habit sequences that are NOT cumulative
      typeMatch = habit.is_single_habit === true && habit.is_cumulative === false;
    } else if (typeFilter === 'sequences') {
      // Multi-habit sequences (more than 1 habit in the sequence)
      typeMatch = habit.is_single_habit === false;
    } else if (typeFilter === 'cumulative') {
      // Cumulative habits (regardless of sequence size)
      typeMatch = habit.is_cumulative === true;
    }
    // 'all' case: typeMatch remains true

    // Category filter - use category_name from backend
    const categoryMatch = categoryFilter === 'all' || habit.category_name === categoryFilter;

    return typeMatch && categoryMatch;
  });

  const filteredGroupedHabits = filteredHabits.reduce((groups, habit) => {
    // Group by category for display
    const displayCategory = habit.category_name || 'Uncategorized';
    if (!groups[displayCategory]) groups[displayCategory] = [];
    groups[displayCategory].push(habit);
    return groups;
  }, {});

  // Get unique CATEGORIES from the categories table (not sequence names)
  const uniqueCategories = [...new Set(habits
    .map(h => h.category_name)
    .filter(category => category !== null && category !== undefined && category !== 'Uncategorized')
  )].sort();

  // Debug logging
  console.log('🔍 Debug Info:');
  console.log('  Total habits:', habits.length);
  console.log('  Unique categories:', uniqueCategories);
  console.log('  Active filters:', { typeFilter, categoryFilter });
  console.log('  Filtered habits count:', filteredHabits.length);
  
  // Debug habit properties for filtering issues
  if (typeFilter === 'normal') {
    console.log('  🔎 Normal filter debug:');
    habits.forEach(habit => {
      const isNormal = habit.is_single_habit === true && habit.is_cumulative === false;
      console.log(`    ${habit.name}: single=${habit.is_single_habit}, cumulative=${habit.is_cumulative}, isNormal=${isNormal}`);
    });
  }
  
  if (categoryFilter !== 'all') {
    console.log('  📋 Category filter active for:', categoryFilter);
    console.log('  📋 Habits in this category:', habits.filter(h => h.category_name === categoryFilter).map(h => h.name));
  }

  const getCompletionColor = (percent) => {
    if (percent >= 80) return '#10b981'; // green
    if (percent >= 60) return '#f59e0b'; // yellow
    if (percent >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  if (loading) return <div className="analytics-loading">Loading habits...</div>;
  if (error) return <div className="analytics-error">{error}</div>;

  return (
    <div className="analytics-consistency">
      <div className="analytics-habits-list">
        <div className="analytics-filters">
          <div className="filter-group">
            <label htmlFor="type-filter">Type:</label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Habits</option>
              <option value="normal">Normal Habits</option>
              <option value="sequences">Sequences Only</option>
              <option value="cumulative">Cumulative Only</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => {
                console.log('🏷️ Category filter changed to:', e.target.value);
                setCategoryFilter(e.target.value);
              }}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value="Uncategorized">Uncategorized</option>
            </select>
          </div>
        </div>

        {Object.keys(filteredGroupedHabits).length === 0 ? (
          <div className="analytics-no-data">No habits found</div>
        ) : (
          Object.entries(filteredGroupedHabits).map(([category, categoryHabits]) => (
            <div key={category} className="habits-category">
              <h3 className="category-title">{category}</h3>
              {categoryHabits.map(habit => (
                <div
                  key={habit.habit_id}
                  className={`habit-item ${selectedHabit === habit.habit_id ? 'selected' : ''} ${habit.is_single_habit ? 'single-habit' : 'sequence-habit'} ${habit.is_cumulative ? 'cumulative-habit' : ''}`}
                  onClick={() => handleHabitClick(habit.habit_id)}
                >
                  <div className="habit-info">
                    <span className="habit-name">{habit.name}</span>
                    <div className="habit-badges">
                      <span className="habit-type">({habit.type})</span>
                      {habit.is_cumulative && <span className="cumulative-badge">📊</span>}
                      {!habit.is_single_habit && <span className="sequence-badge">{habit.sequence_habit_count} steps</span>}
                    </div>
                  </div>
                  <div className="habit-percentage">
                    <div
                      className="percentage-bar"
                      style={{
                        '--percentage': `${habit.completion_percent}%`,
                        '--bar-color': getCompletionColor(habit.completion_percent)
                      }}
                    ></div>
                    <span className="percentage-text">
                      {habit.completion_percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {selectedHabit && (
        <div className="analytics-habit-details">
          {habitDetails ? (
            <div className="habit-details-content">
              <h3>{habitDetails.name}</h3>
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{habitDetails.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{habitDetails.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Completion Rate:</span>
                <span 
                  className="detail-value"
                  style={{ color: getCompletionColor(habitDetails.completion_percent) }}
                >
                  {habitDetails.completion_percent}%
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Days Completed:</span>
                <span className="detail-value">
                  {habitDetails.completed_days} / {habitDetails.total_tracked_days}
                </span>
              </div>
              {habitDetails.first_tracked && (
                <div className="detail-item">
                  <span className="detail-label">First Tracked:</span>
                  <span className="detail-value">{habitDetails.first_tracked}</span>
                </div>
              )}
              {habitDetails.last_tracked && (
                <div className="detail-item">
                  <span className="detail-label">Last Tracked:</span>
                  <span className="detail-value">{habitDetails.last_tracked}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="analytics-loading">Loading habit details...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default HabitConsistencyList;
