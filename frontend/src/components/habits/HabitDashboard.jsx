import React, { useState } from "react";
import { Modal } from "../ui";
import { HabitForm } from "../forms";
import HabitList from "./HabitList.jsx";
import { useSequences } from "../../hooks/useSequences.js";
import { useHabits } from "../../hooks/useHabits.js";

const HabitDashboard = ({ selectedDate, selectedCategoryId }) => {
    // UI state
    const [editingHabit, setEditingHabit] = useState(null);
    const [editingSequenceId, setEditingSequenceId] = useState(null);
    const [showHabitForm, setShowHabitForm] = useState(false);

    // --- Data Hooks ---
    const {
        sequences,
        loading: sequencesLoading,
        error: sequencesError,
        deleteSequence,
    } = useSequences(selectedDate);

    const {
        toggleCompletion,
        deleteHabit,
        error: habitsError
    } = useHabits();

    // --- Habit/Sequence Operations ---
    const handleEditHabit = (habit) => {
        setEditingHabit(habit);
        setEditingSequenceId(null);
        setShowHabitForm(true);
    };

    const handleEditSequence = (seq) => {
        setEditingSequenceId(seq.id);
        setEditingHabit(null);
        setShowHabitForm(true);
    };

    const handleDeleteHabit = async (habit, sequence) => {
        const confirmed = window.confirm("Are you sure you want to delete this habit?");
        if (!confirmed) return;
        try {
            if (sequence.steps.length === 1) {
                await deleteSequence(sequence.id);
            } else {
                await deleteHabit(habit.id);
            }
        } catch (error) {
            console.error("Failed to delete habit:", error);
        }
    };

    const handleDeleteSequence = async (sequenceId) => {
        const confirmed = window.confirm("Are you sure you want to delete this sequence?");
        if (!confirmed) return;
        try {
            await deleteSequence(sequenceId);
        } catch (error) {
            console.error("Failed to delete sequence:", error);
        }
    };

    const handleToggleCompletion = async (id, completed, value) => {
        try {
            await toggleCompletion(id, completed, value, selectedDate);
        } catch (error) {
            console.error("Could not toggle completion:", error);
        }
    };

    return (
        <>
            <HabitList
                sequences={sequences}
                onToggleCompletion={handleToggleCompletion}
                onDeleteHabit={handleDeleteHabit}
                onEditHabit={handleEditHabit}
                onEditSequence={handleEditSequence}
                onDeleteSequence={handleDeleteSequence}
                selectedCategoryId={selectedCategoryId}
            />
            <button onClick={() => {
                setShowHabitForm(true);
                setEditingHabit(null);
                setEditingSequenceId(null);
            }} className="toggle-habit-form-button">
                {showHabitForm ? "Cancel" : "Create New Habit"}
            </button>
            {showHabitForm && (
                <Modal onClose={() => setShowHabitForm(false)}>
                    <HabitForm
                        editingHabit={editingHabit}
                        editingSequenceId={editingSequenceId}
                        selectedDate={selectedDate}
                        onClose={() => setShowHabitForm(false)}
                        initialCategoryId={selectedCategoryId}
                    />
                </Modal>
            )}
            {sequencesLoading && <div>Loading sequences...</div>}
            {sequencesError && <div style={{color: 'red'}}>Error loading sequences: {sequencesError}</div>}
            {habitsError && <div style={{color: 'red'}}>Habit error: {habitsError}</div>}
        </>
    );
};

export default HabitDashboard;
