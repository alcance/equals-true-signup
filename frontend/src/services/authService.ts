import { api } from './api';
import { 
  LoginRequest, 
  SignupRequest, 
  AuthResponse, 
  VerifyResponse 
} from '@/types/auth';
import { ApiResponse } from '@/types/api';

class AuthService {
  private baseURL = '/auth';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<{
        token: string;
        user: {
          id: string;
          fullName: string;
          email: string;
        };
      }>>(`${this.baseURL}/login`, credentials);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      // Ensure data exists before returning
      if (!response.data.data) {
        throw new Error('Invalid response from server');
      }

      return {
        success: true,
        message: response.data.message || 'Login successful', // ✅ Added fallback
        data: response.data.data,
      };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Login failed');
    }
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<{
        token: string;
        user: {
          id: string;
          fullName: string;
          email: string;
        };
      }>>(`${this.baseURL}/signup`, userData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }

      // Ensure data exists before returning
      if (!response.data.data) {
        throw new Error('Invalid response from server');
      }

      return {
        success: true,
        message: response.data.message || 'Signup successful', // ✅ Added fallback
        data: response.data.data,
      };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Signup failed');
    }
  }

  // Note: verifyToken returns VerifyResponse (no token, just user)
  async verifyToken(): Promise<VerifyResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get<ApiResponse<{
        user: {
          id: string;
          fullName: string;
          email: string;
        };
      }>>(`${this.baseURL}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Token verification failed');
      }

      // Ensure data exists before returning
      if (!response.data.data) {
        throw new Error('Invalid response from server');
      }

      return {
        success: true,
        message: response.data.message || 'Token verified successfully', // ✅ Added fallback
        data: {
          user: response.data.data.user,
        },
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token');
        throw new Error('Session expired. Please login again.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Token verification failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // If you have a logout endpoint, call it here
      // await api.post(`${this.baseURL}/logout`);
      
      // Clear token from localStorage
      localStorage.removeItem('auth_token');
    } catch (error) {
      // Even if logout endpoint fails, clear local token
      localStorage.removeItem('auth_token');
      throw error;
    }
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // Helper method to get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Helper method to clear authentication
  clearAuth(): void {
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService();
