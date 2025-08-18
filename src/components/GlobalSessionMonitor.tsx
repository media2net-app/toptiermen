'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function GlobalSessionMonitor() {
  const { user } = useSupabaseAuth();
  const lastLogTime = useRef<number>(0);
  const lastPage = useRef<string>('');
  const loopDetectionCount = useRef<number>(0);
  const errorCount = useRef<number>(0);
  const pageLoadCount = useRef<number>(0);
  const sessionStartTime = useRef<number>(Date.now());

  // Enhanced user detection for special monitoring
  const getUserType = useCallback(() => {
    if (!user?.email) return 'unknown';
    
    const email = user.email.toLowerCase();
    if (email.includes('rick') || email.includes('cuijpers')) return 'rick';
    if (email.includes('chiel')) return 'chiel';
    if (email.includes('test') || email.includes('demo')) return 'test';
    if (email.includes('admin')) return 'admin';
    return 'user';
  }, [user]);

  // Log session data to database
  const logSession = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/admin/session-logging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || '',
          user_email: user?.email || '',
          current_page: window.location.pathname,
          user_agent: navigator.userAgent,
          action_type: data.action_type || 'page_load',
          error_message: data.error_message || null,
          cache_hit: data.cache_hit || false,
          loop_detected: data.loop_detected || false,
          user_type: getUserType(),
          ...data
        })
      });

      if (!response.ok) {
        console.error('Failed to log session:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging session:', error);
    }
  }, [user, getUserType]);

  // Detect loops (same page loaded multiple times quickly)
  const detectLoops = useCallback((currentPage: string) => {
    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime.current;
    
    if (currentPage === lastPage.current && timeSinceLastLog < 5000) {
      loopDetectionCount.current++;
      
      if (loopDetectionCount.current > 3) {
        logSession({
          action_type: 'loop_detected',
          loop_detected: true,
          error_message: `Page reloaded ${loopDetectionCount.current} times in ${Math.round(timeSinceLastLog / 1000)} seconds`,
          details: {
            reload_count: loopDetectionCount.current,
            time_span: timeSinceLastLog,
            page: currentPage
          }
        });
      }
    } else {
      loopDetectionCount.current = 0;
    }
    
    lastPage.current = currentPage;
    lastLogTime.current = now;
  }, [logSession]);

  // Monitor page loads and navigation
  useEffect(() => {
    if (!user) return;

    const currentPage = window.location.pathname;
    pageLoadCount.current++;
    
    // Log page load
    logSession({
      action_type: 'page_load',
      cache_hit: false, // We'll implement cache detection later
      details: {
        page_load_count: pageLoadCount.current,
        session_duration: Date.now() - sessionStartTime.current,
        referrer: document.referrer
      }
    });

    detectLoops(currentPage);
  }, [user, logSession, detectLoops]);

  // Monitor navigation changes using pathname changes
  useEffect(() => {
    if (!user) return;

    const currentPage = window.location.pathname;
    const previousPage = lastPage.current;
    
    if (previousPage && previousPage !== currentPage) {
      logSession({
        action_type: 'navigation',
        current_page: currentPage,
        previous_page: previousPage,
        details: {
          from: previousPage,
          to: currentPage,
          navigation_time: Date.now() - lastLogTime.current
        }
      });
    }
    
    lastPage.current = currentPage;
  }, [user, logSession]);

  // Monitor errors globally
  useEffect(() => {
    if (!user) return;

    const handleError = (event: ErrorEvent) => {
      errorCount.current++;
      
      logSession({
        action_type: 'error',
        error_message: event.message,
        error_stack: event.error?.stack,
        details: {
          error_count: errorCount.current,
          error_type: event.type,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorCount.current++;
      
      logSession({
        action_type: 'error',
        error_message: event.reason?.message || 'Unhandled Promise Rejection',
        error_stack: event.reason?.stack,
        details: {
          error_count: errorCount.current,
          error_type: 'unhandledrejection',
          reason: event.reason
        }
      });
    };

    // Global error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [user, logSession]);

  // Monitor performance issues
  useEffect(() => {
    if (!user) return;

    const monitorPerformance = () => {
      // Check for slow page loads
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      
      if (loadTime > 5000) { // 5 seconds threshold
        logSession({
          action_type: 'performance_issue',
          error_message: `Slow page load: ${loadTime}ms`,
          details: {
            load_time: loadTime,
            threshold: 5000,
            performance_metrics: {
              domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
              firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
              firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime
            }
          }
        });
      }

      // Check for memory issues
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        if (memoryUsage > 80) { // 80% memory usage threshold
          logSession({
            action_type: 'performance_issue',
            error_message: `High memory usage: ${memoryUsage.toFixed(1)}%`,
            details: {
              memory_usage: memoryUsage,
              used_heap: memory.usedJSHeapSize,
              total_heap: memory.totalJSHeapSize,
              threshold: 80
            }
          });
        }
      }
    };

    // Monitor performance after page load
    if (document.readyState === 'complete') {
      monitorPerformance();
    } else {
      window.addEventListener('load', monitorPerformance);
      return () => window.removeEventListener('load', monitorPerformance);
    }
  }, [user, logSession]);

  // Monitor for stuck sessions (no activity for extended period)
  useEffect(() => {
    if (!user) return;

    let inactivityTimer: NodeJS.Timeout;
    
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logSession({
          action_type: 'session_timeout',
          error_message: 'User inactive for extended period',
          details: {
            inactivity_duration: 300000, // 5 minutes
            last_activity: new Date().toISOString()
          }
        });
      }, 300000); // 5 minutes
    };

    // Reset timer on user activity
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [user, logSession]);

  // Monitor for specific Rick-related issues
  useEffect(() => {
    if (!user || getUserType() !== 'rick') return;

    // Special monitoring for Rick's sessions
    const monitorRickIssues = () => {
      // Check for excessive DOM elements (potential memory leak)
      const domElementCount = document.querySelectorAll('*').length;
      if (domElementCount > 10000) {
        logSession({
          action_type: 'rick_issue',
          error_message: `Excessive DOM elements: ${domElementCount}`,
          details: {
            dom_element_count: domElementCount,
            threshold: 10000,
            page: window.location.pathname
          }
        });
      }

      // Check for excessive event listeners
      const eventListeners = (window as any).getEventListeners;
      if (eventListeners) {
        const listeners = eventListeners(document);
        const totalListeners = Object.values(listeners).reduce((acc: number, curr: any) => acc + curr.length, 0);
        
        if (totalListeners > 100) {
          logSession({
            action_type: 'rick_issue',
            error_message: `Excessive event listeners: ${totalListeners}`,
            details: {
              event_listener_count: totalListeners,
              threshold: 100,
              page: window.location.pathname
            }
          });
        }
      }

      // Check for infinite loops in console
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Maximum call stack size exceeded') || 
            message.includes('infinite loop') ||
            message.includes('too much recursion')) {
          logSession({
            action_type: 'rick_critical',
            error_message: `Infinite loop detected: ${message}`,
            details: {
              console_error: message,
              stack_trace: new Error().stack,
              page: window.location.pathname
            }
          });
        }
        originalConsoleError.apply(console, args);
      };
    };

    monitorRickIssues();
    
    // Monitor every 30 seconds for Rick
    const rickMonitorInterval = setInterval(monitorRickIssues, 30000);
    
    return () => {
      clearInterval(rickMonitorInterval);
      console.error = console.error; // Restore original
    };
  }, [user, getUserType, logSession]);

  // This component doesn't render anything
  return null;
}
