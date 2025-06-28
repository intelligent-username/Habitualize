import React from "react";
import { HabitItem } from "./HabitItem.jsx";
import SequenceGroup from "./SequenceGroup.jsx";

/**
 * HabitList component
 * Renders a list of sequences and habits, using HabitItem for single-habit sequences
 * and SequenceGroup for multi-step sequences.
 * All handlers are passed through as props for full control.
 */
const HabitList = ({
  sequences,
  onToggleCompletion,
  onDeleteHabit,
  onEditHabit,
  onEditSequence,
  onDeleteSequence,
  selectedCategoryId
}) => {
  // Filter sequences by selected category
  const filteredSequences = sequences.filter(
    seq => seq.category_id === selectedCategoryId
  );

  return (
    <ul className="habit-list">
      {filteredSequences.map(seq =>
        seq.steps.length === 1 ? (
          <HabitItem
            key={seq.steps[0].id}
            habit={{ ...seq.steps[0], color: seq.color, category_id: seq.category_id }}
            toggleCompletion={onToggleCompletion}
            deleteHabit={habit => onDeleteHabit(habit, seq)}
            onEdit={onEditHabit}
          />
        ) : (
          <SequenceGroup
            key={seq.id}
            sequence={seq}
            onEditSequence={onEditSequence}
            onDeleteSequence={onDeleteSequence}
            onEditHabit={onEditHabit}
            onDeleteHabit={onDeleteHabit}
            onToggleCompletion={onToggleCompletion}
          />
        )
      )}
    </ul>
  );
};

export default HabitList;
