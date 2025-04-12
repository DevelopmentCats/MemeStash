<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to Meme Stash</h1>
        <p class="hero-subtitle">Your personal meme library for organizing, storing, and sharing memes</p>
        <div class="hero-cta">
          <router-link to="/upload" class="btn-primary">Upload Your First Meme</router-link>
          <router-link to="/library" class="btn-secondary">Browse Library</router-link>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features">
      <h2 class="section-title">Discover What You Can Do</h2>
      
      <div class="feature-grid">
        <div class="feature-card" @click="navigateTo('/library')">
          <div class="feature-icon">🖼️</div>
          <h3>Browse Memes</h3>
          <p>View your collection of memes with filtering and sorting options</p>
        </div>
        
        <div class="feature-card" @click="navigateTo('/upload')">
          <div class="feature-icon">⬆️</div>
          <h3>Upload Meme</h3>
          <p>Add new memes to your collection with tags and descriptions</p>
        </div>
        
        <div class="feature-card" @click="navigateTo('/tags')">
          <div class="feature-icon">🏷️</div>
          <h3>Manage Tags</h3>
          <p>Organize memes with custom tags for easy discovery</p>
        </div>
        
        <div class="feature-card" @click="navigateTo('/categories')">
          <div class="feature-icon">📁</div>
          <h3>Categories</h3>
          <p>Group memes into categories for better organization</p>
        </div>
      </div>
    </section>
    
    <!-- Status Section -->
    <section class="status-section">
      <div class="status-card">
        <h3>Backend Connection Status</h3>
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Connecting to backend...</p>
        </div>
        <div v-else-if="error" class="error">
          <p>Error: {{ error }}</p>
        </div>
        <div v-else-if="message" class="success">
          <p>{{ message }}</p>
        </div>
        <button @click="testBackendConnection" class="btn-test">
          Test Backend Connection
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomeView',
  data() {
    return {
      message: '',
      error: '',
      isLoading: false
    }
  },
  mounted() {
    // Auto-test connection when component mounts
    this.testBackendConnection();
  },
  methods: {
    async testBackendConnection() {
      this.isLoading = true;
      this.error = '';
      this.message = '';
      
      try {
        const response = await axios.get('/api/hello');
        this.message = response.data.message;
      } catch (err) {
        this.error = err.message || 'Failed to connect to backend';
      } finally {
        this.isLoading = false;
      }
    },
    navigateTo(route) {
      this.$router.push(route);
    }
  }
}
</script>

<style scoped>
.home {
  padding: 0;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--primary-light), #e9f7f2);
  border-radius: 8px;
  padding: 3rem 1.5rem;
  margin-bottom: 3rem;
  text-align: center;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--text-color);
  line-height: 1.5;
}

.hero-cta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.2s ease;
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
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
  background-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Features Section */
.features {
  margin-bottom: 3rem;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background-color: var(--bg-white);
  border-radius: 8px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--hover-shadow);
  border-color: var(--primary-light);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.feature-card p {
  color: var(--secondary-text);
  margin: 0;
  line-height: 1.5;
}

/* Status Section */
.status-section {
  display: flex;
  justify-content: center;
}

.status-card {
  background-color: var(--bg-white);
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: var(--card-shadow);
  text-align: center;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(66, 185, 131, 0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: var(--error-color);
  margin: 1.5rem 0;
}

.success {
  color: var(--success-color);
  margin: 1.5rem 0;
}

.btn-test {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-test:hover {
  background-color: var(--primary-dark);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .feature-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-cta {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style>