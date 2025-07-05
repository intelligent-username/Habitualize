import React, { useState, useRef, useEffect } from "react";
import { isMobile } from "../../utils/constants";
import { useCategories } from "../../hooks/useCategories.js";
import { useSequences } from "../../hooks/useSequences.js";
import { useHabits } from "../../hooks/useHabits.js";
import { useHabitFormSubmission } from "../../hooks/useHabitFormSubmission.js";
import { ColorPicker } from "../ui";
import { CategorySelector } from "../categories";
import { HabitTypeSelector } from "./HabitTypeSelector.jsx";
import { SequenceForm } from "./SequenceForm.jsx";
import { CumulativeForm } from "./CumulativeForm.jsx";
import IconPicker from "../ui/IconPicker";
import TemplateForm from "./template.jsx";

// Custom hook for form initialization
function useHabitFormInitialization({ editingHabit, editingSequenceId, sequences, setHabitKind, setNewHabit, setColor, setIcon, setCategoryId, setSequenceCount, setSequenceHabits, setSequenceTimers, setCumulativeGoal, setCumulativePeriod, setType, setTargetValue, setTimerHours, setTimerMinutes, setTimerSeconds, formInitializedRef }) {
    const editingSequence = editingSequenceId 
        ? sequences.find(seq => seq.id === editingSequenceId) 
        : null;
    useEffect(() => {
        if (!editingSequenceId && !editingHabit) {
            formInitializedRef.current = false;
            return;
        }
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
            if (editingHabit.cumulative) {
                setHabitKind("cumulative");
                setNewHabit(editingHabit.name);
                setColor(editingHabit.color || "gray");
                setIcon(editingHabit.icon || "default.svg");
                setCategoryId(editingHabit.category_id || 1);
                setCumulativeGoal(editingHabit.cumulative_goal || "");
                setCumulativePeriod(editingHabit.cumulative_period || "monthly");
            } else {
                setHabitKind("normal");
                setNewHabit(editingHabit.name);
                setType(editingHabit.type || "binary");
                setTargetValue(editingHabit.target_value || "");
                setColor(editingHabit.color || "gray");
                setIcon(editingHabit.icon || "default.svg");
                setCategoryId(editingHabit.category_id || 1);
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
    }, [editingSequenceId, editingHabit, editingSequence]);
}

// Custom hook for sequence/subsequence handlers
function useSequenceHandlers({ setSequenceHabits, setSequenceTimers, setSubsequenceTimers }) {
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
    return { handleSequenceHabitChange, handleAddSubsequence, handleSubsequenceHabitChange };
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
    const { sequences, createSingleHabitSequence, createMultiStepSequence, updateSequence } = useSequences(selectedDate);
    const { updateHabit } = useHabits();

    // Form state
    const [newHabit, setNewHabit] = useState("");
    const [color, setColor] = useState("gray");
    const [icon, setIcon] = useState("default.svg");
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

    // Initialization
    useHabitFormInitialization({
        editingHabit,
        editingSequenceId,
        sequences,
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

    // Sequence/subsequence handlers
    const { handleSequenceHabitChange, handleAddSubsequence, handleSubsequenceHabitChange } = useSequenceHandlers({ setSequenceHabits, setSequenceTimers, setSubsequenceTimers });

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

    // --- SUBMIT LOGIC ---
    const { handleSubmit } = useHabitFormSubmission({
        editingHabit,
        editingSequenceId,
        editingSequence: sequences.find(seq => seq.id === editingSequenceId),
        createSingleHabitSequence,
        createMultiStepSequence,
        updateSequence,
        updateHabit,
        onClose
    });

    const fields = [
        {
            label: "Habit name",
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
                { value: "normal", label: "Normal (one-off, daily)" },
                { value: "sequence", label: "Sequence (routine/group)" },
                { value: "cumulative", label: "Cumulative (weekly/monthly/yearly goal)" }
            ],
            marginTop: "1rem"
        }
    ];
    return (
        <TemplateForm className="add-habit" onSubmit={e => {
            e.preventDefault();
            handleSubmit({
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
                subsequenceTimers,
                cumulativePeriod,
                cumulativeGoal,
                icon
            });
        }} fields={fields}>
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
        </TemplateForm>
    );
};
