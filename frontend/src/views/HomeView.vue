<template>
  <div class="home">
    <h2>Welcome to Meme Stash</h2>
    <div class="status-container">
      <div class="status-card">
        <h3>Backend Connection Status</h3>
        <div v-if="isLoading" class="loading">
          Connecting to backend...
        </div>
        <div v-else-if="error" class="error">
          Error: {{ error }}
        </div>
        <div v-else-if="message" class="success">
          {{ message }}
        </div>
        <button @click="testBackendConnection" class="test-button">
          Test Backend Connection
        </button>
      </div>
    </div>
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
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.status-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.status-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading {
  color: #6c757d;
  margin: 20px 0;
}

.error {
  color: #dc3545;
  margin: 20px 0;
}

.success {
  color: #28a745;
  margin: 20px 0;
}

.test-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.test-button:hover {
  background-color: #3aa876;
}
</style>