import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import apiService from '../services/api';

export const useSettings = () => {
    const queryClient = useQueryClient();
    
    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: () => {
            return apiService.getSettings();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
    
    
    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings) => {
            return apiService.updateSettings(newSettings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['settings']);
        },
    });
    
    // Helper functions for each setting - memoized to prevent re-creation
    const getSetting = useMemo(() => {
        return (key, defaultValue) => {
            if (!settings) {
                return defaultValue;
            }
            const setting = settings.find(s => s.key === key);
            const result = setting ? setting.value : defaultValue;
            return result;
        };
    }, [settings]);

    // Memoize all the computed values to prevent re-computation on every render
    const computedValues = useMemo(() => {
        if (!settings) {
            return {
                defaultHabitColor: 'gray',
                defaultHabitType: 'normal',
                defaultHabitIcon: 'default.svg',
                defaultCategoryId: 1,
                defaultSequenceCount: 2,
                weekStartDay: 1,
                theme: 'dark',
                showHabitIcons: true,
                filterCompletedToBottom: false,
            };
        }

        return {
            defaultHabitColor: getSetting('default_habit_color', 'gray'),
            defaultHabitType: getSetting('default_habit_type', 'normal'),
            defaultHabitIcon: getSetting('default_habit_icon', 'default.svg'),
            defaultCategoryId: parseInt(getSetting('default_category_id', '1')),
            defaultSequenceCount: parseInt(getSetting('default_sequence_count', '2')),
            weekStartDay: parseInt(getSetting('week_start_day', '1')), // Default to Monday
            theme: getSetting('theme', 'dark'),
            showHabitIcons: getSetting('show_habit_icons', 'true') === 'true',
            filterCompletedToBottom: getSetting('filter_completed_to_bottom', 'false') === 'true',
        };
    }, [settings, getSetting]);
    
    return {
        settings,
        isLoading,
        updateSettings: updateSettingsMutation.mutateAsync,
        isUpdating: updateSettingsMutation.isPending,
        
        // Convenience getters as functions
        getDefaultHabitColor: () => computedValues.defaultHabitColor,
        getDefaultHabitType: () => computedValues.defaultHabitType,
        getDefaultHabitIcon: () => computedValues.defaultHabitIcon,
        getDefaultCategoryId: () => computedValues.defaultCategoryId,
        getDefaultSequenceCount: () => computedValues.defaultSequenceCount,
        getWeekStartDay: () => computedValues.weekStartDay,
        
        // New appearance settings
        getTheme: () => computedValues.theme,
        getShowHabitIcons: () => computedValues.showHabitIcons,
        getFilterCompletedToBottom: () => computedValues.filterCompletedToBottom,
        
        // Direct values for convenience
        ...computedValues
    };
};
