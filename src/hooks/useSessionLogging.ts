import { useEffect, useRef, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SessionLogData {
  user_id: string;
  user_email: string;
  current_page: string;
  user_agent: string;
  action_type: 'page_load' | 'navigation' | 'error' | 'cache_hit' | 'loop_detected';
  error_message?: string;
  cache_hit?: boolean;
  loop_detected?: boolean;
}

export function useSessionLogging() {
  const { user } = useSupabaseAuth();
  const pageLoadCount = useRef(0);
  const lastPage = useRef<string>('');
  const loopDetectionCount = useRef(0);
  const errorCount = useRef(0);
  const lastLogTime = useRef<number>(0);

  const logSession = useCallback(async (data: SessionLogData) => {
    if (!user) return;

    try {
      const response = await fetch('/api/admin/session-logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ip_address: undefined, // Will be detected by server
        }),
      });

      if (!response.ok) {
        console.error('Failed to log session:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging session:', error);
    }
  }, [user]);

  // Detect loops (same page loaded multiple times quickly)
  const detectLoops = useCallback((currentPage: string) => {
    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime.current;
    
    if (currentPage === lastPage.current && timeSinceLastLog < 5000) {
      loopDetectionCount.current++;
      
      if (loopDetectionCount.current > 3) {
        logSession({
          user_id: user?.id || '',
          user_email: user?.email || '',
          current_page: currentPage,
          user_agent: navigator.userAgent,
          action_type: 'loop_detected',
          loop_detected: true,
        });
      }
    } else {
      loopDetectionCount.current = 0;
    }
    
    lastPage.current = currentPage;
    lastLogTime.current = now;
  }, [logSession, user]);

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

  // Log page loads
  useEffect(() => {
    if (!user) return;

    const currentPage = window.location.pathname;
    pageLoadCount.current++;

    // Detect potential loops
    detectLoops(currentPage);

    // Log the page load with enhanced user type detection
    const userType = getUserType();
    logSession({
      user_id: user.id,
      user_email: user.email || '',
      current_page: currentPage,
      user_agent: navigator.userAgent,
      action_type: 'page_load',
      cache_hit: false, // We'll implement cache detection later
      // user_type: userType, // Add user type for filtering - removed for build compatibility
    });

  }, [user, logSession, detectLoops]);

  // Log navigation events using pathname changes
  useEffect(() => {
    if (!user) return;

    const currentPage = window.location.pathname;
    const previousPage = lastPage.current;
    
    if (previousPage && previousPage !== currentPage) {
      logSession({
        user_id: user.id,
        user_email: user.email || '',
        current_page: currentPage,
        user_agent: navigator.userAgent,
        action_type: 'navigation',
      });
    }
    
    lastPage.current = currentPage;
  }, [user, logSession]);

  // Log errors
  useEffect(() => {
    if (!user) return;

    const handleError = (event: ErrorEvent) => {
      errorCount.current++;
      
      logSession({
        user_id: user.id,
        user_email: user.email || '',
        current_page: window.location.pathname,
        user_agent: navigator.userAgent,
        action_type: 'error',
        error_message: event.message,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorCount.current++;
      
      logSession({
        user_id: user.id,
        user_email: user.email || '',
        current_page: window.location.pathname,
        user_agent: navigator.userAgent,
        action_type: 'error',
        error_message: event.reason?.toString() || 'Unhandled promise rejection',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [user, logSession]);

  // Log cache hits (simplified detection)
  const logCacheHit = useCallback(() => {
    if (!user) return;

    logSession({
      user_id: user.id,
      user_email: user.email || '',
      current_page: window.location.pathname,
      user_agent: navigator.userAgent,
      action_type: 'cache_hit',
      cache_hit: true,
    });
  }, [user, logSession]);

  // Log manual loop detection
  const logLoopDetection = useCallback(() => {
    if (!user) return;

    logSession({
      user_id: user.id,
      user_email: user.email || '',
      current_page: window.location.pathname,
      user_agent: navigator.userAgent,
      action_type: 'loop_detected',
      loop_detected: true,
    });
  }, [user, logSession]);

  return {
    logCacheHit,
    logLoopDetection,
    pageLoadCount: pageLoadCount.current,
    loopDetectionCount: loopDetectionCount.current,
    errorCount: errorCount.current,
  };
}
