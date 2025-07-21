/**
 * Custom hook for category state management
 * Handles all category-related operations and state using React Query
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

const DEFAULT_CATEGORY_ID = 1;

export const useCategories = (initialSelectedCategoryId) => {
    const queryClient = useQueryClient();
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialSelectedCategoryId || DEFAULT_CATEGORY_ID);
    // Category modal state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [renameCategoryId, setRenameCategoryId] = useState(null);
    const [renameCategoryName, setRenameCategoryName] = useState("");    /**
     * Query for fetching all categories with React Query
     */
    const { 
        data: categories = [], 
        isLoading: loading, 
        error: queryError,
        refetch: fetchCategories
    } = useQuery({
        queryKey: ['categories'],
        queryFn: () => apiService.getCategories(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        structuralSharing: true
    });

    // Remove JSON.stringify from useMemo, just use categories directly
    const stableCategories = categories;

    // Validate selected category still exists when categories change
    useEffect(() => {
        if (stableCategories.length > 0 && !stableCategories.find(cat => cat.id === selectedCategoryId)) {
            setSelectedCategoryId(DEFAULT_CATEGORY_ID);
        }
    }, [stableCategories, selectedCategoryId]);

    // Convert error to match original API
    const error = queryError ? queryError.message : null;    /**
     * Mutation for creating a new category
     */
    const createCategoryMutation = useMutation({
        mutationFn: (name) => {
            if (!name?.trim()) {
                return Promise.reject(new Error('Category name is required'));
            }
            return apiService.createCategory(name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    /**
     * Mutation for updating a category
     */
    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, name }) => {
            if (!name?.trim()) {
                return Promise.reject(new Error('Category name is required'));
            }
            return apiService.updateCategory(id, name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    /**
     * Mutation for deleting a category
     */
    const deleteCategoryMutation = useMutation({
        mutationFn: (id) => {
            if (id === DEFAULT_CATEGORY_ID) {
                return Promise.reject(new Error('Cannot delete default category'));
            }
            return apiService.deleteCategory(id);
        },
        onSuccess: (data, id) => {
            if (selectedCategoryId === id) {
                setSelectedCategoryId(DEFAULT_CATEGORY_ID);
            }
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });    // Wrapper functions to maintain o.g. API
    const createCategory = (name) => createCategoryMutation.mutateAsync(name);
    const updateCategory = ({ id, name }) => updateCategoryMutation.mutateAsync({ id, name });
    const deleteCategory = (id) => deleteCategoryMutation.mutateAsync(id);/**
     * Select category filter
     * @param {number} categoryId - Category ID to select
     */
    const selectCategory = (categoryId) => {
        setSelectedCategoryId(categoryId);
    };

    // Modal state and handlers (grouped)
    const [lastError, setLastError] = useState(null);
    const resetModalState = () => {
        setShowCategoryModal(false);
        setNewCategoryName("");
        setRenameCategoryId(null);
        setRenameCategoryName("");
        setLastError(null);
    };
    const modal = {
        show: showCategoryModal,
        newCategoryName,
        setNewCategoryName,
        renameCategoryId,
        renameCategoryName,
        setRenameCategoryId,
        setRenameCategoryName,
        lastError,
        open: () => {
            resetModalState();
            setShowCategoryModal(true);
        },
        close: resetModalState,
        add: async () => {
            setLastError(null);
            if (!newCategoryName.trim()) return;
            try {
                await createCategory(newCategoryName);
                setNewCategoryName("");
            } catch (err) {
                setLastError(err.message || String(err));
            }
        },
        delete: async (id) => {
            setLastError(null);
            if (id === DEFAULT_CATEGORY_ID) return;
            const confirmed = window.confirm("Are you sure you want to delete this category?");
            if (!confirmed) return;
            try {
                await deleteCategory(id);
            } catch (err) {
                setLastError(err.message || String(err));
            }
        },
        startRename: (id, name) => {
            setRenameCategoryId(id);
            setRenameCategoryName(name);
            setLastError(null);
        },
        rename: async () => {
            setLastError(null);
            if (!renameCategoryName.trim() || !renameCategoryId) return;
            try {
                await updateCategory({ id: renameCategoryId, name: renameCategoryName });
                setRenameCategoryId(null);
                setRenameCategoryName("");
            } catch (err) {
                setLastError(err.message || String(err));
            }
        },
        reset: resetModalState
    };

    // --- Modal handlers for CategoryModal compatibility ---
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        await createCategory(newCategoryName);
        setNewCategoryName("");
    };
    const handleDeleteCategory = async (id) => {
        if (id === DEFAULT_CATEGORY_ID) return;
        const confirmed = window.confirm("Are you sure you want to delete this category?");
        if (!confirmed) return;
        await deleteCategory(id);
    };
    const handleStartRenameCategory = (id, name) => {
        setRenameCategoryId(id);
        setRenameCategoryName(name);
    };
    const handleRenameCategory = async () => {
        if (!renameCategoryName.trim() || !renameCategoryId) return;
        await updateCategory({ id: renameCategoryId, name: renameCategoryName });
        setRenameCategoryId(null);
        setRenameCategoryName("");
    };

    return {
        categories: stableCategories,
        selectedCategoryId,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        selectCategory,
        modal,
        // Expose handlers for CategoryModal
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
    };
};
