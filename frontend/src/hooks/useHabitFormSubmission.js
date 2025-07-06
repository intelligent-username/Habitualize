/**
 * Custom hook for handling habit form submission logic
 * Handles complex logic for creating and updating different types of habits
 * 
 * @param {Object} params - Hook parameters
 * @param {Object} params.editingHabit - Habit being edited (null if creating)
 * @param {string} params.editingSequenceId - Sequence ID being edited
 * @param {Object} params.editingSequence - Sequence being edited
 * @param {Function} params.createSingleHabitSequence - Function to create single habit
 * @param {Function} params.createMultiStepSequence - Function to create multi-step sequence
 * @param {Function} params.updateSequence - Function to update sequence
 * @param {Function} params.updateHabit - Function to update habit
 * @param {Function} params.onClose - Callback when operation completes
 * @returns {Object} Form submission handlers
 */

import { isMobile } from "../utils/constants";

// Constants
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
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
    /**
     * Calculate timer target value from hours, minutes, seconds
     * @param {number} hours - Hours
     * @param {number} minutes - Minutes  
     * @param {number} seconds - Seconds
     * @returns {number} Total seconds
     */
    const calculateTimerValue = (hours, minutes, seconds) => {
        return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
    };

    /**
     * Get final target value for timer habits
     * @param {string} type - Habit type
     * @param {number} targetValue - Raw target value
     * @param {number} timerHours - Timer hours
     * @param {number} timerMinutes - Timer minutes
     * @param {number} timerSeconds - Timer seconds
     * @returns {number} Final target value
     */
    const getFinalTargetValue = (type, targetValue, timerHours, timerMinutes, timerSeconds) => {
        if (type !== "timer") {
            return targetValue;
        }
        
        if (isMobile()) {
            return calculateTimerValue(timerHours, timerMinutes, timerSeconds);
        }
        
        return Number(targetValue) || 0;
    };

    /**
     * Create habit with proper data handling
     * @param {Object|string|number} habitData - Habit data
     */
    const addHabit = async (habitData) => {
        if (typeof habitData === 'string' || typeof habitData === 'number') {
            // Legacy compatibility - should be avoided
            console.warn('addHabit called with primitive value, use object instead');
            return;
        }
        
        await createSingleHabitSequence(habitData);
        onClose?.();
    };

    /**
     * Update existing habit
     * @param {Object} habitData - Updated habit data
     */
    const handleUpdateHabit = async (habitData) => {
        await updateHabit(editingHabit.id, habitData);
        onClose?.();
    };

    /**
     * Update existing sequence  
     * @param {Object} sequenceData - Updated sequence data
     */
    const handleUpdateSequence = async (sequenceData) => {
        await updateSequence(editingSequenceId, sequenceData);
        onClose?.();
    };

    /**
     * Process sequence steps with timer calculations
     * @param {Array} sequenceHabits - Array of habits in sequence
     * @param {Array} sequenceTimers - Array of timer configurations
     * @param {string} fallbackIcon - Fallback icon for steps
     * @returns {Array} Processed steps
     */
    const processSequenceSteps = (sequenceHabits, sequenceTimers, fallbackIcon) => {
        return sequenceHabits.map((habit, index) => {
            const baseStep = {
                name: habit.name,
                type: habit.type,
                step_order: index,
                icon: habit.icon || fallbackIcon
            };

            if (habit.type === "timer") {
                const timerConfig = sequenceTimers[index];
                baseStep.target_value = calculateTimerValue(
                    timerConfig.h, 
                    timerConfig.m, 
                    timerConfig.s
                );
            } else {
                baseStep.target_value = habit.target_value;
            }

            return baseStep;
        });
    };

    /**
     * Handle editing sequence update
     * @param {Object} formData - Form data
     */
    const handleEditingSequenceSubmit = (formData) => {
        const { newHabit, color, categoryId, sequenceHabits, sequenceTimers, icon } = formData;
        
        const steps = sequenceHabits.map((habit, index) => {
            const existingStep = editingSequence.steps[index] || {};
            const baseStep = {
                ...existingStep,
                name: habit.name,
                type: habit.type,
                step_order: index,
                icon: habit.icon || icon
            };

            if (habit.type === "timer") {
                const timerConfig = sequenceTimers[index];
                baseStep.target_value = calculateTimerValue(
                    timerConfig.h, 
                    timerConfig.m, 
                    timerConfig.s
                );
            } else {
                baseStep.target_value = habit.target_value;
            }

            return baseStep;
        });

        handleUpdateSequence({
            name: newHabit,
            color,
            category_id: categoryId,
            steps
        });
    };

    /**
     * Handle editing habit update
     * @param {Object} formData - Form data
     */
    const handleEditingHabitSubmit = (formData) => {
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
            cumulativePeriod, 
            cumulativeGoal, 
            icon 
        } = formData;

        if (habitKind === "cumulative") {
            handleUpdateHabit({
                name: newHabit,
                type: "counter", // ensure type is counter for cumulative
                cumulative: 1,
                cumulative_goal: cumulativeGoal,
                cumulative_period: cumulativePeriod,
                color,
                category_id: categoryId,
                icon
            });
            return;
        }

        const finalTargetValue = getFinalTargetValue(
            type, 
            targetValue, 
            timerHours, 
            timerMinutes, 
            timerSeconds
        );

        handleUpdateHabit({
            name: newHabit,
            type,
            target_value: finalTargetValue,
            color,
            category_id: categoryId,
            icon
        });
    };

    /**
     * Handle normal habit creation
     * @param {Object} formData - Form data
     */
    const handleNormalHabitSubmit = (formData) => {
        const { 
            newHabit, 
            color, 
            categoryId, 
            type, 
            targetValue, 
            timerHours, 
            timerMinutes, 
            timerSeconds, 
            icon 
        } = formData;

        const finalTargetValue = getFinalTargetValue(
            type, 
            targetValue, 
            timerHours, 
            timerMinutes, 
            timerSeconds
        );

        addHabit({
            name: newHabit,
            color,
            category_id: categoryId,
            type,
            target_value: finalTargetValue,
            icon
        });
    };

    /**
     * Handle sequence creation
     * @param {Object} formData - Form data
     */
    const handleSequenceSubmit = (formData) => {
        const { 
            newHabit, 
            color, 
            categoryId, 
            sequenceHabits, 
            sequenceTimers, 
            subsequenceTimers, 
            icon 
        } = formData;

        const steps = sequenceHabits.map((habit, index) => {
            const processedHabit = { ...habit, icon: habit.icon || icon };

            if (habit.type === "timer") {
                const timerConfig = sequenceTimers[index];
                processedHabit.target_value = calculateTimerValue(
                    timerConfig.h, 
                    timerConfig.m, 
                    timerConfig.s
                );
            }

            // Handle subsequences (nested habits)
            if (habit.isSubsequence && habit.subHabits) {
                processedHabit.subHabits = habit.subHabits.map((subHabit, subIndex) => {
                    const processedSubHabit = { ...subHabit, icon: subHabit.icon || icon };

                    if (subHabit.type === "timer") {
                        const subTimerConfig = subsequenceTimers[index][subIndex];
                        processedSubHabit.target_value = calculateTimerValue(
                            subTimerConfig.h, 
                            subTimerConfig.m, 
                            subTimerConfig.s
                        );
                    }

                    return processedSubHabit;
                });
            }

            return processedHabit;
        });

        createMultiStepSequence({
            name: newHabit,
            color,
            category_id: categoryId,
            steps
        });
        onClose?.();
    };

    /**
     * Handle cumulative habit creation
     * @param {Object} formData - Form data
     */
    const handleCumulativeHabitSubmit = (formData) => {
        const {
            newHabit,
            color,
            categoryId,
            cumulativePeriod,
            cumulativeGoal,
            icon
        } = formData;

        addHabit({
            name: newHabit,
            color,
            category_id: categoryId,
            type: "counter", // changed from 'binary' to 'counter'
            cumulative: 1,
            cumulative_goal: Number(cumulativeGoal), // ensure number
            cumulative_period: cumulativePeriod,
            icon
        });
    };

    /**
     * Main submit handler - routes to appropriate submission handler
     * @param {Object} formData - Complete form data
     */
    const handleSubmit = (formData) => {
        const { habitKind } = formData;

        // Handle editing existing items
        if (editingSequence) {
            handleEditingSequenceSubmit(formData);
            return;
        }

        if (editingHabit) {
            handleEditingHabitSubmit(formData);
            return;
        }

        // Handle creating new items
        switch (habitKind) {
            case "normal":
                handleNormalHabitSubmit(formData);
                break;
            case "sequence":
                handleSequenceSubmit(formData);
                break;
            case "cumulative":
                handleCumulativeHabitSubmit(formData);
                break;
            default:
                console.warn(`Unknown habit kind: ${habitKind}`);
                break;
        }
    };

    return {
        handleSubmit
    };
};