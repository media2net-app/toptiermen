'use client';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { DebugProvider } from '@/contexts/DebugContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <DebugProvider>
        {children}
      </DebugProvider>
    </SupabaseAuthProvider>
  );
} 