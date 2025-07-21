import React from "react";
import { Modal } from "../ui";
import { useCategories } from "../../hooks/useCategories.js";

const CategoryModal = ({ onClose }) => {
  // Use the hook directly instead of receiving props
  const {
    categories,
    newCategoryName,
    setNewCategoryName,
    renameCategoryId,
    renameCategoryName,
    setRenameCategoryId,
    setRenameCategoryName,
    handleAddCategory,
    handleDeleteCategory,
    handleStartRenameCategory,
    handleRenameCategory
  } = useCategories();

  return (
    <Modal onClose={onClose}>
      <div className="category-modal-content">
        <div className="category-modal-header">Manage Categories</div>
        <div className="category-modal-add-row">
          <input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
          />
          <button onClick={handleAddCategory}>Add</button>
        </div>
        <ul className="category-list">
          {categories.map(cat => (
            <li key={cat.id} className="category-list-item">
              {renameCategoryId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={renameCategoryName}
                    onChange={e => setRenameCategoryName(e.target.value)}
                    style={{ marginRight: "0.5rem", flex: 1 }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameCategory();
                    }}
                  />
                  <div className="category-list-actions">
                    <button onClick={handleRenameCategory}>Save</button>
                    <button onClick={() => setRenameCategoryId(null)}>Close</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="category-list-name">{cat.name}</span>
                  <div className="category-list-actions">
                    <button className="edit-btn" onClick={() => handleStartRenameCategory(cat.id, cat.name)}>Rename</button>
                    {cat.id !== 1 && (
                      <button className="delete-btn" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default CategoryModal;

