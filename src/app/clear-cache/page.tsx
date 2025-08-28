'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCachePage() {
  const [status, setStatus] = useState('Clearing cache...');
  const router = useRouter();

  useEffect(() => {
    const clearEverything = async () => {
      try {
        // Clear localStorage (preserve auth)
        const authToken = localStorage.getItem('toptiermen-v2-auth');
        const rememberMe = localStorage.getItem('toptiermen-remember-me');
        const supabaseAuth = localStorage.getItem('sb-toptiermen-auth-token');
        
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => reg.unregister()));
        }
        
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Restore auth
        if (authToken) localStorage.setItem('toptiermen-v2-auth', authToken);
        if (rememberMe) localStorage.setItem('toptiermen-remember-me', rememberMe);
        if (supabaseAuth) localStorage.setItem('sb-toptiermen-auth-token', supabaseAuth);
        
        setStatus('Cache cleared! Redirecting...');
        
        // Force hard reload
        setTimeout(() => {
          window.location.href = '/login?cache=cleared&t=' + Date.now();
        }, 1000);
        
      } catch (error) {
        console.error('Clear cache error:', error);
        setStatus('Error clearing cache. Try manually.');
      }
    };
    
    clearEverything();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black flex items-center justify-center">
      <div className="bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-green-400 mb-2">Cache Clearing</h1>
        <p className="text-green-300">{status}</p>
      </div>
    </div>
  );
}
