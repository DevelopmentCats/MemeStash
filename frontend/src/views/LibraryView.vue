<template>
  <div class="library">
    <div class="page-header">
      <h2 class="page-title">Meme Library</h2>
      <router-link to="/upload" class="btn-primary upload-btn">
        <span class="btn-icon">+</span> Upload New Meme
      </router-link>
    </div>
    
    <!-- Search and Filter Controls -->
    <div class="controls-panel">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="debounceSearch" 
            placeholder="Search memes..." 
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
      </div>
      
      <div class="filter-sort">
        <div class="sort-option">
          <label for="sortBy">Sort by:</label>
          <select id="sortBy" v-model="sortBy" @change="fetchMemes" class="sort-select">
            <option value="createdAt">Date Added</option>
            <option value="title">Title</option>
            <option value="fileSize">File Size</option>
          </select>
        </div>
        
        <div class="sort-option">
          <label for="sortOrder">Order:</label>
          <select id="sortOrder" v-model="sortOrder" @change="fetchMemes" class="sort-order-select">
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Tags Filter (horizontally scrollable) -->
    <div class="tags-section">
      <h3 class="section-subtitle">Filter by Tags</h3>
      <div class="tags-filter">
        <div 
          class="tag-chip" 
          :class="{ active: activeTagId === null }" 
          @click="setActiveTag(null)"
        >
          All
        </div>
        <div 
          v-for="tag in tags" 
          :key="tag.id" 
          class="tag-chip" 
          :class="{ active: activeTagId === tag.id }" 
          @click="setActiveTag(tag.id)"
        >
          {{ tag.name }}
        </div>
        
        <div v-if="tags.length === 0" class="empty-tags">
          No tags found. Add tags when uploading memes.
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-animation">
        <div class="loading-spinner"></div>
      </div>
      <p class="loading-text">Loading your meme collection...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="fetchMemes" class="btn-retry">
        Try Again
      </button>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="memes.length === 0" class="empty-container">
      <div class="empty-illustration">
        <div class="empty-icon">🖼️</div>
      </div>
      <h3 class="empty-title">Your Meme Collection is Empty</h3>
      <p class="empty-message">
        {{ 
          searchQuery.trim() || activeTagId ? 
          'No memes match your current filters. Try different search terms or clear filters.' : 
          'Start building your collection by uploading your first meme!' 
        }}
      </p>
      
      <div class="empty-actions">
        <button v-if="searchQuery.trim() || activeTagId" @click="clearFilters" class="btn-secondary">
          Clear Filters
        </button>
        <router-link to="/upload" class="btn-primary">
          Upload Your First Meme
        </router-link>
      </div>
    </div>
    
    <!-- Meme Grid -->
    <transition-group v-else name="fade" tag="div" class="meme-grid">
      <div 
        v-for="meme in memes" 
        :key="meme.id" 
        class="meme-card" 
        @click="viewMeme(meme.id)"
      >
        <div class="meme-thumbnail-container">
          <img 
            :src="`/api/memes/${meme.id}/file`" 
            :alt="meme.title" 
            class="meme-thumbnail"
            loading="lazy"
          >
        </div>
        <div class="meme-info">
          <h3 class="meme-title" :title="meme.title">{{ meme.title }}</h3>
          <div class="meme-meta">
            <span class="meme-date">{{ formatDate(meme.createdAt) }}</span>
            <span v-if="meme.fileSize" class="meme-size">{{ formatFileSize(meme.fileSize) }}</span>
          </div>
          <div class="meme-tags">
            <span 
              v-for="tag in meme.tags" 
              :key="tag.id" 
              class="meme-tag"
              @click.stop="setActiveTag(tag.id)"
              :title="`Filter by ${tag.name}`"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </transition-group>
    
    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="pagination">
      <button 
        @click="changePage(1)" 
        :disabled="pagination.page === 1"
        class="page-button page-first"
        title="First page"
      >
        «
      </button>
      
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page === 1"
        class="page-button"
        title="Previous page"
      >
        ‹
      </button>
      
      <div class="page-info">
        <span>Page</span>
        <select 
          v-model="pagination.page" 
          @change="changePage(pagination.page)"
          class="page-select"
        >
          <option 
            v-for="pageNum in pagination.totalPages" 
            :key="pageNum" 
            :value="pageNum"
          >
            {{ pageNum }}
          </option>
        </select>
        <span>of {{ pagination.totalPages }}</span>
      </div>
      
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page === pagination.totalPages"
        class="page-button"
        title="Next page"
      >
        ›
      </button>
      
      <button 
        @click="changePage(pagination.totalPages)" 
        :disabled="pagination.page === pagination.totalPages"
        class="page-button page-last"
        title="Last page"
      >
        »
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LibraryView',
  data() {
    return {
      memes: [],
      tags: [],
      activeTagId: null,
      searchQuery: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      },
      isLoading: true,
      error: null,
      searchTimeout: null
    }
  },
  created() {
    // Get query parameters if any
    this.getQueryParams();
    this.fetchMemes();
    this.fetchTags();
  },
  watch: {
    // Update browser URL when filters change
    '$route.query': 'getQueryParams'
  },
  methods: {
    getQueryParams() {
      const query = this.$route.query;
      
      if (query.search) {
        this.searchQuery = query.search;
      }
      
      if (query.tagId) {
        this.activeTagId = parseInt(query.tagId, 10);
      }
      
      if (query.sortBy && ['createdAt', 'title', 'fileSize'].includes(query.sortBy)) {
        this.sortBy = query.sortBy;
      }
      
      if (query.sortOrder && ['ASC', 'DESC'].includes(query.sortOrder)) {
        this.sortOrder = query.sortOrder;
      }
      
      if (query.page && !isNaN(parseInt(query.page, 10))) {
        this.pagination.page = parseInt(query.page, 10);
      }
    },
    updateQueryParams() {
      const query = {};
      
      if (this.searchQuery.trim()) {
        query.search = this.searchQuery;
      }
      
      if (this.activeTagId !== null) {
        query.tagId = this.activeTagId;
      }
      
      if (this.sortBy !== 'createdAt') {
        query.sortBy = this.sortBy;
      }
      
      if (this.sortOrder !== 'DESC') {
        query.sortOrder = this.sortOrder;
      }
      
      if (this.pagination.page > 1) {
        query.page = this.pagination.page;
      }
      
      // Replace URL without reloading page
      this.$router.replace({ query }).catch(() => {});
    },
    async fetchMemes() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder
        };
        
        if (this.searchQuery) {
          params.search = this.searchQuery;
        }
        
        if (this.activeTagId) {
          params.tagId = this.activeTagId;
        }
        
        const response = await axios.get('/api/memes', { params });
        this.memes = response.data.memes;
        this.pagination = response.data.pagination;
        
        // Update query params in URL
        this.updateQueryParams();
      } catch (error) {
        console.error('Error fetching memes:', error);
        this.error = 'Failed to load memes. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },
    async fetchTags() {
      try {
        const response = await axios.get('/api/tags');
        this.tags = response.data.tags;
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    },
    setActiveTag(tagId) {
      this.activeTagId = tagId;
      this.pagination.page = 1; // Reset to first page when changing filters
      this.fetchMemes();
    },
    debounceSearch() {
      // Debounce search to avoid making too many requests while typing
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1; // Reset to first page when searching
        this.fetchMemes();
      }, 300);
    },
    changePage(page) {
      if (page === this.pagination.page) return;
      
      this.pagination.page = page;
      this.fetchMemes();
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    viewMeme(memeId) {
      this.$router.push(`/memes/${memeId}`);
    },
    clearFilters() {
      this.searchQuery = '';
      this.activeTagId = null;
      this.pagination.page = 1;
      this.fetchMemes();
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    },
    formatFileSize(bytes) {
      if (!bytes) return '';
      
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
    }
  }
}
</script>

<style scoped>
.library {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  position: relative;
  display: inline-block;
  padding-bottom: 0.5rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background-color: var(--bg-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.btn-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.controls-panel {
  background-color: var(--bg-white);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-container {
  flex: 1;
  min-width: 250px;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--secondary-text);
}

.filter-sort {
  display: flex;
  gap: 1rem;
}

.sort-option {
  display: flex;
  flex-direction: column;
}

.sort-option label {
  font-size: 0.875rem;
  color: var(--secondary-text);
  margin-bottom: 0.5rem;
}

.sort-select, .sort-order-select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--bg-white);
  min-width: 140px;
  cursor: pointer;
}

.tags-section {
  margin-bottom: 2rem;
}

.section-subtitle {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.tags-filter {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  padding: 0.5rem 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  gap: 0.5rem;
}

.tag-chip {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.tag-chip:hover {
  background-color: var(--bg-light);
  transform: translateY(-2px);
}

.tag-chip.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.empty-tags {
  color: var(--secondary-text);
  font-style: italic;
  padding: 0.5rem 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.loading-animation {
  margin-bottom: 1.5rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(66, 185, 131, 0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--secondary-text);
  font-size: 1.1rem;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  color: var(--error-color);
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.empty-illustration {
  margin-bottom: 1.5rem;
}

.empty-icon {
  font-size: 5rem;
  color: var(--secondary-text);
  opacity: 0.7;
}

.empty-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.empty-message {
  color: var(--secondary-text);
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.empty-actions {
  display: flex;
  gap: 1rem;
}

.meme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.meme-card {
  background-color: var(--bg-white);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.meme-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--hover-shadow);
  border-color: var(--primary-light);
}

.meme-thumbnail-container {
  height: 160px;
  overflow: hidden;
  background-color: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.meme-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.meme-card:hover .meme-thumbnail {
  transform: scale(1.05);
}

.meme-info {
  padding: 1rem;
}

.meme-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meme-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--secondary-text);
  margin-bottom: 0.75rem;
}

.meme-date, .meme-size {
  display: inline-block;
}

.meme-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.meme-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background-color: var(--bg-light);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.meme-tag:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 0.5rem;
}

.page-button {
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-white);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-button:hover:not(:disabled) {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.page-button:disabled {
  color: var(--secondary-text);
  background-color: var(--bg-light);
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0.5rem;
  font-size: 0.9rem;
}

.page-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-white);
  cursor: pointer;
  min-width: 3rem;
  text-align: center;
}

/* Animation for grid items */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .upload-btn {
    width: 100%;
    justify-content: center;
  }
  
  .controls-panel {
    flex-direction: column;
  }
  
  .filter-sort {
    width: 100%;
  }
  
  .sort-option {
    flex: 1;
  }
  
  .sort-select, .sort-order-select {
    width: 100%;
  }
  
  .meme-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .empty-actions {
    flex-direction: column;
    width: 100%;
    padding: 0 1rem;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
</style> 