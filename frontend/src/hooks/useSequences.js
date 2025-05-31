/**
 * Custom hook for sequence state management
 * Handles sequences, their habits, and date-based filtering
 */

import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useSequences = (selectedDate, categories) => {
    const [sequences, setSequences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch sequences with completion status for specific date
     * @param {string} date - Date string (YYYY-MM-DD)
     */
    const fetchSequencesByDate = async (date) => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getSequencesByDate(date);
            setSequences(Array.isArray(data) ? data : []);
        } catch (err) {
            setSequences([]);
            setError(err.message);
            console.error('Failed to fetch sequences by date:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create new sequence with single habit
     * @param {Object} habitData - Habit configuration
     * @returns {Promise<void>}
     */
    const createSingleHabitSequence = async (habitData) => {
        const {
            name,
            color = 'gray',
            category_id = 1,
            type = 'binary',
            target_value = null,
            cumulative = 0,
            cumulative_goal = null,
            cumulative_period = null
        } = habitData;

        try {
            // Create sequence
            const seqData = await apiService.createSequence({
                name,
                color,
                category_id
            });

            // Create habit as step 0
            await apiService.createHabit({
                sequence_id: seqData.id,
                step_order: 0,
                name,
                type,
                target_value,
                cumulative,
                cumulative_goal,
                cumulative_period
            });

            await fetchSequencesByDate(selectedDate);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Create multi-step sequence
     * @param {Object} sequenceData - Sequence with steps
     * @returns {Promise<void>}
     */
    const createMultiStepSequence = async (sequenceData) => {
        const { name, color, category_id, steps } = sequenceData;

        try {
            // Create sequence
            const seqData = await apiService.createSequence({
                name,
                color,
                category_id
            });

            // Create each step
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                await apiService.createHabit({
                    sequence_id: seqData.id,
                    step_order: i,
                    name: step.name,
                    type: step.type,
                    target_value: step.target_value || null
                });
            }

            await fetchSequencesByDate(selectedDate);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Update sequence metadata and steps
     * @param {Object} sequenceData - Updated sequence data
     * @returns {Promise<void>}
     */
    const updateSequence = async (sequenceData) => {
        const { id, name, color, category_id, steps } = sequenceData;

        try {
            // Update sequence metadata
            await apiService.updateSequence(id, { name, color, category_id });

            // Update steps if provided
            if (steps) {
                for (const step of steps) {
                    await apiService.updateHabit(step.id, {
                        name: step.name,
                        type: step.type,
                        target_value: step.target_value || null
                    });
                }
            }

            await fetchSequencesByDate(selectedDate);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Delete sequence and all associated habits
     * @param {number} sequenceId - Sequence ID
     * @returns {Promise<void>}
     */
    const deleteSequence = async (sequenceId) => {
        try {
            await apiService.deleteSequence(sequenceId);
            await fetchSequencesByDate(selectedDate);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Get sequence by ID with latest data
     * @param {number} sequenceId - Sequence ID
     * @returns {Promise<Object>} - Sequence data
     */
    const getSequence = async (sequenceId) => {
        try {
            return await apiService.getSequence(sequenceId);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Fetch sequences when date or categories change
    useEffect(() => {
        if (selectedDate && categories.length > 0) {
            fetchSequencesByDate(selectedDate);
        }
    }, [selectedDate, categories]);

    return {
        sequences,
        loading,
        error,
        fetchSequencesByDate,
        createSingleHabitSequence,
        createMultiStepSequence,
        updateSequence,
        deleteSequence,
        getSequence,
    };
};
