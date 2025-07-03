'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { DebugProvider } from '@/contexts/DebugContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DebugProvider>
        {children}
      </DebugProvider>
    </AuthProvider>
  );
} 