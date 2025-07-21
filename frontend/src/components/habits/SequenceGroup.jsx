import React from "react";
import { HabitItem } from "./HabitItem.jsx";

const SequenceGroup = ({
  sequence,
  onEditSequence,
  onDeleteSequence,
  onToggleCompletion,
  onDeleteHabit,
  onEditHabit
}) => {

  // If this is a single-habit sequence, render as a single HabitItem
  if (sequence.steps.length === 1) {
    const habit = sequence.steps[0];
    return (
      <HabitItem
        key={habit.id}
        habit={{ ...habit, color: sequence.color, category_id: sequence.category_id }}
        toggleCompletion={onToggleCompletion}
        deleteHabit={h => onDeleteHabit(h, sequence)}
        onEdit={onEditHabit}
      />
    );
  }

  // Else use REAL sequence rendering
  return (
    <div className="sequence-group">
      <div className="sequence-label">{sequence.name}</div>
      <ul className="sequence-children">
        {sequence.steps.map((habit, idx) => {
          const firstIncompleteIdx = sequence.steps.findIndex(h => !h.completed);
          const disabled = idx > firstIncompleteIdx && firstIncompleteIdx !== -1;
          return (
            <HabitItem
              key={habit.id}
              habit={{ ...habit, color: sequence.color, category_id: sequence.category_id }}
              toggleCompletion={(id, completed, value) => {
                if (!completed && idx < sequence.steps.length - 1) {
                  // When unchecking this step, uncheck all subsequent completed steps
                  for (let i = idx + 1; i < sequence.steps.length; i++) {
                    if (sequence.steps[i].completed) {
                      // For counter/entry habits, send value=0 to trigger deletion
                      const stepHabit = sequence.steps[i];
                      const resetValue = (stepHabit.type === "counter" || stepHabit.type === "entry") ? 0 : 0;
                      onToggleCompletion(sequence.steps[i].id, false, resetValue);
                    }
                  }
                }
                onToggleCompletion(id, completed, value);
              }}
              deleteHabit={h => onDeleteHabit(h, sequence)}
              onEdit={onEditHabit}
              disabled={disabled}
            />
          );
        })}
      </ul>
      <button
        className="edit-sequence-btn"
        onClick={() => onEditSequence(sequence)}
      >
        Edit Sequence
      </button>
      <button className="delete-sequence-btn" onClick={() => onDeleteSequence(sequence.id)}>
        Delete Sequence
      </button>
    </div>
  );
};

export default SequenceGroup;

