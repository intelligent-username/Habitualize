import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { processWeeklyData, processMonthlyData } from '../utils/chartHelpers';

export function usePomodoroData(dayDate, weekStart, monthDate, graphViewType, graphWeekStart, graphMonthDate) {
  const [stats, setStats] = useState(null);
  const [weekStats, setWeekStats] = useState(null);
  const [monthStats, setMonthStats] = useState(null);
  const [streaks, setStreaks] = useState({ current_day_streak: 0, current_week_streak: 0 });
  const [earliestDate, setEarliestDate] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [isGraphLoading, setIsGraphLoading] = useState(true);

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
      const data = await api.getPomodoroStats("week", weekStartStr);
      setWeekStats(data);
    } catch (e) {
      setWeekStats(null);
    }
  }, []);

  const fetchMonthStats = useCallback(async (monthObj) => {
    try {
      const monthStr = format(monthObj, "yyyy-MM");
      const data = await api.getPomodoroStats("month", monthStr);
      setMonthStats(data);
    } catch (e) {
      setMonthStats(null);
    }
  }, []);

  const fetchStreaks = useCallback(async () => {
    try {
      const data = await api.getPomodoroStreaks();
      setStreaks(data);
    } catch (e) {
      setStreaks({ current_day_streak: 0, current_week_streak: 0 });
    }
  }, []);

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
      if (graphViewType === 'week') {
        const weekStartStr = format(graphWeekStart, "yyyy-MM-dd");
        data = await api.getPomodoroStats("week", weekStartStr);
        processedData = processWeeklyData(data, graphWeekStart);
      } else {
        const monthStr = format(graphMonthDate, "yyyy-MM");
        data = await api.getPomodoroStats("month", monthStr);
        processedData = processMonthlyData(data, graphMonthDate);
      }
      setGraphData(processedData);
    } catch (e) {
      setGraphData([]);
    } finally {
      setIsGraphLoading(false);
    }
  }, [graphViewType, graphWeekStart, graphMonthDate]);

  const refreshAllData = useCallback(() => {
    fetchStats(dayDate);
    fetchWeekStats(weekStart);
    fetchMonthStats(monthDate);
    fetchStreaks();
    fetchEarliestDate();
    fetchGraphData();
  }, [dayDate, weekStart, monthDate, fetchStats, fetchWeekStats, fetchMonthStats, fetchStreaks, fetchEarliestDate, fetchGraphData]);

  useEffect(() => {
    fetchStats(dayDate);
  }, [dayDate, fetchStats]);

  useEffect(() => {
    fetchWeekStats(weekStart);
  }, [weekStart, fetchWeekStats]);

  useEffect(() => {
    fetchMonthStats(monthDate);
  }, [monthDate, fetchMonthStats]);

  useEffect(() => {
    fetchStreaks();
    fetchEarliestDate();
  }, [fetchStreaks, fetchEarliestDate]);

-
  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  return {
    stats, weekStats, monthStats, streaks, earliestDate,
    graphData, isGraphLoading,
    refreshAllData
  };
}
