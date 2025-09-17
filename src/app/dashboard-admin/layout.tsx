'use client';

import { DebugProvider } from '@/contexts/DebugContext';
import { AdminImpersonationProvider } from '@/contexts/AdminImpersonationContext';
import AdminLayoutClient from './AdminLayoutClient';
import AdminErrorBoundary from '@/components/AdminErrorBoundary';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DebugProvider>
      <AdminImpersonationProvider>
        <AdminErrorBoundary>
          <AdminLayoutClient>{children}</AdminLayoutClient>
        </AdminErrorBoundary>
      </AdminImpersonationProvider>
    </DebugProvider>
  );
} 