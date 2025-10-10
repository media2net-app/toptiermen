import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Activity Heartbeat Hook
 * Updates user's last_active timestamp every 30 seconds
 * This makes them show as "online" in the Live Tracking dashboard
 */
export function useActivityHeartbeat(userId: string | undefined) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Update immediately on mount
    updateLastActive(userId);

    // Then update every 30 seconds
    intervalRef.current = setInterval(() => {
      updateLastActive(userId);
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId]);

  async function updateLastActive(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('[Heartbeat] Failed to update last_active:', error);
      } else {
        console.log('[Heartbeat] Updated last_active for user:', userId.substring(0, 8));
      }
    } catch (err) {
      console.error('[Heartbeat] Error:', err);
    }
  }
}

