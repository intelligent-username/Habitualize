import React from "react";
import Icon from "../ui/Icon";
import { COLOR_OPTIONS, formatTime } from "../../utils/constants";
import { useHabitTimer, useHabitCounters } from "../../hooks/useHabitControls.js";

/**
 * HabitItem - Component for displaying and interacting with individual habits
 * Handles different habit types with a universal layout.
 */
export const HabitItem = ({ habit, toggleCompletion, deleteHabit, onEdit, disabled }) => {
    const colorHex = COLOR_OPTIONS.find(opt => opt.value === habit.color)?.hex || "#b0b0b0";
    const textColor = "#fff";

    // Use custom hooks for state management
    const { timer, timerRunning, setTimerRunning, setTimer } = useHabitTimer(habit, toggleCompletion);
    const { entryValue, setEntryValue } = useHabitCounters(habit);

    let habitControls = null;
    const isSpecial = habit.type === "counter" || habit.type === "entry" || habit.type === "timer";

    // --- Define controls based on habit type ---
    if (habit.type === "counter") {
        const displayValue = `${habit.value || 0}/${habit.target_value || "?"}`;
        habitControls = (
            <div className="habit-control-display counter-control">
                <div className="counter-wheel">
                    <button className="counter-wheel-btn" onClick={() => toggleCompletion(habit.id, false, 1)}>▲</button>
                    <div className="counter-wheel-value">{habit.value || 0}</div>
                    <button className="counter-wheel-btn" onClick={() => { if ((habit.value || 0) > 0) { toggleCompletion(habit.id, false, -1); } }}>▼</button>
                </div>
                <span className="habit-progress-outline">{displayValue}</span>
            </div>
        );
    } else if (habit.type === "entry") {
        const displayValue = `${habit.value || 0}/${habit.target_value || "?"}`;
        habitControls = (
            <div className="habit-control-display entry-control">
                <input
                    className="entry-input"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={entryValue}
                    onChange={e => setEntryValue(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Val"
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            const addVal = Number(entryValue) || 0;
                            setEntryValue("");
                            if (addVal > 0) toggleCompletion(habit.id, false, addVal);
                        }
                    }}
                />
                <button
                    className="entry-submit-btn"
                    onClick={() => {
                        const addVal = Number(entryValue) || 0;
                        setEntryValue("");
                        if (addVal > 0) toggleCompletion(habit.id, false, addVal);
                    }}
                >Add</button>
                <span className="habit-progress-outline">{displayValue}</span>
            </div>
        );
    } else if (habit.type === "timer") {
        habitControls = (
            <div className="habit-control-display timer-control">
                <button className="timer-btn" onClick={() => setTimerRunning(r => !r)}>
                    {timerRunning ? "Pause" : "Start"}
                </button>
                <span className="timer-display">{formatTime(timer)}</span>
                <span className="habit-progress-outline">{formatTime(habit.target_value || 0)}</span>
            </div>
        );
    }

    // --- Universal checkbox handler ---
    const handleCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        let valueToLog = isChecked ? 1 : 0; // Default for binary

        if (habit.type === "timer") {
            setTimer(0);
            setTimerRunning(false);
            valueToLog = isChecked ? timer : 0;
        } else if (habit.type === "counter" || habit.type === "entry") {
            valueToLog = isChecked ? (habit.target_value || 1) : 0;
        }
        
        toggleCompletion(habit.id, isChecked, valueToLog);
    };

    return (
        <li
            className={`habit${habit.completed ? " completed" : ""}${disabled ? " habit-disabled" : ""}`}
            style={{
                backgroundColor: habit.completed ? "var(--bg-tertiary)" : colorHex,
                color: textColor,
                borderLeft: `10px solid ${colorHex}`,
                transition: "background-color 0.3s, opacity 0.3s",
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? "none" : "auto",
                filter: disabled ? "grayscale(0.7)" : "none"
            }}
        >
            <Icon iconName={habit.icon} className="habit-icon" alt={`${habit.name} icon`} />
            <span className="habit-name">{habit.name}</span>
            <div className="habit-right-grid">
                <button onClick={() => onEdit(habit)} className="habit-action-btn habit-edit-btn" title="Edit">
                  <span role="img" aria-label="Edit">🖉</span>
                </button>
                <button onClick={() => deleteHabit(habit)} className="habit-action-btn habit-delete-btn" title="Delete">
                  <span role="img" aria-label="Delete">🗑️</span>
                </button>
                <input
                    type="checkbox"
                    className="habit-checkbox"
                    checked={habit.completed}
                    onChange={handleCheckboxChange}
                />
                {isSpecial && (
                    <div className="habit-controls">
                        {habitControls}
                    </div>
                )}
            </div>
        </li>
    );
};
