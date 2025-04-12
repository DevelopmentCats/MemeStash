import axios from 'axios';

// Create axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If not already on login page, redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Network status tracking
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
});

window.addEventListener('offline', () => {
  isOnline = false;
});

// API service with methods for common operations
export const ApiService = {
  // Check if we're online
  isOnline: () => isOnline,
  
  // GET request
  get(resource, params) {
    return apiClient.get(resource, { params });
  },
  
  // POST request
  post(resource, data) {
    return apiClient.post(resource, data);
  },
  
  // PUT request
  put(resource, data) {
    return apiClient.put(resource, data);
  },
  
  // DELETE request
  delete(resource) {
    return apiClient.delete(resource);
  },
  
  // Custom request
  customRequest(config) {
    return apiClient(config);
  },
  
  // File upload with progress tracking
  upload(resource, file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(resource, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  
  // Multi-part form data with additional fields and progress tracking
  uploadWithData(resource, file, data, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add other form data
    Object.keys(data).forEach(key => {
      // Handle arrays for categories and tags
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, data[key]);
      }
    });
    
    return apiClient.post(resource, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  }
};

export default ApiService;