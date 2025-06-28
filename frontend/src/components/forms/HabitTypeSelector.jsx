import React from "react";
import { TimerPicker } from "../ui";
import { isMobile } from "../../utils/constants";

/**
 * HabitTypeSelector - Component for selecting habit type and configuring type-specific options
 * Handles binary, reverse_binary, timer, counter, and entry-based habit types
 */
const HabitTypeSelector = ({
    type,
    setType,
    targetValue,
    setTargetValue,
    timerHours,
    timerMinutes,
    timerSeconds,
    setTimerHours,
    setTimerMinutes,
    setTimerSeconds
}) => {
    return (
        <>
            <label className="habit-form-label" style={{ marginTop: "1rem" }}>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="binary">Binary (Done/Undone)</option>
                <option value="reverse_binary">Reverse Binary (Fail if unchecked)</option>
                <option value="timer">Timer</option>
                <option value="counter">Counter</option>
                <option value="entry">Entry-based</option>
            </select>
            
            {type === "timer" ? (
                <>
                    <label className="habit-form-label" style={{ marginTop: "1rem" }}>
                        Target Time
                    </label>
                    {isMobile() ? (
                        // Mobile: scroll wheel picker
                        <TimerPicker
                            hours={timerHours}
                            minutes={timerMinutes}
                            seconds={timerSeconds}
                            setHours={setTimerHours}
                            setMinutes={setTimerMinutes}
                            setSeconds={setTimerSeconds}
                        />
                    ) : (
                        // Desktop: single input for seconds
                        <input
                            type="number"
                            min="1"
                            value={targetValue}
                            onChange={e => setTargetValue(e.target.value)}
                            placeholder="Seconds"
                            style={{ width: 120 }}
                        />
                    )}
                </>
            ) : (["counter", "entry"].includes(type) && (
                <>
                    <label className="habit-form-label" style={{ marginTop: "1rem" }}>
                        Target Value
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={targetValue}
                        onChange={e => setTargetValue(e.target.value)}
                        placeholder="Target"
                    />
                </>
            ))}
        </>
    );
};

export default HabitTypeSelector;
