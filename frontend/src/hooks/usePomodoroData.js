import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { processWeeklyData, processMonthlyData } from '../utils/chartHelpers';
import { getWeekStartDay } from '../utils/timeHelpers';

export function usePomodoroData(dayDate, weekStart, monthDate, graphViewType, graphWeekStart, graphMonthDate) {
  const [stats, setStats] = useState(null);
  const [weekStats, setWeekStats] = useState(null);
  const [monthStats, setMonthStats] = useState(null);
  const [streaks, setStreaks] = useState({ current_day_streak: 0, current_week_streak: 0 });
  const [earliestDate, setEarliestDate] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [isGraphLoading, setIsGraphLoading] = useState(true);
  const [weekStartDay, setWeekStartDayState] = useState(getWeekStartDay());

  // Watch for week start day changes
  useEffect(() => {
    const currentWeekStartDay = getWeekStartDay();
    if (currentWeekStartDay !== weekStartDay) {
      setWeekStartDayState(currentWeekStartDay);
    }
  }, [weekStartDay]);

  const fetchStats = useCallback(async (dateObj) => {
    try {
      const dateStr = format(dateObj, "yyyy-MM-dd");
      const data = await api.getPomodoroStats("day", dateStr);
      setStats(data);
    } catch (e) {
      setStats(null);
    }
  }, []);

  const fetchWeekStats = useCallback(async (weekStartObj) => {
    try {
      const weekStartStr = format(weekStartObj, "yyyy-MM-dd");
      const weekStartDay = getWeekStartDay();
      const data = await api.getPomodoroStats("week", weekStartStr, weekStartDay);
      setWeekStats(data);
    } catch (e) {
      setWeekStats(null);
    }
  }, [weekStartDay]);

  const fetchMonthStats = useCallback(async (monthObj) => {
    try {
      const monthStr = format(monthObj, "yyyy-MM");
      const weekStartDay = getWeekStartDay();
      const data = await api.getPomodoroStats("month", monthStr, weekStartDay);
      setMonthStats(data);
    } catch (e) {
      setMonthStats(null);
    }
  }, [weekStartDay]);

  const fetchStreaks = useCallback(async () => {
    try {
      const weekStartDay = getWeekStartDay();
      const data = await api.getPomodoroStreaks(weekStartDay);
      setStreaks(data);
    } catch (e) {
      setStreaks({ current_day_streak: 0, current_week_streak: 0 });
    }
  }, [weekStartDay]);

  const fetchEarliestDate = useCallback(async () => {
    try {
      const data = await api.getEarliestPomodoroDate();
      setEarliestDate(new Date(data.earliest_date));
    } catch (e) {
      setEarliestDate(null);
    }
  }, []);

  const fetchGraphData = useCallback(async () => {
    setIsGraphLoading(true);
    try {
      let data, processedData;
      const weekStartDay = getWeekStartDay();
      
      if (graphViewType === 'week') {
        const weekStartStr = format(graphWeekStart, "yyyy-MM-dd");
        data = await api.getPomodoroStats("week", weekStartStr, weekStartDay);
        processedData = processWeeklyData(data, graphWeekStart);
      } else {
        const monthStr = format(graphMonthDate, "yyyy-MM");
        data = await api.getPomodoroStats("month", monthStr, weekStartDay);
        processedData = processMonthlyData(data, graphMonthDate);
      }
      setGraphData(processedData);
    } catch (e) {
      console.error('❌ Graph data fetch error:', e);
      setGraphData([]);
    } finally {
      setIsGraphLoading(false);
    }
  }, [graphViewType, graphWeekStart, graphMonthDate, weekStartDay]);

  const refreshAllData = useCallback(() => {
    fetchStats(dayDate);
    fetchWeekStats(weekStart);
    fetchMonthStats(monthDate);
    fetchStreaks();
    fetchEarliestDate();
    fetchGraphData();
  }, [dayDate, weekStart, monthDate, fetchStats, fetchWeekStats, fetchMonthStats, fetchStreaks, fetchEarliestDate, fetchGraphData, weekStartDay]);

  useEffect(() => {
    fetchStats(dayDate);
  }, [dayDate, fetchStats]);

  useEffect(() => {
    fetchWeekStats(weekStart);
  }, [weekStart, fetchWeekStats, weekStartDay]);

  useEffect(() => {
    fetchMonthStats(monthDate);
  }, [monthDate, fetchMonthStats, weekStartDay]);

  useEffect(() => {
    fetchStreaks();
    fetchEarliestDate();
  }, [fetchStreaks, fetchEarliestDate, weekStartDay]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData, weekStartDay]);

  return {
    stats, weekStats, monthStats, streaks, earliestDate,
    graphData, isGraphLoading,
    refreshAllData
  };
}
