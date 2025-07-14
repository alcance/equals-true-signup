import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/providers/ThemeProviders';

function AppContent() {
  const { user, loading } = useAuth();

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

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes>
          {user ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/login" element={
                <AuthLayout>
                  <LoginForm />
                </AuthLayout>
              } />
              <Route path="/signup" element={
                <AuthLayout>
                  <SignupForm />
                </AuthLayout>
              } />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </AnimatePresence>

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="auth-ui-theme">
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;