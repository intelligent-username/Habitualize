const { runQuery } = require('./db');
const { getToday, calculateStartDate, calculateEndDate } = require('./utils');
const queries = require('../queries');

async function getCumulativeProgressDetails(habitId, date = null) {
  const goalDetails = await runQuery(queries.FETCH_HABIT_GOAL_DETAILS, [habitId], 'one');
  if (!goalDetails) return null;
  const goal = goalDetails.cumulative_goal;
  const period = goalDetails.cumulative_period;
  if (goal == null || !period) return null;

  const startDate = calculateStartDate(period, 'sunday', date);
  const endDate = calculateEndDate(period, startDate);
  if (!startDate || !endDate) return null;

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const progressRow = await runQuery(queries.FETCH_CUMULATIVE_SO_FAR, [habitId, startStr, endStr], 'one');
  const progress = progressRow && progressRow[0] != null ? Number(progressRow[0]) : 0;
  const goalNum = Number(goal);
  const isComplete = progress >= goalNum;
  return { progress, goal: goalNum, period, is_complete: isComplete };
}

async function updateHabitCompletionStatus(habitId, date, completed, value) {
  const habitDetails = await runQuery(queries.FETCH_TYPE_AND_CUMULATIVE, [habitId], 'one');
  if (!habitDetails) return { error: 'Habit not found' };

  const isCumulative = habitDetails.cumulative_goal != null;

  if (isCumulative) {
    const existing = await runQuery(queries.FETCH_HABIT_HISTORY_ENTRY, [habitId, date], 'one');
    if (existing) {
      const currentValue = existing.value || 0;
      const newTotal = currentValue + value;
      if (newTotal <= 0) {
        await runQuery(queries.DEL_HISTORY_BY_DATE, [habitId, date]);
      } else {
        await runQuery(queries.UPDATE_HABIT_HISTORY_ENTRY, [0, newTotal, habitId, date]);
      }
    } else {
      if (value > 0) {
        await runQuery(queries.MAKE_CONTRIBUTION, [habitId, date, 0, value]);
      }
    }
    return { message: 'Cumulative habit updated' };
  } else {
    if (completed === 0) {
      await runQuery(queries.DEL_HISTORY_BY_DATE, [habitId, date]);
    } else {
      const existing = await runQuery(queries.FETCH_HABIT_HISTORY_ENTRY, [habitId, date], 'one');
      if (existing) {
        await runQuery(queries.UPDATE_HABIT_HISTORY_ENTRY, [completed, value, habitId, date]);
      } else {
        await runQuery(queries.MAKE_CONTRIBUTION, [habitId, date, completed, value]);
      }
    }
    return { message: 'Habit completion updated' };
  }
}

async function updateHabitDetails(habitId, payload) {
  const fields = [];
  const params = [];
  for (const key of ['name', 'type', 'target_value', 'cumulative', 'cumulative_goal', 'cumulative_period', 'sequence_id', 'step_order', 'icon']) {
    if (payload[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(payload[key]);
    }
  }
  if (fields.length === 0) {
    return { error: 'No fields to update' };
  }
  params.push(habitId);
  const sql = `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`;
  await runQuery(sql, params);
  return { message: 'Habit updated' };
}

module.exports = { getCumulativeProgressDetails, updateHabitCompletionStatus, updateHabitDetails };
