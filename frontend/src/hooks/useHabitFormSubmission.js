import { isMobile } from "../utils/constants";

/**
 * useHabitFormSubmission - Custom hook for handling habit form submission logic
 * Handles the complex logic for creating and updating different types of habits
 */
export const useHabitFormSubmission = ({
    editingHabit,
    editingSequenceId,
    editingSequence,
    createSingleHabitSequence,
    createMultiStepSequence,
    updateSequence,
    updateHabit,
    onClose
}) => {
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

    // Main submit handler
    const handleSubmit = (formData) => {
        const {
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
            cumulativeGoal
        } = formData;

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
                        finalTargetValue = timerHours * 3600 + timerMinutes * 60 + timerSeconds; // Mobile
                    } else {
                        finalTargetValue = Number(targetValue) || 0; // Desktop: Direct values (seconds)
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
        }
    };

    return {
        handleSubmit
    };
};
