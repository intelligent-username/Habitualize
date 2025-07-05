import { useState, useCallback } from 'react';
import { addDays, subDays, format, startOfWeek, addWeeks, subWeeks, startOfMonth, addMonths, subMonths, getWeek, getWeekYear, isThisYear, isToday, isThisWeek, isThisMonth, differenceInDays } from "date-fns";

export function usePomodoroNavigation(earliestDate, isCompact) {
  const [dayDate, setDayDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [monthDate, setMonthDate] = useState(startOfMonth(new Date()));
  const [graphViewType, setGraphViewType] = useState('week');
  const [graphWeekStart, setGraphWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [graphMonthDate, setGraphMonthDate] = useState(startOfMonth(new Date()));

  const handlePrevDay = () => {
    if (!earliestDate || dayDate > earliestDate) setDayDate(subDays(dayDate, 1));
  };
  const handleNextDay = () => {
    if (!isToday(dayDate)) setDayDate(addDays(dayDate, 1));
  };
  const handleReturnToToday = () => setDayDate(new Date());

  const handlePrevWeek = () => {
    if (!earliestDate || weekStart > earliestDate) setWeekStart(subWeeks(weekStart, 1));
  };
  const handleNextWeek = () => {
    if (!isThisWeek(weekStart, { weekStartsOn: 0 })) setWeekStart(addWeeks(weekStart, 1));
  };
  const handleReturnToWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const handlePrevMonth = () => {
    if (!earliestDate || monthDate > earliestDate) setMonthDate(subMonths(monthDate, 1));
  };
  const handleNextMonth = () => {
    if (!isThisMonth(monthDate)) setMonthDate(addMonths(monthDate, 1));
  };
  const handleReturnToMonth = () => setMonthDate(startOfMonth(new Date()));

  const handleGraphPrevious = () => {
    if (graphViewType === 'week') {
      setGraphWeekStart(subWeeks(graphWeekStart, 1));
    } else {
      setGraphMonthDate(subMonths(graphMonthDate, 1));
    }
  };

  const handleGraphNext = () => {
    if (graphViewType === 'week') {
      if (!isThisWeek(graphWeekStart, { weekStartsOn: 0 })) {
        setGraphWeekStart(addWeeks(graphWeekStart, 1));
      }
    } else {
      if (!isThisMonth(graphMonthDate)) {
        setGraphMonthDate(addMonths(graphMonthDate, 1));
      }
    }
  };

  const handleGraphReturnToCurrent = () => {
    if (graphViewType === 'week') {
      setGraphWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
    } else {
      setGraphMonthDate(startOfMonth(new Date()));
    }
  };

  const getGraphTitle = useCallback(() => {
    if (graphViewType === 'week') {
      if (isThisWeek(graphWeekStart, { weekStartsOn: 0 })) return "This Week's Progress";
      return `Week of ${format(graphWeekStart, 'MMM do')}`;
    } else {
      if (isThisMonth(graphMonthDate)) return "This Month's Progress";
      return format(graphMonthDate, 'MMMM yyyy');
    }
  }, [graphViewType, graphWeekStart, graphMonthDate]);

  const getDayLabel = useCallback(() => {
    if (isToday(dayDate)) return isCompact ? "Today" : "Today's Stats";
    if (isToday(addDays(dayDate, 1))) return isCompact ? "Yesterday" : "Yesterday's Stats";
    const daysDiff = differenceInDays(new Date(), dayDate);
    if (daysDiff > 1 && daysDiff < 7) return `${format(dayDate, "EEEE")}${isCompact ? '' : "'s Stats"}`;
    if (isThisYear(dayDate)) return `${format(dayDate, "MMMM do")}${isCompact ? '' : "'s Stats"}`;
    return `${format(dayDate, "MMMM do, yyyy")}${isCompact ? '' : "'s Stats"}`;
  }, [dayDate, isCompact]);

  const getWeekLabel = useCallback(() => {
    const options = { weekStartsOn: 0 };
    if (isThisWeek(weekStart, options)) return isCompact ? "This Week" : "This Week's Stats";
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), options);
    if (weekStart.getTime() === lastWeekStart.getTime()) return isCompact ? "Last Week" : "Last Week's Stats";
    
    const weekNum = getWeek(weekStart, options);
    const year = getWeekYear(weekStart, options);
    const displayYear = year !== new Date().getFullYear();
    return isCompact ? `Week ${weekNum}` : `Week ${weekNum}${displayYear ? `, ${year}` : ""} Stats`;
  }, [weekStart, isCompact]);

  const getMonthLabel = useCallback(() => {
    if (isThisMonth(monthDate)) return isCompact ? "This Month" : "This Month's Stats";
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    if (monthDate.getTime() === lastMonthStart.getTime()) return isCompact ? "Last Month" : "Last Month's Stats";
    
    return isCompact
      ? `${format(monthDate, isThisYear(monthDate) ? "MMM" : "MMM yyyy")}`
      : `${format(monthDate, isThisYear(monthDate) ? "MMMM" : "MMMM, yyyy")}'s Stats`;
  }, [monthDate, isCompact]);

  return {
    dayDate, weekStart, monthDate,
    graphViewType, graphWeekStart, graphMonthDate,
    setDayDate, setGraphViewType,
    handlePrevDay, handleNextDay, handleReturnToToday,
    handlePrevWeek, handleNextWeek, handleReturnToWeek,
    handlePrevMonth, handleNextMonth, handleReturnToMonth,
    handleGraphPrevious, handleGraphNext, handleGraphReturnToCurrent,
    getGraphTitle, getDayLabel, getWeekLabel, getMonthLabel
  };
}
