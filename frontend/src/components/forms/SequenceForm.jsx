import React from "react";
import { TimerPicker } from "../ui";

/**
 * SequenceForm - Component for configuring sequence habits
 * Handles multiple habits in a sequence including sub-sequences
 */
const SequenceForm = ({
    sequenceCount,
    setSequenceCount,
    sequenceHabits,
    handleSequenceHabitChange,
    sequenceTimers,
    setSequenceTimers,
    handleAddSubsequence,
    handleSubsequenceHabitChange,
    subsequenceTimers,
    setSubsequenceTimers
}) => {
    return (
        <div style={{ marginTop: "1.2rem" }}>
            <div className="sequence-count-row">
                <label className="habit-form-label">How many habits in this sequence?</label>
                <input
                    type="number"
                    min="2"
                    max="5"
                    value={sequenceCount}
                    onChange={e => setSequenceCount(Number(e.target.value))}
                    className="sequence-count-input"
                />
            </div>
            {sequenceHabits.map((h, idx) => (
                <div key={idx} className="sequence-habit-row">
                    <label className="habit-form-label">Habit {idx + 1} Name</label>
                    <input
                        type="text"
                        value={h.name}
                        onChange={e => handleSequenceHabitChange(idx, "name", e.target.value)}
                        placeholder="Habit Name"
                    />
                    <label className="habit-form-label" style={{ marginTop: 6 }}>Type</label>
                    <select
                        value={h.type}
                        onChange={e => handleSequenceHabitChange(idx, "type", e.target.value)}
                    >
                        <option value="binary">Binary</option>
                        <option value="reverse_binary">Reverse Binary</option>
                        <option value="timer">Timer</option>
                        <option value="counter">Counter</option>
                        <option value="entry">Entry-based</option>
                    </select>
                    {/* Target value for timer/counter/entry */}
                    {h.type === "timer" ? (
                        <TimerPicker
                            hours={sequenceTimers[idx]?.h || 0}
                            minutes={sequenceTimers[idx]?.m || 0}
                            seconds={sequenceTimers[idx]?.s || 0}
                            setHours={val => setSequenceTimers(timers => {
                                const arr = [...timers];
                                arr[idx] = { ...arr[idx], h: val };
                                return arr;
                            })}
                            setMinutes={val => setSequenceTimers(timers => {
                                const arr = [...timers];
                                arr[idx] = { ...arr[idx], m: val };
                                return arr;
                            })}
                            setSeconds={val => setSequenceTimers(timers => {
                                const arr = [...timers];
                                arr[idx] = { ...arr[idx], s: val };
                                return arr;
                            })}
                        />
                    ) : (["counter", "entry"].includes(h.type) && (
                        <input
                            type="number"
                            min="1"
                            value={h.target_value || ""}
                            onChange={e => handleSequenceHabitChange(idx, "target_value", e.target.value)}
                            placeholder="Target"
                            className="sequence-target-input"
                        />
                    ))}
                    {/* Subsequence handling */}
                    {!h.isSubsequence && (
                        <button
                            type="button"
                            className="add-subsequence-btn"
                            onClick={() => handleAddSubsequence(idx)}
                        >
                            Add Sub-sequence
                        </button>
                    )}
                    {h.isSubsequence && h.subHabits && (
                        <div className="subsequence-row">
                            <label className="habit-form-label">Sub-sequence (2 habits max)</label>
                            {h.subHabits.map((sub, subIdx) => (
                                <div key={subIdx} className="subsequence-habit-row">
                                    <input
                                        type="text"
                                        value={sub.name}
                                        onChange={e => handleSubsequenceHabitChange(idx, subIdx, "name", e.target.value)}
                                        placeholder="Sub-habit Name"
                                    />
                                    <select
                                        value={sub.type}
                                        onChange={e => handleSubsequenceHabitChange(idx, subIdx, "type", e.target.value)}
                                    >
                                        <option value="binary">Binary</option>
                                        <option value="reverse_binary">Reverse Binary</option>
                                        <option value="timer">Timer</option>
                                        <option value="counter">Counter</option>
                                        <option value="entry">Entry-based</option>
                                    </select>
                                    {sub.type === "timer" ? (
                                        <TimerPicker
                                            hours={subsequenceTimers[idx]?.[subIdx]?.h || 0}
                                            minutes={subsequenceTimers[idx]?.[subIdx]?.m || 0}
                                            seconds={subsequenceTimers[idx]?.[subIdx]?.s || 0}
                                            setHours={val => setSubsequenceTimers(st => {
                                                const arr = [...st];
                                                arr[idx] = arr[idx] || [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }];
                                                arr[idx][subIdx] = { ...arr[idx][subIdx], h: val };
                                                return arr;
                                            })}
                                            setMinutes={val => setSubsequenceTimers(st => {
                                                const arr = [...st];
                                                arr[idx] = arr[idx] || [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }];
                                                arr[idx][subIdx] = { ...arr[idx][subIdx], m: val };
                                                return arr;
                                            })}
                                            setSeconds={val => setSubsequenceTimers(st => {
                                                const arr = [...st];
                                                arr[idx] = arr[idx] || [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }];
                                                arr[idx][subIdx] = { ...arr[idx][subIdx], s: val };
                                                return arr;
                                            })}
                                        />
                                    ) : (["counter", "entry"].includes(sub.type) && (
                                        <input
                                            type="number"
                                            min="1"
                                            value={sub.target_value || ""}
                                            onChange={e => handleSubsequenceHabitChange(idx, subIdx, "target_value", e.target.value)}
                                            placeholder="Target"
                                            className="sequence-target-input"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SequenceForm;
