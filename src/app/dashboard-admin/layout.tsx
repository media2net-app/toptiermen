'use client';

import { useState, useEffect } from 'react';
import { DebugProvider } from '@/contexts/DebugContext';
import AdminLayoutClient from './AdminLayoutClient';
import AdminErrorBoundary from '@/components/AdminErrorBoundary';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for admin dashboard stats
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <DebugProvider>
      <AdminErrorBoundary>
        <AdminLayoutClient isLoading={isLoading}>{children}</AdminLayoutClient>
      </AdminErrorBoundary>
    </DebugProvider>
  );
} 