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
      console.log('🔍 GlobalSessionMonitor: Logging session data:', data);
      
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
        console.error('❌ GlobalSessionMonitor: Failed to log session:', response.statusText);
        const errorText = await response.text();
        console.error('❌ GlobalSessionMonitor: Error response:', errorText);
      } else {
        console.log('✅ GlobalSessionMonitor: Session logged successfully');
      }
    } catch (error) {
      console.error('❌ GlobalSessionMonitor: Error logging session:', error);
    }
  }, [user, getUserType]);

  // Detect loops (same page loaded multiple times quickly)
  const detectLoops = useCallback((currentPage: string) => {
    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime.current;
    
    if (currentPage === lastPage.current && timeSinceLastLog < 5000) {
      loopDetectionCount.current++;
      
      if (loopDetectionCount.current > 3) {
        console.log('🔄 GlobalSessionMonitor: Loop detected!', {
          page: currentPage,
          count: loopDetectionCount.current,
          timeSinceLastLog
        });
        
        logSession({
          action_type: 'loop_detected',
          error_message: `Loop detected: ${loopDetectionCount.current} times on ${currentPage}`,
          loop_detected: true,
          details: {
            loop_count: loopDetectionCount.current,
            page: currentPage,
            time_since_last: timeSinceLastLog
          }
        });
      }
    } else {
      loopDetectionCount.current = 0;
    }
    
    lastPage.current = currentPage;
    lastLogTime.current = now;
  }, [logSession]);

  // Monitor page loads
  useEffect(() => {
    if (!user) {
      console.log('🔍 GlobalSessionMonitor: No user, skipping session logging');
      return;
    }

    console.log('🚀 GlobalSessionMonitor: Starting session monitoring for user:', user.email);
    pageLoadCount.current++;

    // Log initial page load
    logSession({
      action_type: 'page_load',
      details: {
        page_load_count: pageLoadCount.current,
        session_duration: Date.now() - sessionStartTime.current,
        user_type: getUserType()
      }
    });

    // Detect loops
    detectLoops(window.location.pathname);

  }, [user, logSession, detectLoops]);

  // Monitor navigation changes using pathname changes
  useEffect(() => {
    if (!user) return;

    const currentPage = window.location.pathname;
    const previousPage = lastPage.current;
    
    if (previousPage && previousPage !== currentPage) {
      console.log('🔄 GlobalSessionMonitor: Navigation detected:', { from: previousPage, to: currentPage });
      
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
      console.log('❌ GlobalSessionMonitor: Error detected:', event.message);
      
      logSession({
        action_type: 'error',
        error_message: event.message,
        details: {
          error_count: errorCount.current,
          error_type: 'javascript_error',
          error_stack: event.error?.stack,
          page: window.location.pathname
        }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorCount.current++;
      console.log('❌ GlobalSessionMonitor: Unhandled rejection detected:', event.reason);
      
      logSession({
        action_type: 'error',
        error_message: event.reason?.toString() || 'Unhandled promise rejection',
        details: {
          error_count: errorCount.current,
          error_type: 'unhandled_rejection',
          page: window.location.pathname
        }
      });
    };

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

    const checkPerformance = () => {
      const now = Date.now();
      const loadTime = now - sessionStartTime.current;
      
      if (loadTime > 10000) { // 10 seconds
        console.log('🐌 GlobalSessionMonitor: Slow page load detected:', loadTime + 'ms');
        
        logSession({
          action_type: 'performance_issue',
          error_message: `Slow page load: ${loadTime}ms`,
          details: {
            load_time: loadTime,
            threshold: 10000,
            page: window.location.pathname
          }
        });
      }
    };

    // Check performance after 5 seconds
    const performanceTimer = setTimeout(checkPerformance, 5000);

    return () => clearTimeout(performanceTimer);
  }, [user, logSession]);

  // Monitor for stuck sessions (inactivity)
  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastLogTime.current;
      
      if (timeSinceLastActivity > 300000) { // 5 minutes
        console.log('⏰ GlobalSessionMonitor: Inactivity detected:', timeSinceLastActivity + 'ms');
        
        logSession({
          action_type: 'session_timeout',
          error_message: `Session timeout: ${timeSinceLastActivity}ms of inactivity`,
          details: {
            inactivity_duration: timeSinceLastActivity,
            threshold: 300000,
            page: window.location.pathname
          }
        });
      }
    };

    // Check every minute
    const inactivityTimer = setInterval(checkInactivity, 60000);

    return () => clearInterval(inactivityTimer);
  }, [user, logSession]);

  // Rick-specific monitoring
  useEffect(() => {
    if (!user || getUserType() !== 'rick') return;

    console.log('🔍 GlobalSessionMonitor: Rick-specific monitoring enabled');

    // Monitor for excessive DOM elements
    const checkDOMSize = () => {
      const elementCount = document.querySelectorAll('*').length;
      
      if (elementCount > 1000) {
        console.log('🏗️ GlobalSessionMonitor: Large DOM detected:', elementCount + ' elements');
        
        logSession({
          action_type: 'rick_issue',
          error_message: `Large DOM: ${elementCount} elements`,
          details: {
            dom_element_count: elementCount,
            threshold: 1000,
            page: window.location.pathname
          }
        });
      }
    };

    // Monitor for memory issues
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        if (usedMB > 100) { // 100MB
          console.log('💾 GlobalSessionMonitor: High memory usage detected:', usedMB.toFixed(2) + 'MB');
          
          logSession({
            action_type: 'rick_issue',
            error_message: `High memory usage: ${usedMB.toFixed(2)}MB`,
            details: {
              memory_usage_mb: usedMB,
              threshold: 100,
              page: window.location.pathname
            }
          });
        }
      }
    };

    // Event listener monitoring removed for build compatibility

    // Check for infinite loops in console
    const originalConsoleError = console.error;
    let errorCount = 0;
    
    console.error = function(...args) {
      errorCount++;
      originalConsoleError.apply(console, args);
      
      if (errorCount > 10) {
        console.log('🔄 GlobalSessionMonitor: Excessive console errors detected:', errorCount);
        
        logSession({
          action_type: 'rick_critical',
          error_message: `Excessive console errors: ${errorCount}`,
          details: {
            console_error_count: errorCount,
            threshold: 10,
            page: window.location.pathname
          }
        });
      }
    };

    // Run checks every 30 seconds
    const rickTimer = setInterval(() => {
      checkDOMSize();
      checkMemory();
    }, 30000);

    return () => {
      clearInterval(rickTimer);
      console.error = originalConsoleError;
    };
  }, [user, getUserType, logSession]);

  // This component doesn't render anything
  return null;
}
