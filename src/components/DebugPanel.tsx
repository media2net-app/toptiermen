'use client';
import { useDebug } from '@/contexts/DebugContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect } from 'react';
import { getCacheInfo, checkForCacheIssues, clearAppSpecificCache, globalLoadingManager } from '@/lib/cache-utils';
import { supabase } from '@/lib/supabase';

export default function DebugPanel() {
  const { showDebug, toggleDebug } = useDebug();
  const { user, loading } = useSupabaseAuth();
  const [cacheInfo, setCacheInfo] = useState<any>({});
  const [cacheIssues, setCacheIssues] = useState<any>({});
  const [loadingStates, setLoadingStates] = useState<Array<{ key: string; duration: number }>>([]);
  const [dbTestResult, setDbTestResult] = useState<string | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  useEffect(() => {
    if (showDebug) {
      const updateDebugInfo = () => {
        setCacheInfo(getCacheInfo());
        setCacheIssues(checkForCacheIssues());
        setLoadingStates(globalLoadingManager.getAllLoadingStates());
      };

      updateDebugInfo();
      
      // Update every 2 seconds when debug panel is open
      const interval = setInterval(updateDebugInfo, 2000);
      return () => clearInterval(interval);
    }
  }, [showDebug]);

  const handleClearStuckLoadingStates = () => {
    globalLoadingManager.clearAll();
    setLoadingStates([]);
    console.log('🧹 Cleared all loading states');
  };

  const handleForceReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const testDatabaseConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult('Testing...');
    
    try {
      console.log('Testing database connection...');
      
      // Test 1: Simple query with timeout
      const startTime = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const result = await supabase
        .from('academy_modules')
        .select('id, title, status')
        .limit(1)
        .abortSignal(controller.signal);
      
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      if (result.error) {
        setDbTestResult(`❌ Database Error (${duration}ms): ${result.error.message}`);
      } else {
        const count = result.data?.length || 0;
        setDbTestResult(`✅ Database OK (${duration}ms): Found ${count} modules`);
        console.log('Database test result:', result.data);
      }
      
    } catch (error) {
      const err = error as Error;
      if (err.name === 'AbortError') {
        setDbTestResult('❌ Database Timeout: Connection took longer than 5 seconds');
      } else {
        setDbTestResult(`❌ Database Error: ${err.message}`);
      }
      console.error('Database test failed:', error);
    } finally {
      setIsTestingDb(false);
    }
  };

  const testUserTables = async () => {
    if (!user) {
      setDbTestResult('❌ No user logged in');
      return;
    }
    
    setIsTestingDb(true);
    setDbTestResult('Testing user tables...');
    
    try {
      const startTime = Date.now();
      
      // Test user-specific queries
      const [userResult, progressResult] = await Promise.allSettled([
        supabase.from('users').select('id, email, role').eq('id', user.id).single(),
        supabase.from('user_lesson_progress').select('id').eq('user_id', user.id).limit(1)
      ]);
      
      const duration = Date.now() - startTime;
      
      let message = `User tables test (${duration}ms):\n`;
      
      if (userResult.status === 'fulfilled' && !userResult.value.error) {
        message += `✅ Users table: Found user\n`;
      } else {
        message += `❌ Users table: ${userResult.status === 'rejected' ? userResult.reason : userResult.value.error?.message}\n`;
      }
      
      if (progressResult.status === 'fulfilled' && !progressResult.value.error) {
        message += `✅ Progress table: OK (${progressResult.value.data?.length || 0} records)`;
      } else {
        message += `❌ Progress table: ${progressResult.status === 'rejected' ? progressResult.reason : progressResult.value.error?.message}`;
      }
      
      setDbTestResult(message);
      
    } catch (error) {
      setDbTestResult(`❌ User tables test failed: ${(error as Error).message}`);
    } finally {
      setIsTestingDb(false);
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={toggleDebug}
        className="fixed bottom-4 right-4 z-50 bg-[#8BAE5A] text-[#181F17] px-3 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-[#B6C948] transition-all duration-200"
      >
        🔧 Debug
      </button>
    );
  }

  return (
    <>
      <button
        onClick={toggleDebug}
        className="fixed bottom-4 right-4 z-50 bg-[#8BAE5A] text-[#181F17] px-3 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-[#B6C948] transition-all duration-200"
      >
        🔧 Hide Debug
      </button>

      <div className="fixed bottom-16 right-4 z-50 bg-[#181F17] border border-[#3A4D23] rounded-lg p-4 max-w-md max-h-96 overflow-y-auto shadow-xl">
        <h3 className="text-[#8BAE5A] font-semibold mb-3">Debug Panel</h3>
        
        {/* Auth Status */}
        <div className="mb-4">
          <h4 className="text-[#B6C948] text-sm font-medium mb-2">Auth Status</h4>
          <div className="text-xs text-white space-y-1">
            <div>Loading: <span className={loading ? "text-yellow-400" : "text-green-400"}>{loading ? "Yes" : "No"}</span></div>
            <div>User: <span className={user ? "text-green-400" : "text-red-400"}>{user ? "Logged in" : "Not logged in"}</span></div>
            <div>Email: <span className="text-gray-300">{user?.email || "N/A"}</span></div>
            <div>Role: <span className="text-gray-300">{user?.role || "N/A"}</span></div>
          </div>
        </div>

        {/* Loading States */}
        <div className="mb-4">
          <h4 className="text-[#B6C948] text-sm font-medium mb-2">Active Loading States</h4>
          <div className="text-xs text-white space-y-1">
            {loadingStates.length === 0 ? (
              <div className="text-green-400">No active loading states</div>
            ) : (
              <>
                {loadingStates.map((state, index) => (
                  <div key={index} className={`flex justify-between ${state.duration > 10000 ? 'text-red-400' : state.duration > 5000 ? 'text-yellow-400' : 'text-white'}`}>
                    <span>{state.key}</span>
                    <span>{(state.duration / 1000).toFixed(1)}s</span>
                  </div>
                ))}
                <button
                  onClick={handleClearStuckLoadingStates}
                  className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                  Clear All Loading States
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cache Issues */}
        {cacheIssues.hasIssues && (
          <div className="mb-4">
            <h4 className="text-red-400 text-sm font-medium mb-2">⚠️ Cache Issues</h4>
            <div className="text-xs text-red-300 space-y-1">
              {cacheIssues.issues.map((issue: string, index: number) => (
                <div key={index}>• {issue}</div>
              ))}
            </div>
          </div>
        )}

        {/* Cache Info */}
        <div className="mb-4">
          <h4 className="text-[#B6C948] text-sm font-medium mb-2">Cache Info</h4>
          <div className="text-xs text-white space-y-1">
            <div>LocalStorage: <span className="text-gray-300">{Object.keys(cacheInfo.localStorage || {}).length} items ({Math.round((cacheInfo.localStorageSize || 0) / 1024)}KB)</span></div>
            <div>SessionStorage: <span className="text-gray-300">{Object.keys(cacheInfo.sessionStorage || {}).length} items ({Math.round((cacheInfo.sessionStorageSize || 0) / 1024)}KB)</span></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-green-400 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              Clear App Cache
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Force Reload & Clear All
            </button>
            <button
              onClick={testDatabaseConnection}
              disabled={isTestingDb}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isTestingDb ? 'Testing...' : 'Test Database'}
            </button>
            <button
              onClick={testUserTables}
              disabled={isTestingDb || !user}
              className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Test User Tables
            </button>
          </div>
          
          {dbTestResult && (
            <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono whitespace-pre-wrap">
              {dbTestResult}
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="mb-4">
          <h4 className="text-[#B6C948] text-sm font-medium mb-2">Performance</h4>
          <div className="text-xs text-white space-y-1">
            <div>Load Time: <span className="text-gray-300">
              {typeof window !== 'undefined' && performance.timing?.loadEventEnd && performance.timing?.navigationStart
                ? `${performance.timing.loadEventEnd - performance.timing.navigationStart} ms`
                : 'N/A'
              }
            </span></div>
            <div>Memory: <span className="text-gray-300">
              {typeof window !== 'undefined' && (performance as any).memory
                ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)} MB`
                : 'N/A'
              }
            </span></div>
          </div>
        </div>

        {/* Current Page */}
        <div className="mb-4">
          <h4 className="text-[#B6C948] text-sm font-medium mb-2">Current Page</h4>
          <div className="text-xs text-white space-y-1">
            <div>URL: <span className="text-gray-300 break-all">{typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</span></div>
            <div>Title: <span className="text-gray-300">{typeof document !== 'undefined' ? document.title : 'N/A'}</span></div>
          </div>
        </div>
      </div>
    </>
  );
} 