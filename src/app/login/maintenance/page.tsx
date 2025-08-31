'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginMaintenancePage() {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const checkSupabaseStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/check-supabase-status');
      const data = await response.json();
      
      if (data.status === 'healthy') {
        // Supabase is back online, redirect to login
        router.push('/login');
      } else {
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      setRetryCount(prev => prev + 1);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Auto-retry every 30 seconds
    const interval = setInterval(() => {
      if (retryCount < 10) { // Max 10 retries
        checkSupabaseStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [retryCount]);

  return (
    <div className="min-h-screen bg-[#181F17] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#232D1A] rounded-2xl p-8 border border-[#3A4D23] text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">TOP TIER MEN</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] mx-auto"></div>
        </div>

        {/* Maintenance Icon */}
        <div className="w-20 h-20 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">Onderhoud</h2>
        
        {/* Message */}
        <p className="text-[#8BAE5A] mb-6">
          We ervaren momenteel technische problemen met onze authenticatie service. 
          Onze technici werken hard om dit op te lossen.
        </p>

        {/* Status */}
        <div className="bg-[#181F17] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold">Service Unavailable</span>
          </div>
          <p className="text-[#B6C948] text-sm">
            Retry {retryCount}/10 • Auto-retry elke 30 seconden
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={checkSupabaseStatus}
            disabled={isChecking}
            className="w-full px-4 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
                Controleren...
              </div>
            ) : (
              'Nu Controleren'
            )}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
          >
            Pagina Vernieuwen
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-[#3A4D23]">
          <p className="text-[#B6C948] text-sm mb-2">
            <strong>Wat gebeurt er?</strong>
          </p>
          <ul className="text-[#B6C948] text-xs space-y-1 text-left">
            <li>• Supabase authenticatie service is tijdelijk niet beschikbaar</li>
            <li>• Dit is een externe service issue, niet een probleem met onze code</li>
            <li>• We controleren automatisch elke 30 seconden</li>
            <li>• Je wordt automatisch doorgestuurd zodra het probleem is opgelost</li>
          </ul>
        </div>

        {/* Version */}
        <div className="mt-6 text-[#B6C948] text-xs">
          Platform 2.0.3 • Maintenance Mode
        </div>
      </div>
    </div>
  );
}
