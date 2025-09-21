// Mo'edim Authentication Service
// Handles user authentication, registration, and profile management

import { apiService } from './api';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse
} from '../types';

class AuthService {
  private currentUser: User | null = null;

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);

      if (response.success && response.data) {
        this.currentUser = response.data.user;
        apiService.setAuthToken(response.data.token);

        // Store token securely (you might want to use AsyncStorage)
        // await AsyncStorage.setItem('authToken', response.data.token);

        return response.data;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', userData);

      if (response.success && response.data) {
        this.currentUser = response.data.user;
        apiService.setAuthToken(response.data.token);

        return response.data;
      }

      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Clear local state
      this.currentUser = null;
      apiService.setAuthToken(null);

      // Clear stored token
      // await AsyncStorage.removeItem('authToken');

      // Optional: Call logout endpoint
      await apiService.post('/auth/logout', {}, true);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await apiService.get<User>('/auth/profile', true);

      if (response.success && response.data) {
        this.currentUser = response.data;
        return response.data;
      }

      throw new Error(response.message || 'Failed to get profile');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>('/auth/profile', updates, true);

      if (response.success && response.data) {
        this.currentUser = response.data;
        return response.data;
      }

      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword
      }, true);

      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });

      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        password: newPassword
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/verify-email', { token });

      if (!response.success) {
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Resend verification email
  async resendVerification(): Promise<void> {
    try {
      const response = await apiService.post('/auth/resend-verification', {}, true);

      if (!response.success) {
        throw new Error(response.message || 'Failed to resend verification');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  // Check authentication status
  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = apiService.getAuthToken();
      if (!token) return false;

      const response = await apiService.get('/auth/verify', true);
      return response.success;
    } catch (error) {
      console.error('Auth status check error:', error);
      return false;
    }
  }

  // Get current user (local state)
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && apiService.getAuthToken() !== null;
  }

  // Initialize auth state (call on app start)
  async initializeAuth(): Promise<User | null> {
    try {
      // Try to get stored token
      // const token = await AsyncStorage.getItem('authToken');

      // For now, just check if we have a token in memory
      const token = apiService.getAuthToken();

      if (token) {
        apiService.setAuthToken(token);
        const user = await this.getProfile();
        return user;
      }

      return null;
    } catch (error) {
      console.error('Initialize auth error:', error);
      // Clear invalid token
      await this.logout();
      return null;
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export for convenience
export { AuthService };