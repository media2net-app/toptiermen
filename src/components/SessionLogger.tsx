'use client';

import { useSessionLogging } from '@/hooks/useSessionLogging';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function SessionLogger() {
  const { user } = useSupabaseAuth();
  const { logCacheHit, logLoopDetection, pageLoadCount, loopDetectionCount, errorCount } = useSessionLogging();

  // This component doesn't render anything, it just handles session logging
  return null;
}
