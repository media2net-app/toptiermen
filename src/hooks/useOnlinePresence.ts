import { useEffect, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const HEARTBEAT_INTERVAL = 30000; // Update every 30 seconds
const INACTIVITY_TIMEOUT = 60000; // Mark offline after 1 minute of inactivity

export function useOnlinePresence() {
  const { user } = useSupabaseAuth();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isOnlineRef = useRef<boolean>(false);

  // Update online status in database
  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/chat/online-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          isOnline 
        })
      });

      if (!response.ok) {
        console.error('Failed to update online status');
      } else {
        isOnlineRef.current = isOnline;
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  // Mark user as online
  const markOnline = () => {
    lastActivityRef.current = Date.now();
    if (!isOnlineRef.current) {
      updateOnlineStatus(true);
    }
  };

  // Mark user as offline
  const markOffline = () => {
    if (isOnlineRef.current) {
      updateOnlineStatus(false);
    }
  };

  // Handle user activity
  const handleActivity = () => {
    lastActivityRef.current = Date.now();
    markOnline();

    // Reset inactivity timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      markOffline();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (!user?.id) return;

    // Mark user as online immediately
    markOnline();

    // Set up heartbeat to keep status updated
    heartbeatIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // If user has been inactive for too long, mark as offline
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        markOffline();
      } else {
        // Send heartbeat to keep online status fresh
        updateOnlineStatus(true);
      }
    }, HEARTBEAT_INTERVAL);

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Handle page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        markOffline();
      } else {
        markOnline();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page unload/close
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline signal on page close
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ 
          userId: user.id, 
          isOnline: false 
        })], { type: 'application/json' });
        navigator.sendBeacon('/api/chat/online-status', blob);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Mark user as offline when component unmounts
      markOffline();
    };
  }, [user?.id]);

  return {
    isOnline: isOnlineRef.current
  };
}








