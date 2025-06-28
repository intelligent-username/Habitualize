/**
 * Custom hook for habit operations
 * Handles individual habit CRUD and completion tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

export const useHabits = (refreshSequences) => {
    const queryClient = useQueryClient();

    // Toggle completion mutation
    const toggleCompletionMutation = useMutation({
        mutationFn: async ({ habitId, completed, value, date }) => {
            await apiService.updateHabitCompletion(habitId, {
                completed: completed ? 1 : 0,
                value: value !== undefined ? value : null,
                date
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences'] });
        }
    });

    // Update habit mutation
    const updateHabitMutation = useMutation({
        mutationFn: async ({ habitId, habitData }) => {
            return await apiService.updateHabit(habitId, habitData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences'] });
        }
    });

    // Delete habit mutation
    const deleteHabitMutation = useMutation({
        mutationFn: async (habitId) => {
            await apiService.deleteHabit(habitId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences'] });
        }
    });

    // Get habit history query (returns a function for on-demand fetching)
    const getHabitHistory = (habitId) => {
        return useQuery({
            queryKey: ['habitHistory', habitId],
            queryFn: () => apiService.getHabitHistory(habitId),
            enabled: !!habitId
        });
    };

    // Wrappers to match original API
    const toggleCompletion = (habitId, completed, value, date) =>
        toggleCompletionMutation.mutateAsync({ habitId, completed, value, date });
    const updateHabit = (habitId, habitData) =>
        updateHabitMutation.mutateAsync({ habitId, habitData });
    const deleteHabit = (habitId) =>
        deleteHabitMutation.mutateAsync(habitId);

    return {
        loading:
            toggleCompletionMutation.isLoading ||
            updateHabitMutation.isLoading ||
            deleteHabitMutation.isLoading,
        error:
            toggleCompletionMutation.error?.message ||
            updateHabitMutation.error?.message ||
            deleteHabitMutation.error?.message || null,
        toggleCompletion,
        updateHabit,
        deleteHabit,
        getHabitHistory,
    };
};
