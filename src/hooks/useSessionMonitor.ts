import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SessionStatus {
  isHealthy: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const useSessionMonitor = () => {
  const { user } = useSupabaseAuth();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isHealthy: true,
    lastChecked: null,
    error: null
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  const checkSessionHealth = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/auth/session-health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      setSessionStatus({
        isHealthy: data.healthy,
        lastChecked: new Date(),
        error: data.error || null
      });

      return data.healthy;
    } catch (error) {
      console.error('Session health check failed:', error);
      setSessionStatus({
        isHealthy: false,
        lastChecked: new Date(),
        error: 'Network error'
      });
      return false;
    }
  }, [user]);

  const startMonitoring = useCallback(() => {
    if (!user || isMonitoring) return;

    setIsMonitoring(true);
    
    // Check immediately
    checkSessionHealth();
    
    // Check every 2 minutes (no visibilitychange listener to prevent focus-refresh side effects)
    const interval = setInterval(checkSessionHealth, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [user, isMonitoring, checkSessionHealth]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Auto-start monitoring when user is available
  useEffect(() => {
    if (user && !isMonitoring) {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [user, isMonitoring, startMonitoring]);

  return {
    sessionStatus,
    checkSessionHealth,
    startMonitoring,
    stopMonitoring,
    isMonitoring
  };
};
