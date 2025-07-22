import React, { createContext, useContext, useState, useEffect } from "react";
import { startOfWeek, parseISO, addDays, subDays } from "date-fns";
import { getLocalDateString, initializeWeekStartDay } from "../utils/timeHelpers";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [showMonthView, setShowMonthView] = useState(false);
  const [weekStartDay, setWeekStartDay] = useState(1); // Default to Monday
  const [currentWeekStart, setCurrentWeekStart] = useState(null); // Initialize as null

  // Initialize week start day from backend
  useEffect(() => {
    initializeWeekStartDay().then(day => {
      setWeekStartDay(day);
      // Set initial week start only after we have the correct week start day
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: day }));
    });
  }, []);

  useEffect(() => {
    setCurrentWeekStart(startOfWeek(parseISO(selectedDate), { weekStartsOn: weekStartDay }));
  }, [selectedDate, weekStartDay]);

  const handleSelectDate = (date) => setSelectedDate(getLocalDateString(date));
  const handlePrevWeek = () => setSelectedDate(getLocalDateString(subDays(parseISO(selectedDate), 7)));
  const handleNextWeek = () => setSelectedDate(getLocalDateString(addDays(parseISO(selectedDate), 7)));
  const handleOpenMonthView = () => setShowMonthView(true);
  const handleCloseMonthView = () => setShowMonthView(false);
  const handleToday = () => setSelectedDate(getLocalDateString(new Date()));

  return (
    <UIContext.Provider value={{
      selectedDate, showMonthView, currentWeekStart,
      handleSelectDate, handlePrevWeek, handleNextWeek,
      handleOpenMonthView, handleCloseMonthView, handleToday
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
