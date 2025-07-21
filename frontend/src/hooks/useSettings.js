import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

export const useSettings = () => {
    console.log('[useSettings] Hook called');
    const queryClient = useQueryClient();
    
    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: () => {
            console.log('[useSettings] queryFn called - fetching settings');
            return apiService.getSettings();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
    
    console.log('[useSettings] Current settings:', settings, 'isLoading:', isLoading);
    
    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings) => {
            console.log('[useSettings] updateSettings mutation called with:', newSettings);
            return apiService.updateSettings(newSettings);
        },
        onSuccess: () => {
            console.log('[useSettings] updateSettings success, invalidating queries');
            queryClient.invalidateQueries(['settings']);
        },
    });
    
    // Helper functions for each setting
    const getSetting = (key, defaultValue) => {
        if (!settings) {
            console.log(`[useSettings] getSetting(${key}) - no settings yet, returning default:`, defaultValue);
            return defaultValue;
        }
        const setting = settings.find(s => s.key === key);
        const result = setting ? setting.value : defaultValue;
        console.log(`[useSettings] getSetting(${key}) - found:`, result);
        return result;
    };
    
    return {
        settings,
        isLoading,
        updateSettings: updateSettingsMutation.mutateAsync,
        isUpdating: updateSettingsMutation.isPending,
        
        // Convenience getters as functions
        getDefaultHabitColor: () => getSetting('default_habit_color', 'gray'),
        getDefaultHabitType: () => getSetting('default_habit_type', 'normal'),
        getDefaultHabitIcon: () => getSetting('default_habit_icon', 'default.svg'),
        getDefaultCategoryId: () => parseInt(getSetting('default_category_id', '1')),
        getDefaultSequenceCount: () => parseInt(getSetting('default_sequence_count', '2')),
        getWeekStartDay: () => parseInt(getSetting('week_start_day', '0')),
        
        // New appearance settings
        getTheme: () => getSetting('theme', 'dark'),
        getShowHabitIcons: () => getSetting('show_habit_icons', 'true') === 'true',
        getFilterCompletedToBottom: () => getSetting('filter_completed_to_bottom', 'false') === 'true',
        
        // Direct values for convenience
        defaultHabitColor: getSetting('default_habit_color', 'gray'),
        defaultHabitType: getSetting('default_habit_type', 'normal'),
        defaultHabitIcon: getSetting('default_habit_icon', 'default.svg'),
        defaultCategoryId: parseInt(getSetting('default_category_id', '1')),
        defaultSequenceCount: parseInt(getSetting('default_sequence_count', '2')),
        weekStartDay: parseInt(getSetting('week_start_day', '0')),
        theme: getSetting('theme', 'dark'),
        showHabitIcons: getSetting('show_habit_icons', 'true') === 'true',
        filterCompletedToBottom: getSetting('filter_completed_to_bottom', 'false') === 'true',
    };
};
