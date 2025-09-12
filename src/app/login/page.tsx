'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Simplified configuration
const LOGIN_CONFIG = {
  redirectTimeout: 3000, // Reduced from 5000
  maxRetries: 2,
  defaultRedirect: '/dashboard'
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading, signIn, isAdmin } = useSupabaseAuth();
  const loading = false; // Force loading to false to prevent infinite loading screen
  
  // ✅ FIXED: Split complex state into separate useState hooks
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  // ✅ FIXED: Simplified admin detection
  const getRedirectPath = (user: any, profile: any, redirectTo?: string) => {
    if (redirectTo && redirectTo !== '/login') return redirectTo;
    
    const knownAdminEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu', 'admin@toptiermen.com', 'chiel@toptiermen.eu'];
    const isAdminByRole = profile?.role?.toLowerCase() === 'admin';
    const isAdminByEmail = user?.email && knownAdminEmails.includes(user.email);
    const isAdmin = isAdminByRole || isAdminByEmail;
    
    return isAdmin ? '/dashboard-admin' : LOGIN_CONFIG.defaultRedirect;
  };

  // ✅ FIXED: Single useEffect for client-side initialization
  useEffect(() => {
    setIsClient(true);
    
    // Handle logout status with improved messaging
    const logoutStatus = searchParams?.get('logout');
    if (logoutStatus === 'success') {
      setError('');
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
      setError('Er is een fout opgetreden bij het uitloggen. Je sessie is gewist, probeer opnieuw in te loggen.');
      console.log('⚠️ Logout error occurred, but session should be cleared');
      // Clean URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('logout');
        url.searchParams.delete('t');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams]);

  // ✅ FIXED: Single useEffect for authentication redirect
  useEffect(() => {
    if (loading || isLoading) return;

    if (user && !isLoading) {
      const redirectTo = searchParams?.get('redirect') || undefined;
      const targetPath = getRedirectPath(user, profile, redirectTo);
      
      // Quick redirect without complex timeout logic
      setTimeout(() => {
        router.replace(targetPath);
      }, 100);
    }
  }, [loading, user, profile, router, searchParams, isLoading]);

  // ✅ FIXED: Simplified login handler
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Vul alle velden in");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || "Ongeldige inloggegevens");
        setIsLoading(false);
        return;
      }

      // Success - let useEffect handle redirect
      setIsLoading(false);
      
    } catch (error: any) {
      setError(error.message || "Er is een fout opgetreden bij het inloggen");
      setIsLoading(false);
    }
  }

  // ✅ FIXED: Simplified forgot password handler
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setResetMessage("Vul een e-mailadres in");
      return;
    }

    setIsSendingReset(true);
    setResetMessage("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetMessage(data.error || "Fout bij het versturen van reset e-mail");
        return;
      }

      setResetMessage("Wachtwoord reset e-mail is verstuurd! Controleer je inbox.");
      setForgotPasswordEmail("");
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage("");
      }, 3000);

    } catch (error) {
      setResetMessage("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsSendingReset(false);
    }
  }

  // Hydration safety
  if (!isClient) {
    return (
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#B6C948] text-lg">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex items-center justify-center relative px-4 py-6 ${isLoading ? 'login-loading' : ''}`}
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
        
        {/* ✅ FIXED: Simplified debug info - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-[#181F17] border border-[#B6C948] rounded-lg text-xs">
            <p className="text-[#B6C948] font-bold mb-2">🔧 Debug Info:</p>
            <p className="text-[#8BAE5A]">Loading: {loading ? '✅' : '❌'}</p>
            <p className="text-[#8BAE5A]">User: {user ? '✅' : '❌'}</p>
            <p className="text-[#8BAE5A]">Error: {error || 'None'}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree ${isLoading ? 'cursor-wait opacity-75' : 'cursor-text'}`}
              placeholder="E-mailadres"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree ${isLoading ? 'cursor-wait opacity-75' : 'cursor-text'}`}
              placeholder="Wachtwoord"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B6C948] hover:text-white transition-colors focus:outline-none focus:text-white"
              disabled={isLoading}
              aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
            >
              {showPassword ? (
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
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#B6C948] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#B6C948] focus:ring-2"
                disabled={isLoading}
              />
              <span className="ml-2 text-[#B6C948] text-sm font-figtree">Ingelogd blijven</span>
            </label>
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className={`text-[#8BAE5A] hover:text-[#B6C948] text-sm underline font-figtree ${isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
              disabled={isLoading}
            >
              Wachtwoord vergeten?
            </button>
          </div>
          
          {error && (
            <div className="text-[#B6C948] text-center text-sm -mt-4 border border-[#B6C948] rounded-lg py-2 px-3 bg-[#181F17] font-figtree">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className={`w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#3A4D23] text-[#181F17] font-semibold text-base sm:text-lg shadow-lg hover:from-[#B6C948] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] font-figtree ${
              isLoading
                ? 'opacity-75 cursor-wait' 
                : (!email || !password) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
            }`}
          >
            {isLoading ? (
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
                className={`w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded text-sm font-medium hover:bg-[#4A5D33] transition-colors ${isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
                disabled={isLoading}
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

      {/* ✅ FIXED: Simplified forgot password modal */}
      {showForgotPassword && (
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
                  value={forgotPasswordEmail}
                  onChange={e => setForgotPasswordEmail(e.target.value)}
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="Voer je e-mailadres in"
                  required
                  disabled={isSendingReset}
                />
              </div>
            </form>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setResetMessage("");
                }}
                disabled={isSendingReset}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isSendingReset || !forgotPasswordEmail}
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingReset ? (
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