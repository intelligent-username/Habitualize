import { useState, useEffect } from "react";

const TIMER_INTERVAL_MS = 1000;

/**
 * useHabitTimer - Custom hook for managing timer state in HabitItem
 * Handles timer countdown, auto-completion, and state synchronization
 * 
 * @param {Object} habit - The habit object containing timer configuration
 * @param {Function} toggleCompletion - Function to mark habit as complete
 * @returns {Object} Timer state and controls
 */
export const useHabitTimer = (habit, toggleCompletion) => {
    const [timer, setTimer] = useState(() => Number(habit.value) || 0);
    const [timerRunning, setTimerRunning] = useState(false);

    // Reset timer when habit completion status changes
    useEffect(() => {
        if (!habit.completed) {
            setTimer(0);
            setTimerRunning(false);
        }
    }, [habit.completed]);

    // Timer countdown logic
    useEffect(() => {
        if (!timerRunning || habit.completed || habit.type !== "timer") {
            return;
        }

        const interval = setInterval(() => {
            setTimer(prevTimer => {
                const nextTimer = prevTimer + 1;
                
                // Auto-complete when target is reached
                if (habit.target_value && nextTimer >= habit.target_value) {
                    setTimerRunning(false);
                    toggleCompletion(habit.id, true, habit.target_value);
                    return habit.target_value;
                }
                
                return nextTimer;
            });
        }, TIMER_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [timerRunning, habit.completed, habit.type, habit.target_value, habit.id, toggleCompletion]);

    return {
        timer,
        setTimer,
        timerRunning,
        setTimerRunning
    };
};

/**
 * useHabitCounters - Custom hook for managing counter and entry state in HabitItem
 * Handles counter values and entry inputs
 */
export const useHabitCounters = (habit) => {
    const [counterValue, setCounterValue] = useState(Number(habit.value) || 0);
    const [entryValue, setEntryValue] = useState("");
    const [entryTotal, setEntryTotal] = useState(Number(habit.value) || 0);

    // Reset counters when habit completion status changes
    useEffect(() => {
        if (!habit.completed) {
            setCounterValue(0);
            setEntryTotal(0);
            setEntryValue("");
        }
    }, [habit.completed]);

    return {
        counterValue,
        setCounterValue,
        entryValue,
        setEntryValue,
        entryTotal,
        setEntryTotal
    };
};
