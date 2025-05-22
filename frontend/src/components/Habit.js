import React from "react";

// Color options for habits
export const COLOR_OPTIONS = [
    { name: "Gray", value: "gray", hex: "#9e9e9e" },
    { name: "Light Blue", value: "light_blue", hex: "#4fc3f7" },
    { name: "Dark Blue", value: "dark_blue", hex: "#1565c0" },
    { name: "Yellow", value: "yellow", hex: "#ffeb3b" },
    { name: "Orange", value: "orange", hex: "#ff9800" },
    { name: "Red", value: "red", hex: "#e53935" },
    { name: "Dark Gray", value: "dark_gray", hex: "#616161" },
    { name: "Purple", value: "purple", hex: "#7e57c2" },
    { name: "Green", value: "green", hex: "#66bb6a" },
    { name: "Pink", value: "pink", hex: "#ec407a" },
    { name: "Gold", value: "gold", hex: "#ffc107" }
];

// Utility to get contrast color for text
export const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
};

// Habit item component
export const HabitItem = ({ habit, toggleCompletion, deleteHabit }) => {
    const colorHex = COLOR_OPTIONS.find(opt => opt.value === habit.color)?.hex || "#b0b0b0";
    const textColor = getContrastColor(colorHex);

    return (
        <li
            className={`habit ${habit.completed ? "completed" : ""}`}
            style={{
                backgroundColor: habit.completed ? "#f0f0f0" : colorHex,
                color: textColor,
                opacity: habit.completed ? 0.5 : 1,
                borderLeft: `10px solid ${colorHex}`,
                transition: "background-color 0.3s, opacity 0.3s"
            }}
        >
            <input
                type="checkbox"
                checked={habit.completed}
                onChange={e => toggleCompletion(habit.id, e.target.checked)}
            />
            <span className="habit-name">{habit.name}</span>
            <span className="habit-date">(Created: {habit.date_created})</span>
            <button onClick={() => deleteHabit(habit.id)}>Delete</button>
        </li>
    );
};

// Habit form component
export const HabitForm = ({ newHabit, setNewHabit, addHabit, handleInputKeyDown, color, setColor }) => (
    <div className="add-habit">
        <input
            type="text"
            placeholder="Enter a new habit..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={handleInputKeyDown}
        />
        <select value={color} onChange={e => setColor(e.target.value)}>
            {COLOR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.name}</option>
            ))}
        </select>
        <button onClick={addHabit} className="add-habit-button">Add Habit</button>
    </div>
);
