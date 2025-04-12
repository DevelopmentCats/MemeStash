<template>
  <div class="shared-meme">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading shared meme...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h2 class="error-title">Oops! Something went wrong</h2>
      <p class="error-message">{{ error }}</p>
      <router-link to="/" class="btn-back-to-home">
        Go to Home
      </router-link>
    </div>
    
    <!-- Meme Content -->
    <div v-else-if="meme" class="meme-content">
      <div class="header-bar">
        <div class="app-branding">
          <router-link to="/" class="logo-link">
            <span class="logo-text">Meme Stash</span>
          </router-link>
          <span class="divider">|</span>
          <span class="shared-label">Shared Meme</span>
        </div>
        
        <div class="share-actions" v-if="!isCreatingAccount">
          <button @click="toggleShareOptions" class="btn-share" title="Share this meme">
            <span class="action-icon">🔗</span>
            <span class="action-text">Share</span>
          </button>
          <button @click="downloadMeme" class="btn-download" title="Download this meme">
            <span class="action-icon">⬇️</span>
            <span class="action-text">Download</span>
          </button>
          <button @click="showCreateAccount = true" class="btn-save" title="Save to your account">
            <span class="action-icon">💾</span>
            <span class="action-text">Save to My Stash</span>
          </button>
        </div>
      </div>
      
      <div class="meme-container" :class="{ 'fullscreen': isFullscreen }">
        <div class="meme-card" @click="toggleFullscreen">
          <h1 class="meme-title">{{ meme.title }}</h1>
          
          <div class="image-container">
            <div v-if="!isFullscreen" class="fullscreen-hint">
              <span class="fullscreen-icon">🔍</span>
              <span>Click to enlarge</span>
            </div>
            <img 
              :src="`/api/shared/${token}/file`" 
              :alt="meme.title" 
              class="meme-image"
              @load="imageLoaded = true"
              :class="{ 'loaded': imageLoaded }"
            >
          </div>
          
          <div v-if="meme.description" class="meme-description">
            <p>{{ meme.description }}</p>
          </div>
          
          <div class="meme-metadata">
            <div class="metadata-item" v-if="meme.createdAt">
              <span class="metadata-label">Added on</span>
              <span class="metadata-value">{{ formatDate(meme.createdAt) }}</span>
            </div>
            <div class="metadata-item" v-if="meme.tags && meme.tags.length > 0">
              <span class="metadata-label">Tags</span>
              <div class="tags-wrapper">
                <span v-for="tag in meme.tags" :key="tag.id" class="tag-pill">{{ tag.name }}</span>
              </div>
            </div>
          </div>
          
          <button v-if="isFullscreen" @click.stop="toggleFullscreen" class="close-fullscreen">
            <span>×</span>
          </button>
        </div>
      </div>
      
      <div class="cta-panel">
        <p class="cta-text">Want to save and organize memes like this one?</p>
        <button @click="showCreateAccount = true" class="btn-cta">Create Your Meme Stash</button>
      </div>
    </div>
    
    <!-- Create Account Panel -->
    <transition name="slide">
      <div v-if="showCreateAccount" class="create-account-panel">
        <div class="panel-header">
          <h2 class="panel-title">Save to Your Meme Stash</h2>
          <button @click="showCreateAccount = false" class="btn-close">×</button>
        </div>
        
        <div class="panel-content">
          <p class="panel-description">
            Create an account to save this meme and start building your own collection.
          </p>
          
          <form @submit.prevent="createAccount" class="account-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input 
                type="text" 
                id="username" 
                v-model="newAccount.username" 
                required 
                placeholder="Choose a username"
                :disabled="isCreatingAccount"
              >
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="newAccount.email" 
                required 
                placeholder="Your email address"
                :disabled="isCreatingAccount"
              >
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                v-model="newAccount.password" 
                required 
                placeholder="Create a password"
                :disabled="isCreatingAccount"
              >
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                @click="showCreateAccount = false" 
                class="btn-cancel"
                :disabled="isCreatingAccount"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn-submit"
                :disabled="isCreatingAccount"
              >
                <span v-if="isCreatingAccount" class="spinner-small"></span>
                <span v-else>Create Account</span>
              </button>
            </div>
            
            <div v-if="accountError" class="account-error">
              {{ accountError }}
            </div>
          </form>
          
          <div class="login-option">
            <p>Already have an account?</p>
            <router-link to="/login" class="login-link">Log In</router-link>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Share Options Panel -->
    <transition name="slide">
      <div v-if="showShareOptions" class="share-options-panel">
        <div class="panel-header">
          <h2 class="panel-title">Share this Meme</h2>
          <button @click="toggleShareOptions" class="btn-close">×</button>
        </div>
        
        <div class="panel-content">
          <div class="share-link-container">
            <label for="shareLink">Copy this link:</label>
            <div class="copy-link-input">
              <input 
                type="text" 
                id="shareLink" 
                :value="shareUrl" 
                readonly 
                class="share-link-input"
                ref="shareInput"
              >
              <button @click="copyShareLink" class="btn-copy">
                {{ linkCopied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
          
          <div class="qr-code-container">
            <h3 class="section-title">QR Code</h3>
            <div class="qr-code">
              <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`" 
                alt="Share QR Code" 
                class="qr-image"
              >
              <a :href="`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}&download=1`" 
                download 
                class="download-qr"
              >
                Download QR Code
              </a>
            </div>
          </div>
          
          <div class="social-share">
            <h3 class="section-title">Share on Social Media</h3>
            <div class="social-buttons">
              <a :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this meme!')}`" 
                target="_blank" 
                class="btn-social twitter"
              >
                <span class="social-icon">🐦</span>
                <span>Twitter</span>
              </a>
              <a :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`" 
                target="_blank" 
                class="btn-social facebook"
              >
                <span class="social-icon">👍</span>
                <span>Facebook</span>
              </a>
              <a :href="`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(meme ? meme.title : 'Check out this meme!')}`" 
                target="_blank" 
                class="btn-social reddit"
              >
                <span class="social-icon">🔴</span>
                <span>Reddit</span>
              </a>
              <a :href="`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this meme! ' + shareUrl)}`" 
                target="_blank" 
                class="btn-social whatsapp"
              >
                <span class="social-icon">💬</span>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Background overlay for panels -->
    <div 
      v-if="showCreateAccount || showShareOptions" 
      class="panel-overlay"
      @click="closeAllPanels"
    ></div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SharedMemeView',
  data() {
    return {
      token: '',
      meme: null,
      isLoading: true,
      error: null,
      showCreateAccount: false,
      showShareOptions: false,
      isCreatingAccount: false,
      accountError: null,
      newAccount: {
        username: '',
        email: '',
        password: ''
      },
      linkCopied: false,
      isFullscreen: false,
      imageLoaded: false
    }
  },
  computed: {
    shareUrl() {
      return window.location.href;
    }
  },
  created() {
    this.token = this.$route.params.token;
    this.fetchSharedMeme();
    
    // Set page title
    document.title = 'Shared Meme - Meme Stash';
  },
  methods: {
    async fetchSharedMeme() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`/api/shared/${this.token}`);
        this.meme = response.data.meme;
        
        // Update page title with meme name if available
        if (this.meme && this.meme.title) {
          document.title = `${this.meme.title} - Shared Meme | Meme Stash`;
        }
      } catch (error) {
        console.error('Error fetching shared meme:', error);
        this.error = 'This shared meme link is invalid or has expired.';
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
        day: 'numeric'
      };
      return date.toLocaleDateString(undefined, options);
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      
      if (this.isFullscreen) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    },
    downloadMeme() {
      const link = document.createElement('a');
      link.href = `/api/shared/${this.token}/file`;
      link.download = this.meme.originalFilename || `meme_${this.token}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    toggleShareOptions() {
      this.showShareOptions = !this.showShareOptions;
      this.showCreateAccount = false;
      this.linkCopied = false;
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
    async createAccount() {
      this.isCreatingAccount = true;
      this.accountError = null;
      
      try {
        // Here you would implement your actual account creation logic
        // This is a placeholder for the actual API call
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        const response = await axios.post('/api/auth/register', this.newAccount);
        
        // Log in the user
        await axios.post('/api/auth/login', {
          username: this.newAccount.username,
          password: this.newAccount.password
        });
        
        // Save the meme to the user's account
        await axios.post('/api/memes/save-shared', {
          token: this.token
        });
        
        // Redirect to library with success message
        this.$router.push({
          path: '/library',
          query: { 
            saved: 'true',
            meme: this.meme.id
          }
        });
      } catch (error) {
        console.error('Error creating account:', error);
        this.accountError = error.response?.data?.message || 'Failed to create account. Please try again.';
      } finally {
        this.isCreatingAccount = false;
      }
    },
    closeAllPanels() {
      this.showCreateAccount = false;
      this.showShareOptions = false;
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
.shared-meme {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  flex: 1;
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
  flex: 1;
}

.error-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: var(--error-color);
}

.error-title {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.error-message {
  color: var(--secondary-text);
  margin-bottom: 2rem;
  max-width: 500px;
  line-height: 1.5;
}

.btn-back-to-home {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-back-to-home:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.meme-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.header-bar {
  background-color: var(--bg-white);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
  gap: 1rem;
}

.app-branding {
  display: flex;
  align-items: center;
}

.logo-link {
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.2rem;
}

.divider {
  margin: 0 0.75rem;
  color: var(--border-color);
}

.shared-label {
  font-size: 0.9rem;
  color: var(--secondary-text);
  font-weight: 500;
}

.share-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-share, .btn-download, .btn-save {
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

.btn-share:hover, .btn-download:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.btn-save {
  background-color: var(--primary-color);
  color: white;
}

.btn-save:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.25);
}

.action-icon {
  font-size: 1.1rem;
  margin-right: 0.5rem;
}

.meme-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  transition: all 0.3s ease;
}

.meme-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.9);
  padding: 0;
}

.meme-card {
  background-color: var(--bg-white);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  position: relative;
}

.meme-container.fullscreen .meme-card {
  background-color: transparent;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: none;
  height: 100%;
}

.meme-title {
  font-size: 1.75rem;
  padding: 1.5rem;
  margin: 0;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

.meme-container.fullscreen .meme-title {
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  border-bottom: none;
}

.image-container {
  position: relative;
  text-align: center;
  padding: 1rem;
  cursor: pointer;
}

.meme-container.fullscreen .image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
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

.image-container:hover .fullscreen-hint {
  opacity: 1;
}

.fullscreen-icon {
  margin-right: 0.5rem;
}

.meme-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 4px;
  transition: all 0.3s ease;
  opacity: 0;
}

.meme-image.loaded {
  opacity: 1;
}

.meme-container.fullscreen .meme-image {
  max-height: 80vh;
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
  z-index: 10;
}

.close-fullscreen:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.meme-description {
  padding: 0 1.5rem;
  color: var(--text-color);
  line-height: 1.6;
}

.meme-container.fullscreen .meme-description {
  display: none;
}

.meme-metadata {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.meme-container.fullscreen .meme-metadata {
  display: none;
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

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  padding: 0.25rem 0.75rem;
  background-color: var(--bg-light);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--text-color);
}

.cta-panel {
  background-color: var(--primary-light);
  padding: 2rem;
  text-align: center;
}

.cta-text {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--primary-dark);
}

.btn-cta {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cta:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Panels */
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
}

.create-account-panel,
.share-options-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 450px;
  background-color: var(--bg-white);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--secondary-text);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: var(--bg-light);
  color: var(--text-color);
}

.panel-content {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.panel-description {
  margin-bottom: 1.5rem;
  color: var(--secondary-text);
  line-height: 1.5;
}

/* Account Form Styles */
.account-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

.btn-cancel:hover:not(:disabled) {
  background-color: #e9ecef;
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  min-width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.account-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  font-size: 0.9rem;
}

.login-option {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.login-option p {
  margin-bottom: 0.5rem;
  color: var(--secondary-text);
}

.login-link {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

/* Share Options Styles */
.share-link-container {
  margin-bottom: 2rem;
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
  transition: background-color 0.2s ease;
}

.btn-copy:hover {
  background-color: var(--primary-dark);
}

.section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.qr-code-container {
  margin-bottom: 2rem;
}

.qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-image {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem;
  background-color: white;
  margin-bottom: 1rem;
}

.download-qr {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.download-qr:hover {
  background-color: var(--primary-light);
}

.social-share {
  margin-top: 2rem;
}

.social-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-social:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.social-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
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

.whatsapp {
  background-color: #25D366;
}

/* Panel transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-bar {
    padding: 1rem;
  }
  
  .action-text {
    display: none;
  }
  
  .action-icon {
    margin-right: 0;
    font-size: 1.2rem;
  }
  
  .btn-share, .btn-download, .btn-save {
    padding: 0.6rem;
  }
  
  .create-account-panel,
  .share-options-panel {
    max-width: 100%;
  }
  
  .social-buttons {
    grid-template-columns: 1fr;
  }
  
  .cta-panel {
    padding: 1.5rem 1rem;
  }
  
  .cta-text {
    font-size: 1rem;
  }
}

/* No scroll for body when fullscreen */
:global(body.no-scroll) {
  overflow: hidden;
}
</style> 