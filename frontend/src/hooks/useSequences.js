/**
 * Custom hook for sequence state management
 * Handles sequences, their habits, and date-based filtering
 * 
 * @param {string} selectedDate - Date string in YYYY-MM-DD format
 * @returns {Object} Sequence operations and state
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

// Constants
const SEQUENCE_CACHE_TIME = 1000 * 60 * 2; // 2 minutes
const QUERY_RETRY_COUNT = 2;
const DEFAULT_CATEGORY_ID = 1;
const DEFAULT_COLOR = 'gray';

export const useSequences = (selectedDate) => {
    const queryClient = useQueryClient();
    
    // Query for fetching sequences by date
    const {
        data: sequences = [],
        isLoading: loading,
        error: queryError,
        refetch: fetchSequencesByDate
    } = useQuery({
        queryKey: ['sequences', selectedDate],
        queryFn: () => apiService.getSequencesByDate(selectedDate),
        enabled: !!selectedDate,
        staleTime: SEQUENCE_CACHE_TIME,
        retry: QUERY_RETRY_COUNT,
        structuralSharing: true
    });

    // Mutations
    const createSingleHabitSequenceMutation = useMutation({
        mutationFn: async (habitData) => {
            const { 
                name, 
                color = DEFAULT_COLOR, 
                category_id = DEFAULT_CATEGORY_ID, 
                type = 'binary', 
                target_value = null, 
                cumulative = 0, 
                cumulative_goal = null, 
                cumulative_period = null 
            } = habitData;
            
            const seqData = await apiService.createSequence({ name, color, category_id });
            const habitPayload = { 
                sequence_id: seqData.id, 
                step_order: 0, 
                name, 
                type, 
                target_value, 
                cumulative, 
                cumulative_goal, 
                cumulative_period 
            };
            return await apiService.createHabit(habitPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences', selectedDate] });
        },
        onError: (error) => {
            console.error('Failed to create single habit sequence:', error);
        }
    });

    const createMultiStepSequenceMutation = useMutation({
        mutationFn: async (sequenceData) => {
            const { name, color, category_id, steps } = sequenceData;
            const seqData = await apiService.createSequence({ name, color, category_id });
            
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
            
            return seqData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences', selectedDate] });
        },
        onError: (error) => {
            console.error('Failed to create multi-step sequence:', error);
        }
    });

    const updateSequenceMutation = useMutation({
        mutationFn: async ({ id, sequenceData }) => {
            const { name, color, category_id, steps } = sequenceData;
            await apiService.updateSequence(id, { name, color, category_id });
            
            if (steps) {
                const currentHabits = await apiService.getSequenceHabits(id);
                
                for (let i = 0; i < steps.length; i++) {
                    const step = steps[i];
                    const existingHabit = currentHabits.find(h => h.step_order === i);
                    
                    if (existingHabit) {
                        await apiService.updateHabit(existingHabit.id, { 
                            name: step.name, 
                            type: step.type, 
                            target_value: step.target_value || null 
                        });
                    } else {
                        await apiService.createHabit({ 
                            sequence_id: id, 
                            step_order: i, 
                            name: step.name, 
                            type: step.type, 
                            target_value: step.target_value || null 
                        });
                    }
                }
                
                const habitsToDelete = currentHabits.filter(h => h.step_order >= steps.length);
                for (const habit of habitsToDelete) {
                    await apiService.deleteHabit(habit.id);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences', selectedDate] });
        },
        onError: (error) => {
            console.error('Failed to update sequence:', error);
        }
    });

    const deleteSequenceMutation = useMutation({
        mutationFn: async (sequenceId) => {
            return await apiService.deleteSequence(sequenceId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences', selectedDate] });
        },
        onError: (error) => {
            console.error('Failed to delete sequence:', error);
        }
    });

    // Get sequence by ID (on demand)
    const getSequence = (sequenceId) => {
        return useQuery({
            queryKey: ['sequence', sequenceId],
            queryFn: () => apiService.getSequence(sequenceId),
            enabled: !!sequenceId,
            staleTime: SEQUENCE_CACHE_TIME,
            retry: QUERY_RETRY_COUNT
        });
    };

    // Wrappers to match original API
    const createSingleHabitSequence = (habitData) => createSingleHabitSequenceMutation.mutateAsync(habitData);
    const createMultiStepSequence = (sequenceData) => createMultiStepSequenceMutation.mutateAsync(sequenceData);
    const updateSequence = (id, sequenceData) => updateSequenceMutation.mutateAsync({ id, sequenceData });
    const deleteSequence = (sequenceId) => deleteSequenceMutation.mutateAsync(sequenceId);

    return {
        // Data
        sequences,
        
        // State
        loading: 
            loading || 
            createSingleHabitSequenceMutation.isPending || 
            createMultiStepSequenceMutation.isPending || 
            updateSequenceMutation.isPending || 
            deleteSequenceMutation.isPending,
        error: 
            queryError?.message || 
            createSingleHabitSequenceMutation.error?.message || 
            createMultiStepSequenceMutation.error?.message || 
            updateSequenceMutation.error?.message || 
            deleteSequenceMutation.error?.message || 
            null,
        
        // Actions
        fetchSequencesByDate, // Legacy compatibility
        createSingleHabitSequence,
        createMultiStepSequence,
        updateSequence,
        deleteSequence,
        getSequence,
    };
};
