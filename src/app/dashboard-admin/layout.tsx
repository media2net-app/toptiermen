'use client';

import { DebugProvider } from '@/contexts/DebugContext';
import AdminLayoutClient from './AdminLayoutClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DebugProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </DebugProvider>
  );
} 