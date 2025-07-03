import React, { useState, useEffect, useCallback } from "react";
import './App.css';
import { WeekBar, MonthView } from "./components/calendar";
import { addDays, subDays, startOfWeek, parseISO } from 'date-fns';
import { getLocalDateString } from "./utils/timeHelpers.js";
import { CategoryManager } from "./components/categories";
import { HabitDashboard } from "./components/habits";
import { useCategories } from "./hooks/useCategories.js";
import { Sidebar } from "./components/ui";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './pages/SettingsPage.jsx';
import PomodoroPage from './pages/PomodoroPage.jsx';
import QuoteOfTheDayPage from './pages/QuoteOfTheDayPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

const Dashboard = ({
    selectedDate,
    currentWeekStart,
    handleSelectDate,
    handlePrevWeek,
    handleNextWeek,
    handleOpenMonthView,
    handleToday,
    selectCategory,
    selectedCategoryId,
    showMonthView,
    handleCloseMonthView
}) => (
    <div className="container main-content">
        <h1>Habitualize</h1>
        <WeekBar
            currentWeekStart={currentWeekStart}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onOpenMonthView={handleOpenMonthView}
            onToday={handleToday}
        />
        <CategoryManager onCategorySelect={selectCategory} initialSelectedCategoryId={selectedCategoryId} />
        {showMonthView && (
            <MonthView
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onClose={handleCloseMonthView}
            />
        )}
        <HabitDashboard
            selectedDate={selectedDate}
            selectedCategoryId={selectedCategoryId}
        />
        <div className="footer-text">
            <small>
                You can mark completion for any date
            </small>
        </div>
    </div>
);

const App = () => {
    // Date/UI state management
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
    const [showMonthView, setShowMonthView] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 0 })
    );

    // --- Category Management ---
    const { selectedCategoryId, selectCategory } = useCategories();

    useEffect(() => {
        const start = startOfWeek(parseISO(selectedDate), { weekStartsOn: 0 });
        setCurrentWeekStart(start);
    }, [selectedDate]);

    // --- Date/Week Navigation Handlers ---
    const handleSelectDate = (date) => {
        setSelectedDate(getLocalDateString(date));
    };

    const handlePrevWeek = () => {
        const prevWeek = subDays(parseISO(selectedDate), 7);
        setSelectedDate(getLocalDateString(prevWeek));
    };

    const handleNextWeek = () => {
        const nextWeek = addDays(parseISO(selectedDate), 7);
        setSelectedDate(getLocalDateString(nextWeek));
    };

    const handleOpenMonthView = () => setShowMonthView(true);
    const handleCloseMonthView = () => setShowMonthView(false);

    const handleToday = () => {
        setSelectedDate(getLocalDateString(new Date()));
    };

    return (
        <Router>
            <Sidebar />
            <Routes>
                <Route path="/" element={
                    <Dashboard
                        selectedDate={selectedDate}
                        currentWeekStart={currentWeekStart}
                        handleSelectDate={handleSelectDate}
                        handlePrevWeek={handlePrevWeek}
                        handleNextWeek={handleNextWeek}
                        handleOpenMonthView={handleOpenMonthView}
                        handleToday={handleToday}
                        selectCategory={selectCategory}
                        selectedCategoryId={selectedCategoryId}
                        showMonthView={showMonthView}
                        handleCloseMonthView={handleCloseMonthView}
                    />
                } />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/pomodoro" element={<PomodoroPage />} />
                <Route path="/quote-of-the-day" element={<QuoteOfTheDayPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
        </Router>
    );
};

export default App;
