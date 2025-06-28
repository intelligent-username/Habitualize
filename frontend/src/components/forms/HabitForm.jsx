import React, { useState, useRef, useEffect } from "react";
import { isMobile } from "../../utils/constants";
import { useCategories } from "../../hooks/useCategories.js";
import { useSequences } from "../../hooks/useSequences.js";
import { useHabits } from "../../hooks/useHabits.js";
import { ColorPicker } from "../ui";
import { CategorySelector } from "../categories";
import HabitTypeSelector from "./HabitTypeSelector.jsx";
import SequenceForm from "./SequenceForm.jsx";
import CumulativeForm from "./CumulativeForm.jsx";

/**
 * HabitForm - Component for creating and editing habits and sequences
 * Handles normal habits, sequences, and cumulative habits
 * Uses hooks directly to reduce prop drilling
 */
export const HabitForm = ({
    editingHabit,
    editingSequenceId,
    selectedDate,
    onClose,
    initialCategoryId = 1
}) => {
    // Use hooks directly instead of receiving data as props
    const { categories } = useCategories();
    const { sequences, createSingleHabitSequence, createMultiStepSequence, updateSequence } = useSequences(selectedDate);
    const { updateHabit } = useHabits();

    // Form state
    const [newHabit, setNewHabit] = useState("");
    const [color, setColor] = useState("gray");
    const [categoryId, setCategoryId] = useState(initialCategoryId);
    const [type, setType] = useState("binary");
    const [targetValue, setTargetValue] = useState("");
    
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
    const formInitializedRef = useRef(false);

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

    // Derive the editing sequence from sequences array and editingSequenceId
    const editingSequence = editingSequenceId 
        ? sequences.find(seq => seq.id === editingSequenceId) 
        : null;

    // Initialize form when editing (only once per editing session)
    useEffect(() => {
        // Reset the flag when switching between different editing modes or stopping editing
        if (!editingSequenceId && !editingHabit) {
            formInitializedRef.current = false;
            return;
        }

        // Only initialize if we haven't already initialized this editing session
        if (formInitializedRef.current) {
            return;
        }

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
            formInitializedRef.current = true;
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
                
                // Initialize timer values for timer habits
                if (editingHabit.type === "timer" && editingHabit.target_value) {
                    const total = Number(editingHabit.target_value) || 0;
                    if (isMobile()) {
                        // Mobile: set timer picker values
                        setTimerHours(Math.floor(total / 3600));
                        setTimerMinutes(Math.floor((total % 3600) / 60));
                        setTimerSeconds(total % 60);
                    } else {
                        // Desktop: set target value directly (in seconds)
                        setTargetValue(total.toString());
                    }
                } else {
                    setTimerHours(0);
                    setTimerMinutes(0);
                    setTimerSeconds(0);
                }
            }
            formInitializedRef.current = true;
        } else {
            setHabitKind("normal");
        }
    }, [editingSequenceId, editingHabit, editingSequence]);

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

    // Handle category change
    const handleCategoryChange = (catId) => {
        setCategoryId(catId);
    };

    // Handle keyboard shortcuts
    const handleInputKeyDown = (e) => {
        if (e.key === "Escape") {
            onClose?.();
        }
    };

    // Create habit function
    const addHabit = async (habitData) => {
        if (typeof habitData === 'string' || typeof habitData === 'number') {
            // Legacy call - create single habit sequence
            await createSingleHabitSequence({
                name: newHabit,
                color,
                category_id: categoryId,
                type,
                target_value: habitData || null
            });
        } else {
            // Object with full habit data
            await createSingleHabitSequence(habitData);
        }
        onClose?.();
    };

    // Update habit function
    const handleUpdateHabit = async (habitData) => {
        await updateHabit(editingHabit.id, habitData);
        onClose?.();
    };

    // Update sequence function  
    const handleUpdateSequence = async (sequenceData) => {
        await updateSequence(editingSequenceId, sequenceData);
        onClose?.();
    };

    // --- SUBMIT LOGIC ---
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingSequence) {
            // For each habit, if timer, use sequenceTimers for value
            const steps = sequenceHabits.map((h, idx) => {
                const existingStep = editingSequence.steps[idx]; // May be undefined for new habits
                if (h.type === "timer") {
                    return {
                        ...(existingStep || {}), // Only spread if existingStep exists
                        name: h.name,
                        type: h.type,
                        target_value: sequenceTimers[idx].h * 3600 + sequenceTimers[idx].m * 60 + sequenceTimers[idx].s,
                        step_order: idx // Ensure step_order is set
                    };
                }
                return {
                    ...(existingStep || {}), // Only spread if existingStep exists
                    name: h.name,
                    type: h.type,
                    target_value: h.target_value,
                    step_order: idx // Ensure step_order is set
                };
            });

            handleUpdateSequence({
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
                handleUpdateHabit({
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
                let finalTargetValue = targetValue;
                if (type === "timer") {
                    if (isMobile()) {
                        // Mobile: use timer picker values
                        finalTargetValue = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
                    } else {
                        // Desktop: use direct input value (already in seconds)
                        finalTargetValue = Number(targetValue) || 0;
                    }
                }
                handleUpdateHabit({
                    name: newHabit,
                    type,
                    target_value: finalTargetValue,
                    color,
                    category_id: categoryId
                });
                return;
            }
        }

        if (habitKind === "normal") {
            if (type === "timer") {
                let finalTargetValue;
                if (isMobile()) {
                    // Mobile: use timer picker values
                    finalTargetValue = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
                } else {
                    // Desktop: use direct input value (already in seconds)
                    finalTargetValue = Number(targetValue) || 0;
                }
                console.log("[HabitForm] Creating timer habit with target:", finalTargetValue, "seconds");
                addHabit({
                    name: newHabit,
                    color,
                    category_id: categoryId,
                    type,
                    target_value: finalTargetValue
                });
            } else {
                addHabit(targetValue);
            }
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
            createMultiStepSequence({
                name: newHabit,
                color,
                category_id: categoryId,
                steps
            });
            onClose?.();
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

            {/* Color and Category components */}
            <ColorPicker
                color={color}
                setColor={setColor}
                showColorGrid={showColorGrid}
                setShowColorGrid={setShowColorGrid}
                colorBtnRef={colorBtnRef}
            />
            
            <CategorySelector
                categories={categories}
                categoryId={categoryId}
                onCategoryChange={handleCategoryChange}
            />

            {/* Normal habit form */}
            {habitKind === "normal" && (
                <HabitTypeSelector
                    type={type}
                    setType={setType}
                    targetValue={targetValue}
                    setTargetValue={setTargetValue}
                    timerHours={timerHours}
                    timerMinutes={timerMinutes}
                    timerSeconds={timerSeconds}
                    setTimerHours={setTimerHours}
                    setTimerMinutes={setTimerMinutes}
                    setTimerSeconds={setTimerSeconds}
                />
            )}

            {/* Sequence form */}
            {habitKind === "sequence" && (
                <SequenceForm
                    sequenceCount={sequenceCount}
                    setSequenceCount={setSequenceCount}
                    sequenceHabits={sequenceHabits}
                    handleSequenceHabitChange={handleSequenceHabitChange}
                    sequenceTimers={sequenceTimers}
                    setSequenceTimers={setSequenceTimers}
                    handleAddSubsequence={handleAddSubsequence}
                    handleSubsequenceHabitChange={handleSubsequenceHabitChange}
                    subsequenceTimers={subsequenceTimers}
                    setSubsequenceTimers={setSubsequenceTimers}
                />
            )}

            {/* Cumulative form */}
            {habitKind === "cumulative" && (
                <CumulativeForm
                    cumulativePeriod={cumulativePeriod}
                    setCumulativePeriod={setCumulativePeriod}
                    cumulativeGoal={cumulativeGoal}
                    setCumulativeGoal={setCumulativeGoal}
                />
            )}

            <button type="submit" className="add-habit-button" style={{ marginTop: "1.5rem" }}>
                {editingSequenceId || editingHabit ? "Save Changes" : "Add Habit"}
            </button>
        </form>
    );
};
