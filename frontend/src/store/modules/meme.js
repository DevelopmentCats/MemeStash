import { defineStore } from 'pinia';
import MemeService from '@/services/meme.service';
import { ApiService } from '@/services/api.service';

export const useMemeStore = defineStore('meme', {
  state: () => ({
    memes: [],
    currentMeme: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    filters: {
      search: '',
      categoryId: null,
      tagId: null,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    },
    isLoading: false,
    error: null,
    uploadProgress: 0,
    isOffline: !navigator.onLine
  }),
  
  getters: {
    allMemes: (state) => state.memes,
    memeById: (state) => (id) => state.memes.find(meme => meme.id === id),
    currentMemeData: (state) => state.currentMeme,
    isLoadingMemes: (state) => state.isLoading,
    memeError: (state) => state.error,
    currentUploadProgress: (state) => state.uploadProgress,
    currentFilters: (state) => state.filters,
    currentPagination: (state) => state.pagination
  },
  
  actions: {
    async fetchMemes(params = {}) {
      this.isLoading = true;
      this.error = null;
      
      // Merge default filters with provided params
      const queryParams = {
        page: this.pagination.page,
        limit: this.pagination.limit,
        ...this.filters,
        ...params
      };
      
      try {
        if (!ApiService.isOnline()) {
          this.isOffline = true;
          // Use cached memes when offline
          const cachedMemes = MemeService.getAllCachedMemes();
          this.memes = cachedMemes;
          this.pagination = {
            total: cachedMemes.length,
            page: 1,
            limit: cachedMemes.length,
            totalPages: 1
          };
          return cachedMemes;
        }
        
        this.isOffline = false;
        const response = await MemeService.getMemes(queryParams);
        this.memes = response.data.memes;
        this.pagination = response.data.pagination;
        
        // Cache memes for offline access
        this.memes.forEach(meme => MemeService.cacheMeme(meme));
        
        return this.memes;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch memes';
        
        // If network error, try to use cached memes
        if (!navigator.onLine || error.message === 'Network Error') {
          this.isOffline = true;
          const cachedMemes = MemeService.getAllCachedMemes();
          this.memes = cachedMemes;
          this.pagination = {
            total: cachedMemes.length,
            page: 1,
            limit: cachedMemes.length,
            totalPages: 1
          };
          return cachedMemes;
        }
        
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchMemeById(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          this.isOffline = true;
          // Try to get from cache when offline
          const cachedMeme = MemeService.getCachedMeme(id);
          if (cachedMeme) {
            this.currentMeme = cachedMeme;
            return cachedMeme;
          }
          throw new Error('Meme not available offline');
        }
        
        this.isOffline = false;
        const response = await MemeService.getMeme(id);
        this.currentMeme = response.data;
        
        // Cache for offline access
        MemeService.cacheMeme(this.currentMeme);
        
        return this.currentMeme;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch meme';
        
        // If network error, try to use cached meme
        if (!navigator.onLine || error.message === 'Network Error') {
          this.isOffline = true;
          const cachedMeme = MemeService.getCachedMeme(id);
          if (cachedMeme) {
            this.currentMeme = cachedMeme;
            return cachedMeme;
          }
        }
        
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async uploadMeme(file, memeData) {
      this.isLoading = true;
      this.error = null;
      this.uploadProgress = 0;
      
      try {
        if (!ApiService.isOnline()) {
          throw new Error('Cannot upload meme while offline');
        }
        
        const response = await MemeService.uploadMeme(
          file, 
          memeData,
          progressEvent => {
            if (progressEvent.lengthComputable) {
              this.uploadProgress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
            }
          }
        );
        
        // Add to memes list and cache
        const newMeme = response.data.meme;
        this.memes = [newMeme, ...this.memes];
        MemeService.cacheMeme(newMeme);
        
        return newMeme;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to upload meme';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateMeme(id, memeData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          throw new Error('Cannot update meme while offline');
        }
        
        const response = await MemeService.updateMeme(id, memeData);
        const updatedMeme = response.data.meme;
        
        // Update in list and cache
        const index = this.memes.findIndex(meme => meme.id === id);
        if (index !== -1) {
          this.memes[index] = updatedMeme;
        }
        
        if (this.currentMeme && this.currentMeme.id === id) {
          this.currentMeme = updatedMeme;
        }
        
        MemeService.cacheMeme(updatedMeme);
        
        return updatedMeme;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update meme';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteMeme(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (!ApiService.isOnline()) {
          throw new Error('Cannot delete meme while offline');
        }
        
        await MemeService.deleteMeme(id);
        
        // Remove from list
        this.memes = this.memes.filter(meme => meme.id !== id);
        
        // Remove from cache
        try {
          const cachedMemes = JSON.parse(localStorage.getItem('cachedMemes')) || {};
          delete cachedMemes[id];
          localStorage.setItem('cachedMemes', JSON.stringify(cachedMemes));
        } catch (error) {
          console.error('Error removing meme from cache:', error);
        }
        
        if (this.currentMeme && this.currentMeme.id === id) {
          this.currentMeme = null;
        }
        
        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete meme';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    updateFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      // Reset to first page when filters change
      this.pagination.page = 1;
    },
    
    setPage(page) {
      this.pagination.page = page;
    },
    
    setLimit(limit) {
      this.pagination.limit = limit;
      // Reset to first page when limit changes
      this.pagination.page = 1;
    },
    
    clearError() {
      this.error = null;
    },
    
    resetUploadProgress() {
      this.uploadProgress = 0;
    },
    
    checkOnlineStatus() {
      this.isOffline = !navigator.onLine;
    }
  }
});