/**
 * Chart utility functions for Pomodoro statistics
 * Handles data processing and chart configuration for weekly/monthly views
 */

import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { getWeekStartDay } from './timeHelpers';

// Constants
const MIN_DAYS_FOR_MONTHLY = 10;
const MS_TO_SECONDS = 1000;

/**
 * Processes raw weekly pomodoro stats for chart display
 * @param {Array} pomodoroStats - Array of session objects from the API
 * @param {Date} weekStart - The start date of the week
 * @returns {Array} Array of objects with date, label, and timeWorked
 */
export function processWeeklyData(pomodoroStats, weekStart) {
  const currentWeekStartDay = getWeekStartDay();
  
  // Always recalculate the proper week start for the current setting
  const properWeekStart = startOfWeek(weekStart, { weekStartsOn: currentWeekStartDay });
  const properWeekEnd = endOfWeek(properWeekStart, { weekStartsOn: currentWeekStartDay });
  const daysInWeek = eachDayOfInterval({ start: properWeekStart, end: properWeekEnd });

  const timeByDate = buildTimeByDateMap(pomodoroStats);
  
  const result = daysInWeek.map(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const timeWorked = timeByDate[dateKey] || 0;
    
    return {
      date: day,
      label: format(day, 'EEE'),
      timeWorked: timeWorked
    };
  });

  return result;
}

/**
 * Processes raw monthly pomodoro stats for chart display
 * @param {Array} pomodoroStats - Array of session objects from the API
 * @param {Date} monthDate - A date within the target month
 * @returns {Array} Array of objects with date, label, and timeWorked
 */
export function processMonthlyData(pomodoroStats, monthDate) {
  const now = new Date();
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  // Only show days of the current month that have passed (up to today if in this month, or full month if in the past)
  const lastDay = (now.getMonth() === monthDate.getMonth() && now.getFullYear() === monthDate.getFullYear()) ? now : monthEnd;
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: lastDay });
  const timeByDate = buildTimeByDateMap(pomodoroStats);

  return daysInMonth.map(day => ({
    date: day, // Pass Date object directly
    label: format(day, 'd'), // 1, 2, 3, etc.
    timeWorked: timeByDate[format(day, 'yyyy-MM-dd')] || 0
  }));
}

/**
 * Builds a map of date strings to total time worked
 * @param {Array} pomodoroStats - Array of session objects from the API
 * @returns {Object} Map of date strings to time values
 */
function buildTimeByDateMap(pomodoroStats) {
  const timeByDate = {};
  
  pomodoroStats?.forEach(session => {
    // Include ALL sessions that have a numeric time_completed value (including 0)
    if (session.time_completed !== null && session.time_completed !== undefined) {
      // Always convert UTC to local date string for grouping
      const localDate = new Date(session.time_started);
      const dateString = format(localDate, 'yyyy-MM-dd');
      timeByDate[dateString] = (timeByDate[dateString] || 0) + parseFloat(session.time_completed);
    }
  });
  
  return timeByDate;
}

/**
 * Calculates dynamic y-axis ticks and max value for the chart, using standard deviation and data spread.
 * Always includes min and max, adapts tick count to variance.
 * @param {number[]} values - Array of numbers (e.g., minutes worked per day)
 * @returns {Object} { ticks: number[], max: number, stepSize: number }
 */
export function calculateYAxisScale(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return { ticks: [0, 1], max: 1, stepSize: 1 };
  }
  const filtered = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (filtered.length === 0) {
    return { ticks: [0, 1], max: 1, stepSize: 1 };
  }
  const min = Math.min(...filtered, 0);
  const max = Math.max(...filtered, 1);
  const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const variance = filtered.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / filtered.length;
  const std = Math.sqrt(variance);
  const range = max - min;

  // Determine tick count based on variance
  let tickCount;
  if (std < 1e-2 || range < 1e-2) {
    tickCount = 2; // All values are (almost) the same
  } else if (std < 2) {
    tickCount = 3;
  } else if (std < 10) {
    tickCount = 5;
  } else {
    tickCount = 7;
  }
  tickCount = Math.max(2, tickCount);

  // Find a neat step size
  const rawStep = range / (tickCount - 1);
  function niceStep(step) {
    if (step <= 1) return 1;
    if (step <= 2) return 2;
    if (step <= 5) return 5;
    if (step <= 10) return 10;
    if (step <= 15) return 15;
    if (step <= 30) return 30;
    if (step <= 60) return 60;
    return Math.ceil(step / 10) * 10;
  }
  const stepSize = niceStep(rawStep);

  // Start ticks at the lowest neat multiple <= min
  const startTick = Math.floor(min / stepSize) * stepSize;
  // End ticks at the first neat multiple > max
  const endTick = (Math.floor(max / stepSize) + 1) * stepSize;

  // Generate ticks
  const ticks = [];
  for (let t = startTick; t <= endTick; t += stepSize) {
    ticks.push(Number(t.toFixed(6)));
  }

  return { ticks, max: endTick, stepSize };
}

