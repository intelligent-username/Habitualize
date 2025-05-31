import React from "react";
import { getWeekDates, getMonthName, isSameDay } from "./dateUtils";
import { startOfWeek } from "date-fns";

function parseISODateToLocal(isoString) {
    const [year, month, day] = isoString.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

const WeekBar = ({
    currentWeekStart,
    selectedDate,
    onSelectDate,
    onPrevWeek,
    onNextWeek,
    onOpenMonthView,
    onToday
}) => {
    // Always start week on Sunday
    const weekDates = getWeekDates(currentWeekStart);
    const monthName = getMonthName(weekDates[0]);
    const selectedDateObj = parseISODateToLocal(selectedDate);

    return (
        <div className="week-bar">
            <div className="week-bar-header">
                <span className="week-bar-month">{monthName}</span>
                <button className="week-bar-today-btn" onClick={onToday}>Today</button>
                <button className="week-bar-monthview-btn" onClick={onOpenMonthView} title="Open month view">
                    📅
                </button>
            </div>
            <div className="week-bar-days">
                <button className="week-bar-arrow" onClick={onPrevWeek}>&lt;</button>
                {weekDates.map(date => (
                    <button
                        key={date.toISOString()}
                        className={`week-bar-day${isSameDay(date, selectedDateObj) ? " selected" : ""}`}
                        onClick={() => onSelectDate(date)}
                    >
                        {date.getDate()}
                    </button>
                ))}
                <button className="week-bar-arrow" onClick={onNextWeek}>&gt;</button>
            </div>
        </div>
    );
};

export default WeekBar;
