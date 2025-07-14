import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { LoginRequest, SignupRequest, AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthHook extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

export const useAuth = (): AuthHook => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 useAuth: Initializing auth...');
      try {
        const token = localStorage.getItem('auth_token');
        console.log('📱 useAuth: Token from localStorage:', token ? 'Found' : 'Not found');
        
        if (!token) {
          console.log('❌ useAuth: No token found, setting loading to false');
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        console.log('🔍 useAuth: Verifying token...');
        // Verify token and get user info
        const response = await authService.verifyToken();
        console.log('✅ useAuth: Token verification successful:', response.data.user);
        
        setState({
          user: response.data.user,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.log('❌ useAuth: Token verification failed:', error);
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    console.log('🔐 useAuth: Login attempt for:', credentials.email);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authService.login(credentials);
      console.log('✅ useAuth: Login successful:', response);
      
      // Store token
      if (response.data?.token) {
        console.log('💾 useAuth: Storing token in localStorage');
        localStorage.setItem('auth_token', response.data.token);
      }
      
      console.log('👤 useAuth: Setting user state:', response.data?.user);
      setState({
        user: response.data?.user || null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.log('❌ useAuth: Login failed:', error.message);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (userData: SignupRequest): Promise<void> => {
    console.log('📝 useAuth: Signup attempt for:', userData.email);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authService.signup(userData);
      console.log('✅ useAuth: Signup successful:', response);
      
      // Store token
      if (response.data?.token) {
        console.log('💾 useAuth: Storing token in localStorage');
        localStorage.setItem('auth_token', response.data.token);
      }
      
      console.log('👤 useAuth: Setting user state:', response.data?.user);
      setState({
        user: response.data?.user || null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.log('❌ useAuth: Signup failed:', error.message);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Signup failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    console.log('🚪 useAuth: Logout initiated');
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Always call authService logout (which clears token)
      await authService.logout();
      console.log('✅ useAuth: AuthService logout completed');
      
      // Immediately clear user state (this triggers App.tsx redirect)
      console.log('🧹 useAuth: Clearing user state');
      setState({
        user: null,
        loading: false,
        error: null,
      });
      
      console.log('✅ useAuth: Logout completed successfully');
      
    } catch (error: any) {
      console.log('⚠️ useAuth: Logout error, but forcing logout anyway:', error.message);
      
      // Force logout even if there's an error
      localStorage.removeItem('auth_token');
      setState({
        user: null,
        loading: false,
        error: null, // Don't show error for logout
      });
      
      console.log('🔧 useAuth: Forced logout completed');
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshAuth = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setState(prev => ({ ...prev, user: null, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await authService.verifyToken();
      setState({
        user: response.data.user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      localStorage.removeItem('auth_token');
      setState({
        user: null,
        loading: false,
        error: error.message || 'Token validation failed',
      });
    }
  }, []);

  // Debug log current state
  console.log('🔍 useAuth: Current auth state:', { 
    user: state.user?.email || 'No user', 
    loading: state.loading, 
    error: state.error 
  });

  return {
    ...state,
    login,
    signup,
    logout,
    clearError,
    refreshAuth,
  };
};
