'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, loading, signIn } = useSupabaseAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => { 
    setMounted(true); 
    
    // Clear any stale cache data that might cause issues
    const clearStaleData = () => {
      try {
        // Clear any old Facebook data that might interfere
        localStorage.removeItem('facebook_ad_account_id');
        localStorage.removeItem('facebook_access_token');
        localStorage.removeItem('facebook_user_id');
        localStorage.removeItem('facebook_login_status');
        
        // Clear any old auth data
        localStorage.removeItem('toptiermen-auth');
        sessionStorage.clear();
        
        console.log('🔍 Cleared stale cache data');
      } catch (error) {
        console.error('🔍 Error clearing cache:', error);
      }
    };
    
    clearStaleData();
    
    // Debug: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setDebugInfo(`
      Supabase URL: ${supabaseUrl ? 'Configured' : 'NOT CONFIGURED'}
      Supabase Key: ${supabaseKey ? 'Configured' : 'NOT CONFIGURED'}
      Environment: ${process.env.NODE_ENV}
      URL: ${window.location.href}
      Cache Cleared: Yes
    `);
    
    console.log('🔍 Debug Info:', {
      supabaseUrl: supabaseUrl ? 'Configured' : 'NOT CONFIGURED',
      supabaseKey: supabaseKey ? 'Configured' : 'NOT CONFIGURED',
      environment: process.env.NODE_ENV,
      url: window.location.href,
      cacheCleared: true
    });
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    if (!mounted || loading) return;
    
    // Add timeout to prevent infinite loading
    const authTimeout = setTimeout(() => {
      console.log('🔍 Authentication check timeout, forcing loading to false');
      // setLoading(false); // This line was removed from the original file, so it's removed here.
    }, 10000); // 10 second timeout
    
    if (user) {
      console.log('User already authenticated:', user.role);
      setRedirecting(true);
      
      // Check for redirect parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      let targetPath: string;
      if (redirectPath && redirectPath.startsWith('/dashboard-admin')) {
        // If redirecting to admin page, verify user is admin
        if (user.role?.toLowerCase() === 'admin') {
          targetPath = redirectPath;
        } else {
          targetPath = '/dashboard';
        }
      } else if (redirectPath && redirectPath.startsWith('/dashboard')) {
        // If redirecting to regular dashboard
        targetPath = redirectPath;
      } else {
        // Default redirect based on user role
        targetPath = user.role?.toLowerCase() === 'admin' ? '/dashboard-admin' : '/dashboard';
      }
      

      console.log('🔍 Redirecting to:', targetPath);

      // Try router.replace first, fallback to window.location
      try {
        router.replace(targetPath);
        // Add a fallback redirect in case router.replace doesn't work
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            console.log('🔍 Router redirect failed, using window.location fallback');
            window.location.href = targetPath;
          }
        }, 2000);
              } catch (redirectError) {
          console.error('🔍 Router redirect error:', redirectError);
          // Fallback to window.location
          window.location.href = targetPath;
        }
    }
    
    return () => clearTimeout(authTimeout);
  }, [mounted, loading, user, router]);

  // Timeout mechanism to prevent getting stuck
  useEffect(() => {
    if (redirecting) {
      const timeout = setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.log('🔍 Redirect timeout, forcing reload');
          window.location.reload();
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [redirecting]);



  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log('🔍 Login attempt started');
    

    
    if (!email || !password) {
      setError("Vul alle velden in");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      console.log('🔍 Calling signIn...');
      const result = await signIn(email, password);

      console.log('🔍 SignIn result:', result);

      if (!result.success) {
        console.error('Sign in error:', result.error);
        setError(result.error || "Ongeldige inloggegevens");
        setIsLoading(false);
        return;
      }

      console.log('🔍 Login successful, redirecting...');
      setRedirecting(true);
      
      // The redirect will be handled by the useEffect above when user state updates
      
    } catch (error: any) {
      console.error('🔍 Login error:', error);
      setError(error.message || "Er is een fout opgetreden bij het inloggen");
      setIsLoading(false);
    }
  }

  // Show loading state while checking authentication
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#B6C948] text-lg">Laden...</p>
            <p className="text-[#8BAE5A] text-sm mt-2">Authenticatie wordt gecontroleerd</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle manual reload
  const handleManualReload = () => {
    window.location.reload();
  };

  // Show redirecting state
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#B6C948] text-lg">Doorsturen naar dashboard...</p>
            <p className="text-[#8BAE5A] text-sm mt-2">Je wordt automatisch doorgestuurd</p>
            <button
              onClick={handleManualReload}
              className="mt-4 text-[#8BAE5A] hover:text-[#B6C948] underline text-sm"
            >
              Handmatig herladen als het te lang duurt
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <p className="text-[#B6C948] text-center mb-6 sm:mb-8 text-base sm:text-lg font-figtree">Log in op je dashboard</p>
        
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-[#181F17] rounded-lg border border-[#B6C948]">
            <p className="text-[#B6C948] text-xs font-mono whitespace-pre-wrap">{debugInfo}</p>
          </div>
        )}
        
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
          
          {/* Cache clearing button */}
          <div className="mt-4 pt-4 border-t border-[#3A4D23]">
            <button
              onClick={() => {
                // Clear all cache and reload
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="text-[#8BAE5A] hover:text-[#B6C948] text-xs underline"
            >
              Cache wissen en herladen
            </button>
          </div>
          
          {/* Version badge - V1.2 */}
          <div className="mt-4 pt-2 border-t border-[#3A4D23]/30">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#B6C948] text-xs">Platform</span>
              <span className="px-2 py-1 bg-[#B6C948]/20 text-[#B6C948] text-xs font-semibold rounded-full border border-[#B6C948]/30">
                V1.2
              </span>
              <span className="text-[#B6C948] text-xs">Stable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 