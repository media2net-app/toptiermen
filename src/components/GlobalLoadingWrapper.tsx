'use client';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import PlatformLoading from './PlatformLoading';

interface GlobalLoadingWrapperProps {
  children: React.ReactNode;
}

export default function GlobalLoadingWrapper({ children }: GlobalLoadingWrapperProps) {
  const { loading, user } = useSupabaseAuth();

  // Show loading screen while authentication is being checked - DISABLED TO FIX LOADING ISSUE
  // if (loading && !user) {
  //   return <PlatformLoading message="Platform laden..." />;
  // }

  // CRITICAL FIX: Don't show loading if user is available
  if (loading && user) {
    console.log('User available but still loading, proceeding anyway');
  }

  // FORCE DEPLOYMENT: Loading screen completely disabled for Rick's access
  return <>{children}</>;
}
