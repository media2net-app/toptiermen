'use client';

import { useEffect, useState } from 'react';
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

  // Check session health periodically
  useEffect(() => {
    if (!isAdmin) return;

    const checkSession = async () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const warningThreshold = 25 * 60 * 1000; // 25 minutes
      const criticalThreshold = 30 * 60 * 1000; // 30 minutes

      if (inactiveTime > criticalThreshold) {
        // Session is critical, try to refresh
        setIsRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.warn('Session refresh failed, user may need to re-authenticate');
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

    const interval = setInterval(checkSession, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity, isAdmin, refreshSession]);

  // Show session warning if needed
  if (sessionWarning && isAdmin) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">⚠️ Sessie Waarschuwing</h4>
            <p className="text-sm mt-1">Je bent al een tijd inactief. Klik ergens om je sessie te verlengen.</p>
          </div>
          <button
            onClick={() => setSessionWarning(false)}
            className="text-black hover:text-gray-700 ml-2"
          >
            ✕
          </button>
        </div>
        <button
          onClick={async () => {
            setIsRefreshing(true);
            try {
              await refreshSession();
              setSessionWarning(false);
            } catch (error) {
              console.error('Session refresh failed:', error);
            } finally {
              setIsRefreshing(false);
            }
          }}
          disabled={isRefreshing}
          className="mt-2 w-full bg-yellow-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
        >
          {isRefreshing ? 'Sessie vernieuwen...' : 'Sessie vernieuwen'}
        </button>
      </div>
    );
  }

  return null;
} 