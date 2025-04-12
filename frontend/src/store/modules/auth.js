import { defineStore } from 'pinia';
import AuthService from '@/services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: AuthService.getCurrentUser(),
    isAuthenticated: AuthService.isAuthenticated(),
    isLoading: false,
    error: null
  }),
  
  getters: {
    currentUser: (state) => state.user,
    userIsAuthenticated: (state) => state.isAuthenticated,
    authError: (state) => state.error
  },
  
  actions: {
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await AuthService.login(credentials);
        this.user = response.user;
        this.isAuthenticated = true;
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async register(userData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await AuthService.register(userData);
        this.user = response.user;
        this.isAuthenticated = true;
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getProfile() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await AuthService.getProfile();
        this.user = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to get profile';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    logout() {
      AuthService.logout();
      this.user = null;
      this.isAuthenticated = false;
    },
    
    clearError() {
      this.error = null;
    }
  }
});