import React from "react";
import { COLOR_OPTIONS, formatTime } from "../../utils/constants";
import { useHabitTimer, useHabitCounters } from "../../hooks/useHabitControls.js";

/**
 * HabitItem - Component for displaying and interacting with individual habits
 * Handles different habit types: binary, reverse_binary, timer, counter, entry
 */
export const HabitItem = ({ habit, toggleCompletion, deleteHabit, onEdit, disabled }) => {
    const colorHex = COLOR_OPTIONS.find(opt => opt.value === habit.color)?.hex || "#b0b0b0";
    const textColor = "#fff";

    // Use custom hooks for state management
    const { timer, timerRunning, setTimerRunning, setTimer } = useHabitTimer(habit, toggleCompletion);
    const { counterValue, entryValue, setEntryValue, entryTotal } = useHabitCounters(habit);

    let mainControl = null;
    let withControls = false;

    if (habit.type === "counter") {
        withControls = true;
        const displayValue = `${habit.value || 0}/${habit.target_value || "?"}`;
        mainControl = (
            <>
                <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={e => {
                        toggleCompletion(
                            habit.id,
                            e.target.checked,
                            e.target.checked ? (habit.target_value || 1) : 0
                        );
                    }}
                    style={{ marginRight: 16 }}
                />
                {!habit.completed && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                        <div className="counter-wheel">
                            <button
                                className="counter-wheel-btn"
                                onClick={() => toggleCompletion(habit.id, false, 1)}
                                tabIndex={0}
                            >▲</button>
                            <div className="counter-wheel-value">{habit.value || 0}</div>
                            <button
                                className="counter-wheel-btn"
                                onClick={() => {
                                    if ((habit.value || 0) > 0) {
                                        toggleCompletion(habit.id, false, -1);
                                    }
                                }}
                                tabIndex={0}
                            >▼</button>
                        </div>
                        <span className="habit-progress-outline">
                            {displayValue} completed
                        </span>
                    </div>
                )}
                {habit.completed && (
                    <span className="habit-progress-outline">
                        {displayValue} completed
                    </span>
                )}
            </>
        );
    } else if (habit.type === "entry") {
        withControls = true;
        const displayValue = `${habit.value || 0}/${habit.target_value || "?"}`;
        mainControl = (
            <>
                <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={e => {
                        toggleCompletion(
                            habit.id,
                            e.target.checked,
                            e.target.checked ? (habit.target_value || 1) : 0
                        );
                    }}
                    style={{ marginRight: 16 }}
                />
                {!habit.completed && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                        <input
                            className="entry-input"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={entryValue}
                            onChange={e => setEntryValue(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="Enter value"
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    const addVal = Number(entryValue) || 0;
                                    setEntryValue("");
                                    if (addVal > 0) {
                                        toggleCompletion(habit.id, false, addVal);
                                    }
                                }
                            }}
                        />
                        <button
                            className="timer-btn"
                            style={{ background: "var(--success)" }}
                            onClick={() => {
                                const addVal = Number(entryValue) || 0;
                                setEntryValue("");
                                if (addVal > 0) {
                                    toggleCompletion(habit.id, false, addVal);
                                }
                            }}
                        >
                            Add
                        </button>
                        <span className="habit-progress-outline">
                            {displayValue} completed
                        </span>
                    </div>
                )}
                {habit.completed && (
                    <span className="habit-progress-outline">
                        {displayValue} completed
                    </span>
                )}
            </>
        );
    } else if (habit.type === "timer") {
        withControls = true;
        mainControl = (
            <>
                <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={e => {
                        setTimer(0);
                        setTimerRunning(false);
                        toggleCompletion(habit.id, e.target.checked, e.target.checked ? timer : 0);
                    }}
                    style={{ marginRight: 16 }}
                />
                {!habit.completed ? (
                    <div className="timer-box">
                        <button
                            className="timer-btn"
                            onClick={() => setTimerRunning(r => !r)}
                        >
                            {timerRunning ? "Pause" : "Start"}
                        </button>
                        <span className="timer-display">
                            {formatTime(timer)}
                        </span>
                        <span className="habit-progress-outline">
                            {formatTime(habit.target_value || 0)} target
                        </span>
                    </div>
                ) : (
                    <span className="habit-progress-outline">
                        {formatTime(habit.target_value || timer)} target
                    </span>
                )}
            </>
        );
    } else if (habit.type === "reverse_binary") {
        mainControl = (
            <input
                type="checkbox"
                checked={habit.completed}
                onChange={e => toggleCompletion(habit.id, e.target.checked)}
            />
        );
    } else {
        mainControl = (
            <input
                type="checkbox"
                checked={habit.completed}
                onChange={e => toggleCompletion(habit.id, e.target.checked)}
            />
        );
    }

    return (
        <li
            className={`habit${habit.completed ? " completed" : ""}${withControls ? " with-controls" : ""}${disabled ? " habit-disabled" : ""}`}
            style={{
                backgroundColor: habit.completed ? "#f0f0f0" : colorHex,
                color: textColor,
                borderLeft: `10px solid ${colorHex}`,
                transition: "background-color 0.3s, opacity 0.3s",
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? "none" : "auto",
                filter: disabled ? "grayscale(0.7)" : "none"
            }}
        >
            {mainControl}
            <span className="habit-name">{habit.name}</span>
            {habit.date_created && <span className="habit-date">(Created: {habit.date_created})</span>}
            <button onClick={() => onEdit(habit)} style={{ marginLeft: "1rem" }}>Edit</button>
            <button onClick={() => deleteHabit(habit)} style={{ marginLeft: "0.5rem" }}>Delete</button>
        </li>
    );
};
