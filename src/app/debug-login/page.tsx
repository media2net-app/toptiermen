'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';

export default function DebugLoginPage() {
  const { user, loading, error } = useSupabaseAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    collectDebugInfo();
  }, [user, loading, error]);

  const collectDebugInfo = async () => {
    setIsLoading(true);
    
    try {
      // Get session info
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Get local storage info
      const localStorageInfo: any = {};
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('toptiermen') || key.includes('supabase'))) {
            localStorageInfo[key] = localStorage.getItem(key);
          }
        }
      }

      // Get session storage info
      const sessionStorageInfo: any = {};
      if (typeof window !== 'undefined') {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('toptiermen') || key.includes('supabase'))) {
            sessionStorageInfo[key] = sessionStorage.getItem(key);
          }
        }
      }

      setDebugInfo({
        timestamp: new Date().toISOString(),
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        loading,
        error,
        session: session ? {
          user: session.user.email,
          expires_at: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'Unknown',
          access_token: session.access_token ? 'Present' : 'Missing'
        } : null,
        sessionError: sessionError?.message,
        localStorage: localStorageInfo,
        sessionStorage: sessionStorageInfo,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (error) {
      console.error('Debug info collection error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllStorage = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('toptiermen') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('toptiermen') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      });

      // Reload page
      window.location.reload();
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'chiel@media2net.nl',
        password: 'TopTierMen2025!'
      });

      if (error) {
        alert(`Login failed: ${error.message}`);
      } else {
        alert('Login successful!');
        window.location.reload();
      }
    } catch (error) {
      alert(`Login error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181F17] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#8BAE5A]">🔧 Login Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#232D1A] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={collectDebugInfo}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Refresh Debug Info'}
              </button>
              
              <button
                onClick={clearAllStorage}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Clear All Storage
              </button>
              
              <button
                onClick={testLogin}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Test Login
              </button>
            </div>
          </div>

          <div className="bg-[#232D1A] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">Quick Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Loading:</span>
                <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
                  {loading ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User:</span>
                <span className={user ? 'text-green-400' : 'text-red-400'}>
                  {user ? user.email : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Error:</span>
                <span className={error ? 'text-red-400' : 'text-green-400'}>
                  {error || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">Debug Information</h2>
          <pre className="bg-[#181F17] p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-8 bg-[#232D1A] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">Instructions</h2>
          <div className="space-y-2 text-sm">
            <p>1. <strong>Clear Browser Cache:</strong> Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)</p>
            <p>2. <strong>Clear Storage:</strong> Use the "Clear All Storage" button above</p>
            <p>3. <strong>Test Login:</strong> Use the "Test Login" button to verify credentials</p>
            <p>4. <strong>Check Debug Info:</strong> Review the debug information below</p>
            <p>5. <strong>Try Incognito:</strong> Open an incognito window and test login</p>
          </div>
        </div>
      </div>
    </div>
  );
}
