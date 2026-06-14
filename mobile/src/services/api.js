const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiService {
  async request(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  getSequencesByDate(date) {
    return this.request(`/sequences/by-date/${date}`);
  }

  updateHabitCompletion(habitId, { completed, value, date }) {
    return this.request(`/habits/${habitId}/history`, {
      method: 'PUT',
      body: JSON.stringify({ completed, value: value ?? 0, date }),
    });
  }

  getHabitHistory(habitId) {
    return this.request(`/habits/${habitId}/history`);
  }

  getCategories() {
    return this.request('/categories');
  }

  createCategory(name) {
    return this.request('/categories', { method: 'POST', body: JSON.stringify({ name }) });
  }

  getQuoteOfTheDay() {
    return this.request('/quote-of-the-day');
  }
}

export default new ApiService();
