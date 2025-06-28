/**
 * Custom hook for sequence state management
 * Handles sequences, their habits, and date-based filtering
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

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
        staleTime: 1000 * 60 * 2,
        retry: 2,
        structuralSharing: true
    });

    // Mutations
    const createSingleHabitSequenceMutation = useMutation({
        mutationFn: async (habitData) => {
            const { name, color = 'gray', category_id = 1, type = 'binary', target_value = null, cumulative = 0, cumulative_goal = null, cumulative_period = null } = habitData;
            const seqData = await apiService.createSequence({ name, color, category_id });
            const habitPayload = { sequence_id: seqData.id, step_order: 0, name, type, target_value, cumulative, cumulative_goal, cumulative_period };
            await apiService.createHabit(habitPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences', selectedDate] });
        }
    });

    const createMultiStepSequenceMutation = useMutation({
        mutationFn: async (sequenceData) => {
            const { name, color, category_id, steps } = sequenceData;
            const seqData = await apiService.createSequence({ name, color, category_id });
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                await apiService.createHabit({ sequence_id: seqData.id, step_order: i, name: step.name, type: step.type, target_value: step.target_value || null });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences', selectedDate] });
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
                        await apiService.updateHabit(existingHabit.id, { name: step.name, type: step.type, target_value: step.target_value || null });
                    } else {
                        await apiService.createHabit({ sequence_id: id, step_order: i, name: step.name, type: step.type, target_value: step.target_value || null });
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
        }
    });

    const deleteSequenceMutation = useMutation({
        mutationFn: async (sequenceId) => {
            await apiService.deleteSequence(sequenceId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences', selectedDate] });
        }
    });

    // Get sequence by ID (on demand)
    const getSequence = (sequenceId) => {
        return useQuery({
            queryKey: ['sequence', sequenceId],
            queryFn: () => apiService.getSequence(sequenceId),
            enabled: !!sequenceId
        });
    };

    // Wrappers to match original API
    const createSingleHabitSequence = (habitData) => createSingleHabitSequenceMutation.mutateAsync(habitData);
    const createMultiStepSequence = (sequenceData) => createMultiStepSequenceMutation.mutateAsync(sequenceData);
    const updateSequence = (id, sequenceData) => updateSequenceMutation.mutateAsync({ id, sequenceData });
    const deleteSequence = (sequenceId) => deleteSequenceMutation.mutateAsync(sequenceId);

    return {
        sequences,
        loading: loading || createSingleHabitSequenceMutation.isLoading || createMultiStepSequenceMutation.isLoading || updateSequenceMutation.isLoading || deleteSequenceMutation.isLoading,
        error: queryError?.message || createSingleHabitSequenceMutation.error?.message || createMultiStepSequenceMutation.error?.message || updateSequenceMutation.error?.message || deleteSequenceMutation.error?.message || null,
        fetchSequencesByDate, // still available for compatibility, but not needed
        createSingleHabitSequence,
        createMultiStepSequence,
        updateSequence,
        deleteSequence,
        getSequence,
    };
};
