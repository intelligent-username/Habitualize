import React from "react";

/**
 * CumulativeForm - Component for configuring cumulative habits
 * Handles weekly/monthly/yearly goal settings
 * CURRENTLY INCOMPLETE!! Overhaul cumulative habits LATER
 */

const CumulativeForm = ({
    cumulativePeriod,
    setCumulativePeriod,
    cumulativeGoal,
    setCumulativeGoal
}) => {
    return (
        <div style={{ marginTop: "1.2rem" }}>
            <label className="habit-form-label">Cumulative Period</label>
            <select value={cumulativePeriod} onChange={e => setCumulativePeriod(e.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>
            <label className="habit-form-label" style={{ marginTop: 8 }}>Goal (number of reps/units)</label>
            <input
                type="number"
                min="1"
                value={cumulativeGoal}
                onChange={e => setCumulativeGoal(e.target.value)}
                placeholder="Goal"
            />
        </div>
    );
};

export default CumulativeForm;
