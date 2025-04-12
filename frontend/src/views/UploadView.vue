<template>
  <div class="upload">
    <h2 class="page-title">Upload Meme</h2>
    
    <div class="upload-container">
      <form @submit.prevent="uploadMeme" class="upload-form">
        <!-- Title -->
        <div class="form-group">
          <label for="title">Title</label>
          <input 
            type="text" 
            id="title" 
            v-model="form.title" 
            class="form-control" 
            :class="{ 'is-invalid': validation.title }"
            required
          >
          <div v-if="validation.title" class="validation-error">{{ validation.title }}</div>
        </div>
        
        <!-- Description -->
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            v-model="form.description" 
            class="form-control"
            rows="3"
          ></textarea>
        </div>
        
        <!-- File Upload -->
        <div class="form-group">
          <label for="memeFile">Meme File</label>
          <div 
            class="drag-drop-area" 
            :class="{ 
              'drag-active': isDragging, 
              'is-invalid': validation.file,
              'has-file': filePreview
            }"
            @dragover.prevent="() => isDragging = true" 
            @dragleave.prevent="() => isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="$refs.fileInput.click()"
          >
            <div v-if="!filePreview" class="upload-placeholder">
              <div class="icon">📁</div>
              <p>Drag and drop a meme image here, or click to select</p>
              <p class="hint">Supported formats: JPG, PNG, GIF, WEBP</p>
            </div>
            <div v-else class="preview-container">
              <img :src="filePreview" alt="Preview" class="file-preview">
              <button type="button" class="btn-remove-preview" @click.stop="removeFile">
                &times;
              </button>
            </div>
            <input 
              type="file" 
              id="memeFile" 
              ref="fileInput"
              @change="handleFileChange" 
              class="file-input" 
              accept="image/*"
              hidden
              required
            >
          </div>
          <div v-if="validation.file" class="validation-error">{{ validation.file }}</div>
        </div>
        
        <!-- Tags -->
        <div class="form-group">
          <label for="tags">Tags (comma separated)</label>
          <div class="tags-input-wrapper">
            <input 
              type="text" 
              id="tags" 
              v-model="form.tags" 
              class="form-control" 
              placeholder="funny, cat, reaction"
            >
            <div class="tags-hint">Add tags to help organize and find your memes later</div>
          </div>
        </div>
        
        <!-- Submit Button -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="$router.push('/library')">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="isUploading">
            <span v-if="isUploading">
              <span class="upload-spinner"></span>
              Uploading...
            </span>
            <span v-else>Upload Meme</span>
          </button>
        </div>
        
        <!-- Upload Progress -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: `${uploadProgress}%`}"></div>
          </div>
          <div class="progress-text">{{ uploadProgress }}% Uploaded</div>
        </div>
        
        <!-- Success/Error Message -->
        <transition name="fade">
          <div v-if="message" :class="['message', messageType]">
            <div class="message-icon">
              <span v-if="messageType === 'success'">✅</span>
              <span v-else>❌</span>
            </div>
            <div class="message-text">
              {{ message }}
            </div>
          </div>
        </transition>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UploadView',
  data() {
    return {
      form: {
        title: '',
        description: '',
        tags: '',
        file: null
      },
      validation: {
        title: '',
        file: ''
      },
      filePreview: null,
      isUploading: false,
      uploadProgress: 0,
      message: '',
      messageType: 'success',
      isDragging: false
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.validateAndSetFile(file);
      }
    },
    handleFileDrop(event) {
      this.isDragging = false;
      const file = event.dataTransfer.files[0];
      if (file) {
        this.validateAndSetFile(file);
      }
    },
    validateAndSetFile(file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        this.validation.file = 'Please select an image file (JPG, PNG, GIF, WEBP)';
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.validation.file = 'File size should be less than 10MB';
        return;
      }
      
      this.validation.file = '';
      this.form.file = file;
      this.createFilePreview();
    },
    createFilePreview() {
      if (!this.form.file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(this.form.file);
    },
    removeFile(event) {
      event.stopPropagation();
      this.form.file = null;
      this.filePreview = null;
      this.$refs.fileInput.value = '';
    },
    resetForm() {
      this.form = {
        title: '',
        description: '',
        tags: '',
        file: null
      };
      this.filePreview = null;
      this.validation = {
        title: '',
        file: ''
      };
      this.$refs.fileInput.value = '';
    },
    validateForm() {
      let isValid = true;
      this.validation = {
        title: '',
        file: ''
      };
      
      if (!this.form.title.trim()) {
        this.validation.title = 'Please enter a title for your meme';
        isValid = false;
      }
      
      if (!this.form.file) {
        this.validation.file = 'Please select an image file';
        isValid = false;
      }
      
      return isValid;
    },
    async uploadMeme() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isUploading = true;
      this.uploadProgress = 0;
      this.message = '';
      
      const formData = new FormData();
      formData.append('title', this.form.title);
      formData.append('description', this.form.description);
      formData.append('tags', this.form.tags);
      formData.append('file', this.form.file);
      
      try {
        await axios.post('/api/memes', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          }
        });
        
        this.message = 'Meme uploaded successfully!';
        this.messageType = 'success';
        this.resetForm();
        
        // Redirect to library after short delay
        setTimeout(() => {
          this.$router.push('/library');
        }, 1500);
      } catch (error) {
        console.error('Upload error:', error);
        this.message = error.response?.data?.message || 'Error uploading meme';
        this.messageType = 'error';
      } finally {
        this.isUploading = false;
      }
    }
  }
}
</script>

<style scoped>
.upload {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

.upload-container {
  width: 100%;
}

.upload-form {
  background-color: var(--bg-white);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: var(--card-shadow);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.form-control.is-invalid {
  border-color: var(--error-color);
}

.validation-error {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.drag-drop-area {
  border: 2px dashed var(--border-color);
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background-color: var(--bg-light);
}

.drag-drop-area:hover {
  border-color: var(--primary-color);
  background-color: rgba(66, 185, 131, 0.05);
}

.drag-drop-area.drag-active {
  border-color: var(--primary-color);
  background-color: rgba(66, 185, 131, 0.1);
  transform: scale(1.02);
}

.drag-drop-area.is-invalid {
  border-color: var(--error-color);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--secondary-text);
}

.hint {
  font-size: 0.875rem;
  color: var(--secondary-text);
  margin-top: 0.5rem;
}

.preview-container {
  position: relative;
  max-width: 100%;
  max-height: 250px;
  overflow: hidden;
  margin: 0 auto;
}

.file-preview {
  max-width: 100%;
  max-height: 250px;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-remove-preview {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-remove-preview:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.tags-input-wrapper {
  position: relative;
}

.tags-hint {
  font-size: 0.875rem;
  color: var(--secondary-text);
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  background-color: #84c7a6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--bg-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.upload-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-progress {
  margin-top: 1.5rem;
}

.progress-bar {
  height: 8px;
  background-color: var(--bg-light);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--secondary-text);
}

.message {
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success {
  background-color: #d4edda;
  color: #155724;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

.message-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .upload-form {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style> 