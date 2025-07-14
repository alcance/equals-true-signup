import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '@/utils/constants';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('auth_token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Generic API methods
class ApiService {
  // GET request
  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return api.get<T>(url, config);
  }

  // POST request
  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return api.post<T>(url, data, config);
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return api.put<T>(url, data, config);
  }

  // PATCH request
  async patch<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return api.patch<T>(url, data, config);
  }

  // DELETE request
  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return api.delete<T>(url, config);
  }

  // Upload file
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Set auth token manually (useful for testing)
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Clear auth token
  clearAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

// Export both the axios instance and the service class
export { api };
export const apiService = new ApiService();
