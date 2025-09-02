'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface LoginDebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
}

interface DebugInfo {
  timestamp: string;
  supabaseStatus: 'checking' | 'connected' | 'error';
  authState: string;
  networkStatus: string;
  localStorageStatus: string;
  sessionStorageStatus: string;
  cookiesStatus: string;
  userAgent: string;
  platform: string;
  errors: string[];
}

export default function LoginDebugger({ isVisible, onToggle }: LoginDebuggerProps) {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    timestamp: new Date().toISOString(),
    supabaseStatus: 'checking',
    authState: 'unknown',
    networkStatus: 'checking',
    localStorageStatus: 'unknown',
    sessionStorageStatus: 'unknown',
    cookiesStatus: 'unknown',
    userAgent: 'unknown',
    platform: 'unknown',
    errors: []
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Check Supabase connection
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase.from('academy_modules').select('count').limit(1);
        
        if (error) {
          setDebugInfo(prev => ({
            ...prev,
            supabaseStatus: 'error',
            errors: [...prev.errors, `Supabase error: ${error.message}`]
          }));
        } else {
          setDebugInfo(prev => ({
            ...prev,
            supabaseStatus: 'connected'
          }));
        }
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          supabaseStatus: 'error',
          errors: [...prev.errors, `Supabase connection failed: ${error}`]
        }));
      }
    };

    if (isVisible) {
      checkSupabase();
    }
  }, [isVisible]);

  // Check browser environment
  useEffect(() => {
    if (isVisible && typeof window !== 'undefined') {
      // Check localStorage
      try {
        const testKey = '__debug_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        setDebugInfo(prev => ({ ...prev, localStorageStatus: 'working' }));
      } catch (error) {
        setDebugInfo(prev => ({ 
          ...prev, 
          localStorageStatus: 'error',
          errors: [...prev.errors, `localStorage error: ${error}`]
        }));
      }

      // Check sessionStorage
      try {
        const testKey = '__debug_test__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        setDebugInfo(prev => ({ ...prev, sessionStorageStatus: 'working' }));
      } catch (error) {
        setDebugInfo(prev => ({ 
          ...prev, 
          sessionStorageStatus: 'error',
          errors: [...prev.errors, `sessionStorage error: ${error}`]
        }));
      }

      // Check cookies
      try {
        document.cookie = '__debug_test__=test; path=/';
        const hasCookie = document.cookie.includes('__debug_test__');
        document.cookie = '__debug_test__=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        setDebugInfo(prev => ({ ...prev, cookiesStatus: hasCookie ? 'working' : 'not working' }));
      } catch (error) {
        setDebugInfo(prev => ({ 
          ...prev, 
          cookiesStatus: 'error',
          errors: [...prev.errors, `Cookies error: ${error}`]
        }));
      }

      // Get browser info
      setDebugInfo(prev => ({
        ...prev,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }));
    }
  }, [isVisible]);

  // Check network status
  useEffect(() => {
    if (isVisible) {
      const checkNetwork = async () => {
        try {
          const start = Date.now();
          const response = await fetch('/api/check-supabase-status', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          const end = Date.now();
          const responseTime = end - start;
          
          setDebugInfo(prev => ({
            ...prev,
            networkStatus: `API response: ${response.status} (${responseTime}ms)`
          }));
        } catch (error) {
          setDebugInfo(prev => ({
            ...prev,
            networkStatus: `Network error: ${error}`,
            errors: [...prev.errors, `Network error: ${error}`]
          }));
        }
      };

      checkNetwork();
    }
  }, [isVisible]);

  // Update timestamp every second
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setDebugInfo(prev => ({ ...prev, timestamp: new Date().toISOString() }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg shadow-2xl border border-red-500 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-red-400">🔍 Login Debugger</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
          >
            {isExpanded ? '📁' : '📂'}
          </button>
          <button
            onClick={onToggle}
            className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>🕐 Time:</span>
          <span className="text-green-400">{debugInfo.timestamp}</span>
        </div>
        
        <div className="flex justify-between">
          <span>🌐 Supabase:</span>
          <span className={`${
            debugInfo.supabaseStatus === 'connected' ? 'text-green-400' : 
            debugInfo.supabaseStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {debugInfo.supabaseStatus === 'checking' ? '⏳ Checking...' : 
             debugInfo.supabaseStatus === 'connected' ? '✅ Connected' : '❌ Error'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>📡 Network:</span>
          <span className="text-blue-400 text-xs">{debugInfo.networkStatus}</span>
        </div>

        <div className="flex justify-between">
          <span>💾 Storage:</span>
          <span className="text-blue-400 text-xs">
            LS: {debugInfo.localStorageStatus} | SS: {debugInfo.sessionStorageStatus}
          </span>
        </div>

        <div className="flex justify-between">
          <span>🍪 Cookies:</span>
          <span className={`${
            debugInfo.cookiesStatus === 'working' ? 'text-green-400' : 'text-red-400'
          }`}>
            {debugInfo.cookiesStatus}
          </span>
        </div>
      </div>

      {/* Expanded Info */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-600 space-y-2 text-xs">
          <div>
            <span className="text-gray-400">User Agent:</span>
            <div className="text-blue-400 break-all">{debugInfo.userAgent}</div>
          </div>
          
          <div>
            <span className="text-gray-400">Platform:</span>
            <div className="text-blue-400">{debugInfo.platform}</div>
          </div>

          {debugInfo.errors.length > 0 && (
            <div>
              <span className="text-red-400">Errors:</span>
              <div className="space-y-1">
                {debugInfo.errors.map((error, index) => (
                  <div key={index} className="text-red-300 text-xs bg-red-900/20 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-3 pt-3 border-t border-gray-600">
        <button
          onClick={() => window.location.reload()}
          className="w-full px-3 py-2 bg-blue-600 rounded text-sm hover:bg-blue-700"
        >
          🔄 Refresh Page
        </button>
      </div>
    </div>
  );
}
