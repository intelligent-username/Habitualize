// Dashboard for App.jsx (main)

import React from "react";
import { WeekBar, MonthView } from "../calendar";
import { CategoryManager } from "../categories";
import { HabitDashboard } from "../habits";
import { useCategories } from "../../hooks/useCategories.js";
import { useUI } from "../../context/UIContext.jsx";

const Dashboard = () => {
    const {
        selectedDate,
        currentWeekStart,
        handleSelectDate,
        handlePrevWeek,
        handleNextWeek,
        handleOpenMonthView,
        handleToday,
        showMonthView,
        handleCloseMonthView
    } = useUI();
    const { selectedCategoryId, selectCategory } = useCategories();
    return (
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
};

export default Dashboard;

