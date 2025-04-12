import ApiService from './api.service';

export const CategoryService = {
  /**
   * Get all categories
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @returns {Promise} - Promise with categories data
   */
  getCategories(params = {}) {
    return ApiService.get('/categories', params);
  },

  /**
   * Get a single category by ID
   * @param {number} id - Category ID
   * @returns {Promise} - Promise with category data
   */
  getCategory(id) {
    return ApiService.get(`/categories/${id}`);
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Category name
   * @param {string} categoryData.description - Category description
   * @param {string} categoryData.color - Category color (hex code)
   * @param {string} categoryData.icon - Category icon name
   * @returns {Promise} - Promise with created category data
   */
  createCategory(categoryData) {
    return ApiService.post('/categories', categoryData);
  },

  /**
   * Update an existing category
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise} - Promise with updated category data
   */
  updateCategory(id, categoryData) {
    return ApiService.put(`/categories/${id}`, categoryData);
  },

  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {Promise} - Promise with deletion confirmation
   */
  deleteCategory(id) {
    return ApiService.delete(`/categories/${id}`);
  },

  /**
   * Get memes by category ID
   * @param {number} id - Category ID
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} - Promise with memes data and pagination info
   */
  getMemesByCategory(id, params = {}) {
    return ApiService.get(`/categories/${id}/memes`, params);
  },

  /**
   * Cache categories for offline access
   * @param {Array} categories - Categories to cache
   */
  cacheCategories(categories) {
    try {
      localStorage.setItem('cachedCategories', JSON.stringify(categories));
      localStorage.setItem('categoriesCachedAt', new Date().toISOString());
    } catch (error) {
      console.error('Error caching categories:', error);
    }
  },

  /**
   * Get cached categories
   * @returns {Array} - Cached categories or empty array if not cached
   */
  getCachedCategories() {
    try {
      return JSON.parse(localStorage.getItem('cachedCategories')) || [];
    } catch (error) {
      console.error('Error getting cached categories:', error);
      return [];
    }
  },

  /**
   * Check if cached categories are stale (older than 1 hour)
   * @returns {boolean} - True if cached categories are stale
   */
  areCachedCategoriesStale() {
    try {
      const cachedAt = localStorage.getItem('categoriesCachedAt');
      if (!cachedAt) return true;
      
      const cachedTime = new Date(cachedAt).getTime();
      const currentTime = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      
      return (currentTime - cachedTime) > oneHour;
    } catch (error) {
      console.error('Error checking cached categories:', error);
      return true;
    }
  }
};

export default CategoryService;