<template>
  <div class="shared-meme">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading shared meme...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>
    
    <!-- Meme Content -->
    <div v-else-if="meme" class="meme-content">
      <h2 class="meme-title">{{ meme.title }}</h2>
      
      <div class="meme-container">
        <img :src="`/api/share/${token}/file`" :alt="meme.title" class="meme-image">
      </div>
      
      <div class="meme-info-panel">
        <div v-if="meme.description" class="meme-description">
          <h3>Description</h3>
          <p>{{ meme.description }}</p>
        </div>
        
        <div class="meme-metadata">
          <p>Shared via Meme Stash - Your Personal Meme Library</p>
        </div>
        
        <div class="action-buttons">
          <button @click="downloadMeme" class="btn-download">
            <span class="action-icon">⬇️</span> Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SharedMemeView',
  data() {
    return {
      meme: null,
      isLoading: true,
      error: null,
      token: null
    }
  },
  created() {
    this.token = this.$route.params.token;
    this.fetchSharedMeme();
  },
  methods: {
    async fetchSharedMeme() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`/api/share/${this.token}`);
        this.meme = response.data.meme;
      } catch (error) {
        console.error('Error fetching shared meme:', error);
        this.error = 'This shared meme link is invalid or has expired.';
      } finally {
        this.isLoading = false;
      }
    },
    downloadMeme() {
      const link = document.createElement('a');
      link.href = `/api/share/${this.token}/file`;
      link.download = this.meme.originalFilename || this.meme.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
</script>

<style scoped>
.shared-meme {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.loading-container, .error-container {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 185, 131, 0.3);
  border-radius: 50%;
  border-top-color: #42b983;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  color: #dc3545;
}

.meme-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.meme-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.meme-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.meme-info-panel {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.meme-description {
  margin-bottom: 1.5rem;
}

.meme-description h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.meme-metadata {
  font-size: 0.875rem;
  color: #6c757d;
  text-align: center;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.btn-download {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-download:hover {
  background-color: #3aa876;
}

.action-icon {
  font-size: 1.2rem;
}
</style> 