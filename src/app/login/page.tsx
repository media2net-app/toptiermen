'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Simplified configuration
const LOGIN_CONFIG = {
  redirectTimeout: 3000, // Reduced from 5000
  maxRetries: 2,
  defaultRedirect: '/dashboard'
};

function LoginPageContent() {
  const router = useRouter();
  const { user, profile, login, isAdmin, getRedirectPath } = useAuth();
  
  // ✅ FIX: Completely remove loading states to prevent hydration mismatch
  
  // ✅ PHASE 1: Simplified state management - Single state object
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
    isLoading: false,
    error: "",
    showPassword: false,
    rememberMe: false,
    showLoadingOverlay: false,
    loadingProgress: 0,
    loadingText: "",
    isRedirecting: false
  });

  // ✅ FIX: Removed isClient logic to prevent hydration mismatch
  
  // Ref to prevent multiple redirects
  const redirectExecuted = useRef(false);
  
  
  // ✅ PHASE 1: Simplified loading system - Progress-based instead of time-based
  const startLoadingSequence = () => {
    console.log('🎬 Starting loading sequence...');
    setLoginState(prev => ({
      ...prev,
      showLoadingOverlay: true,
      isRedirecting: true,
      loadingProgress: 0,
      loadingText: "Inloggen..."
    }));
    
    // Auto-progress for redirect scenarios
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        setLoginState(prev => ({
          ...prev,
          loadingProgress: progress,
          loadingText: progress < 30 ? "Inloggen..." : 
                      progress < 60 ? "Profiel laden..." :
                      progress < 90 ? "Sessie voorbereiden..." : "Welkom terug!"
        }));
      } else {
        clearInterval(interval);
      }
    }, 200);
    
    // Cleanup interval after 5 seconds
    setTimeout(() => clearInterval(interval), 5000);
  };
  
  const updateLoadingProgress = (progress: number, text: string) => {
    setLoginState(prev => ({
      ...prev,
      loadingProgress: progress,
      loadingText: text
    }));
  };
  
  // ✅ PHASE 1: Simplified forgot password state
  const [forgotPasswordState, setForgotPasswordState] = useState({
    showForgotPassword: false,
    email: "",
    isSendingReset: false
  });
  const [resetMessage, setResetMessage] = useState("");

  // ✅ FIX: Removed isClient logic to prevent hydration mismatch

  // ✅ FIX: Removed isClient logic to prevent hydration mismatch


  // ✅ FIXED: Single useEffect for logout status handling
  useEffect(() => {
    // Handle logout status with improved messaging
    const urlParams = new URLSearchParams(window.location.search);
    const logoutStatus = urlParams.get('logout');
    if (logoutStatus === 'success') {
      setLoginState(prev => ({ ...prev, error: '' }));
      // Show success message briefly
      console.log('✅ Logout successful, ready for new login');
      // Clean URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('logout');
        url.searchParams.delete('t');
        window.history.replaceState({}, '', url.toString());
      }
    } else if (logoutStatus === 'error') {
      setLoginState(prev => ({ ...prev, error: 'Er is een fout opgetreden bij het uitloggen. Je sessie is gewist, probeer opnieuw in te loggen.' }));
      console.log('⚠️ Logout error occurred, but session should be cleared');
      // Clean URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('logout');
        url.searchParams.delete('t');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  // ✅ FIXED: Single useEffect for authentication redirect with better loading handling
  useEffect(() => {
    console.log('🔄 Redirect useEffect triggered:', { 
      user: user?.email, 
      profile: profile?.full_name, 
      isLoading: loginState.isLoading, 
      isRedirecting: loginState.isRedirecting 
    });

    // Don't redirect while form is submitting
    if (loginState.isLoading) {
      console.log('⏳ Form still loading, waiting...', { isLoading: loginState.isLoading });
      return;
    }

    // Only redirect if we have a confirmed authenticated user and not already executed
    if (user && !loginState.isLoading && !redirectExecuted.current) {
      console.log('✅ User authenticated, starting redirect process...', { email: user.email, profile: profile?.full_name });
      
      // Mark redirect as executed to prevent multiple redirects
      redirectExecuted.current = true;
      
      // Determine redirect path - use fallback if getRedirectPath fails
      let targetPath = '/dashboard'; // Default fallback
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || undefined;
        targetPath = getRedirectPath(redirectTo);
        console.log('🎯 Target path determined:', targetPath);
      } catch (error) {
        console.warn('⚠️ getRedirectPath failed, using fallback:', error);
        // Use admin dashboard for admin users, regular dashboard for others
        targetPath = isAdmin ? '/dashboard-admin' : '/dashboard';
      }
      
      // Don't start loading sequence again if already showing (from login)
      if (!loginState.showLoadingOverlay) {
        console.log('🎬 Starting redirect loading sequence...');
        startLoadingSequence();
      } else {
        console.log('🎬 Loading overlay already showing from login');
      }
      
      // Execute redirect after loading sequence has time to show
      setTimeout(() => {
        console.log('🚀 Executing redirect to:', targetPath);
        router.replace(targetPath);
      }, 300); // Reduced time for faster redirect
      
      // Fallback redirect if the first one doesn't work
      setTimeout(() => {
        if (redirectExecuted.current && loginState.showLoadingOverlay) {
          console.log('🔄 Fallback redirect - forcing navigation to:', targetPath);
          window.location.href = targetPath;
        }
      }, 1000); // Fallback after 1 second
    } else if (!user) {
      console.log('ℹ️ No authenticated user found, staying on login page');
    } else {
      console.log('⏸️ Redirect conditions not met:', { 
        hasUser: !!user, 
        isLoading: loginState.isLoading
      });
    }
  }, [user, profile, router, loginState.isLoading]); // Updated dependencies

  // ✅ NEW: Hide overlay when URL changes (user has been redirected)
  useEffect(() => {
    const handleRouteChange = () => {
      if (loginState.isRedirecting && loginState.showLoadingOverlay) {
        console.log('🔄 Route changed, hiding loading overlay');
        setLoginState(prev => ({ 
          ...prev, 
          showLoadingOverlay: false, 
          isRedirecting: false 
        }));
        // Reset redirect executed flag for future logins
        redirectExecuted.current = false;
      }
    };
    
    // Emergency fallback: hide overlay after 5 seconds
    const emergencyTimeout = setTimeout(() => {
      if (loginState.showLoadingOverlay && loginState.isRedirecting) {
        console.log('🚨 Emergency fallback: hiding stuck loading overlay');
        setLoginState(prev => ({ 
          ...prev, 
          showLoadingOverlay: false, 
          isRedirecting: false 
        }));
        redirectExecuted.current = false;
      }
    }, 5000);
    
    return () => clearTimeout(emergencyTimeout);

    // Listen for route changes
    const originalPush = router.push;
    const originalReplace = router.replace;
    
    router.push = (...args) => {
      handleRouteChange();
      return originalPush.apply(router, args);
    };
    
    router.replace = (...args) => {
      handleRouteChange();
      return originalReplace.apply(router, args);
    };

    // Also listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [loginState.isRedirecting, loginState.showLoadingOverlay, router]);

  // ✅ PHASE 1: Enhanced login handler with simplified state management
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    // Reset redirecting state for new login attempt
    setLoginState(prev => ({ ...prev, isRedirecting: false }));
    redirectExecuted.current = false;
    
    console.log('🚀 Login form submitted');
    console.log('📧 Email:', loginState.email);
    console.log('🔑 Password length:', loginState.password.length);
    console.log('⏳ IsLoading:', loginState.isLoading);
    
    if (!loginState.email || !loginState.password) {
      setLoginState(prev => ({ ...prev, error: "Vul alle velden in" }));
      console.log('❌ Validation failed: missing email or password');
      return;
    }

    if (loginState.isLoading) {
      console.log('❌ Already loading, ignoring request');
      return;
    }

    setLoginState(prev => ({ ...prev, isLoading: true, error: "" }));
    
    // Show loading overlay immediately when login starts
    console.log('🎬 Starting login loading sequence...');
    startLoadingSequence();
    
    try {
      console.log('🔐 Calling signIn function...');
      const result = await login(loginState.email, loginState.password, updateLoadingProgress);
      console.log('📋 SignIn result:', result);

      if (!result.success) {
        console.error('❌ Login failed:', result.error);
        setLoginState(prev => ({
          ...prev,
          error: result.error || "Ongeldige inloggegevens",
          isLoading: false,
          showLoadingOverlay: false
        }));
        return;
      }
      
      console.log('✅ Login successful, waiting for redirect...');

      console.log('✅ Login successful, redirecting...');
      // Success - immediately reset loading state and let useEffect handle redirect
      setLoginState(prev => ({ 
        ...prev, 
        isLoading: false,
        isRedirecting: true 
      }));
      
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      setLoginState(prev => ({
        ...prev,
        error: error.message || "Er is een fout opgetreden bij het inloggen",
        isLoading: false,
        showLoadingOverlay: false
      }));
    }
  }

  // ✅ FIXED: Simplified forgot password handler
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (!forgotPasswordState.email) {
      setResetMessage("Vul een e-mailadres in");
      return;
    }

    setForgotPasswordState(prev => ({ ...prev, isSendingReset: true }));
    setResetMessage("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordState.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetMessage(data.error || "Fout bij het versturen van reset e-mail");
        return;
      }

      setResetMessage("Wachtwoord reset e-mail is verstuurd! Controleer je inbox.");
      setForgotPasswordState(prev => ({ ...prev, email: "" }));
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setForgotPasswordState(prev => ({ ...prev, showForgotPassword: false }));
        setResetMessage("");
      }, 3000);

    } catch (error) {
      setResetMessage("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setForgotPasswordState(prev => ({ ...prev, isSendingReset: false }));
    }
  }

  // ✅ FIX: Always show login form - no loading states
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative px-4 py-6"
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
        
        {/* ✅ FIXED: Enhanced debug info - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-[#181F17] border border-[#B6C948] rounded-lg text-xs">
            <p className="text-[#B6C948] font-bold mb-2">🔧 Debug Info:</p>
            <p className="text-[#8BAE5A]">User: {user ? '✅' : '❌'}</p>
            <p className="text-[#8BAE5A]">Email: {loginState.email || 'Empty'}</p>
            <p className="text-[#8BAE5A]">Password Length: {loginState.password.length}</p>
            <p className="text-[#8BAE5A]">Error: {loginState.error || 'None'}</p>
            <button
              type="button"
              onClick={() => {
                console.log('🔧 Filling test credentials...');
                setLoginState(prev => ({
                  ...prev,
                  email: 'chiel@media2net.nl',
                  password: 'Test123!',
                  error: ''
                }));
                console.log('✅ Test credentials filled');
              }}
              className="mt-2 px-2 py-1 bg-[#8BAE5A] text-[#181F17] rounded text-xs cursor-pointer hover:bg-[#7A9E4A] transition-colors"
            >
              Fill Test Credentials
            </button>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={loginState.email}
              onChange={e => setLoginState(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree ${loginState.isLoading || loginState.showLoadingOverlay ? 'cursor-wait opacity-75' : 'cursor-text'}`}
              placeholder="E-mailadres"
              autoComplete="email"
              required
              disabled={loginState.isLoading || loginState.showLoadingOverlay}
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={loginState.showPassword ? "text" : "password"}
              value={loginState.password}
              onChange={e => setLoginState(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full pl-10 pr-12 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree ${loginState.isLoading || loginState.showLoadingOverlay ? 'cursor-wait opacity-75' : 'cursor-text'}`}
              placeholder="Wachtwoord"
              autoComplete="current-password"
              required
              disabled={loginState.isLoading || loginState.showLoadingOverlay}
            />
            <button
              type="button"
              onClick={() => setLoginState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B6C948] hover:text-white transition-colors focus:outline-none focus:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loginState.isLoading || loginState.showLoadingOverlay}
              aria-label={loginState.showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
            >
              {loginState.showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={loginState.rememberMe}
                onChange={e => setLoginState(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="w-4 h-4 text-[#B6C948] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#B6C948] focus:ring-2"
                disabled={loginState.isLoading || loginState.showLoadingOverlay}
              />
              <span className="ml-2 text-[#B6C948] text-sm font-figtree">Ingelogd blijven</span>
            </label>
            
            <button
              type="button"
              onClick={() => setForgotPasswordState(prev => ({ ...prev, showForgotPassword: true }))}
              className={`text-[#8BAE5A] hover:text-[#B6C948] text-sm underline font-figtree ${loginState.isLoading || loginState.showLoadingOverlay ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
              disabled={loginState.isLoading || loginState.showLoadingOverlay}
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
            disabled={loginState.isLoading || loginState.showLoadingOverlay}
            className={`w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#3A4D23] text-[#181F17] font-semibold text-base sm:text-lg shadow-lg hover:from-[#B6C948] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] font-figtree ${
              loginState.isLoading || loginState.showLoadingOverlay
                ? 'opacity-75 cursor-wait' 
                : 'cursor-pointer hover:opacity-90'
            }`}
          >
            {loginState.isLoading || loginState.showLoadingOverlay ? (
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
          
          {/* ✅ FIXED: Simplified cache busting - no aggressive clearing */}
          <div className="mt-4 pt-2 border-t border-[#3A4D23]/30">
            <div className="mb-3 p-3 bg-[#181F17] rounded-lg border border-[#3A4D23]">
              <p className="text-[#8BAE5A] text-xs mb-2 text-center">Problemen met inloggen?</p>
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh');
                  window.location.reload();
                }}
                className={`w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded text-sm font-medium hover:bg-[#4A5D33] transition-colors ${loginState.isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
                disabled={loginState.isLoading}
              >
                🔄 Pagina Verversen
              </button>
            </div>
            
            {/* Version badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#B6C948] text-xs">Platform</span>
              <span className="px-2 py-1 bg-[#B6C948]/20 text-[#B6C948] text-xs font-semibold rounded-full border border-[#B6C948]/30">
                3.1
              </span>
              <span className="text-[#B6C948] text-xs">Improved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loginState.showLoadingOverlay && (
        <div className="fixed inset-0 bg-[#181F17]/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/logo_white-full.svg" 
                alt="Top Tier Men Logo" 
                className="h-20 w-auto mx-auto opacity-90"
              />
            </div>
            
            {/* Loading Spinner */}
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3A4D23] border-t-[#8BAE5A] mx-auto"></div>
            </div>
            
            {/* Loading Text with Fade Animation */}
            <div className="mb-4">
              <p className="text-[#8BAE5A] text-xl font-semibold animate-pulse">
                {loginState.loadingText}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-64 mx-auto mb-4">
              <div className="w-full bg-[#3A4D23] rounded-full h-2">
                <div 
                  className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loginState.loadingProgress}%` }}
                />
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* ✅ FIXED: Simplified forgot password modal */}
      {forgotPasswordState.showForgotPassword && (
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
              {resetMessage && (
                <div className={`text-center text-sm rounded-lg py-2 px-3 font-figtree ${
                  resetMessage.includes('verstuurd') 
                    ? 'text-green-400 border border-green-500/20 bg-green-500/10' 
                    : 'text-[#B6C948] border border-[#B6C948] bg-[#181F17]'
                }`}>
                  {resetMessage}
                </div>
              )}
                
              <div>
                <label className="block text-[#B6C948] font-medium mb-2">
                  E-mailadres
                </label>
                <input
                  type="email"
                  value={forgotPasswordState.email}
                  onChange={e => setForgotPasswordState(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="Voer je e-mailadres in"
                  required
                  disabled={forgotPasswordState.isSendingReset}
                />
              </div>
            </form>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setForgotPasswordState(prev => ({ ...prev, showForgotPassword: false, email: "" }));
                  setResetMessage("");
                }}
                disabled={forgotPasswordState.isSendingReset}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={forgotPasswordState.isSendingReset || !forgotPasswordState.email}
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotPasswordState.isSendingReset ? (
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
          <div className="flex justify-center mb-4">
            <img 
              src="/logo_white-full.svg" 
              alt="Top Tier Men Logo" 
              className="h-16 sm:h-20 md:h-24 w-auto"
            />
          </div>
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