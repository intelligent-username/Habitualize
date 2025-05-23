import React, { useState, useRef, useEffect } from "react";

// All 12 Color options for habits
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
    { name: "Gold", value: "gold", hex: "#ffc107" },
    { name: "Olive", value: "olive", hex: "#808000" }
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
export const HabitItem = ({ habit, toggleCompletion, deleteHabit, onEdit }) => {
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
            <button onClick={() => onEdit(habit)} style={{ marginLeft: "1rem" }}>Edit</button>
            <button onClick={() => deleteHabit(habit.id)} style={{ marginLeft: "0.5rem" }}>Delete</button>
        </li>
    );
};

// Habit form component
export const HabitForm = ({
    newHabit, setNewHabit, addHabit, updateHabit, editingHabit,
    handleInputKeyDown,
    color, setColor,
    categories, categoryId, setCategoryId
}) => {
    const [showColorGrid, setShowColorGrid] = useState(false);
    const colorBtnRef = useRef(null);

    // Close color grid if clicked outside
    useEffect(() => {
        const handleClick = (e) => {
            if (
                colorBtnRef.current &&
                !colorBtnRef.current.contains(e.target)
            ) {
                setShowColorGrid(false);
            }
        };
        if (showColorGrid) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showColorGrid]);

    const currentColorHex = COLOR_OPTIONS.find(opt => opt.value === color)?.hex || "#9e9e9e";

    return (
        <form className="add-habit" onSubmit={e => {
            e.preventDefault();
            editingHabit ? updateHabit() : addHabit();
        }}>
            <label className="habit-form-label" htmlFor="habit-name-input">Habit name</label>
            <input
                id="habit-name-input"
                type="text"
                placeholder="Habit Name"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoFocus
            />

            <div style={{ display: "flex", alignItems: "center", marginTop: "1rem", position: "relative" }}>
                <label className="habit-form-label" style={{ margin: 0 }}>Color</label>
                <button
                    type="button"
                    ref={colorBtnRef}
                    className="color-preview-btn"
                    style={{
                        background: currentColorHex,
                        marginLeft: "0.75rem",
                        border: color === "gray" ? "2px solid #ccc" : "2px solid var(--accent)"
                    }}
                    onClick={() => setShowColorGrid(v => !v)}
                    aria-label="Pick color"
                />
                {showColorGrid && (
                    <div
                        className="color-grid-popup"
                        onMouseDown={e => e.stopPropagation()} // <-- Add this line
                    >
                        <div className="color-grid">
                            {COLOR_OPTIONS.map(opt => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    className={`color-square${color === opt.value ? " selected" : ""}`}
                                    style={{ background: opt.hex }}
                                    onClick={() => {
                                        setColor(opt.value);
                                        setShowColorGrid(false);
                                    }}
                                    aria-label={opt.name}
                                >
                                    {color === opt.value && <span className="color-check">&#10003;</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <label className="habit-form-label" style={{ marginTop: "1rem" }}>Category</label>
            <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <button type="submit" className="add-habit-button" style={{ marginTop: "1.5rem" }}>
                {editingHabit ? "Save Changes" : "Add Habit"}
            </button>
        </form>
    );
};
