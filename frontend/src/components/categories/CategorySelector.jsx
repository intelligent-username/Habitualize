import React from "react";

/**
 * CategorySelector - A component for selecting habit categories
 * Simple dropdown that renders available categories
 */
const CategorySelector = ({ 
    categories, 
    categoryId, 
    onCategoryChange 
}) => {
    return (
        <>
            <label className="habit-form-label" style={{ marginTop: "1rem" }}>Category</label>
            <select 
                value={categoryId} 
                onChange={e => onCategoryChange(Number(e.target.value))}
            >
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
        </>
    );
};

export default CategorySelector;
