import React, { useState, useRef, useEffect } from "react";
const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// All 12 Color options for habits
export const COLOR_OPTIONS = [
    { name: "Gray", value: "gray", hex: "#9e9e9e" },
    { name: "Light Blue", value: "light_blue", hex: "#4fc3f7" },
    { name: "Dark Blue", value: "dark_blue", hex: "#1565c0" },
    { name: "Yellow", value: "yellow", hex: "#ffeb3b" },
    { name: "Orange", value: "orange", hex: "#ff9800" },
    { name: "Red", value: "red", hex: "#e53935" },
    { name: "Dark Gray", value: "dark_gray", hex: "#616161" },
    { name: "Purple", value: "purple", hex: "#7e57c2" },
    { name: "Green", value: "green", hex: "#66bb6a" },
    { name: "Pink", value: "pink", hex: "#ec407a" },
    { name: "Gold", value: "gold", hex: "#ffc107" },
    { name: "Olive", value: "olive", hex: "#808000" }
];



// --- Timer Picker Component ---
const TimerPicker = ({ hours, minutes, seconds, setHours, setMinutes, setSeconds }) => (
    <div className="timer-picker-row">
        <select className="timer-picker" value={hours} onChange={e => setHours(Number(e.target.value))}>
            {[...Array(13)].map((_, i) => (
                <option key={i} value={i}>{i}h</option>
            ))}
        </select>
        <span className="timer-separator">:</span>
        <select className="timer-picker" value={minutes} onChange={e => setMinutes(Number(e.target.value))}>
            {[...Array(60)].map((_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, "0")}m</option>
            ))}
        </select>
        <span className="timer-separator">:</span>
        <select className="timer-picker" value={seconds} onChange={e => setSeconds(Number(e.target.value))}>
            {[...Array(60)].map((_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, "0")}s</option>
            ))}
        </select>
    </div>
);

// --- HabitItem (display) ---
export const HabitItem = ({ habit, toggleCompletion, deleteHabit, onEdit, disabled }) => {
    // Remove any logic that assumes sequence_group_id or old grouping
    // Use habit.color if present, else fallback
    const colorHex = COLOR_OPTIONS.find(opt => opt.value === habit.color)?.hex || "#b0b0b0";
    const textColor = "#fff";

    // --- Timer display formatting ---
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // --- Normal habits (with controls) ---
    const [counterValue, setCounterValue] = useState(Number(habit.value) || 0);
    const [entryValue, setEntryValue] = useState("");
    const [entryTotal, setEntryTotal] = useState(Number(habit.value) || 0);
    const [timer, setTimer] = useState(Number(habit.value) || 0); // seconds
    const [timerRunning, setTimerRunning] = useState(false);

    useEffect(() => {
        if (!habit.completed) {
            setCounterValue(0);
            setEntryTotal(0);
            setEntryValue("");
            setTimer(0);
            setTimerRunning(false);
        }
    }, [habit.completed]);

    useEffect(() => {
        let interval;
        if (timerRunning && !habit.completed && habit.type === "timer") {
            interval = setInterval(() => {
                setTimer(t => {
                    const next = t + 1;
                    if (habit.target_value && next >= habit.target_value) {
                        setTimerRunning(false);
                        toggleCompletion(habit.id, true, habit.target_value);
                        return habit.target_value;
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, habit.completed, habit.type, habit.target_value, habit.id, toggleCompletion]);

    useEffect(() => {
        if (
            habit.type === "timer" &&
            !habit.completed &&
            habit.target_value &&
            timer >= habit.target_value
        ) {
            setTimerRunning(false);
            toggleCompletion(habit.id, true, timer);
        }
    }, [timer, habit.completed, habit.type, habit.target_value, habit.id, toggleCompletion]);

    let mainControl = null;
    let withControls = false;

    if (habit.type === "counter") {
        withControls = true;
        // Always use backend-provided value for display
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
                    }}a
                    style={{ marginRight: 16 }}
                />
                {!habit.completed && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                        <div className="counter-wheel">
                            <button
                                className="counter-wheel-btn"
                                onClick={() => {
                                    // Always send increment of 1
                                    toggleCompletion(habit.id, false, 1);
                                }}
                                tabIndex={0}
                            >▲</button>
                            <div className="counter-wheel-value">{habit.value || 0}</div>
                            <button
                                className="counter-wheel-btn"
                                onClick={() => {
                                    // Optionally allow decrement, but only if value > 0
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
            {/* Only show date if present */}
            {habit.date_created && <span className="habit-date">(Created: {habit.date_created})</span>}
            <button onClick={() => onEdit(habit)} style={{ marginLeft: "1rem" }}>Edit</button>
            <button onClick={() => deleteHabit(habit)} style={{ marginLeft: "0.5rem" }}>Delete</button>
        </li>
    );
};

// --- HabitForm (creation/edit) ---
export const HabitForm = ({
    newHabit, setNewHabit, addHabit, updateHabit, editingHabit,
    handleInputKeyDown,
    color, setColor,
    categories, categoryId, setCategoryId,
    type, setType,
    targetValue, setTargetValue,
    editingSequence,
    updateSequence
}) => {
    const [habitKind, setHabitKind] = useState("normal");
    const [sequenceCount, setSequenceCount] = useState(2);
    const [sequenceHabits, setSequenceHabits] = useState([
        { name: "", type: "binary", target_value: "", isSubsequence: false, subHabits: [] },
        { name: "", type: "binary", target_value: "", isSubsequence: false, subHabits: [] }
    ]);
    const [cumulativePeriod, setCumulativePeriod] = useState("monthly");
    const [cumulativeGoal, setCumulativeGoal] = useState("");
    const [showColorGrid, setShowColorGrid] = useState(false);
    const colorBtnRef = useRef(null);

    // Timer picker state for normal habits
    const [timerHours, setTimerHours] = useState(0);
    const [timerMinutes, setTimerMinutes] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(0);

    // Timer picker state for sequence habits (array of {h, m, s})
    const [sequenceTimers, setSequenceTimers] = useState([
        { h: 0, m: 0, s: 0 },
        { h: 0, m: 0, s: 0 }
    ]);
    // For subsequence timers
    const [subsequenceTimers, setSubsequenceTimers] = useState([
        [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }],
        [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }]
    ]);

    // Color picker logic
    useEffect(() => {
        const handleClick = (e) => {
            if (
                colorBtnRef.current &&
                !colorBtnRef.current.contains(e.target)
            ) {
                setShowColorGrid(false);
            }
        };
        if (showColorGrid) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showColorGrid]);

    // If editing a sequence, initialize form state from editingSequence
    useEffect(() => {
        if (editingSequence) {
            setHabitKind("sequence");
            setNewHabit(editingSequence.name);
            setColor(editingSequence.color);
            setCategoryId(editingSequence.category_id);
            setSequenceCount(editingSequence.steps.length);
            setSequenceHabits(editingSequence.steps.map(h => ({
                name: h.name,
                type: h.type,
                target_value: h.target_value || "",
                isSubsequence: false,
                subHabits: []
            })));
            setSequenceTimers(editingSequence.steps.map(h => {
                if (h.type === "timer") {
                    const total = Number(h.target_value) || 0;
                    return {
                        h: Math.floor(total / 3600),
                        m: Math.floor((total % 3600) / 60),
                        s: total % 60
                    };
                }
                return { h: 0, m: 0, s: 0 };
            }));
        } else if (editingHabit) {
            // Detect if this is a cumulative habit
            if (editingHabit.cumulative) {
                setHabitKind("cumulative");
                setNewHabit(editingHabit.name);
                setColor(editingHabit.color || "gray");
                setCategoryId(editingHabit.category_id || 1);
                setCumulativeGoal(editingHabit.cumulative_goal || "");
                setCumulativePeriod(editingHabit.cumulative_period || "monthly");
            } else {
                setHabitKind("normal");
                setNewHabit(editingHabit.name);
                setType(editingHabit.type || "binary");
                setTargetValue(editingHabit.target_value || "");
                setColor(editingHabit.color || "gray");
                setCategoryId(editingHabit.category_id || 1);
            }
        } else {
            setHabitKind("normal");
        }
    }, [editingSequence, editingHabit]);

    // Handle sequence habit changes
    const handleSequenceHabitChange = (idx, field, value) => {
        setSequenceHabits(hs => {
            const copy = [...hs];
            copy[idx][field] = value;
            return copy;
        });
        // If timer, update timer state
        if (field === "type" && value === "timer") {
            setSequenceTimers(timers => {
                const arr = [...timers];
                arr[idx] = arr[idx] || { h: 0, m: 0, s: 0 };
                return arr;
            });
        }
    };

    // Handle adding/removing sub-sequences (max depth 2)
    const handleAddSubsequence = (idx) => {
        setSequenceHabits(hs => {
            const copy = [...hs];
            copy[idx].isSubsequence = true;
            copy[idx].subHabits = [
                { name: "", type: "binary", target_value: "" },
                { name: "", type: "binary", target_value: "" }
            ];
            return copy;
        });
        setSubsequenceTimers(st => {
            const arr = [...st];
            arr[idx] = [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }];
            return arr;
        });
    };
    const handleSubsequenceHabitChange = (parentIdx, subIdx, field, value) => {
        setSequenceHabits(hs => {
            const copy = [...hs];
            copy[parentIdx].subHabits[subIdx][field] = value;
            return copy;
        });
        if (field === "type" && value === "timer") {
            setSubsequenceTimers(st => {
                const arr = [...st];
                arr[parentIdx] = arr[parentIdx] || [{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }];
                arr[parentIdx][subIdx] = arr[parentIdx][subIdx] || { h: 0, m: 0, s: 0 };
                return arr;
            });
        }
    };

    // Adjust sequence habit count
    useEffect(() => {
        setSequenceHabits(hs => {
            let arr = [...hs];
            if (arr.length < sequenceCount) {
                while (arr.length < sequenceCount) arr.push({ name: "", type: "binary", target_value: "", isSubsequence: false, subHabits: [] });
            } else if (arr.length > sequenceCount) {
                arr = arr.slice(0, sequenceCount);
            }
            return arr;
        });
        setSequenceTimers(timers => {
            let arr = [...timers];
            if (arr.length < sequenceCount) {
                while (arr.length < sequenceCount) arr.push({ h: 0, m: 0, s: 0 });
            } else if (arr.length > sequenceCount) {
                arr = arr.slice(0, sequenceCount);
            }
            return arr;
        });
        setSubsequenceTimers(st => {
            let arr = [...st];
            if (arr.length < sequenceCount) {
                while (arr.length < sequenceCount) arr.push([{ h: 0, m: 0, s: 0 }, { h: 0, m: 0, s: 0 }]);
            } else if (arr.length > sequenceCount) {
                arr = arr.slice(0, sequenceCount);
            }
            return arr;
        });
    }, [sequenceCount]);

    // Only allow one category for all sequence children
    const handleCategoryChange = (catId) => {
        setCategoryId(catId);
    };

    // --- SUBMIT LOGIC ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSequence) {
            // For each habit, if timer, use sequenceTimers for value
            const steps = sequenceHabits.map((h, idx) => {
                if (h.type === "timer") {
                    return {
                        ...editingSequence.steps[idx],
                        name: h.name,
                        type: h.type,
                        target_value: sequenceTimers[idx].h * 3600 + sequenceTimers[idx].m * 60 + sequenceTimers[idx].s
                    };
                }
                return {
                    ...editingSequence.steps[idx],
                    name: h.name,
                    type: h.type,
                    target_value: h.target_value
                };
            });
            updateSequence({
                id: editingSequence.id,
                name: newHabit,
                color,
                category_id: categoryId,
                steps
            });
            return;
        }
        if (editingHabit) {
            // If editing a cumulative habit, update with cumulative fields
            if (habitKind === "cumulative") {
                updateHabit({
                    name: newHabit,
                    type: "binary",
                    cumulative: 1,
                    cumulative_goal: cumulativeGoal,
                    cumulative_period: cumulativePeriod,
                    color,
                    category_id: categoryId
                });
                return;
            } else {
                updateHabit();
                return;
            }
        }
        if (habitKind === "normal") {
            let finalTargetValue = targetValue;
            if (type === "timer") {
                finalTargetValue = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
            }
            addHabit(finalTargetValue);
        } else if (habitKind === "sequence") {
            // For each habit, if timer, use sequenceTimers for value
            const steps = sequenceHabits.map((h, idx) => {
                if (h.type === "timer") {
                    return {
                        ...h,
                        target_value: sequenceTimers[idx].h * 3600 + sequenceTimers[idx].m * 60 + sequenceTimers[idx].s
                    };
                }
                // For subsequence
                if (h.isSubsequence && h.subHabits) {
                    const subHabitsWithTimers = h.subHabits.map((sub, subIdx) => {
                        if (sub.type === "timer") {
                            return {
                                ...sub,
                                target_value: subsequenceTimers[idx][subIdx].h * 3600 + subsequenceTimers[idx][subIdx].m * 60 + subsequenceTimers[idx][subIdx].s
                            };
                        }
                        return sub;
                    });
                    return { ...h, subHabits: subHabitsWithTimers };
                }
                return h;
            });
            window.addSequenceHabit &&
                window.addSequenceHabit({
                    name: newHabit,
                    color,
                    category_id: categoryId,
                    steps // <-- send as 'steps', not 'habits'
                });
        } else if (habitKind === "cumulative") {
            addHabit({
                name: newHabit,
                color,
                category_id: categoryId,
                type: "binary",
                cumulative: 1,
                cumulative_goal: cumulativeGoal,
                cumulative_period: cumulativePeriod
            });
            setCumulativeGoal("");
            setCumulativePeriod("monthly");
        }
    };

    return (
        <form className="add-habit" onSubmit={handleSubmit}>
            <label className="habit-form-label" htmlFor="habit-name-input">Habit name</label>
            <input
                id="habit-name-input"
                type="text"
                placeholder="Habit Name"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoFocus
            />

            <label className="habit-form-label" style={{ marginTop: "1rem" }}>Kind</label>
            <select value={habitKind} onChange={e => setHabitKind(e.target.value)}>
                <option value="normal">Normal (one-off, daily)</option>
                <option value="sequence">Sequence (routine/group)</option>
                <option value="cumulative">Cumulative (weekly/monthly/yearly goal)</option>
            </select>

            {/* Color and Category always available */}
            <div style={{ display: "flex", alignItems: "center", marginTop: "1rem", position: "relative" }}>
                <label className="habit-form-label" style={{ margin: 0 }}>Color</label>
                <button
                    type="button"
                    ref={colorBtnRef}
                    className="color-preview-btn"
                    style={{
                        background: COLOR_OPTIONS.find(opt => opt.value === color)?.hex || "#9e9e9e",
                        marginLeft: "0.75rem",
                        border: color === "gray" ? "2px solid #ccc" : "2px solid var(--accent)"
                    }}
                    onClick={() => setShowColorGrid(v => !v)}
                    aria-label="Pick color"
                />
                {showColorGrid && (
                    <div
                        className="color-grid-popup"
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <div className="color-grid">
                            {COLOR_OPTIONS.map(opt => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    className={`color-square${color === opt.value ? " selected" : ""}`}
                                    style={{ background: opt.hex }}
                                    onClick={() => {
                                        setColor(opt.value);
                                        setShowColorGrid(false);
                                    }}
                                    aria-label={opt.name}
                                >
                                    {color === opt.value && <span className="color-check">&#10003;</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <label className="habit-form-label" style={{ marginTop: "1rem" }}>Category</label>
            <select value={categoryId} onChange={e => handleCategoryChange(Number(e.target.value))}>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            {/* Normal */}
            {habitKind === "normal" && (
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
                            // Desktop: single input for seconds (or minutes, or hh:mm:ss string)
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
            )}

            {/* Sequence */}
            {habitKind === "sequence" && (
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
                            {/* Subsequence (max depth 2) */}
                            {!h.isSubsequence && (
                                <button
                                    type="button"
                                    className="add-subsequence-btn"
                                    onClick={() => handleAddSubsequence(idx)}
                                >
                                    Add Sub-sequence
                                </button>
                            )}
                            {h.isSubsequence && (
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
            )}

            {/* Cumulative */}
            {habitKind === "cumulative" && (
                <div style={{ marginTop: "1.2rem" }}>
                    <label className="habit-form-label">Cumulative Period</label>
                    <select value={cumulativePeriod} onChange={e => setCumulativePeriod(e.target.value)}>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <label className="habit-form-label" style={{ marginTop: 8 }}>Goal (number of reps/units)</label>
                    <input
                        type="number"
                        min="1"
                        value={cumulativeGoal}
                        onChange={e => setCumulativeGoal(e.target.value)}
                        placeholder="Goal"
                    />
                </div>
            )}

            <button type="submit" className="add-habit-button" style={{ marginTop: "1.5rem" }}>
                {editingSequence || editingHabit ? "Save Changes" : "Add Habit"}
            </button>
        </form>
    );
};
