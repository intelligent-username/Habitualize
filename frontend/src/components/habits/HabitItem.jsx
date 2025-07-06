import React from "react";
import Icon from "../ui/Icon";
import { COLOR_OPTIONS, formatTime } from "../../utils/constants";
import { useHabitTimer, useHabitCounters } from "../../hooks/useHabitControls.js";
import { useCumulativeProgress } from '../../hooks/useCumulativeProgress';

/**
 * HabitItem - Component for displaying and interacting with individual habits
 * Handles different habit types with a universal layout.
 */
export const HabitItem = ({ habit, toggleCompletion, deleteHabit, onEdit, disabled }) => {
    const colorHex = COLOR_OPTIONS.find(opt => opt.value === habit.color)?.hex || "#b0b0b0";
    const textColor = "#fff";

    const { timer, timerRunning, setTimerRunning, setTimer } = useHabitTimer(habit, toggleCompletion);
    const { entryValue, setEntryValue } = useHabitCounters(habit);

    let habitControls = null;
    const isSpecial = habit.type === "counter" || habit.type === "entry" || habit.type === "timer";

    if (habit.type === "counter") {
        const displayValue = `${habit.value || 0}/${habit.target_value || "?"}`;
        habitControls = (
            <div className="counter-control">
                <div className="counter-wheel">
                    <button
                        className="counter-wheel-btn counter-up-btn"
                        onClick={() => toggleCompletion(habit.id, false, 1)}
                        disabled={habit.completed}
                        title="Increase"
                    >▲</button>
                    <div className="counter-wheel-value">{displayValue}</div>
                    <button
                        className="counter-wheel-btn counter-down-btn"
                        onClick={() => { if ((habit.value || 0) > 0) { toggleCompletion(habit.id, false, -1); } }}
                        disabled={false}
                        title="Decrease"
                    >▼</button>
                </div>
            </div>
        );
    } else if (habit.type === "entry") {
        const displayValue = `${habit.value || 0}/${habit.target_value || "?"}`;
        habitControls = (
            <div className="entry-control">
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
                <span className="counter-progress">{displayValue}</span>
            </div>
        );
    } else if (habit.type === "timer") {
        habitControls = (
            <div className="timer-control">
                <button
                    className="timer-start-btn"
                    onClick={() => setTimerRunning(r => !r)}
                    disabled={habit.completed}
                >
                    {timerRunning ? "Pause" : "Start"}
                </button>
                <span className="timer-display">{formatTime(timer)}</span>
                <span className="timer-goal">{formatTime(habit.target_value || 0)}</span>
            </div>
        );
    }

    // Cumulative habit display and input logic
    const isCumulative = habit.cumulative === 1 || habit.cumulative === true;
    let cumulativeControls = null;
    let isCompleted = habit.completed;

    if (isCumulative) {
        const { data: progressData, isLoading: progressLoading, error: progressError } = useCumulativeProgress(habit.id);
        if (progressLoading) {
            cumulativeControls = <span className="cumulative-progress">Loading...</span>;
        } else if (progressError) {
            cumulativeControls = <span className="cumulative-progress error">Error</span>;
        } else if (progressData) {
            const { progress, goal, period, is_complete } = progressData;
            const displayValue = `${progress}/${goal}`;
            isCompleted = is_complete;
            cumulativeControls = (
                <div className="cumulative-control">
                    <div className="counter-wheel">
                        <button
                            className="counter-wheel-btn counter-up-btn"
                            onClick={() => toggleCompletion(habit.id, false, 1)}
                            disabled={progress >= goal}
                            title="Add 1"
                        >▲</button>
                        <div className="counter-wheel-value">
                            {displayValue} <span className="cumulative-period">({period})</span>
                        </div>
                        <button
                            className="counter-wheel-btn counter-down-btn"
                            onClick={() => { if (progress > 0) { toggleCompletion(habit.id, false, -1); } }}
                            disabled={progress <= 0}
                            title="Remove 1"
                        >▼</button>
                    </div>
                    <progress value={progress} max={goal} style={{ width: '100%', marginTop: 4 }} />
                </div>
            );
        }
    }

    // Define handleCheckboxChange for non-cumulative habits
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
            className={`habit${isCompleted ? " completed" : ""}${disabled ? " habit-disabled" : ""}`}
            style={{
                backgroundColor: isCompleted ? "var(--bg-tertiary)" : colorHex,
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
            <div className="habit-right">
                <div className="habit-actions-row">
                    <button onClick={() => onEdit(habit)} className="habit-action-btn habit-edit-btn" title="Edit">
                      <span role="img" aria-label="Edit">🖉</span>
                    </button>
                    <button onClick={() => deleteHabit(habit)} className="habit-action-btn habit-delete-btn" title="Delete">
                      <span role="img" aria-label="Delete">🗑️</span>
                    </button>
                    {!isCumulative && (
                        <input
                            type="checkbox"
                            className="habit-checkbox"
                            checked={isCompleted}
                            onChange={handleCheckboxChange}
                        />
                    )}
                </div>
                {isCumulative && (
                    <div className="habit-controls">
                        {cumulativeControls}
                    </div>
                )}
                {!isCumulative && isSpecial && (
                    <div className="habit-controls">
                        {habitControls}
                    </div>
                )}
            </div>
        </li>
    );
};
