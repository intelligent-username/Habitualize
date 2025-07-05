import React, { createContext, useContext, useState, useEffect } from "react";
import { startOfWeek, parseISO, addDays, subDays } from "date-fns";
import { getLocalDateString } from "../utils/timeHelpers";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [showMonthView, setShowMonthView] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  useEffect(() => {
    setCurrentWeekStart(startOfWeek(parseISO(selectedDate), { weekStartsOn: 0 }));
  }, [selectedDate]);

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
