'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SessionMonitorProps {
  isAdmin?: boolean;
}

export default function SessionMonitor({ isAdmin = false }: SessionMonitorProps) {
  const { user, refreshSession } = useSupabaseAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionWarning, setSessionWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      setSessionWarning(false);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Check session health periodically with extended timeouts
  useEffect(() => {
    if (!isAdmin) return;

    const checkSession = async () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const warningThreshold = 45 * 60 * 1000; // 45 minutes (increased from 25)
      const criticalThreshold = 55 * 60 * 1000; // 55 minutes (increased from 30)

      if (inactiveTime > criticalThreshold) {
        // Session is critical, try to refresh
        setIsRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.warn('Session refresh failed, user may need to re-authenticate');
            // Don't force logout immediately, give user a chance to interact
          }
        } catch (error) {
          console.error('Session refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      } else if (inactiveTime > warningThreshold) {
        setSessionWarning(true);
      }
    };

    const interval = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes (increased from 1)

    return () => clearInterval(interval);
  }, [lastActivity, isAdmin, refreshSession]);

  // Show session warning if needed
  if (sessionWarning && isAdmin) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Sessie verloopt binnenkort</h3>
            <p className="text-xs mt-1">
              Je sessie verloopt binnenkort. Klik ergens om je sessie te verlengen.
            </p>
          </div>
          <button
            onClick={() => setSessionWarning(false)}
            className="flex-shrink-0 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Show refreshing indicator
  if (isRefreshing && isAdmin) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Sessie verlengen...</span>
        </div>
      </div>
    );
  }

  return null;
} 