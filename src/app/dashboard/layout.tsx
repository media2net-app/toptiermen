'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
// import { useV2State } from '@/contexts/V2StateContext';
// import { useV2Monitoring } from '@/lib/v2-monitoring';
// import { useV2ErrorRecovery } from '@/lib/v2-error-recovery';
// import { useV2Cache } from '@/lib/v2-cache-strategy';
import { DebugProvider } from '@/contexts/DebugContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import DashboardContent from './DashboardContent';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useSupabaseAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authTimeout, setAuthTimeout] = useState(false);

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

  // 2.0.1: Enhanced authentication check with error recovery - DISABLED
  useEffect(() => {
    if (loading) {
      // setLoadingState('auth-check', true);
      
      // Add timeout for auth loading
      const timeoutId = setTimeout(() => {
        console.warn('Auth loading timeout - proceeding anyway');
        setAuthTimeout(true);
      }, 5000); // 5 second timeout for auth

      return () => clearTimeout(timeoutId);
    }

    // setLoadingState('auth-check', false);
    setAuthTimeout(false);

    if (!user) {
      // addNotification({
      //   type: 'warning',
      //   message: 'Je bent niet ingelogd. Je wordt doorgestuurd naar de login pagina.',
      //   read: false
      // });
      
      // handleError(
      //   () => Promise.resolve(),
      //   'User not authenticated',
      //   'auth',
      //   undefined,
      //   'dashboard-auth'
      // );
      
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
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
  }, [user, loading, router]);

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

  // Show loading state - DISABLED TO FIX LOADING ISSUE
  // if (loading && !user && !authTimeout) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
  //         <p className="text-[#B6C948] text-lg">Laden...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // CRITICAL FIX: Don't show loading if user is already available
  if (loading && user) {
    console.log('User available but still loading, proceeding anyway');
  }

  // Show auth timeout message
  if (loading && authTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] flex items-center justify-center">
        <div className="text-center w-full max-w-md">
          <div className="bg-[#1F2D17] rounded-lg p-8 border border-[#8BAE5A]">
            <div className="text-[#8BAE5A] text-4xl mb-4">🔐</div>
            <h2 className="text-white text-xl font-bold mb-4">Authenticatie Timeout</h2>
            <p className="text-[#B6C948] text-sm mb-6">
              Het inloggen duurt langer dan verwacht. Je wordt doorgestuurd naar de login pagina.
            </p>
            <button 
              onClick={() => router.push('/login')} 
              className="bg-[#8BAE5A] text-[#141A15] px-6 py-3 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors"
            >
              Naar login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <ErrorBoundary>
      <DebugProvider>
        <DashboardContent>
          {children}
        </DashboardContent>
      </DebugProvider>
    </ErrorBoundary>
  );
} 