import React, { useEffect } from "react";
import { useCategories } from "../../hooks/useCategories";
import CategoryBar from "./CategoryBar";
import CategoryModal from "./CategoryModal";

const CategoryManager = ({ onCategorySelect, initialSelectedCategoryId }) => {
  const {
    categories,
    selectedCategoryId,
    selectCategory,
    showCategoryModal,
    handleOpenCategoryModal,
    handleCloseCategoryModal
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
        onClick={handleOpenCategoryModal}
      >
        Manage Categories
      </button>
      {showCategoryModal && (
        <CategoryModal onClose={handleCloseCategoryModal} />
      )}
    </>
  );
};

export default CategoryManager;
