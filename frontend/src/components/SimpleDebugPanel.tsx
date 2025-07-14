// Simple debug panel that uses fetch directly to test API connection
import React, { useEffect, useState } from 'react';

const SimpleDebugPanel: React.FC = () => {
  const [apiHealth, setApiHealth] = useState<string>('checking...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Check environment variables
    const vars = {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    };
    setEnvVars(vars);

    // Check API health using direct fetch
    const checkAPI = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      console.log('🔍 Debug: Testing API connection to:', apiUrl);
      
      try {
        const response = await fetch(`${apiUrl}/health`);
        const data = await response.json();
        console.log('🔍 Debug: API response:', { status: response.status, data });
        setApiHealth(`✅ API healthy: ${response.status} - ${data.status || 'OK'}`);
      } catch (error: any) {
        console.error('🔍 Debug: API error:', error);
        setApiHealth(`❌ API error: ${error.message}`);
        
        // Try alternative URL
        try {
          const altResponse = await fetch('http://localhost:3001/api/health');
          const altData = await altResponse.json();
          setApiHealth(`✅ API healthy (alt): ${altResponse.status} - ${altData.status || 'OK'}`);
        } catch (altError: any) {
          setApiHealth(`❌ API completely down: ${altError.message}`);
        }
      }
    };

    checkAPI();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2 text-yellow-300">🔧 Debug Panel</h3>
      
      <div className="mb-3">
        <strong className="text-green-300">API Status:</strong>
        <div className="text-sm">{apiHealth}</div>
      </div>

      <div className="mb-3">
        <strong className="text-blue-300">Environment:</strong>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="text-xs">
            <span className="text-yellow-300">{key}:</span> {String(value) || 'undefined'}
          </div>
        ))}
      </div>

      <div className="mb-3">
        <strong className="text-purple-300">Current:</strong>
        <div className="text-xs">URL: {window.location.href}</div>
        <div className="text-xs">Path: {window.location.pathname}</div>
      </div>

      <div className="mb-3">
        <strong className="text-orange-300">Auth:</strong>
        <div className="text-xs">
          Token: {localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing'}
        </div>
        {localStorage.getItem('auth_token') && (
          <div className="text-xs">
            Token Preview: {localStorage.getItem('auth_token')?.substring(0, 20)}...
          </div>
        )}
      </div>

      <div>
        <strong className="text-red-300">Backend Tests:</strong>
        <div className="text-xs">Expected: http://localhost:3001/api/health</div>
        <div className="text-xs">Using: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/health</div>
      </div>
    </div>
  );
};

export default SimpleDebugPanel;