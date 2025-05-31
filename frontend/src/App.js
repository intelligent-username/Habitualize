import React, { useState, useEffect } from "react";
import './App.css';
import WeekBar from "./components/WeekBar";
import MonthView from "./components/MonthView";
import Modal from "./components/Modal";
import { HabitItem, HabitForm } from "./components/Habit";
import CategoryBar from "./components/CategoryBar";

// Custom hooks
import { useCategories } from "./hooks/useCategories";
import { useSequences } from "./hooks/useSequences";
import { useHabits } from "./hooks/useHabits";

// Utils
import { 
    getLocalDateString, 
    getCurrentWeekStart, 
    getPreviousWeek, 
    getNextWeek 
} from "./utils/dateHelpers";

const DEFAULT_TYPE = "binary";

const App = () => {
    // Date state
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getCurrentWeekStart(getLocalDateString(new Date())));

    // Categories
    const {
        categories,
        selectedCategoryId,
        selectCategory,
        createCategory,
        updateCategory,
        deleteCategory
    } = useCategories();

    // Sequences with refresh callback
    const {
        sequences,
        fetchSequencesByDate,
        createSingleHabitSequence,
        createMultiStepSequence,
        updateSequence,
        deleteSequence,
        getSequence
    } = useSequences(selectedDate, categories);

    // Habits with refresh callback
    const { 
        toggleCompletion, 
        updateHabit: updateHabitHook, 
        deleteHabit: deleteHabitHook 
    } = useHabits(() => fetchSequencesByDate(selectedDate));

    // UI state
    const [showHabitForm, setShowHabitForm] = useState(false);
    const [showMonthView, setShowMonthView] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Form state
    const [newHabit, setNewHabit] = useState("");
    const [color, setColor] = useState("gray");
    const [type, setType] = useState(DEFAULT_TYPE);
    const [targetValue, setTargetValue] = useState("");
    const [categoryId, setCategoryId] = useState(1);

    // Edit state
    const [editingHabit, setEditingHabit] = useState(null);
    const [editingSequence, setEditingSequence] = useState(null);

    // Category modal state
    const [newCategoryName, setNewCategoryName] = useState("");
    const [renameCategoryId, setRenameCategoryId] = useState(null);
    const [renameCategoryName, setRenameCategoryName] = useState("");

    // Update week start when date changes
    useEffect(() => {
        setCurrentWeekStart(getCurrentWeekStart(selectedDate));
    }, [selectedDate]);

    // --- Habit/Sequence Creation ---
    const addHabit = async (habitObj) => {
        if (typeof habitObj === "string" || typeof habitObj === "undefined") {
            if (!newHabit.trim()) return;
            await createSingleHabitSequence({
                name: newHabit,
                color,
                category_id: categoryId,
                type,
                target_value: targetValue || null
            });
            resetHabitForm();
            return;
        }

        await createSingleHabitSequence(habitObj);
        resetHabitForm();
    };

    // Global function for multi-step sequences
    window.addSequenceHabit = async (sequenceData) => {
        await createMultiStepSequence(sequenceData);
        resetHabitForm();
    };

    const handleEditHabit = (habit) => {
        const seq = sequences.find(s => s.steps.some(h => h.id === habit.id));
        if (seq && seq.steps.length === 1) {
            setEditingHabit(habit);
            setEditingSequence(null);
            setNewHabit(habit.name);
            setColor(seq.color);
            setCategoryId(seq.category_id);
            setType(habit.type || DEFAULT_TYPE);
            setTargetValue(habit.target_value || "");
            setShowHabitForm(true);
        } else if (seq) {
            handleEditSequence(seq);
        }
    };

    const updateHabit = async () => {
        if (!newHabit.trim() || !editingHabit) return;
        
        const payload = {
            name: newHabit,
            type,
            target_value: targetValue || null,
        };
        
        // Preserve cumulative fields
        if (typeof editingHabit.cumulative !== 'undefined') payload.cumulative = editingHabit.cumulative;
        if (typeof editingHabit.cumulative_goal !== 'undefined') payload.cumulative_goal = editingHabit.cumulative_goal;
        if (typeof editingHabit.cumulative_period !== 'undefined') payload.cumulative_period = editingHabit.cumulative_period;

        try {
            // Update habit using hook
            await updateHabitHook(editingHabit.id, payload);

            // Update sequence if color/category changed
            const seq = sequences.find(s => s.steps.some(h => h.id === editingHabit.id));
            if (seq && (seq.color !== color || seq.category_id !== categoryId)) {
                await updateSequence({
                    id: seq.id,
                    name: seq.name,
                    color,
                    category_id: categoryId
                });
            }

            resetHabitForm();
        } catch (error) {
            console.error("Failed to update habit:", error);
        }
    };

    const resetHabitForm = () => {
        setEditingHabit(null);
        setEditingSequence(null);
        setNewHabit("");
        setColor("gray");
        setType(DEFAULT_TYPE);
        setTargetValue("");
        setCategoryId(selectedCategoryId || 1);
        setShowHabitForm(false);
    };

    // --- Deletion logic ---
    const deleteHabit = async (habit, sequence) => {
        const confirmed = window.confirm("Are you sure you want to delete this habit?");
        if (!confirmed) return;

        try {
            if (sequence.steps.length === 1) {
                await deleteSequence(sequence.id);
            } else {
                await deleteHabitHook(habit.id);
            }
        } catch (error) {
            console.error("Failed to delete habit:", error);
        }
    };

    const handleDeleteSequence = async (sequenceId) => {
        const confirmed = window.confirm("Are you sure you want to delete this sequence?");
        if (!confirmed) return;
        await deleteSequence(sequenceId);
    };

    // --- Navigation ---
    const handleSelectDate = (date) => {
        setSelectedDate(getLocalDateString(date));
    };

    const handlePrevWeek = () => {
        setSelectedDate(getPreviousWeek(selectedDate));
    };

    const handleNextWeek = () => {
        setSelectedDate(getNextWeek(selectedDate));
    };

    const handleToday = () => {
        setSelectedDate(getLocalDateString(new Date()));
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            editingHabit ? updateHabit() : addHabit();
        }
    };

    // --- Category management ---
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
            await createCategory(newCategoryName);
            setNewCategoryName("");
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (id === 1) return;
        const confirmed = window.confirm("Are you sure you want to delete this category?");
        if (!confirmed) return;
        try {
            await deleteCategory(id);
            await fetchSequencesByDate(selectedDate);
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
            await updateCategory(renameCategoryId, renameCategoryName);
            setRenameCategoryId(null);
            setRenameCategoryName("");
        } catch (error) {
            console.error("Failed to rename category:", error);
        }
    };

    // --- Sequence editing ---
    const handleEditSequence = async (seq) => {
        try {
            const sequenceData = await getSequence(seq.id);
            setEditingSequence(sequenceData);
            setEditingHabit(null);
            setNewHabit(sequenceData.name);
            setColor(sequenceData.color);
            setCategoryId(sequenceData.category_id);
            setShowHabitForm(true);
        } catch (error) {
            console.error("Failed to fetch sequence for editing:", error);
        }
    };

    // Filter sequences by selected category
    const filteredSequences = sequences.filter(seq => seq.category_id === selectedCategoryId);

    return (
        <div className="container">
            <h1>Habitualize</h1>
            <WeekBar
                currentWeekStart={currentWeekStart}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onOpenMonthView={() => setShowMonthView(true)}
                onToday={handleToday}
            />
            <CategoryBar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={selectCategory}
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
                    onClose={() => setShowMonthView(false)}
                />
            )}
            <ul className="habit-list">
                {filteredSequences.map(seq => (
                    seq.steps.length === 1 ? (
                        <HabitItem
                            key={seq.steps[0].id}
                            habit={{ ...seq.steps[0], color: seq.color }}
                            toggleCompletion={(id, completed, value) => 
                                toggleCompletion(id, completed, value, selectedDate)
                            }
                            deleteHabit={habit => deleteHabit(habit, seq)}
                            onEdit={handleEditHabit}
                        />
                    ) : (
                        <div className="sequence-group" key={seq.id}>
                            <div className="sequence-label">{seq.name}</div>
                            <button
                                className="edit-sequence-btn"
                                style={{ marginBottom: "0.7rem", marginLeft: "1rem", background: "var(--accent)", color: "var(--bg-primary)", border: "none", borderRadius: "6px", padding: "6px 18px", fontWeight: 600, fontSize: "1.05rem", cursor: "pointer" }}
                                onClick={() => handleEditSequence(seq)}
                            >
                                Edit Sequence
                            </button>
                            <ul className="sequence-children">
                                {seq.steps.map((habit, idx) => {
                                    const firstIncompleteIdx = seq.steps.findIndex(h => !h.completed);
                                    const disabled = idx > firstIncompleteIdx && firstIncompleteIdx !== -1;
                                    return (
                                        <HabitItem
                                            key={habit.id}
                                            habit={{ ...habit, color: seq.color }}
                                            toggleCompletion={(id, completed, value) => {
                                                if (!completed && idx < seq.steps.length - 1) {
                                                    for (let i = idx + 1; i < seq.steps.length; i++) {
                                                        if (seq.steps[i].completed) {
                                                            toggleCompletion(seq.steps[i].id, false, undefined, selectedDate);
                                                        }
                                                    }
                                                }
                                                toggleCompletion(id, completed, value, selectedDate);
                                            }}
                                            deleteHabit={h => deleteHabit(h, seq)}
                                            onEdit={handleEditHabit}
                                            disabled={disabled}
                                        />
                                    );
                                })}
                            </ul>
                            <button className="delete-sequence-btn" onClick={() => handleDeleteSequence(seq.id)}>Delete Sequence</button>
                        </div>
                    )
                ))}
            </ul>
            <button onClick={() => {
                setShowHabitForm(true);
                setEditingHabit(null);
                setNewHabit("");
                setColor("gray");
                setType(DEFAULT_TYPE);
                setTargetValue("");
                setCategoryId(selectedCategoryId || 1);
            }} className="toggle-habit-form-button">
                {showHabitForm && !editingHabit ? "Cancel" : "Create New Habit"}
            </button>
            {showHabitForm && (
                <Modal onClose={resetHabitForm}>
                    <HabitForm
                        newHabit={newHabit}
                        setNewHabit={setNewHabit}
                        addHabit={addHabit}
                        updateHabit={updateHabit}
                        updateSequence={updateSequence}
                        editingHabit={editingHabit}
                        handleInputKeyDown={handleInputKeyDown}
                        color={color}
                        setColor={setColor}
                        categories={categories}
                        categoryId={categoryId}
                        setCategoryId={setCategoryId}
                        type={type}
                        setType={setType}
                        targetValue={targetValue}
                        setTargetValue={setTargetValue}
                        editingSequence={editingSequence}
                        onUpdateSequence={updateSequence}
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
                <small>You can mark completion for any date</small>
            </div>
        </div>
    );
};

export default App;
