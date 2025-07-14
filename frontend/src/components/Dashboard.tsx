import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { useAuth } from '@/hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('🚪 Dashboard: Logout button clicked');
      setIsLoggingOut(true);
      
      // Method 1: Use useAuth logout
      await logout();
      console.log('✅ Dashboard: useAuth logout completed');
      
    } catch (error) {
      console.error('❌ Dashboard: Logout failed, forcing logout:', error);
      
      // Method 2: Force logout if useAuth fails
      localStorage.removeItem('auth_token');
      
      // Method 3: Force page refresh to reset state
      window.location.href = '/login';
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Method 4: Emergency logout function
  const forceLogout = () => {
    console.log('🔧 Dashboard: Force logout initiated');
    localStorage.clear(); // Clear all localStorage
    sessionStorage.clear(); // Clear all sessionStorage
    window.location.href = '/login'; // Force redirect
  };

  const isLoadingState = loading || isLoggingOut;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700 relative overflow-hidden">
      
      {/* Simple background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-red-400/20 rounded-full"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-32 left-32 w-24 h-24 bg-yellow-400/30 rounded-full"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="text-4xl font-black text-white tracking-wider">
                =TRUE
              </div>
            </motion.div>
            
            <p className="text-white/90 text-lg font-medium">
              Welcome back!
            </p>
          </div>

          {/* User Card */}
          <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-0 shadow-2xl mb-6">
            <CardContent className="p-8">
              
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-red-600 text-white text-lg font-semibold">
                    {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user?.fullName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account Type</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Premium</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Today</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  disabled={isLoadingState}
                >
                  Explore Features
                </Button>
                
                {/* Main Logout Button */}
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  disabled={isLoadingState}
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-red-600 hover:text-red-600 font-semibold"
                >
                  {isLoadingState ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Signing out...
                    </div>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </>
                  )}
                </Button>

                {/* Emergency Logout Button (only show if main logout doesn't work) */}
                <Button 
                  variant="ghost" 
                  onClick={forceLogout}
                  className="w-full h-8 text-xs text-gray-500 hover:text-red-600"
                  disabled={isLoadingState}
                >
                  Force Logout (if above doesn't work)
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Simple Footer */}
          <div className="text-center">
            <p className="text-white/70 text-sm">
              Remote First, Inclusive Always.
            </p>
          </div>

          {/* Debug Info (remove in production) */}
          <div className="text-center mt-4 text-white/50 text-xs">
            User ID: {user?.id?.substring(0, 8)}...
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
