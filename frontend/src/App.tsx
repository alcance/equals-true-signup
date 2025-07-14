import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/providers/ThemeProviders';

// Component to handle navigation based on auth state
const AuthNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🧭 AuthNavigator: Auth state changed:', {
      user: user?.email || 'null',
      loading,
      currentPath: window.location.pathname
    });

    if (!loading) {
      if (user && (window.location.pathname === '/login' || window.location.pathname === '/signup' || window.location.pathname === '/')) {
        console.log('🔄 AuthNavigator: User logged in, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else if (!user && window.location.pathname.startsWith('/dashboard')) {
        console.log('🔄 AuthNavigator: User logged out, redirecting to login');
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null;
};

function AppContent() {
  const { user, loading } = useAuth();

  // Debug: Log app state changes
  useEffect(() => {
    console.log('🎯 App: State changed:', {
      user: user ? `${user.fullName} (${user.email})` : 'null',
      loading,
      shouldShowDashboard: !!user && !loading,
      shouldShowAuth: !user && !loading,
      currentPath: window.location.pathname
    });
  }, [user, loading]);

  if (loading) {
    console.log('⏳ App: Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-red-700">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-4xl font-black text-white tracking-wider mb-2">=TRUE</div>
          <p className="text-white/80">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AuthNavigator />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Dashboard route - only accessible when authenticated */}
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <>
                  {console.log('✅ App: Rendering Dashboard for user:', user.email)}
                  <Dashboard />
                </>
              ) : (
                <>
                  {console.log('🔄 App: No user, redirecting to login from dashboard')}
                  <Navigate to="/login" replace />
                </>
              )
            } 
          />
          
          {/* Login route */}
          <Route 
            path="/login" 
            element={
              !user ? (
                <>
                  {console.log('📝 App: Rendering Login Form')}
                  <AuthLayout>
                    <LoginForm />
                  </AuthLayout>
                </>
              ) : (
                <>
                  {console.log('🔄 App: User exists, redirecting to dashboard from login')}
                  <Navigate to="/dashboard" replace />
                </>
              )
            } 
          />
          
          {/* Signup route */}
          <Route 
            path="/signup" 
            element={
              !user ? (
                <>
                  {console.log('📝 App: Rendering Signup Form')}
                  <AuthLayout>
                    <SignupForm />
                  </AuthLayout>
                </>
              ) : (
                <>
                  {console.log('🔄 App: User exists, redirecting to dashboard from signup')}
                  <Navigate to="/dashboard" replace />
                </>
              )
            } 
          />
          
          {/* Default route */}
          <Route 
            path="*" 
            element={
              user ? (
                <>
                  {console.log('🔄 App: Default route, user exists, redirecting to dashboard')}
                  <Navigate to="/dashboard" replace />
                </>
              ) : (
                <>
                  {console.log('🔄 App: Default route, no user, redirecting to login')}
                  <Navigate to="/login" replace />
                </>
              )
            } 
          />
        </Routes>
      </AnimatePresence>

      <Toaster />
    </div>
  );
}

function App() {
  console.log('🚀 App: App component mounting');
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="auth-ui-theme">
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;