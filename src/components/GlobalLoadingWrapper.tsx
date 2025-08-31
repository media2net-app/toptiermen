'use client';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import PlatformLoading from './PlatformLoading';

interface GlobalLoadingWrapperProps {
  children: React.ReactNode;
}

export default function GlobalLoadingWrapper({ children }: GlobalLoadingWrapperProps) {
  const { loading } = useSupabaseAuth();

  // Show loading screen while authentication is being checked
  if (loading) {
    return <PlatformLoading message="Platform laden..." />;
  }

  return <>{children}</>;
}
