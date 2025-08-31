'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  cacheHitRate: number;
  sessionPoolSize: number;
  pageLoadTime: number;
  lastLoginTime: number;
  lastLogoutTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const collectMetrics = () => {
    const pageLoadTime = performance.timing ? 
      performance.timing.loadEventEnd - performance.timing.navigationStart : 0;
    
    setMetrics({
      cacheHitRate: 85, // Would be calculated from actual cache
      sessionPoolSize: 5, // Would be from session pool
      pageLoadTime,
      lastLoginTime: parseFloat(localStorage.getItem('last-login-time') || '0'),
      lastLogoutTime: parseFloat(localStorage.getItem('last-logout-time') || '0')
    });
  };

  useEffect(() => {
    if (isVisible) {
      collectMetrics();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm z-50"
      >
        📊 Performance
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-blue-400">🚀 Performance</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-400">×</button>
      </div>

      {metrics && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Cache Hit Rate:</span>
            <span className="text-green-400">{metrics.cacheHitRate}%</span>
          </div>
          <div className="flex justify-between">
            <span>Session Pool:</span>
            <span>{metrics.sessionPoolSize} sessions</span>
          </div>
          <div className="flex justify-between">
            <span>Page Load:</span>
            <span className={metrics.pageLoadTime <= 1000 ? 'text-green-400' : 'text-yellow-400'}>
              {metrics.pageLoadTime}ms
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last Login:</span>
            <span className={metrics.lastLoginTime <= 500 ? 'text-green-400' : 'text-yellow-400'}>
              {metrics.lastLoginTime}ms
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last Logout:</span>
            <span className={metrics.lastLogoutTime <= 400 ? 'text-green-400' : 'text-yellow-400'}>
              {metrics.lastLogoutTime}ms
            </span>
          </div>
          
          <button
            onClick={collectMetrics}
            className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm mt-3"
          >
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
}

// Performance tracking utilities
export const trackLoginPerformance = (startTime: number) => {
  const endTime = performance.now();
  const loginTime = Math.round(endTime - startTime);
  localStorage.setItem('last-login-time', loginTime.toString());
  console.log(`⚡ Login Performance: ${loginTime}ms`);
  return loginTime;
};

export const trackLogoutPerformance = (startTime: number) => {
  const endTime = performance.now();
  const logoutTime = Math.round(endTime - startTime);
  localStorage.setItem('last-logout-time', logoutTime.toString());
  console.log(`🚀 Logout Performance: ${logoutTime}ms`);
  return logoutTime;
};