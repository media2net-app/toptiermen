'use client';

import { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('🚨 Error boundary caught error:', error);
      
      // Don't show error boundary for hydration errors
      if (error.message?.includes('hydrating') || error.message?.includes('hydration')) {
        console.log('Hydration error detected, ignoring...');
        return;
      }
      
      setError(error.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Error boundary caught unhandled rejection:', event.reason);
      
      // Don't show error boundary for hydration errors
      if (event.reason?.message?.includes('hydrating') || event.reason?.message?.includes('hydration')) {
        console.log('Hydration error detected, ignoring...');
        return;
      }
      
      setError(new Error(event.reason?.message || 'Unhandled promise rejection'));
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Don't render error boundary during hydration
  if (!isClient) {
    return <>{children}</>;
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Er is een fout opgetreden</h1>
          <p className="text-gray-400 mb-6">
            Er is iets misgegaan bij het laden van de pagina. Probeer de pagina te verversen.
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm font-mono break-all">
                {error.message || 'Onbekende fout'}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] font-semibold rounded-lg hover:from-[#B6C948] hover:to-[#FFD700] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Pagina Verversen
            </button>
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // Clear all caches
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name));
                    });
                  }
                  // Clear storage
                  localStorage.clear();
                  sessionStorage.clear();
                  // Reload
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-3 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cache Wissen & Verversen
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-3 bg-[#2D3748] text-gray-300 font-semibold rounded-lg hover:bg-[#4A5568] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Probeer Opnieuw
            </button>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            Platform versie: 2.0.3 | Neem contact op als het probleem aanhoudt
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
