import React from "react";
import Icon from "../ui/Icon";
import { COLOR_OPTIONS, formatTime } from "../../utils/constants";
import { useHabitTimer, useHabitCounters } from "../../hooks/useHabitControls.js";
import { useCumulativeProgress } from '../../hooks/useCumulativeProgress';
import { useSettings } from "../../hooks/useSettings.js";

// Universal Component for displaying & interacting w/ individual habits

export const HabitItem = ({ habit, toggleCompletion, deleteHabit, onEdit, disabled, viewedDate }) => {
    const colorHex = COLOR_OPTIONS.find(opt => opt.value === habit.color)?.hex || "#b0b0b0";
    const textColor = "#fff";
    const { getShowHabitIcons } = useSettings();
    const showHabitIcons = getShowHabitIcons() !== undefined ? getShowHabitIcons() : true;

    const { timer, timerRunning, setTimerRunning, setTimer } = useHabitTimer(habit, toggleCompletion);
    const { entryValue, setEntryValue } = useHabitCounters(habit);

    let habitControls = null;
    const isSpecial = habit.type === "counter" || habit.type === "entry" || habit.type === "timer";

    if (habit.type === "counter") {
        const current = habit.value || 0;
        const goal = habit.target_value || 1;
        const displayValue = `${current}/${goal}`;
        habitControls = (
            <div className="counter-control">
                <div className="counter-wheel">
                    <button
                        className="counter-wheel-btn counter-up-btn"
                        onClick={() => {
                            if (current < goal) {
                                toggleCompletion(habit.id, true, current + 1);
                            }
                        }}
                        disabled={current >= goal}
                        title="Increase"
                    >▲</button>
                    <div className="counter-wheel-value">{displayValue}</div>
                    <button
                        className="counter-wheel-btn counter-down-btn"
                        onClick={() => {
                            if (current > 1) {
                                toggleCompletion(habit.id, true, current - 1);
                            } else if (current === 1) {
                                // If decrementing to zero, uncheck (delete history)
                                toggleCompletion(habit.id, false, 0);
                            }
                        }}
                        disabled={current <= 0}
                        title="Decrease"
                    >▼</button>
                </div>
            </div>
        );
    } else if (habit.type === "entry") {
        const current = habit.value || 0;
        const goal = habit.target_value || 1;
        const displayValue = `${current}/${goal}`;
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
                            if (addVal > 0 && current + addVal <= goal) {
                                toggleCompletion(habit.id, true, current + addVal);
                            }
                        }
                    }}
                />
                <button
                    className="entry-submit-btn"
                    onClick={() => {
                        const addVal = Number(entryValue) || 0;
                        setEntryValue("");
                        if (addVal > 0 && current + addVal <= goal) {
                            toggleCompletion(habit.id, true, current + addVal);
                        }
                    }}
                    disabled={current >= goal}
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
    // UNIFIED DEFINITION: A habit is cumulative if it has a cumulative_goal set
    const isCumulative = habit.cumulative_goal != null;
    
    // Always call the hook, but only enable it for cumulative habits
    const { data: progressData, isLoading: progressLoading, error: progressError } = useCumulativeProgress(
        isCumulative ? habit.id : null,
        viewedDate
    );
    
    let cumulativeControls = null;
    let isCompleted = habit.completed;

    if (isCumulative) {
        if (progressLoading) {
            cumulativeControls = <span className="cumulative-progress">Loading...</span>;
        } else if (progressError) {
            cumulativeControls = <span className="cumulative-progress error">Error</span>;
        } else if (progressData) {
            const { progress, goal, period, is_complete } = progressData;
            const percent = Math.min(100, (progress / goal) * 100);
            const isLoading = progressLoading;
            isCompleted = is_complete;
            cumulativeControls = (
                <div className="cumulative-progress-bar" style={{ width: '100%' }}>
                    <button
                        className="cumulative-counter-btn"
                        onClick={() => {
                            console.log('Decrement clicked for habit', habit.id, 'removing 1 from current progress:', progress);
                            toggleCompletion(habit.id, true, -1);
                        }}
                        disabled={isLoading || progress <= 0}
                        title="Remove 1"
                        aria-label="Remove 1"
                    >
                        ▼
                    </button>
                    <div
                        className={`cumulative-progress-bar-main${isCompleted ? ' filled' : ''}`}
                        data-diagonal="true"
                        style={{ width: '100%', minWidth: 0 }}
                    >
                        <div
                            className="cumulative-progress-fill"
                            style={{ width: percent + '%' }}
                        />
                        <div className="cumulative-progress-value">
                            {progress}/{goal} <span style={{ fontSize: '0.95rem', color: '#b0ffb0', opacity: 0.7 }}>({period})</span>
                        </div>
                    </div>
                    <button
                        className="cumulative-counter-btn"
                        onClick={() => {
                            console.log('Increment clicked for habit', habit.id, 'adding 1 to current progress:', progress);
                            toggleCompletion(habit.id, true, 1);
                        }}
                        disabled={isLoading || progress >= goal}
                        title="Add 1"
                        aria-label="Add 1"
                    >
                        ▲
                    </button>
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
            // For counter/entry habits: send a positive value when marking as complete
            const goal = habit.target_value || 1;
            valueToLog = isChecked ? goal : 0;
            toggleCompletion(habit.id, isChecked, valueToLog);
            return;
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
            {showHabitIcons && <Icon iconName={habit.icon} className="habit-icon" alt={`${habit.name} icon`} />}
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
                            disabled={disabled}
                            title={habit.type === "counter" ? "Mark as complete" : "Mark as complete"}
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
