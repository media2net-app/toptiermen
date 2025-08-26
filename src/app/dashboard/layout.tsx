'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useV2State } from '@/contexts/V2StateContext';
import { useV2Monitoring } from '@/lib/v2-monitoring';
import { useV2ErrorRecovery } from '@/lib/v2-error-recovery';
import { useV2Cache } from '@/lib/v2-cache-strategy';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PushNotificationPrompt from '@/components/PushNotificationPrompt';
import DashboardContent from './DashboardContent';

// V2.0: Enhanced Dashboard Layout with monitoring and error handling
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, signOut } = useSupabaseAuth();
  const { 
    setUserProfile, 
    addNotification, 
    setLoadingState,
    recordPageLoadTime,
    setGlobalError,
    clearAllErrors 
  } = useV2State();
  const { trackPageLoad, trackSessionStart, trackFeatureUsage } = useV2Monitoring();
  const { handleError } = useV2ErrorRecovery();
  const { set, clear } = useV2Cache();

  // V2.0: Track page load performance
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      trackPageLoad('/dashboard', loadTime);
      recordPageLoadTime('/dashboard', loadTime);
    };
  }, [trackPageLoad, recordPageLoadTime]);

  // V2.0: Enhanced authentication check with error recovery
  useEffect(() => {
    if (loading) {
      setLoadingState('auth-check', true);
      return;
    }

    setLoadingState('auth-check', false);

    if (!user) {
      addNotification({
        type: 'warning',
        message: 'Je bent niet ingelogd. Je wordt doorgestuurd naar de login pagina.',
        read: false
      });
      
      handleError(
        () => Promise.resolve(),
        'User not authenticated',
        'auth',
        undefined,
        'dashboard-auth'
      );
      
      router.push('/login');
      return;
    }

    // V2.0: Track successful session
    trackSessionStart(user.id);
    trackFeatureUsage('dashboard-access', user.id);
    
    // V2.0: Cache user profile
    handleError(
      async () => {
        setUserProfile(user);
        await set('user-profile', user, 'user-profile');
        addNotification({
          type: 'success',
          message: `Welkom terug, ${user.full_name || user.email}!`,
          read: false
        });
      },
      'Failed to load user profile',
      'database',
      undefined,
      'user-profile'
    );

  }, [user, loading, router, setUserProfile, addNotification, setLoadingState, trackSessionStart, trackFeatureUsage, set, handleError]);

  // V2.0: Handle authentication errors
  useEffect(() => {
    const handleAuthError = (error: any) => {
      console.error('V2.0: Auth error in dashboard:', error);
      setGlobalError('Er is een probleem met je authenticatie. Probeer opnieuw in te loggen.');
      
      handleError(
        async () => {
          await signOut();
          router.push('/login');
        },
        'Authentication error recovery',
        'auth',
        undefined,
        'auth-recovery'
      );
    };

    // Listen for auth errors
    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [setGlobalError, handleError, signOut, router]);

  // V2.0: Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllErrors();
      clear();
    };
  }, [clearAllErrors, clear]);

  // V2.0: Show loading state
  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-[#8BAE5A]">Dashboard wordt geladen...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // V2.0: Show authentication required
  if (!user) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Authenticatie Vereist</h2>
            <p className="text-[#8BAE5A] text-sm mb-4">
              Je moet ingelogd zijn om toegang te krijgen tot het dashboard.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors"
            >
              Inloggen
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // V2.0: Main dashboard layout with error boundary
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#181F17]">
        {/* V2.0: Push notification prompt */}
        <PushNotificationPrompt />
        
        {/* V2.0: Main content with existing dashboard structure */}
        <DashboardContent>
          {children}
        </DashboardContent>
      </div>
    </ErrorBoundary>
  );
} 