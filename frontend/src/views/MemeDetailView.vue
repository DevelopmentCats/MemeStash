<template>
  <div class="meme-detail">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading meme...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <router-link to="/library" class="btn-back-to-library">
        Back to Library
      </router-link>
    </div>
    
    <!-- Meme Content -->
    <div v-else-if="meme" class="meme-content">
      <div class="meme-header">
        <router-link to="/library" class="btn-back">
          <span class="back-icon">←</span>
          <span>Back to Library</span>
        </router-link>
        <div class="meme-actions">
          <button @click="shareMeme" class="btn-action" title="Share this meme">
            <span class="action-icon">🔗</span>
            <span class="action-text">Share</span>
          </button>
          <button @click="downloadMeme" class="btn-action" title="Download this meme">
            <span class="action-icon">⬇️</span>
            <span class="action-text">Download</span>
          </button>
          <button @click="confirmDeleteMeme" class="btn-action btn-delete" title="Delete this meme">
            <span class="action-icon">🗑️</span>
            <span class="action-text">Delete</span>
          </button>
        </div>
      </div>
      
      <div class="meme-main-content">
        <div class="meme-image-section">
          <h2 class="meme-title">{{ meme.title }}</h2>
          
          <div class="meme-container" 
            :class="{ 'fullscreen': isFullscreen }"
            @click="toggleFullscreen"
          >
            <div v-if="!isFullscreen" class="fullscreen-hint">
              <span class="fullscreen-icon">🔍</span>
              <span>Click to enlarge</span>
            </div>
            <img 
              :src="`/api/memes/${meme.id}/file`" 
              :alt="meme.title" 
              class="meme-image" 
              @load="imageLoaded = true"
              :class="{ 'loaded': imageLoaded }"
            >
            <button v-if="isFullscreen" @click.stop="toggleFullscreen" class="close-fullscreen">
              <span>×</span>
            </button>
          </div>
        </div>
        
        <div class="meme-info-panel">
          <div class="meme-metadata">
            <div class="metadata-item">
              <span class="metadata-label">Added on</span>
              <span class="metadata-value">{{ formatDate(meme.createdAt) }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">File size</span>
              <span class="metadata-value">{{ formatFileSize(meme.fileSize) }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Format</span>
              <span class="metadata-value">{{ formatType(meme.fileType) }}</span>
            </div>
          </div>
          
          <div v-if="meme.description" class="meme-description">
            <h3 class="section-title">Description</h3>
            <p class="description-text">{{ meme.description }}</p>
          </div>
          
          <div class="meme-tags-section">
            <h3 class="section-title">Tags</h3>
            <div v-if="meme.tags && meme.tags.length > 0" class="tag-list">
              <router-link 
                v-for="tag in meme.tags" 
                :key="tag.id"
                :to="`/library?tagId=${tag.id}`"
                class="tag-item"
              >
                {{ tag.name }}
              </router-link>
            </div>
            <div v-else class="no-tags">
              No tags added to this meme.
            </div>
            
            <!-- Tag Editing -->
            <div class="tag-edit">
              <div class="tag-input-wrapper">
                <input 
                  type="text" 
                  v-model="newTag" 
                  @keyup.enter="addTag" 
                  placeholder="Add a new tag..."
                  class="tag-input"
                >
                <button @click="addTag" class="btn-add-tag" :disabled="!newTag.trim()">
                  Add
                </button>
              </div>
              <p class="tag-hint">Separate multiple tags with commas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">Confirm Delete</h3>
          <p class="modal-message">Are you sure you want to delete this meme? This action cannot be undone.</p>
          <div class="modal-actions">
            <button @click="cancelDelete" class="btn-cancel">Cancel</button>
            <button @click="deleteMeme" class="btn-confirm-delete">Delete</button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Share Modal -->
    <transition name="fade">
      <div v-if="showShareModal" class="modal-overlay" @click="closeShareModal">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">Share Meme</h3>
          <div class="share-options">
            <div class="share-link-container">
              <label for="shareLink">Copy this link to share your meme:</label>
              <div class="copy-link-input">
                <input 
                  type="text" 
                  id="shareLink" 
                  :value="shareableLink" 
                  readonly 
                  class="share-link-input"
                  ref="shareInput"
                >
                <button @click="copyShareLink" class="btn-copy">
                  {{ linkCopied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>
            <div class="qr-code" v-if="shareableLink">
              <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareableLink)}`" 
                alt="Share QR Code" 
                class="qr-image"
              >
            </div>
            <div class="social-share-buttons">
              <h4 class="share-subtitle">Share on social media</h4>
              <div class="social-buttons">
                <a :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent('Check out this meme!')}`" 
                  target="_blank" 
                  class="btn-social twitter"
                >
                  Twitter
                </a>
                <a :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`" 
                  target="_blank" 
                  class="btn-social facebook"
                >
                  Facebook
                </a>
                <a :href="`https://www.reddit.com/submit?url=${encodeURIComponent(shareableLink)}&title=${encodeURIComponent(meme ? meme.title : 'Check out this meme!')}`" 
                  target="_blank" 
                  class="btn-social reddit"
                >
                  Reddit
                </a>
              </div>
            </div>
          </div>
          <button @click="closeShareModal" class="btn-close-modal">Close</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MemeDetailView',
  data() {
    return {
      meme: null,
      isLoading: true,
      error: null,
      newTag: '',
      showDeleteModal: false,
      showShareModal: false,
      shareableLink: '',
      linkCopied: false,
      isFullscreen: false,
      imageLoaded: false
    }
  },
  created() {
    this.fetchMeme();
  },
  methods: {
    async fetchMeme() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const memeId = this.$route.params.id;
        const response = await axios.get(`/api/memes/${memeId}`);
        this.meme = response.data.meme;
        
        // Set page title
        document.title = `${this.meme.title} - Meme Stash`;
      } catch (error) {
        console.error('Error fetching meme:', error);
        this.error = 'Failed to load meme. It may have been deleted or you do not have permission to view it.';
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return date.toLocaleDateString(undefined, options);
    },
    formatFileSize(bytes) {
      if (!bytes) return 'Unknown';
      
      if (bytes < 1024) return bytes + ' bytes';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
    },
    formatType(mimeType) {
      if (!mimeType) return 'Unknown';
      
      const typeMap = {
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
        'image/gif': 'GIF',
        'image/webp': 'WebP',
        'image/svg+xml': 'SVG'
      };
      
      return typeMap[mimeType] || mimeType.split('/')[1].toUpperCase();
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      
      if (this.isFullscreen) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    },
    async addTag() {
      if (!this.newTag.trim()) return;
      
      try {
        // Split by comma and filter empty values
        const tagNames = this.newTag.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
          
        if (tagNames.length === 0) return;
        
        const promises = tagNames.map(tagName => {
          return axios.post(`/api/memes/${this.meme.id}/tags`, {
            name: tagName
          });
        });
        
        await Promise.all(promises);
        
        // Fetch updated tags
        const response = await axios.get(`/api/memes/${this.meme.id}`);
        this.meme.tags = response.data.meme.tags;
        this.newTag = '';
      } catch (error) {
        console.error('Error adding tag:', error);
        alert('Failed to add tag. Please try again.');
      }
    },
    async removeTag(tagId) {
      try {
        const response = await axios.delete(`/api/memes/${this.meme.id}/tags/${tagId}`);
        this.meme.tags = response.data.tags;
      } catch (error) {
        console.error('Error removing tag:', error);
        alert('Failed to remove tag. Please try again.');
      }
    },
    confirmDeleteMeme() {
      this.showDeleteModal = true;
    },
    cancelDelete() {
      this.showDeleteModal = false;
    },
    async deleteMeme() {
      try {
        await axios.delete(`/api/memes/${this.meme.id}`);
        this.showDeleteModal = false;
        this.$router.push('/library');
      } catch (error) {
        console.error('Error deleting meme:', error);
        alert('Failed to delete meme. Please try again.');
        this.showDeleteModal = false;
      }
    },
    async shareMeme() {
      try {
        const response = await axios.post(`/api/memes/${this.meme.id}/share`);
        this.shareableLink = window.location.origin + `/share/${response.data.token}`;
        this.showShareModal = true;
        this.linkCopied = false;
      } catch (error) {
        console.error('Error generating share link:', error);
        alert('Failed to generate share link. Please try again.');
      }
    },
    closeShareModal() {
      this.showShareModal = false;
    },
    copyShareLink() {
      const el = this.$refs.shareInput;
      el.select();
      document.execCommand('copy');
      this.linkCopied = true;
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        this.linkCopied = false;
      }, 2000);
    },
    downloadMeme() {
      const link = document.createElement('a');
      link.href = `/api/memes/${this.meme.id}/file`;
      link.download = this.meme.originalFilename || this.meme.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
  beforeUnmount() {
    // Reset page title and clean up
    document.title = 'Meme Stash';
    document.body.classList.remove('no-scroll');
  }
}
</script>

<style scoped>
.meme-detail {
  padding: 20px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
}

.loading-spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(66, 185, 131, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

.loading-text {
  color: var(--secondary-text);
  font-size: 1.1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.error-message {
  color: var(--error-color);
  margin-bottom: 2rem;
  max-width: 500px;
  line-height: 1.5;
}

.btn-back-to-library {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-back-to-library:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.meme-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.meme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-back:hover {
  transform: translateX(-5px);
}

.back-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.meme-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: var(--bg-light);
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.btn-delete {
  color: var(--error-color);
}

.btn-delete:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.action-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.meme-main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 992px) {
  .meme-main-content {
    grid-template-columns: 3fr 2fr;
  }
}

.meme-title {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.meme-image-section {
  position: relative;
}

.meme-container {
  background-color: var(--bg-light);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  overflow: hidden;
}

.meme-container:hover .fullscreen-hint {
  opacity: 1;
}

.fullscreen-hint {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 5;
}

.fullscreen-icon {
  margin-right: 0.5rem;
}

.meme-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 0;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.meme-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 4px;
  transition: all 0.3s ease;
  opacity: 0;
}

.meme-image.loaded {
  opacity: 1;
}

.meme-container.fullscreen .meme-image {
  max-height: 90vh;
  max-width: 90vw;
}

.close-fullscreen {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-fullscreen:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.meme-info-panel {
  background-color: var(--bg-white);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
}

.meme-metadata {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.metadata-item {
  display: flex;
  flex-direction: column;
}

.metadata-label {
  font-size: 0.875rem;
  color: var(--secondary-text);
  margin-bottom: 0.5rem;
}

.metadata-value {
  font-weight: 600;
  color: var(--text-color);
}

.meme-description {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.description-text {
  color: var(--text-color);
  line-height: 1.6;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag-item {
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-light);
  border-radius: 20px;
  text-decoration: none;
  color: var(--text-color);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.tag-item:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.no-tags {
  color: var(--secondary-text);
  font-style: italic;
  margin-bottom: 1.5rem;
}

.tag-edit {
  margin-top: 1.5rem;
}

.tag-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.tag-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.tag-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.btn-add-tag {
  padding: 0.75rem 1.25rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-add-tag:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.btn-add-tag:disabled {
  background-color: #84c7a6;
  cursor: not-allowed;
}

.tag-hint {
  font-size: 0.8rem;
  color: var(--secondary-text);
  margin-top: 0.5rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-size: 1.5rem;
}

.modal-message {
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background-color: var(--bg-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.btn-confirm-delete {
  padding: 0.75rem 1.5rem;
  background-color: var(--error-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-confirm-delete:hover {
  background-color: #c82333;
}

.share-options {
  margin-bottom: 1.5rem;
}

.share-link-container {
  margin-bottom: 1.5rem;
}

.share-link-container label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.copy-link-input {
  display: flex;
}

.share-link-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 0.9rem;
}

.btn-copy {
  padding: 0.75rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: 600;
  min-width: 100px;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.qr-image {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem;
  background-color: white;
}

.share-subtitle {
  margin: 1.5rem 0 1rem;
  color: var(--text-color);
  font-size: 1.1rem;
}

.social-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-social {
  flex: 1;
  padding: 0.75rem 0.5rem;
  border: none;
  border-radius: 4px;
  color: white;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-social:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.twitter {
  background-color: #1DA1F2;
}

.facebook {
  background-color: #4267B2;
}

.reddit {
  background-color: #FF4500;
}

.btn-close-modal {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--bg-light);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
}

.btn-close-modal:hover {
  background-color: #e9ecef;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* No scroll for body when fullscreen */
:global(body.no-scroll) {
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .meme-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .meme-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-text {
    display: none;
  }
  
  .action-icon {
    margin-right: 0;
    font-size: 1.5rem;
  }
  
  .btn-action {
    padding: 0.5rem;
    justify-content: center;
    flex: 1;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .social-buttons {
    flex-direction: column;
  }
}
</style> 