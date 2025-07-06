import { useQuery } from '@tanstack/react-query';
import apiService from '../services/api';

/**
 * Fetches cumulative progress for a habit (x/y for the current period).
 * @param {number} habitId
 * @returns {Object} { progress, goal, period, is_complete, ... }
 */
export function useCumulativeProgress(habitId) {
  return useQuery({
    queryKey: ['cumulativeProgress', habitId],
    queryFn: async () => {
      if (!habitId) return null;
      return await apiService.getCumulativeProgress(habitId);
    },
    enabled: !!habitId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
