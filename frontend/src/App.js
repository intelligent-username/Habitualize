import React, { useState, useEffect } from "react";
import './App.css';
import WeekBar from "./components/WeekBar";
import MonthView from "./components/MonthView";
import { getStartOfWeek } from "./components/dateUtils";
import { addDays, subDays, format, startOfWeek, parseISO } from 'date-fns';
import { HabitItem, HabitForm, COLOR_OPTIONS, getContrastColor } from "./components/Habit";

function getLocalDateString(date) {
    return format(date, 'yyyy-MM-dd');
}

const App = () => {
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState("");
    const [color, setColor] = useState("gray");
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
    const [showHabitForm, setShowHabitForm] = useState(false);
    const [showMonthView, setShowMonthView] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        getLocalDateString(startOfWeek(new Date()))
    );

    useEffect(() => {
        const start = getLocalDateString(startOfWeek(parseISO(selectedDate)));
        setCurrentWeekStart(start);
    }, [selectedDate]);

    const toggleHabitForm = () => setShowHabitForm(!showHabitForm);

    const fetchHabitsByDate = async (date) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/habits/by-date/${date}`);
            const data = await response.json();
            setHabits(data);
        } catch (error) {
            console.error("Failed to fetch habits by date:", error);
        }
    };

    const addHabit = async () => {
        if (!newHabit.trim()) return;
        try {
            await fetch("http://127.0.0.1:5000/habits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newHabit, color }),
            });
            setNewHabit("");
            setColor("gray");
            fetchHabitsByDate(selectedDate);
        } catch (error) {
            console.error("Failed to add habit:", error);
        }
    };

    const deleteHabit = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this habit?");
        if (!confirmed) return;
        try {
            await fetch(`http://127.0.0.1:5000/habits/${id}`, {
                method: "DELETE",
            });
            fetchHabitsByDate(selectedDate);
        } catch (error) {
            console.error("Failed to delete habit:", error);
        }
    };

    const toggleCompletion = async (id, completed) => {
        try {
            await fetch(`http://127.0.0.1:5000/habits/${id}/history`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: completed ? 1 : 0, date: selectedDate }),
            });
            fetchHabitsByDate(selectedDate);
        } catch (error) {
            console.error("Failed to toggle completion:", error);
        }
    };

    useEffect(() => {
        fetchHabitsByDate(selectedDate);
    }, [selectedDate]);

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            addHabit();
        }
    };

    // WeekBar handlers
    const handleSelectDate = (date) => {
        setSelectedDate(getLocalDateString(date));
    };

    const handlePrevWeek = () => {
        const prevWeek = subDays(parseISO(selectedDate), 7);
        setSelectedDate(getLocalDateString(prevWeek));
    };

    const handleNextWeek = () => {
        const nextWeek = addDays(parseISO(selectedDate), 7);
        setSelectedDate(getLocalDateString(nextWeek));
    };

    const handleOpenMonthView = () => setShowMonthView(true);
    const handleCloseMonthView = () => setShowMonthView(false);

    const handleToday = () => {
        setSelectedDate(getLocalDateString(new Date()));
    };

    return (
        <div className="container">
            <h1>Habitualize</h1>
            <WeekBar
                currentWeekStart={currentWeekStart}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onOpenMonthView={handleOpenMonthView}
                onToday={handleToday}
            />
            {showMonthView && (
                <MonthView
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    onClose={handleCloseMonthView}
                />
            )}
            <button onClick={toggleHabitForm} className="toggle-habit-form-button">
                {showHabitForm ? "Cancel" : "Create New Habit"}
            </button>
            {showHabitForm && (
                <HabitForm
                    newHabit={newHabit}
                    setNewHabit={setNewHabit}
                    addHabit={addHabit}
                    handleInputKeyDown={handleInputKeyDown}
                    color={color}
                    setColor={setColor}
                />
            )}
            <ul className="habit-list">
                {habits
                    .slice()
                    .sort((a, b) => a.completed - b.completed)
                    .map((habit) => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            toggleCompletion={toggleCompletion}
                            deleteHabit={deleteHabit}
                        />
                    ))}
            </ul>
            <div className="footer-text">
                <small>
                    You can mark completion for any date
                </small>
            </div>
        </div>
    );
};

export default App;
