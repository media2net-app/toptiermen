'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleGoHome = () => {
    window.location.href = '/';
  };
  useEffect(() => {
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#181F17] flex items-center justify-center p-4">
      <div className="bg-[#232D1A] p-8 rounded-lg border border-[#3A4D23] max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-4">Er is iets misgegaan</h1>
        <p className="text-[#8BAE5A] mb-6">
          Er is een onverwachte fout opgetreden. Probeer de pagina te verversen.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-[#B6C948] text-[#181F17] font-semibold rounded-lg hover:bg-[#8BAE5A] transition-colors"
          >
            Probeer opnieuw
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors"
          >
            Ga naar home
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-[#B6C948] cursor-pointer mb-2">
              Technische details (alleen voor ontwikkelaars)
            </summary>
            <div className="bg-[#181F17] p-3 rounded text-xs text-[#8BAE5A] overflow-auto">
              <p><strong>Error:</strong> {error.message}</p>
              {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
              <p><strong>Stack:</strong></p>
              <pre className="whitespace-pre-wrap">{error.stack}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
