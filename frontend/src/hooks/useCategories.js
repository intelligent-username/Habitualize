/**
 * Custom hook for category state management
 * Handles all category-related operations and state using React Query
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

export const useCategories = () => {
    const queryClient = useQueryClient();
    const [selectedCategoryId, setSelectedCategoryId] = useState(1);
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
        structuralSharing: true // Ensure React Query uses structural sharing to prevent unnecessary re-renders
    });

    // Memoize categories to prevent reference changes when data is identical
    const stableCategories = useMemo(() => categories, [JSON.stringify(categories)]);

    // Validate selected category still exists when categories change
    useEffect(() => {
        if (stableCategories.length > 0 && !stableCategories.find(cat => cat.id === selectedCategoryId)) {
            setSelectedCategoryId(1);
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
            if (id === 1) {
                return Promise.reject(new Error('Cannot delete default category'));
            }
            return apiService.deleteCategory(id);
        },
        onSuccess: (data, id) => {
            // If the deleted category was selected, reset to default
            if (selectedCategoryId === id) {
                setSelectedCategoryId(1);
            }
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });    // Wrapper functions to maintain original API
    const createCategory = (name) => createCategoryMutation.mutateAsync(name);
    const updateCategory = ({ id, name }) => updateCategoryMutation.mutateAsync({ id, name });
    const deleteCategory = (id) => deleteCategoryMutation.mutateAsync(id);/**
     * Select category filter
     * @param {number} categoryId - Category ID to select
     */
    const selectCategory = (categoryId) => {
        setSelectedCategoryId(categoryId);
    };

    // Modal handlers
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await createCategory(newCategoryName);
            setNewCategoryName("");
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    };
    const handleDeleteCategory = async (id) => {
        if (id === 1) return;
        const confirmed = window.confirm("Are you sure you want to delete this category?");
        if (!confirmed) return;
        try {
            await deleteCategory(id);
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };
    const handleStartRenameCategory = (id, name) => {
        setRenameCategoryId(id);
        setRenameCategoryName(name);
    };
    const handleRenameCategory = async () => {
        if (!renameCategoryName.trim() || !renameCategoryId) return;
        try {
            await updateCategory({ id: renameCategoryId, name: renameCategoryName });
            setRenameCategoryId(null);
            setRenameCategoryName("");
        } catch (error) {
            console.error("Failed to rename category:", error);
        }
    };
    const handleOpenCategoryModal = () => {
        setShowCategoryModal(true);
        setNewCategoryName("");
        setRenameCategoryId(null);
        setRenameCategoryName("");
    };
    const handleCloseCategoryModal = () => {
        setShowCategoryModal(false);
        setNewCategoryName("");
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
        // Modal state and handlers
        showCategoryModal,
        newCategoryName,
        setNewCategoryName,
        renameCategoryId,
        renameCategoryName,
        setRenameCategoryId,
        setRenameCategoryName,
        handleAddCategory,
        handleDeleteCategory,
        handleStartRenameCategory,
        handleRenameCategory,
        handleOpenCategoryModal,
        handleCloseCategoryModal
    };
};
