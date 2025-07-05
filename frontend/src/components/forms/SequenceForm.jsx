import React from "react";
import TemplateForm from "./template.jsx";
import { TimerPicker } from "../ui";
import { HabitTypeSelector } from "./HabitTypeSelector.jsx";

/**
 * SequenceForm - Component for configuring sequence habits
 * Handles multiple habits in a sequence including sub-sequences
 */
export const SequenceForm = ({
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
    const fields = [
        {
            label: "How many habits in this sequence?",
            type: "number",
            value: sequenceCount,
            onChange: e => setSequenceCount(Number(e.target.value)),
            min: 2,
            max: 5,
            className: "sequence-count-input"
        }
    ];
    return (
        <TemplateForm fields={fields} style={{ marginTop: "1.2rem" }}>
            {sequenceHabits.map((h, idx) => (
                <div key={idx} className="sequence-habit-row">
                    <label className="habit-form-label">Habit {idx + 1} Name</label>
                    <input
                        type="text"
                        value={h.name}
                        onChange={e => handleSequenceHabitChange(idx, "name", e.target.value)}
                        placeholder="Habit Name"
                    />
                    <HabitTypeSelector
                        type={h.type}
                        setType={val => handleSequenceHabitChange(idx, "type", val)}
                        targetValue={h.target_value || ""}
                        setTargetValue={val => handleSequenceHabitChange(idx, "target_value", val)}
                        timerHours={sequenceTimers[idx]?.h || 0}
                        timerMinutes={sequenceTimers[idx]?.m || 0}
                        timerSeconds={sequenceTimers[idx]?.s || 0}
                        setTimerHours={val => setSequenceTimers(timers => {
                            const arr = [...timers];
                            arr[idx] = { ...arr[idx], h: val };
                            return arr;
                        })}
                        setTimerMinutes={val => setSequenceTimers(timers => {
                            const arr = [...timers];
                            arr[idx] = { ...arr[idx], m: val };
                            return arr;
                        })}
                        setTimerSeconds={val => setSequenceTimers(timers => {
                            const arr = [...timers];
                            arr[idx] = { ...arr[idx], s: val };
                            return arr;
                        })}
                    />
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
                                    <HabitTypeSelector
                                        type={sub.type}
                                        setType={val => handleSubsequenceHabitChange(idx, subIdx, "type", val)}
                                        targetValue={sub.target_value || ""}
                                        setTargetValue={val => handleSubsequenceHabitChange(idx, subIdx, "target_value", val)}
                                        timerHours={subsequenceTimers[idx]?.[subIdx]?.h || 0}
                                        timerMinutes={subsequenceTimers[idx]?.[subIdx]?.m || 0}
                                        timerSeconds={subsequenceTimers[idx]?.[subIdx]?.s || 0}
                                        setTimerHours={val => setSubsequenceTimers(st => {
                                            const arr = [...st];
                                            arr[idx] = arr[idx] || [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }];
                                            arr[idx][subIdx] = { ...arr[idx][subIdx], h: val };
                                            return arr;
                                        })}
                                        setTimerMinutes={val => setSubsequenceTimers(st => {
                                            const arr = [...st];
                                            arr[idx] = arr[idx] || [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }];
                                            arr[idx][subIdx] = { ...arr[idx][subIdx], m: val };
                                            return arr;
                                        })}
                                        setTimerSeconds={val => setSubsequenceTimers(st => {
                                            const arr = [...st];
                                            arr[idx] = arr[idx] || [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }];
                                            arr[idx][subIdx] = { ...arr[idx][subIdx], s: val };
                                            return arr;
                                        })}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </TemplateForm>
    );
};
