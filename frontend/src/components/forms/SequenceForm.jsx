import React from "react";
import TemplateForm from "./template.jsx";
import { TimerPicker } from "../ui";
import { HabitTypeSelector } from "./HabitTypeSelector.jsx";
import { useSettings } from "../../hooks/useSettings.js";

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
}) => {
    const { getDefaultSequenceCount } = useSettings();
    
    const fields = [
        {
            label: "How many habits in this sequence?",
            type: "number",
            value: sequenceCount,
            onChange: e => setSequenceCount(Number(e.target.value)),
            min: 2,
            max: 10,
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
                            arr[idx] = { ...(arr[idx] || { h: 0, m: 0, s: 0 }), h: val };
                            return arr;
                        })}
                        setTimerMinutes={val => setSequenceTimers(timers => {
                            const arr = [...timers];
                            arr[idx] = { ...(arr[idx] || { h: 0, m: 0, s: 0 }), m: val };
                            return arr;
                        })}
                        setTimerSeconds={val => setSequenceTimers(timers => {
                            const arr = [...timers];
                            arr[idx] = { ...(arr[idx] || { h: 0, m: 0, s: 0 }), s: val };
                            return arr;
                        })}
                    />
                </div>
            ))}
        </TemplateForm>
    );
};
