import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import Dashboard from '@/components/Dashboard';
import { ThemeProvider } from '@/providers/ThemeProviders';

// Component that uses auth context (must be inside AuthProvider)
function AppRoutes() {
  const { user, loading } = useAuth();

  console.log('🏁 AppRoutes: Render state:', { 
    user: user?.email || 'No user', 
    loading
  });

  // Show loading screen while checking auth
  if (loading) {
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

  console.log('🎯 AppRoutes: Routing with user:', !!user);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes>
          {/* Dashboard route - protected */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          
          {/* Auth routes - redirect if already logged in */}
          <Route 
            path="/login" 
            element={!user ? (
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            ) : <Navigate to="/dashboard" replace />} 
          />
          
          <Route 
            path="/signup" 
            element={!user ? (
              <AuthLayout>
                <SignupForm />
              </AuthLayout>
            ) : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
          />
          
          {/* Catch all - redirect based on auth status */}
          <Route 
            path="*" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </AnimatePresence>

      <Toaster />
    </div>
  );
}

// Main App component with correct provider order
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="auth-ui-theme">
      <Router>
        {/* AuthProvider INSIDE Router so it can use navigation hooks if needed */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
