import React, { useEffect } from "react";
import { useCategories } from "../../hooks/useCategories";
import CategoryBar from "./CategoryBar";
import CategoryModal from "./CategoryModal";

const CategoryManager = ({ onCategorySelect, initialSelectedCategoryId }) => {
  const {
    categories,
    selectedCategoryId,
    selectCategory,
    modal
  } = useCategories(initialSelectedCategoryId);

  // Propagate category selection to the parent component
  useEffect(() => {
    if (onCategorySelect) {
      onCategorySelect(selectedCategoryId);
    }
  }, [selectedCategoryId, onCategorySelect]);

  return (
    <>
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={selectCategory}
      />
      <button
        className="add-category-btn"
        onClick={modal.open}
      >
        Manage Categories
      </button>
      {modal.show && (
        <CategoryModal onClose={modal.close} />
      )}
    </>
  );
};

export default CategoryManager;
