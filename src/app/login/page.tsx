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

  useEffect(() => { 
    setMounted(true); 
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    if (!mounted || loading) return;
    
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
      
      // Update debug info for redirect
      setDebugInfo(prev => ({
        ...prev,
        redirectAttempts: prev.redirectAttempts + 1,
        timestamp: new Date().toISOString()
      }));

      // Try router.replace first, fallback to window.location
      try {
        router.replace(targetPath);
        // Add a fallback redirect in case router.replace doesn't work
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            console.log('🔍 Router redirect failed, using window.location fallback');
            setDebugInfo(prev => ({ ...prev, lastError: 'Router redirect failed, using fallback' }));
            window.location.href = targetPath;
          }
        }, 2000);
      } catch (redirectError) {
        console.error('🔍 Router redirect error:', redirectError);
        setDebugInfo(prev => ({ ...prev, lastError: `Redirect error: ${redirectError}` }));
        // Fallback to window.location
        window.location.href = targetPath;
      }
    }
  }, [mounted, loading, user, router]);

  // Timeout mechanism to prevent getting stuck
  useEffect(() => {
    if (redirecting) {
      const timeout = setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.log('🔍 Redirect timeout, forcing reload');
          setDebugInfo(prev => ({ ...prev, lastError: 'Redirect timeout - forcing reload' }));
          window.location.reload();
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [redirecting]);

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    browser: '',
    userAgent: '',
    isChrome: false,
    isEdge: false,
    isFirefox: false,
    isIncognito: false,
    localStorage: false,
    sessionStorage: false,
    cookies: '',
    cacheStatus: '',
    loginAttempts: 0,
    redirectAttempts: 0,
    lastError: '',
    timestamp: new Date().toISOString()
  });

  // Update debug info
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    const isEdge = /Edge/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    
    // Check if incognito/private mode
    let isIncognito = false;
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      isIncognito = false;
    } catch (e) {
      isIncognito = true;
    }

    setDebugInfo({
      browser: isChrome ? 'Chrome' : isEdge ? 'Edge' : isFirefox ? 'Firefox' : 'Unknown',
      userAgent: userAgent,
      isChrome,
      isEdge,
      isFirefox,
      isIncognito,
      localStorage: !isIncognito,
      sessionStorage: !isIncognito,
      cookies: document.cookie || 'No cookies',
      cacheStatus: 'Checking...',
      loginAttempts: 0,
      redirectAttempts: 0,
      lastError: '',
      timestamp: new Date().toISOString()
    });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log('🔍 Login attempt started');
    
    // Update debug info
    setDebugInfo(prev => ({
      ...prev,
      loginAttempts: prev.loginAttempts + 1,
      timestamp: new Date().toISOString()
    }));
    
    if (!email || !password) {
      setError("Vul alle velden in");
      setDebugInfo(prev => ({ ...prev, lastError: "Empty fields" }));
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      console.log('🔍 Calling signIn...');
      const result = await signIn(email, password);

      if (!result.success) {
        console.error('Sign in error:', result.error);
        setError(result.error || "Ongeldige inloggegevens");
        setDebugInfo(prev => ({ ...prev, lastError: result.error || "Sign in failed" }));
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
      
      {/* Debug Panel */}
      <div className="fixed top-4 left-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg border border-red-500 max-h-96 overflow-y-auto">
        <h3 className="text-red-400 font-bold mb-2">🔍 DEBUG PANEL - Login Page</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div><strong>Browser:</strong> {debugInfo.browser}</div>
          <div><strong>Incognito:</strong> {debugInfo.isIncognito ? 'Yes' : 'No'}</div>
          <div><strong>Chrome:</strong> {debugInfo.isChrome ? 'Yes' : 'No'}</div>
          <div><strong>Edge:</strong> {debugInfo.isEdge ? 'Yes' : 'No'}</div>
          <div><strong>Firefox:</strong> {debugInfo.isFirefox ? 'Yes' : 'No'}</div>
          <div><strong>localStorage:</strong> {debugInfo.localStorage ? 'Available' : 'Blocked'}</div>
          <div><strong>sessionStorage:</strong> {debugInfo.sessionStorage ? 'Available' : 'Blocked'}</div>
          <div><strong>Login Attempts:</strong> {debugInfo.loginAttempts}</div>
          <div><strong>Redirect Attempts:</strong> {debugInfo.redirectAttempts}</div>
          <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
          <div><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'None'}</div>
          <div><strong>Mounted:</strong> {mounted ? 'Yes' : 'No'}</div>
          <div><strong>Redirecting:</strong> {redirecting ? 'Yes' : 'No'}</div>
          <div><strong>Last Error:</strong> {debugInfo.lastError || 'None'}</div>
          <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
        </div>
        <div className="mt-2">
          <strong>User Agent:</strong> <span className="text-xs break-all">{debugInfo.userAgent}</span>
        </div>
        <div className="mt-2">
          <strong>Cookies:</strong> <span className="text-xs break-all">{debugInfo.cookies}</span>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs"
        >
          🔄 Reload Page
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('Cache cleared manually');
          }} 
          className="mt-2 ml-2 bg-blue-600 text-white px-3 py-1 rounded text-xs"
        >
          🗑️ Clear Cache
        </button>
      </div>
      
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight mb-2 text-center">
          <span className="text-white">TOP TIER </span>
          <span className="text-[#8BAE5A]">MEN</span>
        </h1>
        <p className="text-[#B6C948] text-center mb-6 sm:mb-8 text-base sm:text-lg font-figtree">Log in op je dashboard</p>
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
            <a href="/register" className="text-[#8BAE5A] hover:text-white transition-colors font-semibold">
              Registreer hier
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 