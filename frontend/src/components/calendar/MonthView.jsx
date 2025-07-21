// import React from "react";
import React, { useState } from "react";
import { getDaysInMonth } from "../../utils/timeHelpers";

// Helper to get ISO week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

const MonthView = ({ selectedDate, onSelectDate, onClose }) => {
    const initialDate = new Date(selectedDate);
    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    // Find the day of week the month starts on (0 = Sunday)
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // Build calendar grid as weeks
    const weeks = [];
    let week = [];
    let dayIdx = 0;
    // Fill first week with nulls if needed
    for (let i = 0; i < firstDayOfWeek; i++) {
        week.push(null);
        dayIdx++;
    }
    for (let d = 1; d <= daysInMonth; d++) {
        week.push(new Date(year, month, d));
        dayIdx++;
        if (dayIdx % 7 === 0) {
            weeks.push(week);
            week = [];
        }
    }
    if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
    }
    // Always render 6 weeks for consistent height
    while (weeks.length < 6) {
        weeks.push(Array(7).fill(null));
    }

    // Navigation handlers
    const handlePrevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    const handleToday = () => {
        const today = new Date();
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    // Get week number for each week (use first non-null day)
    const weekNumbers = weeks.map(weekArr => {
        const firstDay = weekArr.find(d => d);
        return firstDay ? getWeekNumber(firstDay) : null;
    });

    return (
        <div className="month-view-modal">
            <div className="month-view-content">
                <button className="month-view-close" onClick={onClose}>×</button>
                <div className="month-view-header-nav">
                    <button className="month-view-nav-btn" onClick={handlePrevMonth} aria-label="Previous Month">‹</button>
                    <div className="month-view-header">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button className="month-view-nav-btn" onClick={handleNextMonth} aria-label="Next Month">›</button>
                </div>
                <button className="month-view-today-btn" onClick={handleToday}>Today</button>
                <div className="month-view-grid-with-weeks">
                    {/* Header row: empty cell for weeknum, then day names */}
                    <div className="month-view-weeknum-empty"></div>
                    {["S", "M", "T", "W", "T", "F", "S"].map(d => (
                        <div key={d} className="month-view-dayname">{d}</div>
                    ))}
                    {/* Weeks: each row starts with weeknum, then 7 days */}
                    {weeks.map((weekArr, wi) => [
                        <div key={`weeknum-${wi}`} className="month-view-weeknum">{weekNumbers[wi] ? `W${weekNumbers[wi]}` : ""}</div>,
                        ...weekArr.map((d, di) =>
                            d ? (
                                <button
                                    key={d.toISOString()}
                                    className={`month-view-day${d.toDateString() === new Date(selectedDate).toDateString() ? " selected" : ""}${d.toDateString() === new Date().toDateString() ? " today" : ""}`}
                                    onClick={() => { onSelectDate(d); onClose(); }}
                                >
                                    {d.getDate()}
                                </button>
                            ) : (
                                <div key={`empty-${wi}-${di}`} className="month-view-empty"></div>
                            )
                        )
                    ])}
                </div>
            </div>
        </div>
    );
};

export default MonthView;
