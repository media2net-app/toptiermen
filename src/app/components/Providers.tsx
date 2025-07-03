'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { DebugProvider } from '@/contexts/DebugContext';
import DebugPanel from '@/components/DebugPanel';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DebugProvider>
        {children}
        <DebugPanel />
      </DebugProvider>
    </AuthProvider>
  );
} 