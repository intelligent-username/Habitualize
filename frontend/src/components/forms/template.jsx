import React from "react";

/**
 * TemplateForm - Base form for all habit forms
 * Provides core label/input/select rendering and value/onChange handling
 * Extend this in HabitForm, SequenceForm, and CumulativeForm for stepwise refactor
 */
const TemplateForm = ({
    fields = [], // [{ label, type, value, onChange, ...extraProps }]
    children,
    ...rest
}) => {
    return (
        <div {...rest}>
            {fields.map((field, idx) => {
                if (field.type === "select") {
                    return (
                        <div key={idx} style={{ marginTop: field.marginTop || 0 }}>
                            <label className="habit-form-label">{field.label}</label>
                            <select value={field.value} onChange={field.onChange} {...field.extraProps}>
                                {field.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    );
                }
                if (field.type === "number" || field.type === "text") {
                    return (
                        <div key={idx} style={{ marginTop: field.marginTop || 0 }}>
                            <label className="habit-form-label">{field.label}</label>
                            <input
                                type={field.type}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={field.placeholder}
                                min={field.min}
                                {...field.extraProps}
                            />
                        </div>
                    );
                }
                // fallback for custom field
                return field.render ? field.render() : null;
            })}
            {children}
        </div>
    );
};

export default TemplateForm;


