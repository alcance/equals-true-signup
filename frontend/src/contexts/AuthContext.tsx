import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { authService } from '@/services/authService';
import { LoginRequest, SignupRequest, AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // CRITICAL: Use ref to ensure initialization happens only once globally
  const hasInitialized = useRef(false);
  const isInitializing = useRef(false);

  // Initialize auth ONLY ONCE when provider mounts
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // Prevent multiple initialization calls
      if (hasInitialized.current || isInitializing.current) {
        console.log('🔄 AuthProvider: Already initialized or initializing, skipping');
        return;
      }

      isInitializing.current = true;
      console.log('🔄 AuthProvider: SINGLE initialization starting...');
      
      try {
        const token = localStorage.getItem('auth_token');
        console.log('📱 AuthProvider: Token check:', token ? 'Found' : 'Not found');
        
        if (!token) {
          console.log('❌ AuthProvider: No token, setting loading to false');
          if (isMounted) {
            setState(prev => ({ ...prev, loading: false }));
            hasInitialized.current = true;
          }
          return;
        }

        console.log('🔍 AuthProvider: Verifying token (SINGLE REQUEST)...');
        const response = await authService.verifyToken();
        console.log('✅ AuthProvider: Token verified successfully:', response.data.user);
        
        if (isMounted) {
          setState({
            user: response.data.user,
            loading: false,
            error: null,
          });
          hasInitialized.current = true;
        }
        
      } catch (error: any) {
        console.log('❌ AuthProvider: Token verification failed:', error);
        localStorage.removeItem('auth_token');
        
        if (isMounted) {
          setState({
            user: null,
            loading: false,
            error: null,
          });
          hasInitialized.current = true;
        }
      } finally {
        isInitializing.current = false;
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // EMPTY DEPENDENCY ARRAY - CRITICAL!

  const login = async (credentials: LoginRequest): Promise<void> => {
    console.log('🔐 AuthProvider: Login attempt for:', credentials.email);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authService.login(credentials);
      console.log('✅ AuthProvider: Login successful');
      
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      setState({
        user: response.data?.user || null,
        loading: false,
        error: null,
      });
      
    } catch (error: any) {
      console.log('❌ AuthProvider: Login failed:', error.message);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  };

  const signup = async (userData: SignupRequest): Promise<void> => {
    console.log('📝 AuthProvider: Signup attempt for:', userData.email);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authService.signup(userData);
      console.log('✅ AuthProvider: Signup successful');
      
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      setState({
        user: response.data?.user || null,
        loading: false,
        error: null,
      });
      
    } catch (error: any) {
      console.log('❌ AuthProvider: Signup failed:', error.message);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Signup failed',
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 AuthProvider: Logout initiated');
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await authService.logout();
      console.log('✅ AuthProvider: Logout completed');
      
      // Reset initialization flags
      hasInitialized.current = false;
      isInitializing.current = false;
      
      setState({
        user: null,
        loading: false,
        error: null,
      });
      
    } catch (error: any) {
      console.log('⚠️ AuthProvider: Logout error, forcing logout:', error.message);
      
      localStorage.removeItem('auth_token');
      hasInitialized.current = false;
      isInitializing.current = false;
      
      setState({
        user: null,
        loading: false,
        error: null,
      });
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  console.log('🔍 AuthProvider: Current state', { 
    hasUser: !!state.user,
    userEmail: state.user?.email || 'None',
    loading: state.loading,
    hasInitialized: hasInitialized.current,
    isInitializing: isInitializing.current
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
