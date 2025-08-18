'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function PerformanceMonitor() {
  const { user } = useSupabaseAuth();
  const performanceData = useRef({
    renderCount: 0,
    memoryUsage: 0,
    domSize: 0,
    eventListeners: 0,
    intervals: 0,
    timeouts: 0,
    lastRenderTime: 0,
    slowRenders: 0,
    memoryLeaks: 0
  });
  const renderStartTime = useRef(0);
  const intervalIds = useRef<Set<number>>(new Set());
  const timeoutIds = useRef<Set<number>>(new Set());

  // Enhanced user detection
  const getUserType = useCallback(() => {
    if (!user?.email) return 'unknown';
    
    const email = user.email.toLowerCase();
    if (email.includes('rick') || email.includes('cuijpers')) return 'rick';
    if (email.includes('chiel')) return 'chiel';
    if (email.includes('test') || email.includes('demo')) return 'test';
    if (email.includes('admin')) return 'admin';
    return 'user';
  }, [user]);

  // Log performance issues
  const logPerformanceIssue = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/admin/session-logging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || '',
          user_email: user?.email || '',
          current_page: window.location.pathname,
          user_agent: navigator.userAgent,
          action_type: 'performance_issue',
          error_message: data.error_message || null,
          details: {
            ...data.details,
            user_type: getUserType(),
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to log performance issue:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging performance issue:', error);
    }
  }, [user, getUserType]);

  // Monitor render performance (simplified)
  useEffect(() => {
    const checkRenderPerformance = () => {
      // Simplified render performance monitoring
      const now = performance.now();
      const timeSinceLastCheck = now - renderStartTime.current;
      
      if (timeSinceLastCheck > 1000) { // Check if renders are taking too long
        performanceData.current.slowRenders++;
        
        if (performanceData.current.slowRenders > 5) {
          logPerformanceIssue({
            error_message: `Multiple slow renders detected: ${performanceData.current.slowRenders}`,
            details: {
              slow_renders: performanceData.current.slowRenders,
              render_count: performanceData.current.renderCount,
              page: window.location.pathname
            }
          });
        }
      }
      
      renderStartTime.current = now;
      performanceData.current.renderCount++;
    };

    const renderInterval = setInterval(checkRenderPerformance, 5000); // Check every 5 seconds
    return () => clearInterval(renderInterval);
  }, [logPerformanceIssue]);

  // Monitor memory usage
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const totalMB = memory.totalJSHeapSize / 1024 / 1024;
        
        performanceData.current.memoryUsage = usedMB;
        
        if (usedMB > 100) { // High memory usage
          logPerformanceIssue({
            error_message: `High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`,
            details: {
              memory_used_mb: usedMB,
              memory_total_mb: totalMB,
              memory_limit_mb: memory.jsHeapSizeLimit / 1024 / 1024,
              page: window.location.pathname
            }
          });
        }
        
        // Check for memory leaks (increasing usage over time)
        if (usedMB > performanceData.current.memoryUsage * 1.5) {
          performanceData.current.memoryLeaks++;
          logPerformanceIssue({
            error_message: `Potential memory leak detected: ${usedMB.toFixed(2)}MB`,
            details: {
              memory_leak_count: performanceData.current.memoryLeaks,
              memory_usage_mb: usedMB,
              page: window.location.pathname
            }
          });
        }
      }
    };

    const memoryInterval = setInterval(checkMemory, 10000); // Check every 10 seconds
    return () => clearInterval(memoryInterval);
  }, [logPerformanceIssue]);

  // Monitor DOM size
  useEffect(() => {
    const checkDOMSize = () => {
      const elementCount = document.querySelectorAll('*').length;
      performanceData.current.domSize = elementCount;
      
      if (elementCount > 1000) { // Large DOM
        logPerformanceIssue({
          error_message: `Large DOM detected: ${elementCount} elements`,
          details: {
            dom_element_count: elementCount,
            dom_threshold: 1000,
            page: window.location.pathname
          }
        });
      }
    };

    const domInterval = setInterval(checkDOMSize, 5000); // Check every 5 seconds
    return () => clearInterval(domInterval);
  }, [logPerformanceIssue]);

  // Monitor intervals and timeouts (simplified to avoid TypeScript issues)
  useEffect(() => {
    let intervalCount = 0;
    let timeoutCount = 0;
    
    const checkTimers = () => {
      // This is a simplified approach that doesn't override native functions
      if (intervalCount > 20) {
        logPerformanceIssue({
          error_message: `Too many intervals detected: ${intervalCount}`,
          details: {
            interval_count: intervalCount,
            threshold: 20,
            page: window.location.pathname
          }
        });
      }
      
      if (timeoutCount > 50) {
        logPerformanceIssue({
          error_message: `Too many timeouts detected: ${timeoutCount}`,
          details: {
            timeout_count: timeoutCount,
            threshold: 50,
            page: window.location.pathname
          }
        });
      }
    };

    const timerInterval = setInterval(checkTimers, 10000); // Check every 10 seconds
    return () => clearInterval(timerInterval);
  }, [logPerformanceIssue]);

  // Monitor event listeners (simplified)
  useEffect(() => {
    const checkEventListeners = () => {
      // Simplified event listener monitoring
      const elementCount = document.querySelectorAll('*').length;
      const estimatedListeners = elementCount * 0.5; // Rough estimate
      
      if (estimatedListeners > 100) {
        logPerformanceIssue({
          error_message: `Potentially too many event listeners: ~${estimatedListeners}`,
          details: {
            estimated_listener_count: estimatedListeners,
            element_count: elementCount,
            threshold: 100,
            page: window.location.pathname
          }
        });
      }
    };

    const listenerInterval = setInterval(checkEventListeners, 15000); // Check every 15 seconds
    return () => clearInterval(listenerInterval);
  }, [logPerformanceIssue]);

  // Monitor for infinite loops
  useEffect(() => {
    let loopCount = 0;
    let lastCheck = Date.now();
    
    const checkForLoops = () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheck;
      
      // If checks are happening too frequently, it might be a loop
      if (timeSinceLastCheck < 100) { // Less than 100ms between checks
        loopCount++;
        
        if (loopCount > 10) { // Potential infinite loop
          logPerformanceIssue({
            error_message: `Potential infinite loop detected: ${loopCount} rapid checks`,
            details: {
              loop_count: loopCount,
              time_between_checks: timeSinceLastCheck,
              threshold: 100,
              page: window.location.pathname
            }
          });
        }
      } else {
        loopCount = 0;
      }
      
      lastCheck = now;
    };

    const loopInterval = setInterval(checkForLoops, 50); // Check every 50ms
    return () => clearInterval(loopInterval);
  }, [logPerformanceIssue]);

  // Monitor for stuck processes
  useEffect(() => {
    const checkForStuckProcesses = () => {
      const now = Date.now();
      
      // Check if main thread is blocked
      const startTime = performance.now();
      let i = 0;
      while (performance.now() - startTime < 1) {
        i++;
      }
      
      if (i < 1000) { // Main thread might be blocked
        logPerformanceIssue({
          error_message: 'Main thread appears to be blocked',
          details: {
            iterations_in_1ms: i,
            expected_minimum: 1000,
            page: window.location.pathname
          }
        });
      }
    };

    const stuckInterval = setInterval(checkForStuckProcesses, 30000); // Check every 30 seconds
    return () => clearInterval(stuckInterval);
  }, [logPerformanceIssue]);

  // Rick-specific intensive monitoring
  useEffect(() => {
    if (getUserType() !== 'rick') return;

    console.log('🔍 PerformanceMonitor: Rick-specific monitoring enabled');

    // More frequent checks for Rick
    const rickMemoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        if (usedMB > 50) { // Lower threshold for Rick
          logPerformanceIssue({
            error_message: `Rick: Elevated memory usage: ${usedMB.toFixed(2)}MB`,
            details: {
              memory_used_mb: usedMB,
              threshold: 50,
              user_type: 'rick',
              page: window.location.pathname
            }
          });
        }
      }
    }, 5000); // Check every 5 seconds for Rick

    // Monitor Rick's specific issues
    const rickSpecificInterval = setInterval(() => {
      const currentData = performanceData.current;
      
      if (currentData.slowRenders > 5) {
        logPerformanceIssue({
          error_message: `Rick: Multiple slow renders detected: ${currentData.slowRenders}`,
          details: {
            slow_renders: currentData.slowRenders,
            render_count: currentData.renderCount,
            user_type: 'rick',
            page: window.location.pathname
          }
        });
      }
      
      if (currentData.intervals > 10) {
        logPerformanceIssue({
          error_message: `Rick: Too many intervals: ${currentData.intervals}`,
          details: {
            interval_count: currentData.intervals,
            user_type: 'rick',
            page: window.location.pathname
          }
        });
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(rickMemoryInterval);
      clearInterval(rickSpecificInterval);
    };
  }, [getUserType, logPerformanceIssue]);

  // This component doesn't render anything visible
  return null;
}
