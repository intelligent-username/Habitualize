import React from "react";
import { HabitItem } from "./HabitItem.jsx";
import SequenceGroup from "./SequenceGroup.jsx";
import { useSettings } from "../../hooks/useSettings.js";

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
  const { getFilterCompletedToBottom } = useSettings();
  const filterCompletedToBottom = getFilterCompletedToBottom();

  // Filter sequences by selected category
  const filteredSequences = sequences.filter(
    seq => seq.category_id === selectedCategoryId
  );

  // Sort sequences if needed - put completed at bottom
  const sortedSequences = filterCompletedToBottom
    ? [...filteredSequences].sort((a, b) => {
        // For sequences with single steps
        if (a.steps.length === 1 && b.steps.length === 1) {
          if (a.steps[0].completed && !b.steps[0].completed) return 1;
          if (!a.steps[0].completed && b.steps[0].completed) return -1;
          return 0;
        }

        // For multi-step sequences - determine if all steps are completed
        const aAllCompleted =
          a.steps.length > 0 && a.steps.every(step => step.completed);
        const bAllCompleted =
          b.steps.length > 0 && b.steps.every(step => step.completed);

        if (aAllCompleted && !bAllCompleted) return 1;
        if (!aAllCompleted && bAllCompleted) return -1;
        return 0;
      })
    : filteredSequences;

  return (
    <ul className="habit-list">
      {sortedSequences.map(seq =>
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
