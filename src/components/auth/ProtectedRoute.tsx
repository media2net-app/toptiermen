// 🛡️ UNIFIED PROTECTED ROUTE - Uses Optimal Auth System
// Consistent route protection across the platform

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth-systems/optimal/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/login',
  fallback 
}: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    if (!isAuthenticated) {
      console.log('🚫 User not authenticated, redirecting to login');
      const currentPath = window.location.pathname;
      const redirectUrl = redirectTo.includes('?') 
        ? `${redirectTo}&redirect=${encodeURIComponent(currentPath)}`
        : `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      
      router.push(redirectUrl);
      return;
    }

    if (requireAdmin && !isAdmin) {
      console.log('🚫 Admin access required, user role:', profile?.role);
      router.push('/dashboard'); // Redirect non-admin users to regular dashboard
      return;
    }

    console.log('✅ Route access granted');
  }, [loading, isAuthenticated, isAdmin, requireAdmin, router, redirectTo, profile?.role]);

  // Show loading state while checking auth
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
          <p className="text-[#B6C948] text-lg">Authenticatie controleren...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or authorized
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
