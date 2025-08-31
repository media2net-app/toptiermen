'use client';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { DebugProvider } from '@/contexts/DebugContext';
// import SessionLogger from '@/components/SessionLogger';
// import { GlobalSessionMonitor } from '@/components/GlobalSessionMonitor';
// import { CacheManager } from '@/components/CacheManager';
// import { CacheTestPanel } from '@/components/CacheTestPanel';
// import { PerformanceMonitor } from '@/components/PerformanceMonitor';
// import { PerformanceTestPanel } from '@/components/PerformanceTestPanel';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <DebugProvider>
        {/* All monitoring components disabled to prevent infinite loops */}
        {children}
      </DebugProvider>
    </SupabaseAuthProvider>
  );
} 