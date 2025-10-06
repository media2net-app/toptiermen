'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
// import { useV2State } from '@/contexts/V2StateContext';
// import { useV2Monitoring } from '@/lib/v2-monitoring';
// import { useV2ErrorRecovery } from '@/lib/v2-error-recovery';
// import { useV2Cache } from '@/lib/v2-cache-strategy';
import { DebugProvider } from '@/contexts/DebugContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SessionRecovery } from '@/components/SessionRecovery';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';
import DashboardContent from './DashboardContent';

// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);

  // 2.0.1: All 2.0.1 functionality DISABLED to prevent crashes
  // const {
  //   addNotification, 
  //   setLoadingState,
  //   recordPageLoadTime,
  //   setGlobalError,
  //   clearAllErrors 
  // } = useV2State();
  // const { trackPageLoad, trackSessionStart, trackFeatureUsage } = useV2Monitoring();
  // const { handleError } = useV2ErrorRecovery();
  // const { set, clear } = useV2Cache();

  // 2.0.1: Track page load performance - DISABLED
  // useEffect(() => {
  //   const startTime = performance.now();
    
  //   return () => {
  //     const loadTime = performance.now() - startTime;
  //     trackPageLoad('/dashboard', loadTime);
  //     recordPageLoadTime('/dashboard', loadTime);
  //   };
  // }, [trackPageLoad, recordPageLoadTime]);

  // 2.0.1: Enhanced authentication check with error recovery - IMPROVED TO PREVENT LOOPS
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    // Wait for auth to complete before making any decisions
    if (isLoading) {
      if (process.env.NEXT_PUBLIC_DEBUG === '1') {
        console.log('⏳ Auth still loading, waiting...');
      }
      return;
    }
    
    // Only redirect if we're absolutely sure the user is not authenticated
    // Add a small delay to prevent immediate redirects on refresh
    if (!user) {
      if (process.env.NEXT_PUBLIC_DEBUG === '1') {
        console.log('🚫 User not authenticated after loading complete, redirecting to login');
      }
      
      // Prevent redirect loops by checking current path and adding delay
      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          router.push('/login');
        }, 100); // Small delay to prevent immediate redirects
      }
      return;
    }
    
    if (process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.log('✅ User authenticated:', user.email);
    }

    // 2.0.1: Track successful session - DISABLED
    // trackSessionStart(user.id);
    // trackFeatureUsage('dashboard-access', user.id);
    
    // 2.0.1: Cache user profile - DISABLED
    // handleError(
    //   async () => {
    //     setUserProfile(user);
    //     await set('user-profile', user, 'user-profile');
    //     addNotification({
    //       type: 'success',
    //       message: `Welkom terug, ${user.full_name || user.email}!`,
    //       read: false
    //     });
    //   },
    //   'Failed to load user profile',
    //   'database',
    //   undefined,
    //   'user-profile'
    // );

    // Simple user profile set
    setUserProfile(user);

  }, [user, isLoading, router, setUserProfile]);

  // 2.0.1: Handle authentication errors - DISABLED
  // useEffect(() => {
  //   const handleAuthError = (error: any) => {
  //     console.error('2.0.1: Auth error in dashboard:', error);
  //     setGlobalError('Er is een probleem met je authenticatie. Probeer opnieuw in te loggen.');
      
  //     handleError(
  //       async () => {
  //         await signOut();
  //         router.push('/login');
  //       },
  //       'Authentication error recovery',
  //       'auth',
  //       undefined,
  //       'auth-recovery'
  //     );
  //   };

  //   // Listen for auth errors
  //   window.addEventListener('auth-error', handleAuthError);
    
  //   return () => {
  //     window.removeEventListener('auth-error', handleAuthError);
  //   };
  // }, [setGlobalError, handleError, signOut, router]);

  // 2.0.1: Cleanup on unmount - DISABLED
  // useEffect(() => {
  //   return () => {
  //     clear();
  //     clearAllErrors();
  //   };
  // }, [clear, clearAllErrors]);

  // Show loading state - DISABLED TO FIX RICK'S DASHBOARD ACCESS
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
  //         <p className="text-[#B6C948] text-lg">Laden...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Show error state if no user - DISABLED TO FIX CONTENT RENDERING
  // if (!user) {
  //   return null; // Will redirect to login
  // }

  return (
    <ErrorBoundary>
      <DebugProvider>
        {/* TEMPORARILY DISABLED: <SessionRecovery> */}
        {/* <SessionTimeoutWarning timeoutMinutes={30} warningMinutes={5} /> */}
        <DashboardContent>
          {children}
        </DashboardContent>
        {/* </SessionRecovery> */}
      </DebugProvider>
    </ErrorBoundary>
  );
} 