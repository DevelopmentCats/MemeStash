import { defineStore } from 'pinia';
import CategoryService from '@/services/category.service';
import { ApiService } from '@/services/api.service';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    currentCategory: null,
    isLoading: false,
    error: null,
    isOffline: !navigator.onLine
  }),
  
  getters: {
    allCategories: (state) => state.categories,
    categoryById: (state) => (id) => state.categories.find(category => category.id === id),
    currentCategoryData: (state) => state.currentCategory,
    isLoadingCategories: (state) => state.isLoading,
    categoryError: (state) => state.error
  },
  
  actions: {
    async fetchCategories(params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          this.isOffline = true;
          // Use cached categories when offline
          const cachedCategories = CategoryService.getCachedCategories();
          this.categories = cachedCategories;
          return cachedCategories;
        }
        
        this.isOffline = false;
        const response = await CategoryService.getCategories(params);
        this.categories = response.data;
        
        // Cache categories for offline access
        CategoryService.cacheCategories(this.categories);
        
        return this.categories;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch categories';
        
        // If network error, try to use cached categories
        if (!navigator.onLine || error.message === 'Network Error') {
          this.isOffline = true;
          const cachedCategories = CategoryService.getCachedCategories();
          this.categories = cachedCategories;
          return cachedCategories;
        }
        
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchCategoryById(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          this.isOffline = true;
          // Try to find in cached categories
          const cachedCategories = CategoryService.getCachedCategories();
          const cachedCategory = cachedCategories.find(cat => cat.id === id);
          if (cachedCategory) {
            this.currentCategory = cachedCategory;
            return cachedCategory;
          }
          throw new Error('Category not available offline');
        }
        
        this.isOffline = false;
        const response = await CategoryService.getCategory(id);
        this.currentCategory = response.data;
        return this.currentCategory;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch category';
        
        // If network error, try to find in cached categories
        if (!navigator.onLine || error.message === 'Network Error') {
          this.isOffline = true;
          const cachedCategories = CategoryService.getCachedCategories();
          const cachedCategory = cachedCategories.find(cat => cat.id === id);
          if (cachedCategory) {
            this.currentCategory = cachedCategory;
            return cachedCategory;
          }
        }
        
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async createCategory(categoryData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          throw new Error('Cannot create category while offline');
        }
        
        const response = await CategoryService.createCategory(categoryData);
        const newCategory = response.data.category;
        
        // Add to categories list and update cache
        this.categories = [...this.categories, newCategory];
        CategoryService.cacheCategories(this.categories);
        
        return newCategory;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create category';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateCategory(id, categoryData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          throw new Error('Cannot update category while offline');
        }
        
        const response = await CategoryService.updateCategory(id, categoryData);
        const updatedCategory = response.data.category;
        
        // Update in list and cache
        const index = this.categories.findIndex(category => category.id === id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        
        if (this.currentCategory && this.currentCategory.id === id) {
          this.currentCategory = updatedCategory;
        }
        
        CategoryService.cacheCategories(this.categories);
        
        return updatedCategory;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update category';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteCategory(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          throw new Error('Cannot delete category while offline');
        }
        
        await CategoryService.deleteCategory(id);
        
        // Remove from list and update cache
        this.categories = this.categories.filter(category => category.id !== id);
        CategoryService.cacheCategories(this.categories);
        
        if (this.currentCategory && this.currentCategory.id === id) {
          this.currentCategory = null;
        }
        
        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete category';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchMemesByCategory(id, params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          throw new Error('Cannot fetch memes by category while offline');
        }
        
        const response = await CategoryService.getMemesByCategory(id, params);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch memes by category';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    clearError() {
      this.error = null;
    },
    
    checkOnlineStatus() {
      this.isOffline = !navigator.onLine;
    }
  }
});