/**
 * Custom hook for habit operations
 * Handles individual habit CRUD and completion tracking
 * 
 * @param {Function} refreshSequences - Optional callback for sequence refresh (deprecated)
 * @returns {Object} Habit operations and state
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

export const useHabits = (refreshSequences) => {
    const queryClient = useQueryClient();

    // Toggle completion mutation
    const toggleCompletionMutation = useMutation({
        mutationFn: async ({ habitId, completed, value, date }) => {
            return await apiService.updateHabitCompletion(habitId, {
                completed: completed ? 1 : 0,
                value: value !== undefined ? value : null,
                date
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences'] });
        },
        onError: (error) => {
            console.error('Failed to toggle habit completion:', error);
        }
    });

    // Update habit mutation
    const updateHabitMutation = useMutation({
        mutationFn: async ({ habitId, habitData }) => {
            return await apiService.updateHabit(habitId, habitData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences'] });
        },
        onError: (error) => {
            console.error('Failed to update habit:', error);
        }
    });

    // Delete habit mutation
    const deleteHabitMutation = useMutation({
        mutationFn: async (habitId) => {
            return await apiService.deleteHabit(habitId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequences'] });
        },
        onError: (error) => {
            console.error('Failed to delete habit:', error);
        }
    });

    // Get habit history query (returns a function for on-demand fetching)
    const getHabitHistory = (habitId) => {
        return useQuery({
            queryKey: ['habitHistory', habitId],
            queryFn: () => apiService.getHabitHistory(habitId),
            enabled: !!habitId,
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2
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
        // State
        loading:
            toggleCompletionMutation.isPending ||
            updateHabitMutation.isPending ||
            deleteHabitMutation.isPending,
        error:
            toggleCompletionMutation.error?.message ||
            updateHabitMutation.error?.message ||
            deleteHabitMutation.error?.message || 
            null,
        
        // Actions
        toggleCompletion,
        updateHabit,
        deleteHabit,
        getHabitHistory,
    };
};
