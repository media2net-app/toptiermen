'use client';
import { useDebug } from '@/contexts/DebugContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getCacheInfo, checkForCacheIssues, clearAppSpecificCache } from '@/lib/cache-utils';

interface DebugPanelProps {
  data: Record<string, any>;
  title?: string;
}

export default function DebugPanel() {
  const { showDebug, toggleDebug } = useDebug();
  const { user, loading, clearAllCache } = useAuth();
  const [cacheInfo, setCacheInfo] = useState<any>({});
  const [cacheIssues, setCacheIssues] = useState<any>({});

  useEffect(() => {
    if (showDebug) {
      setCacheInfo(getCacheInfo());
      setCacheIssues(checkForCacheIssues());
    }
  }, [showDebug]);

  if (!showDebug) {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleDebug}
        className="fixed bottom-4 right-4 z-50 bg-[#8BAE5A] text-[#181F17] px-3 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-[#B6C948] transition-all duration-200"
      >
        {showDebug ? '🔧 Hide Debug' : '🔧 Debug'}
      </button>

      {showDebug && (
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

          {/* Cache Info */}
          <div className="mb-4">
            <h4 className="text-[#B6C948] text-sm font-medium mb-2">Cache Info</h4>
            <div className="text-xs text-white space-y-1">
              <div>localStorage items: <span className="text-gray-300">{Object.keys(cacheInfo.localStorage || {}).length}</span></div>
              <div>localStorage size: <span className="text-gray-300">{(cacheInfo.localStorageSize / 1024).toFixed(2)} KB</span></div>
              <div>sessionStorage items: <span className="text-gray-300">{Object.keys(cacheInfo.sessionStorage || {}).length}</span></div>
              <div>sessionStorage size: <span className="text-gray-300">{(cacheInfo.sessionStorageSize / 1024).toFixed(2)} KB</span></div>
              {cacheIssues.hasIssues && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
                  <div className="text-red-400 font-medium">⚠️ Cache Issues Detected:</div>
                  {cacheIssues.issues.map((issue: string, index: number) => (
                    <div key={index} className="text-red-300 text-xs">• {issue}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* localStorage Items */}
          {Object.keys(cacheInfo.localStorage || {}).length > 0 && (
            <div className="mb-4">
              <h4 className="text-[#B6C948] text-sm font-medium mb-2">localStorage Items</h4>
              <div className="text-xs text-white space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(cacheInfo.localStorage || {}).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-[#232D1A] p-2 rounded">
                    <div className="font-medium text-[#8BAE5A]">{key}</div>
                    <div className="text-gray-400 text-xs">{value.value}</div>
                    <div className="text-gray-500 text-xs">Size: {(value.size / 1024).toFixed(2)} KB</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cache Actions */}
          <div className="mb-4">
            <h4 className="text-[#B6C948] text-sm font-medium mb-2">Cache Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  setCacheInfo(getCacheInfo());
                  setCacheIssues(checkForCacheIssues());
                }}
                className="w-full bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
              >
                🗑️ Clear All Cache
              </button>
              <button
                onClick={() => {
                  clearAppSpecificCache();
                  setCacheInfo(getCacheInfo());
                  setCacheIssues(checkForCacheIssues());
                }}
                className="w-full bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
              >
                🧹 Clear App Cache
              </button>
              <button
                onClick={clearAllCache}
                className="w-full bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors"
              >
                🔄 Clear Cache & Reload
              </button>
              <button
                onClick={() => {
                  setCacheInfo(getCacheInfo());
                  setCacheIssues(checkForCacheIssues());
                }}
                className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
              >
                🔍 Refresh Cache Info
              </button>
            </div>
          </div>

          {/* Performance */}
          <div className="mb-4">
            <h4 className="text-[#B6C948] text-sm font-medium mb-2">Performance</h4>
            <div className="text-xs text-white space-y-1">
              <div>Load Time: <span className="text-gray-300">
                {performance.timing?.loadEventEnd && performance.timing?.navigationStart
                  ? `${performance.timing.loadEventEnd - performance.timing.navigationStart} ms`
                  : 'N/A'
                }
              </span></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 