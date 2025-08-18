'use client';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { DebugProvider } from '@/contexts/DebugContext';
import SessionLogger from '@/components/SessionLogger';
import { GlobalSessionMonitor } from '@/components/GlobalSessionMonitor';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <DebugProvider>
        <SessionLogger />
        <GlobalSessionMonitor />
        {children}
      </DebugProvider>
    </SupabaseAuthProvider>
  );
} 