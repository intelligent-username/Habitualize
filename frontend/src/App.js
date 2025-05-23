import React, { useState, useEffect } from "react";
import './App.css';
import WeekBar from "./components/WeekBar";
import MonthView from "./components/MonthView";
import { addDays, subDays, format, startOfWeek, parseISO } from 'date-fns';
import Modal from "./components/Modal";
import { HabitItem, HabitForm } from "./components/Habit";
import CategoryBar from "./components/CategoryBar";

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
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(1); // default category
    const [categoryId, setCategoryId] = useState(1); // for new habit form
    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        getLocalDateString(startOfWeek(new Date(), { weekStartsOn: 0 }))
    );
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [renameCategoryId, setRenameCategoryId] = useState(null);
    const [renameCategoryName, setRenameCategoryName] = useState("");
    const [editingHabit, setEditingHabit] = useState(null);

    useEffect(() => {
        const start = getLocalDateString(startOfWeek(parseISO(selectedDate), { weekStartsOn: 0 }));
        setCurrentWeekStart(start);
    }, [selectedDate]);

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch habits when date or selected category changes
    useEffect(() => {
        fetchHabitsByDate(selectedDate);
    }, [selectedDate, categories]);

    const fetchHabitsByDate = async (date) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/habits/by-date/${date}`);
            const data = await response.json();
            setHabits(data);
        } catch (error) {
            console.error("Failed to fetch habits by date:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/categories");
            const data = await response.json();
            setCategories(data);
            // If selectedCategoryId is gone (e.g. after delete), reset to default
            if (!data.find(cat => cat.id === selectedCategoryId)) {
                setSelectedCategoryId(1);
            }
            // If creating a habit, default to selected or first category
            if (!data.find(cat => cat.id === categoryId)) {
                setCategoryId(data[0]?.id || 1);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const addHabit = async () => {
        if (!newHabit.trim()) return;
        try {
            await fetch("http://127.0.0.1:5000/habits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newHabit, color, category_id: categoryId }),
            });
            setNewHabit("");
            setColor("gray");
            setCategoryId(selectedCategoryId || 1);
            setShowHabitForm(false);
            fetchHabitsByDate(selectedDate);
        } catch (error) {
            console.error("Failed to add habit:", error);
        }
    };

    const updateHabit = async () => {
        if (!newHabit.trim() || !editingHabit) return;
        try {
            await fetch(`http://127.0.0.1:5000/habits/${editingHabit.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newHabit,
                    color,
                    category_id: categoryId
                }),
            });
            setEditingHabit(null);
            setNewHabit("");
            setColor("gray");
            setCategoryId(selectedCategoryId || 1);
            setShowHabitForm(false);
            fetchHabitsByDate(selectedDate);
        } catch (error) {
            console.error("Failed to update habit:", error);
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

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            editingHabit ? updateHabit() : addHabit();
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

    // Category management
    const handleOpenCategoryModal = () => {
        setShowCategoryModal(true);
        setNewCategoryName("");
        setRenameCategoryId(null);
        setRenameCategoryName("");
    };

    const handleCloseCategoryModal = () => {
        setShowCategoryModal(false);
        setNewCategoryName("");
        setRenameCategoryId(null);
        setRenameCategoryName("");
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await fetch("http://127.0.0.1:5000/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName }),
            });
            setNewCategoryName("");
            fetchCategories();
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (id === 1) return; // Don't delete default
        const confirmed = window.confirm("Are you sure you want to delete this category?");
        if (!confirmed) return;
        try {
            await fetch(`http://127.0.0.1:5000/categories/${id}`, {
                method: "DELETE",
            });
            if (selectedCategoryId === id) setSelectedCategoryId(1);
            fetchCategories();
            fetchHabitsByDate(selectedDate);
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    const handleStartRenameCategory = (id, name) => {
        setRenameCategoryId(id);
        setRenameCategoryName(name);
    };

    const handleRenameCategory = async () => {
        if (!renameCategoryName.trim() || !renameCategoryId) return;
        try {
            await fetch(`http://127.0.0.1:5000/categories/${renameCategoryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: renameCategoryName }),
            });
            setRenameCategoryId(null);
            setRenameCategoryName("");
            fetchCategories();
        } catch (error) {
            console.error("Failed to rename category:", error);
        }
    };

    // Habit editing
    const handleEditHabit = (habit) => {
        setEditingHabit(habit);
        setNewHabit(habit.name);
        setColor(habit.color);
        setCategoryId(habit.category_id);
        setShowHabitForm(true);
    };

    // Filter habits by selected category
    const filteredHabits = habits.filter(habit => habit.category_id === selectedCategoryId);

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
            <CategoryBar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
            />
            <button
                className="add-category-btn"
                onClick={handleOpenCategoryModal}
            >
                Manage Categories
            </button>
            {showMonthView && (
                <MonthView
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    onClose={handleCloseMonthView}
                />
            )}
            <ul className="habit-list">
                {filteredHabits
                    .slice()
                    .sort((a, b) => a.completed - b.completed)
                    .map((habit) => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            toggleCompletion={toggleCompletion}
                            deleteHabit={deleteHabit}
                            onEdit={handleEditHabit}
                        />
                    ))}
            </ul>
            <button onClick={() => {
                setShowHabitForm(true);
                setEditingHabit(null);
                setNewHabit("");
                setColor("gray");
                setCategoryId(selectedCategoryId || 1);
            }} className="toggle-habit-form-button">
                {showHabitForm && !editingHabit ? "Cancel" : "Create New Habit"}
            </button>
            {showHabitForm && (
                <Modal onClose={() => {
                    setShowHabitForm(false);
                    setEditingHabit(null);
                    setNewHabit("");
                    setColor("gray");
                    setCategoryId(selectedCategoryId || 1);
                }}>
                    <HabitForm
                        newHabit={newHabit}
                        setNewHabit={setNewHabit}
                        addHabit={addHabit}
                        updateHabit={updateHabit}
                        editingHabit={editingHabit}
                        handleInputKeyDown={handleInputKeyDown}
                        color={color}
                        setColor={setColor}
                        categories={categories}
                        categoryId={categoryId}
                        setCategoryId={setCategoryId}
                    />
                </Modal>
            )}
            {showCategoryModal && (
                <Modal onClose={handleCloseCategoryModal}>
                    <div className="category-modal-content">
                        <div className="category-modal-header">Manage Categories</div>
                        <div className="category-modal-add-row">
                            <input
                                type="text"
                                placeholder="New category name"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                            />
                            <button onClick={handleAddCategory}>Add</button>
                        </div>
                        <ul className="category-list">
                            {categories.map(cat => (
                                <li key={cat.id} className="category-list-item">
                                    {renameCategoryId === cat.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={renameCategoryName}
                                                onChange={e => setRenameCategoryName(e.target.value)}
                                                style={{ marginRight: "0.5rem", flex: 1 }}
                                            />
                                            <div className="category-list-actions">
                                                <button onClick={handleRenameCategory}>Save</button>
                                                <button onClick={() => setRenameCategoryId(null)}>Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="category-list-name">{cat.name}</span>
                                            <div className="category-list-actions">
                                                <button onClick={() => handleStartRenameCategory(cat.id, cat.name)}>Rename</button>
                                                {cat.id !== 1 && (
                                                    <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Modal>
            )}
            <div className="footer-text">
                <small>
                    You can mark completion for any date
                </small>
            </div>
        </div>
    );
};

export default App;
 