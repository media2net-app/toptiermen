'use client';

import { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('🚨 Error boundary caught error:', error);
      setError(error.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Error boundary caught unhandled rejection:', event.reason);
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
              className="w-full bg-[#B6C948] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#A5B837] transition-colors"
            >
              🔄 Pagina Verversen
            </button>
            
            <button
              onClick={() => {
                // Clear all storage and reload
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-[#3A4D23] text-[#B6C948] px-6 py-3 rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
            >
              🧹 Cache Wissen & Verversen
            </button>
            
            <button
              onClick={() => {
                setHasError(false);
                setError(null);
              }}
              className="w-full bg-transparent border border-[#3A4D23] text-[#B6C948] px-6 py-3 rounded-lg font-semibold hover:bg-[#3A4D23]/20 transition-colors"
            >
              🔙 Probeer Opnieuw
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#3A4D23]">
            <p className="text-[#8BAE5A] text-xs">
              Platform versie: 2.0.3 | Neem contact op als het probleem aanhoudt
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
