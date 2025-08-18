'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function PerformanceTestPanel() {
  const { user } = useSupabaseAuth();
  const [performanceInfo, setPerformanceInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    status: string;
    value: string;
    threshold: string;
  }>>([]);

  // Enhanced user detection
  const getUserType = () => {
    if (!user?.email) return 'unknown';
    
    const email = user.email.toLowerCase();
    if (email.includes('rick') || email.includes('cuijpers')) return 'rick';
    if (email.includes('chiel')) return 'chiel';
    if (email.includes('test') || email.includes('demo')) return 'test';
    if (email.includes('admin')) return 'admin';
    return 'user';
  };

  // Collect performance information
  const collectPerformanceInfo = () => {
    const info = {
      userType: getUserType(),
      userEmail: user?.email,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      
      // Memory info
      memory: {
        used: 0,
        total: 0,
        limit: 0,
        percentage: 0
      },
      
      // DOM info
      dom: {
        elementCount: document.querySelectorAll('*').length,
        depth: getMaxDOMDepth(),
        largeElements: getLargeElements()
      },
      
      // Performance metrics
      performance: {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime,
      },
      
      // Resource info
      resources: {
        total: performance.getEntriesByType('resource').length,
        cached: performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize === 0).length,
        large: performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize > 1000000).length
      },
      
      // Browser info
      browser: {
        hasServiceWorker: 'serviceWorker' in navigator,
        serviceWorkerController: navigator.serviceWorker?.controller ? true : false,
        hasWebWorkers: 'Worker' in window,
        hasSharedWorkers: 'SharedWorker' in window
      }
    };

    // Get memory info if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      info.memory = {
        used: memory.usedJSHeapSize / 1024 / 1024,
        total: memory.totalJSHeapSize / 1024 / 1024,
        limit: memory.jsHeapSizeLimit / 1024 / 1024,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }

    setPerformanceInfo(info);
  };

  // Get max DOM depth
  const getMaxDOMDepth = () => {
    let maxDepth = 0;
    
    const getDepth = (element: Element, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      for (const child of element.children) {
        getDepth(child, depth + 1);
      }
    };
    
    getDepth(document.body, 0);
    return maxDepth;
  };

  // Get large elements
  const getLargeElements = () => {
    const elements = document.querySelectorAll('*');
    const largeElements: any[] = [];
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 1000 || rect.height > 1000) {
        largeElements.push({
          tag: element.tagName,
          width: rect.width,
          height: rect.height,
          className: element.className
        });
      }
    });
    
    return largeElements.slice(0, 5); // Return top 5
  };

  // Run performance tests
  const runPerformanceTests = async () => {
    const tests: Array<{
      name: string;
      status: string;
      value: string;
      threshold: string;
    }> = [];
    
    // Test 1: Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      tests.push({
        name: 'Memory Usage',
        status: usedMB > 100 ? '⚠️ High' : usedMB > 50 ? '⚠️ Elevated' : '✅ Good',
        value: `${usedMB.toFixed(2)}MB`,
        threshold: '100MB'
      });
    }
    
    // Test 2: DOM size
    const elementCount = document.querySelectorAll('*').length;
    tests.push({
      name: 'DOM Elements',
      status: elementCount > 1000 ? '⚠️ Large' : elementCount > 500 ? '⚠️ Medium' : '✅ Good',
      value: elementCount.toString(),
      threshold: '1000'
    });
    
    // Test 3: Load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    tests.push({
      name: 'Load Time',
      status: loadTime > 5000 ? '⚠️ Slow' : loadTime > 2000 ? '⚠️ Medium' : '✅ Fast',
      value: `${loadTime}ms`,
      threshold: '5000ms'
    });
    
    // Test 4: Cached resources
    const cachedResources = performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize === 0).length;
    const totalResources = performance.getEntriesByType('resource').length;
    const cacheRatio = totalResources > 0 ? (cachedResources / totalResources) * 100 : 0;
    tests.push({
      name: 'Cache Ratio',
      status: cacheRatio > 80 ? '✅ Good' : cacheRatio > 50 ? '⚠️ Medium' : '❌ Low',
      value: `${cacheRatio.toFixed(1)}%`,
      threshold: '80%'
    });
    
    // Test 5: Service Worker
    const hasServiceWorker = 'serviceWorker' in navigator && navigator.serviceWorker.controller;
    tests.push({
      name: 'Service Worker',
      status: hasServiceWorker ? '✅ Active' : '❌ Inactive',
      value: hasServiceWorker ? 'Active' : 'Inactive',
      threshold: 'Active'
    });
    
    // Test 6: Large resources
    const largeResources = performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize > 1000000).length;
    tests.push({
      name: 'Large Resources',
      status: largeResources > 5 ? '⚠️ Many' : largeResources > 2 ? '⚠️ Some' : '✅ Good',
      value: largeResources.toString(),
      threshold: '5'
    });
    
    setTestResults(tests);
  };

  // Force garbage collection (if available)
  const forceGarbageCollection = () => {
    if ('gc' in window) {
      (window as any).gc();
      collectPerformanceInfo();
    } else {
      alert('Garbage collection not available in this browser');
    }
  };

  // Clear all intervals and timeouts
  const clearAllTimers = () => {
    // This is a hack to clear intervals - not recommended for production
    const highestId = setTimeout(() => {}, 0) as number;
    for (let i = 0; i < highestId; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
    collectPerformanceInfo();
  };

  useEffect(() => {
    collectPerformanceInfo();
    
    // Update performance info every 5 seconds
    const interval = setInterval(collectPerformanceInfo, 5000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Only show for Rick or in development
  if (getUserType() !== 'rick' && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 left-32 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg"
      >
        ⚡ Performance Test
      </button>

      {/* Panel */}
      {isVisible && (
        <div className="fixed top-16 left-32 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-y-auto text-xs">
          <h3 className="font-bold mb-2 text-blue-400">Performance Test Panel</h3>
          
          <div className="space-y-2">
            <div>
              <strong>User:</strong> {performanceInfo.userType} ({performanceInfo.userEmail})
            </div>
            
            <div>
              <strong>Memory:</strong> {performanceInfo.memory?.used?.toFixed(2)}MB / {performanceInfo.memory?.limit?.toFixed(2)}MB ({performanceInfo.memory?.percentage?.toFixed(1)}%)
            </div>
            
            <div>
              <strong>DOM Elements:</strong> {performanceInfo.dom?.elementCount}
            </div>
            
            <div>
              <strong>Load Time:</strong> {performanceInfo.performance?.loadTime}ms
            </div>
            
            <div>
              <strong>Cache Ratio:</strong> {performanceInfo.resources?.cached}/{performanceInfo.resources?.total}
            </div>
            
            <div>
              <strong>Service Worker:</strong> {performanceInfo.browser?.serviceWorkerController ? 'Active' : 'Inactive'}
            </div>
          </div>
          
          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">Test Results:</h4>
              <div className="space-y-1">
                {testResults.map((test, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{test.name}:</span>
                    <span className={test.status.includes('✅') ? 'text-green-400' : test.status.includes('⚠️') ? 'text-yellow-400' : 'text-red-400'}>
                      {test.status} {test.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            <button
              onClick={runPerformanceTests}
              className="w-full bg-green-600 text-white px-2 py-1 rounded text-xs"
            >
              🧪 Run Tests
            </button>
            
            <button
              onClick={forceGarbageCollection}
              className="w-full bg-purple-600 text-white px-2 py-1 rounded text-xs"
            >
              🗑️ Force GC
            </button>
            
            <button
              onClick={clearAllTimers}
              className="w-full bg-orange-600 text-white px-2 py-1 rounded text-xs"
            >
              ⏰ Clear Timers
            </button>
            
            <button
              onClick={collectPerformanceInfo}
              className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            Last updated: {performanceInfo.timestamp}
          </div>
        </div>
      )}
    </>
  );
}
