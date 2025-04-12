import ApiService from './api.service';

export const TagService = {
  /**
   * Get all tags
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @returns {Promise} - Promise with tags data
   */
  getTags(params = {}) {
    return ApiService.get('/tags', params);
  },

  /**
   * Get a single tag by ID
   * @param {number} id - Tag ID
   * @returns {Promise} - Promise with tag data
   */
  getTag(id) {
    return ApiService.get(`/tags/${id}`);
  },

  /**
   * Create a new tag
   * @param {Object} tagData - Tag data
   * @param {string} tagData.name - Tag name
   * @param {string} tagData.color - Tag color (hex code)
   * @returns {Promise} - Promise with created tag data
   */
  createTag(tagData) {
    return ApiService.post('/tags', tagData);
  },

  /**
   * Update an existing tag
   * @param {number} id - Tag ID
   * @param {Object} tagData - Updated tag data
   * @returns {Promise} - Promise with updated tag data
   */
  updateTag(id, tagData) {
    return ApiService.put(`/tags/${id}`, tagData);
  },

  /**
   * Delete a tag
   * @param {number} id - Tag ID
   * @returns {Promise} - Promise with deletion confirmation
   */
  deleteTag(id) {
    return ApiService.delete(`/tags/${id}`);
  },

  /**
   * Get memes by tag ID
   * @param {number} id - Tag ID
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} - Promise with memes data and pagination info
   */
  getMemesByTag(id, params = {}) {
    return ApiService.get(`/tags/${id}/memes`, params);
  },

  /**
   * Cache tags for offline access
   * @param {Array} tags - Tags to cache
   */
  cacheTags(tags) {
    try {
      localStorage.setItem('cachedTags', JSON.stringify(tags));
      localStorage.setItem('tagsCachedAt', new Date().toISOString());
    } catch (error) {
      console.error('Error caching tags:', error);
    }
  },

  /**
   * Get cached tags
   * @returns {Array} - Cached tags or empty array if not cached
   */
  getCachedTags() {
    try {
      return JSON.parse(localStorage.getItem('cachedTags')) || [];
    } catch (error) {
      console.error('Error getting cached tags:', error);
      return [];
    }
  },

  /**
   * Check if cached tags are stale (older than 1 hour)
   * @returns {boolean} - True if cached tags are stale
   */
  areCachedTagsStale() {
    try {
      const cachedAt = localStorage.getItem('tagsCachedAt');
      if (!cachedAt) return true;
      
      const cachedTime = new Date(cachedAt).getTime();
      const currentTime = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      
      return (currentTime - cachedTime) > oneHour;
    } catch (error) {
      console.error('Error checking cached tags:', error);
      return true;
    }
  }
};

export default TagService;