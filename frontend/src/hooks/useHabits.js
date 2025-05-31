/**
 * Custom hook for habit operations
 * Handles individual habit CRUD and completion tracking
 */

import { useState } from 'react';
import apiService from '../services/api';

export const useHabits = (refreshSequences) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Update habit completion status
     * @param {number} habitId - Habit ID
     * @param {boolean} completed - Completion status
     * @param {number} value - Habit value (for counter/entry types)
     * @param {string} date - Date string
     * @returns {Promise<void>}
     */
    const toggleCompletion = async (habitId, completed, value, date) => {
        try {
            setLoading(true);
            setError(null);
            
            await apiService.updateHabitCompletion(habitId, {
                completed: completed ? 1 : 0,
                value: value !== undefined ? value : null,
                date
            });

            // Refresh sequences to show updated status
            if (refreshSequences) {
                await refreshSequences();
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update habit details
     * @param {number} habitId - Habit ID
     * @param {Object} habitData - Updated habit data
     * @returns {Promise<void>}
     */
    const updateHabit = async (habitId, habitData) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await apiService.updateHabit(habitId, habitData);
            
            if (refreshSequences) {
                await refreshSequences();
            }
            
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Delete habit
     * @param {number} habitId - Habit ID
     * @returns {Promise<void>}
     */
    const deleteHabit = async (habitId) => {
        try {
            setLoading(true);
            setError(null);
            
            await apiService.deleteHabit(habitId);
            
            if (refreshSequences) {
                await refreshSequences();
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get habit completion history
     * @param {number} habitId - Habit ID
     * @returns {Promise<Array>} - Habit history array
     */
    const getHabitHistory = async (habitId) => {
        try {
            setLoading(true);
            setError(null);
            
            return await apiService.getHabitHistory(habitId);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        toggleCompletion,
        updateHabit,
        deleteHabit,
        getHabitHistory,
    };
};
