import React from "react";

const CategoryBar = ({ categories, selectedCategoryId, onSelect }) => (
  <div className="category-bar">
    {categories.map(cat => (
      <div
        key={cat.id}
        className={`category-segment${cat.id === selectedCategoryId ? " selected" : ""}`}
        style={{ width: `${100 / categories.length}%` }}
        onClick={() => onSelect(cat.id)}
      >
        {cat.name}
      </div>
    ))}
  </div>
);

export default CategoryBar;
