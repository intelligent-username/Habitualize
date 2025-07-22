import { useQuery } from '@tanstack/react-query';
import apiService from '../services/api';

/**
 * Fetches cumulative progress for a habit (x/y for the current period).
 * @param {number|null} habitId - Habit ID or null to disable the query
 * @param {string|null} date - Date to calculate progress for (YYYY-MM-DD format)
 * @returns {Object} { progress, goal, period, is_complete, ... }
 */
export function useCumulativeProgress(habitId, date = null) {
  return useQuery({
    queryKey: ['cumulativeProgress', habitId, date],
    queryFn: async () => {
      if (!habitId) return null;
      return await apiService.getCumulativeProgress(habitId, date);
    },
    enabled: !!habitId, // Only run query if habitId is truthy
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
