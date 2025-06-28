import { useState, useEffect } from "react";

/**
 * useHabitTimer - Custom hook for managing timer state in HabitItem
 * Handles timer countdown, auto-completion, and state synchronization
 */
export const useHabitTimer = (habit, toggleCompletion) => {
    const [timer, setTimer] = useState(Number(habit.value) || 0);
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
        let interval;
        if (timerRunning && !habit.completed && habit.type === "timer") {
            interval = setInterval(() => {
                setTimer(t => {
                    const next = t + 1;
                    if (habit.target_value && next >= habit.target_value) {
                        console.log(`[Timer] Reached target ${habit.target_value}s! Marking habit as complete.`);
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
