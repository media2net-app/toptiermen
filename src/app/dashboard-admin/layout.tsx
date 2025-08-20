'use client';

import { DebugProvider } from '@/contexts/DebugContext';
import AdminLayoutClient from './AdminLayoutClient';
import AdminErrorBoundary from '@/components/AdminErrorBoundary';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DebugProvider>
      <AdminErrorBoundary>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </AdminErrorBoundary>
    </DebugProvider>
  );
} 