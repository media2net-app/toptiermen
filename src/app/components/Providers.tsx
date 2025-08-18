'use client';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { DebugProvider } from '@/contexts/DebugContext';
import SessionLogger from '@/components/SessionLogger';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <DebugProvider>
        <SessionLogger />
        {children}
      </DebugProvider>
    </SupabaseAuthProvider>
  );
} 