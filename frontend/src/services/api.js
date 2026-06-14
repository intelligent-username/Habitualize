
/**
 * API service for Habitualize backend communication
 * Centralizes all HTTP requests to the Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
    /**
     * Generic fetch wrapper with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} - Response data
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
    
    // Category Operations Section
    async getCategories() {
        // console.log('[API] getCategories called, making request to /categories');
        try {
            const result = await this.request('/categories');
            // console.log('[API] getCategories success, result:', result);
            return result;
        } catch (error) {
            console.error('[API] getCategories failed:', error);
            throw error;
        }
    }

    async createCategory(name) {
        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    }

    async updateCategory(id, name) {
        return this.request(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
    }

    async deleteCategory(id) {
        return this.request(`/categories/${id}`, {
            method: 'DELETE',
        });
    }

    // Sequence Operations Section
    async getSequencesByDate(date) {
        return this.request(`/sequences/by-date/${date}`);
    }

    async getSequence(id) {
        return this.request(`/sequences/${id}`);
    }

    async createSequence(sequenceData) {
        return this.request('/sequences', {
            method: 'POST',
            body: JSON.stringify(sequenceData),
        });
    }

    async updateSequence(id, sequenceData) {
        return this.request(`/sequences/${id}`, {
            method: 'PUT',
            body: JSON.stringify(sequenceData),
        });
    }

    async deleteSequence(id) {
        return this.request(`/sequences/${id}`, {
            method: 'DELETE',
        });
    }

    // Habit Operations Section
    async createHabit(habitData) {
        return this.request('/habits', {
            method: 'POST',
            body: JSON.stringify(habitData),
        });
    }

    async getSequenceHabits(sequenceId) {
        return this.request(`/sequences/${sequenceId}/habits`);
    }

    async updateHabit(id, habitData) {
        return this.request(`/habits/${id}`, {
            method: 'PUT',
            body: JSON.stringify(habitData),
        });
    }

    async deleteHabit(id) {
        return this.request(`/habits/${id}`, {
            method: 'DELETE',
        });
    }

    async updateHabitCompletion(id, completionData) {
        return this.request(`/habits/${id}/history`, {
            method: 'PUT',
            body: JSON.stringify(completionData),
        });
    }

    async getHabitHistory(id) {
        return this.request(`/habits/${id}/history`);
    }

    // Cumulative Progress for Habits
    async getCumulativeProgress(habitId, date = null) {
        const endpoint = date 
            ? `/habits/${habitId}/cumulative-progress?date=${date}`
            : `/habits/${habitId}/cumulative-progress`;
        return this.request(endpoint);
    }

    // Pomodoro Section
    async startPomodoroSession(goal_duration_minutes) {
        return this.request('/api/pomodoro/start', {
            method: 'POST',
            body: JSON.stringify({ goal_duration_minutes, time_started: new Date().toISOString() })
        });
    }
    async finishPomodoroSession(session_id, completed, time_completed) {
        return this.request('/api/pomodoro/finish', {
            method: 'POST',
            body: JSON.stringify({ session_id, time_finished: new Date().toISOString(), completed, time_completed })
        });
    }
    async getPomodoroStats(range = 'day', start = null, weekStartDay = null) {
        let url = `/api/pomodoro/stats?range=${range}`;
        if (start) url += `&start=${start}`;
        if (weekStartDay !== null) url += `&week_start_day=${weekStartDay}`;
        return this.request(url);
    }

    async getEarliestPomodoroDate() {
        return this.request('/api/pomodoro/earliest');
    }

    async getPomodoroStreaks(weekStartDay = null) {
        let url = '/api/pomodoro/streaks';
        if (weekStartDay !== null) url += `?week_start_day=${weekStartDay}`;
        return this.request(url);
    }

    // QotD
    async getQuoteOfTheDay() {
        return this.request('/api/quote-of-the-day');
    }

    // Settings Operations Section
    async getSettings() {
        // console.log('[API] getSettings called, making request to /settings');
        try {
            const result = await this.request('/settings');
            // console.log('[API] getSettings success, result:', result);
            return result;
        } catch (error) {
            console.error('[API] getSettings failed:', error);
            throw error;
        }
    }

    async updateSettings(settings) {
        // console.log('[API] updateSettings called with:', settings);
        try {
            const result = await this.request('/settings', {
                method: 'POST',
                body: JSON.stringify(settings),
            });
            // console.log('[API] updateSettings success, result:', result);
            return result;
        } catch (error) {
            console.error('[API] updateSettings failed:', error);
            throw error;
        }
    }

    // Data Management Operations Section
    async exportData() {
        // console.log('[API] exportData called');
        try {
            const response = await fetch(`${API_BASE_URL}/data/export`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Get filename from response headers or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'habitualize_export.json';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // console.log('[API] exportData success');
            return { success: true, filename };
        } catch (error) {
            console.error('[API] exportData failed:', error);
            throw error;
        }
    }

    async clearData() {
        // console.log('[API] clearData called');
        try {
            const result = await this.request('/data/clear', {
                method: 'POST',
            });
            // console.log('[API] clearData success, result:', result);
            return result;
        } catch (error) {
            console.error('[API] clearData failed:', error);
            throw error;
        }
    }

    // Settings: Get week_start_day only
    async getWeekStartDay() {
        const result = await this.request('/settings/week_start_day');
        return result.week_start_day;
    }

    // Analytics Operations Section
    async getCompletionsTrend(period = 'daily', startDate = null, endDate = null) {
        let url = `/analytics/completions?period=${period}`;
        if (startDate) url += `&start=${startDate}`;
        if (endDate) url += `&end=${endDate}`;
        return this.request(url);
    }

    async getHabitConsistency() {
        return this.request('/analytics/habit-consistency');
    }

    async getHabitDetails(habitId) {
        return this.request(`/analytics/habit-consistency/${habitId}`);
    }
}
export default new ApiService();
