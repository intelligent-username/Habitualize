/**
 * Custom hook for category state management
 * Handles all category-related operations and state
 */

import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch all categories from backend
     */
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getCategories();
            setCategories(data);
            
            // Validate selected category still exists
            if (!data.find(cat => cat.id === selectedCategoryId)) {
                setSelectedCategoryId(1);
            }
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create new category
     * @param {string} name - Category name
     * @returns {Promise<Object>} - Created category data
     */
    const createCategory = async (name) => {
        if (!name?.trim()) {
            throw new Error('Category name is required');
        }
        
        try {
            const result = await apiService.createCategory(name);
            await fetchCategories(); // Refresh list
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Update category name
     * @param {number} id - Category ID
     * @param {string} name - New category name
     * @returns {Promise<Object>} - Updated category data
     */
    const updateCategory = async (id, name) => {
        if (!name?.trim()) {
            throw new Error('Category name is required');
        }
        
        try {
            const result = await apiService.updateCategory(id, name);
            await fetchCategories(); // Refresh list
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Delete category (moves sequences to default category)
     * @param {number} id - Category ID
     */
    const deleteCategory = async (id) => {
        if (id === 1) {
            throw new Error('Cannot delete default category');
        }
        
        try {
            await apiService.deleteCategory(id);
            if (selectedCategoryId === id) {
                setSelectedCategoryId(1);
            }
            await fetchCategories(); // Refresh list
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Select category filter
     * @param {number} categoryId - Category ID to select
     */
    const selectCategory = (categoryId) => {
        setSelectedCategoryId(categoryId);
    };

    // Load categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        categories,
        selectedCategoryId,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        selectCategory,
    };
};
