import React from "react";
import TemplateForm from "./template.jsx";

/**
 * CumulativeForm - Component for configuring cumulative habits
 * Handles weekly/monthly/yearly goal settings
 * CURRENTLY INCOMPLETE!! Overhaul cumulative habits LATER
 */

export const CumulativeForm = ({
    cumulativePeriod,
    setCumulativePeriod,
    cumulativeGoal,
    setCumulativeGoal
}) => {
    const fields = [
        {
            label: "Cumulative Period",
            type: "select",
            value: cumulativePeriod,
            onChange: e => setCumulativePeriod(e.target.value),
            options: [
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" }
            ]
        },
        {
            label: "Goal (number of reps/units)",
            type: "number",
            value: cumulativeGoal,
            onChange: e => setCumulativeGoal(e.target.value),
            placeholder: "Goal",
            min: 1,
            marginTop: 8
        }
    ];
    return <TemplateForm fields={fields} style={{ marginTop: "1.2rem" }} />;
};
