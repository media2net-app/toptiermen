'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface AuthDebugPanelProps {
  isVisible?: boolean;
}

export default function AuthDebugPanel({ isVisible = false }: AuthDebugPanelProps) {
  const { user, loading, error } = useSupabaseAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        localStorage: {
          hasAuthKey: !!localStorage.getItem('toptiermen-auth'),
          authKeyLength: localStorage.getItem('toptiermen-auth')?.length || 0,
        },
        sessionStorage: {
          hasData: Object.keys(sessionStorage).length > 0,
          keys: Object.keys(sessionStorage),
        },
        cookies: {
          hasData: document.cookie.length > 0,
          length: document.cookie.length,
        },
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          hasFullName: !!user.full_name,
        } : null,
        loading,
        error,
        pathname: window.location.pathname,
        search: window.location.search,
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000);

    return () => clearInterval(interval);
  }, [user, loading, error]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-red-500 text-white p-2 rounded-lg shadow-lg text-xs font-mono"
      >
        🔧 Debug
      </button>
      
      {isExpanded && (
        <div className="absolute bottom-12 right-0 bg-black text-green-400 p-4 rounded-lg shadow-lg max-w-md text-xs font-mono">
          <div className="mb-2">
            <strong>Auth Debug Info:</strong>
          </div>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="block w-full bg-red-600 text-white p-2 rounded text-xs"
            >
              Clear Storage & Reload
            </button>
            
            <button
              onClick={() => {
                console.log('Debug Info:', debugInfo);
              }}
              className="block w-full bg-blue-600 text-white p-2 rounded text-xs"
            >
              Log to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
