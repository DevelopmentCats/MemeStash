import ApiService from './api.service';

export const MemeService = {
  /**
   * Get all memes with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {number} params.categoryId - Filter by category ID
   * @param {number} params.tagId - Filter by tag ID
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort direction (ASC/DESC)
   * @returns {Promise} - Promise with memes data and pagination info
   */
  getMemes(params = {}) {
    return ApiService.get('/memes', params);
  },

  /**
   * Get a single meme by ID
   * @param {number} id - Meme ID
   * @returns {Promise} - Promise with meme data
   */
  getMeme(id) {
    return ApiService.get(`/memes/${id}`);
  },

  /**
   * Upload a new meme
   * @param {File} file - Meme file to upload
   * @param {Object} memeData - Meme metadata
   * @param {string} memeData.title - Meme title
   * @param {string} memeData.description - Meme description
   * @param {Array} memeData.categoryIds - Category IDs
   * @param {Array} memeData.tags - Tag names
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise} - Promise with uploaded meme data
   */
  uploadMeme(file, memeData, onUploadProgress) {
    return ApiService.uploadWithData('/memes', file, memeData, onUploadProgress);
  },

  /**
   * Update an existing meme
   * @param {number} id - Meme ID
   * @param {Object} memeData - Updated meme data
   * @returns {Promise} - Promise with updated meme data
   */
  updateMeme(id, memeData) {
    return ApiService.put(`/memes/${id}`, memeData);
  },

  /**
   * Delete a meme
   * @param {number} id - Meme ID
   * @returns {Promise} - Promise with deletion confirmation
   */
  deleteMeme(id) {
    return ApiService.delete(`/memes/${id}`);
  },

  /**
   * Get meme file URL
   * @param {number} id - Meme ID
   * @returns {string} - URL to meme file
   */
  getMemeFileUrl(id) {
    return `${ApiService.baseURL}/memes/${id}/file`;
  },

  /**
   * Cache meme data for offline access
   * @param {Object} meme - Meme data to cache
   */
  cacheMeme(meme) {
    // Store in localStorage for offline access
    try {
      const cachedMemes = JSON.parse(localStorage.getItem('cachedMemes')) || {};
      cachedMemes[meme.id] = {
        ...meme,
        cachedAt: new Date().toISOString()
      };
      localStorage.setItem('cachedMemes', JSON.stringify(cachedMemes));
    } catch (error) {
      console.error('Error caching meme:', error);
    }
  },

  /**
   * Get cached meme data
   * @param {number} id - Meme ID
   * @returns {Object|null} - Cached meme data or null if not cached
   */
  getCachedMeme(id) {
    try {
      const cachedMemes = JSON.parse(localStorage.getItem('cachedMemes')) || {};
      return cachedMemes[id] || null;
    } catch (error) {
      console.error('Error getting cached meme:', error);
      return null;
    }
  },

  /**
   * Get all cached memes
   * @returns {Array} - Array of cached memes
   */
  getAllCachedMemes() {
    try {
      const cachedMemes = JSON.parse(localStorage.getItem('cachedMemes')) || {};
      return Object.values(cachedMemes);
    } catch (error) {
      console.error('Error getting cached memes:', error);
      return [];
    }
  }
};

export default MemeService;