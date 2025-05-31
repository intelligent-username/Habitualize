/**
 * API service for Habitualize backend communication
 * Centralizes all HTTP requests to the Flask backend
 */

const API_BASE_URL = 'http://127.0.0.1:5000';

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

    // Category operations
    async getCategories() {
        return this.request('/categories');
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

    // Sequence operations
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

    // Habit operations
    async createHabit(habitData) {
        return this.request('/habits', {
            method: 'POST',
            body: JSON.stringify(habitData),
        });
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
}

export default new ApiService();
