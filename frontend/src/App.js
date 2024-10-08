import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const response = await fetch('http://127.0.0.1:5000/habits');
    const data = await response.json();
    setHabits(data);
  };

  const addHabit = async () => {
    await fetch('http://127.0.0.1:5000/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newHabit }),
    });
    setNewHabit("");
    fetchHabits();
  };

  const completeHabit = async (id) => {
    await fetch(`http://127.0.0.1:5000/habits/${id}`, {
      method: 'PUT',
    });
    fetchHabits();
  };

  const deleteHabit = async (id) => {
    await fetch(`http://127.0.0.1:5000/habits/${id}`, {
      method: 'DELETE',
    });
    fetchHabits();
  };

  return (
    <div className="App">
      <h1>Habit Tracker</h1>
      <div className="add-habit">
        <input 
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add a new habit"
        />
        <button onClick={addHabit}>Add Habit</button>
      </div>
      <div className="habits-list">
        {habits.map(habit => (
          <div key={habit.id} className="habit">
            <span className={habit.completed ? 'completed' : ''}>
              {habit.name}
            </span>
            <button onClick={() => completeHabit(habit.id)}>Complete</button>
            <button onClick={() => deleteHabit(habit.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
