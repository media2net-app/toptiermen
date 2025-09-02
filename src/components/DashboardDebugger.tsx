'use client';

import { useState, useEffect } from 'react';
import { 
  BugAntIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardDebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
}

interface DebugInfo {
  timestamp: string;
  userInfo: {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
  };
  systemStatus: {
    supabaseConnection: 'checking' | 'connected' | 'error';
    apiResponse: string;
    databaseQueries: number;
    loadingTime: number;
  };
  performance: {
    pageLoadTime: number;
    dataFetchTime: number;
    renderTime: number;
    memoryUsage: number;
  };
  errors: string[];
  warnings: string[];
  networkRequests: Array<{
    url: string;
    status: number;
    responseTime: number;
    error?: string;
  }>;
}

export default function DashboardDebugger({ isVisible, onToggle }: DashboardDebuggerProps) {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    timestamp: new Date().toISOString(),
    userInfo: {
      id: 'unknown',
      email: 'unknown',
      role: 'unknown',
      isAdmin: false
    },
    systemStatus: {
      supabaseConnection: 'checking',
      apiResponse: 'checking...',
      databaseQueries: 0,
      loadingTime: 0
    },
    performance: {
      pageLoadTime: 0,
      dataFetchTime: 0,
      renderTime: 0,
      memoryUsage: 0
    },
    errors: [],
    warnings: [],
    networkRequests: []
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor page load performance
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setDebugInfo(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          pageLoadTime: loadTime
        }
      }));
    };

    // Monitor memory usage
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setDebugInfo(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
          }
        }));
      }
    };

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const startTime = performance.now();
      const url = args[0] as string;
      
      return originalFetch.apply(this, args).then(response => {
        const responseTime = performance.now() - startTime;
        setDebugInfo(prev => ({
          ...prev,
          networkRequests: [
            ...prev.networkRequests,
            {
              url,
              status: response.status,
              responseTime,
              error: response.ok ? undefined : `HTTP ${response.status}`
            }
          ].slice(-10) // Keep last 10 requests
        }));
        return response;
      }).catch(error => {
        const responseTime = performance.now() - startTime;
        setDebugInfo(prev => ({
          ...prev,
          networkRequests: [
            ...prev.networkRequests,
            {
              url,
              status: 0,
              responseTime,
              error: error.message
            }
          ].slice(-10)
        }));
        throw error;
      });
    };

    // Check Supabase connection
    const checkSupabaseConnection = async () => {
      try {
        const startTime = performance.now();
        const response = await fetch('/api/check-supabase-status');
        const responseTime = performance.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          setDebugInfo(prev => ({
            ...prev,
            systemStatus: {
              ...prev.systemStatus,
              supabaseConnection: 'connected',
              apiResponse: `API: ${response.status} (${responseTime.toFixed(0)}ms)`,
              loadingTime: responseTime
            }
          }));
        } else {
          setDebugInfo(prev => ({
            ...prev,
            systemStatus: {
              ...prev.systemStatus,
              supabaseConnection: 'error',
              apiResponse: `API Error: ${response.status}`,
              loadingTime: responseTime
            },
            errors: [...prev.errors, `API request failed: ${response.status}`]
          }));
        }
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          systemStatus: {
            ...prev.systemStatus,
            supabaseConnection: 'error',
            apiResponse: 'Connection failed',
            loadingTime: 0
          },
          errors: [...prev.errors, `Network error: ${error}`]
        }));
      }
    };

    // Check user info
    const checkUserInfo = () => {
      const userInfo = localStorage.getItem('user_info') || sessionStorage.getItem('user_info');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setDebugInfo(prev => ({
            ...prev,
            userInfo: {
              id: user.id || 'unknown',
              email: user.email || 'unknown',
              role: user.role || 'unknown',
              isAdmin: user.role === 'admin'
            }
          }));
        } catch (error) {
          setDebugInfo(prev => ({
            ...prev,
            warnings: [...prev.warnings, 'Failed to parse user info']
          }));
        }
      }
    };

    // Monitor errors
    const handleError = (event: ErrorEvent) => {
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `JavaScript Error: ${event.message}`]
      }));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `Unhandled Promise Rejection: ${event.reason}`]
      }));
    };

    // Monitor warnings
    const handleWarning = (event: any) => {
      if (event.detail && event.detail.type === 'warning') {
        setDebugInfo(prev => ({
          ...prev,
          warnings: [...prev.warnings, event.detail.message]
        }));
      }
    };

    // Set up event listeners
    window.addEventListener('load', handleLoad);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('warning', handleWarning);
    
    // Initial checks
    checkSupabaseConnection();
    checkUserInfo();
    updateMemoryUsage();

    // Periodic updates
    const interval = setInterval(() => {
      setDebugInfo(prev => ({
        ...prev,
        timestamp: new Date().toISOString()
      }));
      updateMemoryUsage();
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('warning', handleWarning);
      clearInterval(interval);
    };
  }, []);

  const refreshDebugInfo = async () => {
    setIsRefreshing(true);
    
    // Force refresh all checks
    try {
      const response = await fetch('/api/check-supabase-status');
      const responseTime = performance.now();
      
      setDebugInfo(prev => ({
        ...prev,
        systemStatus: {
          ...prev.systemStatus,
          supabaseConnection: response.ok ? 'connected' : 'error',
          apiResponse: `API: ${response.status} (${responseTime.toFixed(0)}ms)`,
          loadingTime: responseTime
        }
      }));
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        systemStatus: {
          ...prev.systemStatus,
          supabaseConnection: 'error',
          apiResponse: 'Connection failed',
          loadingTime: 0
        }
      }));
    }
    
    setIsRefreshing(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/95 text-white p-4 rounded-lg shadow-2xl border border-red-500 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
          <BugAntIcon className="w-5 h-5" />
          Dashboard Debugger
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
          >
            {isExpanded ? '📁' : '📂'}
          </button>
          <button
            onClick={refreshDebugInfo}
            disabled={isRefreshing}
            className="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700 disabled:opacity-50"
          >
            {isRefreshing ? '🔄' : '🔄'}
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
          <span>👤 User:</span>
          <span className="text-blue-400 text-xs">
            {debugInfo.userInfo.email} ({debugInfo.userInfo.role})
          </span>
        </div>

        <div className="flex justify-between">
          <span>🌐 Supabase:</span>
          <span className={`${
            debugInfo.systemStatus.supabaseConnection === 'connected' ? 'text-green-400' : 
            debugInfo.systemStatus.supabaseConnection === 'error' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {debugInfo.systemStatus.supabaseConnection === 'checking' ? '⏳ Checking...' : 
             debugInfo.systemStatus.supabaseConnection === 'connected' ? '✅ Connected' : '❌ Error'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>📡 API:</span>
          <span className="text-blue-400 text-xs">{debugInfo.systemStatus.apiResponse}</span>
        </div>

        <div className="flex justify-between">
          <span>⚡ Load Time:</span>
          <span className="text-blue-400 text-xs">{debugInfo.systemStatus.loadingTime.toFixed(0)}ms</span>
        </div>

        <div className="flex justify-between">
          <span>🚀 Page Load:</span>
          <span className="text-blue-400 text-xs">{debugInfo.performance.pageLoadTime.toFixed(0)}ms</span>
        </div>

        <div className="flex justify-between">
          <span>💾 Memory:</span>
          <span className="text-blue-400 text-xs">{debugInfo.performance.memoryUsage.toFixed(1)}MB</span>
        </div>

        <div className="flex justify-between">
          <span>🌐 Requests:</span>
          <span className="text-blue-400 text-xs">{debugInfo.networkRequests.length}</span>
        </div>
      </div>

      {/* Expanded Info */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-600 space-y-2 text-xs">
          {/* Network Requests */}
          {debugInfo.networkRequests.length > 0 && (
            <div>
              <span className="text-gray-400">Network Requests:</span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {debugInfo.networkRequests.map((request, index) => (
                  <div key={index} className={`text-xs p-2 rounded ${
                    request.error ? 'bg-red-900/20 text-red-300' : 'bg-blue-900/20 text-blue-300'
                  }`}>
                    <div className="font-mono text-xs truncate">{request.url}</div>
                    <div className="flex justify-between">
                      <span>{request.status || 'ERR'}</span>
                      <span>{request.responseTime.toFixed(0)}ms</span>
                    </div>
                    {request.error && <div className="text-red-400">{request.error}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
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

          {/* Warnings */}
          {debugInfo.warnings.length > 0 && (
            <div>
              <span className="text-yellow-400">Warnings:</span>
              <div className="space-y-1">
                {debugInfo.warnings.map((warning, index) => (
                  <div key={index} className="text-yellow-300 text-xs bg-yellow-900/20 p-2 rounded">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
