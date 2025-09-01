'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/auth-systems/optimal/useAuth';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
// import { useCacheBuster } from '@/components/CacheBuster'; - DISABLED TO PREVENT LOGOUT

// Auth configuration constants
const AUTH_CONFIG = {
  redirectTimeout: 5000,
  checkInterval: 500,
  maxRedirectAttempts: 10,
  defaultRedirect: '/dashboard'
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, signIn, isAdmin } = useAuth();
  // const { bustCache } = useCacheBuster(); - DISABLED TO PREVENT LOGOUT
  
  // Consolidated state management
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
    rememberMe: false,
    error: "",
    isLoading: false,
    redirecting: false,
    isClient: false,
    // Forgot password states
    showForgotPassword: false,
    forgotPasswordEmail: "",
    isSendingReset: false,
    resetMessage: ""
  });

  // Helper function to update specific state properties
  const updateLoginState = (updates: Partial<typeof loginState>) => {
    setLoginState(prev => ({ ...prev, ...updates }));
  };

  // Helper function to get redirect path
  const getRedirectPath = (user: any, profile: any, redirectTo?: string) => {
    if (redirectTo && redirectTo !== '/login') return redirectTo;
    
    const role = profile?.role || (user as any)?.user_metadata?.role || '';
    return role.toLowerCase() === 'admin' ? '/dashboard-admin' : AUTH_CONFIG.defaultRedirect;
  };

  useEffect(() => { 
    // 2.0.3: Client-side hydration safety
    updateLoginState({ isClient: true });
    
    // 2.0.1: Simplified initialization
    console.log('🔍 Login page initialized');
    console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Supabase Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Check for logout status and reset loading state
    const logoutStatus = searchParams?.get('logout');
    if (logoutStatus === 'success') {
      console.log('✅ Logout successful, resetting login state');
      updateLoginState({ isLoading: false, error: '' });
    } else if (logoutStatus === 'error') {
      console.log('❌ Logout had errors, resetting login state');
      updateLoginState({ isLoading: false, error: 'Er is een fout opgetreden bij het uitloggen. Probeer opnieuw in te loggen.' });
    }
    
    // Check Supabase status on page load
    checkSupabaseStatus();
  }, [searchParams]);

  const checkSupabaseStatus = async () => {
    try {
      const response = await fetch('/api/check-supabase-status');
      const data = await response.json();
      
      if (data.status === 'unhealthy') {
        console.log('2.0.1: Supabase unhealthy, redirecting to maintenance');
        router.push('/login/maintenance');
      }
    } catch (error) {
      console.log('2.0.1: Could not check Supabase status:', error);
    }
  };

  // Check if user is already authenticated - Redirect immediately when user exists
  useEffect(() => {
    if (loading) return;

    // Redirect as soon as we have a user (don't wait for profile)
    if (user && !loginState.redirecting) {
      updateLoginState({ redirecting: true });

      const redirectTo = searchParams?.get('redirect') || undefined;
      const targetPath = getRedirectPath(user, profile, redirectTo);

      router.replace(targetPath);
    }
  }, [loading, user, profile, router, searchParams, loginState.redirecting]);

  // 2.0.1: Force show login form after 2 seconds if still loading - DISABLED TO FIX FLICKERING
  // useEffect(() => {
  //   if (loading) {
  //     const timer = setTimeout(() => {
  //       console.log('2.0.1: Force showing login form after timeout');
  //       updateLoginState({ redirecting: false });
  //     }, 2000);
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [loading]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!loginState.email || !loginState.password) {
      updateLoginState({ error: "Vul alle velden in" });
      return;
    }

    if (loginState.isLoading) return;

    updateLoginState({ isLoading: true, error: "" });
    
    try {
      const result = await signIn(loginState.email, loginState.password);

      if (!result.success) {
        updateLoginState({ 
          error: result.error || "Ongeldige inloggegevens",
          isLoading: false 
        });
        return;
      }

      updateLoginState({ redirecting: true, isLoading: false });
      
      // Fallback redirect timeout
      const redirectTimeout = setTimeout(() => {
        router.replace(AUTH_CONFIG.defaultRedirect);
      }, AUTH_CONFIG.redirectTimeout);
      
      return () => clearTimeout(redirectTimeout);
      
    } catch (error: any) {
      updateLoginState({ 
        error: error.message || "Er is een fout opgetreden bij het inloggen",
        isLoading: false 
      });
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (!loginState.forgotPasswordEmail) {
      updateLoginState({ resetMessage: "Vul een e-mailadres in" });
      return;
    }

    updateLoginState({ isSendingReset: true });
    updateLoginState({ resetMessage: "" });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginState.forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        updateLoginState({ resetMessage: data.error || "Fout bij het versturen van reset e-mail" });
        return;
      }

      updateLoginState({ resetMessage: "Wachtwoord reset e-mail is verstuurd! Controleer je inbox." });
      updateLoginState({ forgotPasswordEmail: "" });
      
      // Close modal after 3 seconds
      setTimeout(() => {
        updateLoginState({ showForgotPassword: false });
        updateLoginState({ resetMessage: "" });
      }, 3000);

    } catch (error) {
      console.error('2.0.1: Forgot password error:', error);
      updateLoginState({ resetMessage: "Er is een fout opgetreden. Probeer het opnieuw." });
    } finally {
      updateLoginState({ isSendingReset: false });
    }
  }

  // Hydration safety - prevent hydration errors
  if (!loginState.isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
          <p className="text-[#B6C948] text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication (with timeout) - DISABLED TO FIX FLICKERING
  // if (loading && !loginState.redirecting) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
  //       <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
  //       <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
  //           <p className="text-[#B6C948] text-lg">Laden...</p>
  //           <p className="text-[#8BAE5A] text-sm mt-2">Authenticatie wordt gecontroleerd</p>
  //           <button
  //             onClick={() => window.location.reload()}
  //             className="mt-4 text-[#8BAE5A] hover:text-[#B6C948] underline text-sm"
  //           >
  //             Handmatig herladen als het te lang duurt
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Show redirecting state - DISABLED TO FIX FLICKERING
  // if (loginState.redirecting) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
  //       <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
  //       <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
  //           <p className="text-[#B6C948] text-lg">Doorsturen naar dashboard...</p>
  //           <p className="text-[#8BAE5A] text-sm mt-2">Je wordt automatisch doorgestuurd</p>
  //           <button
  //             onClick={() => window.location.reload()}
  //             className="mt-4 text-[#8BAE5A] hover:text-[#B6C948] underline text-sm"
  //           >
  //             Handmatig herladen als het te lang duurt
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div 
      className={`min-h-screen flex items-center justify-center relative px-4 py-6 ${loginState.isLoading ? 'login-loading' : ''}`}
      style={{ backgroundColor: '#181F17' }}
    >
      <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
      
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
        <div className="flex justify-center mb-4">
          <img 
            src="/logo_white-full.svg" 
            alt="Top Tier Men Logo" 
            className="h-16 sm:h-20 md:h-24 w-auto"
          />
        </div>

        <p className="text-[#B6C948] text-center mb-6 sm:mb-8 text-base sm:text-lg font-figtree">Log in op je dashboard</p>
        
        {/* Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-[#181F17] border border-[#B6C948] rounded-lg text-xs">
            <p className="text-[#B6C948] font-bold mb-2">🔧 Debug Info:</p>
            <p className="text-[#8BAE5A]">Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</p>
            <p className="text-[#8BAE5A]">Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</p>
            <p className="text-[#8BAE5A]">Loading: {loading ? '✅' : '❌'}</p>
            <p className="text-[#8BAE5A]">User: {user ? '✅' : '❌'}</p>
            <p className="text-[#8BAE5A]">Error: {loginState.error || 'None'}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={loginState.email}
              onChange={e => updateLoginState({ email: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree ${loginState.isLoading ? 'cursor-wait opacity-75' : 'cursor-text'}`}
              placeholder="E-mailadres"
              autoComplete="email"
              required
              disabled={loginState.isLoading}
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={loginState.password}
              onChange={e => updateLoginState({ password: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree ${loginState.isLoading ? 'cursor-wait opacity-75' : 'cursor-text'}`}
              placeholder="Wachtwoord"
              autoComplete="current-password"
              required
              disabled={loginState.isLoading}
            />
          </div>
          
          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={loginState.rememberMe}
                onChange={e => updateLoginState({ rememberMe: e.target.checked })}
                className="w-4 h-4 text-[#B6C948] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#B6C948] focus:ring-2"
                disabled={loginState.isLoading}
              />
              <span className="ml-2 text-[#B6C948] text-sm font-figtree">Ingelogd blijven</span>
            </label>
            
            <button
              type="button"
              onClick={() => updateLoginState({ showForgotPassword: true })}
              className={`text-[#8BAE5A] hover:text-[#B6C948] text-sm underline font-figtree ${loginState.isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
              disabled={loginState.isLoading}
            >
              Wachtwoord vergeten?
            </button>
          </div>
          {loginState.error && (
            <div className="text-[#B6C948] text-center text-sm -mt-4 border border-[#B6C948] rounded-lg py-2 px-3 bg-[#181F17] font-figtree">
              {loginState.error}
            </div>
          )}
          <button
            type="submit"
            disabled={loginState.isLoading || !loginState.email || !loginState.password}
            className={`w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#3A4D23] text-[#181F17] font-semibold text-base sm:text-lg shadow-lg hover:from-[#B6C948] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] font-figtree ${
              loginState.isLoading 
                ? 'opacity-75 cursor-wait' 
                : (!loginState.email || !loginState.password) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
            }`}
          >
            {loginState.isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17] mr-2"></div>
                <span>Inloggen...</span>
              </div>
            ) : (
              "Inloggen"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-[#B6C948] text-sm font-figtree">
            Nog geen account?{" "}
            <a href="/prelaunch" className="text-[#8BAE5A] hover:text-white transition-colors font-semibold">
              Registreer hier
            </a>
          </p>
          
          {/* Cache Busting Section */}
          <div className="mt-4 pt-2 border-t border-[#3A4D23]/30">
            <div className="mb-3 p-3 bg-[#181F17] rounded-lg border border-[#3A4D23]">
              <p className="text-[#8BAE5A] text-xs mb-2 text-center">Problemen met inloggen?</p>
              <button
                onClick={() => {
                  console.log('🔄 Manual cache busting: DISABLED to prevent logout issues');
                  // bustCache(); - DISABLED TO PREVENT LOGOUT
                }}
                className={`w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded text-sm font-medium hover:bg-[#4A5D33] transition-colors ${loginState.isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
                disabled={loginState.isLoading}
              >
                🔄 Cache Verversen & Herladen
              </button>
            </div>
            
            {/* Version badge - 2.0.1 */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#B6C948] text-xs">Platform</span>
              <span className="px-2 py-1 bg-[#B6C948]/20 text-[#B6C948] text-xs font-semibold rounded-full border border-[#B6C948]/30">
                3.0.0
              </span>
              <span className="text-[#B6C948] text-xs">Stable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {loginState.showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-8 max-w-md w-full mx-4 border border-[#3A4D23]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Wachtwoord Vergeten</h3>
              <p className="text-[#8BAE5A] text-sm">
                Voer je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
              </p>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-4 mb-6">
              {loginState.resetMessage && (
                <div className={`text-center text-sm rounded-lg py-2 px-3 font-figtree ${
                  loginState.resetMessage.includes('verstuurd') 
                    ? 'text-green-400 border border-green-500/20 bg-green-500/10' 
                    : 'text-[#B6C948] border border-[#B6C948] bg-[#181F17]'
                }`}>
                  {loginState.resetMessage}
                </div>
              )}
                
              <div>
                <label className="block text-[#B6C948] font-medium mb-2">
                  E-mailadres
                </label>
                <input
                  type="email"
                  value={loginState.forgotPasswordEmail}
                  onChange={e => updateLoginState({ forgotPasswordEmail: e.target.value })}
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="Voer je e-mailadres in"
                  required
                  disabled={loginState.isSendingReset}
                />
              </div>
            </form>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  updateLoginState({ showForgotPassword: false });
                  updateLoginState({ forgotPasswordEmail: "" });
                  updateLoginState({ resetMessage: "" });
                }}
                disabled={loginState.isSendingReset}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={loginState.isSendingReset || !loginState.forgotPasswordEmail}
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginState.isSendingReset ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
                    Versturen...
                  </div>
                ) : (
                  'Reset E-mail Versturen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto"></div>
            <p className="text-[#8BAE5A] mt-4">Laden...</p>
          </div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
} 