/**
 * API service for Habitualize backend communication
 * Centralizes all HTTP requests to the Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

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
        console.log('[API] getCategories called, making request to /categories');
        try {
            const result = await this.request('/categories');
            console.log('[API] getCategories success, result:', result);
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
    async getCumulativeProgress(habitId) {
        return this.request(`/habits/${habitId}/cumulative-progress`);
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
    async getPomodoroStats(range = 'day', start = null) {
        let url = `/api/pomodoro/stats?range=${range}`;
        if (start) url += `&start=${start}`;
        return this.request(url);
    }

    async getEarliestPomodoroDate() {
        return this.request('/api/pomodoro/earliest');
    }

    async getPomodoroStreaks() {
        return this.request('/api/pomodoro/streaks');
    }

    // QotD
    async getQuoteOfTheDay() {
        return this.request('/api/quote-of-the-day');
    }
}

export default new ApiService();
