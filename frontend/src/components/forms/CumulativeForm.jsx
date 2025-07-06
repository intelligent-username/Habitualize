import React from "react";

/**
 * CumulativeForm - Component for configuring cumulative habits
 * Handles weekly/monthly/yearly goal settings
 * Renders only fields, NOT a <form>
 */
export const CumulativeForm = ({
    cumulativePeriod,
    setCumulativePeriod,
    cumulativeGoal,
    setCumulativeGoal,
    error
}) => (
    <div style={{ marginTop: "1.2rem" }}>
        {error && <div className="form-error" style={{color: 'red', marginBottom: 8}}>{error}</div>}
        <label className="habit-form-label">Cumulative Period</label>
        <select
            value={cumulativePeriod}
            onChange={e => setCumulativePeriod(e.target.value)}
            required
            style={{ display: 'block', marginBottom: 8 }}
        >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
        </select>
        <label className="habit-form-label">Goal (number of reps/units)</label>
        <input
            type="number"
            value={cumulativeGoal}
            onChange={e => setCumulativeGoal(e.target.value)}
            placeholder="Goal"
            min={1}
            required
            style={{ display: 'block', marginBottom: 8 }}
        />
    </div>
);
