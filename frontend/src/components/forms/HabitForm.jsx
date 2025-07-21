import React, { useState, useRef, useEffect } from "react";
import { isMobile } from "../../utils/constants";
import { useCategories } from "../../hooks/useCategories.js";
import { useSequences, useSequence } from "../../hooks/useSequences.js";
import { useHabits } from "../../hooks/useHabits.js";
import { useHabitFormSubmission } from "../../hooks/useHabitFormSubmission.js";
import { ColorPicker } from "../ui";
import { CategorySelector } from "../categories";
import { HabitTypeSelector } from "./HabitTypeSelector.jsx";
import { SequenceForm } from "./SequenceForm.jsx";
import { CumulativeForm } from "./CumulativeForm.jsx";
import IconPicker from "../ui/IconPicker";
import TemplateForm from "./template.jsx";
import { useSettings } from "../../hooks/useSettings.js";

// Custom hook for form initialization
function useHabitFormInitialization({ editingHabit, editingSequenceId, editingSequence, setHabitKind, setNewHabit, setColor, setIcon, setCategoryId, setSequenceCount, setSequenceHabits, setSequenceTimers, setCumulativeGoal, setCumulativePeriod, setType, setTargetValue, setTimerHours, setTimerMinutes, setTimerSeconds, formInitializedRef, defaultHabitType, defaultHabitColor, defaultHabitIcon, defaultCategoryId }) {
    useEffect(() => {
        // Don't initialize if already done
        if (formInitializedRef.current) {
            return;
        }

        if (!editingSequenceId && !editingHabit) {
            // Initialize with default values for new forms
            const currentDefaultType = defaultHabitType || "binary";
            setSequenceHabits([
                { name: "", type: currentDefaultType, target_value: "", isSubsequence: false, subHabits: [] },
                { name: "", type: currentDefaultType, target_value: "", isSubsequence: false, subHabits: [] }
            ]);
            setSequenceTimers([
                { h: 0, m: 0, s: 0 },
                { h: 0, m: 0, s: 0 }
            ]);
            formInitializedRef.current = true;
            return;
        }

        if (editingSequence) {
            setHabitKind("sequence");
            setNewHabit(editingSequence.name);
            setColor(editingSequence.color);
            setCategoryId(editingSequence.category_id);
            setSequenceCount(editingSequence.steps.length);
            
            const habitData = editingSequence.steps.map(h => ({
                name: h.name,
                type: h.type,
                target_value: h.target_value || "",
                isSubsequence: false,
                subHabits: []
            }));
            setSequenceHabits(habitData);
            
            const timerData = editingSequence.steps.map(h => {
                if (h.type === "timer") {
                    const total = Number(h.target_value) || 0;
                    return {
                        h: Math.floor(total / 3600),
                        m: Math.floor((total % 3600) / 60),
                        s: total % 60
                    };
                }
                return { h: 0, m: 0, s: 0 };
            });
            setSequenceTimers(timerData);
            formInitializedRef.current = true;
        } else if (editingHabit) {
            if (editingHabit.cumulative) {
                setHabitKind("cumulative");
                setNewHabit(editingHabit.name);
                setColor(editingHabit.color || defaultHabitColor || "gray");
                setIcon(editingHabit.icon || defaultHabitIcon || "default.svg");
                // For editing habits, use habit's category, fallback to default only if needed
                setCategoryId(editingHabit.category_id || defaultCategoryId || 1);
                setCumulativeGoal(editingHabit.cumulative_goal || "");
                setCumulativePeriod(editingHabit.cumulative_period || "monthly");
            } else {
                setHabitKind("normal");
                setNewHabit(editingHabit.name);
                setType(editingHabit.type || defaultHabitType || "binary");
                setTargetValue(editingHabit.target_value || "");
                setColor(editingHabit.color || defaultHabitColor || "gray");
                setIcon(editingHabit.icon || defaultHabitIcon || "default.svg");
                // For editing habits, use habit's category, fallback to default only if needed
                setCategoryId(editingHabit.category_id || defaultCategoryId || 1);
                if (editingHabit.type === "timer" && editingHabit.target_value) {
                    const total = Number(editingHabit.target_value) || 0;
                    if (isMobile()) {
                        setTimerHours(Math.floor(total / 3600));
                        setTimerMinutes(Math.floor((total % 3600) / 60));
                        setTimerSeconds(total % 60);
                    } else {
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
    }, [editingSequenceId, editingHabit, editingSequence?.id, editingSequence?.steps?.length]);
}

// Custom hook for sequence/subsequence handlers
function useSequenceHandlers({ setSequenceHabits, setSequenceTimers }) {
    const handleSequenceHabitChange = (idx, field, value) => {
        setSequenceHabits(hs => {
            const copy = [...hs];
            copy[idx][field] = value;
            return copy;
        });
        if (field === "type" && value === "timer") {
            setSequenceTimers(timers => {
                const arr = [...timers];
                arr[idx] = arr[idx] || { h: 0, m: 0, s: 0 };
                return arr;
            });
        }
    };
    return { handleSequenceHabitChange };
}


export const HabitForm = ({
    editingHabit,
    editingSequenceId,
    selectedDate,
    onClose,
    initialCategoryId = 1
}) => {
    // Use hooks directly instead of receiving data as props
    const { categories } = useCategories();
    const { createSingleHabitSequence, createMultiStepSequence, updateSequence } = useSequences(selectedDate);
    const { updateHabit } = useHabits();

    // Fetch specific sequence data when editing
    const { sequence: editingSequenceData, sequenceLoading } = useSequence(editingSequenceId);
    
    // Get user settings
    const { 
        settings, 
        isLoading: settingsLoading, 
        defaultHabitColor, 
        defaultHabitType, 
        defaultHabitIcon, 
        defaultCategoryId, 
        defaultSequenceCount 
    } = useSettings();

    // Form state - Wait for settings before initializing
    const [newHabit, setNewHabit] = useState("");
    const [color, setColor] = useState("gray"); // Will be updated when settings load
    const [icon, setIcon] = useState("default.svg"); // Will be updated when settings load
    const [categoryId, setCategoryId] = useState(initialCategoryId);
    const [type, setType] = useState("binary"); // Will be updated when settings load
    const [targetValue, setTargetValue] = useState("");
    const [habitKind, setHabitKind] = useState("normal");
    const [sequenceCount, setSequenceCount] = useState(2); // Will be updated when settings load
    const [sequenceHabits, setSequenceHabits] = useState([]);
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
    const [sequenceTimers, setSequenceTimers] = useState([]);
    const [cumulativeFormError, setCumulativeFormError] = useState("");

    // Update form state when settings load
    useEffect(() => {
        if (!settingsLoading && settings) {
            // Only update if we're not editing an existing habit/sequence
            if (!editingHabit && !editingSequenceId) {
                setColor(defaultHabitColor || "gray");
                setIcon(defaultHabitIcon || "default.svg");
                setType(defaultHabitType || "binary");
                setSequenceCount(defaultSequenceCount || 2);
                // Don't override categoryId - keep the current/selected category (initialCategoryId)
                // defaultCategoryId is only for fallback when categories are deleted
            }
        }
    }, [settingsLoading, settings, defaultHabitColor, defaultHabitIcon, defaultHabitType, defaultSequenceCount, editingHabit, editingSequenceId]);

    // Initialization
    useHabitFormInitialization({
        editingHabit,
        editingSequenceId,
        editingSequence: editingSequenceData,
        defaultHabitType,
        defaultHabitColor,
        defaultHabitIcon,
        defaultCategoryId,
        setHabitKind,
        setNewHabit,
        setColor,
        setIcon,
        setCategoryId,
        setSequenceCount,
        setSequenceHabits,
        setSequenceTimers,
        setCumulativeGoal,
        setCumulativePeriod,
        setType,
        setTargetValue,
        setTimerHours,
        setTimerMinutes,
        setTimerSeconds,
        formInitializedRef
    });

    // Sequence handlers
    const { handleSequenceHabitChange } = useSequenceHandlers({ setSequenceHabits, setSequenceTimers });

    // Adjust sequence habit count (only after form is initialized)
    useEffect(() => {
        // Don't adjust arrays during form initialization 
        if (!formInitializedRef.current) {
            return;
        }
        
        setSequenceHabits(hs => {
            let arr = [...hs];
            if (arr.length < sequenceCount) {
                const currentDefaultType = defaultHabitType || "binary";
                while (arr.length < sequenceCount) arr.push({ name: "", type: currentDefaultType, target_value: "", isSubsequence: false, subHabits: [] });
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
    }, [sequenceCount, defaultHabitType]);

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

    // --- SUBMIT LOGIC ---
    const { handleSubmit } = useHabitFormSubmission({
        editingHabit,
        editingSequenceId,
        editingSequence: editingSequenceData,
        createSingleHabitSequence,
        createMultiStepSequence,
        updateSequence,
        updateHabit,
        onClose
    });

    // --- SUBMIT HANDLER WITH VALIDATION ---
    const handleValidatedSubmit = (formData) => {
        if (habitKind === "cumulative") {
            if (!cumulativeGoal || isNaN(Number(cumulativeGoal)) || Number(cumulativeGoal) <= 0) {
                setCumulativeFormError("Please enter a valid goal (must be a positive number).");
                return;
            }
            if (!cumulativePeriod || !["weekly","monthly","yearly"].includes(cumulativePeriod)) {
                setCumulativeFormError("Please select a valid period.");
                return;
            }
        }
        setCumulativeFormError("");
        handleSubmit(formData);
    };

    const fields = [
        {
            label: "Habit Name",
            type: "text",
            value: newHabit,
            onChange: (e) => setNewHabit(e.target.value),
            id: "habit-name-input",
            placeholder: "Habit Name",
            onKeyDown: handleInputKeyDown,
            autoFocus: true
        },
        {
            label: "Kind",
            type: "select",
            value: habitKind,
            onChange: e => setHabitKind(e.target.value),
            options: [
                { value: "normal", label: "Normal" },
                { value: "cumulative", label: "Cumulative" },
                { value: "sequence", label: "Sequence" }
            ],
            marginTop: "1rem",
            marginBottom: "1rem"
        }
    ];
    if (sequenceLoading || settingsLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="add-habit">
            <form onSubmit={e => {
                e.preventDefault();
                handleValidatedSubmit({
                    habitKind,
                    newHabit,
                    color,
                    categoryId,
                    type,
                    targetValue,
                    timerHours,
                    timerMinutes,
                    timerSeconds,
                    sequenceHabits,
                    sequenceTimers,
                    cumulativePeriod,
                    cumulativeGoal,
                    icon
                });
            }}>
                <TemplateForm fields={fields}>
                {/* Icon picker */}
                <label className="habit-form-label" style={{ marginTop: "1rem" }}>Icon</label>
                <IconPicker selectedIcon={icon} onSelect={setIcon} />
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
                    />
                )}
                {/* Cumulative form */}
                {habitKind === "cumulative" && (
                    <CumulativeForm
                        cumulativePeriod={cumulativePeriod}
                        setCumulativePeriod={setCumulativePeriod}
                        cumulativeGoal={cumulativeGoal}
                        setCumulativeGoal={setCumulativeGoal}
                        error={cumulativeFormError}
                    />
                )}
                <button type="submit" className="add-habit-button" style={{ marginTop: "1.5rem" }}>
                    {editingSequenceId || editingHabit ? "Save Changes" : "Add Habit"}
                </button>
            </TemplateForm>
        </form>
        </div>
    );
};
