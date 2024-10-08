const API_BASE_URL = 'http://127.0.0.1:5000';

// Fetch all habits
export const fetchHabits = async () => {
  const response = await fetch(`${API_BASE_URL}/habits`);
  return response.json();
};

// Add a new habit
export const addHabit = async (habit) => {
  const response = await fetch(`${API_BASE_URL}/habits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ habit }),
  });
  return response.json();
};
