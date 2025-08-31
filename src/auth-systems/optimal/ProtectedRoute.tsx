// 🛡️ OPTIMAL PROTECTED ROUTE - Simple, Reliable Route Protection

'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireLid?: boolean;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireLid = false,
  redirectTo = '/login',
  loadingComponent
}: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin, isLid } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        console.log('🛡️ Protected Route: No user, redirecting to', redirectTo);
        router.push(redirectTo);
        return;
      }

      // Check admin requirement
      if (requireAdmin && !isAdmin) {
        console.log('🛡️ Protected Route: Admin required, user is not admin');
        router.push('/unauthorized');
        return;
      }

      // Check lid requirement  
      if (requireLid && !isLid && !isAdmin) {
        console.log('🛡️ Protected Route: Lid access required, user does not have access');
        router.push('/unauthorized');
        return;
      }

      console.log('✅ Protected Route: Access granted');
    }
  }, [user, profile, loading, requireAdmin, requireLid, isAdmin, isLid, redirectTo, router]);

  // Show loading while checking auth
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!user) {
    return null;
  }

  // Check authorization after authentication
  if (requireAdmin && !isAdmin) {
    return null;
  }

  if (requireLid && !isLid && !isAdmin) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

// Convenience components for common use cases
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAdmin'>) {
  return (
    <ProtectedRoute requireAdmin={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function LidRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireLid'>) {
  return (
    <ProtectedRoute requireLid={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}
