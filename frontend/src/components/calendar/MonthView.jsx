import React from "react";
import { getDaysInMonth } from "../../utils/timeHelpers";

const MonthView = ({ selectedDate, onSelectDate, onClose }) => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    // Find the day of week the month starts on (0 = Sunday)
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // Build calendar grid
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        days.push(new Date(year, month, d));
    }

    return (
        <div className="month-view-modal">
            <div className="month-view-content">
                <button className="month-view-close" onClick={onClose}>×</button>
                <div className="month-view-header">
                    {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="month-view-grid">
                    {["S", "M", "T", "W", "T", "F", "S"].map(d => (
                        <div key={d} className="month-view-dayname">{d}</div>
                    ))}
                    {days.map((d, i) =>
                        d ? (
                            <button
                                key={d.toISOString()}
                                className={`month-view-day${d.toDateString() === new Date(selectedDate).toDateString() ? " selected" : ""}`}
                                onClick={() => { onSelectDate(d); onClose(); }}
                            >
                                {d.getDate()}
                            </button>
                        ) : (
                            <div key={i} className="month-view-empty"></div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthView;
