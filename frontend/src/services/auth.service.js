import ApiService from './api.service';

export const AuthService = {
  /**
   * Login user and store authentication token
   * @param {Object} credentials - User credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise} - Promise with user data
   */
  login(credentials) {
    return ApiService.post('/auth/login', credentials)
      .then(response => {
        // Store token and user data in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      });
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @returns {Promise} - Promise with user data
   */
  register(userData) {
    return ApiService.post('/auth/register', userData)
      .then(response => {
        // Store token and user data in localStorage if registration includes login
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      });
  },

  /**
   * Logout user and clear stored data
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user profile
   * @returns {Promise} - Promise with user profile data
   */
  getProfile() {
    return ApiService.get('/auth/profile');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current user data from localStorage
   * @returns {Object|null} - User data or null if not authenticated
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Get authentication token
   * @returns {string|null} - Token or null if not authenticated
   */
  getToken() {
    return localStorage.getItem('token');
  }
};

export default AuthService;