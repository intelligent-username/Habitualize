import React from "react";

/**
 * For selecting hours, minutes, and seconds
 * Used in habit forms for timer-based habits
 */
const TimerPicker = ({ hours, minutes, seconds, setHours, setMinutes, setSeconds }) => (
    <div className="timer-picker-row">
        <select 
            className="timer-picker" 
            value={hours} 
            onChange={e => setHours(Number(e.target.value))}
        >
            {[...Array(13)].map((_, i) => (
                <option key={i} value={i}>{i}h</option>
            ))}
        </select>
        <span className="timer-separator">:</span>
        <select 
            className="timer-picker" 
            value={minutes} 
            onChange={e => setMinutes(Number(e.target.value))}
        >
            {[...Array(60)].map((_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, "0")}m</option>
            ))}
        </select>
        <span className="timer-separator">:</span>
        <select 
            className="timer-picker" 
            value={seconds} 
            onChange={e => setSeconds(Number(e.target.value))}
        >
            {[...Array(60)].map((_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, "0")}s</option>
            ))}
        </select>
    </div>
);

export default TimerPicker;
