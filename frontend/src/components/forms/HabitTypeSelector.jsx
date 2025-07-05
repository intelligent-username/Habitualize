import React from "react";
import TemplateForm from "./template.jsx";
import { TimerPicker } from "../ui";
import { isMobile } from "../../utils/constants";

/**
 * HabitTypeSelector - Component for selecting habit type and configuring type-specific options
 * Handles binary, reverse_binary, timer, counter, and entry-based habit types
 */
export const HabitTypeSelector = ({
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
    const fields = [
        {
            label: "Type",
            type: "select",
            value: type,
            onChange: e => setType(e.target.value),
            options: [
                { value: "binary", label: "Binary (Done/Undone)" },
                { value: "reverse_binary", label: "Reverse Binary (Fail if unchecked)" },
                { value: "timer", label: "Timer" },
                { value: "counter", label: "Counter" },
                { value: "entry", label: "Entry-based" }
            ],
            marginTop: "1rem"
        }
    ];
    return (
        <TemplateForm fields={fields}>
            {type === "timer" ? (
                <>
                    <label className="habit-form-label" style={{ marginTop: "1rem" }}>
                        Target Time
                    </label>
                    {isMobile() ? (
                        <TimerPicker
                            hours={timerHours}
                            minutes={timerMinutes}
                            seconds={timerSeconds}
                            setHours={setTimerHours}
                            setMinutes={setTimerMinutes}
                            setSeconds={setTimerSeconds}
                        />
                    ) : (
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
        </TemplateForm>
    );
};
