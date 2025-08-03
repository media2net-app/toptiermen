'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useSupabaseAuth } from "../../contexts/SupabaseAuthContext";

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Fallback auth state in case AuthContext fails
  const fallbackAuth = {
    isAuthenticated: false,
    user: null,
    loading: false,
    initialized: true, // Force initialized to true
    signIn: async () => ({ success: false, error: 'Auth system unavailable' }),
    signUp: async () => ({ success: false, error: 'Auth system unavailable' }),
    signOut: async () => {},
    updateUser: async () => {},
    clearAllCache: () => {},
    redirectAdminToDashboard: false
  };
  
  let authContext;
  try {
    authContext = useSupabaseAuth();
  } catch (error) {
    console.error('AuthContext error:', error);
    authContext = fallbackAuth;
  }
  
  const { signIn, user, loading: authLoading } = authContext;
  const isAuthenticated = !!user;
  const initialized = !authLoading;
  
  // Force initialization after a short delay if not initialized
  useEffect(() => {
    if (!initialized && mounted) {
      const timer = setTimeout(() => {
        console.log('🔧 Force initializing auth context...');
        // This will trigger a re-render and hopefully initialize the context
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialized, mounted]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Login Debug:', {
      mounted,
      initialized,
      authLoading,
      isAuthenticated,
      user: user?.email,
      redirecting,
      signIn: typeof signIn,
      authContext: authContext ? 'available' : 'fallback'
    });
  }, [mounted, initialized, authLoading, isAuthenticated, user, redirecting, signIn, authContext]);

  useEffect(() => {
    // Redirect if user is authenticated, regardless of initialization state
    if (!authLoading && isAuthenticated && user && mounted && !redirecting) {
      console.log('🔀 Primary redirect triggered for user:', user.role);
      setRedirecting(true);
      const targetPath = user.role?.toLowerCase() === 'admin' ? '/dashboard-admin' : '/dashboard';
      console.log('🔀 Redirecting to:', targetPath);
      // Use replace instead of push to prevent back button issues
      router.replace(targetPath);
    }
  }, [isAuthenticated, user, router, authLoading, mounted, redirecting]);

  // Additional redirect effect for when authLoading changes
  useEffect(() => {
    if (isAuthenticated && user && !authLoading && !redirecting) {
      console.log('🔀 Auth loading finished, redirecting user:', user.role);
      setRedirecting(true);
      const targetPath = user.role?.toLowerCase() === 'admin' ? '/dashboard-admin' : '/dashboard';
      console.log('🔀 Redirecting to:', targetPath);
      router.replace(targetPath);
    }
  }, [authLoading, isAuthenticated, user, router, redirecting]);

  // Debug effect to track redirect conditions
  useEffect(() => {
    console.log('🔍 Redirect conditions:', {
      isAuthenticated,
      user: user?.email,
      userRole: user?.role,
      authLoading,
      redirecting,
      mounted
    });
  }, [isAuthenticated, user, authLoading, redirecting, mounted]);

  // Show loading only briefly, then force show login form
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#B6C948] text-lg">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log('🔍 Login attempt started');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('AuthContext state:', { initialized, authLoading, isAuthenticated });
    
    if (!email || !password) {
      setError("Vul alle velden in");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      console.log('🔍 Calling signIn function...');
      const result = await signIn(email, password);
      console.log('🔍 SignIn result:', result);
      
      if (!result.success) {
        console.log('🔍 Login failed:', result.error);
        setError(result.error || "Ongeldige inloggegevens");
        setIsLoading(false);
      } else {
        console.log('🔍 Login successful, waiting for redirect...');
        // If successful, keep loading state until redirect happens
        // The redirect will be handled by the useEffect above
        
        // Fallback redirect after 2 seconds if normal redirect doesn't work
        setTimeout(() => {
          if (isAuthenticated && user && !redirecting) {
            console.log('🔀 Fallback redirect triggered for user:', user.role);
            setRedirecting(true);
            const targetPath = user.role?.toLowerCase() === 'admin' ? '/dashboard-admin' : '/dashboard';
            console.log('🔀 Fallback redirecting to:', targetPath);
            router.replace(targetPath);
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error('🔍 Login error:', error);
      setError(error.message || "Er is een fout opgetreden bij het inloggen");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
      <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
      

      
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight mb-2 text-center">
          <span className="text-white">TOP TIER </span>
          <span className="text-[#8BAE5A]">MEN</span>
        </h1>
        <p className="text-[#8BAE5A] text-center mb-6 sm:mb-8 text-base sm:text-lg font-figtree">Log in op je dashboard</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree"
              placeholder="E-mailadres"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree"
              placeholder="Wachtwoord"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-[#B6C948] text-center text-sm -mt-4 border border-[#B6C948] rounded-lg py-2 px-3 bg-[#181F17] font-figtree">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className={`w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#3A4D23] text-[#181F17] font-semibold text-base sm:text-lg shadow-lg hover:from-[#B6C948] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] font-figtree ${(isLoading || !email || !password) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17] mr-2"></div>
                Inloggen...
              </div>
            ) : (
              'Inloggen'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/register')}
            disabled={isLoading || authLoading}
            className="w-full mt-2 py-3 sm:py-4 rounded-xl border border-[#B6C948] text-[#B6C948] font-semibold text-base sm:text-lg hover:bg-[#B6C948] hover:text-[#181F17] transition-all duration-200 font-figtree disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Nog geen account? Registreren
          </button>
        </form>
      </div>
    </div>
  );
} 